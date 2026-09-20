const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');

// =============================================================
// 23. The Color API (Renk Paleti, Harmoni & Kontrast Stüdyosu)
// =============================================================
const colorCache = new Map();

router.get('/renk/scheme', async (req, res) => {
  const rawHex = (req.query.hex || 'FA520F').trim().replace('#', '').toUpperCase().slice(0, 6);
  const mode = (req.query.mode || 'analogic').trim().toLowerCase().slice(0, 20);
  const cleanHex = /^[0-9A-F]{3,6}$/.test(rawHex) ? rawHex : 'FA520F';
  const validModes = ['monochrome', 'monochrome-dark', 'monochrome-light', 'analogic', 'complement', 'analogic-complement', 'triad', 'quad'];
  const cleanMode = validModes.includes(mode) ? mode : 'analogic';

  const cacheKey = `${cleanHex}_${cleanMode}`;
  if (colorCache.has(cacheKey)) {
    return res.json(colorCache.get(cacheKey));
  }

  try {
    const response = await fetch(`https://www.thecolorapi.com/scheme?hex=${cleanHex}&mode=${cleanMode}&count=5`, {
      headers: { 'User-Agent': 'VibeCodedApps/1.0' },
      signal: AbortSignal.timeout(6000)
    });

    if (!response.ok) throw new Error('Renk servisi yanıt vermedi');
    const data = await response.json();

    const colors = (data.colors || []).map(c => ({
      hex: c.hex?.value || '#000000',
      cleanHex: c.hex?.clean || '000000',
      rgb: c.rgb?.value || 'rgb(0,0,0)',
      hsl: c.hsl?.value || 'hsl(0,0%,0%)',
      name: c.name?.value || 'Renk',
      contrastText: c.contrast?.value || '#ffffff'
    }));

    const output = {
      success: true,
      mode: cleanMode,
      seedHex: '#' + cleanHex,
      colors
    };

    colorCache.set(cacheKey, output);
    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Renk paleti oluşturulamadı: ' + err.message });
  }
});

module.exports = router;
