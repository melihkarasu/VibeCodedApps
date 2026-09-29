module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="/static/apps/bisiklet/app.js?v=20260929a" defer></script>
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
            <span>🚲</span> Şehir Bisiklet Rehberi & Mobilite Radarı
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            CityBikes API ile 400+ dünya metropolünde canlı paylaşımlı bisiklet durakları, boş bisiklet ve boş kilit yuvası sayıları.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium" id="bike-net-status">Şehir Verisi Açık</span>
        </div>
      </div>

      <!-- ŞEHİR / AĞ SEÇİCİ & ARAMA -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <!-- Şehir Arama / Seçme -->
          <div class="sm:col-span-8 relative">
            <select id="select-network" onchange="onNetworkChange()" class="w-full px-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange transition">
              <option value="">Metropol / Bisiklet Ağı Yükleniyor...</option>
            </select>
          </div>
          <div class="sm:col-span-4">
            <input 
              type="text" 
              id="filter-station-input" 
              placeholder="İstasyon adı ara..." 
              oninput="filterStationList()"
              class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
          </div>
        </div>

        <!-- Hızlı Popüler Metropoller -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-mistral-hairline text-xs">
          <span class="text-mistral-stone font-medium mr-1">Popüler Şehirler:</span>
          <button onclick="selectCityById('baksi-antalya')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇹🇷 Antalya (Baksi)</button>
          <button onclick="selectCityById('velib-metropole')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇫🇷 Paris (Vélib')</button>
          <button onclick="selectCityById('santander-cycles')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇬🇧 Londra (Santander)</button>
          <button onclick="selectCityById('citi-bike-nyc')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇺🇸 New York (Citi Bike)</button>
          <button onclick="selectCityById('bicing')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇪🇸 Barselona (Bicing)</button>
        </div>
      </div>

      <!-- İSTATİSTİK ŞERİDİ -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Toplam İstasyon</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-ink" id="stat-total-stations">--</div>
          <div class="text-[11px] text-mistral-stone mt-0.5">Aktif Durak</div>
        </div>

        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Müsait Bisikletler</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-emerald-600" id="stat-free-bikes">--</div>
          <div class="text-[11px] text-mistral-stone mt-0.5">Hemen Kiralanabilir</div>
        </div>

        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Boş Park Yuvası</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-orange" id="stat-empty-slots">--</div>
          <div class="text-[11px] text-mistral-stone mt-0.5">Teslim Edilebilir Yuva</div>
        </div>

        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Şebeke / Şehir</div>
          <div class="text-base sm:text-lg font-bold font-editorial text-mistral-ink truncate mt-1" id="stat-city-label">Yükleniyor...</div>
          <div class="text-[11px] text-mistral-stone mt-0.5" id="stat-country-label">Canlı Şebeke</div>
        </div>
      </div>

      <!-- HARİTA VE İSTASYON LİSTESİ -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        <!-- Sol: Harita (8 Kolon) -->
        <div class="lg:col-span-8 space-y-4">
          <div class="p-3 rounded-2xl bg-white border border-mistral-hairline shadow-sm relative overflow-hidden">
            <div id="bike-map" class="w-full h-[520px] rounded-xl z-10"></div>
            <!-- Doluluk Lejantı -->
            <div class="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur border border-mistral-hairline px-3.5 py-2 rounded-lg shadow-sm text-xs text-mistral-ink flex items-center gap-3">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 5+ Bisiklet</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 1-4 Bisiklet</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Boş Durak</span>
            </div>
          </div>
        </div>

        <!-- Sağ: İstasyon Detay & Liste Paneli (4 Kolon) -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Seçilen İstasyon Detay Kartı -->
          <div id="selected-station-card" class="p-6 rounded-2xl bg-white border border-mistral-orange/40 shadow-sm space-y-4">
            <div>
              <span class="text-xs uppercase tracking-wider text-mistral-orange font-bold block mb-1">SEÇİLEN İSTASYON</span>
              <h3 class="text-xl font-bold font-editorial text-mistral-ink" id="sel-station-name">Haritadan bir durak seçin</h3>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span class="text-emerald-800 text-[10px] block">Müsait Bisiklet</span>
                <strong class="text-2xl font-bold font-editorial text-emerald-700" id="sel-free-bikes">-</strong>
              </div>
              <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep text-center">
                <span class="text-mistral-slate text-[10px] block">Boş Park Yeri</span>
                <strong class="text-2xl font-bold font-editorial text-mistral-ink" id="sel-empty-slots">-</strong>
              </div>
            </div>

            <div class="pt-2 border-t border-mistral-hairline text-[11px] text-mistral-stone flex items-center justify-between">
              <span>Durum: <strong class="text-mistral-ink" id="sel-status">Aktif</strong></span>
              <button onclick="centerOnSelectedStation()" class="text-mistral-orange hover:underline font-bold">Haritada Gör &rarr;</button>
            </div>
          </div>

          <!-- İstasyon Listesi (Scrollable) -->
          <div class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-3">
            <h4 class="text-sm font-bold font-editorial text-mistral-ink">İstasyon Listesi (<span id="filtered-count">0</span>)</h4>
            <div id="stations-list-box" class="space-y-2 max-h-[280px] overflow-y-auto pr-1 text-xs">
              <!-- JS ile doldurulur -->
            </div>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('Şehir Bisiklet Rehberi & Mobilite Radarı', content, extraHead));
  };
};
