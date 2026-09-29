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
  const cacheKey = 'librivoxv2_' + query.toLowerCase().replace(/[^a-z0-9]/g, '_');
  try {
    const output = await getCachedJson(cacheKey, async () => {
      // archive.org librivoxaudio koleksiyonu (librivox.org/api sunucudan zaman aşımı veriyordu)
      let searchQuery = 'collection:librivoxaudio AND mediatype:audio';
      if (query && query !== 'classic') {
        searchQuery += ' AND (title:(' + query + ') OR creator:(' + query + '))';
      } else {
        searchQuery += ' AND (title:(sherlock) OR title:(dracula) OR title:(frankenstein) OR title:(alice) OR title:(monte cristo))';
      }

      const url = 'https://archive.org/advancedsearch.php?q=' + encodeURIComponent(searchQuery) +
        '&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=creator&fl%5B%5D=description&fl%5B%5D=downloads&fl%5B%5D=language' +
        '&rows=24&output=json&sort%5B%5D=downloads+desc';
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Arşiv servisi yanıt vermedi (HTTP ' + response.status + ')');
      const data = await response.json();
      const docs = (data.response && data.response.docs) || [];
      const strip = (s) => String(s || '').replace(/<[^>]+>/g, '').trim();
      const books = docs.map(d => {
        const authors = (Array.isArray(d.creator) ? d.creator.join(', ') : (d.creator || 'Bilinmiyor')).toString() || 'Bilinmiyor';
        const detailsUrl = 'https://archive.org/details/' + d.identifier;
        return {
          id: d.identifier,
          title: strip(d.title) || 'Başlıksız Eser',
          author: authors,
          authors: authors,
          description: strip(d.description).slice(0, 300) || 'Açıklama bulunmuyor.',
          language: Array.isArray(d.language) ? d.language[0] : (d.language || 'English'),
          downloads: Number(d.downloads) || 0,
          urlZip: '',
          urlLibrivox: detailsUrl,
          listenUrl: detailsUrl,
          detailsUrl: detailsUrl
        };
      });
      return { success: true, count: books.length, books, source: 'archive.org LibriVox koleksiyonu (kalıcı önbellek)' };
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

// GET /api/seslikitap/library - Kullanıcının tüm dinleme kayıtları (Kitaplığım)
router.get('/seslikitap/library', async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.json({ success: true, authenticated: false, library: [] });
  }

  try {
    const rows = await supabaseRequest(
      `/user_audio_progress?user_id=eq.${userId}&select=book_id,track_index,position_sec,book_title,authors,updated_at&order=updated_at.desc&limit=200`
    );
    const library = (Array.isArray(rows) ? rows : []).map(r => ({
      bookId: r.book_id,
      trackIndex: r.track_index || 0,
      positionSec: r.position_sec || 0,
      bookTitle: r.book_title || '',
      authors: r.authors || '',
      updatedAt: r.updated_at || null
    }));
    res.json({ success: true, authenticated: true, library });
  } catch(err) {
    res.status(500).json({ success: false, error: 'Kitaplık okunamadı: ' + err.message });
  }
});

// DELETE /api/seslikitap/progress?bookId=... - Tek kitabın ilerleme kaydını sil
router.delete('/seslikitap/progress', async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Oturum açmanız gerekiyor' });
  }

  const bookId = (req.query.bookId || '').trim().slice(0, 120);
  if (!bookId) {
    return res.status(400).json({ success: false, error: 'bookId gerekli' });
  }

  try {
    await supabaseRequest(
      `/user_audio_progress?user_id=eq.${userId}&book_id=eq.${encodeURIComponent(bookId)}`,
      { method: 'DELETE' }
    );
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ success: false, error: 'Kayıt silinemedi: ' + err.message });
  }
});

module.exports = router;
