module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/evcil/app.js?v=20261023a" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Popüler Kültür & Eğlence</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Evcil Dostlar Ansiklopedisi & Irk Rehberi</h1></div>
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
              placeholder="Irk adı, ülke veya mizaç ara (örn: Van, Kangal, Golden, Husky, sakin, oyuncu)..." 
              oninput="filterBreeds()"
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          </div>

          <!-- Tür Seçici (Kedi / Köpek / Tümü) -->
          <div class="sm:col-span-4">
            <select id="pet-type-select" onchange="filterBreeds()" class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange transition">
              <option value="all" selected>Tümü (Kedi & Köpek)</option>
              <option value="cat">Sadece Kediler</option>
              <option value="dog">Sadece Köpekler</option>
            </select>
          </div>
        </div>

        <!-- Mizaç Filtre Hapları -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-mistral-hairline text-xs">
          <span class="text-mistral-stone font-medium mr-1">Popüler Mizaçlar:</span>
          <button type="button" onclick="setTemperamentFilter('oyuncu')" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper border border-mistral-beige-deep transition cursor-pointer">Oyuncu</button>
          <button type="button" onclick="setTemperamentFilter('sakin')" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper border border-mistral-beige-deep transition cursor-pointer">Sakin & Uysal</button>
          <button type="button" onclick="setTemperamentFilter('zeki')" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper border border-mistral-beige-deep transition cursor-pointer">Üstün Zekalı</button>
          <button type="button" onclick="setTemperamentFilter('koruyucu')" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper border border-mistral-beige-deep transition cursor-pointer">Koruyucu & Sadık</button>
          <button type="button" onclick="setTemperamentFilter('')" class="px-2.5 py-1 rounded-md bg-white hover:bg-mistral-cream text-mistral-stone border border-mistral-hairline transition cursor-pointer">Filtreyi Temizle</button>
        </div>
      </div>

      <!-- IRK KARTLARI IZGARASI -->
      <div id="pets-loading" class="py-16 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">
          <span>Evcil dostlar veritabanı taranıyor...</span>
        </div>
      </div>

      <div id="pets-grid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <!-- JS ile çizilir -->
      </div>

      <!-- SAYFALAMA (PAGINATION) -->
      <div id="pets-pagination" class="hidden mb-16 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-mistral-hairline shadow-2xs"></div>

      <!-- IRK DETAY MODALI -->
      <div id="pet-modal" onclick="if(event.target===this)closePetModal()" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div class="relative w-full max-w-lg bg-white border border-mistral-hairline rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
          <button type="button" onclick="closePetModal()" aria-label="Kapat" title="Kapat" class="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-lg bg-white/95 hover:bg-mistral-cream text-mistral-ink hover:text-mistral-orange border border-mistral-hairline shadow-sm flex items-center justify-center transition cursor-pointer">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

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
              <strong class="text-mistral-ink font-bold text-xs" id="m-pet-friendly">5/5</strong>
            </div>
            <div class="p-2.5 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
              <span class="text-[10px] text-mistral-stone block">Enerji Düzeyi</span>
              <strong class="text-mistral-ink font-bold text-xs" id="m-pet-energy">4/5</strong>
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
