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

    // TheCatAPI anahtar istediginde (403) devreye giren gomulu kedi arsivi
    const CAT_BREEDS_FALLBACK = [
      { id: 'cat_van', name: 'Van Kedisi', origin: 'Türkiye (Van)', temperament: 'Zeki, Enerjik, Su Sever, Bağımsız, Sadık', description: 'İki farklı renkli gözleri ve yüzme sevgisiyle ünlü, Van Gölü yöresine özgü asil ve atletik bir kedi ırkıdır.', life_span: '12 - 17 yıl', child_friendly: 4, energy_level: 5, intelligence: 5, wikipedia_url: 'https://tr.wikipedia.org/wiki/Van_kedisi' },
      { id: 'cat_angora', name: 'Ankara Kedisi (Turkish Angora)', origin: 'Türkiye (Ankara)', temperament: 'Zarif, Oyuncu, Sosyal, Zeki', description: 'İpek gibi tüyü ve zekasıyla bilinen, kökeni Ankara\'ya uzanan asil ve zarif bir kedi ırkıdır.', life_span: '12 - 18 yıl', child_friendly: 4, energy_level: 4, intelligence: 5, wikipedia_url: 'https://tr.wikipedia.org/wiki/Ankara_kedisi' },
      { id: 'cat_bsh', name: 'British Shorthair', origin: 'Birleşik Krallık', temperament: 'Sakin, Bağımsız, Sevecen, Uysal', description: 'Yuvarlak yüzü, yoğun tüyü ve sakin mizacıyla apartman yaşamına son derece uygun popüler bir ırktır.', life_span: '12 - 17 yıl', child_friendly: 5, energy_level: 2, intelligence: 4, wikipedia_url: null },
      { id: 'cat_maine', name: 'Maine Coon', origin: 'ABD (Maine)', temperament: 'Nazik Dev, Sosyal, Zeki, Oyuncu', description: 'En büyük ev kedisi ırklarından biri; köpek gibi sadakati ve koca kalbiyle nazik dev olarak anılır.', life_span: '10 - 15 yıl', child_friendly: 5, energy_level: 3, intelligence: 5, wikipedia_url: null },
      { id: 'cat_persian', name: 'Pers (Persian)', origin: 'İran', temperament: 'Sakin, Zarif, Kucağa Düşkün', description: 'Uzun ipeksi tüyü, yassı yüzü ve sessiz asaletiyle dünya üzerindeki en bilinen klasik kedi ırkıdır.', life_span: '12 - 17 yıl', child_friendly: 4, energy_level: 2, intelligence: 3, wikipedia_url: null },
      { id: 'cat_ragdoll', name: 'Ragdoll', origin: 'ABD (Kaliforniya)', temperament: 'Sakin, Sevecen, Kucağa Düşkün', description: 'Kucağa alınınca adeta bez bebek gibi gevşediği için bu adı alan, çok sakin ve bağlı bir ırktır.', life_span: '12 - 17 yıl', child_friendly: 5, energy_level: 2, intelligence: 4, wikipedia_url: null },
      { id: 'cat_scottish', name: 'Scottish Fold', origin: 'İskoçya', temperament: 'Sakin, Uysal, Sevecen, Meraklı', description: 'Öne kıvrılan minik kulakları ve baykuş görünümüyle ünlü, sessiz ve çok tatlı mizaçlı bir ırktır.', life_span: '11 - 15 yıl', child_friendly: 5, energy_level: 3, intelligence: 4, wikipedia_url: null },
      { id: 'cat_siamese', name: 'Siyam (Siamese)', origin: 'Tayland', temperament: 'Konuşkan, Sosyal, Zeki, Bağlı', description: 'Mavi gözleri, koyu maske deseni ve insanla sürekli konuşan sesli karakteriyle tanınan eski bir saray ırkıdır.', life_span: '12 - 20 yıl', child_friendly: 4, energy_level: 4, intelligence: 5, wikipedia_url: null },
      { id: 'cat_bengal', name: 'Bengal', origin: 'ABD', temperament: 'Enerjik, Atletik, Meraklı, Cesur', description: 'Vahşi leopard deseni ve aşırı atletizmiyle dikkat çeken, suyla oynamayı seven aktif bir melez ırktır.', life_span: '12 - 16 yıl', child_friendly: 4, energy_level: 5, intelligence: 5, wikipedia_url: null },
      { id: 'cat_sphynx', name: 'Sphynx', origin: 'Kanada', temperament: 'Sevecen, Enerjik, Sosyal, Şakacı', description: 'Tüysüz görünümü ve köpek gibi sosyal karakteriyle bilinen, sıcaklık seven eğlenceli bir ırktır.', life_span: '9 - 15 yıl', child_friendly: 5, energy_level: 4, intelligence: 5, wikipedia_url: null },
      { id: 'cat_norwegian', name: 'Norveç Orman Kedisi', origin: 'Norveç', temperament: 'Nazik, Bağımsız, Atletik, Sabırlı', description: 'İskandinav ormanlarından gelen, kalın su itici kürklü, iri yapılı ve doğal bir tırmanıcı olan ırktır.', life_span: '12 - 16 yıl', child_friendly: 5, energy_level: 3, intelligence: 5, wikipedia_url: null },
      { id: 'cat_abyssinian', name: 'Habeş (Abyssinian)', origin: 'Etiyopya / Güneydoğu Asya', temperament: 'Aktif, Meraklı, Zeki, Oyuncu', description: 'Tarçın tonlu tüyü ve kadife görünümüyle bilinen, insanı takip eden son derece aktif bir ırktır.', life_span: '12 - 15 yıl', child_friendly: 4, energy_level: 5, intelligence: 5, wikipedia_url: null }
    ];

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

    // TheCatAPI basarisiz olduysa (403 veya bos) gomulu arsivi kullan
    const finalCats = (cats.length > 0) ? cats : CAT_BREEDS_FALLBACK.map(c => ({
      id: 'cat_' + c.id,
      petType: 'cat',
      name: c.name,
      origin: c.origin,
      temperament: c.temperament,
      description: c.description,
      lifeSpan: c.life_span,
      childFriendly: c.child_friendly,
      energyLevel: c.energy_level,
      intelligence: c.intelligence,
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80',
      wikiUrl: c.wikipedia_url || null
    }));

    const allBreeds = [...finalCats, ...dogs];
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
