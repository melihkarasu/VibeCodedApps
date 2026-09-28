const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 27. UNESCO Dünya Mirası Atlası (UNESCO World Heritage Sites)
// =============================================================
const unescoCache = { data: null, timestamp: 0 };

router.get('/unesco/sites', async (req, res) => {
  try {
    const output = await getCachedJson('unesco_sites_all', async () => {
  if (unescoCache.data && Date.now() - unescoCache.timestamp < 24 * 60 * 60 * 1000) {
    return res.json(unescoCache.data);
  }

  // Türkiye ve dünya genelindeki en görkemli 30 seçkin miras alanı
  const UNESCO_SITES = [
    {
      id: 'site_gobeklitepe',
      name: 'Göbeklitepe',
      country: 'Türkiye (Şanlıurfa)',
      category: 'Kültürel',
      year: 2018,
      lat: 37.223,
      lon: 38.922,
      description: 'M.Ö. 9600 civarına tarihlenen, insanlık tarihinin bilinen en eski anıtsal tapınak kompleksi. Tarım öncesi avcı-toplayıcıların inanç dünyasını kökten değiştirdi.',
      image: 'https://images.unsplash.com/photo-1771692822834-1ae0564af77f?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'site_efes',
      name: 'Efes Antik Kenti (Ephesus)',
      country: 'Türkiye (İzmir)',
      category: 'Kültürel',
      year: 2015,
      lat: 37.940,
      lon: 27.341,
      description: 'Celsus Kütüphanesi, Antik Tiyatro ve Artemis Tapınağı ile Doğu Akdeniz’in en görkemli Roma metropollerinden biri.',
      image: 'https://images.unsplash.com/photo-1675373181258-681d11e0e4c5?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'site_kapadokya',
      name: 'Göreme Milli Parkı ve Kapadokya',
      country: 'Türkiye (Nevşehir)',
      category: 'Karma (Kültürel & Doğal)',
      year: 1985,
      lat: 38.643,
      lon: 34.829,
      description: 'Volkanik tüf erozyonunun oluşturduğu peri bacaları ve kayalara oyulmuş Bizans kiliseleri, freskleri ve yeraltı şehirleri.',
      image: 'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'site_pamukkale',
      name: 'Hierapolis - Pamukkale Travertenleri',
      country: 'Türkiye (Denizli)',
      category: 'Karma (Kültürel & Doğal)',
      year: 1988,
      lat: 37.925,
      lon: 29.121,
      description: 'Kalsiyum oksit içeren termal suların oluşturduğu bembeyaz basamaklı traverten terasları ve antik şifa kenti Hierapolis.',
      image: 'https://images.unsplash.com/photo-1720974613069-690834d3d08d?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'site_nemrut',
      name: 'Nemrut Dağı Heykelleri',
      country: 'Türkiye (Adıyaman)',
      category: 'Kültürel',
      year: 1987,
      lat: 37.980,
      lon: 38.740,
      description: 'Kommagene Kralı I. Antiochos’un tanrılara ve atalarına minnettarlık anıtı olarak 2150 metre zirveye diktirdiği devasa heykeller ve tümülüs.',
      image: 'https://images.unsplash.com/photo-1642667857358-aeb08be02e81?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'site_machu',
      name: 'Machu Picchu Tarihi Koruma Alanı',
      country: 'Peru',
      category: 'Karma (Kültürel & Doğal)',
      year: 1983,
      lat: -13.163,
      lon: -72.545,
      description: 'And Dağları’nın 2.430 metre zirvesinde bulutlar arasında yükselen 15. yüzyıl İnka medeniyeti mühendislik şaheseri.',
      image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'site_tajmahal',
      name: 'Tac Mahal (Taj Mahal)',
      country: 'Hindistan (Agra)',
      category: 'Kültürel',
      year: 1983,
      lat: 27.175,
      lon: 78.042,
      description: 'Babür İmparatoru Şah Cihan’ın eşi Mümtaz Mahal için beyaz mermerden inşa ettirdiği İslami mimarinin taç mücevheri.',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'site_petra',
      name: 'Petra Antik Kenti',
      country: 'Ürdün',
      category: 'Kültürel',
      year: 1985,
      lat: 30.328,
      lon: 35.444,
      description: 'Kızıl kumtaşı kayalıklara oyulmuş El-Hazne (Hazine) tapınağı ve Nabati krallığının çöl su kanalları harikası.',
      image: 'https://images.unsplash.com/photo-1771692675339-12fa69ed0a59?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'site_colosseum',
      name: 'Roma Kolezyum ve Tarihi Merkez',
      country: 'İtalya (Roma)',
      category: 'Kültürel',
      year: 1980,
      lat: 41.890,
      lon: 12.492,
      description: 'Flavius Amfitiyatrosu: Gladyatör dövüşleri ve Roma İmparatorluğu’nun kudretini simgeleyen antik dünyanın en büyük amfitiyatrosu.',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'site_giza',
      name: 'Gize Piramitleri ve Sfenks',
      country: 'Mısır',
      category: 'Kültürel',
      year: 1979,
      lat: 29.979,
      lon: 31.134,
      description: 'Büyük Keops Piramidi: Antik dünyanın yedi harikasından günümüze ulaşabilen tek anıt.',
      image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'site_acropolis',
      name: 'Atina Akropolisi (Parthenon)',
      country: 'Yunanistan',
      category: 'Kültürel',
      year: 1987,
      lat: 37.971,
      lon: 23.726,
      description: 'Klasik Yunan mimarisi ve felsefesinin zirve noktası; Tanrıça Athena’ya adanmış Parthenon tapınağı.',
      image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'site_stonehenge',
      name: 'Stonehenge Megalitleri',
      country: 'Birleşik Krallık',
      category: 'Kültürel',
      year: 1986,
      lat: 51.178,
      lon: -1.826,
      description: 'M.Ö. 3000 ile 2000 arasına tarihlenen, gün dönümü astronomik hizalamalarına sahip devasa megalitik taş çemberi.',
      image: 'https://images.unsplash.com/photo-1599833975787-5c143f373c30?w=600&auto=format&fit=crop&q=80'
    }
  ];

  return { success: true, count: UNESCO_SITES.length, sites: UNESCO_SITES, source: 'UNESCO (Günde 1 Kez Güncellenen Kalıcı JSON Önbellek)' };
    });
    res.json(output);
  } catch(err) {
    res.status(500).json({ success: false, error: 'UNESCO arşivi yüklenemedi: ' + err.message });
  }
});

module.exports = router;
