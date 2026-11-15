(function () {
  'use strict';

  const APP_ID = 'barkod-studyosu';
  const STORAGE_KEY = 'barkod_saved_items_v1';
  let savedBarcodes = [];
  let lastSvgText = '';
  let fetchSeq = 0;

  const SAMPLE_BY_TYPE = {
    code128: 'VIBE-2026-TR',
    ean13: '869012345678',
    upca: '01234567890',
    code39: 'MKSTUDIO2026',
    datamatrix: 'https://app.melihkarasu.com',
    pdf417: 'VIBE CODED APPS BARCODE STUDIO',
  };

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildOrcaUrl(type, data, text, fmt) {
    const params = new URLSearchParams({
      type: type || 'code128',
      data: data || 'VIBE2026',
      format: fmt || 'svg',
    });
    if (text) params.set('text', text);
    return 'https://barcode.orcascan.com/?' + params.toString();
  }

  /**
   * Orca Scan'in sunucu taraflı OCR-B fontu Latin-1 dışındaki Türkçe karakterleri (ç, ş, ğ, ı, Ç, Ş, Ğ, İ) düşürür.
   * Bu nedenle ham barkod çubukları metinsiz çekilir ve altına tam UTF-8 / Türkçe destekli yerel SVG <text> katmanı eklenir.
   */
  function injectUnicodeLabelIntoSvg(rawSvg, labelText) {
    const cleanLabel = String(labelText || '').trim();
    if (!cleanLabel) return rawSvg;

    const wMatch = rawSvg.match(/width="(\d+(?:\.\d+)?)"/);
    const hMatch = rawSvg.match(/height="(\d+(?:\.\d+)?)"/);
    const origW = wMatch ? Number(wMatch[1]) : 1054;
    const origH = hMatch ? Number(hMatch[1]) : 484;
    const extraH = 96;
    const newH = origH + extraH;
    const fontSize = Math.max(22, Math.min(44, Math.round(origW / Math.max(16, cleanLabel.length * 0.92))));
    const textY = origH + 48;

    let updated = rawSvg
      .replace(/width="\d+(?:\.\d+)?"/, 'width="' + origW + '"')
      .replace(/height="\d+(?:\.\d+)?"/, 'height="' + newH + '"')
      .replace(/viewBox="0 0 \d+(?:\.\d+)? \d+(?:\.\d+)?"/, 'viewBox="0 0 ' + origW + ' ' + newH + '"')
      .replace(
        /(<svg id="__background"[^>]*height=")(\d+(?:\.\d+)?)("[^>]*>\s*<rect[^>]*height=")(\d+(?:\.\d+)?)(")/,
        '$1' + newH + '$3' + newH + '$5'
      );

    const textNode =
      '<text x="' + (origW / 2).toFixed(1) + '" y="' + textY + '" ' +
      'text-anchor="middle" fill="#000000" ' +
      'font-family="\'JetBrains Mono\', \'Inter\', system-ui, -apple-system, sans-serif" ' +
      'font-size="' + fontSize + '" font-weight="700" letter-spacing="1.5">' +
      escapeHtml(cleanLabel) +
      '</text></svg>';

    return updated.replace(/<\/svg>\s*$/, textNode);
  }

  function onBarcodeTypeChange() {
    const t = document.getElementById('barcode-type').value || 'code128';
    document.getElementById('barcode-data').value = SAMPLE_BY_TYPE[t] || 'VIBE2026';
    generateBarcode();
  }

  async function generateBarcode() {
    const type = document.getElementById('barcode-type').value || 'code128';
    const data = (document.getElementById('barcode-data').value || '').trim();
    const text = (document.getElementById('barcode-text').value || '').trim();
    const noteEl = document.getElementById('barcode-status-note');
    const imgEl = document.getElementById('barcode-preview-img');
    if (!data) return;

    const seq = ++fetchSeq;
    // Barkod çubuklarını metinsiz çekip Türkçe karakter destekli vektörel <text> katmanını yerelde ekle
    const barsOnlyUrl = buildOrcaUrl(type, data, '', 'svg');
    if (noteEl) noteEl.textContent = 'Orca Scan API · ' + type.toUpperCase() + ' · ' + data;

    try {
      const res = await fetch(barsOnlyUrl, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const rawSvg = await res.text();
      if (seq !== fetchSeq) return;
      lastSvgText = injectUnicodeLabelIntoSvg(rawSvg, text || data);
      if (imgEl) {
        imgEl.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(lastSvgText);
      }
    } catch (_) {
      if (imgEl) imgEl.src = buildOrcaUrl(type, data, text, 'svg');
    }
  }

  function downloadBarcodeSvg() {
    const type = document.getElementById('barcode-type').value || 'code128';
    const data = (document.getElementById('barcode-data').value || 'barkod').trim();
    if (!lastSvgText) {
      window.open(buildOrcaUrl(type, data, '', 'svg'), '_blank', 'noopener,noreferrer');
      return;
    }
    const blob = new Blob([lastSvgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'barkod-' + type + '-' + data.replace(/[^a-zA-Z0-9_-]/g, '') + '.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    if (window.showToast) window.showToast('Vektörel SVG barkod indirildi.');
  }

  function copyBarcodeUrl() {
    const type = document.getElementById('barcode-type').value || 'code128';
    const data = (document.getElementById('barcode-data').value || '').trim();
    const text = (document.getElementById('barcode-text').value || '').trim();
    const url = buildOrcaUrl(type, data, text, 'svg');
    if (window.safeCopyToClipboard) window.safeCopyToClipboard(url, 'Barkod SVG adresi kopyalandı!');
  }

  async function loadSavedBarcodes() {
    if (window.VibeRuntime && typeof window.VibeRuntime.storage.sync === 'function') {
      await window.VibeRuntime.storage.sync(APP_ID);
    }
    const raw = window.VibeRuntime ? window.VibeRuntime.storage.get(APP_ID, STORAGE_KEY, []) : [];
    savedBarcodes = Array.isArray(raw) ? raw : [];
    renderSavedBarcodes();
  }

  async function saveCurrentBarcode() {
    const type = document.getElementById('barcode-type').value || 'code128';
    const data = (document.getElementById('barcode-data').value || '').trim();
    const text = (document.getElementById('barcode-text').value || '').trim();
    if (!data) return;
    const item = { id: type + '_' + data, type, data, text };
    if (!savedBarcodes.some((b) => b.id === item.id)) {
      savedBarcodes.unshift(item);
      savedBarcodes = savedBarcodes.slice(0, 10);
      if (window.VibeRuntime) await window.VibeRuntime.storage.set(APP_ID, STORAGE_KEY, savedBarcodes);
      renderSavedBarcodes();
      if (window.showToast) window.showToast('Barkod koleksiyona eklendi.');
    }
  }

  function applySavedBarcode(type, data, text) {
    document.getElementById('barcode-type').value = type;
    document.getElementById('barcode-data').value = data;
    document.getElementById('barcode-text').value = text || '';
    generateBarcode();
  }

  async function clearSavedBarcodes() {
    savedBarcodes = [];
    if (window.VibeRuntime) await window.VibeRuntime.storage.remove(APP_ID, STORAGE_KEY);
    renderSavedBarcodes();
  }

  function renderSavedBarcodes() {
    const box = document.getElementById('saved-barcodes-list');
    if (!box) return;
    if (!savedBarcodes.length) {
      box.innerHTML = '<div class="text-xs text-mistral-stone py-2 text-center">Henüz kayıtlı barkod yok.</div>';
      return;
    }
    box.innerHTML = savedBarcodes.map((b) =>
      '<div class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-mistral-cream-light border border-mistral-hairline text-xs">' +
      '<button type="button" onclick="window.applySavedBarcode(\'' + escapeHtml(b.type) + '\', \'' + escapeHtml(b.data) + '\', \'' + escapeHtml(b.text || '') + '\')" class="text-left font-semibold text-mistral-ink hover:text-mistral-orange truncate flex-1 cursor-pointer">' +
      escapeHtml(b.type.toUpperCase()) + ' · ' + escapeHtml(b.data) + '</button>' +
      '</div>'
    ).join('');
  }

  window.onBarcodeTypeChange = onBarcodeTypeChange;
  window.generateBarcode = generateBarcode;
  window.downloadBarcodeSvg = downloadBarcodeSvg;
  window.copyBarcodeUrl = copyBarcodeUrl;
  window.saveCurrentBarcode = saveCurrentBarcode;
  window.applySavedBarcode = applySavedBarcode;
  window.clearSavedBarcodes = clearSavedBarcodes;

  document.addEventListener('DOMContentLoaded', () => {
    loadSavedBarcodes();
    generateBarcode();
  });
})();
