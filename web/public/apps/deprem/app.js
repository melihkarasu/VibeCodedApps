(function () {
  'use strict';

  const APP_ID = 'deprem-radari';
  const WATCH_STORAGE_KEY = 'deprem_watched_regions_v1';

  const REGION_PRESETS = {
    turkey: {
      label: 'Türkiye ve Çevresi',
      center: [39.0, 35.2],
      zoom: 6,
      bbox: { minlat: 34.5, maxlat: 43.0, minlon: 25.0, maxlon: 46.0 },
    },
    marmara: {
      label: 'Marmara Bölgesi',
      center: [40.7, 28.9],
      zoom: 8,
      bbox: { minlat: 39.4, maxlat: 42.1, minlon: 26.0, maxlon: 31.2 },
    },
    aegean: {
      label: 'Ege & Batı Anadolu',
      center: [38.4, 27.2],
      zoom: 7,
      bbox: { minlat: 36.2, maxlat: 40.3, minlon: 24.5, maxlon: 30.2 },
    },
    east: {
      label: 'Doğu & Güneydoğu Anadolu',
      center: [38.5, 40.5],
      zoom: 7,
      bbox: { minlat: 36.4, maxlat: 41.6, minlon: 35.8, maxlon: 44.9 },
    },
    mediterranean: {
      label: 'Akdeniz Havzası',
      center: [36.5, 29.0],
      zoom: 5,
      bbox: { minlat: 31.0, maxlat: 42.5, minlon: 10.0, maxlon: 37.5 },
    },
    global: {
      label: 'Tüm Dünya (Küresel)',
      center: [25.0, 15.0],
      zoom: 2,
      bbox: null,
    },
  };

  let map = null;
  let markerLayer = null;
  let userLocationLayer = null;
  let allQuakes = [];
  let filteredQuakes = [];
  let activeNearPoint = null;
  let watchedRegions = [];
  const markerById = new Map();

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeUsgsUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    try {
      const u = new URL(rawUrl);
      if (u.protocol === 'https:' && (u.hostname === 'earthquake.usgs.gov' || u.hostname.endsWith('.usgs.gov'))) {
        return u.toString();
      }
    } catch (_) {}
    return '';
  }

  function clampNumber(val, min, max, fallback) {
    const n = Number(val);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function getMagStyle(mag) {
    if (mag >= 6.0) return { color: '#dc2626', fill: '#ef4444', badge: 'bg-red-50 text-red-700 border border-red-200', label: 'Şiddetli' };
    if (mag >= 4.5) return { color: '#ea580c', fill: '#fa520f', badge: 'bg-orange-50 text-orange-700 border border-orange-200', label: 'Güçlü' };
    if (mag >= 3.0) return { color: '#d97706', fill: '#f59e0b', badge: 'bg-amber-50 text-amber-700 border border-amber-200', label: 'Orta' };
    return { color: '#059669', fill: '#10b981', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'Hafif' };
  }

  function formatRelativeTime(ms) {
    if (!Number.isFinite(ms)) return '--';
    const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
    if (diffSec < 60) return `${diffSec} sn önce`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} dk önce`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} sa önce`;
    return `${Math.floor(diffHr / 24)} gün önce`;
  }

  function setStatus(text, isError) {
    const el = document.getElementById('quake-status-text');
    const dot = document.querySelector('#quake-status-badge span');
    if (el) el.textContent = text;
    if (dot) {
      dot.className = 'w-2 h-2 rounded-full ' + (isError ? 'bg-rose-500' : 'bg-emerald-500');
    }
  }

  function initMap() {
    if (map || typeof L === 'undefined') return;
    map = L.map('deprem-map', { zoomControl: true }).setView([39.0, 35.2], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    userLocationLayer = L.layerGroup().addTo(map);
  }

  function buildUsgsQueryUrl(regionKey, minMag, days) {
    const start = new Date(Date.now() - days * 86400 * 1000).toISOString();
    const params = new URLSearchParams({
      format: 'geojson',
      starttime: start,
      minmagnitude: String(minMag),
      orderby: 'time',
      limit: '250',
    });

    if (activeNearPoint) {
      params.set('latitude', String(activeNearPoint.lat.toFixed(4)));
      params.set('longitude', String(activeNearPoint.lon.toFixed(4)));
      params.set('maxradiuskm', '250');
      return 'https://earthquake.usgs.gov/fdsnws/event/1/query?' + params.toString();
    }

    const preset = REGION_PRESETS[regionKey] || REGION_PRESETS.turkey;
    if (preset.bbox) {
      params.set('minlatitude', String(preset.bbox.minlat));
      params.set('maxlatitude', String(preset.bbox.maxlat));
      params.set('minlongitude', String(preset.bbox.minlon));
      params.set('maxlongitude', String(preset.bbox.maxlon));
    }
    return 'https://earthquake.usgs.gov/fdsnws/event/1/query?' + params.toString();
  }

  async function fetchQuakes() {
    const regionKey = document.getElementById('filter-region').value || 'turkey';
    const minMag = clampNumber(document.getElementById('filter-minmag').value, 0, 9.5, 2.5);
    const days = clampNumber(document.getElementById('filter-days').value, 1, 30, 7);

    const periodEl = document.getElementById('stat-period-label');
    if (periodEl) {
      periodEl.textContent = days === 1 ? 'Son 24 Saat' : `Son ${days} Gün`;
    }

    setStatus('Yükleniyor...', false);

    const url = buildUsgsQueryUrl(regionKey, minMag, days);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`USGS HTTP ${res.status}`);
      const geojson = await res.json();
      const features = Array.isArray(geojson.features) ? geojson.features : [];

      allQuakes = features
        .map((f) => {
          const props = f.properties || {};
          const coords = (f.geometry && f.geometry.coordinates) || [];
          const lon = Number(coords[0]);
          const lat = Number(coords[1]);
          const depthKm = Number(coords[2]);
          const mag = Number(props.mag);
          if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(mag)) return null;
          return {
            id: String(f.id || ''),
            mag,
            place: String(props.place || 'Bilinmeyen Konum'),
            time: Number(props.time),
            lat,
            lon,
            depthKm: Number.isFinite(depthKm) ? Math.max(0, depthKm) : 0,
            tsunami: Boolean(props.tsunami),
            url: safeUsgsUrl(props.url),
          };
        })
        .filter(Boolean);

      if (map && !activeNearPoint) {
        const preset = REGION_PRESETS[regionKey] || REGION_PRESETS.turkey;
        map.setView(preset.center, preset.zoom);
      }

      applyClientSearch();
      setStatus(`Güncel (${allQuakes.length})`, false);
    } catch (err) {
      allQuakes = [];
      applyClientSearch();
      setStatus('Bağlantı hatası', true);
      const listEl = document.getElementById('quake-list');
      if (listEl) {
        listEl.innerHTML = `<div class="text-xs text-rose-600 py-6 text-center">Deprem verileri alınamadı: ${escapeHtml(err.message)}</div>`;
      }
    }
  }

  function applyClientSearch() {
    const q = (document.getElementById('filter-search').value || '').trim().toLowerCase();
    filteredQuakes = q
      ? allQuakes.filter((item) => item.place.toLowerCase().includes(q))
      : [...allQuakes];

    renderStats(filteredQuakes);
    renderMapMarkers(filteredQuakes);
    renderQuakeList(filteredQuakes);
  }

  function renderStats(list) {
    const countEl = document.getElementById('stat-count');
    const maxMagEl = document.getElementById('stat-max-mag');
    const maxPlaceEl = document.getElementById('stat-max-place');
    const avgDepthEl = document.getElementById('stat-avg-depth');
    const latestTimeEl = document.getElementById('stat-latest-time');
    const latestMagEl = document.getElementById('stat-latest-mag');

    if (countEl) countEl.textContent = String(list.length);

    if (list.length === 0) {
      if (maxMagEl) maxMagEl.textContent = '--';
      if (maxPlaceEl) maxPlaceEl.textContent = 'Kayıt bulunamadı';
      if (avgDepthEl) avgDepthEl.textContent = '--';
      if (latestTimeEl) latestTimeEl.textContent = '--';
      if (latestMagEl) latestMagEl.textContent = '--';
      return;
    }

    let strongest = list[0];
    let depthSum = 0;
    for (const q of list) {
      if (q.mag > strongest.mag) strongest = q;
      depthSum += q.depthKm;
    }
    const latest = list[0];

    if (maxMagEl) maxMagEl.textContent = `M ${strongest.mag.toFixed(1)}`;
    if (maxPlaceEl) maxPlaceEl.textContent = strongest.place;
    if (avgDepthEl) avgDepthEl.textContent = `${(depthSum / list.length).toFixed(1)} km`;
    if (latestTimeEl) latestTimeEl.textContent = formatRelativeTime(latest.time);
    if (latestMagEl) latestMagEl.textContent = `M ${latest.mag.toFixed(1)} · ${latest.place}`;
  }

  function renderMapMarkers(list) {
    if (!map || !markerLayer) return;
    markerLayer.clearLayers();
    markerById.clear();

    for (const q of list) {
      const style = getMagStyle(q.mag);
      const radius = Math.max(5, Math.min(24, q.mag * 3.4));
      const marker = L.circleMarker([q.lat, q.lon], {
        radius,
        color: style.color,
        weight: 1.5,
        fillColor: style.fill,
        fillOpacity: 0.55,
      });

      const localDate = Number.isFinite(q.time)
        ? new Date(q.time).toLocaleString('tr-TR')
        : '--';
      const detailLink = q.url
        ? `<div class="mt-2 pt-1.5 border-t border-stone-200"><a href="${escapeHtml(q.url)}" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-orange-600 underline">USGS Raporunu Aç &rarr;</a></div>`
        : '';

      marker.bindPopup(
        `<div class="text-xs space-y-1 min-w-[180px]">
          <div class="font-bold text-stone-900 text-sm">M ${q.mag.toFixed(1)} — ${escapeHtml(style.label)}</div>
          <div class="text-stone-700 font-medium">${escapeHtml(q.place)}</div>
          <div class="text-stone-500">Derinlik: ${q.depthKm.toFixed(1)} km</div>
          <div class="text-stone-500">${escapeHtml(localDate)}</div>
          ${detailLink}
        </div>`
      );

      marker.addTo(markerLayer);
      markerById.set(q.id, marker);
    }
  }

  function renderQuakeList(list) {
    const listEl = document.getElementById('quake-list');
    const pillEl = document.getElementById('feed-count-pill');
    if (pillEl) pillEl.textContent = `${list.length} kayıt`;
    if (!listEl) return;

    if (list.length === 0) {
      listEl.innerHTML = '<div class="text-xs text-mistral-stone py-8 text-center">Seçili filtrelerde deprem kaydı bulunamadı.</div>';
      return;
    }

    listEl.innerHTML = list
      .slice(0, 80)
      .map((q) => {
        const style = getMagStyle(q.mag);
        const distNote = activeNearPoint
          ? ` · ${haversineKm(activeNearPoint.lat, activeNearPoint.lon, q.lat, q.lon).toFixed(0)} km`
          : '';
        return `
          <div class="quake-item-card flex items-start gap-3" onclick="window.focusQuakeOnMap('${escapeHtml(q.id)}')">
            <span class="quake-mag-badge ${style.badge} shrink-0">${q.mag.toFixed(1)}</span>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-semibold text-mistral-ink truncate">${escapeHtml(q.place)}</div>
              <div class="text-[11px] text-mistral-slate mt-0.5 flex flex-wrap items-center gap-1.5">
                <span>${escapeHtml(formatRelativeTime(q.time))}</span>
                <span>•</span>
                <span>${q.depthKm.toFixed(1)} km derinlik${escapeHtml(distNote)}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  function focusQuakeOnMap(id) {
    const q = filteredQuakes.find((item) => item.id === id);
    const marker = markerById.get(id);
    if (!q || !map) return;
    map.setView([q.lat, q.lon], Math.max(map.getZoom(), 8), { animate: true });
    if (marker) marker.openPopup();
  }

  function onFilterChange() {
    activeNearPoint = null;
    if (userLocationLayer) userLocationLayer.clearLayers();
    fetchQuakes();
  }

  function focusPreset(regionKey) {
    activeNearPoint = null;
    if (userLocationLayer) userLocationLayer.clearLayers();
    const regionSel = document.getElementById('filter-region');
    const minMagSel = document.getElementById('filter-minmag');
    if (regionSel) regionSel.value = regionKey;
    if (minMagSel && regionKey === 'global') minMagSel.value = '4.0';
    fetchQuakes();
  }

  function focusNearMe() {
    if (!navigator.geolocation) {
      setStatus('Konum desteklenmiyor', true);
      return;
    }
    setStatus('Konum alınıyor...', false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        activeNearPoint = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        if (map && userLocationLayer) {
          userLocationLayer.clearLayers();
          L.circleMarker([activeNearPoint.lat, activeNearPoint.lon], {
            radius: 7,
            color: '#1d4ed8',
            weight: 2,
            fillColor: '#3b82f6',
            fillOpacity: 0.9,
          })
            .bindPopup('<div class="text-xs font-semibold">Konumunuz (250 km tarama)</div>')
            .addTo(userLocationLayer);
          map.setView([activeNearPoint.lat, activeNearPoint.lon], 7);
        }
        fetchQuakes();
      },
      () => {
        setStatus('Konum izni verilmedi', true);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  // --- Kullanıcı Verisi Yönetimi (VibeRuntime: Monorepo DB <-> Standalone localStorage) ---
  async function loadWatchedRegions() {
    const noteEl = document.getElementById('watch-storage-note');
    const isStandalone = Boolean(window.VibeRuntime && window.VibeRuntime.isStandalone);
    if (noteEl) {
      noteEl.textContent = isStandalone
        ? 'Standalone mod: kayıtlı bölgeler yalnızca tarayıcınızda (localStorage) saklanır.'
        : 'Oturum açıkken kayıtlı bölgeler hesabınızla senkronize edilir.';
    }

    if (window.VibeRuntime && typeof window.VibeRuntime.storage.sync === 'function') {
      await window.VibeRuntime.storage.sync(APP_ID);
    }

    const stored = window.VibeRuntime
      ? window.VibeRuntime.storage.get(APP_ID, WATCH_STORAGE_KEY, [])
      : [];
    watchedRegions = Array.isArray(stored) ? stored : [];
    renderWatchedRegions();
  }

  async function persistWatchedRegions() {
    if (window.VibeRuntime) {
      await window.VibeRuntime.storage.set(APP_ID, WATCH_STORAGE_KEY, watchedRegions);
    }
  }

  async function saveCurrentWatchRegion() {
    const region = document.getElementById('filter-region').value || 'turkey';
    const minMag = document.getElementById('filter-minmag').value || '2.5';
    const days = document.getElementById('filter-days').value || '7';
    const preset = REGION_PRESETS[region] || REGION_PRESETS.turkey;
    const entry = {
      id: `${region}_${minMag}_${days}`,
      label: `${preset.label} · M ${minMag}+ (${days}g)`,
      region,
      minMag,
      days,
    };

    if (!watchedRegions.some((item) => item.id === entry.id)) {
      watchedRegions.unshift(entry);
      watchedRegions = watchedRegions.slice(0, 8);
      await persistWatchedRegions();
      renderWatchedRegions();
      if (window.showToast) window.showToast('Bölge takip listesine eklendi.');
    }
  }

  function applyWatchedRegion(id) {
    const item = watchedRegions.find((r) => r.id === id);
    if (!item) return;
    activeNearPoint = null;
    document.getElementById('filter-region').value = item.region;
    document.getElementById('filter-minmag').value = item.minMag;
    document.getElementById('filter-days').value = item.days;
    fetchQuakes();
  }

  async function removeWatchedRegion(id) {
    watchedRegions = watchedRegions.filter((r) => r.id !== id);
    await persistWatchedRegions();
    renderWatchedRegions();
  }

  async function clearWatchedRegions() {
    watchedRegions = [];
    if (window.VibeRuntime) {
      await window.VibeRuntime.storage.remove(APP_ID, WATCH_STORAGE_KEY);
    }
    renderWatchedRegions();
  }

  function renderWatchedRegions() {
    const box = document.getElementById('watched-regions-list');
    if (!box) return;
    if (!watchedRegions.length) {
      box.innerHTML = '<div class="text-xs text-mistral-stone py-3 text-center">Henüz kayıtlı bölge yok.</div>';
      return;
    }

    box.innerHTML = watchedRegions
      .map(
        (r) => `
        <div class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-mistral-cream-light border border-mistral-hairline text-xs">
          <button type="button" onclick="window.applyWatchedRegion('${escapeHtml(r.id)}')" class="text-left font-semibold text-mistral-ink hover:text-mistral-orange truncate flex-1 cursor-pointer">
            ${escapeHtml(r.label)}
          </button>
          <button type="button" onclick="window.removeWatchedRegion('${escapeHtml(r.id)}')" class="text-mistral-stone hover:text-rose-600 px-1 cursor-pointer" aria-label="Sil">&times;</button>
        </div>
      `
      )
      .join('');
  }

  // Global handlers
  window.refreshQuakes = fetchQuakes;
  window.onFilterChange = onFilterChange;
  window.applyClientSearch = applyClientSearch;
  window.focusPreset = focusPreset;
  window.focusNearMe = focusNearMe;
  window.focusQuakeOnMap = focusQuakeOnMap;
  window.saveCurrentWatchRegion = saveCurrentWatchRegion;
  window.applyWatchedRegion = applyWatchedRegion;
  window.removeWatchedRegion = removeWatchedRegion;
  window.clearWatchedRegions = clearWatchedRegions;

  window.addEventListener('vibe_user_data_synced', (ev) => {
    if (ev && ev.detail && ev.detail.appId === APP_ID) {
      const synced = window.VibeRuntime
        ? window.VibeRuntime.storage.get(APP_ID, WATCH_STORAGE_KEY, [])
        : [];
      if (Array.isArray(synced)) {
        watchedRegions = synced;
        renderWatchedRegions();
      }
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadWatchedRegions();
    fetchQuakes();
  });
})();
