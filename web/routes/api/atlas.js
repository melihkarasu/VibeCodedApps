const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 13. Coğrafya Atlası (REST Countries Proxy)
// =============================================================

router.get('/atlas/countries', async (req, res) => {
  try {
    const output = await getCachedJson('atlas_countries_all', async () => {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,capital,region,subregion,population,flags,currencies,languages,borders,latlng,area,continents', {
        headers: { 'User-Agent': 'VibeCodedApps/1.0' },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) throw new Error('Ülke verileri alınamadı');
      const rawData = await response.json();
      const data = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);

      const formatted = data.map(c => ({
        commonName: c.name?.common || '',
        officialName: c.name?.official || '',
        cca2: c.cca2 || '',
        cca3: c.cca3 || '',
        capital: c.capital?.[0] || 'Belirtilmemiş',
        region: c.region || '',
        subregion: c.subregion || '',
        population: c.population || 0,
        area: c.area || 0,
        flagSvg: c.flags?.svg || c.flags?.png || '',
        currencies: Object.values(c.currencies || {}).map(cur => `${cur.name} (${cur.symbol || ''})`).join(', ') || 'Bilinmiyor',
        languages: Object.values(c.languages || {}).join(', ') || 'Bilinmiyor',
        borders: c.borders || [],
        latlng: c.latlng || [0, 0]
      })).sort((a, b) => a.commonName.localeCompare(b.commonName));

      return { success: true, count: formatted.length, countries: formatted, source: 'REST Countries (Günde 1 Kez Güncellenen Kalıcı JSON Önbellek)' };
    });

    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Dünya ülkeleri arşivi çekilemedi: ' + err.message });
  }
});

module.exports = router;
