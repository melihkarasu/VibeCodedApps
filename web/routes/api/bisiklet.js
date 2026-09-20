const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 22. CityBikes API (Küresel Paylaşımlı Bisiklet Ağı & İstasyonlar)
// =============================================================
let bikeNetworksCache = { data: null, timestamp: 0 };
const bikeStationsCache = new Map();

router.get('/bisiklet/networks', async (req, res) => {
  if (bikeNetworksCache.data && Date.now() - bikeNetworksCache.timestamp < 12 * 60 * 60 * 1000) {
    return res.json(bikeNetworksCache.data);
  }

  try {
    const response = await fetch('http://api.citybik.es/v2/networks?fields=id,name,city,country,location', {
      headers: { 'User-Agent': 'VibeCodedApps/1.0' },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) throw new Error('CityBikes ağ listesi alınamadı');
    const data = await response.json();

    const formatted = (data.networks || []).map(n => ({
      id: n.id,
      name: n.name,
      city: n.location?.city || n.name,
      country: n.location?.country || '',
      latitude: n.location?.latitude || 0,
      longitude: n.location?.longitude || 0
    })).filter(n => n.id && n.latitude !== 0);

    const output = { success: true, count: formatted.length, networks: formatted };
    bikeNetworksCache = { data: output, timestamp: Date.now() };
    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Bisiklet ağlarına erişilemedi: ' + err.message });
  }
});

router.get('/bisiklet/network/:id', async (req, res) => {
  const netId = (req.params.id || '').trim().toLowerCase().slice(0, 60);
  const cleanId = netId.replace(/[^a-z0-9\-]/g, '');

  if (!cleanId) return res.status(400).json({ success: false, error: 'Geçersiz ağ kimliği' });

  if (bikeStationsCache.has(cleanId)) {
    const c = bikeStationsCache.get(cleanId);
    if (Date.now() - c.timestamp < 60 * 1000) return res.json(c.data);
  }

  try {
    const response = await fetch(`http://api.citybik.es/v2/networks/${encodeURIComponent(cleanId)}`, {
      headers: { 'User-Agent': 'VibeCodedApps/1.0' },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) throw new Error('Ağ istasyon verileri alınamadı');
    const data = await response.json();
    const net = data.network || {};

    const stations = (net.stations || []).map(s => ({
      id: s.id,
      name: s.name || 'İstasyon',
      emptySlots: s.empty_slots ?? null,
      freeBikes: s.free_bikes ?? 0,
      latitude: s.latitude,
      longitude: s.longitude,
      timestamp: s.timestamp
    }));

    const output = {
      success: true,
      network: {
        id: net.id,
        name: net.name,
        city: net.location?.city || '',
        country: net.location?.country || '',
        latitude: net.location?.latitude || 0,
        longitude: net.location?.longitude || 0
      },
      stationCount: stations.length,
      stations
    };

    bikeStationsCache.set(cleanId, { data: output, timestamp: Date.now() });
    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'İstasyon verisi çekilemedi: ' + err.message });
  }
});

module.exports = router;
