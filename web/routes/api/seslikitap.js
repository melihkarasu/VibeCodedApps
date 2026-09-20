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

module.exports = router;
