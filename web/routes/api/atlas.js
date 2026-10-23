const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// =============================================================
// 13. Coğrafya Atlası (250 Dünya Ülkesi)
// =============================================================
let countriesCache = null;

function loadCountriesCatalog() {
  if (countriesCache && Array.isArray(countriesCache) && countriesCache.length >= 200) {
    return countriesCache;
  }
  const p = path.join(__dirname, '../../public/apps/atlas/countries.json');
  countriesCache = JSON.parse(fs.readFileSync(p, 'utf-8'));
  return countriesCache;
}

router.get('/atlas/countries', async (req, res) => {
  try {
    const countries = loadCountriesCatalog();
    res.json({
      success: true,
      count: countries.length,
      countries,
      source: 'REST Countries (250 Dünya Ülkesi Kalıcı Arşivi)'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Dünya ülkeleri arşivi çekilemedi: ' + err.message });
  }
});

module.exports = router;
