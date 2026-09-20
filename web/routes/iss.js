module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="/static/apps/iss/app.js" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/app" class="text-mistral-slate hover:text-mistral-orange transition text-sm flex items-center gap-1 font-medium">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Uzay & Bilim</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🛰️</span> Where is ISS? Canlı Uzay İstasyonu Radarı
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Uluslararası Uzay İstasyonu'nun (ISS) Dünya üzerindeki canlı yörünge konumu, anlık hızı, irtifası ve ayak izi radarı.
          </p>
        </div>

        <!-- Canlı Sinyal Göstergesi -->
        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span class="font-medium" id="iss-status-text">Canlı Telemetri Bağlı</span>
          <span class="text-mistral-stone text-[11px]" id="iss-last-update">• 3s aralıkla</span>
        </div>
      </div>

      <!-- İSTATİSTİK ŞERİDİ (Mistral Editorial Metric Tiles) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Enlem (Latitude)</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-ink" id="stat-lat">--°</div>
          <div class="text-[11px] text-mistral-stone mt-0.5" id="stat-lat-dir">Kuzey / Güney</div>
        </div>

        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Boylam (Longitude)</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-ink" id="stat-lon">--°</div>
          <div class="text-[11px] text-mistral-stone mt-0.5" id="stat-lon-dir">Doğu / Batı</div>
        </div>

        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Yörünge Hızı</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-orange" id="stat-speed">~27,600</div>
          <div class="text-[11px] text-mistral-stone mt-0.5">km / saat</div>
        </div>

        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Yerden Yükseklik (İrtifa)</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-ink" id="stat-alt">418</div>
          <div class="text-[11px] text-mistral-stone mt-0.5">kilometre (Alçak Dünya Yörüngesi)</div>
        </div>
      </div>

      <!-- LEAFLET HARİTASI VE RADAR KONTROLÜ -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        <!-- Harita Alanı (8 Kolon) -->
        <div class="lg:col-span-8 space-y-4">
          <div class="p-3 rounded-2xl bg-white border border-mistral-hairline shadow-sm relative overflow-hidden">
            <div id="iss-map" class="w-full h-[480px] rounded-xl z-10"></div>
            <!-- Harita Üzeri Canlı Rozet -->
            <div class="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur border border-mistral-hairline px-3.5 py-2 rounded-lg shadow-sm text-xs text-mistral-ink flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-mistral-orange animate-pulse"></span>
              <span>Görüş Durumu: <strong id="lbl-visibility" class="capitalize">Gündüz</strong></span>
            </div>
          </div>
        </div>

        <!-- Sağ Bilgi & Kontrol Paneli (4 Kolon) -->
        <div class="lg:col-span-4 space-y-6">
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
            <h3 class="text-lg font-bold font-editorial text-mistral-ink flex items-center gap-2">
              <span>🚀</span> İstasyon Hakkında Bilgiler
            </h3>
            <p class="text-xs text-mistral-slate leading-relaxed">
              Uluslararası Uzay İstasyonu saniyede yaklaşık 7.66 km hızla hareket eder ve Dünya çevresindeki bir tam turunu sadece <strong>90-93 dakikada</strong> tamamlar. Astronotlar günde 16 gün doğumu ve gün batımına tanık olur.
            </p>

            <div class="p-4 rounded-xl bg-mistral-cream border border-mistral-beige-deep space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-mistral-slate">Mürettebat Kapasitesi:</span>
                <strong class="text-mistral-ink">6 - 7 Astronot</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-mistral-slate">Gözlem Çapı (Footprint):</span>
                <strong class="text-mistral-ink" id="stat-footprint">~4,500 km</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-mistral-slate">Yörünge Eğikliği:</span>
                <strong class="text-mistral-ink">51.64°</strong>
              </div>
            </div>

            <div class="pt-2">
              <button onclick="centerOnIss()" class="w-full py-2.5 px-4 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white font-medium text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer">
                <span>🎯</span> İstasyonu Haritada Ortala
              </button>
            </div>
          </div>

          <!-- Yörünge İpuçları Kartı -->
          <div class="p-5 rounded-xl bg-mistral-cream-light border border-mistral-beige-deep text-xs text-mistral-slate space-y-2">
            <div class="font-bold text-mistral-ink flex items-center gap-1.5">
              <span>👀</span> Çıplak Gözle Görünür mü?
            </div>
            <p class="leading-relaxed">
              Evet! ISS, Güneş ışığını yansıtan devasa güneş panelleri sayesinde gökyüzünde Venüs'ten sonraki en parlak insan yapımı nesnedir. Üzerinizden geçerken hızla ilerleyen parlak bir yıldız gibi görünür.
            </p>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('Where is ISS? Canlı Uzay İstasyonu Radarı', content, extraHead));
  };
};
