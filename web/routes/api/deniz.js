const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 26. Open-Meteo Marine API (Denizcilik, Dalga & Sörf Radarı)
// =============================================================
const marineCache = new Map();

const MARINE_SPOTS = {
  'alacati': { name: 'Alaçatı Sörf Koyu (İzmir)', lat: 38.25, lon: 26.38 },
  'bodrum': { name: 'Bodrum Yalıkavak (Muğla)', lat: 37.10, lon: 27.29 },
  'kas': { name: 'Kaş / Kaputaş (Antalya)', lat: 36.20, lon: 29.64 },
  'bozcaada': { name: 'Bozcaada Ayazma (Çanakkale)', lat: 39.81, lon: 26.03 },
  'sile': { name: 'Şile Kıyıları (Karadeniz)', lat: 41.18, lon: 29.61 },
  'antalya': { name: 'Antalya Konyaaltı Körfezi', lat: 36.88, lon: 30.70 },
  'datca': { name: 'Datça Palamutbükü', lat: 36.67, lon: 27.50 },
  'cesme': { name: 'Çeşme Ilıca Plajı', lat: 38.31, lon: 26.35 },
  'fethiye': { name: 'Fethiye Ölüdeniz', lat: 36.55, lon: 29.12 }
};

router.get('/marine/forecast', async (req, res) => {
  const spotKey = (req.query.spot || 'alacati').trim().toLowerCase();
  let lat = parseFloat(req.query.lat);
  let lon = parseFloat(req.query.lon);
  let spotName = 'Özel Kıyı Konumu';

  if (MARINE_SPOTS[spotKey]) {
    lat = MARINE_SPOTS[spotKey].lat;
    lon = MARINE_SPOTS[spotKey].lon;
    spotName = MARINE_SPOTS[spotKey].name;
  } else if (isNaN(lat) || isNaN(lon)) {
    lat = MARINE_SPOTS['alacati'].lat;
    lon = MARINE_SPOTS['alacati'].lon;
    spotName = MARINE_SPOTS['alacati'].name;
  }

  // Koordinat sınırları denetimi
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ success: false, error: 'Geçersiz koordinat değerleri' });
  }

  const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  if (marineCache.has(cacheKey)) {
    const c = marineCache.get(cacheKey);
    if (Date.now() - c.timestamp < 30 * 60 * 1000) return res.json(c.data);
  }

  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction&hourly=wave_height,wave_period&forecast_days=2`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'VibeCodedApps/1.0' },
      signal: AbortSignal.timeout(7000)
    });

    if (!response.ok) throw new Error('Denizcilik meteoroloji servisi yanıt vermedi');
    const data = await response.json();

    const cur = data.current || {};
    const waveHeight = cur.wave_height !== undefined ? cur.wave_height : 0.4;
    const wavePeriod = cur.wave_period !== undefined ? cur.wave_period : 3.2;
    const waveDir = cur.wave_direction !== undefined ? cur.wave_direction : 180;
    const windWaveHeight = cur.wind_wave_height !== undefined ? cur.wind_wave_height : 0.1;

    // Yüzme ve sörf durumu değerlendirmesi
    let condition = 'Sakin & Durgun';
    let conditionColor = 'emerald';
    let activityAdvice = 'Deniz çarşaf gibi. Yüzme, kano, SUP ve aile aktiviteleri için son derece ideal.';

    if (waveHeight >= 2.0) {
      condition = 'Çok Dalgalı / Fırtınalı';
      conditionColor = 'rose';
      activityAdvice = 'Dikkat! Denize girmek ve yüzmek tehlikelidir. Yalnızca profesyonel sörfçüler için uygundur.';
    } else if (waveHeight >= 1.2) {
      condition = 'Orta Dalgalı (Sörf Uygun)';
      conditionColor = 'amber';
      activityAdvice = 'Rüzgar sörfü, kitesurf ve dalga sörfü için harika koşullar. Acemi yüzücüler dikkatli olmalıdır.';
    } else if (waveHeight >= 0.6) {
      condition = 'Hafif Çalkantılı';
      conditionColor = 'teal';
      activityAdvice = 'Hafif kıpırtılı deniz. Yüzme ve yelkenli seyri için keyifli koşullar.';
    }

    const output = {
      success: true,
      spotName,
      latitude: lat,
      longitude: lon,
      waveHeight,
      wavePeriod,
      waveDirection: waveDir,
      windWaveHeight,
      condition,
      conditionColor,
      activityAdvice,
      hourly: data.hourly || {}
    };

    marineCache.set(cacheKey, { data: output, timestamp: Date.now() });
    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Deniz durumu verisi alınamadı: ' + err.message });
  }
});

module.exports = router;
