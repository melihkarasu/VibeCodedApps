module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="/static/apps/unesco/app.js?v=20261023a" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Sanat, Tarih & Miras</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">UNESCO Dünya Mirası Atlası & Keşif Haritası</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            İnsanlığın ortak hafızası: Göbeklitepe'den Machu Picchu'ya, Efes'ten Tac Mahal'e 1.100+ dünya mirası alanı, fotoğrafları ve coğrafi konumları.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="text-mistral-orange font-bold text-sm" id="unesco-count-badge">Yükleniyor...</span>
          <span class="text-mistral-slate font-medium">Miras Alanı</span>
        </div>
      </div>

      <!-- FİLTRE VE ARAMA PANELİ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div class="sm:col-span-8 relative">
            <input 
              type="text" 
              id="unesco-search" 
              placeholder="Miras alanı veya ülke ara (örn: Göbeklitepe, Efes, Petra, İtalya, Mısır)..." 
              oninput="filterSites()"
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          </div>
          <div class="sm:col-span-4">
            <select id="unesco-category-select" onchange="filterSites()" class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange transition">
              <option value="all" selected>Tüm Kategoriler</option>
              <option value="Kültürel">Kültürel Miras</option>
              <option value="Karma">Doğal & Karma Miras</option>
            </select>
          </div>
        </div>

        <!-- Hızlı Ülke ve Bölge Filtreleri -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-mistral-hairline text-xs">
          <span class="text-mistral-stone font-medium mr-1">Öne Çıkanlar:</span>
          <button onclick="quickFilter('Türkiye')" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇹🇷 Türkiye Mirasları</button>
          <button onclick="quickFilter('İtalya')" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇮🇹 İtalya</button>
          <button onclick="quickFilter('Mısır')" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇪🇬 Mısır</button>
          <button onclick="quickFilter('Peru')" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇵🇪 Peru</button>
          <button onclick="quickFilter('')" class="px-2.5 py-1 rounded-md bg-white hover:bg-mistral-cream text-mistral-stone border border-mistral-hairline transition">Tümünü Göster</button>
        </div>
      </div>

      <!-- HARİTA VE MİRAS ALANLARI IZGARASI -->
      <div class="space-y-8 mb-16">
        <!-- Harita Alanı -->
        <div class="p-3 rounded-2xl bg-white border border-mistral-hairline shadow-sm relative overflow-hidden">
          <div id="unesco-map" class="w-full h-[440px] rounded-xl z-10"></div>
          <div class="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur border border-mistral-hairline px-3.5 py-2 rounded-lg shadow-sm text-xs text-mistral-ink flex items-center gap-3">
            <span class="flex items-center gap-1.5 font-bold text-mistral-orange">UNESCO Dünya Mirası Noktaları</span>
          </div>
        </div>

        <!-- Kart Izgarası -->
        <div id="sites-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- JS ile doldurulur -->
        </div>
      </div>
    `;

    res.send(pageTemplate('UNESCO Dünya Mirası Atlası & Keşif Haritası', content, extraHead));
  };
};
