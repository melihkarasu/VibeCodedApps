const express = require('express');
const router = express.Router();
const https = require('https');
const fs = require('fs');
const path = require('path');
const { isPrivateAddress } = require('./utils');
const { getCachedJson, CACHE_DIR } = require('./cache');

// =============================================================
// 36. İzmir Büyükşehir Belediyesi Nöbetçi Eczaneler API
// Kural: Nöbetçi eczane verileri YALNIZCA o gün geçerlidir.
// Dünün veya geçmiş günlerin nöbetçi listeleri asla sunulmaz.
// =============================================================

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
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

// Türkiye (Europe/Istanbul) saat dilimine göre bugünün takvim tarihi (YYYY-MM-DD)
function getTurkeyDateStr() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date());
}

// Geçmiş günlere ait tüm eski nöbetçi eczane önbellek dosyalarını diskten anında temizle
function purgePastEczaneCache(currentTodayStr) {
  try {
    if (!fs.existsSync(CACHE_DIR)) return;
    const files = fs.readdirSync(CACHE_DIR);
    for (const file of files) {
      if (file.startsWith('nobetci_eczane_izmir_') && file.endsWith('.json')) {
        if (!file.includes(currentTodayStr)) {
          try {
            fs.unlinkSync(path.join(CACHE_DIR, file));
            console.log(`[Eczane] Geçmiş güne ait nöbetçi listesi diskten silindi: ${file}`);
          } catch(e) {}
        }
      }
    }
  } catch(e) {}
}

router.get('/nobetci-eczane', async (req, res) => {
  const todayStr = getTurkeyDateStr();
  
  // Dünün ve eski günlerin nöbetçi dosyalarını diskten derhal süpür
  purgePastEczaneCache(todayStr);

  const fetchFromSource = () => {
    return new Promise((resolve, reject) => {
      const request = https.get('https://openapi.izmir.bel.tr/api/ibb/nobetcieczaneler', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VibeCodedApps/1.0)' },
        timeout: 9000
      }, (response) => {
        if (response.statusCode !== 200) {
          return reject(new Error('İzmir BB API HTTP ' + response.statusCode));
        }
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const list = JSON.parse(data);
            if (!Array.isArray(list) || list.length === 0) {
              return reject(new Error('Bugüne ait nöbetçi eczane listesi henüz yayınlanmadı.'));
            }
            resolve(list);
          } catch (e) {
            reject(e);
          }
        });
      });
      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('İzmir BB API Zaman Aşımı'));
      });
    });
  };

  const processResponse = (rawList) => {
    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);
    const hasUserLoc = !isNaN(userLat) && !isNaN(userLng);

    const mapped = rawList.map((item, idx) => {
      const lat = parseFloat(item.LokasyonX);
      const lng = parseFloat(item.LokasyonY);
      let distanceMeters = null;
      if (hasUserLoc && !isNaN(lat) && !isNaN(lng)) {
        distanceMeters = calculateHaversineDistance(userLat, userLng, lat, lng);
      }
      return {
        id: item.EczaneId && item.EczaneId > 0 ? item.EczaneId : (idx + 1),
        name: (item.Adi || '').trim(),
        address: (item.Adres || '').trim(),
        phone: (item.Telefon || '').trim(),
        district: (item.Bolge || '').trim(),
        notes: (item.BolgeAciklama || '').trim(),
        date: item.Tarih || todayStr,
        latitude: lat,
        longitude: lng,
        distanceMeters: distanceMeters
      };
    }).filter(e => !isNaN(e.latitude) && !isNaN(e.longitude));

    if (hasUserLoc) {
      mapped.sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
    }

    const districts = [...new Set(mapped.map(e => e.district).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));

    return res.json({
      success: true,
      dutyDate: todayStr,
      count: mapped.length,
      userLocation: hasUserLoc ? { lat: userLat, lng: userLng } : null,
      districts: districts,
      nearest: hasUserLoc ? mapped.slice(0, 5) : [],
      pharmacies: mapped,
      source: 'İzmir BB Açık Veri Portalı (Yalnızca Bugün Geçerli Resmi Nöbetçi Listesi)'
    });
  };

  // YALNIZCA BUGÜNE AİT VERİYİ ÖNBELLEKLE:
  // Eğer bugünün verisi diskte varsa sunulur. Eğer yoksa dış servisten çekilir.
  // Dış servisten yanıt alınamazsa KESİNLİKLE dünün verisi sunulmaz; kullanıcıya açıkça bildirilir.
  const cacheKey = `nobetci_eczane_izmir_${todayStr}`;
  const filePath = path.join(CACHE_DIR, `${cacheKey}.json`);

  // 1. Bugünün dosyası diskte zaten var mı?
  if (fs.existsSync(filePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(cached) && cached.length > 0) {
        return processResponse(cached);
      }
    } catch(e) {}
  }

  // 2. Bugünün verisini dış kaynaktan çek
  try {
    const rawList = await fetchFromSource();
    try {
      fs.writeFileSync(filePath, JSON.stringify(rawList, null, 2), 'utf8');
    } catch(e) {}
    return processResponse(rawList);
  } catch (err) {
    console.error(`[Eczane API Hatası - ${todayStr}]:`, err.message);
    
    // Kesin kural: Dünün veya geçmiş günlerin nöbetçi listesi ASLA sunulmaz!
    return res.status(503).json({
      success: false,
      dutyDate: todayStr,
      isDutyExpired: true,
      error: 'İzmir Büyükşehir Belediyesi Nöbetçi Eczane servisinden bugüne ait canlı nöbetçi eczane listesi şu anda alınamadı. Nöbetçi eczaneler günlük olarak değiştiğinden, hastalarımızın kapalı eczanelere yönlendirilmesini önlemek adına dünün veya geçmiş günlerin listeleri kesinlikle sunulmamaktadır. Lütfen kısa bir süre sonra tekrar deneyiniz veya acil durumlar için Alo 184 (Sağlık Danışma) / 112 ile iletişime geçiniz.'
    });
  }
});

module.exports = router;
