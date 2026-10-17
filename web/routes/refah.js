module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script src="/static/apps/refah/app.js?v=20261017a" defer></script>
    `;

    const content = `
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Finans & Makroekonomi</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Küresel Refah & Kalkınma Göstergesi</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5">
            World Bank (Dünya Bankası) resmi verileri ile son 30 yıllık GSYİH, ömür, enflasyon ve refah endeksi analizi.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="exportDataCSV()" class="px-3.5 py-2 rounded-xl bg-white hover:bg-mistral-cream text-mistral-ink text-xs font-bold transition flex items-center gap-1.5 border border-mistral-hairline">
            <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span> Verileri İndir (.csv)
          </button>
        </div>
      </div>

      <!-- 1. GÖSTERGE VE ÜLKE KONTROL PANELİ -->
      <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-5">
        
        <!-- Üst: Gösterge Seçimi -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate mb-2">
            Kalkınma & Refah Göstergesi
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            <button onclick="setIndicator('NY.GDP.PCAP.KD', 'Kişi Başına GSYİH', 'Sabit 2015 USD ($)')" id="ind-gdp" class="ind-btn p-3 rounded-2xl bg-blue-600 text-white font-bold text-xs transition shadow text-left flex flex-col justify-between">
              <span class="text-lg mb-1"><svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span>
              <span>Kişi Başı GSYİH</span>
            </button>
            <button onclick="setIndicator('SP.DYN.LE00.IN', 'Beklenen Yaşam Süresi', 'Yıl')" id="ind-life" class="ind-btn p-3 rounded-2xl bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink font-semibold text-xs transition text-left flex flex-col justify-between">
              <span class="text-lg mb-1"></span>
              <span>Yaşam Süresi</span>
            </button>
            <button onclick="setIndicator('FP.CPI.TOTL.ZG', 'TÜFE Enflasyon Oranı', 'Yıllık %')" id="ind-cpi" class="ind-btn p-3 rounded-2xl bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink font-semibold text-xs transition text-left flex flex-col justify-between">
              <span class="text-lg mb-1"><svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></span>
              <span>Enflasyon (%)</span>
            </button>
            <button onclick="setIndicator('IT.NET.USER.ZS', 'İnternet Erişim Oranı', '% Nüfus')" id="ind-net" class="ind-btn p-3 rounded-2xl bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink font-semibold text-xs transition text-left flex flex-col justify-between">
              <span class="text-lg mb-1"><svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
              <span>İnternet Erişimi</span>
            </button>
            <button onclick="setIndicator('EG.ELC.ACCS.ZS', 'Elektrik Erişim Oranı', '% Nüfus')" id="ind-elc" class="ind-btn p-3 rounded-2xl bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink font-semibold text-xs transition text-left flex flex-col justify-between">
              <span class="text-lg mb-1"><svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>
              <span>Elektrik Erişimi</span>
            </button>
            <button onclick="setIndicator('EG.FEC.RNEW.ZS', 'Yenilenebilir Enerji Payı', '% Toplam')" id="ind-renew" class="ind-btn p-3 rounded-2xl bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink font-semibold text-xs transition text-left flex flex-col justify-between">
              <span class="text-lg mb-1"><svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></span>
              <span>Yenilenebilir Enerji</span>
            </button>
          </div>
        </div>

        <!-- Alt: Karşılaştırılacak Ülkeler -->
        <div class="pt-3 border-t border-mistral-hairline space-y-2">
          <div class="flex items-center justify-between text-xs text-mistral-slate">
            <span class="font-semibold text-mistral-slate">Karşılaştırılan Ülkeler:</span>
            <span class="text-[11px] text-mistral-stone">en az bir, en fazla 5 ülke seçiniz</span>
          </div>

          <!-- Seçili Ülkeler Etiketleri -->
          <div class="flex flex-wrap items-center gap-2" id="selected-countries-tags">
            <!-- JS ile doldurulur -->
          </div>

          <!-- Hızlı Ülke Ekleme Butonları -->
          <div class="flex flex-wrap items-center gap-1.5 text-xs pt-1">
            <span class="text-mistral-stone text-[11px] mr-1">Hızlı Ekle:</span>
            <button onclick="toggleCountry('DEU')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇩🇪 Almanya</button>
            <button onclick="toggleCountry('USA')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇺🇸 ABD</button>
            <button onclick="toggleCountry('GBR')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇬🇧 Birleşik Krallık</button>
            <button onclick="toggleCountry('JPN')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇯🇵 Japonya</button>
            <button onclick="toggleCountry('KOR')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇰🇷 G. Kore</button>
            <button onclick="toggleCountry('CHN')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇨🇳 Çin</button>
            <button onclick="toggleCountry('AZE')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇦🇿 Azerbaycan</button>
            <button onclick="toggleCountry('BRA')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">🇧🇷 Brezilya</button>
          </div>
        </div>

      </div>

      <!-- 2. ANLIK DEĞERLER VE ÖZET KARTLARI -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" id="latest-stats-cards">
        <!-- JS ile doldurulur -->
      </div>

      <!-- 3. İNTERAKTİF ÇOKLU TREND GRAFİĞİ (CHART.JS) -->
      <div class="p-6 sm:p-8 rounded-3xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-base font-bold text-mistral-ink flex items-center gap-2">
              <span id="chart-main-title">Kişi Başına GSYİH Tarihsel Trendi (1995 - Günümüz)</span>
            </h3>
            <p class="text-mistral-slate text-xs mt-0.5" id="chart-sub-title">Birim: Sabit 2015 USD ($)</p>
          </div>
          <div class="flex items-center gap-2 text-xs font-mono text-mistral-slate" id="chart-legend-box">
            <!-- Dinamik lejant -->
          </div>
        </div>

        <div class="relative w-full h-80 sm:h-96 mt-2">
          <canvas id="refah-chart"></canvas>
        </div>
      </div>

      <!-- 4. TARİHSEL VERİ TABLOSU -->
      <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-mistral-ink flex items-center gap-2">
            <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span> Yıllara Göre Karşılaştırmalı Veri Tablosu
          </h3>
          <span class="text-xs text-mistral-slate font-mono">Dünya Bankası Kayıtları</span>
        </div>

        <div class="overflow-x-auto max-h-[350px] overflow-y-auto pr-1">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="border-b border-mistral-hairline text-mistral-slate" id="table-header-row">
                <th class="pb-2.5">Yıl</th>
                <!-- Dinamik ülke başlıkları -->
              </tr>
            </thead>
            <tbody id="table-body-rows" class="divide-y divide-slate-700/60">
              <!-- JS ile doldurulur -->
            </tbody>
          </table>
        </div>
      </div>

      <div id="loading-spinner" class="hidden py-16 text-center text-mistral-slate text-sm flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
        <span>Dünya Bankası göstergeleri çekiliyor...</span>
      </div>

      <!-- Toast Bildirimi -->
      <div id="refah-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-blue-500 text-white font-bold text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı -->
    `;

    res.send(pageTemplate('Küresel Refah & Kalkınma Göstergesi', content, extraHead));
  };
};
