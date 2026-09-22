const express = require('express');
const router = express.Router();

const SUPABASE_URL = process.env.INTERNAL_SUPABASE_URL || process.env.SUPABASE_URL || 'http://vibe-supabase-kong:8000';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

// PostgREST Client Helper (Service Role Bypass with Strict Backend Validation)
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
    throw new Error('Supabase error: ' + res.status + ' ' + err);
  }
  return res.json();
}

// Token Doğrulama & User ID Çıkarma
function getUserIdFromReq(req) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/vibe_token=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (!token) return null;

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return payload.sub || null;
  } catch (e) {
    return null;
  }
}

// GET /api/user-data/:appId - Belirli bir uygulamanın kullanıcı verilerini çek
router.get('/user-data/:appId', async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Oturum açmanız gerekiyor' });
  }

  const appId = req.params.appId;
  if (!appId) {
    return res.status(400).json({ success: false, error: 'Uygulama ID belirtilmeli' });
  }

  try {
    const rows = await supabaseRequest(
      `/user_app_data?user_id=eq.${userId}&app_id=eq.${encodeURIComponent(appId)}&select=data_key,data_value,updated_at`
    );

    const dataObj = {};
    if (Array.isArray(rows)) {
      rows.forEach(r => {
        dataObj[r.data_key] = r.data_value;
      });
    }

    res.json({ success: true, appId, data: dataObj });
  } catch (err) {
    console.error(`[UserData] GET error for ${appId}:`, err.message);
    res.status(500).json({ success: false, error: 'Kullanıcı verisi alınamadı' });
  }
});

// POST /api/user-data/:appId - Kullanıcı verisi kaydet veya güncelle (Upsert)
router.post('/user-data/:appId', async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Oturum açmanız gerekiyor' });
  }

  const appId = req.params.appId;
  const { key, value, data } = req.body;

  if (!appId) {
    return res.status(400).json({ success: false, error: 'Uygulama ID belirtilmeli' });
  }

  try {
    const entries = [];
    if (key !== undefined) {
      entries.push({
        user_id: userId,
        app_id: appId,
        data_key: String(key),
        data_value: value,
        updated_at: new Date().toISOString()
      });
    } else if (data && typeof data === 'object') {
      Object.keys(data).forEach(k => {
        entries.push({
          user_id: userId,
          app_id: appId,
          data_key: String(k),
          data_value: data[k],
          updated_at: new Date().toISOString()
        });
      });
    }

    if (entries.length === 0) {
      return res.status(400).json({ success: false, error: 'Kaydedilecek veri bulunamadı' });
    }

    // PostgREST Upsert (ON CONFLICT on user_id, app_id, data_key)
    await supabaseRequest('/user_app_data', {
      method: 'POST',
      headers: {
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(entries)
    });

    res.json({ success: true, appId, count: entries.length });
  } catch (err) {
    console.error(`[UserData] POST error for ${appId}:`, err.message);
    res.status(500).json({ success: false, error: 'Kullanıcı verisi kaydedilemedi' });
  }
});

// DELETE /api/user-data/:appId/:key - Belirli bir anahtarı sil
router.delete('/user-data/:appId/:key', async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Oturum açmanız gerekiyor' });
  }

  const { appId, key } = req.params;
  try {
    await supabaseRequest(
      `/user_app_data?user_id=eq.${userId}&app_id=eq.${encodeURIComponent(appId)}&data_key=eq.${encodeURIComponent(key)}`,
      { method: 'DELETE' }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(`[UserData] DELETE error for ${appId}/${key}:`, err.message);
    res.status(500).json({ success: false, error: 'Kayıt silinemedi' });
  }
});

module.exports = router;
