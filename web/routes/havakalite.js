module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script src="/static/apps/havakalite/app.js" defer></script>
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
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Coğrafya, Doğa & Çevre</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>💨</span> OpenAQ & Canlı Hava Kalitesi Radarı
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Dünya şehirlerinin anlık hava kirliliği göstergeleri (PM2.5, PM10, NO2, O3), Avrupa AQI endeksi ve sağlık tavsiyeleri.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium" id="aqi-status-badge">Canlı İstasyonlar Açık</span>
        </div>
      </div>

      <!-- ARAMA VE HIZLI ŞEHİR SEÇİCİ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <input 
              type="text" 
              id="city-search" 
              placeholder="Şehir adı arayın (örn: İstanbul, Ankara, Berlin, London, Tokyo)..." 
              onkeydown="if(event.key==='Enter') searchCity()"
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔍</span>
          </div>
          <button 
            type="button" 
            onclick="searchCity()" 
            class="px-5 py-2.5 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs font-medium transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <span>Ölçümü Getir</span> &rarr;
          </button>
        </div>

        <!-- Hızlı Şehirler -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-mistral-hairline text-xs">
          <span class="text-mistral-stone font-medium mr-1">Popüler Şehirler:</span>
          <button onclick="loadCity('Istanbul')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇹🇷 İstanbul</button>
          <button onclick="loadCity('Ankara')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇹🇷 Ankara</button>
          <button onclick="loadCity('Izmir')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇹🇷 İzmir</button>
          <button onclick="loadCity('London')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇬🇧 Londra</button>
          <button onclick="loadCity('Paris')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇫🇷 Paris</button>
          <button onclick="loadCity('Tokyo')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇯🇵 Tokyo</button>
          <button onclick="loadCity('New York')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇺🇸 New York</button>
        </div>
      </div>

      <!-- ANA GÖSTERGE VE SAĞLIK KARTI -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        <!-- Sol: AQI Ana Durum Paneli (5 Kolon) -->
        <div class="lg:col-span-5 space-y-6">
          <div id="aqi-card-box" class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm text-center relative overflow-hidden transition-all duration-300">
            <span class="text-xs uppercase tracking-wider text-mistral-stone font-semibold" id="lbl-city-name">İSTANBUL</span>
            <div class="my-4">
              <span class="text-6xl sm:text-7xl font-bold font-editorial text-mistral-ink" id="val-aqi">--</span>
              <span class="text-xs text-mistral-slate block mt-1">European AQI İndeksi</span>
            </div>

            <!-- Durum Rozeti -->
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 shadow-2xs" id="box-status-badge">
              <span id="txt-status-level">Yükleniyor...</span>
            </div>

            <!-- Sağlık Tavsiyesi -->
            <div class="p-4 rounded-xl bg-mistral-cream border border-mistral-beige-deep text-left text-xs text-mistral-slate space-y-2">
              <div class="font-bold text-mistral-ink flex items-center gap-1.5">
                <span>🩺</span> Sağlık & Aktivite Tavsiyesi
              </div>
              <p id="txt-health-advice" class="leading-relaxed">
                Hava kalitesi ölçülüyor...
              </p>
            </div>
          </div>

          <!-- Kirletici Dağılım Matrisi -->
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-3">
            <h4 class="text-sm font-bold font-editorial text-mistral-ink">Önemli Kirletici Değerleri</h4>
            
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-mistral-cream-light border border-mistral-beige-deep">
                <span class="text-mistral-stone block">PM2.5 (İnce Partikül)</span>
                <strong class="text-base font-editorial text-mistral-ink" id="val-pm25">-- µg/m³</strong>
              </div>
              <div class="p-3 rounded-xl bg-mistral-cream-light border border-mistral-beige-deep">
                <span class="text-mistral-stone block">PM10 (Kaba Partikül)</span>
                <strong class="text-base font-editorial text-mistral-ink" id="val-pm10">-- µg/m³</strong>
              </div>
              <div class="p-3 rounded-xl bg-mistral-cream-light border border-mistral-beige-deep">
                <span class="text-mistral-stone block">Azot Dioksit (NO2)</span>
                <strong class="text-base font-editorial text-mistral-ink" id="val-no2">-- µg/m³</strong>
              </div>
              <div class="p-3 rounded-xl bg-mistral-cream-light border border-mistral-beige-deep">
                <span class="text-mistral-stone block">Ozon (O3)</span>
                <strong class="text-base font-editorial text-mistral-ink" id="val-o3">-- µg/m³</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Sağ: 24 Saatlik Değişim Grafiği (7 Kolon) -->
        <div class="lg:col-span-7 space-y-6">
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold font-editorial text-mistral-ink">24 Saatlik PM2.5 / PM10 Trend Grafiği</h3>
                <p class="text-xs text-mistral-stone mt-0.5">Avrupa Çevre Ajansı (EEA) istasyon modelleri</p>
              </div>
            </div>

            <div class="h-[280px]">
              <canvas id="chart-aqi"></canvas>
            </div>
          </div>

          <!-- Bilgilendirme Kartı -->
          <div class="p-5 rounded-xl bg-mistral-cream border border-mistral-beige-deep text-xs text-mistral-slate space-y-2">
            <h4 class="font-bold text-mistral-ink flex items-center gap-1.5">
              <span>💡</span> PM2.5 Nedir ve Neden Önemlidir?
            </h4>
            <p class="leading-relaxed">
              PM2.5, çapı 2.5 mikrometreden küçük partikülleri ifade eder (insan saç telinin yaklaşık 30'da biri). Bu mikroskobik tanecikler akciğerlerin en derin noktalarına ve kan dolaşımına kadar ulaşabildiği için hava kalitesinin en kritik göstergesidir.
            </p>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('OpenAQ & Canlı Hava Kalitesi Radarı', content, extraHead));
  };
};
