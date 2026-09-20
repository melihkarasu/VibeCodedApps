const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');

// =============================================================
// 17. IP Üzerinden Konum (Geolocation - SSRF Güvenlikli)
// =============================================================
const ipCache = new Map();

router.get('/ip/lookup', async (req, res) => {
  let ip = (req.query.ip || '').trim();

  // Eğer IP verilmemişse istemcinin IP'sini al
  if (!ip) {
    const forwarded = req.headers['x-forwarded-for'];
    ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || '');
  }

  // IPv6 mapped IPv4 temizliği (::ffff:1.2.3.4)
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  // Strix SSRF Savunması: Özel, yerel ve Docker IP bloklarını engelle
  const isPrivateIp = (testIp) => {
    return (
      testIp === '127.0.0.1' ||
      testIp === 'localhost' ||
      testIp === '::1' ||
      testIp.startsWith('10.') ||
      testIp.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(testIp) ||
      testIp === '169.254.169.254' ||
      testIp.startsWith('100.64.')
    );
  };

  // Eğer sorgulanan IP özel/lokal ise veya boşsa güvenli genel IP kullan veya bilgi dön
  const queryIp = (!ip || isPrivateIp(ip)) ? '' : ip;

  const cacheKey = queryIp || 'self';
  if (ipCache.has(cacheKey)) {
    const c = ipCache.get(cacheKey);
    if (Date.now() - c.timestamp < 30 * 60 * 1000) return res.json(c.data);
  }

  try {
    const url = queryIp ? `http://ip-api.com/json/${encodeURIComponent(queryIp)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query` : `http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;
    
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const data = await response.json();

    if (data.status !== 'success') {
      return res.status(400).json({ success: false, error: data.message || 'IP konumu çözümlenemedi' });
    }

    const output = {
      success: true,
      ip: data.query,
      country: data.country,
      countryCode: data.countryCode,
      regionName: data.regionName,
      city: data.city,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      as: data.as
    };

    ipCache.set(cacheKey, { data: output, timestamp: Date.now() });
    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'IP coğrafi konum servisine ulaşılamadı' });
  }
});

module.exports = router;
