module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="/static/apps/unesco/app.js?v=20260927a" defer></script>
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
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Sanat, Tarih & Edebiyat</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🏛️</span> UNESCO Dünya Mirası Atlası & Keşif Haritası
          </h1>
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
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔍</span>
          </div>
          <div class="sm:col-span-4">
            <select id="unesco-category-select" onchange="filterSites()" class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange transition">
              <option value="all" selected>Tüm Kategoriler</option>
              <option value="Kültürel">🏛️ Kültürel Miras</option>
              <option value="Karma">🌋 Doğal & Karma Miras</option>
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
            <span class="flex items-center gap-1.5 font-bold text-mistral-orange">🏛️ UNESCO Dünya Mirası Noktaları</span>
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
