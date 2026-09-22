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
  district: 'cankaya',
  isGPS: false
};

let currentUserLocation = { ...DEFAULT_LOCATION };
let selectedCitySlug = 'ankara';
let selectedDistrictSlug = 'cankaya';

// Haversine Formülü ile İki Koordinat Arası Metre Cinsinden Mesafe
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
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

  // OpenStreetMap Tile Katmanı
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | EczaneAPI',
    maxZoom: 19
  }).addTo(eczaneMap);

  pharmacyLayerGroup = L.layerGroup().addTo(eczaneMap);

  // Haritaya tıklayarak konumu değiştirme özelliği
  eczaneMap.on('click', function(e) {
    setUserLocation(e.latlng.lat, e.latlng.lng, 'Haritada Seçilen Nokta', false);
    if (typeof showToast === 'function') {
      showToast('Referans konumunuz seçilen noktaya taşındı.', 'info');
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
      <div style="font-weight: 700; color: #1f1f1f; margin-bottom: 2px;">🔵 Referans Konum</div>
      <div style="color: #4a4a4a; font-size: 12px;">${escapeHtml(currentUserLocation.name)}</div>
      <div style="color: #8a8a8a; font-size: 11px; margin-top: 4px;">En yakın nöbetçi eczaneler bu merkeze göre hesaplanır.</div>
    </div>
  `);
}

// Konumu Güncelle ve Mesafeleri Yeniden Hesapla
function setUserLocation(lat, lng, name, isGPS) {
  currentUserLocation.lat = lat;
  currentUserLocation.lng = lng;
  currentUserLocation.name = name;
  currentUserLocation.isGPS = isGPS;

  try {
    localStorage.setItem('vibe_eczane_loc', JSON.stringify({ lat, lng, name, isGPS }));
  } catch(e) {}

  // İstatistikleri ve Arayüzü Güncelle
  const locLabel = document.getElementById('stat-loc-label');
  const locSource = document.getElementById('stat-loc-source');
  if (locLabel) locLabel.innerText = name;
  if (locSource) locSource.innerText = isGPS ? 'GPS Canlı Uydu Konumu' : 'Referans Nokta';

  updateUserMapMarker();
  refreshPharmacyData();
}

// "Konumum" Butonu Tıklama İşleyicisi
function handleMyLocationClick() {
  if (currentUserLocation.isGPS && eczaneMap) {
    eczaneMap.setView([currentUserLocation.lat, currentUserLocation.lng], 14, { animate: true });
    if (userMarker) userMarker.openPopup();
    if (typeof showToast === 'function') {
      showToast('Mevcut GPS konumunuza odaklanıldı.', 'info');
    }
  } else {
    requestUserLocation(false);
  }
}

// Kullanıcının Canlı GPS Konumunu İste (Cihaz Konum Servisleri)
function requestUserLocation(silent = false) {
  const btn = document.getElementById('btn-get-gps');
  const originalHtml = '<i class="fa-solid fa-location-crosshairs text-base"></i><span>Konumum</span>';
  if (btn && !silent) {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Alınıyor...</span>';
    btn.disabled = true;
  }

  // Tarayıcı Geolocation kontrolü
  if (!navigator.geolocation) {
    if (btn && !silent) {
      btn.innerHTML = originalHtml;
      btn.disabled = false;
    }
    // Konum alınamıyorsa varsayılan Anıtkabir
    setUserLocation(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, DEFAULT_LOCATION.name, false);
    if (!silent && typeof showToast === 'function') {
      showToast('Cihazınız konum servisini desteklemiyor. Varsayılan konum (Anıtkabir) yüklendi.', 'warning');
    }
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function(pos) {
      if (btn && !silent) {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      if (userAccuracyCircle && eczaneMap) {
        eczaneMap.removeLayer(userAccuracyCircle);
      }
      if (pos.coords.accuracy && pos.coords.accuracy < 3000 && eczaneMap) {
        userAccuracyCircle = L.circle([lat, lng], {
          radius: pos.coords.accuracy,
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          weight: 1
        }).addTo(eczaneMap);
      }

      setUserLocation(lat, lng, 'Mevcut Konumunuz', true);
      if (eczaneMap) {
        eczaneMap.setView([lat, lng], 14, { animate: true });
      }

      if (!silent && typeof showToast === 'function') {
        showToast('Canlı GPS konumunuz başarıyla tespit edildi.', 'success');
      }
    },
    function(err) {
      console.warn('GPS Geolocation Uyarısı:', err);
      if (btn && !silent) {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }

      // Konum alınamıyorsa varsayılan konum olarak Anıtkabir yüklenir
      setUserLocation(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, DEFAULT_LOCATION.name, false);
      if (eczaneMap) {
        eczaneMap.setView([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng], 14, { animate: true });
      }

      if (!silent && typeof showToast === 'function') {
        let msg = 'Konum servislerine erişilemedi. Varsayılan konum (Anıtkabir) yüklendi.';
        if (err.code === 1) {
          msg = 'Konum izni reddedildi. Varsayılan konum olarak Anıtkabir / Çankaya gösteriliyor.';
        }
        showToast(msg, 'warning');
      }
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
  );
}

// -------------------------------------------------------------
// İl ve İlçe Yükleme Fonksiyonları
// -------------------------------------------------------------

// 1. İlleri API'den Yükle
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

// 2. İlçeleri API'den Yükle
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

      // Seçili ilçe varsa onu koru
      if (selectedDistrictSlug && currentDistricts.some(d => d.slug === selectedDistrictSlug)) {
        districtSelect.value = selectedDistrictSlug;
      } else {
        selectedDistrictSlug = '';
      }
    }
  } catch(e) {
    console.error('İlçeler yüklenemedi:', e);
    districtSelect.innerHTML = '<option value="">İlçeler Alınamadı</option>';
  }
}

// İl Değiştiğinde
async function onCityChange() {
  const citySelect = document.getElementById('select-city');
  selectedCitySlug = citySelect.value;
  selectedDistrictSlug = ''; // İlçeyi sıfırla

  await loadDistricts(selectedCitySlug);
  fetchDutyPharmacies();
}

// İlçe Değiştiğinde
function onDistrictChange() {
  const districtSelect = document.getElementById('select-district');
  selectedDistrictSlug = districtSelect.value;
  fetchDutyPharmacies();
}

// Arama Girişi
function onSearchInput() {
  refreshPharmacyData();
}

// -------------------------------------------------------------
// Nöbetçi Eczaneleri Çekme
// -------------------------------------------------------------
async function fetchDutyPharmacies() {
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

    // Tarih istatistiği
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

    // Haritayı eczanelere göre odakla
    if (allPharmacies.length > 0 && eczaneMap) {
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

  // Her eczaneye mesafeyi yeniden hesapla
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

  // İsim veya Adres ile arama
  let filtered = processed.filter(p => {
    if (searchFilter) {
      const matchName = (p.name || '').toLowerCase().includes(searchFilter);
      const matchAddr = (p.address || '').toLowerCase().includes(searchFilter);
      const matchDistrict = (p.district || '').toLowerCase().includes(searchFilter);
      if (!matchName && !matchAddr && !matchDistrict) return false;
    }
    return true;
  });

  // Mesafeye göre küçükten büyüğe sırala
  filtered.sort((a, b) => (a.calculatedDistance ?? Infinity) - (b.calculatedDistance ?? Infinity));

  // En Yakın 5 Eczane
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

// En Yakın 5 Eczaneyi Render Et
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

        ${item.notes ? `
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

// Tüm Eczaneler Listesi
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

// Haritadaki Markerları Çiz
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
        ${item.notes ? `
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

// Window global fonksiyon bağlamaları
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
  // Önceki kayıtlı konum varsa ve GPS konumuysa yükle
  try {
    const savedLoc = localStorage.getItem('vibe_eczane_loc');
    if (savedLoc) {
      const parsed = JSON.parse(savedLoc);
      if (parsed && parsed.lat && parsed.lng && parsed.isGPS) {
        currentUserLocation = parsed;
      } else {
        currentUserLocation = { ...DEFAULT_LOCATION };
      }
    }
  } catch(e) {}

  initMap();

  // 1. İlleri ve Çankaya / Ankara varsayılanını yükle
  await loadCities();
  await fetchDutyPharmacies();

  // 2. Canlı GPS Kontrolü (İzin verilmişse otomatik GPS al; verilmemişse Anıtkabir kalır)
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
      if (permissionStatus.state === 'granted') {
        requestUserLocation(true);
      } else {
        // İzin yoksa veya sorulmamışsa varsayılan Anıtkabir konumu korunur
        setUserLocation(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, DEFAULT_LOCATION.name, false);
      }
      permissionStatus.onchange = function() {
        if (this.state === 'granted') {
          requestUserLocation(true);
        }
      };
    }).catch(() => {
      setUserLocation(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, DEFAULT_LOCATION.name, false);
    });
  } else {
    setUserLocation(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, DEFAULT_LOCATION.name, false);
  }
});
