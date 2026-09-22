const express = require('express');
const router = express.Router();

const SUPABASE_URL = process.env.APP_URL || 'http://0.0.0.0:8088';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'REDACTED')
  .split(',')
  .map(e => e.trim().toLowerCase());

// PostgREST Client Helper (Service Role Yetkisiyle)
async function supabaseRequest(path, options = {}) {
  const url = SUPABASE_URL.replace(/\/app$/, '') + '/rest/v1' + path;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
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

// Admin Yetki Doğrulama Middleware
function adminGuard(req, res, next) {
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
    const email = (payload.email || '').trim().toLowerCase();
    
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Erişim reddedildi. Bu alana yalnızca sistem yöneticileri erişebilir.' 
      });
    }

    req.adminUser = { id: payload.sub, email };
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Geçersiz oturum anahtarı' });
  }
}

router.use(adminGuard);

// -------------------------------------------------------------
// 1. Özet İstatistikler
// -------------------------------------------------------------
router.get('/stats', async (req, res) => {
  try {
    const [categories, apps, favorites] = await Promise.all([
      supabaseRequest('/categories?select=id'),
      supabaseRequest('/apps?select=id,status'),
      supabaseRequest('/user_favorites?select=id')
    ]);

    // auth.users sorgusu
    const users = await supabaseRequest('/users?select=id', {
      headers: { 'Accept-Profile': 'auth' }
    }).catch(async () => {
      // Eğer auth şeması doğrudan erişilemiyorsa rpc veya fallback
      return [];
    });

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
    // GoTrue / Auth users listesi (Service role ile auth.users ve auth.identities)
    // PostgREST genelde public şemasını açar; auth şemasını güvenle sorgulamak için
    // supabaseRequest veya doğrudan sorgulama
    let users = [];
    try {
      users = await supabaseRequest('/users?select=id,email,created_at,last_sign_in_at,raw_user_meta_data,raw_app_meta_data', {
        headers: { 'Accept-Profile': 'auth' }
      });
    } catch(e) {
      // Fallback: auth.identities üzerinden kullanıcı profilleri
      users = [];
    }

    res.json({ success: true, users: Array.isArray(users) ? users : [] });
  } catch (err) {
    console.error('[AdminAPI] Users error:', err.message);
    res.status(500).json({ success: false, error: 'Kullanıcılar alınamadı' });
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
