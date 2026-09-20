const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 21. Radio Browser API (30.000+ Küresel Canlı Radyo İstasyonu)
// =============================================================
const radioCache = new Map();

router.get('/radio/stations', async (req, res) => {
  const country = (req.query.country || '').trim().toUpperCase().slice(0, 3);
  const tag = (req.query.tag || '').trim().toLowerCase().slice(0, 30);
  const q = (req.query.q || '').trim().toLowerCase().slice(0, 40);

  const cleanCountry = country.replace(/[^A-Z]/g, '');
  const cleanTag = tag.replace(/[^a-z0-9]/g, '');
  const cleanQ = q.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s]/g, '');
  const fileKey = `radio_${cleanCountry || 'all'}_${cleanTag || 'all'}_${cleanQ || 'all'}`;

  try {
    const output = await getCachedJson(fileKey, async () => {
      let url = 'https://de1.api.radio-browser.info/json/stations/search?limit=36&hidebroken=true&order=clickcount&reverse=true';
      if (cleanCountry && cleanCountry !== 'ALL') {
        url += `&countrycode=${encodeURIComponent(cleanCountry)}`;
      }
      if (cleanTag && cleanTag !== 'all') {
        url += `&tag=${encodeURIComponent(cleanTag)}`;
      }
      if (cleanQ) {
        url += `&name=${encodeURIComponent(cleanQ)}`;
      }

      const response = await fetch(url, {
        headers: { 'User-Agent': 'VibeCodedApps-Radio/1.0' },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) throw new Error('Radyo servisi yanıt vermedi');
      const stations = await response.json();

      const formatted = stations.map(s => ({
        id: s.stationuuid || Math.random().toString(36).substring(2),
        name: s.name || 'İsimsiz Radyo',
        url: s.url_resolved || s.url,
        homepage: s.homepage || '',
        favicon: s.favicon || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
        tags: (s.tags || '').split(',').map(t => t.trim()).filter(Boolean).slice(0, 3),
        country: s.country || '',
        countryCode: s.countrycode || '',
        bitrate: s.bitrate || 128,
        votes: s.votes || 0
      })).filter(s => s.url && (s.url.startsWith('http://') || s.url.startsWith('https://')));

      return { success: true, count: formatted.length, stations: formatted, source: 'Radio Browser (Günde 1 Kez Güncellenen Kalıcı JSON Önbellek)' };
    });
    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Radyo istasyonları yüklenemedi: ' + err.message });
  }
});

module.exports = router;
