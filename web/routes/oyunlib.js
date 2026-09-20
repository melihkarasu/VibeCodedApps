module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/oyunlib/app.js" defer></script>
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
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Oyun</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🕹️</span> Oyun Keşif Kütüphanesi & Arşivi
          </h1>
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
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔍</span>
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
          <span class="w-2.5 h-2.5 rounded-full bg-mistral-orange animate-ping"></span>
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
