module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H" crossorigin="anonymous" />
      <link rel="stylesheet" href="/static/apps/deprem/app.css?v=20261114b" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH" crossorigin="anonymous"></script>
      <script src="/static/apps/deprem/app.js?v=20261114b" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="vibe-page-header mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              <span>Vitrine Dön</span>
            </a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Coğrafya &amp; Çevre</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2">
            <span class="vibe-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12h3l2.5-7 4 14 3.5-10 2 3H22"/>
              </svg>
            </span>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Canlı Deprem Haritası &amp; Sismik Radar</h1>
          </div>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Kandilli Rasathanesi ve USGS canlı sismik veri akışı; Anıtkabir referans konumu ve OpenStreetMap ile Türkiye ve dünya depremleri.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button type="button" id="btn-refresh-quake" onclick="refreshQuakes()" class="vibe-btn vibe-btn-sm vibe-btn-primary cursor-pointer">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            <span>Verileri Yenile</span>
          </button>
          <span id="quake-status-badge" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-slate">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span id="quake-status-text">Hazır</span>
          </span>
        </div>
      </div>

      <!-- FİLTRE VE KONTROL PANELİ -->
      <section class="vibe-panel-card p-5 mb-6 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div class="lg:col-span-3">
            <label for="filter-source" class="block text-xs font-semibold text-mistral-slate mb-1.5">Veri Kaynağı</label>
            <select id="filter-source" onchange="onFilterChange()" class="w-full px-3 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange">
              <option value="combined" selected>Kandilli + USGS (Birleşik)</option>
              <option value="kandilli">Yalnızca Kandilli Rasathanesi</option>
              <option value="usgs">Yalnızca USGS (Küresel)</option>
            </select>
          </div>

          <div class="lg:col-span-3">
            <label for="filter-region" class="block text-xs font-semibold text-mistral-slate mb-1.5">Bölge Kapsamı</label>
            <select id="filter-region" onchange="onFilterChange()" class="w-full px-3 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange">
              <option value="turkey" selected>Türkiye (Anıtkabir Merkezli)</option>
              <option value="marmara">Marmara Bölgesi</option>
              <option value="aegean">Ege &amp; Batı Anadolu</option>
              <option value="east">Doğu &amp; Güneydoğu Anadolu</option>
              <option value="mediterranean">Akdeniz Havzası</option>
              <option value="global">Tüm Dünya (Küresel)</option>
            </select>
          </div>

          <div class="lg:col-span-2">
            <label for="filter-minmag" class="block text-xs font-semibold text-mistral-slate mb-1.5">Min. Büyüklük</label>
            <select id="filter-minmag" onchange="onFilterChange()" class="w-full px-3 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange">
              <option value="1.0" selected>Tümü (M 1.0+)</option>
              <option value="2.5">M 2.5+</option>
              <option value="4.0">M 4.0+</option>
              <option value="5.0">M 5.0+</option>
              <option value="6.0">M 6.0+</option>
            </select>
          </div>

          <div class="lg:col-span-2">
            <label for="filter-days" class="block text-xs font-semibold text-mistral-slate mb-1.5">Zaman Aralığı</label>
            <select id="filter-days" onchange="onFilterChange()" class="w-full px-3 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange">
              <option value="1">Son 24 Saat</option>
              <option value="7" selected>Son 7 Gün</option>
              <option value="30">Son 30 Gün</option>
            </select>
          </div>

          <div class="lg:col-span-2 flex gap-2">
            <button type="button" onclick="focusNearMe()" class="vibe-btn vibe-btn-sm vibe-btn-secondary w-full justify-center cursor-pointer" title="Yalnızca tıkladığınızda tarayıcı konumu istenir ve sunucuya gönderilmez">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/></svg>
              <span>Yakınımda</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <div class="lg:col-span-5">
            <input type="text" id="filter-search" oninput="applyClientSearch()" placeholder="Şehir / fay / bölge ara (örn: Ankara, İzmir, Ovacık, Marmara...)" class="w-full px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange">
          </div>

          <div class="lg:col-span-7 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-mistral-stone font-medium mr-1">Hızlı Odak:</span>
              <button type="button" onclick="focusPreset('turkey')" class="quake-preset-btn">Anıtkabir / Türkiye</button>
              <button type="button" onclick="focusPreset('marmara')" class="quake-preset-btn">Marmara</button>
              <button type="button" onclick="focusPreset('aegean')" class="quake-preset-btn">Ege / İzmir</button>
              <button type="button" onclick="focusPreset('east')" class="quake-preset-btn">Doğu Anadolu</button>
              <button type="button" onclick="focusPreset('global')" class="quake-preset-btn">Küresel M 4.0+</button>
            </div>

            <button type="button" onclick="saveCurrentWatchRegion()" class="vibe-btn vibe-btn-xs vibe-btn-secondary cursor-pointer">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>Bu Filtreyi Takibe Al</span>
            </button>
          </div>
        </div>
      </section>

      <!-- İSTATİSTİK ŞERİDİ -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Listelenen Deprem</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-ink" id="stat-count">--</div>
          <div class="text-[11px] text-mistral-stone mt-0.5" id="stat-period-label">Son 7 Gün</div>
        </div>

        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">En Büyük Sarsıntı</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-orange" id="stat-max-mag">--</div>
          <div class="text-[11px] text-mistral-stone mt-0.5 truncate" id="stat-max-place">Veri bekleniyor</div>
        </div>

        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Ortalama Derinlik</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-ink" id="stat-avg-depth">--</div>
          <div class="text-[11px] text-mistral-stone mt-0.5">Kilometre (km)</div>
        </div>

        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Son Kayıt</div>
          <div class="text-xl sm:text-2xl font-bold font-editorial text-mistral-ink" id="stat-latest-time">--</div>
          <div class="text-[11px] text-mistral-stone mt-0.5 truncate" id="stat-latest-mag">--</div>
        </div>
      </div>

      <!-- ANA HARİTA VE LİSTE GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- SOL: OpenStreetMap Deprem Haritası -->
        <div class="lg:col-span-8 space-y-3">
          <div class="vibe-panel-card p-3 sm:p-4">
            <div id="deprem-map" aria-label="Canlı Deprem Haritası"></div>
            <div class="mt-3 pt-3 border-t border-mistral-hairline flex flex-wrap items-center justify-between gap-3 text-xs text-mistral-slate">
              <div class="flex flex-wrap items-center gap-3">
                <span class="inline-flex items-center gap-1.5"><span class="quake-dot quake-dot-ref"></span> Referans (Anıtkabir)</span>
                <span class="inline-flex items-center gap-1.5"><span class="quake-dot quake-dot-low"></span> &lt; 3.0</span>
                <span class="inline-flex items-center gap-1.5"><span class="quake-dot quake-dot-mid"></span> 3.0–4.4</span>
                <span class="inline-flex items-center gap-1.5"><span class="quake-dot quake-dot-high"></span> 4.5–5.9</span>
                <span class="inline-flex items-center gap-1.5"><span class="quake-dot quake-dot-crit"></span> 6.0+</span>
              </div>
              <span class="text-[11px] text-mistral-stone">Harita: OpenStreetMap · Veri: Kandilli Rasathanesi &amp; USGS</span>
            </div>
          </div>
        </div>

        <!-- SAĞ: Son Depremler Akışı & Takip Edilen Bölgeler -->
        <div class="lg:col-span-4 space-y-5">
          <div class="vibe-panel-card p-4 sm:p-5">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-base font-bold font-editorial text-mistral-ink">Son Sarsıntılar</h2>
              <span id="feed-count-pill" class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-mistral-cream border border-mistral-beige-deep text-mistral-slate">0 kayıt</span>
            </div>
            <div id="quake-list" class="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              <div class="text-xs text-mistral-stone py-8 text-center">Deprem verileri yükleniyor...</div>
            </div>
          </div>

          <div class="vibe-panel-card p-4 sm:p-5 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-base font-bold font-editorial text-mistral-ink">Takip Ettiğim Bölgeler</h2>
              <button type="button" onclick="clearWatchedRegions()" class="text-[11px] text-rose-600 hover:underline cursor-pointer">Temizle</button>
            </div>
            <p class="text-[11px] text-mistral-slate leading-relaxed" id="watch-storage-note">
              Seçili bölge ve büyüklük filtrelerinizi hızlı erişim için kaydedin.
            </p>
            <div id="watched-regions-list" class="space-y-2">
              <div class="text-xs text-mistral-stone py-3 text-center">Henüz kayıtlı bölge yok.</div>
            </div>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('Canlı Deprem Haritası & Sismik Radar', content, extraHead));
  };
};
