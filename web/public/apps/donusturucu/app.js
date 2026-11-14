(function () {
  'use strict';

  const APP_ID = 'dosya-donusturucu';
  const STORAGE_KEY = 'donusturucu_profiles_v1';
  let savedProfiles = [];
  let selectedImageObj = null;

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function checkCleverUtilsStatus() {
    try {
      const [limRes, hlthRes] = await Promise.all([
        fetch('https://cleverutils.com/api/v1/limits', { signal: AbortSignal.timeout(8000) }),
        fetch('https://cleverutils.com/api/v1/health', { signal: AbortSignal.timeout(8000) }),
      ]);
      if (limRes.ok) {
        const limJson = await limRes.json();
        const u = (limJson.data && limJson.data.usage) || {};
        const l = (limJson.data && limJson.data.limits) || {};
        document.getElementById('clever-quota-hour').textContent = (u.remaining_hour ?? 150) + ' / ' + (l.hourly ?? 150);
        document.getElementById('clever-quota-day').textContent = (u.remaining_day ?? 1000) + ' / ' + (l.daily ?? 1000);
      }
      if (hlthRes.ok) {
        const hJson = await hlthRes.json();
        const bins = (hJson.data && hJson.data.binaries) || {};
        const names = Object.keys(bins).filter((k) => bins[k] && bins[k].available);
        document.getElementById('clever-engine-info').textContent = 'Aktif Motorlar: ' + (names.join(', ') || 'ImageMagick, FFmpeg, LibreOffice') + ' + Yerel Tarayıcı Motoru.';
      }
    } catch (_) {
      document.getElementById('clever-status-text').textContent = 'Yerel Motor Aktif';
      document.getElementById('clever-engine-info').textContent = 'Tüm dönüşümler %100 tarayıcı içinde çevrimdışı olarak yürütülüyor.';
    }
  }

  function switchConvTab(tab) {
    const isData = tab === 'data';
    document.getElementById('panel-conv-data').classList.toggle('hidden', !isData);
    document.getElementById('panel-conv-image').classList.toggle('hidden', isData);
    document.getElementById('tab-btn-data').className = 'vibe-btn vibe-btn-sm cursor-pointer ' + (isData ? 'vibe-btn-primary' : 'vibe-btn-secondary');
    document.getElementById('tab-btn-image').className = 'vibe-btn vibe-btn-sm cursor-pointer ' + (!isData ? 'vibe-btn-primary' : 'vibe-btn-secondary');
  }

  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((h, i) => { obj[h || ('col_' + i)] = cols[i] ?? ''; });
      return obj;
    });
  }

  function toCsv(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return '';
    const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r || {}))));
    const esc = (v) => {
      const s = String(v == null ? '' : v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const lines = [headers.map(esc).join(',')];
    rows.forEach((r) => {
      lines.push(headers.map((h) => esc(r[h])).join(','));
    });
    return lines.join('\n');
  }

  function toMarkdownTable(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return '';
    const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r || {}))));
    const headLine = '| ' + headers.join(' | ') + ' |';
    const sepLine = '| ' + headers.map(() => '---').join(' | ') + ' |';
    const bodyLines = rows.map((r) => '| ' + headers.map((h) => String(r[h] ?? '').replace(/\|/g, '\\|')).join(' | ') + ' |');
    return [headLine, sepLine, ...bodyLines].join('\n');
  }

  function toXml(rows) {
    const items = (Array.isArray(rows) ? rows : [rows]).map((r) => {
      const fields = Object.entries(r || {}).map(([k, v]) => {
        const tag = String(k).replace(/[^a-zA-Z0-9_-]/g, '_') || 'field';
        return '    <' + tag + '>' + escapeHtml(v) + '</' + tag + '>';
      }).join('\n');
      return '  <item>\n' + fields + '\n  </item>';
    }).join('\n');
    return '<?xml version="1.0" encoding="UTF-8"?>\n<records>\n' + items + '\n</records>';
  }

  function runDataConversion() {
    const srcFmt = document.getElementById('data-src-fmt').value;
    const dstFmt = document.getElementById('data-dst-fmt').value;
    const raw = document.getElementById('data-input-area').value.trim();
    const outEl = document.getElementById('data-output-area');
    if (!raw) { outEl.value = ''; return; }

    try {
      let rows = [];
      if (srcFmt === 'json') {
        const parsed = JSON.parse(raw);
        rows = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        rows = parseCsv(raw);
      }

      if (dstFmt === 'json') outEl.value = JSON.stringify(rows, null, 2);
      else if (dstFmt === 'csv') outEl.value = toCsv(rows);
      else if (dstFmt === 'md') outEl.value = toMarkdownTable(rows);
      else if (dstFmt === 'xml') outEl.value = toXml(rows);
    } catch (err) {
      outEl.value = 'Dönüştürme Hatası: ' + err.message;
    }
  }

  function loadSampleDataInput() {
    document.getElementById('data-src-fmt').value = 'json';
    document.getElementById('data-input-area').value = JSON.stringify([
      { sehir: 'Ankara', bolge: 'İç Anadolu', nufus: 5803482, plaka: '06' },
      { sehir: 'İstanbul', bolge: 'Marmara', nufus: 15655924, plaka: '34' },
      { sehir: 'İzmir', bolge: 'Ege', nufus: 4479525, plaka: '35' }
    ], null, 2);
    runDataConversion();
  }

  function onDataFileUploaded(ev) {
    const file = ev.target && ev.target.files && ev.target.files[0];
    if (!file) return;
    if (file.name.endsWith('.csv')) document.getElementById('data-src-fmt').value = 'csv';
    else if (file.name.endsWith('.json')) document.getElementById('data-src-fmt').value = 'json';
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('data-input-area').value = String(e.target.result || '');
      runDataConversion();
    };
    reader.readAsText(file);
  }

  function copyConvertedData() {
    const val = document.getElementById('data-output-area').value;
    if (window.safeCopyToClipboard) window.safeCopyToClipboard(val, 'Çıktı panoya kopyalandı!');
  }

  function downloadConvertedData() {
    const val = document.getElementById('data-output-area').value;
    if (!val) return;
    const dstFmt = document.getElementById('data-dst-fmt').value;
    const blob = new Blob([val], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vibe-converted.' + dstFmt;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function onConvImageSelected(ev) {
    const file = ev.target && ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        selectedImageObj = img;
        document.getElementById('img-conv-status').textContent = 'Yüklendi: ' + file.name + ' (' + img.naturalWidth + '×' + img.naturalHeight + ' px)';
      };
      img.src = String(e.target.result || '');
    };
    reader.readAsDataURL(file);
  }

  function convertAndDownloadImage() {
    if (!selectedImageObj) {
      if (window.showToast) window.showToast('Lütfen önce bir görsel seçin.');
      return;
    }
    const fmt = document.getElementById('img-dst-fmt').value || 'image/webp';
    const ext = fmt === 'image/png' ? 'png' : fmt === 'image/jpeg' ? 'jpg' : 'webp';
    const c = document.createElement('canvas');
    c.width = selectedImageObj.naturalWidth;
    c.height = selectedImageObj.naturalHeight;
    c.getContext('2d').drawImage(selectedImageObj, 0, 0);
    c.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vibe-converted.' + ext;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      if (window.showToast) window.showToast('Görsel ' + ext.toUpperCase() + ' olarak indirildi.');
    }, fmt, 0.92);
  }

  async function loadConvProfiles() {
    if (window.VibeRuntime && typeof window.VibeRuntime.storage.sync === 'function') {
      await window.VibeRuntime.storage.sync(APP_ID);
    }
    const raw = window.VibeRuntime ? window.VibeRuntime.storage.get(APP_ID, STORAGE_KEY, []) : [];
    savedProfiles = Array.isArray(raw) ? raw : [];
    renderConvProfiles();
  }

  async function saveConversionProfile() {
    const src = document.getElementById('data-src-fmt').value;
    const dst = document.getElementById('data-dst-fmt').value;
    const item = { id: src + '_to_' + dst, label: src.toUpperCase() + ' → ' + dst.toUpperCase(), src, dst };
    if (!savedProfiles.some((p) => p.id === item.id)) {
      savedProfiles.unshift(item);
      if (window.VibeRuntime) await window.VibeRuntime.storage.set(APP_ID, STORAGE_KEY, savedProfiles);
      renderConvProfiles();
      if (window.showToast) window.showToast('Dönüştürme profili kaydedildi.');
    }
  }

  function applyConvProfile(src, dst) {
    document.getElementById('data-src-fmt').value = src;
    document.getElementById('data-dst-fmt').value = dst;
    runDataConversion();
  }

  async function clearConvProfiles() {
    savedProfiles = [];
    if (window.VibeRuntime) await window.VibeRuntime.storage.remove(APP_ID, STORAGE_KEY);
    renderConvProfiles();
  }

  function renderConvProfiles() {
    const box = document.getElementById('conv-profiles-list');
    if (!box) return;
    if (!savedProfiles.length) {
      box.innerHTML = '<div class="text-xs text-mistral-stone py-2 text-center">Henüz kayıtlı profil yok.</div>';
      return;
    }
    box.innerHTML = savedProfiles.map((p) =>
      '<div class="flex items-center justify-between p-2.5 rounded-xl bg-mistral-cream-light border border-mistral-hairline text-xs">' +
      '<button type="button" onclick="window.applyConvProfile(\'' + escapeHtml(p.src) + '\', \'' + escapeHtml(p.dst) + '\')" class="font-semibold text-mistral-ink hover:text-mistral-orange cursor-pointer">' + escapeHtml(p.label) + '</button>' +
      '</div>'
    ).join('');
  }

  window.switchConvTab = switchConvTab;
  window.runDataConversion = runDataConversion;
  window.loadSampleDataInput = loadSampleDataInput;
  window.onDataFileUploaded = onDataFileUploaded;
  window.copyConvertedData = copyConvertedData;
  window.downloadConvertedData = downloadConvertedData;
  window.onConvImageSelected = onConvImageSelected;
  window.convertAndDownloadImage = convertAndDownloadImage;
  window.saveConversionProfile = saveConversionProfile;
  window.applyConvProfile = applyConvProfile;
  window.clearConvProfiles = clearConvProfiles;

  document.addEventListener('DOMContentLoaded', () => {
    loadConvProfiles();
    loadSampleDataInput();
    checkCleverUtilsStatus();
  });
})();
