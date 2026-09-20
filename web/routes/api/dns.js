const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');

// =============================================================
// 8. DNS Kontrol & Ağ Teşhisi: DoH (DNS-over-HTTPS) Proxy
// =============================================================
const dnsCache = new Map();

router.get('/dns/lookup', async (req, res) => {
  let domain = (req.query.domain || '').trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();

  // Strix Güvenlik Denetimi: Sıkı Domain Regex Doğrulaması & SSRF Savunması
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    return res.status(400).json({ error: 'Geçersiz alan adı formatı' });
  }

  // Yerel ve iç ağ domain/host koruması
  const isPrivate = 
    domain === 'localhost' ||
    domain.endsWith('.local') ||
    domain.endsWith('.internal') ||
    domain.startsWith('127.') ||
    domain.startsWith('10.') ||
    domain.startsWith('192.168.') ||
    domain.includes('vibe-') ||
    domain.includes('supabase');

  if (isPrivate) {
    return res.status(403).json({ error: 'Güvenlik Uyarısı: Yerel ağ adresi sorgulanamaz (SSRF Koruması)' });
  }

  const allowedTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'ANY', 'CAA', 'SRV'];
  const type = (req.query.type || 'A').toUpperCase();
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: 'Desteklenmeyen DNS kayıt türü' });
  }

  const provider = (req.query.provider || 'cloudflare').toLowerCase();
  const cacheKey = `${domain}_${type}_${provider}`;

  if (dnsCache.has(cacheKey)) {
    const cached = dnsCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return res.json(cached.data);
    }
  }

  try {
    let url = '';
    const headers = {};

    if (provider === 'google') {
      url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`;
    } else {
      url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`;
      headers['Accept'] = 'application/dns-json';
    }

    const response = await fetch(url, {
      headers: headers,
      signal: AbortSignal.timeout(6000)
    });

    if (!response.ok) throw new Error('DoH sağlayıcı yanıt vermedi');
    const data = await response.json();

    dnsCache.set(cacheKey, { data: data, timestamp: Date.now() });
    res.json(data);
  } catch(err) {
    res.status(502).json({ error: 'DNS çözümleme hatası: ' + err.message });
  }
});

module.exports = router;
