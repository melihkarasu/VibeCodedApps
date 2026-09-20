const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 10. Kuş Sesi Dedektifi & Doğa Arşivi (iNaturalist API Proxy)
// =============================================================
const dogaCache = new Map();

router.get('/doga/sounds', async (req, res) => {
  const query = (req.query.q || '').trim();
  // Temiz girdi doğrulaması
  const cleanQ = query.replace(/[^a-zA-Z0-9\s\-_]/g, '').slice(0, 50);

  const cacheKey = cleanQ.toLowerCase();
  if (dogaCache.has(cacheKey)) {
    const cached = dogaCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 15 * 60 * 1000) {
      return res.json(cached.data);
    }
  }

  try {
    let url = 'https://api.inaturalist.org/v1/observations?taxon_name=Aves&has[]=sounds&quality_grade=research&per_page=12';
    if (cleanQ) {
      url += `&q=${encodeURIComponent(cleanQ)}`;
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'VibeCodedApps/1.0 (dev@vibecodedapps.local)' },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) throw new Error('iNaturalist API yanıt vermedi');
    const data = await response.json();

    const results = [];
    if (data && Array.isArray(data.results)) {
      data.results.forEach(item => {
        const sounds = item.sounds || [];
        const photos = item.photos || [];
        const taxon = item.taxon || {};

        if (sounds.length > 0 && sounds[0].file_url) {
          results.push({
            id: 'ina_' + item.id,
            commonName: taxon.preferred_common_name || item.species_guess || 'Kuş Türü',
            sciName: taxon.name || 'Aves',
            place: item.place_guess || 'Doğal Yaşam Alanı',
            photo: (photos.length > 0 && photos[0].url) 
              ? photos[0].url.replace('square', 'medium') 
              : 'https://images.unsplash.com/photo-1555169062-013468b47731?w=500&auto=format&fit=crop&q=80',
            soundUrl: sounds[0].file_url
          });
        }
      });
    }

    const output = { success: true, results };
    dogaCache.set(cacheKey, { data: output, timestamp: Date.now() });
    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Kuş sesleri arşivi alınamadı' });
  }
});

module.exports = router;
