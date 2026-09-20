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

  // Strix Güvenlik Denetimi: Sıkı regex doğrulaması (SSRF ve enjeksiyon engeli)
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

module.exports = router;
