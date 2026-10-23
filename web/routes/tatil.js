module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/tatil/app.css?v=20261023a">
      <script src="/static/apps/tatil/app.js?v=20261023a" defer></script>
    `;

    const content = `
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Sanat, Kültür & Takvim</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Küresel Tatil Takvimi & Köprü İzin Rehberi</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5">
            100+ ülkenin resmi tatilleri, eşzamanlı çoklu ülke karşılaştırması ve uzun hafta sonu fırsatları.
          </p>
        </div>

        <!-- Dışa Aktarma Butonu -->
        <div class="flex items-center gap-2">
          <button onclick="exportICS()" class="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-2">
            <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span> Takvime Aktar (.ics)
          </button>
        </div>
      </div>

      <!-- 1. ÜLKE VE YIL SEÇİM PANELİ (MULTI-COUNTRY & YEAR SELECTOR) -->
      <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-5">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate mb-1">
              Karşılaştırılacak Ülkeler
            </label>
            <p class="text-mistral-slate text-xs">
              Varsayılan olarak <b>Türkiye</b> seçilidir. Yanına dilediğiniz kadar ülke ekleyerek eşzamanlı tatilleri görebilirsiniz:
            </p>
          </div>

          <!-- Yıl Seçici -->
          <div class="flex items-center gap-2 bg-white border border-mistral-hairline p-1 rounded-2xl shrink-0">
            <button onclick="setYear(2025)" id="btn-year-2025" class="px-3 py-1.5 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition">2025</button>
            <button onclick="setYear(2026)" id="btn-year-2026" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 transition shadow">2026</button>
            <button onclick="setYear(2027)" id="btn-year-2027" class="px-3 py-1.5 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition">2027</button>
          </div>
        </div>

        <!-- Seçili Ülke Rozetleri (Active Tags) -->
        <div class="flex flex-wrap items-center gap-2" id="selected-countries-container">
          <!-- JS ile doldurulur -->
        </div>

        <!-- Hızlı Ülke Ekleme ve Açılır Liste -->
        <div class="pt-3 border-t border-mistral-hairline flex flex-col sm:flex-row gap-3 items-center">
          <div class="flex flex-wrap items-center gap-1.5 text-xs flex-1">
            <span class="text-mistral-stone text-[11px] mr-1">Hızlı Ekle:</span>
            <button onclick="toggleCountry('DE')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇩🇪 Almanya</button>
            <button onclick="toggleCountry('US')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇺🇸 ABD</button>
            <button onclick="toggleCountry('GB')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇬🇧 Birleşik Krallık</button>
            <button onclick="toggleCountry('AZ')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇦🇿 Azerbaycan</button>
            <button onclick="toggleCountry('FR')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇫🇷 Fransa</button>
            <button onclick="toggleCountry('IT')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇮🇹 İtalya</button>
          </div>

          <!-- Tüm Ülkeler Dropdown -->
          <div class="w-full sm:w-64">
            <select id="select-all-countries" onchange="if(this.value){toggleCountry(this.value); this.value='';}" class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink focus:border-amber-400 focus:outline-none">
              <option value="">+ Başka bir ülke ekle...</option>
            </select>
          </div>
        </div>

      </div>

      <!-- 2. KÖPRÜ İZİN FIRSATLARI BÖLÜMÜ (LONG WEEKENDS & BRIDGE DAYS) -->
      <div class="p-6 rounded-3xl bg-amber-50 border border-amber-200 shadow-xl mb-8 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl"><svg class="w-6 h-6 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/></svg></span>
            <div>
              <h2 class="text-sm font-bold text-mistral-ink">Akıllı Köprü İzin ve Uzun Hafta Sonu Fırsatları</h2>
              <p class="text-mistral-slate text-xs">Az izin günü kullanarak maksimum tatil yapabileceğiniz fırsat dönemleri:</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-mono font-bold" id="bridge-country-badge">
            🇹🇷 Türkiye
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5" id="bridge-days-container">
          <!-- JS ile doldurulur -->
        </div>
      </div>

      <!-- 3. GÖRÜNÜM MODLARI VE FİLTRELER -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div class="flex p-1 rounded-xl bg-white border border-mistral-hairline">
          <button onclick="setViewMode('timeline')" id="btn-view-timeline" class="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 transition flex items-center gap-1.5 shadow">
            <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span> Birleşik Kronolojik Liste
          </button>
          <button onclick="setViewMode('matrix')" id="btn-view-matrix" class="px-4 py-1.5 rounded-lg text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-1.5">
            <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span> Ülke Sütunları
          </button>
          <button onclick="setViewMode('calendar')" id="btn-view-calendar" class="px-4 py-1.5 rounded-lg text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-1.5">
            <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span> Ay Gruplu Görünüm
          </button>
        </div>

        <div class="text-xs text-mistral-slate font-mono" id="holidays-summary-count">
          Yükleniyor...
        </div>
      </div>

      <!-- 4. TATİL VERİLERİ ALANI (CONTAINER) -->
      <div id="holidays-main-container">
        <!-- JS ile seçilen görünüm moduna göre çizilir -->
      </div>

      <div id="loading-spinner" class="py-16 text-center text-mistral-slate text-sm flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
        <span>Resmi tatil verileri ve takvimler senkronize ediliyor...</span>
      </div>

      <!-- Toast Bildirimi -->
      <div id="tatil-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı -->
    `;

    res.send(pageTemplate('Küresel Tatil Takvimi', content, extraHead));
  };
};
