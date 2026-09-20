// İlaç & Prospektüs Rehberi - Client Application
// openFDA, Türkiye Farmakope & RxNorm Entegrasyonu

let currentDrugData = null;
let activeTab = 'overview';

// Güvenli HTML Kaçış Yardımcısı (XSS Savunması)
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// İlaç Arama Fonksiyonu (Calpol, Pedifen, Parol, Arveles ve tüm FDA ilaçları)
async function searchDrug(query) {
  const inputEl = document.getElementById('drug-search-input');
  const q = (query || (inputEl ? inputEl.value : '')).trim();
  
  if (!q || q.length < 2) {
    if (typeof showToast === 'function') {
      showToast('Lütfen aramak için en az 2 karakter girin.', 'warning');
    }
    return;
  }

  if (inputEl && query) {
    inputEl.value = query;
  }

  const resultsContainer = document.getElementById('search-results-list');
  const detailsContainer = document.getElementById('drug-details-container');
  const notFoundContainer = document.getElementById('search-not-found');
  const loadingIndicator = document.getElementById('search-loading');

  if (loadingIndicator) loadingIndicator.classList.remove('hidden');
  if (notFoundContainer) notFoundContainer.classList.add('hidden');

  try {
    const res = await fetch(`/api/ilac/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();

    if (loadingIndicator) loadingIndicator.classList.add('hidden');

    if (!data.success || !data.results || data.results.length === 0) {
      // Sonuç bulunamadığında kullanıcıyı bilgilendir ve öneriler sun
      if (detailsContainer) detailsContainer.classList.add('hidden');
      if (resultsContainer) resultsContainer.classList.add('hidden');
      if (notFoundContainer) {
        document.getElementById('not-found-query').innerText = `"${q}"`;
        notFoundContainer.classList.remove('hidden');
      }
      if (typeof showToast === 'function') {
        showToast(`"${q}" için kayıt bulunamadı. Önerilen etken maddeleri deneyebilirsiniz.`, 'info');
      }
      return;
    }

    // Sonuç bulundu: Sonuç listesini ve detay alanını göster
    if (notFoundContainer) notFoundContainer.classList.add('hidden');
    if (detailsContainer) detailsContainer.classList.remove('hidden');

    // İlk sonucu doğrudan detay olarak yükle
    loadDrugDetails(data.results[0].brandName || data.results[0].genericName);

    // Eğer birden fazla sonuç varsa seçim listesi oluştur
    if (resultsContainer) {
      if (data.results.length > 1) {
        resultsContainer.innerHTML = data.results.map(item => `
          <button 
            type="button" 
            onclick="loadDrugDetails('${escapeHtml(item.brandName)}')" 
            class="text-left p-3 rounded-lg border border-mistral-hairline hover:border-mistral-orange hover:bg-mistral-cream transition flex items-center justify-between group cursor-pointer bg-white">
            <div>
              <div class="font-bold text-sm text-mistral-ink group-hover:text-mistral-orange">${escapeHtml(item.brandName)}</div>
              <div class="text-xs text-mistral-slate">${escapeHtml(item.genericName)} &bull; <span class="text-mistral-stone">${escapeHtml(item.route)}</span></div>
            </div>
            <span class="text-xs text-mistral-orange font-semibold flex items-center gap-1">
              İncele &rarr;
            </span>
          </button>
        `).join('');
        resultsContainer.classList.remove('hidden');
      } else {
        resultsContainer.classList.add('hidden');
      }
    }
  } catch (err) {
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    console.error('İlaç arama hatası:', err);
    if (typeof showToast === 'function') {
      showToast('İlaç araması sırasında sunucuya ulaşılamadı.', 'danger');
    }
  }
}

// Belirli Bir İlacın Detaylarını Çek ve Göster
async function loadDrugDetails(drugName) {
  const container = document.getElementById('drug-details-container');
  const notFoundContainer = document.getElementById('search-not-found');
  const loadingEl = document.getElementById('drug-loading-skeleton');
  
  if (notFoundContainer) notFoundContainer.classList.add('hidden');
  if (container) {
    container.classList.remove('hidden');
    container.classList.add('opacity-40');
  }
  if (loadingEl) loadingEl.classList.remove('hidden');

  try {
    const res = await fetch(`/api/ilac/details?name=${encodeURIComponent(drugName)}`);
    const data = await res.json();

    if (loadingEl) loadingEl.classList.add('hidden');
    if (container) container.classList.remove('opacity-40');

    if (!data.success || !data.drug) {
      if (typeof showToast === 'function') {
        showToast(data.error || 'İlaç prospektüs detayları alınamadı.', 'warning');
      }
      return;
    }

    currentDrugData = data.drug;
    renderDrugDetails(data.drug, data.source);
  } catch (err) {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (container) container.classList.remove('opacity-40');
    console.error('İlaç detay hatası:', err);
    if (typeof showToast === 'function') {
      showToast('İlaç bilgileri yüklenirken bir hata oluştu.', 'danger');
    }
  }
}

// İlaç Kartı ve Sekmelerini Ekrana Çiz
function renderDrugDetails(drug, source) {
  // Başlık Bilgileri
  const titleEl = document.getElementById('drug-title');
  const genericEl = document.getElementById('drug-generic');
  const mfgEl = document.getElementById('drug-manufacturer');
  const routeEl = document.getElementById('drug-route');
  const sourceEl = document.getElementById('drug-source-tag');

  if (titleEl) titleEl.innerText = drug.brandName;
  if (genericEl) genericEl.innerText = drug.genericName;
  if (mfgEl) mfgEl.innerText = drug.manufacturer;
  if (routeEl) routeEl.innerText = drug.route;
  if (sourceEl) sourceEl.innerText = source || 'Doğrulanmış Farmakope Kaydı';

  // Eğer içerik yabancı dildeyse (FDA doğrudan kaydı) çeviri bannerı göster
  const translationBannerEl = document.getElementById('drug-translation-banner');
  if (translationBannerEl) {
    if (drug.isEnglishContent) {
      translationBannerEl.classList.remove('hidden');
      const gTranslateUrl = `https://translate.google.com/translate?sl=en&tl=tr&u=${encodeURIComponent(window.location.href)}`;
      translationBannerEl.innerHTML = `
        <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div class="flex items-center gap-2">
            <span class="text-base">🌐</span>
            <span>Bu prospektüs <strong>U.S. FDA</strong> resmi veritabanından orijinal İngilizce metin olarak getirilmiştir.</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded font-mono">İpucu: Sağ tık &rarr; Türkçe'ye Çevir</span>
            <a href="${gTranslateUrl}" target="_blank" rel="noopener" class="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold transition shrink-0">
              Türkçe Çevir &rarr;
            </a>
          </div>
        </div>
      `;
    } else {
      translationBannerEl.classList.add('hidden');
      translationBannerEl.innerHTML = '';
    }
  }

  // 1. Sekme: Genel Bakış & Endikasyonlar
  const langAttr = drug.isEnglishContent ? 'lang="en" translate="yes"' : 'lang="tr"';
  document.getElementById('tab-content-purpose').innerHTML = `
    <div class="space-y-4 text-mistral-slate text-sm leading-relaxed" ${langAttr}>
      <div class="p-4 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
        <strong class="text-mistral-ink block mb-1 font-bold text-sm flex items-center gap-1.5">
          <span>💡</span> Kullanım Amacı (Terapötik Etki)
        </strong>
        <p>${escapeHtml(drug.purpose)}</p>
      </div>
      <div>
        <strong class="text-mistral-ink block mb-1.5 font-bold text-sm flex items-center gap-1.5">
          <span>📋</span> Endikasyonlar (Hangi Hastalık ve Durumlarda Kullanılır?)
        </strong>
        <p class="bg-stone-50/70 p-4 rounded-xl border border-mistral-hairline">${escapeHtml(drug.indications)}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
        <div class="p-3.5 rounded-xl bg-white border border-mistral-hairline shadow-2xs">
          <span class="text-mistral-stone block font-medium">Etken Madde:</span>
          <span class="font-bold text-mistral-ink font-mono mt-0.5 block">${escapeHtml(drug.substanceName)}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-white border border-mistral-hairline shadow-2xs">
          <span class="text-mistral-stone block font-medium">Uygulama Şekli & Yolu:</span>
          <span class="font-bold text-mistral-ink mt-0.5 block">${escapeHtml(drug.route)}</span>
        </div>
      </div>
    </div>
  `;

  // 2. Sekme: Uyarılar & Kontrendikasyonlar
  document.getElementById('tab-content-warnings').innerHTML = `
    <div class="space-y-4 text-mistral-slate text-sm leading-relaxed" ${langAttr}>
      <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
        <strong class="block mb-1.5 font-bold flex items-center gap-1.5 text-rose-700">
          <i class="fa-solid fa-triangle-exclamation"></i> Kimler Kesinlikle Kullanamaz? (Kontrendikasyonlar)
        </strong>
        <p class="text-xs leading-relaxed">${escapeHtml(drug.doNotUse)}</p>
      </div>
      <div class="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950">
        <strong class="block mb-1.5 font-bold flex items-center gap-1.5 text-amber-800">
          <i class="fa-solid fa-circle-exclamation"></i> Önemli Güvenlik Uyarıları & Önlemler
        </strong>
        <p class="text-xs leading-relaxed">${escapeHtml(drug.warnings)}</p>
      </div>
    </div>
  `;

  // 3. Sekme: Yan Etkiler & Risk Analitiği (Türkçe Terimlerle)
  const reactionsHtml = (drug.adverseReactions || []).map(r => `
    <div class="space-y-1">
      <div class="flex items-center justify-between text-xs">
        <span class="font-medium text-mistral-ink">${escapeHtml(r.term)}</span>
        <span class="text-mistral-stone font-mono">${r.count ? r.count.toLocaleString('tr-TR') + ' vaka' : '%' + r.percent}</span>
      </div>
      <div class="adverse-bar-track">
        <div class="adverse-bar-fill" style="width: ${r.percent}%;"></div>
      </div>
    </div>
  `).join('');

  document.getElementById('tab-content-adverse').innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between text-xs text-mistral-slate pb-2 border-b border-mistral-hairline">
        <span class="font-medium">Resmi Advers Olay Bildirim Sıklığı</span>
        <span class="text-mistral-orange font-semibold">Göreceli Dağılım</span>
      </div>
      <div class="space-y-3">
        ${reactionsHtml || '<p class="text-xs text-mistral-stone">Bildirilen belirgin yan etki kaydı bulunamadı.</p>'}
      </div>
      <div class="p-3 rounded-lg bg-mistral-cream/60 border border-mistral-beige-deep text-[11px] text-mistral-slate leading-normal">
        <strong>📌 Bilgilendirme:</strong> Bu yan etkiler resmi sağlık bildirim raporlarından derlenmiştir. İlacı kullanan herkeste görüleceği anlamına gelmez. Beklenmeyen bir belirti gördüğünüzde derhal hekiminize danışınız.
      </div>
    </div>
  `;

  // 4. Sekme: Dozaj & Saklama Koşulları
  document.getElementById('tab-content-dosage').innerHTML = `
    <div class="space-y-4 text-mistral-slate text-sm leading-relaxed" ${langAttr}>
      <div class="p-4 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
        <strong class="text-mistral-ink block mb-1 font-bold text-sm flex items-center gap-1.5">
          <span>⏱️</span> Standart Kullanım & Dozaj Rehberi
        </strong>
        <p>${escapeHtml(drug.dosage)}</p>
      </div>
      <div class="p-4 rounded-xl bg-white border border-mistral-hairline text-xs space-y-2">
        <strong class="text-mistral-ink block font-bold">📦 Saklama Koşulları:</strong>
        <p>25°C altındaki kuru oda sıcaklığında, nemden ve doğrudan güneş ışığından koruyarak ambalajında saklayınız.</p>
        <p class="text-rose-600 font-semibold flex items-center gap-1">
          <i class="fa-solid fa-triangle-exclamation"></i> Reçeteli ilaçlarınızı hekiminizin belirttiği doz ve süreden farklı kullanmayınız.
        </p>
      </div>
    </div>
  `;
}

// Hazır İlaç Seçimi (Pill butonları)
function selectPresetDrug(drugName) {
  const input = document.getElementById('drug-search-input');
  if (input) input.value = drugName;
  searchDrug(drugName);
}

// Global Kapsama Bağla (Window Object)
window.searchDrug = searchDrug;
window.loadDrugDetails = loadDrugDetails;
window.selectPresetDrug = selectPresetDrug;

// Sayfa Yüklendiğinde Varsayılan İlaç (Calpol / Parasetamol) İle Başlat
document.addEventListener('DOMContentLoaded', () => {
  searchDrug('Calpol');
});
