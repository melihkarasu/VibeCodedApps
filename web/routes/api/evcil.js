const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// =============================================================
// 25. Evcil Hayvan & Irk Ansiklopedisi (238 Kedi & Köpek Irkı)
// =============================================================
let petBreedsCache = null;

function loadBreedsCatalog() {
  if (petBreedsCache && Array.isArray(petBreedsCache) && petBreedsCache.length > 100) {
    return petBreedsCache;
  }
  const catalogPath = path.join(__dirname, '../../public/apps/evcil/breeds.json');
  const raw = fs.readFileSync(catalogPath, 'utf-8');
  petBreedsCache = JSON.parse(raw);
  return petBreedsCache;
}

router.get('/pets/breeds', async (req, res) => {
  const type = (req.query.type || 'all').trim().toLowerCase();
  const q = (req.query.q || '').trim().toLowerCase();

  try {
    let list = loadBreedsCatalog();
    if (type === 'cat') list = list.filter(p => p.petType === 'cat');
    if (type === 'dog') list = list.filter(p => p.petType === 'dog');
    if (q) {
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.temperament || '').toLowerCase().includes(q) ||
        (p.origin || '').toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, breeds: list });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Evcil hayvan veritabanına erişilemedi: ' + err.message });
  }
});

module.exports = router;
