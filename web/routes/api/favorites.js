const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');

// =============================================================
// 35. Kullanıcı Favori Uygulamaları API (Supabase PostgREST)
// =============================================================
const SUPABASE_URL = process.env.INTERNAL_SUPABASE_URL || process.env.SUPABASE_URL || 'http://vibe-supabase-kong:8000';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

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

// Token Doğrulama & User ID Çıkarma (Bearer Header veya vibe_token Çerezi)
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

// GET /api/favorites - Kullanıcının favorilerini getir
router.get('/favorites', async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Yetkilendirme gerekli' });
  }

  try {
    const favorites = await supabaseRequest(
      `/user_favorites?user_id=eq.${userId}&select=app_id,created_at&order=created_at.desc`
    );
    res.json({ success: true, favorites: Array.isArray(favorites) ? favorites.map(f => f.app_id) : [] });
  } catch (err) {
    console.error('Favoriler getirme hatası:', err.message);
    res.status(500).json({ success: false, error: 'Favoriler alınamadı', details: err.message });
  }
});

// POST /api/favorites - Favori ekle/çıkar
router.post('/favorites', async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Yetkilendirme gerekli' });
  }

  const { app_id, action } = req.body; // action: 'add' | 'remove'
  if (!app_id || !['add', 'remove'].includes(action)) {
    return res.status(400).json({ success: false, error: 'Geçersiz istek' });
  }

  try {
    if (action === 'add') {
      try {
        await supabaseRequest('/user_favorites', {
          method: 'POST',
          headers: {
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({ user_id: userId, app_id })
        });
      } catch (insertErr) {
        // Eğer zaten mevcutsa (409 conflict veya duplicate key), hata fırlatmak yerine başarı dön
        if (!insertErr.message.includes('409') && !insertErr.message.includes('duplicate')) {
          throw insertErr;
        }
      }
    } else {
      await supabaseRequest(
        `/user_favorites?user_id=eq.${userId}&app_id=eq.${encodeURIComponent(app_id)}`,
        { method: 'DELETE' }
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Favori güncelleme hatası:', err.message);
    res.status(500).json({ success: false, error: 'Favori güncellenemedi', details: err.message });
  }
});

module.exports = router;
