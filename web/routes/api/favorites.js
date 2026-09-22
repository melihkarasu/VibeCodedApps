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

// GET /api/favorites - Kullanıcının favorilerini getir
router.get('/favorites', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Yetkilendirme gerekli' });
  }
  const token = authHeader.slice(7);
  try {
    // Token'dan user_id çıkar (JWT parse)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    const userId = payload.sub;
    if (!userId) return res.status(401).json({ success: false, error: 'Geçersiz token' });

    const favorites = await supabaseRequest(
      `/user_favorites?user_id=eq.${userId}&select=app_id,created_at&order=created_at.desc`
    );
    res.json({ success: true, favorites: favorites.map(f => f.app_id) });
  } catch (err) {
    console.error('Favoriler getirme hatası:', err.message);
    res.status(500).json({ success: false, error: 'Favoriler alınamadı' });
  }
});

// POST /api/favorites - Favori ekle/çıkar
router.post('/favorites', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Yetkilendirme gerekli' });
  }
  const token = authHeader.slice(7);
  const { app_id, action } = req.body; // action: 'add' | 'remove'
  if (!app_id || !['add', 'remove'].includes(action)) {
    return res.status(400).json({ success: false, error: 'Geçersiz istek' });
  }
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    const userId = payload.sub;
    if (!userId) return res.status(401).json({ success: false, error: 'Geçersiz token' });

    if (action === 'add') {
      await supabaseRequest('/user_favorites', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, app_id })
      });
    } else {
      await supabaseRequest(
        `/user_favorites?user_id=eq.${userId}&app_id=eq.${app_id}`,
        { method: 'DELETE' }
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Favori güncelleme hatası:', err.message);
    res.status(500).json({ success: false, error: 'Favori güncellenemedi' });
  }
});

module.exports = router;
