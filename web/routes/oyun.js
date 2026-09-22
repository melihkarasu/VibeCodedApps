module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/oyun/app.css">
      <script src="/static/apps/oyun/app.js" defer></script>
    `;

    const content = `
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-white transition text-sm flex items-center gap-1">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-semibold">Yeni Seri #3</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight mt-1 text-mistral-ink flex items-center gap-2">
            <span>🏷️</span> Steam & Epic Fırsat Avcısı
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5">
            Steam, Epic Games ve GOG üzerindeki en büyük indirimler, %100 ücretsiz kalıcı oyunlar ve fırsat takibi.
          </p>
        </div>

        <!-- Üst Rozet -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-slate">
          <span class="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
          <span>CheapShark & GamerPower Veritabanı</span>
        </div>
      </div>

      <!-- 1. FIRSAT VE MAĞAZA SEÇİM PANELİ -->
      <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-5">
        
        <!-- Sekmeler & Mağaza Filtreleri -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex p-1 rounded-2xl bg-white border border-mistral-hairline">
            <button onclick="switchTab('free')" id="tab-btn-free" class="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white transition flex items-center gap-1.5 shadow">
              <span>🎁</span> %100 Ücretsiz Oyunlar
            </button>
            <button onclick="switchTab('deals')" id="tab-btn-deals" class="px-4 py-2 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-1.5">
              <span>🔥</span> Büyük İndirimler
            </button>
          </div>

          <!-- Mağazalar Filtresi (İndirimler Sekmesi İçin) -->
          <div id="stores-filter-box" class="hidden flex flex-wrap items-center gap-1.5 text-xs">
            <span class="text-mistral-stone text-[11px] mr-1">Mağaza:</span>
            <button onclick="toggleStore('1')" id="st-1" class="store-tag-btn px-2.5 py-1 rounded-lg bg-violet-500/20 border border-violet-500/50 text-violet-300 font-bold transition">♨️ Steam</button>
            <button onclick="toggleStore('25')" id="st-25" class="store-tag-btn px-2.5 py-1 rounded-lg bg-violet-500/20 border border-violet-500/50 text-violet-300 font-bold transition">⚡ Epic Games</button>
            <button onclick="toggleStore('7')" id="st-7" class="store-tag-btn px-2.5 py-1 rounded-lg bg-white border border-mistral-hairline text-mistral-slate hover:text-white transition">👾 GOG</button>
          </div>
        </div>

        <!-- Arama Çubuğu -->
        <div class="pt-2 border-t border-mistral-hairline flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <input type="text" id="input-game-search" placeholder="Oyun adı yazın (Örn: Cyberpunk, Witcher, Red Dead, Batman, Bioshock)..." onkeyup="if(event.key==='Enter') searchGames()" class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder-slate-500 focus:border-violet-400 focus:outline-none">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔍</span>
          </div>
          <button onclick="searchGames()" class="px-6 py-2.5 rounded-xl text-mistral-ink font-boldbg-mistral-cream-light hover:bg-mistral-cream-deeper text-mistral-ink font-bold font-semibold text-xs transition shrink-0">
            Fırsat Ara
          </button>
        </div>

      </div>

      <!-- 2. SONUÇ BAŞLIĞI VE LİSTE BİLGİSİ -->
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-bold text-mistral-ink flex items-center gap-2">
          <span id="deals-list-title">🎁 Şu An %100 Ücretsiz Olan Oyunlar</span>
        </h2>
        <span id="results-count" class="text-xs text-mistral-slate font-mono">Fırsatlar taranıyor...</span>
      </div>

      <!-- 3. OYUN FIRSAT KARTLARI GRİDİ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="deals-grid">
        <!-- JS ile kartlar -->
      </div>

      <div id="loading-spinner" class="py-16 text-center text-mistral-slate text-sm flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"></div>
        <span>Oyun mağazalarındaki anlık fırsatlar taranıyor...</span>
      </div>

      <div id="empty-state" class="hidden p-12 text-center rounded-3xl bg-white border border-mistral-hairline text-mistral-stone text-sm">
        <div class="text-4xl mb-3">🎮</div>
        <h3 class="font-bold text-base text-mistral-slate mb-1">Fırsat Bulunamadı</h3>
        <p class="text-xs text-mistral-slate max-w-md mx-auto">
          Aradığınız başlığa ait aktif bir indirim bulunamadı veya kampanya sona ermiş olabilir.
        </p>
      </div>

      <!-- 4. İSTEK LİSTEM & FİYAT TAKİBİ (MY WISHLIST) -->
      <div class="mt-14 pt-8 border-t border-mistral-hairline space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-mistral-ink flex items-center gap-2">
              <span>🔖</span> İstek Listem & Takip Ettiğim Fırsatlar
            </h3>
            <p class="text-mistral-slate text-xs">Kaydettiğiniz oyunların indirim ve mağaza bağlantıları.</p>
          </div>
          <button onclick="clearWishlist()" class="text-xs text-rose-400 hover:underline">Listeyi Temizle</button>
        </div>

        <div id="wishlist-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <!-- JS ile doldurulur -->
        </div>
        <div id="wishlist-empty" class="p-8 text-center rounded-2xl bg-white border border-mistral-hairline text-mistral-stone text-xs">
          Henüz istek listenize bir oyun eklemediniz. Kartlardaki 🔖 simgesine tıklayarak favorilerinizi buraya kaydedebilirsiniz.
        </div>
      </div>

      <!-- Toast Bildirimi -->
      <div id="game-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-violet-600 text-white font-bold text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı -->
    `;

    res.send(pageTemplate('Steam & Epic Fırsat Avcısı', content, extraHead));
  };
};
