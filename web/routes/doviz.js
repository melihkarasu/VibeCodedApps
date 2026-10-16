module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script src="/static/apps/doviz/app.js?v=20261017a" defer></script>
    `;

    const content = `
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Finans & Piyasa</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Anlık & Tarihsel Döviz Çevirici</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5">
            TCMB (Türkiye Cumhuriyet Merkez Bankası) resmi bülteni ve ECB (Avrupa Merkez Bankası) kurları ile anlık analiz.
          </p>
        </div>

        <!-- Kaynak Seçici (TCMB vs ECB) & Bülten Rozeti -->
        <div class="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div class="flex p-1 rounded-xl bg-white border border-mistral-hairline">
            <button onclick="setDataSource('tcmb')" id="btn-src-tcmb" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 transition flex items-center gap-1.5 shadow">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg></span> TCMB Kurları
            </button>
            <button onclick="setDataSource('ecb')" id="btn-src-ecb" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-mistral-slate hover:text-mistral-ink transition flex items-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span> ECB Kurları
            </button>
          </div>
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-slate">
            <span id="source-date-badge">Kurlar Yükleniyor...</span>
          </div>
        </div>
      </div>

      <!-- HIZLI KURLAR BANDI (TICKER) -->
      <div class="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" id="ticker-container">
        <!-- Dinamik doldurulur -->
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- SOL KOLON: Çevirici, Grafik ve Getiri Simülatörü (7 Kolon) -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- ANA ÇEVİRİCİ KARTI -->
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xl">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <span class="text-xs font-semibold uppercase tracking-wider text-mistral-slate flex items-center gap-2">
                <span id="conv-source-label">TCMB Resmi Kurları</span>
              </span>

              <!-- TCMB Kur Türü Seçici (Alış / Satış / Efektif) -->
              <div id="tcmb-rate-type-container" class="flex gap-1 p-0.5 rounded-lg bg-white border border-mistral-hairline text-[11px]">
                <button onclick="setTcmbRateType('forexSelling')" id="btn-type-forexSelling" class="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold transition">Döviz Satış</button>
                <button onclick="setTcmbRateType('forexBuying')" id="btn-type-forexBuying" class="px-2 py-1 rounded text-mistral-slate hover:text-mistral-ink transition">Döviz Alış</button>
                <button onclick="setTcmbRateType('banknoteSelling')" id="btn-type-banknoteSelling" class="px-2 py-1 rounded text-mistral-slate hover:text-mistral-ink transition">Efektif Satış</button>
                <button onclick="setTcmbRateType('banknoteBuying')" id="btn-type-banknoteBuying" class="px-2 py-1 rounded text-mistral-slate hover:text-mistral-ink transition">Efektif Alış</button>
              </div>

              <button onclick="toggleFavorite()" id="btn-fav-star" class="text-xs text-mistral-slate hover:text-amber-400 transition flex items-center gap-1">
                <span id="star-icon"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span> Favorilere Ekle
              </button>
            </div>

            <!-- Tutar Girişi -->
            <div class="mb-4">
              <label class="block text-xs font-medium text-mistral-slate mb-1.5">Çevrilecek Tutar</label>
              <div class="relative">
                <input type="number" id="input-amount" value="100" min="0.01" step="any" oninput="calculateConversion()" class="w-full pl-4 pr-16 py-3 rounded-xl bg-white border border-mistral-hairline focus:border-emerald-400 focus:outline-none text-mistral-ink font-semibold text-xl">
                <span id="amount-symbol" class="absolute right-4 top-3.5 text-mistral-slate text-sm font-semibold">USD</span>
              </div>
            </div>

            <!-- Para Birimleri Seçici (Kaynak, Swap, Hedef) -->
            <div class="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center mb-6">
              <!-- Kaynak -->
              <div class="sm:col-span-5">
                <label class="block text-xs font-medium text-mistral-slate mb-1">Kaynak Para Birimi</label>
                <select id="select-from" onchange="onCurrencyChange(true)" class="w-full px-3 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm font-medium text-mistral-ink focus:border-emerald-400 focus:outline-none">
                  <!-- Para birimleri JS ile eklenecek -->
                </select>
              </div>

              <!-- Swap Butonu -->
              <div class="sm:col-span-1 flex justify-center pt-4 sm:pt-4">
                <button onclick="swapCurrencies()" title="Para Birimlerini Değiştir" class="w-10 h-10 rounded-xl bg-mistral-cream-light hover:bg-emerald-600 text-mistral-ink hover:text-mistral-ink font-bold transition flex items-center justify-center text-lg shadow">
                  ⇄
                </button>
              </div>

              <!-- Hedef -->
              <div class="sm:col-span-5">
                <label class="block text-xs font-medium text-mistral-slate mb-1">Hedef Para Birimi</label>
                <select id="select-to" onchange="onCurrencyChange(false)" class="w-full px-3 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm font-medium text-mistral-ink focus:border-emerald-400 focus:outline-none">
                  <!-- Para birimleri JS ile eklenecek -->
                </select>
              </div>
            </div>

            <!-- Sonuç Kutusu -->
            <div class="p-5 rounded-xl bg-white border border-mistral-hairline">
              <div class="text-xs text-mistral-slate mb-1" id="res-calc-formula">100 USD =</div>
              <div class="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight" id="res-main-amount">
                Hesaplanıyor...
              </div>
              <div class="mt-3 pt-3 border-t border-mistral-hairline flex flex-wrap items-center justify-between text-xs text-mistral-slate gap-2">
                <div id="res-unit-rate">1 USD = 0.00 TRY</div>
                <div id="res-inverse-rate">1 TRY = 0.00 USD</div>
                <button onclick="copyRateToClipboard()" class="text-mistral-slate hover:text-emerald-400 transition flex items-center gap-1">
                  <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span> Kuru Kopyala
                </button>
              </div>
            </div>

          </div>

          <!-- İNTERAKTİF GRAFİK KARTI (Chart.js) -->
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xl space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 class="text-base font-bold text-mistral-ink flex items-center gap-2">
                  <span id="chart-title">USD / TRY Kur Değişim Grafiği</span>
                </h3>
                <p class="text-mistral-slate text-xs mt-0.5" id="chart-subtitle">Resmi merkez bankası kapanış verileri</p>
              </div>
              
              <!-- Periyot Filtreleri -->
              <div class="flex gap-1.5 p-1 rounded-xl bg-white border border-mistral-hairline">
                <button onclick="setChartPeriod('7d')" id="btn-period-7d" class="period-btn px-3 py-1 rounded-lg text-xs font-semibold text-mistral-slate hover:text-mistral-ink transition">7G</button>
                <button onclick="setChartPeriod('1m')" id="btn-period-1m" class="period-btn px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 transition">1A</button>
                <button onclick="setChartPeriod('3m')" id="btn-period-3m" class="period-btn px-3 py-1 rounded-lg text-xs font-semibold text-mistral-slate hover:text-mistral-ink transition">3A</button>
                <button onclick="setChartPeriod('1y')" id="btn-period-1y" class="period-btn px-3 py-1 rounded-lg text-xs font-semibold text-mistral-slate hover:text-mistral-ink transition">1Y</button>
              </div>
            </div>

            <!-- İstatistik Kartları -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div class="p-3 rounded-xl bg-white border border-mistral-hairline text-center">
                <span class="text-[10px] uppercase tracking-wider text-mistral-slate">En Yüksek</span>
                <div class="text-sm font-bold text-mistral-ink mt-0.5" id="stat-high">-</div>
              </div>
              <div class="p-3 rounded-xl bg-white border border-mistral-hairline text-center">
                <span class="text-[10px] uppercase tracking-wider text-mistral-slate">En Düşük</span>
                <div class="text-sm font-bold text-mistral-ink mt-0.5" id="stat-low">-</div>
              </div>
              <div class="p-3 rounded-xl bg-white border border-mistral-hairline text-center">
                <span class="text-[10px] uppercase tracking-wider text-mistral-slate">Ortalama</span>
                <div class="text-sm font-bold text-mistral-ink mt-0.5" id="stat-avg">-</div>
              </div>
              <div class="p-3 rounded-xl bg-white border border-mistral-hairline text-center">
                <span class="text-[10px] uppercase tracking-wider text-mistral-slate">Dönem Getirisi</span>
                <div class="text-sm font-bold mt-0.5" id="stat-change">-</div>
              </div>
            </div>

            <!-- Canvas Container -->
            <div class="relative w-full h-64 mt-2">
              <canvas id="currency-chart"></canvas>
            </div>
          </div>

          <!-- TARİHSEL GETİRİ SİMÜLATÖRÜ -->
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xl space-y-4">
            <h3 class="text-base font-bold text-mistral-ink flex items-center gap-2">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></span> Geçmiş Getiri Simülatörü
            </h3>
            <p class="text-mistral-slate text-xs">
              "Geçmişte bu dövize yatırım yapsaydınız bugün Türk Lirası karşılığı ne olurdu?"
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">Dönem Seçimi</label>
                <select id="sim-period" onchange="runSimulation()" class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink">
                  <option value="1y">1 Yıl Önce</option>
                  <option value="6m">6 Ay Önce</option>
                  <option value="3m">3 Ay Önce</option>
                  <option value="1m">1 Ay Önce</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">Yatırım Tutarı</label>
                <input type="number" id="sim-amount" value="1000" min="1" oninput="runSimulation()" class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink">
              </div>
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">Para Birimi</label>
                <select id="sim-currency" onchange="runSimulation()" class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink">
                  <option value="USD">🇺🇸 USD (Amerikan Doları)</option>
                  <option value="EUR">🇪🇺 EUR (Euro)</option>
                  <option value="GBP">🇬🇧 GBP (İngiliz Sterlini)</option>
                  <option value="CHF">🇨🇭 CHF (İsviçre Frangı)</option>
                </select>
              </div>
            </div>

            <!-- Simülasyon Sonuçları -->
            <div class="p-4 rounded-xl bg-white border border-mistral-hairline grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <span class="text-[10px] text-mistral-slate uppercase">O Günkü TRY Değeri</span>
                <div class="text-sm font-bold text-mistral-slate mt-0.5" id="sim-past-val">-</div>
              </div>
              <div>
                <span class="text-[10px] text-mistral-slate uppercase">Bugünkü TRY Değeri</span>
                <div class="text-sm font-bold text-emerald-400 mt-0.5" id="sim-now-val">-</div>
              </div>
              <div>
                <span class="text-[10px] text-mistral-slate uppercase">Net Kâr / Getiri</span>
                <div class="text-sm font-bold mt-0.5" id="sim-profit">-</div>
              </div>
            </div>
          </div>

        </div>

        <!-- SAĞ KOLON: Çoklu Kur Tablosu / TCMB Gösterge Tablosu ve Favoriler (5 Kolon) -->
        <div class="lg:col-span-5 space-y-6">

          <!-- ÇOKLU KARŞILAŞTIRMA & TCMB GÖSTERGE TABLOSU -->
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xl">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-mistral-ink flex items-center gap-1.5" id="matrix-title">
                <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg></span> TCMB Gösterge Kurları
              </h3>
              <span class="text-[10px] text-mistral-slate font-mono" id="matrix-base-label">TCMB Bülteni</span>
            </div>
            <p class="text-mistral-slate text-xs mb-3" id="matrix-desc">
              TCMB resmi döviz ve efektif alış/satış kurları:
            </p>

            <div class="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-mistral-hairline text-mistral-slate">
                    <th class="pb-2 font-medium">Döviz</th>
                    <th class="pb-2 font-medium text-right" id="th-col-1">Döviz Alış</th>
                    <th class="pb-2 font-medium text-right" id="th-col-2">Döviz Satış</th>
                    <th class="pb-2 font-medium text-right" id="th-col-3">Efektif Satış</th>
                  </tr>
                </thead>
                <tbody id="multi-rates-tbody" class="divide-y divide-slate-700/50">
                  <!-- JS ile doldurulur -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- FAVORİ PARİTELERİM (WATCHLIST) -->
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xl space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-mistral-ink flex items-center gap-1.5">
                <span>⭐</span> Favori Paritelerim
              </h3>
              <button onclick="clearAllFavorites()" class="text-xs text-rose-400 hover:underline">Tümünü Sil</button>
            </div>
            <p class="text-mistral-slate text-xs">
              Sık takip ettiğiniz döviz çiftlerini kaydedin, tek tıkla yükleyin.
            </p>

            <div id="favorites-container" class="space-y-2">
              <!-- JS ile dinamik favoriler -->
            </div>
            <div id="favorites-empty" class="p-6 text-center rounded-xl bg-white border border-mistral-hairline text-mistral-stone text-xs">
              Henüz favori parite eklemediniz. Yukarıdaki "Favorilere Ekle" butonuna basarak listenizi oluşturabilirsiniz.
            </div>
          </div>

        </div>

      </div>

      <!-- Toast Bildirimi -->
      <div id="doviz-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı -->
    `;

    res.send(pageTemplate('Anlık Döviz Çevirici', content, extraHead));
  };
};
