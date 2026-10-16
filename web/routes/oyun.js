module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/oyun/app.css?v=20261017a">
      <script src="/static/apps/oyun/app.js?v=20261017a" defer></script>
    `;

    const content = `
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Oyun</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Steam & Epic Fırsat Avcısı</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5">
            Steam, Epic Games ve GOG üzerindeki en büyük indirimler, %100 ücretsiz kalıcı oyunlar ve fırsat takibi.
          </p>
        </div>

        <!-- Üst Rozet -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-slate">
          <span>CheapShark & GamerPower Veritabanı</span>
        </div>
      </div>

      <!-- 1. FIRSAT VE MAĞAZA SEÇİM PANELİ -->
      <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-5">
        
        <!-- Sekmeler & Mağaza Filtreleri -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex p-1 rounded-2xl bg-white border border-mistral-hairline">
            <button onclick="switchTab('free')" id="tab-btn-free" class="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white transition flex items-center gap-1.5 shadow">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></span> %100 Ücretsiz Oyunlar
            </button>
            <button onclick="switchTab('deals')" id="tab-btn-deals" class="px-4 py-2 rounded-xl text-xs font-bold text-mistral-slate hover:text-mistral-ink hover:bg-mistral-cream transition flex items-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg></span> Büyük İndirimler
            </button>
          </div>

          <!-- Mağazalar Filtresi (İndirimler Sekmesi İçin) -->
          <div id="stores-filter-box" class="hidden flex flex-wrap items-center gap-1.5 text-xs">
            <span class="text-mistral-stone text-[11px] mr-1">Mağaza:</span>
            <button onclick="toggleStore('1')" id="st-1" class="store-tag-btn px-2.5 py-1 rounded-lg bg-[#171a21] border border-[#2a475e] text-white font-bold transition shadow-sm">Steam</button>
            <button onclick="toggleStore('25')" id="st-25" class="store-tag-btn px-2.5 py-1 rounded-lg bg-[#202020] border border-[#3f3f46] text-white font-bold transition shadow-sm">Epic Games</button>
            <button onclick="toggleStore('7')" id="st-7" class="store-tag-btn px-2.5 py-1 rounded-lg bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink hover:bg-mistral-cream font-medium transition">GOG</button>
          </div>
        </div>

        <!-- Arama Çubuğu -->
        <div class="pt-2 border-t border-mistral-hairline flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <input type="text" id="input-game-search" placeholder="Oyun adı yazın (Örn: Cyberpunk, Witcher, Red Dead, Batman, Bioshock)..." onkeyup="if(event.key==='Enter') searchGames()" class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder-slate-500 focus:border-violet-400 focus:outline-none">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          </div>
          <button onclick="searchGames()" class="px-6 py-2.5 rounded-xl text-mistral-ink font-bold bg-mistral-cream-light hover:bg-mistral-cream-deeper text-mistral-ink font-bold font-semibold text-xs transition shrink-0">
            Fırsat Ara
          </button>
        </div>

      </div>

      <!-- 2. SONUÇ BAŞLIĞI VE LİSTE BİLGİSİ -->
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-bold text-mistral-ink flex items-center gap-2">
          <span id="deals-list-title">Şu An %100 Ücretsiz Olan Oyunlar</span>
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
        <div class="text-4xl mb-3"><svg class="w-6 h-6 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg></div>
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
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg></span> İstek Listem & Takip Ettiğim Fırsatlar
            </h3>
            <p class="text-mistral-slate text-xs">Kaydettiğiniz oyunların indirim ve mağaza bağlantıları.</p>
          </div>
          <button onclick="clearWishlist()" class="text-xs text-rose-400 hover:underline">Listeyi Temizle</button>
        </div>

        <div id="wishlist-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <!-- JS ile doldurulur -->
        </div>
        <div id="wishlist-empty" class="p-8 text-center rounded-2xl bg-white border border-mistral-hairline text-mistral-stone text-xs">
          Henüz istek listenize bir oyun eklemediniz. Kartlardaki simgesine tıklayarak favorilerinizi buraya kaydedebilirsiniz.
        </div>
      </div>

      <!-- Toast Bildirimi -->
      <div id="game-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-violet-600 text-white font-bold text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı -->
    `;

    res.send(pageTemplate('Steam & Epic Fırsat Avcısı', content, extraHead));
  };
};
