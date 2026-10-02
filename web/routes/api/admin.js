const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const SUPABASE_URL = process.env.INTERNAL_SUPABASE_URL || process.env.SUPABASE_URL || 'http://vibe-supabase-kong:8000';
// Yetkilendirme tamamen veritabanındaki kullanıcı rolü (auth.users raw_app_meta_data->role) ile yapılır

// PostgREST ile tam uyumlu dinamik Service Role anahtarı üretici
function getServiceRoleKey() {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const p = Buffer.from(JSON.stringify({ role: 'service_role', iss: 'supabase', iat: 1700000000, exp: 2100000000 })).toString('base64url');
    const s = crypto.createHmac('sha256', secret).update(h + '.' + p).digest('base64url');
    return h + '.' + p + '.' + s;
  }
  return process.env.SERVICE_ROLE_KEY;
}

// PostgREST Client Helper (Service Role Yetkisiyle)
async function supabaseRequest(path, options = {}) {
  const url = SUPABASE_URL.replace(/\/app$/, '') + '/rest/v1' + path;
  const serviceKey = getServiceRoleKey();
  const headers = {
    'Content-Type': 'application/json',
    'apikey': serviceKey,
    'Authorization': 'Bearer ' + serviceKey,
    'Prefer': 'return=representation',
    ...options.headers
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Supabase error: ${res.status} ${err}`);
  }
  return res.json();
}

// Admin Yetki Doğrulama Middleware (Saf Veritabanı Rolü / RBAC)
async function adminGuard(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/vibe_token=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Oturum açmanız gerekiyor' });
  }

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    const appMeta = payload.app_metadata || {};
    const userRole = appMeta.role || payload.role;
    const isSuperAdmin = payload.is_super_admin === true;

    // 1) Token claims içinde rol 'admin' mi?
    if (userRole === 'admin' || userRole === 'super_admin' || isSuperAdmin) {
      req.adminUser = { id: payload.sub, role: userRole };
      return next();
    }

    // 2) Token henüz yenilenmediyse, veritabanından doğrudan kullanıcının güncel rolünü sorgula
    if (payload.sub) {
      try {
        const dbRole = await supabaseRequest('/rpc/get_user_role', {
          method: 'POST',
          body: JSON.stringify({ uid: payload.sub })
        });
        if (dbRole === 'admin' || dbRole === 'super_admin') {
          req.adminUser = { id: payload.sub, role: dbRole };
          return next();
        }
      } catch (dbErr) {
        console.warn('[AdminGuard] DB rol sorgulama hatası:', dbErr.message);
      }
    }

    return res.status(403).json({ 
      success: false, 
      error: 'Erişim reddedildi. Bu alana yalnızca veritabanında yönetici rolüne (admin) sahip kullanıcılar erişebilir.' 
    });
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Geçersiz oturum anahtarı' });
  }
}

router.use(adminGuard);

// 0. Hafif Yetki Doğrulama Endpointi (Sıfır e-posta sızıntısı)
router.get('/check', (req, res) => {
  res.json({ success: true, isAdmin: true });
});



// -------------------------------------------------------------
// 1. Özet İstatistikler
// -------------------------------------------------------------
router.get('/stats', async (req, res) => {
  try {
    const [categories, apps, favorites, users] = await Promise.all([
      supabaseRequest('/categories?select=id'),
      supabaseRequest('/apps?select=id,status'),
      supabaseRequest('/user_favorites?select=id'),
      supabaseRequest('/rpc/get_admin_users', { method: 'GET' }).catch(() => [])
    ]);

    res.json({
      success: true,
      stats: {
        totalCategories: Array.isArray(categories) ? categories.length : 0,
        totalApps: Array.isArray(apps) ? apps.length : 0,
        activeApps: Array.isArray(apps) ? apps.filter(a => a.status === 'active').length : 0,
        totalFavorites: Array.isArray(favorites) ? favorites.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0
      }
    });
  } catch (err) {
    console.error('[AdminAPI] Stats error:', err.message);
    res.status(500).json({ success: false, error: 'İstatistikler alınamadı: ' + err.message });
  }
});

// -------------------------------------------------------------
// 2. Kullanıcılar Listesi
// -------------------------------------------------------------
router.get('/users', async (req, res) => {
  try {
    const users = await supabaseRequest('/rpc/get_admin_users', { method: 'GET' });
    res.json({ success: true, users: Array.isArray(users) ? users : [] });
  } catch (err) {
    console.error('[AdminAPI] Users error:', err.message);
    res.status(500).json({ success: false, error: 'Kullanıcılar alınamadı' });
  }
});

// -------------------------------------------------------------
// 2b. Kullanici Rol Yonetimi ve Askiya Alma
// -------------------------------------------------------------
router.post('/users/:id/role', async (req, res) => {
  const targetUserId = req.params.id;
  const { role } = req.body;
  const callerId = req.adminUser && req.adminUser.id;

  if (!callerId) {
    return res.status(401).json({ success: false, error: 'Oturum bilgisi eksik' });
  }
  if (!role || !['admin', 'authenticated'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Rol yalnızca admin veya authenticated olabilir' });
  }

  try {
    const result = await supabaseRequest('/rpc/admin_set_user_role', {
      method: 'POST',
      body: JSON.stringify({ target_uid: targetUserId, new_role: role, caller_uid: callerId })
    });
    res.json({ success: true, message: result.role === 'admin' ? 'Kullanıcı yönetici yapıldı' : 'Yönetici yetkisi kaldırıldı', role: result.role });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message.includes('Kendi rolunuzu') ? 'Kendi rolünüzü değiştiremezsiniz' : (err.message.includes('Son yoneticinin') ? 'Son yöneticinin yetkisi kaldırılamaz' : 'Rol güncellenemedi: ' + err.message) });
  }
});

router.post('/users/:id/ban', async (req, res) => {
  const targetUserId = req.params.id;
  const { banned } = req.body;
  const callerId = req.adminUser && req.adminUser.id;

  if (!callerId) {
    return res.status(401).json({ success: false, error: 'Oturum bilgisi eksik' });
  }
  if (typeof banned !== 'boolean') {
    return res.status(400).json({ success: false, error: 'banned boolean olmalıdır' });
  }

  try {
    const result = await supabaseRequest('/rpc/admin_set_user_ban', {
      method: 'POST',
      body: JSON.stringify({ target_uid: targetUserId, banned: banned, caller_uid: callerId })
    });
    res.json({ success: true, message: banned ? 'Kullanıcı askıya alındı' : 'Askı kaldırıldı', banned: result.banned });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message.includes('Kendi hesabinizi') ? 'Kendi hesabınızı askıya alamazsınız' : (err.message.includes('Son yonetici') ? 'Son yönetici askıya alınamaz' : 'İşlem başarısız: ' + err.message) });
  }
});

// -------------------------------------------------------------
// 3. Kategoriler CRUD
// -------------------------------------------------------------
router.get('/categories', async (req, res) => {
  try {
    const categories = await supabaseRequest('/categories?select=*&order=sort_order.asc,created_at.asc');
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/categories', async (req, res) => {
  const { id, title, icon, color, sort_order } = req.body;
  if (!id || !title) {
    return res.status(400).json({ success: false, error: 'Kategori ID ve Başlık zorunludur' });
  }

  try {
    const created = await supabaseRequest('/categories', {
      method: 'POST',
      body: JSON.stringify({
        id: String(id).trim().toLowerCase(),
        title: String(title).trim(),
        icon: icon || '📁',
        color: color || 'emerald',
        sort_order: Number(sort_order) || 0
      })
    });
    res.json({ success: true, category: created[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Kategori eklenemedi: ' + err.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  const catId = req.params.id;
  const { title, icon, color, sort_order } = req.body;

  try {
    const updated = await supabaseRequest(`/categories?id=eq.${encodeURIComponent(catId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: title !== undefined ? String(title).trim() : undefined,
        icon: icon !== undefined ? String(icon).trim() : undefined,
        color: color !== undefined ? String(color).trim() : undefined,
        sort_order: sort_order !== undefined ? Number(sort_order) : undefined
      })
    });
    res.json({ success: true, category: updated[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Kategori güncellenemedi: ' + err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  const catId = req.params.id;
  try {
    await supabaseRequest(`/categories?id=eq.${encodeURIComponent(catId)}`, {
      method: 'DELETE'
    });
    res.json({ success: true, message: 'Kategori silindi' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Kategori silinemedi: ' + err.message });
  }
});


// -------------------------------------------------------------
// 3b. Kategori Sıralaması (Sürükle/Bırak)
// -------------------------------------------------------------
router.post('/categories/reorder', async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order) || order.length === 0) {
    return res.status(400).json({ success: false, error: 'Geçersiz sıralama listesi' });
  }
  try {
    await Promise.all(order.map((catId, idx) =>
      supabaseRequest('/categories?id=eq.' + encodeURIComponent(String(catId)), {
        method: 'PATCH',
        body: JSON.stringify({ sort_order: idx })
      })
    ));
    res.json({ success: true, message: 'Kategori sıralaması güncellendi' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Sıralama kaydedilemedi: ' + err.message });
  }
});

// -------------------------------------------------------------
// 4. Uygulamalar CRUD
// -------------------------------------------------------------
router.get('/apps', async (req, res) => {
  try {
    const apps = await supabaseRequest('/apps?select=*&order=sort_order.asc,created_at.asc');
    res.json({ success: true, apps });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/apps', async (req, res) => {
  const { id, category_id, name, desc, icon, url, action, status, sort_order } = req.body;
  if (!id || !name || !url) {
    return res.status(400).json({ success: false, error: 'Uygulama ID, İsim ve URL zorunludur' });
  }

  try {
    const created = await supabaseRequest('/apps', {
      method: 'POST',
      body: JSON.stringify({
        id: String(id).trim().toLowerCase(),
        category_id: category_id || null,
        name: String(name).trim(),
        desc: String(desc || '').trim(),
        icon: icon || '⚡',
        url: String(url).trim(),
        action: action || 'Uygulamayı Aç',
        status: status || 'active',
        sort_order: Number(sort_order) || 0,
        updated_at: new Date().toISOString()
      })
    });
    res.json({ success: true, app: created[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Uygulama eklenemedi: ' + err.message });
  }
});

router.put('/apps/:id', async (req, res) => {
  const appId = req.params.id;
  const { category_id, name, desc, icon, url, action, status, sort_order } = req.body;

  try {
    const updated = await supabaseRequest(`/apps?id=eq.${encodeURIComponent(appId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        category_id: category_id !== undefined ? (category_id || null) : undefined,
        name: name !== undefined ? String(name).trim() : undefined,
        desc: desc !== undefined ? String(desc).trim() : undefined,
        icon: icon !== undefined ? String(icon).trim() : undefined,
        url: url !== undefined ? String(url).trim() : undefined,
        action: action !== undefined ? String(action).trim() : undefined,
        status: status !== undefined ? String(status).trim() : undefined,
        sort_order: sort_order !== undefined ? Number(sort_order) : undefined,
        updated_at: new Date().toISOString()
      })
    });
    res.json({ success: true, app: updated[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Uygulama güncellenemedi: ' + err.message });
  }
});

router.delete('/apps/:id', async (req, res) => {
  const appId = req.params.id;
  try {
    await supabaseRequest(`/apps?id=eq.${encodeURIComponent(appId)}`, {
      method: 'DELETE'
    });
    res.json({ success: true, message: 'Uygulama silindi' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Uygulama silinemedi: ' + err.message });
  }
});

module.exports = router;
