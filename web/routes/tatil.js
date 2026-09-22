module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/tatil/app.css">
      <script src="/static/apps/tatil/app.js" defer></script>
    `;

    const content = `
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-white transition text-sm flex items-center gap-1">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">Mikro Uygulama #4</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight mt-1 text-mistral-ink flex items-center gap-2">
            <span>📅</span> Küresel Tatil Takvimi & Köprü İzin Rehberi
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5">
            100+ ülkenin resmi tatilleri, eşzamanlı çoklu ülke karşılaştırması ve uzun hafta sonu fırsatları.
          </p>
        </div>

        <!-- Dışa Aktarma Butonu -->
        <div class="flex items-center gap-2">
          <button onclick="exportICS()" class="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 flex items-center gap-2">
            <span>📥</span> Takvime Aktar (.ics)
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
      <div class="p-6 rounded-3xl bg-white from-amber-500/10   border border-amber-500/30 shadow-xl mb-8 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">🏖️</span>
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
            <span>📋</span> Birleşik Kronolojik Liste
          </button>
          <button onclick="setViewMode('matrix')" id="btn-view-matrix" class="px-4 py-1.5 rounded-lg text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-1.5">
            <span>📊</span> Ülke Sütunları
          </button>
          <button onclick="setViewMode('calendar')" id="btn-view-calendar" class="px-4 py-1.5 rounded-lg text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-1.5">
            <span>🗓️</span> Ay Gruplu Görünüm
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
