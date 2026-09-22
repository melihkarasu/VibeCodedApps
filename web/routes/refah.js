module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script src="/static/apps/refah/app.js" defer></script>
    `;

    const content = `
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-white transition text-sm flex items-center gap-1">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">Yeni Seri #2</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight mt-1 text-mistral-ink flex items-center gap-2">
            <span>📊</span> Küresel Refah & Kalkınma Göstergesi
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5">
            World Bank (Dünya Bankası) resmi verileri ile son 30 yıllık GSYİH, ömür, enflasyon ve refah endeksi analizi.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="exportDataCSV()" class="px-3.5 py-2 rounded-xl bg-white hover:bg-mistral-cream text-mistral-ink text-xs font-bold transition flex items-center gap-1.5 border border-mistral-hairline">
            <span>📥</span> Verileri İndir (.csv)
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
              <span class="text-lg mb-1">💰</span>
              <span>Kişi Başı GSYİH</span>
            </button>
            <button onclick="setIndicator('SP.DYN.LE00.IN', 'Beklenen Yaşam Süresi', 'Yıl')" id="ind-life" class="ind-btn p-3 rounded-2xl bg-white border border-mistral-hairline text-mistral-slate hover:text-white font-semibold text-xs transition text-left flex flex-col justify-between">
              <span class="text-lg mb-1">⏳</span>
              <span>Yaşam Süresi</span>
            </button>
            <button onclick="setIndicator('FP.CPI.TOTL.ZG', 'TÜFE Enflasyon Oranı', 'Yıllık %')" id="ind-cpi" class="ind-btn p-3 rounded-2xl bg-white border border-mistral-hairline text-mistral-slate hover:text-white font-semibold text-xs transition text-left flex flex-col justify-between">
              <span class="text-lg mb-1">📈</span>
              <span>Enflasyon (%)</span>
            </button>
            <button onclick="setIndicator('IT.NET.USER.ZS', 'İnternet Erişim Oranı', '% Nüfus')" id="ind-net" class="ind-btn p-3 rounded-2xl bg-white border border-mistral-hairline text-mistral-slate hover:text-white font-semibold text-xs transition text-left flex flex-col justify-between">
              <span class="text-lg mb-1">🌐</span>
              <span>İnternet Erişimi</span>
            </button>
            <button onclick="setIndicator('EG.ELC.ACCS.ZS', 'Elektrik Erişim Oranı', '% Nüfus')" id="ind-elc" class="ind-btn p-3 rounded-2xl bg-white border border-mistral-hairline text-mistral-slate hover:text-white font-semibold text-xs transition text-left flex flex-col justify-between">
              <span class="text-lg mb-1">⚡</span>
              <span>Elektrik Erişimi</span>
            </button>
            <button onclick="setIndicator('EG.FEC.RNEW.ZS', 'Yenilenebilir Enerji Payı', '% Toplam')" id="ind-renew" class="ind-btn p-3 rounded-2xl bg-white border border-mistral-hairline text-mistral-slate hover:text-white font-semibold text-xs transition text-left flex flex-col justify-between">
              <span class="text-lg mb-1">🌿</span>
              <span>Yenilenebilir Enerji</span>
            </button>
            <button onclick="setIndicator('EN.ATM.CO2E.PC', 'Kişi Başı CO2 Salımı', 'Ton / Kişi')" id="ind-co2" class="ind-btn p-3 rounded-2xl bg-white border border-mistral-hairline text-mistral-slate hover:text-white font-semibold text-xs transition text-left flex flex-col justify-between">
              <span class="text-lg mb-1">🏭</span>
              <span>Karbon Salımı</span>
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
              <span id="chart-main-title">Kişi Başına GSYİH Tarihsel Trendi (1995 - 2024)</span>
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
            <span>📋</span> Yıllara Göre Karşılaştırmalı Veri Tablosu
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
