const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { CACHE_DIR } = require('./cache');

const ECZANE_API_KEY = process.env.ECZANE_API_KEY;
const ECZANE_BASE_URL = 'https://eczaneapi.com/api/v1';

// Haversine Formülü ile İki Nokta Arası Metre Hesabı
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371000; // metre
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Türkiye (Europe/Istanbul) saat dilimine göre bugünün tarihi (YYYY-MM-DD)
function getTurkeyDateStr() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date());
}

// İlçe ve İl Merkezleri Koordinat Referans Tablosu (Konumu null gelen eczaneler için fallback)
const CITY_COORDINATES = {
  ankara: { lat: 39.925054, lng: 32.836944 }, // Anıtkabir / Çankaya
  istanbul: { lat: 41.0082, lng: 28.9784 },
  izmir: { lat: 38.4189, lng: 27.1287 },
  bursa: { lat: 40.1885, lng: 29.0610 },
  antalya: { lat: 36.8969, lng: 30.7133 },
  adana: { lat: 37.0000, lng: 35.3213 },
  konya: { lat: 37.8746, lng: 32.4932 },
  gaziantep: { lat: 37.0662, lng: 37.3833 },
  kocaeli: { lat: 40.7654, lng: 29.9406 },
  mersin: { lat: 36.8121, lng: 34.6415 },
  diyarbakir: { lat: 37.9144, lng: 40.2306 },
  eskisehir: { lat: 39.7767, lng: 30.5206 },
  samsun: { lat: 41.2867, lng: 36.3300 },
  denizli: { lat: 37.7765, lng: 29.0864 },
  sanliurfa: { lat: 37.1674, lng: 38.7955 },
  trabzon: { lat: 41.0027, lng: 39.7168 }
};

// Eşzamanlı isteklerde mükerrer API çağrılarını önlemek için in-memory promise havuzu
const pendingDutyFetches = new Map();
const pendingDistrictFetches = new Map();
// -------------------------------------------------------------
// 1. İller Listesi (/api/nobetci-eczane/cities)
// -------------------------------------------------------------
router.get('/nobetci-eczane/cities', async (req, res) => {
  const cacheFile = path.join(CACHE_DIR, 'eczane_cities_v1.json');
  
  if (fs.existsSync(cacheFile)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      if (Array.isArray(cached) && cached.length > 0) {
        return res.json({ success: true, cities: cached });
      }
    } catch (e) {}
  }

  try {
    const response = await fetch(`${ECZANE_BASE_URL}/cities`, {
      headers: {
        'X-API-Key': ECZANE_API_KEY,
        'User-Agent': 'VibeCodedApps/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`EczaneAPI HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
      const cities = data.data.map(c => ({
        name: c.name,
        slug: c.slug,
        plateCode: c.plateCode,
        districtsCount: c.districtsCount || 0
      })).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

      try {
        fs.writeFileSync(cacheFile, JSON.stringify(cities, null, 2), 'utf8');
      } catch (e) {}

      return res.json({ success: true, cities });
    }
    throw new Error('İller listesi alınamadı');
  } catch (err) {
    console.error('[EczaneAPI] Cities error:', err.message);
    res.status(500).json({ success: false, error: 'İller listesi yüklenemedi: ' + err.message });
  }
});

// -------------------------------------------------------------
// 2. İlçeler Listesi (/api/nobetci-eczane/districts)
// -------------------------------------------------------------
router.get('/nobetci-eczane/districts', async (req, res) => {
  const citySlug = (req.query.city || 'ankara').toLowerCase().trim();
  const cacheFile = path.join(CACHE_DIR, `eczane_districts_${citySlug}.json`);

  // 1. Önbellekte varsa doğrudan dön (İlçeler sabittir, her gün tekrar çekmeye gerek yoktur)
  if (fs.existsSync(cacheFile)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      if (Array.isArray(cached) && cached.length > 0) {
        return res.json({ success: true, city: citySlug, districts: cached, cached: true });
      }
    } catch (e) {}
  }

  // 2. Halihazırda bu ilçe için çalışan istek varsa onu bekle
  if (pendingDistrictFetches.has(citySlug)) {
    try {
      const districts = await pendingDistrictFetches.get(citySlug);
      return res.json({ success: true, city: citySlug, districts });
    } catch (err) {
      // devam et ve fallback dene
    }
  }

  const fetchPromise = (async () => {
    const response = await fetch(`${ECZANE_BASE_URL}/cities/${encodeURIComponent(citySlug)}/districts`, {
      headers: {
        'X-API-Key': ECZANE_API_KEY,
        'User-Agent': 'VibeCodedApps/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`EczaneAPI HTTP ${response.status}`);
    }

    const data = await response.json();
    // EczaneAPI v1 yanıt formatı: { success: true, data: { city: {...}, districts: [...] } } veya data: [...]
    const rawDistricts = Array.isArray(data.data) 
      ? data.data 
      : (Array.isArray(data.data?.districts) ? data.data.districts : []);

    if (rawDistricts.length > 0) {
      const districts = rawDistricts.map(d => ({
        name: d.name,
        slug: d.slug,
        pharmaciesCount: d.pharmaciesCount || 0
      })).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

      try {
        fs.writeFileSync(cacheFile, JSON.stringify(districts, null, 2), 'utf8');
      } catch (e) {}

      return districts;
    }
    throw new Error('İlçeler listesi alınamadı');
  })();

  pendingDistrictFetches.set(citySlug, fetchPromise);

  try {
    const districts = await fetchPromise;
    pendingDistrictFetches.delete(citySlug);
    return res.json({ success: true, city: citySlug, districts });
  } catch (err) {
    pendingDistrictFetches.delete(citySlug);
    console.error(`[EczaneAPI] Districts error for ${citySlug}:`, err.message);

    // Fallback: Nöbetçi eczaneler önbelleğindeki kayıtlardan ilçeleri türet
    try {
      const todayStr = getTurkeyDateStr();
      const files = fs.readdirSync(CACHE_DIR)
        .filter(f => f.startsWith(`eczane_duty_${citySlug}_`))
        .sort().reverse();

      if (files.length > 0) {
        const cachedDuty = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, files[0]), 'utf8'));
        if (Array.isArray(cachedDuty) && cachedDuty.length > 0) {
          const districtMap = new Map();
          cachedDuty.forEach(p => {
            const dName = p.district?.name;
            const dSlug = p.district?.slug;
            if (dName && dSlug && !districtMap.has(dSlug)) {
              districtMap.set(dSlug, { name: dName, slug: dSlug, pharmaciesCount: 0 });
            }
          });
          const districts = Array.from(districtMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
          if (districts.length > 0) {
            return res.json({ success: true, city: citySlug, districts, fallback: true });
          }
        }
      }
    } catch (fallbackErr) {
      console.warn('[EczaneAPI] Districts fallback error:', fallbackErr.message);
    }

    res.status(500).json({ success: false, error: 'İlçeler listesi yüklenemedi: ' + err.message });
  }
});

// -------------------------------------------------------------
// 2.5. Koordinattan İl ve İlçe Tespiti (Ters Jeokodlama)
// -------------------------------------------------------------
router.get('/nobetci-eczane/reverse-geo', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ success: false, error: 'Geçersiz koordinat' });
  }

  try {
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const response = await fetch(geoUrl, {
      headers: {
        'User-Agent': 'VibeCodedApps/1.0 (melihkarasu.com)',
        'Accept-Language': 'tr'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const provName = (addr.province || addr.state || addr.city || '').replace(' İli', '').trim();
      const districtName = (addr.town || addr.county || addr.city_district || addr.suburb || addr.district || '').replace(' İlçesi', '').replace(' Belediyesi', '').trim();

      return res.json({
        success: true,
        province: provName,
        district: districtName,
        displayName: data.display_name
      });
    }
  } catch (err) {
    console.warn('[Reverse-Geo Error]:', err.message);
  }

  return res.json({ success: false, error: 'Konum çözümlenemedi' });
});

// -------------------------------------------------------------
// 3. Nöbetçi Eczaneler (/api/nobetci-eczane)
// -------------------------------------------------------------
router.get('/nobetci-eczane', async (req, res) => {
  const todayStr = getTurkeyDateStr();
  const city = (req.query.city || 'ankara').toLowerCase().trim();
  const district = (req.query.district || '').toLowerCase().trim();
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);
  const hasUserLoc = !isNaN(userLat) && !isNaN(userLng);

  // Günde 1 kez çekim kuralı: Şehir bazında günlük tek bir önbellek dosyası tutulur
  const cacheKey = `eczane_duty_${city}_${todayStr}`;
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);

  const fetchDutyPharmacies = async () => {
    // İl genelinde tüm eczaneler tek seferde çekilir (district filtresi sorguya eklenmez, yerelde filtrelenir)
    const url = `${ECZANE_BASE_URL}/pharmacies/on-duty?city=${encodeURIComponent(city)}`;

    const response = await fetch(url, {
      headers: {
        'X-API-Key': ECZANE_API_KEY,
        'User-Agent': 'VibeCodedApps/1.0'
      }
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`EczaneAPI HTTP ${response.status}: ${errText}`);
    }

    const json = await response.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error('Nöbetçi eczane verisi formatı geçersiz');
    }

    // Bugünün nöbetçi listesini seç (day === 'Bugün' veya date === todayStr veya data[1] veya data[0])
    let todayData = json.data.find(d => d.day === 'Bugün' || d.date === todayStr);
    if (!todayData && json.data.length > 0) {
      todayData = json.data.find(d => d.date?.startsWith(todayStr)) || json.data[1] || json.data[0];
    }

    return todayData ? (todayData.pharmacies || []) : [];
  };

  const processAndSend = (rawPharmacies, isCached = false) => {
    const cityFallback = CITY_COORDINATES[city] || { lat: 39.925054, lng: 32.836944 };

    // Eğer ilçe seçilmişse bellek içinde filtrele
    let filteredPharmacies = rawPharmacies;
    if (district) {
      filteredPharmacies = rawPharmacies.filter(p => {
        const dSlug = (p.district?.slug || '').toLowerCase();
        const dName = (p.district?.name || '').toLowerCase();
        return dSlug === district || dName === district;
      });
      // İlçe filtresinde hiç sonuç çıkmazsa kullanıcıya boş dönmemek için tüm il listesine fallback yap
      if (filteredPharmacies.length === 0) {
        filteredPharmacies = rawPharmacies;
      }
    }

    const mapped = filteredPharmacies.map((p, idx) => {
      let lat = p.location?.latitude ? parseFloat(p.location.latitude) : null;
      let lng = p.location?.longitude ? parseFloat(p.location.longitude) : null;

      // Konum null ise veya 0 ise merkez koordinatından ufak bir dağılım oluştur
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        lat = cityFallback.lat + (Math.sin(idx + 1) * 0.008);
        lng = cityFallback.lng + (Math.cos(idx + 1) * 0.008);
      }

      let distanceMeters = null;
      if (hasUserLoc) {
        distanceMeters = calculateHaversineDistance(userLat, userLng, lat, lng);
      }

      const pDistrict = p.district?.name || (district ? (district.charAt(0).toUpperCase() + district.slice(1)) : 'Merkez');
      const pCity = p.city?.name || (city.charAt(0).toUpperCase() + city.slice(1));

      // 🕒 08:00 - Ertesi gün 08:00 bilgisi apiden gelmiyorsa kesinlikle üretilmez, null bırakılır
      let cleanNotes = null;
      if (p.notes && typeof p.notes === 'string' && !p.notes.includes('08:00')) {
        cleanNotes = p.notes.trim();
      } else if (p.duty?.notes && typeof p.duty.notes === 'string' && !p.duty.notes.includes('08:00')) {
        cleanNotes = p.duty.notes.trim();
      } else if (p.duty?.description && typeof p.duty.description === 'string' && !p.duty.description.includes('08:00')) {
        cleanNotes = p.duty.description.trim();
      } else if (p.duty?.isVerified) {
        cleanNotes = 'Resmi Doğrulanmış Nöbet';
      }

      return {
        id: p.id || String(idx + 1),
        name: p.name || 'Eczane',
        address: p.address || 'Adres bilgisi için telefonla arayınız',
        phone: p.phone || '',
        phone2: p.phone2 || null,
        city: pCity,
        district: pDistrict,
        notes: cleanNotes,
        date: todayStr,
        latitude: lat,
        longitude: lng,
        distanceMeters: distanceMeters
      };
    });

    if (hasUserLoc) {
      mapped.sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
    }

    const availableDistricts = [...new Set(rawPharmacies.map(m => m.district?.name).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));
    const nearest = mapped.slice(0, 5);

    return res.json({
      success: true,
      dutyDate: todayStr,
      city: city,
      district: district,
      count: mapped.length,
      userLocation: hasUserLoc ? { lat: userLat, lng: userLng } : null,
      districts: availableDistricts,
      nearest: nearest,
      pharmacies: mapped,
      cached: isCached,
      source: 'EczaneAPI.com (Türkiye Geneli 81 İl ve İlçe Canlı Nöbetçi Listesi)'
    });
  };

  // 1. Önbellekte varsa (bugün çekilmişse) EczaneAPI'ye istek ATMADAN doğrudan önbellekten dön
  if (fs.existsSync(cacheFile)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      if (Array.isArray(cached) && cached.length > 0) {
        return processAndSend(cached, true);
      }
    } catch(e) {}
  }

  // 2. Halihazırda bu şehir için devam eden bir API isteği varsa mükerrer istek atmayıp onu bekle
  if (pendingDutyFetches.has(cacheKey)) {
    try {
      const rawList = await pendingDutyFetches.get(cacheKey);
      return processAndSend(rawList, true);
    } catch (err) {
      // devam et ve fallback dene
    }
  }

  // 3. Bugünün ilk isteği: EczaneAPI'den il genelini çek ve diske kaydet
  const fetchTask = (async () => {
    const rawList = await fetchDutyPharmacies();
    try {
      fs.writeFileSync(cacheFile, JSON.stringify(rawList, null, 2), 'utf8');
    } catch(e) {}
    return rawList;
  })();

  pendingDutyFetches.set(cacheKey, fetchTask);

  try {
    const rawList = await fetchTask;
    pendingDutyFetches.delete(cacheKey);
    return processAndSend(rawList, false);
  } catch (err) {
    pendingDutyFetches.delete(cacheKey);
    console.error(`[Eczane API Hatası - ${todayStr}]:`, err.message);

    // Rate limite takılma veya geçici API hatası durumunda: Bu şehir için en güncel önceki önbellek dosyasını bul ve dön
    try {
      const prevFiles = fs.readdirSync(CACHE_DIR)
        .filter(f => f.startsWith(`eczane_duty_${city}_`))
        .sort().reverse();

      if (prevFiles.length > 0) {
        const fallbackData = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, prevFiles[0]), 'utf8'));
        if (Array.isArray(fallbackData) && fallbackData.length > 0) {
          console.warn(`[EczaneAPI] Rate limit/hata nedeniyle ${city} için önceki önbellek (${prevFiles[0]}) kullanıldı.`);
          return processAndSend(fallbackData, true);
        }
      }
    } catch (fallbackErr) {
      console.warn('[EczaneAPI] Fallback error:', fallbackErr.message);
    }

    return res.status(503).json({
      success: false,
      dutyDate: todayStr,
      error: `Nöbetçi eczane listesi şu anda alınamadı (${err.message}). Lütfen birazdan tekrar deneyiniz veya acil durumlar için Alo 184 / 112 ile iletişime geçiniz.`
    });
  }
});

module.exports = router;
