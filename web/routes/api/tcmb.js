const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 1. TCMB (Türkiye Cumhuriyet Merkez Bankası) Kurlar API
// =============================================================

router.get('/tcmb', async (req, res) => {
  const fetchTcmbXml = () => {
    return new Promise((resolve, reject) => {
      const request = https.get('https://www.tcmb.gov.tr/kurlar/today.xml', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VibeCodedApps/1.0)' },
        timeout: 8000
      }, (response) => {
        if (response.statusCode !== 200) {
          return reject(new Error('TCMB HTTP ' + response.statusCode));
        }

        let xmlData = '';
        response.on('data', chunk => xmlData += chunk);
        response.on('end', () => {
          try {
            const tarihMatch = xmlData.match(/Tarih_Date Tarih=\"([^\"]+)\"[^>]*Bulten_No=\"([^\"]+)\"/);
            const tarih = tarihMatch ? tarihMatch[1] : '';
            const bulten = tarihMatch ? tarihMatch[2] : '';

            const currencyRegex = /<Currency CrossOrder=\"[^\"]*\" Kod=\"([^\"]+)\" CurrencyCode=\"([^\"]+)\">([\s\S]*?)<\/Currency>/g;
            const rates = {};
            let m;
            while ((m = currencyRegex.exec(xmlData)) !== null) {
              const code = m[1];
              const block = m[3];
              const getVal = (tag) => {
                const tm = block.match(new RegExp('<' + tag + '>([^<]*)<\/' + tag + '>'));
                return tm ? tm[1].trim() : '';
              };
              rates[code] = {
                code: code,
                name: getVal('Isim'),
                unit: parseInt(getVal('Unit')) || 1,
                forexBuying: parseFloat(getVal('ForexBuying')) || null,
                forexSelling: parseFloat(getVal('ForexSelling')) || null,
                banknoteBuying: parseFloat(getVal('BanknoteBuying')) || null,
                banknoteSelling: parseFloat(getVal('BanknoteSelling')) || null,
                crossRateUSD: parseFloat(getVal('CrossRateUSD')) || null
              };
            }

            resolve({
              success: true,
              source: 'TCMB (Günde 1 Kez Güncellenen Kalıcı JSON Önbellek)',
              tarih: tarih,
              bultenNo: bulten,
              timestamp: new Date().toISOString(),
              rates: rates
            });
          } catch (err) {
            reject(err);
          }
        });
      });

      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('TCMB Zaman Aşımı'));
      });
    });
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  try {
    const data = await getCachedJson(`tcmb_today_${todayStr}`, async () => {
      return await fetchTcmbXml();
    });
    // Standalone (melihkarasu.github.io) kullanicilari icin CORS erisimi
    res.set('Access-Control-Allow-Origin', 'https://melihkarasu.github.io');
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'TCMB döviz kurları alınamadı: ' + err.message });
  }
});

module.exports = router;
