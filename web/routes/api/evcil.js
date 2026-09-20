const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 25. Evcil Hayvan & Irk Ansiklopedisi (TheCatAPI & Dogs)
// =============================================================
let petBreedsCache = { data: null, timestamp: 0 };

router.get('/pets/breeds', async (req, res) => {
  const type = (req.query.type || 'all').trim().toLowerCase();
  const q = (req.query.q || '').trim().toLowerCase();

  if (petBreedsCache.data && Date.now() - petBreedsCache.timestamp < 6 * 60 * 60 * 1000) {
    let list = petBreedsCache.data;
    if (type === 'cat') list = list.filter(p => p.petType === 'cat');
    if (type === 'dog') list = list.filter(p => p.petType === 'dog');
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || (p.temperament || '').toLowerCase().includes(q));
    return res.json({ success: true, count: list.length, breeds: list });
  }

  try {
    const catRes = await fetch('https://api.thecatapi.com/v1/breeds', {
      headers: { 'User-Agent': 'VibeCodedApps/1.0' },
      signal: AbortSignal.timeout(8000)
    });

    const catData = catRes.ok ? await catRes.json() : [];

    const cats = catData.map(c => ({
      id: 'cat_' + c.id,
      petType: 'cat',
      name: c.name,
      origin: c.origin || 'Bilinmiyor',
      temperament: c.temperament || 'Uysal, sakin',
      description: c.description || '',
      lifeSpan: c.life_span ? `${c.life_span} yıl` : '12-15 yıl',
      childFriendly: c.child_friendly || 3,
      energyLevel: c.energy_level || 3,
      intelligence: c.intelligence || 4,
      image: c.image?.url || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80',
      wikiUrl: c.wikipedia_url || null
    }));

    // Seçkin Popüler Köpek Irkları
    const dogs = [
      {
        id: 'dog_golden',
        petType: 'dog',
        name: 'Golden Retriever',
        origin: 'Birleşik Krallık',
        temperament: 'Zeki, Dost Canlısı, Güvenilir, Sadık, Oyuncu',
        description: 'Nazik doğası ve aileye düşkünlüğü ile bilinen dünyanın en popüler ve eğitilebilir aile köpeklerinden biridir.',
        lifeSpan: '10 - 12 yıl',
        childFriendly: 5,
        energyLevel: 4,
        intelligence: 5,
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'dog_kangal',
        petType: 'dog',
        name: 'Kangal Çoban Köpeği',
        origin: 'Türkiye (Sivas)',
        temperament: 'Cesur, Koruyucu, Sakin, Sadık, Güçlü',
        description: 'Anadolu’nun asil çoban köpeğidir. Sürüleri ve ailesini korumadaki olağanüstü cesareti ve dengeli mizacıyla dünya çapında tanınır.',
        lifeSpan: '12 - 15 yıl',
        childFriendly: 4,
        energyLevel: 4,
        intelligence: 5,
        image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'dog_germanshepherd',
        petType: 'dog',
        name: 'Alman Çoban Köpeği (German Shepherd)',
        origin: 'Almanya',
        temperament: 'Son Derece Zeki, İtaatkar, Koruyucu, Çalışkan',
        description: 'Arama-kurtarma, polis ve koruma görevlerinde dünya lideri olan üstün zekalı ve kararlı bir ırktır.',
        lifeSpan: '9 - 13 yıl',
        childFriendly: 4,
        energyLevel: 5,
        intelligence: 5,
        image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'dog_husky',
        petType: 'dog',
        name: 'Sibirya Kurdu (Siberian Husky)',
        origin: 'Rusya (Sibirya)',
        temperament: 'Enerjik, Oyuncu, Bağımsız, Sosyal, Konuşkan',
        description: 'Buz mavisi gözleri ve kızak çekme dayanıklılığı ile bilinen, yüksek enerjili ve dost canlısı bir kuzey köpeğidir.',
        lifeSpan: '12 - 14 yıl',
        childFriendly: 5,
        energyLevel: 5,
        intelligence: 4,
        image: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'dog_poodle',
        petType: 'dog',
        name: 'Kaniş (Poodle)',
        origin: 'Fransa / Almanya',
        temperament: 'Dahi Seviyesinde Zeki, Aktif, Eğitilebilir, Hipoalerjenik',
        description: 'Tüy dökmeyen kıvırcık kürkü ve dünyanın en zeki ikinci köpek ırkı olmasıyla apartman ve aile yaşamına son derece uygundur.',
        lifeSpan: '12 - 15 yıl',
        childFriendly: 5,
        energyLevel: 4,
        intelligence: 5,
        image: 'https://images.unsplash.com/photo-1516371535707-512a1e83bb9a?w=400&auto=format&fit=crop&q=80'
      },
      {
        id: 'dog_corgi',
        petType: 'dog',
        name: 'Pembroke Welsh Corgi',
        origin: 'Birleşik Krallık (Galler)',
        temperament: 'Neşeli, Zeki, Uyanık, Oyuncu, Sevecen',
        description: 'Kısa bacakları, tilki benzeri yüzü ve İngiliz Kraliyet ailesinin gözdesi olmasıyla ünlü neşeli bir çoban köpeğidir.',
        lifeSpan: '12 - 15 yıl',
        childFriendly: 5,
        energyLevel: 4,
        intelligence: 4,
        image: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=400&auto=format&fit=crop&q=80'
      }
    ];

    const allBreeds = [...cats, ...dogs];
    petBreedsCache = { data: allBreeds, timestamp: Date.now() };

    let list = allBreeds;
    if (type === 'cat') list = list.filter(p => p.petType === 'cat');
    if (type === 'dog') list = list.filter(p => p.petType === 'dog');
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || (p.temperament || '').toLowerCase().includes(q));

    res.json({ success: true, count: list.length, breeds: list });
  } catch(err) {
    res.status(500).json({ success: false, error: 'Evcil hayvan veritabanına erişilemedi: ' + err.message });
  }
});

module.exports = router;
