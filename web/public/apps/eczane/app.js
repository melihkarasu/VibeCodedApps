// Nöbetçi Eczaneler (Türkiye Geneli) - Client Application
// EczaneAPI.com (81 İl & İlçe) & OpenStreetMap (Leaflet) Entegrasyonu

let eczaneMap = null;
let userMarker = null;
let userAccuracyCircle = null;
let pharmacyLayerGroup = null;
let allPharmacies = [];
let allCities = [];
let currentDistricts = [];

// Varsayılan Konum: Anıtkabir / Çankaya / Ankara (39.925054, 32.836944)
const DEFAULT_LOCATION = {
  lat: 39.925054,
  lng: 32.836944,
  name: 'Anıtkabir, Çankaya / Ankara',
  city: 'ankara',
  cityName: 'Ankara',
  district: 'cankaya',
  districtName: 'Çankaya',
  isGPS: false
};

let currentUserLocation = { ...DEFAULT_LOCATION };
let selectedCitySlug = 'ankara';
let selectedDistrictSlug = ''; // Varsayılan olarak tüm il genelinde en yakınlar taranır

// 81 İl Merkez Koordinatları (Matematiksel yedek mesafe hesaplayıcı)
const CITY_CENTERS = [
  { slug: 'adana', name: 'Adana', lat: 37.0000, lng: 35.3213 },
  { slug: 'adiyaman', name: 'Adıyaman', lat: 37.7648, lng: 38.2786 },
  { slug: 'afyonkarahisar', name: 'Afyonkarahisar', lat: 38.7507, lng: 30.5567 },
  { slug: 'agri', name: 'Ağrı', lat: 39.7191, lng: 43.0503 },
  { slug: 'amasya', name: 'Amasya', lat: 40.6500, lng: 35.8333 },
  { slug: 'ankara', name: 'Ankara', lat: 39.9334, lng: 32.8597 },
  { slug: 'antalya', name: 'Antalya', lat: 36.8969, lng: 30.7133 },
  { slug: 'artvin', name: 'Artvin', lat: 41.1828, lng: 41.8183 },
  { slug: 'aydin', name: 'Aydın', lat: 37.8560, lng: 27.8416 },
  { slug: 'balikesir', name: 'Balıkesir', lat: 39.6484, lng: 27.8826 },
  { slug: 'bilecik', name: 'Bilecik', lat: 40.1451, lng: 29.9799 },
  { slug: 'bingol', name: 'Bingöl', lat: 38.8847, lng: 40.4939 },
  { slug: 'bitlis', name: 'Bitlis', lat: 38.4006, lng: 42.1095 },
  { slug: 'bolu', name: 'Bolu', lat: 40.7350, lng: 31.6061 },
  { slug: 'burdur', name: 'Burdur', lat: 37.7203, lng: 30.2908 },
  { slug: 'bursa', name: 'Bursa', lat: 40.1885, lng: 29.0610 },
  { slug: 'canakkale', name: 'Çanakkale', lat: 40.1553, lng: 26.4142 },
  { slug: 'cankiri', name: 'Çankırı', lat: 40.6013, lng: 33.6134 },
  { slug: 'corum', name: 'Çorum', lat: 40.5506, lng: 34.9556 },
  { slug: 'denizli', name: 'Denizli', lat: 37.7765, lng: 29.0864 },
  { slug: 'diyarbakir', name: 'Diyarbakır', lat: 37.9144, lng: 40.2306 },
  { slug: 'edirne', name: 'Edirne', lat: 41.6768, lng: 26.5603 },
  { slug: 'elazig', name: 'Elazığ', lat: 38.6810, lng: 39.2264 },
  { slug: 'erzincan', name: 'Erzincan', lat: 39.7500, lng: 39.5000 },
  { slug: 'erzurum', name: 'Erzurum', lat: 39.9000, lng: 41.2700 },
  { slug: 'eskisehir', name: 'Eskişehir', lat: 39.7767, lng: 30.5206 },
  { slug: 'gaziantep', name: 'Gaziantep', lat: 37.0662, lng: 37.3833 },
  { slug: 'giresun', name: 'Giresun', lat: 40.9128, lng: 38.3895 },
  { slug: 'gumushane', name: 'Gümüşhane', lat: 40.4600, lng: 39.4700 },
  { slug: 'hakkari', name: 'Hakkâri', lat: 37.5800, lng: 43.7300 },
  { slug: 'hatay', name: 'Hatay', lat: 36.4018, lng: 36.3498 },
  { slug: 'isparta', name: 'Isparta', lat: 37.7648, lng: 30.5566 },
  { slug: 'mersin', name: 'Mersin', lat: 36.8121, lng: 34.6415 },
  { slug: 'istanbul', name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
  { slug: 'izmir', name: 'İzmir', lat: 38.4189, lng: 27.1287 },
  { slug: 'kars', name: 'Kars', lat: 40.6167, lng: 43.1000 },
  { slug: 'kastamonu', name: 'Kastamonu', lat: 41.3887, lng: 33.7827 },
  { slug: 'kayseri', name: 'Kayseri', lat: 38.7312, lng: 35.4787 },
  { slug: 'kirklareli', name: 'Kırklareli', lat: 41.7333, lng: 27.2167 },
  { slug: 'kirsehir', name: 'Kırşehir', lat: 39.1425, lng: 34.1709 },
  { slug: 'kocaeli', name: 'Kocaeli', lat: 40.8533, lng: 29.8815 },
  { slug: 'konya', name: 'Konya', lat: 37.8746, lng: 32.4932 },
  { slug: 'kutahya', name: 'Kütahya', lat: 39.4167, lng: 29.9833 },
  { slug: 'malatya', name: 'Malatya', lat: 38.3552, lng: 38.3095 },
  { slug: 'manisa', name: 'Manisa', lat: 38.6191, lng: 27.4289 },
  { slug: 'kahramanmaras', name: 'Kahramanmaraş', lat: 37.5858, lng: 36.9371 },
  { slug: 'mardin', name: 'Mardin', lat: 37.3212, lng: 40.7245 },
  { slug: 'mugla', name: 'Muğla', lat: 37.2153, lng: 28.3636 },
  { slug: 'mus', name: 'Muş', lat: 38.9462, lng: 41.7539 },
  { slug: 'nevsehir', name: 'Nevşehir', lat: 38.6939, lng: 34.6857 },
  { slug: 'nigde', name: 'Niğde', lat: 37.9667, lng: 34.6833 },
  { slug: 'ordu', name: 'Ordu', lat: 40.9839, lng: 37.8764 },
  { slug: 'rize', name: 'Rize', lat: 41.0201, lng: 40.5234 },
  { slug: 'sakarya', name: 'Sakarya', lat: 40.7569, lng: 30.3783 },
  { slug: 'samsun', name: 'Samsun', lat: 41.2867, lng: 36.3300 },
  { slug: 'siirt', name: 'Siirt', lat: 37.9333, lng: 41.9500 },
  { slug: 'sinop', name: 'Sinop', lat: 42.0231, lng: 35.1531 },
  { slug: 'sivas', name: 'Sivas', lat: 39.7477, lng: 37.0179 },
  { slug: 'tekirdag', name: 'Tekirdağ', lat: 40.9833, lng: 27.5167 },
  { slug: 'tokat', name: 'Tokat', lat: 40.3167, lng: 36.5500 },
  { slug: 'trabzon', name: 'Trabzon', lat: 41.0027, lng: 39.7168 },
  { slug: 'tunceli', name: 'Tunceli', lat: 39.1079, lng: 39.5401 },
  { slug: 'sanliurfa', name: 'Şanlıurfa', lat: 37.1674, lng: 38.7955 },
  { slug: 'usak', name: 'Uşak', lat: 38.6823, lng: 29.4082 },
  { slug: 'van', name: 'Van', lat: 38.4891, lng: 43.4089 },
  { slug: 'yozgat', name: 'Yozgat', lat: 39.8181, lng: 34.8147 },
  { slug: 'zonguldak', name: 'Zonguldak', lat: 41.4564, lng: 31.7987 },
  { slug: 'aksaray', name: 'Aksaray', lat: 38.3687, lng: 34.0370 },
  { slug: 'bayburt', name: 'Bayburt', lat: 40.2552, lng: 40.2249 },
  { slug: 'karaman', name: 'Karaman', lat: 37.1759, lng: 33.2287 },
  { slug: 'kirikkale', name: 'Kırıkkale', lat: 39.8468, lng: 33.5153 },
  { slug: 'batman', name: 'Batman', lat: 37.8812, lng: 41.1294 },
  { slug: 'sirnak', name: 'Şırnak', lat: 37.5164, lng: 42.4611 },
  { slug: 'bartin', name: 'Bartın', lat: 41.6344, lng: 32.3375 },
  { slug: 'ardahan', name: 'Ardahan', lat: 41.1105, lng: 42.7022 },
  { slug: 'igdir', name: 'Iğdır', lat: 39.9196, lng: 44.0454 },
  { slug: 'yalova', name: 'Yalova', lat: 40.6550, lng: 29.2769 },
  { slug: 'karabuk', name: 'Karabük', lat: 41.2061, lng: 32.6204 },
  { slug: 'kilis', name: 'Kilis', lat: 36.7184, lng: 37.1212 },
  { slug: 'osmaniye', name: 'Osmaniye', lat: 37.0742, lng: 36.2472 },
  { slug: 'duzce', name: 'Düzce', lat: 40.8438, lng: 31.1565 }
];

// Haversine Formülü ile İki Koordinat Arası Metre Hesabı
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Koordinata en yakın ili ve ilçeyi bul
async function detectCityAndDistrict(lat, lng) {
  // 1. Önce sunucumuz üzerinden güvenilir ters jeokodlama yap (CORS / Adblocker engeline takılmaz)
  try {
    const res = await fetch(`/api/nobetci-eczane/reverse-geo?lat=${lat}&lng=${lng}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.province) {
        const provName = data.province.trim();
        const distName = (data.district || '').trim();

        const matchedCity = (allCities.length > 0 ? allCities : CITY_CENTERS).find(c => 
          c.name.localeCompare(provName, 'tr', { sensitivity: 'base' }) === 0 ||
          provName.toLocaleLowerCase('tr').includes(c.name.toLocaleLowerCase('tr')) ||
          c.name.toLocaleLowerCase('tr').includes(provName.toLocaleLowerCase('tr'))
        );

        if (matchedCity) {
          return {
            citySlug: matchedCity.slug,
            cityName: matchedCity.name,
            districtName: distName
          };
        }
      }
    }
  } catch (e) {
    console.warn('Backend reverse-geo hatası:', e);
  }

  // 2. Fallback: 81 il merkezine göre en yakın il merkezini hesapla
  let nearestCity = CITY_CENTERS[0];
  let minDistance = Infinity;

  CITY_CENTERS.forEach(city => {
    const dist = calculateDistanceMeters(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = city;
    }
  });

  return {
    citySlug: nearestCity.slug,
    cityName: nearestCity.name,
    districtName: ''
  };
}

// Mesafe Formatlama (350 m veya 2.4 km)
function formatDistance(meters) {
  if (meters === null || meters === undefined || isNaN(meters)) return '--';
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// Haritayı Başlat
function initMap() {
  if (eczaneMap) return;

  eczaneMap = L.map('eczane-map', {
    center: [currentUserLocation.lat, currentUserLocation.lng],
    zoom: 14,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | EczaneAPI',
    maxZoom: 19
  }).addTo(eczaneMap);

  pharmacyLayerGroup = L.layerGroup().addTo(eczaneMap);

  eczaneMap.on('click', async function(e) {
    const detected = await detectCityAndDistrict(e.latlng.lat, e.latlng.lng);
    await applyDetectedLocation(e.latlng.lat, e.latlng.lng, detected, 'Haritada Seçilen Nokta', false);
    if (typeof showToast === 'function') {
      showToast(`Konum seçildi: ${detected.cityName}`, 'info');
    }
  });

  updateUserMapMarker();
}

// Kullanıcı Markerını Haritada Güncelle
function updateUserMapMarker() {
  if (!eczaneMap) return;

  const userIcon = L.divIcon({
    className: 'user-pulse-marker',
    html: '<div class="pulse-ring"></div><div class="core-dot"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  if (userMarker) {
    userMarker.setLatLng([currentUserLocation.lat, currentUserLocation.lng]);
  } else {
    userMarker = L.marker([currentUserLocation.lat, currentUserLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000
    }).addTo(eczaneMap);
  }

  userMarker.bindPopup(`
    <div style="font-family: inherit; font-size: 13px;">
      <div style="font-weight: 700; color: #1f1f1f; margin-bottom: 2px;">🔵 Referans Konumunuz</div>
      <div style="color: #4a4a4a; font-size: 12px;">${escapeHtml(currentUserLocation.name)}</div>
      <div style="color: #8a8a8a; font-size: 11px; margin-top: 4px;">En yakın nöbetçi eczaneler bu merkeze göre hesaplanır.</div>
    </div>
  `);
}

// Tespit edilen konumu uygula ve eczaneleri o şehre göre çek
async function applyDetectedLocation(lat, lng, detected, labelName, isGPS) {
  currentUserLocation.lat = lat;
  currentUserLocation.lng = lng;
  currentUserLocation.name = labelName || `${detected.cityName} (${isGPS ? 'Canlı GPS' : 'Referans'})`;
  currentUserLocation.city = detected.citySlug;
  currentUserLocation.cityName = detected.cityName;
  currentUserLocation.isGPS = isGPS;

  // 1. Şehri güncelle
  selectedCitySlug = detected.citySlug;
  const citySelect = document.getElementById('select-city');
  if (citySelect) {
    citySelect.value = selectedCitySlug;
  }

  // 2. KRİTİK: İlçe seçimini mutlaka sıfırla!
  // GPS açıkken kullanıcıya il genelindeki en yakın eczaneler mesafeye göre listelenir.
  selectedDistrictSlug = '';

  // 3. İlçeleri arka planda yükle
  await loadDistricts(selectedCitySlug);

  // İlçe dropdown'ını "Tüm İlçeler" (İl Geneli) yap
  const districtSelect = document.getElementById('select-district');
  if (districtSelect) {
    districtSelect.value = '';
  }

  // Arayüz etiketlerini güncelle
  const locLabel = document.getElementById('stat-loc-label');
  const locSource = document.getElementById('stat-loc-source');
  if (locLabel) locLabel.innerText = `${detected.cityName} ${detected.districtName ? ('/ ' + detected.districtName) : ''}`;
  if (locSource) locSource.innerText = isGPS ? 'GPS Canlı Uydu Konumu' : 'Seçili Nokta';

  // İzin uyarı çubuğunu gizle
  const banner = document.getElementById('location-permission-banner');
  if (banner) banner.classList.add('hidden');

  updateUserMapMarker();

  if (eczaneMap) {
    eczaneMap.setView([lat, lng], 14, { animate: true });
  }

  // 4. Eczaneleri il genelinde (district='') koordinat sıralı olarak çek (otomatik uzaklaşmayı önle)
  await fetchDutyPharmacies(false);

  // 5. En yakın eczaneden kesin ilçe bilgisini doğrula
  if (allPharmacies && allPharmacies.length > 0) {
    const nearestPharmacy = allPharmacies[0];
    const resolvedDistrict = detected.districtName || nearestPharmacy.district;
    if (resolvedDistrict && locLabel) {
      locLabel.innerText = `${detected.cityName} / ${resolvedDistrict}`;
    }
  }
}

// "Konumum" Butonu Tıklama İşleyicisi
function handleMyLocationClick() {
  requestUserLocation(false);
}

// GPS Konumunu İste
function requestUserLocation(silent = false) {
  const btn = document.getElementById('btn-get-gps');
  const bannerBtn = document.getElementById('btn-banner-gps');
  const originalHtml = '<i class="fa-solid fa-location-crosshairs text-base"></i><span>Konumum</span>';

  if (btn && !silent) {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Alınıyor...</span>';
    btn.disabled = true;
  }
  if (bannerBtn) {
    bannerBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Konum Alınıyor...';
    bannerBtn.disabled = true;
  }

  if (!navigator.geolocation) {
    if (btn && !silent) {
      btn.innerHTML = originalHtml;
      btn.disabled = false;
    }
    if (bannerBtn) {
      bannerBtn.innerHTML = 'Konumumu Bul';
      bannerBtn.disabled = false;
    }
    showLocationPermissionBanner('Tarayıcınız konum servisini desteklemiyor. Listeden il/ilçe seçebilirsiniz.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async function(pos) {
      if (btn && !silent) {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
      if (bannerBtn) {
        bannerBtn.innerHTML = 'Konumumu Bul';
        bannerBtn.disabled = false;
      }

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      if (userAccuracyCircle && eczaneMap) {
        eczaneMap.removeLayer(userAccuracyCircle);
      }
      if (pos.coords.accuracy && pos.coords.accuracy < 4000 && eczaneMap) {
        userAccuracyCircle = L.circle([lat, lng], {
          radius: pos.coords.accuracy,
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          weight: 1
        }).addTo(eczaneMap);
      }

      // Şehir ve ilçeyi tespit et
      const detected = await detectCityAndDistrict(lat, lng);
      await applyDetectedLocation(lat, lng, detected, 'Mevcut Konumunuz', true);

      if (typeof showToast === 'function') {
        showToast(`📍 Konumunuz saptandı: ${detected.cityName}`, 'success');
      }
    },
    function(err) {
      console.warn('GPS Geolocation Uyarısı:', err);
      if (btn && !silent) {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
      if (bannerBtn) {
        bannerBtn.innerHTML = 'Konumumu Bul';
        bannerBtn.disabled = false;
      }

      if (err.code === 1) { // PERMISSION_DENIED
        showLocationPermissionBanner('Konum izni verilmedi. En yakın nöbetçileri görmek için izin verebilir veya yukarıdan ilinizi seçebilirsiniz.');
      } else {
        showLocationPermissionBanner('Cihaz konumuna ulaşılamadı. Lütfen GPS bağlantınızı kontrol edin veya yukarıdan il seçin.');
      }

      if (!silent && typeof showToast === 'function') {
        showToast('Konum alınamadı. Lütfen listeden ilinizi seçin.', 'warning');
      }
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
  );
}

// Konum İzin Çubuğu Göster
function showLocationPermissionBanner(message) {
  const banner = document.getElementById('location-permission-banner');
  const msgEl = document.getElementById('location-banner-text');
  if (banner) {
    if (msgEl && message) msgEl.innerText = message;
    banner.classList.remove('hidden');
  }
}

// -------------------------------------------------------------
// İl ve İlçe Yükleme Fonksiyonları
// -------------------------------------------------------------
async function loadCities() {
  const citySelect = document.getElementById('select-city');
  if (!citySelect) return;

  try {
    const res = await fetch('/api/nobetci-eczane/cities');
    const data = await res.json();

    if (data.success && Array.isArray(data.cities)) {
      allCities = data.cities;
      citySelect.innerHTML = allCities.map(c => 
        `<option value="${c.slug}" ${c.slug === selectedCitySlug ? 'selected' : ''}>📍 ${c.name} (${c.plateCode})</option>`
      ).join('');

      await loadDistricts(selectedCitySlug);
    }
  } catch(e) {
    console.error('İller yüklenemedi:', e);
  }
}

async function loadDistricts(citySlug) {
  const districtSelect = document.getElementById('select-district');
  if (!districtSelect) return;

  districtSelect.innerHTML = '<option value="">İlçeler Yükleniyor...</option>';

  try {
    const res = await fetch(`/api/nobetci-eczane/districts?city=${encodeURIComponent(citySlug)}`);
    const data = await res.json();

    if (data.success && Array.isArray(data.districts)) {
      currentDistricts = data.districts;
      districtSelect.innerHTML = '<option value="">Tüm İlçeler</option>' +
        currentDistricts.map(d => 
          `<option value="${d.slug}" ${d.slug === selectedDistrictSlug ? 'selected' : ''}>${d.name}</option>`
        ).join('');

      if (selectedDistrictSlug && currentDistricts.some(d => d.slug === selectedDistrictSlug)) {
        districtSelect.value = selectedDistrictSlug;
      } else {
        selectedDistrictSlug = '';
        districtSelect.value = '';
      }
    }
  } catch(e) {
    console.error('İlçeler yüklenemedi:', e);
    districtSelect.innerHTML = '<option value="">Tüm İlçeler</option>';
  }
}

async function onCityChange() {
  const citySelect = document.getElementById('select-city');
  selectedCitySlug = citySelect.value;
  selectedDistrictSlug = ''; // İlçeyi sıfırla

  // Şehrin merkez koordinatına haritayı kaydır
  const center = CITY_CENTERS.find(c => c.slug === selectedCitySlug);
  if (center) {
    currentUserLocation.lat = center.lat;
    currentUserLocation.lng = center.lng;
    currentUserLocation.name = `${center.name} İl Merkezi`;
    currentUserLocation.isGPS = false;
    updateUserMapMarker();
    if (eczaneMap) eczaneMap.setView([center.lat, center.lng], 13);
  }

  await loadDistricts(selectedCitySlug);
  fetchDutyPharmacies(false);
}

function onDistrictChange() {
  const districtSelect = document.getElementById('select-district');
  selectedDistrictSlug = districtSelect.value;
  fetchDutyPharmacies(false);
}

function onSearchInput() {
  refreshPharmacyData();
}

// -------------------------------------------------------------
// Nöbetçi Eczaneleri Çekme
// -------------------------------------------------------------
async function fetchDutyPharmacies(autoFit = false) {
  const statusEl = document.getElementById('eczane-status-label');
  const cityLabelEl = document.getElementById('stat-duty-city-label');
  if (statusEl) statusEl.innerText = 'Eczaneler Güncelleniyor...';

  const cityName = document.getElementById('select-city')?.selectedOptions[0]?.text || selectedCitySlug;
  if (cityLabelEl) cityLabelEl.innerText = `${cityName} Genelinde`;

  try {
    let url = `/api/nobetci-eczane?city=${encodeURIComponent(selectedCitySlug)}`;
    if (selectedDistrictSlug) {
      url += `&district=${encodeURIComponent(selectedDistrictSlug)}`;
    }
    if (currentUserLocation.lat && currentUserLocation.lng) {
      url += `&lat=${currentUserLocation.lat}&lng=${currentUserLocation.lng}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || 'Nöbetçi eczaneler alınamadı');
    }

    allPharmacies = data.pharmacies || [];

    if (data.dutyDate) {
      const d = new Date(data.dutyDate);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const dateStr = d.toLocaleDateString('tr-TR', options);
      const dateEl = document.getElementById('stat-duty-date');
      if (dateEl) dateEl.innerText = dateStr !== 'Invalid Date' ? dateStr : 'Bugün';
    }

    const totalEl = document.getElementById('stat-total-pharmacies');
    if (totalEl) totalEl.innerText = allPharmacies.length;
    if (statusEl) statusEl.innerText = 'Türkiye Geneli Canlı Nöbet';

    refreshPharmacyData();

    if (autoFit && allPharmacies.length > 0 && eczaneMap) {
      setTimeout(() => fitAllPharmacies(), 300);
    }
  } catch (err) {
    console.error('Nöbetçi eczaneler alınırken hata:', err);
    if (statusEl) statusEl.innerText = '● Veri Alınamadı';

    if (pharmacyLayerGroup) pharmacyLayerGroup.clearLayers();
    allPharmacies = [];

    const totalEl = document.getElementById('stat-total-pharmacies');
    if (totalEl) totalEl.innerText = '0';
    const nearestDistEl = document.getElementById('stat-nearest-dist');
    if (nearestDistEl) nearestDistEl.innerText = '--';
    const nearestNameEl = document.getElementById('stat-nearest-name');
    if (nearestNameEl) nearestNameEl.innerText = 'Bulunamadı';

    const errorBanner = `
      <div class="col-span-full p-6 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-3">
        <div class="flex items-center gap-2">
          <span class="text-2xl">⚠️</span>
          <h3 class="font-bold text-base text-amber-900">Bu Bölge İçin Nöbetçi Listesi Alınamadı</h3>
        </div>
        <p class="text-xs leading-relaxed text-amber-900">
          Seçilen il veya ilçe için nöbetçi eczane kayıtları henüz yayınlanmamış veya API kotasında anlık bir gecikme yaşanıyor olabilir.
        </p>
        <div class="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <button type="button" onclick="fetchDutyPharmacies()" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs">
            <i class="fa-solid fa-arrows-rotate"></i>
            <span>Yeniden Dene</span>
          </button>
          <a href="tel:184" class="px-3 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100 transition flex items-center gap-1 shadow-2xs">
            <i class="fa-solid fa-phone"></i>
            <span>Alo 184 Sağlık Danışma</span>
          </a>
          <a href="tel:112" class="px-3 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition flex items-center gap-1 shadow-xs">
            <i class="fa-solid fa-truck-medical"></i>
            <span>112 Acil Yardım</span>
          </a>
        </div>
      </div>
    `;

    const listEl = document.getElementById('nearest-pharmacies-list');
    if (listEl) listEl.innerHTML = errorBanner;

    const boxEl = document.getElementById('all-pharmacies-box');
    if (boxEl) boxEl.innerHTML = errorBanner;
  }
}

// -------------------------------------------------------------
// Filtreleme, Sıralama ve Render
// -------------------------------------------------------------
function refreshPharmacyData() {
  if (!allPharmacies) return;

  const searchFilter = (document.getElementById('search-input')?.value || '').trim().toLowerCase();

  const processed = allPharmacies.map(pharmacy => {
    let distance = null;
    if (currentUserLocation.lat && currentUserLocation.lng && pharmacy.latitude && pharmacy.longitude) {
      distance = calculateDistanceMeters(
        currentUserLocation.lat,
        currentUserLocation.lng,
        pharmacy.latitude,
        pharmacy.longitude
      );
    }
    return {
      ...pharmacy,
      calculatedDistance: distance
    };
  });

  let filtered = processed.filter(p => {
    if (searchFilter) {
      const matchName = (p.name || '').toLowerCase().includes(searchFilter);
      const matchAddr = (p.address || '').toLowerCase().includes(searchFilter);
      const matchDistrict = (p.district || '').toLowerCase().includes(searchFilter);
      if (!matchName && !matchAddr && !matchDistrict) return false;
    }
    return true;
  });

  filtered.sort((a, b) => (a.calculatedDistance ?? Infinity) - (b.calculatedDistance ?? Infinity));

  const top5 = filtered.slice(0, 5);

  if (top5.length > 0 && top5[0].calculatedDistance !== null) {
    document.getElementById('stat-nearest-dist').innerText = formatDistance(top5[0].calculatedDistance);
    document.getElementById('stat-nearest-name').innerText = `${top5[0].name} (${top5[0].district || top5[0].city})`;
  } else if (top5.length > 0) {
    document.getElementById('stat-nearest-dist').innerText = '--';
    document.getElementById('stat-nearest-name').innerText = top5[0].name;
  } else {
    document.getElementById('stat-nearest-dist').innerText = '--';
    document.getElementById('stat-nearest-name').innerText = 'Eczane Bulunamadı';
  }

  renderTop5List(top5);
  renderAllPharmaciesList(filtered);
  renderMapMarkers(filtered, top5);
}

function renderTop5List(top5) {
  const container = document.getElementById('nearest-pharmacies-list');
  if (!container) return;

  if (top5.length === 0) {
    container.innerHTML = `
      <div class="p-4 rounded-xl bg-mistral-cream text-center text-xs text-mistral-slate">
        Arama kriterlerinize uygun nöbetçi eczane bulunamadı.
      </div>
    `;
    return;
  }

  container.innerHTML = top5.map((item, index) => {
    const rank = index + 1;
    const distanceStr = formatDistance(item.calculatedDistance);
    const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

    return `
      <div class="p-4 rounded-xl bg-white border border-mistral-hairline hover:border-emerald-500/50 transition shadow-xs group">
        <div class="flex items-start justify-between gap-3 mb-2">
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              ${rank}
            </span>
            <div>
              <h4 class="text-sm font-bold font-editorial text-mistral-ink group-hover:text-emerald-700 transition-colors">
                ${escapeHtml(item.name)}
              </h4>
              <span class="text-[11px] font-semibold text-mistral-stone bg-mistral-cream px-2 py-0.5 rounded border border-mistral-beige-deep inline-block mt-0.5">
                ${escapeHtml(item.district)} / ${escapeHtml(item.city)}
              </span>
            </div>
          </div>
          <div class="text-right shrink-0">
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
              <i class="fa-solid fa-person-walking text-[10px]"></i> ${distanceStr}
            </span>
          </div>
        </div>

        <p class="text-xs text-mistral-slate mb-2 line-clamp-2">
          <i class="fa-solid fa-map-pin text-mistral-stone mr-1 text-[11px]"></i>
          ${escapeHtml(item.address)}
        </p>

        ${(item.notes && !item.notes.includes('08:00')) ? `
          <div class="mb-2.5 px-2.5 py-1 rounded bg-amber-50/70 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
            <i class="fa-regular fa-clock text-amber-600"></i>
            <span>${escapeHtml(item.notes)}</span>
          </div>
        ` : ''}

        <div class="flex items-center justify-between gap-2 pt-2 border-t border-mistral-hairline text-xs">
          ${item.phone ? `
            <a href="tel:${cleanPhone}" class="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold flex items-center gap-1 transition">
              <i class="fa-solid fa-phone text-[10px]"></i> ${escapeHtml(item.phone)}
            </a>
          ` : '<span class="text-mistral-stone text-[11px]">Telefon Yok</span>'}

          <div class="flex items-center gap-1.5">
            <button 
              type="button" 
              onclick="focusPharmacyOnMap(${item.latitude}, ${item.longitude}, '${escapeHtml(item.name)}')" 
              class="px-2.5 py-1 rounded-md bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep font-medium transition cursor-pointer">
              <i class="fa-solid fa-eye text-[10px]"></i> Harita
            </button>
            <a 
              href="${mapsUrl}" 
              target="_blank" 
              rel="noopener" 
              class="px-2.5 py-1 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white font-semibold transition flex items-center gap-1 shadow-xs">
              <i class="fa-solid fa-diamond-turn-right text-[10px]"></i> Yol Tarifi
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderAllPharmaciesList(filteredList) {
  const container = document.getElementById('all-pharmacies-box');
  const countEl = document.getElementById('filtered-pharmacies-count');
  if (countEl) countEl.innerText = `${filteredList.length} Eczane`;
  if (!container) return;

  if (filteredList.length === 0) {
    container.innerHTML = `
      <div class="p-3 text-center text-xs text-mistral-stone">
        Gösterilecek nöbetçi eczane bulunamadı.
      </div>
    `;
    return;
  }

  container.innerHTML = filteredList.map(item => {
    const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
    const dist = formatDistance(item.calculatedDistance);
    return `
      <div class="p-2.5 rounded-lg bg-mistral-cream/50 border border-mistral-hairline hover:bg-white transition flex items-center justify-between gap-2">
        <div class="min-w-0">
          <div class="font-semibold text-mistral-ink truncate text-xs flex items-center gap-1.5">
            <span>${escapeHtml(item.name)}</span>
            <span class="text-[10px] text-mistral-stone font-normal">(${escapeHtml(item.district)})</span>
          </div>
          <div class="text-[11px] text-mistral-slate truncate">${escapeHtml(item.address)}</div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="text-[11px] font-bold text-mistral-orange">${dist}</span>
          <button 
            type="button" 
            onclick="focusPharmacyOnMap(${item.latitude}, ${item.longitude}, '${escapeHtml(item.name)}')" 
            class="text-mistral-slate hover:text-mistral-orange p-1 cursor-pointer" title="Haritada Odaklan">
            <i class="fa-solid fa-location-crosshairs"></i>
          </button>
          ${item.phone ? `
            <a href="tel:${cleanPhone}" class="text-emerald-700 hover:text-emerald-800 p-1" title="Ara">
              <i class="fa-solid fa-phone"></i>
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  setTimeout(syncListsHeight, 50);
}

function syncListsHeight() {
  if (window.innerWidth >= 768) {
    const leftCard = document.getElementById('nearest-pharmacies-card');
    const rightCard = document.getElementById('all-pharmacies-card');
    const rightBox = document.getElementById('all-pharmacies-box');
    const rightHeader = document.getElementById('all-pharmacies-header');

    if (leftCard && rightCard && rightBox && rightHeader) {
      const leftHeight = leftCard.offsetHeight;
      if (leftHeight > 0) {
        rightCard.style.height = `${leftHeight}px`;
        const headerHeight = rightHeader.offsetHeight;
        const availableHeight = leftHeight - headerHeight - 56;
        rightBox.style.maxHeight = `${Math.max(220, availableHeight)}px`;
        rightBox.style.height = `${Math.max(220, availableHeight)}px`;
      }
    }
  } else {
    const rightCard = document.getElementById('all-pharmacies-card');
    const rightBox = document.getElementById('all-pharmacies-box');
    if (rightCard) rightCard.style.height = 'auto';
    if (rightBox) {
      rightBox.style.maxHeight = '480px';
      rightBox.style.height = 'auto';
    }
  }
}

function toggleAllPharmaciesList() {
  const box = document.getElementById('all-pharmacies-box');
  const btn = document.getElementById('btn-toggle-all');
  if (!box) return;

  if (box.classList.contains('hidden')) {
    box.classList.remove('hidden');
    if (btn) btn.innerText = 'Gizle';
  } else {
    box.classList.add('hidden');
    if (btn) btn.innerText = 'Göster';
  }
}

function renderMapMarkers(filteredPharmacies, top5) {
  if (!pharmacyLayerGroup) return;

  pharmacyLayerGroup.clearLayers();

  const top5IdSet = new Set(top5.map(p => p.id));
  const top5RankMap = new Map();
  top5.forEach((p, index) => {
    top5RankMap.set(p.id, index + 1);
  });

  filteredPharmacies.forEach(item => {
    if (!item.latitude || !item.longitude) return;

    const isTop5 = top5IdSet.has(item.id);
    const rank = top5RankMap.get(item.id);

    let iconHtml = '';
    let iconClass = '';
    let iconSize = [26, 26];
    let iconAnchor = [13, 13];
    let zIndex = 100;

    if (isTop5) {
      iconClass = 'pharmacy-badge-marker pharmacy-top5-marker';
      iconHtml = `<span>${rank}</span>`;
      iconSize = [32, 32];
      iconAnchor = [16, 16];
      zIndex = 500 - rank;
    } else {
      iconClass = 'pharmacy-badge-marker pharmacy-standard-marker';
      iconHtml = '<span>+</span>';
      iconSize = [24, 24];
      iconAnchor = [12, 12];
      zIndex = 100;
    }

    const customIcon = L.divIcon({
      className: iconClass,
      html: iconHtml,
      iconSize: iconSize,
      iconAnchor: iconAnchor
    });

    const marker = L.marker([item.latitude, item.longitude], {
      icon: customIcon,
      zIndexOffset: zIndex
    });

    const distStr = formatDistance(item.calculatedDistance);
    const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

    const popupContent = `
      <div style="font-family: inherit; min-width: 200px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
          <strong style="font-size: 14px; color: #1f1f1f;">${escapeHtml(item.name)}</strong>
          ${isTop5 ? `<span style="background: #ecfdf5; color: #047857; font-weight: 700; font-size: 11px; padding: 2px 6px; border-radius: 9999px; border: 1px solid #a7f3d0;">#${rank} En Yakın</span>` : ''}
        </div>
        <div style="font-size: 12px; color: #fa520f; font-weight: 600; margin-bottom: 4px;">
          📍 ${escapeHtml(item.district)} / ${escapeHtml(item.city)} &bull; ${distStr}
        </div>
        <div style="font-size: 12px; color: #4a4a4a; margin-bottom: 8px; line-height: 1.3;">
          ${escapeHtml(item.address)}
        </div>
        ${(item.notes && !item.notes.includes('08:00')) ? `
          <div style="font-size: 11px; background: #fffbeb; color: #92400e; padding: 4px 6px; border-radius: 6px; border: 1px solid #fde68a; margin-bottom: 8px;">
            🕒 ${escapeHtml(item.notes)}
          </div>
        ` : ''}
        <div style="display: flex; gap: 6px; border-top: 1px solid #e5e5e5; padding-top: 8px;">
          ${item.phone ? `
            <a href="tel:${cleanPhone}" style="flex: 1; text-align: center; background: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 600; padding: 5px; border-radius: 6px; text-decoration: none; border: 1px solid #a7f3d0;">
              📞 Ara
            </a>
          ` : ''}
          <a href="${mapsUrl}" target="_blank" rel="noopener" style="flex: 1; text-align: center; background: #fa520f; color: white; font-size: 11px; font-weight: 600; padding: 5px; border-radius: 6px; text-decoration: none;">
            🧭 Yol Tarifi
          </a>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, { className: 'custom-eczane-popup' });
    pharmacyLayerGroup.addLayer(marker);
  });
}

function focusPharmacyOnMap(lat, lng, name) {
  if (!eczaneMap || !lat || !lng) return;

  eczaneMap.flyTo([lat, lng], 16, {
    animate: true,
    duration: 1.0
  });

  if (pharmacyLayerGroup) {
    pharmacyLayerGroup.eachLayer(layer => {
      const pos = layer.getLatLng();
      if (Math.abs(pos.lat - lat) < 0.0001 && Math.abs(pos.lng - lng) < 0.0001) {
        setTimeout(() => layer.openPopup(), 400);
      }
    });
  }
}

function recenterOnUser() {
  if (!eczaneMap) return;
  eczaneMap.flyTo([currentUserLocation.lat, currentUserLocation.lng], 14, { animate: true });
  if (userMarker) {
    userMarker.openPopup();
  }
}

function fitAllPharmacies() {
  if (!eczaneMap || !pharmacyLayerGroup) return;

  const layers = pharmacyLayerGroup.getLayers();
  if (layers.length === 0) return;

  const group = new L.featureGroup(layers);
  if (userMarker) group.addLayer(userMarker);

  eczaneMap.fitBounds(group.getBounds().pad(0.08), { animate: true });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.handleMyLocationClick = handleMyLocationClick;
window.requestUserLocation = requestUserLocation;
window.onCityChange = onCityChange;
window.onDistrictChange = onDistrictChange;
window.onSearchInput = onSearchInput;
window.focusPharmacyOnMap = focusPharmacyOnMap;
window.recenterOnUser = recenterOnUser;
window.fitAllPharmacies = fitAllPharmacies;
window.toggleAllPharmaciesList = toggleAllPharmaciesList;

// Başlatıcı
document.addEventListener('DOMContentLoaded', async () => {
  initMap();

  // 1. İlleri yükle
  await loadCities();

  // 2. Canlı GPS İstemi:
  if (navigator.geolocation) {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (status.state === 'granted') {
          requestUserLocation(true);
          return;
        } else if (status.state === 'prompt') {
          showLocationPermissionBanner('📍 Size en yakın nöbetçi eczaneleri göstermek için konum izni gereklidir.');
          requestUserLocation(true);
        } else {
          showLocationPermissionBanner('Konum izni kapalı. Yakınınızdaki nöbetçileri görmek için tarayıcı ayarlarından izin verebilir veya listeden il seçebilirsiniz.');
        }

        status.onchange = function() {
          if (this.state === 'granted') {
            requestUserLocation(true);
          }
        };
      } catch (e) {
        requestUserLocation(true);
      }
    } else {
      requestUserLocation(true);
    }
  }

  // Eğer konum henüz alınmadıysa varsayılan Ankara/Çankaya eczanelerini yükle
  if (!currentUserLocation.isGPS) {
    await fetchDutyPharmacies(false);
  }

  window.addEventListener('resize', syncListsHeight);
});
