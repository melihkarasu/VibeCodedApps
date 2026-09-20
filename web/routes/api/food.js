const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 19. Open Food Facts & Alerjen Dedektifi
// =============================================================
const foodCache = new Map();

router.get('/food/search', async (req, res) => {
  const q = (req.query.q || '').trim().slice(0, 60);
  const barcode = (req.query.barcode || '').trim().replace(/[^0-9]/g, '').slice(0, 20);

  if (!q && !barcode) {
    return res.status(400).json({ success: false, error: 'Barkod veya ürün adı girilmelidir' });
  }

  const cacheKey = barcode ? `b_${barcode}` : `q_${q.toLowerCase()}`;
  if (foodCache.has(cacheKey)) {
    const c = foodCache.get(cacheKey);
    if (Date.now() - c.timestamp < 30 * 60 * 1000) return res.json(c.data);
  }

  try {
    let url = '';
    if (barcode) {
      url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    } else {
      url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=12`;
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'VibeCodedApps-Nutrition/1.0' },
      signal: AbortSignal.timeout(8000)
    });
    const data = await response.json();

    let products = [];
    if (barcode) {
      if (data.status === 1 && data.product) {
        products = [data.product];
      }
    } else if (data.products) {
      products = data.products;
    }

    const formatted = products.map(p => ({
      code: p.code || '',
      name: p.product_name || p.product_name_tr || p.product_name_en || 'İsimsiz Ürün',
      brands: p.brands || 'Bilinmiyor',
      image: p.image_front_url || p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
      nutriscore: (p.nutriscore_grade || '').toUpperCase() || '?',
      ecoscore: (p.ecoscore_grade || '').toUpperCase() || '?',
      allergens: (p.allergens_tags || []).map(a => a.replace(/^[a-z]{2}:/, '')),
      allergensHierarchy: p.allergens_hierarchy || [],
      ingredientsText: p.ingredients_text_tr || p.ingredients_text || 'İçerik bilgisi bulunamadı',
      categories: p.categories || '',
      nutriments: {
        energyKcal: p.nutriments?.['energy-kcal_100g'] || p.nutriments?.['energy-kcal'] || 0,
        fat: p.nutriments?.fat_100g || 0,
        sugar: p.nutriments?.sugars_100g || 0,
        proteins: p.nutriments?.proteins_100g || 0,
        salt: p.nutriments?.salt_100g || 0
      }
    }));

    const output = { success: true, count: formatted.length, products: formatted };
    foodCache.set(cacheKey, { data: output, timestamp: Date.now() });
    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Gıda ürünleri veri tabanına ulaşılamadı' });
  }
});

module.exports = router;
