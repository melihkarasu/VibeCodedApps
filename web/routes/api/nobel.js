const express = require('express');
const router = express.Router();
const { getCachedJson } = require('./cache');

// =============================================================
// 29. The Nobel Prize API (Nobel Ödülleri & Bilim Ansiklopedisi)
// =============================================================

router.get('/nobel/prizes', async (req, res) => {
  try {
    const output = await getCachedJson('nobel_prizes_all_v3', async () => {
      // 1) İlk sayfayı çek ve toplam kayıt sayısını öğren
      const firstRes = await fetch('https://api.nobelprize.org/2.1/nobelPrizes?limit=100&offset=0', {
        headers: { 'User-Agent': 'VibeCodedApps/1.0' },
        signal: AbortSignal.timeout(10000)
      });
      if (!firstRes.ok) throw new Error('Nobel Vakfı API yanıt vermedi');
      const first = await firstRes.json();
      const total = Number(first.meta?.count) || 682;

      // 2) Kalan sayfaları paralel çek (offset=100..total)
      const offsets = [];
      for (let off = 100; off < total; off += 100) offsets.push(off);

      const rest = await Promise.allSettled(
        offsets.map(off =>
          fetch(`https://api.nobelprize.org/2.1/nobelPrizes?limit=100&offset=${off}`, {
            headers: { 'User-Agent': 'VibeCodedApps/1.0' },
            signal: AbortSignal.timeout(10000)
          }).then(r => r.json())
        )
      );

      const rawList = [...(first.nobelPrizes || [])];
      for (const r of rest) {
        if (r.status === 'fulfilled' && r.value && r.value.nobelPrizes) {
          rawList.push(...r.value.nobelPrizes);
        }
      }

      // 3) Tekilleştir (yıl + kategori) ve en yeniden eskiye sırala
      const seen = new Set();
      const formatted = rawList
        .filter(p => {
          const key = p.awardYear + '|' + (p.category?.en || '');
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map(p => ({
          year: p.awardYear,
          category: p.category?.en || '',
          categoryFullName: p.categoryFullName?.en || '',
          prizeAmount: p.prizeAmount || 0,
          laureates: (p.laureates || []).map(l => ({
            id: l.id,
            name: l.knownName?.en || l.orgName?.en || 'İsimsiz',
            motivation: l.motivation?.en || p.topMotivation?.en || 'İnsanlığa üstün katkı.'
          }))
        }))
        .sort((a, b) => Number(b.year) - Number(a.year) || String(a.category).localeCompare(String(b.category)));

      return {
        success: true,
        count: formatted.length,
        prizes: formatted,
        source: 'Nobel Foundation (Günde 1 Kez Güncellenen Kalıcı JSON Önbellek)'
      };
    });

    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Nobel arşivi yüklenemedi: ' + err.message });
  }
});

module.exports = router;
