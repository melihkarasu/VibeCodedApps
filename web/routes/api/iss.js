const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');

// =============================================================
// 12. Where is ISS (Canlı ISS Takip Servisi)
// =============================================================
const issCache = { data: null, timestamp: 0 };

router.get('/iss/now', async (req, res) => {
  if (issCache.data && Date.now() - issCache.timestamp < 3000) {
    return res.json(issCache.data);
  }

  try {
    const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      headers: { 'User-Agent': 'VibeCodedApps/1.0' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) throw new Error('ISS verisi alınamadı');
    const data = await response.json();

    const output = {
      success: true,
      name: 'International Space Station (ISS)',
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: Math.round(data.altitude * 10) / 10, // km
      velocity: Math.round(data.velocity), // km/h
      visibility: data.visibility,
      footprint: Math.round(data.footprint),
      timestamp: data.timestamp
    };

    issCache.data = output;
    issCache.timestamp = Date.now();
    res.json(output);
  } catch(err) {
    // Fallback: Open Notify
    try {
      const fbRes = await fetch('http://api.open-notify.org/iss-now.json', { signal: AbortSignal.timeout(4000) });
      const fbData = await fbRes.json();
      const output = {
        success: true,
        name: 'International Space Station (ISS)',
        latitude: parseFloat(fbData.iss_position.latitude),
        longitude: parseFloat(fbData.iss_position.longitude),
        altitude: 408.0,
        velocity: 27600,
        visibility: 'daylight',
        footprint: 4500,
        timestamp: fbData.timestamp
      };
      res.json(output);
    } catch(e) {
      res.status(500).json({ success: false, error: 'ISS konum servisine ulaşılamadı' });
    }
  }
});

module.exports = router;
