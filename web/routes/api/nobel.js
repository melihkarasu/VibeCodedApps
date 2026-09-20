const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 29. The Nobel Prize API (Nobel Ödülleri & Bilim Ansiklopedisi)
// =============================================================

router.get('/nobel/prizes', async (req, res) => {
  try {
    const output = await getCachedJson('nobel_prizes_all', async () => {
      const response = await fetch('https://api.nobelprize.org/2.1/nobelPrizes?limit=40', {
        headers: { 'User-Agent': 'VibeCodedApps/1.0' },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) throw new Error('Nobel Vakfı API yanıt vermedi');
      const data = await response.json();

      const formatted = (data.nobelPrizes || []).map(p => {
        const laureates = (p.laureates || []).map(l => ({
          id: l.id,
          name: l.knownName?.en || l.orgName?.en || 'İsimsiz',
          motivation: l.motivation?.en || p.topMotivation?.en || 'İnsanlığa üstün katkı.'
        }));

        return {
          year: p.awardYear,
          category: p.category?.en || '',
          categoryFullName: p.categoryFullName?.en || '',
          prizeAmount: p.prizeAmount || 0,
          laureates
        };
      });

      // Türk Nobel Kazananlarını da arşivde sabitle (Aziz Sancar, Orhan Pamuk)
      const turkishLaureates = [
        {
          year: '2015',
          category: 'Chemistry',
          categoryFullName: 'The Nobel Prize in Chemistry',
          prizeAmount: 8000000,
          laureates: [{ id: '921', name: 'Aziz Sancar', motivation: 'For mechanistic studies of DNA repair (Hasarlı DNA onarım mekanizması keşfi).' }]
        },
        {
          year: '2006',
          category: 'Literature',
          categoryFullName: 'The Nobel Prize in Literature',
          prizeAmount: 10000000,
          laureates: [{ id: '808', name: 'Orhan Pamuk', motivation: 'Who in the pursuit of the melancholic soul of his native city has discovered new symbols for the clash and interlacing of cultures.' }]
        }
      ];

      const merged = [...turkishLaureates, ...formatted];
      return { success: true, count: merged.length, prizes: merged, source: 'Nobel Foundation (Günde 1 Kez Güncellenen Kalıcı JSON Önbellek)' };
    });

    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Nobel arşivi yüklenemedi: ' + err.message });
  }
});

module.exports = router;
