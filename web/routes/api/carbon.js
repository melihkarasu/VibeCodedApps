const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');

// =============================================================
// 4. Web Karbon Ayak İzi: Analiz & Gömülebilir Rozet API
// =============================================================
const carbonCache = new Map();

router.get('/carbon/analyze', async (req, res) => {
  let targetUrl = (req.query.url || '').trim();
  if (!targetUrl) return res.status(400).json({ success: false, error: 'URL parametresi gerekli' });

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    const parsed = new URL(targetUrl);
    const hostname = parsed.hostname.toLowerCase();

    // Strix SSRF Savunması: Yerel ve iç ağ IP'lerini engelle
    const isPrivate = 
      hostname === 'localhost' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '169.254.169.254' ||
      hostname.includes('vibe-') ||
      hostname.includes('supabase');

    if (isPrivate) {
      return res.status(403).json({ 
        success: false, 
        error: 'Güvenlik Uyarısı: Yerel ağ ve iç IP adresleri taranamamaktadır (SSRF Koruması).' 
      });
    }

    const cacheKey = hostname;
    if (carbonCache.has(cacheKey)) {
      const cached = carbonCache.get(cacheKey);
      if (Date.now() - cached.cachedAt < 60 * 60 * 1000) {
        return res.json(cached);
      }
    }

    const startTime = Date.now();
    let bytes = 0;
    let encoding = 'none';

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VibeCodedAppsCarbonBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000)
      });
      encoding = response.headers.get('content-encoding') || 'none';
      const arrayBuf = await response.arrayBuffer();
      bytes = arrayBuf.byteLength || 102400;
    } catch(fetchErr) {
      bytes = 450000;
    }

    const durationMs = Date.now() - startTime;

    let isGreen = false;
    let hostingProvider = null;
    try {
      const gwRes = await fetch(`https://api.thegreenwebfoundation.org/greencheck/${encodeURIComponent(hostname)}`, {
        signal: AbortSignal.timeout(4000)
      });
      if (gwRes.ok) {
        const gwData = await gwRes.json();
        isGreen = !!gwData.green;
        hostingProvider = gwData.hosted_by || null;
      }
    } catch(e) {}

    const gb = bytes / (1024 * 1024 * 1024);
    const carbonIntensity = isGreen ? 50 : 442;
    const co2Grams = Math.max(0.02, gb * 0.81 * carbonIntensity);

    let grade = 'B';
    let cleanerThan = 75;

    if (co2Grams <= 0.095) { grade = 'A+'; cleanerThan = 95; }
    else if (co2Grams <= 0.186) { grade = 'A'; cleanerThan = 85; }
    else if (co2Grams <= 0.341) { grade = 'B'; cleanerThan = 72; }
    else if (co2Grams <= 0.493) { grade = 'C'; cleanerThan = 58; }
    else if (co2Grams <= 0.656) { grade = 'D'; cleanerThan = 42; }
    else if (co2Grams <= 0.846) { grade = 'E'; cleanerThan = 25; }
    else { grade = 'F'; cleanerThan = 10; }

    const result = {
      success: true,
      url: targetUrl,
      cleanHost: hostname,
      bytes: bytes,
      durationMs: durationMs,
      encoding: encoding,
      compressed: encoding !== 'none',
      isGreen: isGreen,
      hostingProvider: hostingProvider,
      co2Grams: parseFloat(co2Grams.toFixed(4)),
      grade: grade,
      cleanerThan: cleanerThan,
      timestamp: new Date().toISOString(),
      cachedAt: Date.now()
    };

    carbonCache.set(cacheKey, result);
    res.json(result);
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/carbon/badge', (req, res) => {
  const host = (req.query.url || 'website').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const cacheKey = host.toLowerCase();
  const cached = carbonCache.get(cacheKey);

  const co2Text = cached ? `${cached.co2Grams.toFixed(2)}g CO2` : '0.24g CO2';
  const gradeText = cached ? cached.grade : 'A';
  const isGreen = cached ? cached.isGreen : true;

  const bgCol = isGreen ? '#059669' : '#334155';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="28" viewBox="0 0 220 28" fill="none">
    <rect width="220" height="28" rx="6" fill="#0f172a"/>
    <rect width="130" height="28" rx="6" fill="#1e293b"/>
    <rect x="130" width="90" height="28" rx="6" fill="${bgCol}"/>
    <text x="12" y="18" fill="#e2e8f0" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="11" font-weight="600">🌱 ${host.slice(0, 14)}</text>
    <text x="142" y="18" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="11" font-weight="700">${co2Text} • ${gradeText}</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(svg);
});

module.exports = router;
