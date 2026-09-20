const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');

// =============================================================
// 15. RAWG / Oyun Kütüphanesi & Keşif
// =============================================================
const gameLibCache = new Map();

router.get('/oyun-lib/search', async (req, res) => {
  const genre = (req.query.genre || '').trim().toLowerCase().slice(0, 30);
  const q = (req.query.q || '').trim().toLowerCase().slice(0, 50);
  const cacheKey = `${genre}_${q}`;

  if (gameLibCache.has(cacheKey)) {
    const c = gameLibCache.get(cacheKey);
    if (Date.now() - c.timestamp < 60 * 60 * 1000) return res.json(c.data);
  }

  try {
    let url = 'https://www.freetogame.com/api/games';
    if (genre && genre !== 'all') {
      url += `?category=${encodeURIComponent(genre)}`;
    }

    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Oyun servisi yanıt vermedi');
    let games = await response.json();

    if (q) {
      games = games.filter(g => g.title.toLowerCase().includes(q) || (g.short_description || '').toLowerCase().includes(q));
    }

    const output = {
      success: true,
      count: games.length,
      games: games.slice(0, 48).map(g => ({
        id: g.id,
        title: g.title,
        thumbnail: g.thumbnail,
        short_description: g.short_description,
        genre: g.genre,
        platform: g.platform,
        publisher: g.publisher,
        developer: g.developer,
        release_date: g.release_date,
        game_url: g.game_url
      }))
    };

    gameLibCache.set(cacheKey, { data: output, timestamp: Date.now() });
    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Oyun kütüphanesine erişilemedi' });
  }
});

module.exports = router;
