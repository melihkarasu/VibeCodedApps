const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 11. 3D Kimyasal Molekül Stüdyosu (PubChem API Proxy)
// =============================================================
const molekulCache = new Map();

router.get('/molekul/data', async (req, res) => {
  const rawName = (req.query.name || 'caffeine').trim();
  const cleanName = rawName.replace(/[^a-zA-Z0-9\s\-_,()]/g, '').slice(0, 50);

  if (!cleanName) {
    return res.status(400).json({ success: false, error: 'Geçersiz molekül adı' });
  }

  const cacheKey = cleanName.toLowerCase();
  if (molekulCache.has(cacheKey)) {
    const cached = molekulCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 60 * 60 * 1000) {
      return res.json(cached.data);
    }
  }

  try {
    const encoded = encodeURIComponent(cleanName);
    const [propRes, sdfRes] = await Promise.all([
      fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encoded}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES/JSON`, {
        headers: { 'User-Agent': 'VibeCodedApps/1.0 (dev@vibecodedapps.local)' },
        signal: AbortSignal.timeout(8000)
      }),
      fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encoded}/SDF?record_type=3d`, {
        headers: { 'User-Agent': 'VibeCodedApps/1.0 (dev@vibecodedapps.local)' },
        signal: AbortSignal.timeout(8000)
      })
    ]);

    if (!propRes.ok || !sdfRes.ok) {
      return res.status(404).json({ success: false, error: 'Molekül 3D verisi PubChem arşivinde bulunamadı' });
    }

    const propData = await propRes.json();
    const sdfText = await sdfRes.text();

    const p = propData.PropertyTable?.Properties?.[0] || {};

    const output = {
      success: true,
      name: cleanName,
      cid: p.CID || null,
      formula: p.MolecularFormula || '',
      weight: p.MolecularWeight || '',
      iupac: p.IUPACName || cleanName,
      smiles: p.CanonicalSMILES || p.ConnectivitySMILES || '',
      sdf: sdfText
    };

    molekulCache.set(cacheKey, { data: output, timestamp: Date.now() });
    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'PubChem servisine erişilemedi: ' + err.message });
  }
});

module.exports = router;
