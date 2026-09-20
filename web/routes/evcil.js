module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/evcil/app.js" defer></script>
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
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Popüler Kültür & Yaşam</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🐾</span> Evcil Dostlar Ansiklopedisi & Irk Rehberi
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            TheCatAPI & Dog CEO altyapısıyla 150+ kedi ve köpek ırkı, mizaç analizi, yaşam süresi, çocuk dostluğu ve köken rehberi.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="text-mistral-orange font-bold text-sm" id="pet-count-badge">Yükleniyor...</span>
          <span class="text-mistral-slate font-medium">Irk Listelendi</span>
        </div>
      </div>

      <!-- FİLTRE VE ARAMA PANELİ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <!-- Arama Kutusu -->
          <div class="sm:col-span-8 relative">
            <input 
              type="text" 
              id="pet-search" 
              placeholder="Irk adı veya mizaç ara (örn: Van, Kangal, Golden, Husky, sakin, oyuncu)..." 
              oninput="filterBreeds()"
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔍</span>
          </div>

          <!-- Tür Seçici (Kedi / Köpek / Tümü) -->
          <div class="sm:col-span-4">
            <select id="pet-type-select" onchange="filterBreeds()" class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange transition">
              <option value="all" selected>🐾 Tümü (Kedi & Köpek)</option>
              <option value="cat">🐱 Sadece Kediler</option>
              <option value="dog">🐶 Sadece Köpekler</option>
            </select>
          </div>
        </div>

        <!-- Mizaç Filtre Hapları -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-mistral-hairline text-xs">
          <span class="text-mistral-stone font-medium mr-1">Popüler Mizaçlar:</span>
          <button onclick="setTemperamentFilter('oyuncu')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🎾 Oyuncu</button>
          <button onclick="setTemperamentFilter('sakin')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🧘 Sakin & Uysal</button>
          <button onclick="setTemperamentFilter('zeki')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">💡 Üstün Zekalı</button>
          <button onclick="setTemperamentFilter('koruyucu')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🛡️ Koruyucu & Sadık</button>
          <button onclick="setTemperamentFilter('')" class="px-2.5 py-1 rounded-md bg-white hover:bg-mistral-cream text-mistral-stone border border-mistral-hairline transition">Filtreyi Temizle</button>
        </div>
      </div>

      <!-- IRK KARTLARI IZGARASI -->
      <div id="pets-loading" class="py-16 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">
          <span class="w-2.5 h-2.5 rounded-full bg-mistral-orange animate-ping"></span>
          <span>Evcil dostlar veritabanı taranıyor...</span>
        </div>
      </div>

      <div id="pets-grid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
        <!-- JS ile çizilir -->
      </div>

      <!-- IRK DETAY MODALI -->
      <div id="pet-modal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div class="relative w-full max-w-lg bg-white border border-mistral-hairline rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
          <button onclick="closePetModal()" class="absolute top-4 right-4 w-8 h-8 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-slate hover:text-mistral-ink flex items-center justify-center text-sm font-bold transition">✕</button>

          <div class="aspect-video w-full rounded-xl overflow-hidden bg-mistral-cream border border-mistral-beige-deep flex items-center justify-center">
            <img id="m-pet-img" src="" alt="Irk" class="w-full h-full object-cover">
          </div>

          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-mistral-orange uppercase tracking-wider" id="m-pet-type">KÖPEK</span>
              <span class="text-xs text-mistral-stone font-medium" id="m-pet-origin">Köken</span>
            </div>
            <h3 class="text-2xl font-bold font-editorial text-mistral-ink" id="m-pet-name">Irk Adı</h3>
          </div>

          <p class="text-xs text-mistral-slate leading-relaxed" id="m-pet-desc">
            Açıklama yükleniyor...
          </p>

          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <div class="p-2.5 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
              <span class="text-[10px] text-mistral-stone block">Yaşam Süresi</span>
              <strong class="text-mistral-ink font-bold text-xs" id="m-pet-life">-</strong>
            </div>
            <div class="p-2.5 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
              <span class="text-[10px] text-mistral-stone block">Çocuk Dostu</span>
              <strong class="text-mistral-ink font-bold text-xs" id="m-pet-friendly">⭐ 5/5</strong>
            </div>
            <div class="p-2.5 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
              <span class="text-[10px] text-mistral-stone block">Enerji Düzeyi</span>
              <strong class="text-mistral-ink font-bold text-xs" id="m-pet-energy">⚡ 4/5</strong>
            </div>
          </div>

          <div class="pt-2 border-t border-mistral-hairline">
            <span class="text-[11px] text-mistral-stone block mb-1">Mizaç Karakteristikleri:</span>
            <div id="m-pet-temperament" class="flex flex-wrap gap-1.5 text-[11px]"></div>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('Evcil Dostlar Ansiklopedisi & Irk Rehberi', content, extraHead));
  };
};
