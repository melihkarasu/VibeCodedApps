module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script src="/static/apps/kripto/app.js?v=20261023a" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Finans & Piyasa</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Kripto Trend & Piyasa Radarı</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            CoinGecko API ile anlık küresel kripto para piyasası, 24 saatlik değişimler, trend tokenlar ve 7 günlük fiyat seyirleri.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="font-medium" id="kripto-update-time">Canlı Piyasa Açık</span>
        </div>
      </div>

      <!-- TREND OLAN TOKENLAR ŞERİDİ -->
      <div class="p-4 rounded-xl bg-mistral-cream border border-mistral-beige-deep mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs">
        <span class="font-bold text-mistral-ink flex items-center gap-1.5 shrink-0">
          <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></span> Popüler Trendler:
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
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span> Hızlı Varlık Dönüştürücü
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
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span> Güvenli ve Açık Veri
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
