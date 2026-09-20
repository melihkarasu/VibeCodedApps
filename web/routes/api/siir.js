const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 32. PoetryDB (Dünya Şiir Antolojisi Proxy)
// =============================================================
const poetryCache = new Map();

router.get('/poetry/random', async (req, res) => {
  try {
    const response = await fetch('https://poetrydb.org/random/1', {
      headers: { 'User-Agent': 'VibeCodedApps/1.0' },
      signal: AbortSignal.timeout(6000)
    });
    if (!response.ok) throw new Error('PoetryDB yanıt vermedi');
    const data = await response.json();
    const poem = data[0] || {};
    res.json({
      success: true,
      title: poem.title || 'İsimsiz Şiir',
      author: poem.author || 'Anonim',
      lines: poem.lines || [],
      linecount: poem.linecount || 0
    });
  } catch(err) {
    res.status(500).json({ success: false, error: 'Şiir yüklenemedi: ' + err.message });
  }
});

router.get('/poetry/search', async (req, res) => {
  const author = (req.query.author || 'Shakespeare').trim().slice(0, 40);
  const cleanAuthor = author.replace(/[^a-zA-Z\s]/g, '');

  if (!cleanAuthor) return res.status(400).json({ success: false, error: 'Geçerli bir şair adı girin' });

  const cacheKey = `poetry_author_${cleanAuthor.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  try {
    const output = await getCachedJson(cacheKey, async () => {
      const response = await fetch(`https://poetrydb.org/author/${encodeURIComponent(cleanAuthor)}`, {
        headers: { 'User-Agent': 'VibeCodedApps/1.0' },
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) throw new Error('Şair şiirleri bulunamadı');
      const data = await response.json();

      const poems = Array.isArray(data) ? data.slice(0, 15).map(p => ({
        title: p.title,
        author: p.author,
        lines: p.lines || [],
        linecount: p.linecount
      })) : [];

      return { success: true, count: poems.length, poems, source: 'PoetryDB (Günde 1 Kez Güncellenen Kalıcı JSON Önbellek)' };
    });

    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Şiir arşivi sorgulanamadı: ' + err.message });
  }
});

module.exports = router;
