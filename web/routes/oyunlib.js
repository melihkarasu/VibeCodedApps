module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/oyunlib/app.js?v=20261023a" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Oyun</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Oyun Keşif Kütüphanesi & Arşivi</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            FreeToGame ve açık oyun veritabanı ile PC ve tarayıcı tabanlı yüzlerce oyun, tür filtreleri ve detaylar.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="text-mistral-orange font-bold text-sm" id="game-count-badge">Yükleniyor...</span>
          <span class="text-mistral-slate font-medium">Oyun Listelendi</span>
        </div>
      </div>

      <!-- ARAMA VE TÜR FİLTRELERİ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div class="sm:col-span-8 relative">
            <input 
              type="text" 
              id="game-search" 
              placeholder="Oyun adı veya açıklama ara (örn: Overwatch, Tarisland, Genshin, PUBG)..." 
              onkeydown="if(event.key==='Enter') loadGames()"
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          </div>
          <div class="sm:col-span-4 flex gap-2">
            <select id="game-genre" onchange="loadGames()" class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink focus:outline-none focus:border-mistral-orange transition">
              <option value="all">Tüm Türler</option>
              <option value="mmorpg">MMORPG</option>
              <option value="shooter">Nişancı (Shooter / FPS)</option>
              <option value="moba">MOBA</option>
              <option value="anime">Anime</option>
              <option value="battle-royale">Battle Royale</option>
              <option value="strategy">Strateji</option>
              <option value="fantasy">Fantastik</option>
              <option value="racing">Yarış</option>
            </select>
            <button 
              onclick="loadGames()" 
              class="px-4 py-2.5 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs font-medium transition shadow-xs shrink-0 flex items-center justify-center">
              Filtrele
            </button>
          </div>
        </div>
      </div>

      <!-- OYUN KARTLARI IZGARASI -->
      <div id="games-loading" class="py-16 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">
          <span>Oyun kütüphanesi taranıyor...</span>
        </div>
      </div>

      <div id="games-grid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
        <!-- JS ile çizilir -->
      </div>
    `;

    res.send(pageTemplate('Oyun Keşif Kütüphanesi & Arşivi', content, extraHead));
  };
};
