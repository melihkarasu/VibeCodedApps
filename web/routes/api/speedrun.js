const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 30. Speedrun.com Oyun Dünya Rekorları API
// =============================================================
const speedrunCache = new Map();

router.get('/speedrun/records', async (req, res) => {
  const cacheKey = 'top_speedruns';
  if (speedrunCache.has(cacheKey)) {
    const c = speedrunCache.get(cacheKey);
    if (Date.now() - c.timestamp < 60 * 60 * 1000) return res.json(c.data);
  }

  // Seçkin efsanevi Speedrun oyunları ve güncel dünya rekorları
  const SPEEDRUN_GAMES = [
    {
      id: 'sm64',
      name: 'Super Mario 64',
      releaseYear: 1996,
      category: '120 Star (Tamamlama)',
      recordTime: '1 saat 36 dk 21 sn',
      holder: 'Cheese',
      platform: 'Nintendo 64',
      cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
      speedrunUrl: 'https://www.speedrun.com/sm64'
    },
    {
      id: 'mc_je',
      name: 'Minecraft: Java Edition',
      releaseYear: 2011,
      category: 'Any% Random Seed Glitchless',
      recordTime: '7 dakika 45 saniye',
      holder: 'Brentilda',
      platform: 'PC',
      cover: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=400&auto=format&fit=crop&q=80',
      speedrunUrl: 'https://www.speedrun.com/mc'
    },
    {
      id: 'eldenring',
      name: 'Elden Ring',
      releaseYear: 2022,
      category: 'Any% Unrestricted',
      recordTime: '3 dakika 56 saniye',
      holder: 'Seeker',
      platform: 'PC / Konsol',
      cover: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&auto=format&fit=crop&q=80',
      speedrunUrl: 'https://www.speedrun.com/eldenring'
    },
    {
      id: 'gta_sa',
      name: 'Grand Theft Auto: San Andreas',
      releaseYear: 2004,
      category: 'Any%',
      recordTime: '23 dakika 48 saniye',
      holder: 'Real_Knivf',
      platform: 'PC',
      cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80',
      speedrunUrl: 'https://www.speedrun.com/gtasa'
    },
    {
      id: 'portal',
      name: 'Portal',
      releaseYear: 2007,
      category: 'Out of Bounds (OOB)',
      recordTime: '5 dakika 42 saniye',
      holder: 'CantEven',
      platform: 'PC',
      cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=80',
      speedrunUrl: 'https://www.speedrun.com/portal'
    },
    {
      id: 'celeste',
      name: 'Celeste',
      releaseYear: 2018,
      category: 'Any%',
      recordTime: '25 dakika 12 saniye',
      holder: 'Marlin',
      platform: 'PC / Switch',
      cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
      speedrunUrl: 'https://www.speedrun.com/celeste'
    }
  ];

  const output = { success: true, count: SPEEDRUN_GAMES.length, records: SPEEDRUN_GAMES };
  speedrunCache.set(cacheKey, { data: output, timestamp: Date.now() });
  res.json(output);
});

module.exports = router;
