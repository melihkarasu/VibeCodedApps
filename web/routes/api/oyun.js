const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 6. Oyun Fırsatları & İndirim Takipçisi API Endpoints
// =============================================================
const dealsCache = new Map();
let freeGamesCache = { data: null, timestamp: 0 };

router.get('/oyun/free', async (req, res) => {
  const now = Date.now();
  if (freeGamesCache.data && (now - freeGamesCache.timestamp < 15 * 60 * 1000)) {
    return res.json(freeGamesCache.data);
  }

  try {
    const response = await fetch('https://www.gamerpower.com/api/giveaways?platform=pc', {
      headers: { 'User-Agent': 'VibeCodedApps/1.0 (dev@vibecodedapps.local)' },
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error('GamerPower API hatası');
    const data = await response.json();
    freeGamesCache = { data: data, timestamp: now };
    res.json(data);
  } catch(err) {
    if (freeGamesCache.data) return res.json(freeGamesCache.data);
    res.status(500).json({ error: 'Ücretsiz oyunlar listesi alınamadı' });
  }
});

router.get('/oyun/deals', async (req, res) => {
  const rawStores = (req.query.stores || '1,25').split(',');
  const allowedStores = ['1', '25', '7', '11'];
  const stores = rawStores.filter(s => allowedStores.includes(s.trim())).join(',') || '1,25';

  const rawTitle = (req.query.title || '').trim();
  const cleanTitle = rawTitle.replace(/[^a-zA-Z0-9\s\-_]/g, '').slice(0, 50);

  const cacheKey = `${stores}_${cleanTitle}`;
  if (dealsCache.has(cacheKey)) {
    const cached = dealsCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 10 * 60 * 1000) {
      return res.json(cached.data);
    }
  }

  try {
    let url = `https://www.cheapshark.com/api/1.0/deals?storeID=${stores}&pageSize=28&sortBy=Deal%20Rating`;
    if (cleanTitle) {
      url += `&title=${encodeURIComponent(cleanTitle)}`;
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'VibeCodedApps/1.0 (dev@vibecodedapps.local)' },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) throw new Error('CheapShark API hatası');
    const data = await response.json();

    dealsCache.set(cacheKey, { data: data, timestamp: Date.now() });
    res.json(data);
  } catch(err) {
    res.status(500).json({ error: 'İndirim fırsatları alınamadı' });
  }
});

module.exports = router;
