const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');

// =============================================================
// 7. Sızıntı Kontrolü: HIBP k-Anonymity SHA-1 Proxy Endpoint
// =============================================================
const pwnedCache = new Map();

router.get('/security/pwned-range', async (req, res) => {
  const prefix = (req.query.prefix || '').trim().toUpperCase();

  // Web Security Scanner Güvenlik Denetimi: Sıkı regex doğrulaması (SSRF ve enjeksiyon engeli)
  if (!/^[0-9A-F]{5}$/.test(prefix)) {
    return res.status(400).json({ error: 'Geçersiz hash öneki (tam 5 hex karakter beklenir)' });
  }

  if (pwnedCache.has(prefix)) {
    const cached = pwnedCache.get(prefix);
    if (Date.now() - cached.timestamp < 10 * 60 * 1000) {
      res.setHeader('Content-Type', 'text/plain');
      return res.send(cached.data);
    }
  }

  try {
    const url = `https://api.pwnedpasswords.com/range/${prefix}`;
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'VibeCodedApps-PasswordChecker/2.0',
        'Add-Padding': 'true'
      },
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) throw new Error('HIBP API yanıt vermedi');
    const text = await response.text();

    pwnedCache.set(prefix, { data: text, timestamp: Date.now() });
    res.setHeader('Content-Type', 'text/plain');
    res.send(text);
  } catch(err) {
    console.error('HIBP Proxy hatası:', err.message);
    res.status(502).json({ error: 'Sızıntı veritabanına erişilemedi' });
  }
});


// =============================================================
// 7.1 Web Security Scanner: Pasif HTTP Yanıt Başlıkları Proxy Ucu
// =============================================================
const scannerHeadersCache = new Map();

router.get('/security/headers', async (req, res) => {
  const targetUrl = (req.query.url || '').trim();
  if (!targetUrl) {
    return res.status(400).json({ success: false, error: 'URL parametresi gereklidir' });
  }

  let validUrl = targetUrl;
  if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
    validUrl = 'https://' + validUrl;
  }

  try {
    const parsed = new URL(validUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ success: false, error: 'Yalnızca HTTP ve HTTPS desteklenir' });
    }

    // SSRF ve DNS Rebinding Koruması (utils.js)
    if (await isPrivateAddress(parsed.hostname)) {
      return res.status(403).json({ success: false, error: 'Yerel ve iç ağ IP adresleri taranamamaktadır (SSRF Koruması)' });
    }

    const cacheKey = parsed.hostname.toLowerCase();
    if (scannerHeadersCache.has(cacheKey)) {
      const cached = scannerHeadersCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return res.json(cached.data);
      }
    }

    // Pasif HEAD isteği at (gerekirse GET fallback)
    let response;
    try {
      response = await fetch(validUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 WebSecurityScanner/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000)
      });
    } catch (headErr) {
      // HEAD 405 veya network hatası durumunda GET dene
      response = await fetch(validUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 WebSecurityScanner/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000)
      });
    }

    const headersDict = {};
    for (const [k, v] of response.headers.entries()) {
      headersDict[k.toLowerCase()] = v;
    }

    const output = {
      success: true,
      url: validUrl,
      status_code: response.status,
      headers: headersDict
    };

    scannerHeadersCache.set(cacheKey, { data: output, timestamp: Date.now() });
    res.json(output);
  } catch (err) {
    res.status(502).json({ success: false, error: 'Hedef sunucuya erişilemedi: ' + err.message });
  }
});

module.exports = router;
