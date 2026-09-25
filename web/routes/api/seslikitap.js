const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 28. LibriVox Açık Sesli Kitap Kütüphanesi
// =============================================================
const librivoxCache = new Map();

// --- Dinleme İlerlemesi: Supabase PostgREST (user_audio_progress tablosu) ---
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
  const text = await res.text().catch(() => '');
  if (!text || !text.trim()) return null;
  try { return JSON.parse(text); } catch (e) { return text; }
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

router.get('/librivox/audiobooks', async (req, res) => {
  const query = (req.query.q || 'classic').trim().slice(0, 50);
  const cacheKey = 'librivox_' + query.toLowerCase().replace(/[^a-z0-9]/g, '_');
  try {
    const output = await getCachedJson(cacheKey, async () => {
      const url = `https://librivox.org/api/feed/audiobooks/?format=json&limit=25&${encodeURIComponent(query).includes('author') ? 'author=' : 'title='}^${encodeURIComponent(query)}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('LibriVox API yanıt vermedi');
      const data = await response.json();
      const rawBooks = data.books || [];
      const books = rawBooks.map(b => ({
        id: b.id,
        title: b.title || 'Başlıksız Eser',
        author: (b.authors || []).map(a => `${a.first_name || ''} ${a.last_name || ''}`.trim()).join(', ') || 'Bilinmiyor',
        description: (b.description || 'Açıklama bulunmuyor.').replace(/<[^>]+>/g, '').slice(0, 300),
        duration: b.totaltime || 'Belirtilmemiş',
        language: b.language || 'English',
        urlZip: b.url_zip_file || '',
        urlLibrivox: b.url_librivox || ''
      }));
      return { success: true, count: books.length, books, source: 'LibriVox (Günde 1 Kez Güncellenen Kalıcı JSON Önbellek)' };
    });
    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Sesli kitaplar yüklenemedi: ' + err.message });
  }
});

// GET /api/seslikitap/progress?bookId=... - Kullanıcının dinleme ilerlemesini getir
router.get('/seslikitap/progress', async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.json({ success: true, progress: null, authenticated: false });
  }

  const bookId = (req.query.bookId || '').trim().slice(0, 120);
  if (!bookId) {
    return res.status(400).json({ success: false, error: 'bookId gerekli' });
  }

  try {
    const rows = await supabaseRequest(
      `/user_audio_progress?user_id=eq.${userId}&book_id=eq.${encodeURIComponent(bookId)}&select=track_index,position_sec,book_title,authors,updated_at&limit=1`
    );
    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    res.json({
      success: true,
      authenticated: true,
      progress: row ? {
        trackIndex: row.track_index || 0,
        positionSec: row.position_sec || 0,
        bookTitle: row.book_title || '',
        authors: row.authors || '',
        updatedAt: row.updated_at || null
      } : null
    });
  } catch(err) {
    res.status(500).json({ success: false, error: 'İlerleme okunamadı: ' + err.message });
  }
});

// POST /api/seslikitap/progress - Dinleme ilerlemesini kaydet/güncelle (upsert)
router.post('/seslikitap/progress', async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.json({ success: true, saved: false, authenticated: false });
  }

  const bookId = String(req.body.bookId || '').trim().slice(0, 120);
  const trackIndex = parseInt(req.body.trackIndex, 10);
  const positionSec = Math.floor(parseFloat(req.body.positionSec) || 0);

  if (!bookId || isNaN(trackIndex) || trackIndex < 0) {
    return res.status(400).json({ success: false, error: 'Geçersiz ilerleme verisi' });
  }

  try {
    await supabaseRequest('/user_audio_progress', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        book_id: bookId,
        track_index: trackIndex,
        position_sec: Math.min(positionSec, 86400),
        book_title: String(req.body.bookTitle || '').slice(0, 200),
        authors: String(req.body.authors || '').slice(0, 200),
        updated_at: new Date().toISOString()
      }),
      headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' }
    });
    res.json({ success: true, saved: true, authenticated: true });
  } catch(err) {
    res.status(500).json({ success: false, error: 'İlerleme kaydedilemedi: ' + err.message });
  }
});

module.exports = router;
