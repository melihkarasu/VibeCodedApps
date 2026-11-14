(function () {
  'use strict';

  const APP_ID = 'gorsel-boyutlandirici';
  const STORAGE_KEY = 'gorsel_saved_presets_v1';
  const CROPDEN_API_URL = 'https://cropden.com/data/social-media-image-sizes.json';

  const FALLBACK_GROUPS = [
    {
      id: 'instagram-post',
      platform: 'Instagram',
      name: { en: 'Instagram Gönderi & Reels' },
      sizes: [
        { id: 'ig-portrait', name: { en: '4:5 Dikey Gönderi (1080×1350)' }, width: 1080, height: 1350, ratio: '4:5', note: { en: 'Akışta maksimum dikey alan sağlayan standart boyut.' }, safeZone: { top: 60, bottom: 60, left: 40, right: 40 } },
        { id: 'ig-square', name: { en: '1:1 Kare Gönderi (1080×1080)' }, width: 1080, height: 1080, ratio: '1:1', note: { en: 'Profil ızgarası ile tam uyumlu kare format.' }, safeZone: { top: 40, bottom: 40, left: 40, right: 40 } },
        { id: 'ig-reels', name: { en: '9:16 Hikaye / Reels (1080×1920)' }, width: 1080, height: 1920, ratio: '9:16', note: { en: 'Üstte profil barı ve altta açıklama alanı için safe-zone bırakın.' }, safeZone: { top: 220, bottom: 340, left: 60, right: 120 } },
      ],
    },
    {
      id: 'youtube',
      platform: 'YouTube',
      name: { en: 'YouTube Kapak & Kanal' },
      sizes: [
        { id: 'yt-thumb', name: { en: '16:9 Video Küçük Resmi (1280×720)' }, width: 1280, height: 720, ratio: '16:9', note: { en: 'Sağ alt köşedeki süre rozetine dikkat edin.' }, safeZone: { top: 40, bottom: 90, left: 40, right: 160 } },
        { id: 'yt-banner', name: { en: 'Kanal Kapak Görseli (2560×1440)' }, width: 2560, height: 1440, ratio: '16:9', note: { en: 'Tüm cihazlarda görünen güvenli merkez: 1546×423 px.' }, safeZone: { top: 508, bottom: 509, left: 507, right: 507 } },
      ],
    },
    {
      id: 'x-twitter',
      platform: 'X (Twitter)',
      name: { en: 'X / Twitter Gönderi & Başlık' },
      sizes: [
        { id: 'x-post', name: { en: '16:9 Akış Görseli (1600×900)' }, width: 1600, height: 900, ratio: '16:9', note: { en: 'Zaman akışında kırpılmadan tam görünür.' }, safeZone: { top: 40, bottom: 40, left: 40, right: 40 } },
        { id: 'x-header', name: { en: '3:1 Profil Kapak (1500×500)' }, width: 1500, height: 500, ratio: '3:1', note: { en: 'Sol alt köşede profil fotoğrafı üst üste biner.' }, safeZone: { top: 40, bottom: 120, left: 320, right: 40 } },
      ],
    },
    {
      id: 'linkedin',
      platform: 'LinkedIn',
      name: { en: 'LinkedIn Paylaşım & Kapak' },
      sizes: [
        { id: 'li-post', name: { en: '1.91:1 Bağlantı / Gönderi (1200×627)' }, width: 1200, height: 627, ratio: '1.91:1', note: { en: 'Kurumsal akış ve blog kartları için ideal.' }, safeZone: { top: 36, bottom: 36, left: 36, right: 36 } },
        { id: 'li-cover', name: { en: '4:1 Kişisel Kapak (1584×396)' }, width: 1584, height: 396, ratio: '4:1', note: { en: 'Sol taraftaki profil fotoğrafı alanını boş bırakın.' }, safeZone: { top: 30, bottom: 90, left: 360, right: 40 } },
      ],
    },
    {
      id: 'passport',
      platform: 'Biyometrik & Vesikalık',
      name: { en: 'Pasaport, Vize & Biyometrik' },
      sizes: [
        { id: 'tr-biometric', name: { en: 'Türkiye Biyometrik (50×60 mm · 590×708 px)' }, width: 590, height: 708, ratio: '5:6', note: { en: 'Baş yüksekliği %70-80 aralığında ve merkezde olmalıdır.' }, safeZone: { top: 70, bottom: 95, left: 85, right: 85 } },
        { id: 'schengen-visa', name: { en: 'Schengen / AB Vize (35×45 mm · 413×531 px)' }, width: 413, height: 531, ratio: '7:9', note: { en: '300 DPI baskı standardında 35×45 mm biyometrik ölçü.' }, safeZone: { top: 55, bottom: 75, left: 60, right: 60 } },
        { id: 'us-visa', name: { en: 'ABD Vize / Green Card (2×2 inç · 600×600 px)' }, width: 600, height: 600, ratio: '1:1', note: { en: '600×600 px kare, açık arka plan standardı.' }, safeZone: { top: 65, bottom: 85, left: 85, right: 85 } },
      ],
    },
  ];

  let catalogGroups = [...FALLBACK_GROUPS];
  let activeImage = null;
  let activePreset = FALLBACK_GROUPS[0].sizes[0];
  let savedPresets = [];

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setStatus(text, isError) {
    const el = document.getElementById('cropden-status-text');
    const dot = document.querySelector('#cropden-status-badge span');
    if (el) el.textContent = text;
    if (dot) dot.className = 'w-2 h-2 rounded-full ' + (isError ? 'bg-amber-500' : 'bg-emerald-500');
  }

  async function fetchCropDenCatalog() {
    try {
      const res = await fetch(CROPDEN_API_URL, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (data && Array.isArray(data.groups) && data.groups.length > 0) {
        const mapped = data.groups
          .filter((g) => Array.isArray(g.sizes) && g.sizes.length > 0)
          .map((g) => ({
            id: String(g.id || g.platform),
            platform: String(g.platform || (g.name && g.name.en) || 'Platform'),
            name: { en: String((g.name && g.name.en) || g.platform || 'Şablon') },
            sizes: g.sizes.map((s) => ({
              id: String(s.id || s.width + 'x' + s.height),
              name: { en: ((s.name && s.name.en) || s.ratio || 'Ölçü') + ' (' + s.width + '×' + s.height + ')' },
              width: Number(s.width) || 1080,
              height: Number(s.height) || 1080,
              ratio: String(s.ratio || ''),
              note: { en: String((s.note && s.note.en) || 'CropDen doğrulanmış platform ölçüsü.') },
              safeZone: s.safeZone || null,
            })),
          }));
        const passportGroup = FALLBACK_GROUPS.find((g) => g.id === 'passport');
        catalogGroups = passportGroup ? [...mapped, passportGroup] : mapped;
        setStatus('CropDen Canlı (' + catalogGroups.length + ' grup)', false);
      }
    } catch (_) {
      setStatus('Yerleşik Şablonlar Aktif', false);
    }
    populatePlatformSelect();
  }

  function populatePlatformSelect() {
    const platSel = document.getElementById('select-platform');
    if (!platSel) return;
    platSel.innerHTML = catalogGroups
      .map((g, idx) => '<option value="' + idx + '">' + escapeHtml(g.platform) + ' — ' + escapeHtml(g.name.en) + '</option>')
      .join('');
    onPlatformChange();
  }

  function onPlatformChange() {
    const platIdx = Number(document.getElementById('select-platform').value) || 0;
    const group = catalogGroups[platIdx] || catalogGroups[0];
    const sizeSel = document.getElementById('select-size-preset');
    if (!sizeSel || !group) return;
    sizeSel.innerHTML = group.sizes
      .map((s, idx) => '<option value="' + idx + '">' + escapeHtml(s.name.en) + '</option>')
      .join('');
    onPresetSelect();
  }

  function onPresetSelect() {
    const platIdx = Number(document.getElementById('select-platform').value) || 0;
    const sizeIdx = Number(document.getElementById('select-size-preset').value) || 0;
    const group = catalogGroups[platIdx] || catalogGroups[0];
    const preset = (group && group.sizes[sizeIdx]) || FALLBACK_GROUPS[0].sizes[0];
    activePreset = preset;
    document.getElementById('input-target-w').value = String(preset.width);
    document.getElementById('input-target-h').value = String(preset.height);
    document.getElementById('preset-info-title').textContent = group.platform + ' · ' + preset.name.en;
    document.getElementById('preset-info-note').textContent = (preset.note && preset.note.en) || '';
    renderCropCanvas();
  }

  function onCustomDimensionsChange() {
    const w = Math.max(32, Math.min(4096, Number(document.getElementById('input-target-w').value) || 1080));
    const h = Math.max(32, Math.min(4096, Number(document.getElementById('input-target-h').value) || 1080));
    activePreset = {
      id: 'custom_' + w + 'x' + h,
      name: { en: 'Özel Ölçü (' + w + '×' + h + ')' },
      width: w,
      height: h,
      ratio: w + ':' + h,
      note: { en: 'Kullanıcı tanımlı özel piksel çözünürlüğü.' },
      safeZone: null,
    };
    renderCropCanvas();
  }

  function loadSampleCanvasImage() {
    const off = document.createElement('canvas');
    off.width = 1600;
    off.height = 1200;
    const ctx = off.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 1600, 1200);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#ea580c');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1600, 1200);
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath();
    ctx.arc(800, 560, 320, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 68px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MK STUDIO · CROPDEN', 800, 540);
    ctx.font = '500 36px Inter, sans-serif';
    ctx.fillText('Güvenli Alan (Safe-Zone) Test Görseli', 800, 615);
    const img = new Image();
    img.onload = () => {
      activeImage = img;
      document.getElementById('stat-src-dim').textContent = img.naturalWidth + ' × ' + img.naturalHeight;
      renderCropCanvas();
    };
    img.src = off.toDataURL('image/png');
  }

  function onImageFileSelected(ev) {
    const file = ev.target && ev.target.files && ev.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      if (window.showToast) window.showToast('Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        activeImage = img;
        document.getElementById('stat-src-dim').textContent = img.naturalWidth + ' × ' + img.naturalHeight;
        document.getElementById('slider-zoom').value = '100';
        document.getElementById('slider-pan-x').value = '0';
        document.getElementById('slider-pan-y').value = '0';
        renderCropCanvas();
        if (window.showToast) window.showToast('Görsel yüklendi.');
      };
      img.src = String(e.target.result || '');
    };
    reader.readAsDataURL(file);
  }

  function drawSceneToCanvas(canvas, includeSafeZoneOverlay) {
    const targetW = Math.max(32, Math.min(4096, Number(document.getElementById('input-target-w').value) || 1080));
    const targetH = Math.max(32, Math.min(4096, Number(document.getElementById('input-target-h').value) || 1080));
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, targetW, targetH);
    const zoomPct = Number(document.getElementById('slider-zoom').value) || 100;
    const panX = Number(document.getElementById('slider-pan-x').value) || 0;
    const panY = Number(document.getElementById('slider-pan-y').value) || 0;
    document.getElementById('zoom-val-label').textContent = zoomPct + '%';
    if (activeImage) {
      const baseScale = Math.max(targetW / activeImage.naturalWidth, targetH / activeImage.naturalHeight);
      const scale = baseScale * (zoomPct / 100);
      const drawW = activeImage.naturalWidth * scale;
      const drawH = activeImage.naturalHeight * scale;
      const maxOffsetX = Math.max(0, (drawW - targetW) / 2);
      const maxOffsetY = Math.max(0, (drawH - targetH) / 2);
      const dx = (targetW - drawW) / 2 - (panX / 100) * maxOffsetX;
      const dy = (targetH - drawH) / 2 - (panY / 100) * maxOffsetY;
      ctx.drawImage(activeImage, dx, dy, drawW, drawH);
    }
    if (includeSafeZoneOverlay) {
      const sz = (activePreset && activePreset.safeZone) || {
        top: Math.round(targetH * 0.08),
        bottom: Math.round(targetH * 0.08),
        left: Math.round(targetW * 0.08),
        right: Math.round(targetW * 0.08),
      };
      const sx = sz.left || Math.round(targetW * 0.08);
      const sy = sz.top || Math.round(targetH * 0.08);
      const sw = Math.max(20, targetW - sx - (sz.right || Math.round(targetW * 0.08)));
      const sh = Math.max(20, targetH - sy - (sz.bottom || Math.round(targetH * 0.08)));
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 82, 15, 0.92)';
      ctx.lineWidth = Math.max(2, Math.round(Math.min(targetW, targetH) * 0.004));
      ctx.setLineDash([12, 8]);
      ctx.strokeRect(sx, sy, sw, sh);
      ctx.restore();
    }
  }

  function renderCropCanvas() {
    const canvas = document.getElementById('crop-preview-canvas');
    if (!canvas) return;
    const showSafe = Boolean(document.getElementById('toggle-safe-zone') && document.getElementById('toggle-safe-zone').checked);
    drawSceneToCanvas(canvas, showSafe);
    const w = canvas.width;
    const h = canvas.height;
    document.getElementById('stat-out-dim').textContent = w + ' × ' + h;
    document.getElementById('canvas-meta-subtitle').textContent = w + ' × ' + h + ' px · ' + ((activePreset && activePreset.name && activePreset.name.en) || 'Özel Kadraj');
    updateExportEstimate();
  }

  function updateExportEstimate() {
    const q = Number(document.getElementById('slider-quality').value) || 90;
    document.getElementById('quality-label').textContent = q + '%';
    const fmt = document.getElementById('select-export-format').value || 'image/webp';
    const ext = fmt.split('/')[1].toUpperCase();
    document.getElementById('export-size-badge').textContent = ext + ' · Kalite ' + q + '%';
  }

  function downloadCroppedImage() {
    const exportCanvas = document.createElement('canvas');
    drawSceneToCanvas(exportCanvas, false);
    const fmt = document.getElementById('select-export-format').value || 'image/webp';
    const q = (Number(document.getElementById('slider-quality').value) || 90) / 100;
    const ext = fmt === 'image/jpeg' ? 'jpg' : fmt === 'image/png' ? 'png' : 'webp';
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vibe-crop-' + exportCanvas.width + 'x' + exportCanvas.height + '.' + ext;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 3000);
        if (window.showToast) window.showToast('Görsel indirildi (' + exportCanvas.width + '×' + exportCanvas.height + ' ' + ext.toUpperCase() + ')');
      },
      fmt,
      q
    );
  }

  async function loadSavedPresets() {
    if (window.VibeRuntime && typeof window.VibeRuntime.storage.sync === 'function') {
      await window.VibeRuntime.storage.sync(APP_ID);
    }
    const raw = window.VibeRuntime ? window.VibeRuntime.storage.get(APP_ID, STORAGE_KEY, []) : [];
    savedPresets = Array.isArray(raw) ? raw : [];
    renderSavedPresets();
  }

  async function saveCurrentPreset() {
    const w = Number(document.getElementById('input-target-w').value) || 1080;
    const h = Number(document.getElementById('input-target-h').value) || 1080;
    const label = (activePreset && activePreset.name && activePreset.name.en) || ('Özel (' + w + '×' + h + ')');
    const item = { id: w + 'x' + h + '_' + label, label, width: w, height: h };
    if (!savedPresets.some((p) => p.id === item.id)) {
      savedPresets.unshift(item);
      savedPresets = savedPresets.slice(0, 8);
      if (window.VibeRuntime) await window.VibeRuntime.storage.set(APP_ID, STORAGE_KEY, savedPresets);
      renderSavedPresets();
      if (window.showToast) window.showToast('Ölçü favorilere kaydedildi.');
    }
  }

  function applySavedPreset(w, h, label) {
    document.getElementById('input-target-w').value = String(w);
    document.getElementById('input-target-h').value = String(h);
    document.getElementById('preset-info-title').textContent = label;
    onCustomDimensionsChange();
  }

  async function clearSavedPresets() {
    savedPresets = [];
    if (window.VibeRuntime) await window.VibeRuntime.storage.remove(APP_ID, STORAGE_KEY);
    renderSavedPresets();
  }

  function renderSavedPresets() {
    const box = document.getElementById('saved-presets-list');
    if (!box) return;
    if (!savedPresets.length) {
      box.innerHTML = '<div class="text-xs text-mistral-stone py-2 text-center">Henüz kayıtlı ölçü yok.</div>';
      return;
    }
    box.innerHTML = savedPresets
      .map(
        (p) => '<div class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-mistral-cream-light border border-mistral-hairline text-xs">' +
          '<button type="button" onclick="window.applySavedPreset(' + Number(p.width) + ', ' + Number(p.height) + ', \'' + escapeHtml(p.label) + '\')" class="text-left font-semibold text-mistral-ink hover:text-mistral-orange truncate flex-1 cursor-pointer">' +
          escapeHtml(p.label) + '</button>' +
          '<span class="font-mono text-[11px] text-mistral-stone">' + Number(p.width) + '×' + Number(p.height) + '</span></div>'
      )
      .join('');
  }

  window.onPlatformChange = onPlatformChange;
  window.onPresetSelect = onPresetSelect;
  window.onCustomDimensionsChange = onCustomDimensionsChange;
  window.onImageFileSelected = onImageFileSelected;
  window.loadSampleCanvasImage = loadSampleCanvasImage;
  window.renderCropCanvas = renderCropCanvas;
  window.updateExportEstimate = updateExportEstimate;
  window.downloadCroppedImage = downloadCroppedImage;
  window.saveCurrentPreset = saveCurrentPreset;
  window.applySavedPreset = applySavedPreset;
  window.clearSavedPresets = clearSavedPresets;

  document.addEventListener('DOMContentLoaded', () => {
    loadSavedPresets();
    loadSampleCanvasImage();
    fetchCropDenCatalog();
  });
})();
