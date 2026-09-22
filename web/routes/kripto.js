module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script src="/static/apps/kripto/app.js" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-orange transition text-sm flex items-center gap-1 font-medium">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Finans & Piyasa</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🪙</span> Kripto Trend & Piyasa Radarı
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            CoinGecko API ile anlık küresel kripto para piyasası, 24 saatlik değişimler, trend tokenlar ve 7 günlük fiyat seyirleri.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium" id="kripto-update-time">Canlı Piyasa Açık</span>
        </div>
      </div>

      <!-- TREND OLAN TOKENLAR ŞERİDİ -->
      <div class="p-4 rounded-xl bg-mistral-cream border border-mistral-beige-deep mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs">
        <span class="font-bold text-mistral-ink flex items-center gap-1.5 shrink-0">
          <span>🔥</span> Popüler Trendler:
        </span>
        <div id="trending-container" class="flex flex-wrap items-center gap-2">
          <span class="text-mistral-stone">Trendler taranıyor...</span>
        </div>
      </div>

      <!-- TABLO VE PORTFÖY HESAPLAYICI -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        <!-- Sol: Kripto Para Listesi (8 Kolon) -->
        <div class="lg:col-span-8 space-y-4">
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm overflow-hidden">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b border-mistral-hairline">
              <h3 class="text-lg font-bold font-editorial text-mistral-ink">Piyasa Değerine Göre En Büyük Varlıklar</h3>
              <input 
                type="text" 
                id="search-kripto" 
                placeholder="Coin ara (BTC, SOL, Ethereum)..." 
                oninput="renderMarketTable()"
                class="px-3 py-1.5 rounded-lg bg-white border border-mistral-hairline text-xs text-mistral-ink focus:outline-none focus:border-mistral-orange">
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="text-mistral-stone border-b border-mistral-hairline">
                    <th class="pb-2.5 font-medium"># Varlık</th>
                    <th class="pb-2.5 font-medium text-right">Fiyat (USD)</th>
                    <th class="pb-2.5 font-medium text-right">24s Değişim</th>
                    <th class="pb-2.5 font-medium text-right hidden sm:table-cell">24s En Yüksek</th>
                    <th class="pb-2.5 font-medium text-right">Piyasa Değeri</th>
                  </tr>
                </thead>
                <tbody id="market-tbody" class="divide-y divide-mistral-hairline-soft font-medium">
                  <tr>
                    <td colspan="5" class="py-12 text-center text-mistral-stone">Piyasa verileri yükleniyor...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sağ: Portföy Değer Simülatörü & İpuçları (4 Kolon) -->
        <div class="lg:col-span-4 space-y-6">
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
            <h3 class="text-base font-bold font-editorial text-mistral-ink flex items-center gap-2">
              <span>🧮</span> Hızlı Varlık Dönüştürücü
            </h3>
            
            <div>
              <label class="block text-xs text-mistral-slate mb-1">Miktar</label>
              <input type="number" id="calc-amount" value="1" min="0.0001" step="any" oninput="calculateKripto()" class="w-full px-3 py-2 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink font-semibold">
            </div>

            <div>
              <label class="block text-xs text-mistral-slate mb-1">Seçilen Kripto Para</label>
              <select id="calc-select" onchange="calculateKripto()" class="w-full px-3 py-2 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink">
                <!-- JS ile doldurulur -->
              </select>
            </div>

            <!-- Sonuç Kutusu -->
            <div class="p-4 rounded-xl bg-mistral-cream border border-mistral-beige-deep text-center">
              <span class="text-xs text-mistral-slate block mb-1">Tahmini USD Değeri</span>
              <strong class="text-2xl font-bold font-editorial text-mistral-orange" id="calc-result">$0.00</strong>
            </div>
          </div>

          <!-- Bilgi Kartı -->
          <div class="p-5 rounded-xl bg-mistral-cream-light border border-mistral-beige-deep text-xs text-mistral-slate space-y-2">
            <div class="font-bold text-mistral-ink flex items-center gap-1.5">
              <span>🛡️</span> Güvenli ve Açık Veri
            </div>
            <p class="leading-relaxed">
              Veriler CoinGecko genel API uç noktalarından çekilir ve 60 saniyelik aralıklarla önbelleğe alınır. Sayfada yer alan fiyatlar ve hesaplamalar bilgilendirme amaçlıdır; yatırım tavsiyesi niteliği taşımaz.
            </p>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('Kripto Trend & Piyasa Radarı', content, extraHead));
  };
};
