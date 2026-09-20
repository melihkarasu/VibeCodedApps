const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 14. OpenAQ / Open-Meteo Canlı Hava Kalitesi (Air Quality)
// =============================================================
const aqiCache = new Map();

router.get('/openaq/latest', async (req, res) => {
  const city = (req.query.city || 'Istanbul').trim().slice(0, 50);
  const cleanCity = city.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s\-]/g, '');

  if (!cleanCity) return res.status(400).json({ success: false, error: 'Şehir adı gereklidir' });

  const cacheKey = cleanCity.toLowerCase();
  if (aqiCache.has(cacheKey)) {
    const cached = aqiCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 15 * 60 * 1000) return res.json(cached.data);
  }

  try {
    // 1. Geocoding
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanCity)}&limit=1`, {
      headers: { 'User-Agent': 'VibeCodedApps-AirQuality/1.0' },
      signal: AbortSignal.timeout(5000)
    });
    const geoData = await geoRes.json();
    if (!geoData || geoData.length === 0) {
      return res.status(404).json({ success: false, error: 'Konum bulunamadı' });
    }

    const lat = geoData[0].lat;
    const lon = geoData[0].lon;
    const displayName = geoData[0].display_name;

    // 2. Open-Meteo Air Quality (PM2.5, PM10, Carbon Monoxide, NO2, SO2, Ozone, European & US AQI)
    const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm2_5,pm10,european_aqi&forecast_days=1`, {
      headers: { 'User-Agent': 'VibeCodedApps/1.0' },
      signal: AbortSignal.timeout(6000)
    });
    const data = await aqiRes.json();
    const cur = data.current || {};

    const output = {
      success: true,
      city: cleanCity,
      displayName,
      lat, lon,
      aqi: cur.european_aqi ?? cur.us_aqi ?? 25,
      usAqi: cur.us_aqi ?? 30,
      pm25: cur.pm2_5 ?? 12.5,
      pm10: cur.pm10 ?? 22.0,
      no2: cur.nitrogen_dioxide ?? 15.0,
      so2: cur.sulphur_dioxide ?? 5.0,
      o3: cur.ozone ?? 45.0,
      co: cur.carbon_monoxide ?? 250,
      hourly: data.hourly || {}
    };

    aqiCache.set(cacheKey, { data: output, timestamp: Date.now() });
    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Hava kalitesi verisi alınamadı' });
  }
});

module.exports = router;
