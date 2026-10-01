module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/lezzet/app.css">
      <script src="/static/apps/lezzet/app.js?v=20260926h" defer></script>
    `;

    const content = `
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-white transition text-sm flex items-center gap-1">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold">Mikro Uygulama #6</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight mt-1 text-mistral-ink flex items-center gap-2">
            <span>🍹</span> Lezzet Atölyesi: Mutfak & Miksoloji
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5">
            TheMealDB & Forkify (1M+ Tarif) ile "Evdeki malzemelerle ne yapabilirim?", dünya mutfakları ve kokteyl rehberi.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
          <!-- Mutfak & Bar Mod Değiştirici -->
          <div class="flex items-center gap-2 p-1 rounded-2xl bg-white border border-mistral-hairline shadow-md">
            <button onclick="switchMode('kitchen')" id="btn-mode-kitchen" class="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white transition flex items-center gap-2 shadow">
              <span>🍲</span> Gurme Mutfak
            </button>
            <button onclick="switchMode('bar')" id="btn-mode-bar" class="px-4 py-2 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-2">
              <span>🍸</span> Miksoloji Barı
            </button>
          </div>

          <!-- Mutfak Kaynak Filtresi (Forkify & TheMealDB) -->
          <div id="kitchen-source-selector" class="flex items-center gap-1 p-1 rounded-2xl bg-white border border-mistral-hairline shadow-md">
            <button onclick="setRecipeSource('all')" id="btn-src-all" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white transition" title="Her iki kaynaktan birleşik getir">
              🌐 Tümü
            </button>
            <button onclick="setRecipeSource('forkify')" id="btn-src-forkify" class="px-3 py-1.5 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition" title="Forkify 1M+ Global Gurme Arşivi">
              📚 Forkify
            </button>
            <button onclick="setRecipeSource('themealdb')" id="btn-src-themealdb" class="px-3 py-1.5 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition" title="TheMealDB Dünya Mutfakları">
              🌟 MealDB
            </button>
          </div>
        </div>
      </div>

      <!-- ÜST AKSİYON & DOLAPTA NE VAR? BÖLÜMÜ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-bold text-mistral-ink flex items-center gap-2">
              <span id="pantry-title">🧺 Dolapta Ne Var? (Evdeki Malzemelerle Pişir)</span>
            </h2>
            <p class="text-mistral-slate text-xs mt-0.5" id="pantry-desc">
              Elinizdeki malzemeleri metin kutusuna yazarak ekleyin veya hazır etiketlere tıklayın:
            </p>
          </div>

          <!-- Sürpriz Tarif Butonu (Şans Çarkı) -->
          <button onclick="fetchRandomRecipe()" class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 shrink-0">
            <span>🎲</span> <span id="btn-random-label">Ne Yesem? (Rastgele Sürpriz)</span>
          </button>
        </div>

        <!-- Serbest Metinle Malzeme Girişi & Arama -->
        <div class="flex flex-col sm:flex-row gap-2.5">
          <div class="relative flex-1">
            <input type="text" id="input-ingredient" placeholder="Malzeme yazın (Örn: patates, tavuk, sarımsak, soğan, cheese, mint)..." onkeyup="if(event.key==='Enter') addCustomIngredient()" class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder-slate-500 focus:border-rose-400 focus:outline-none">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🥕</span>
          </div>
          <button onclick="addCustomIngredient()" class="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 shrink-0">
            <span>+</span> <span>Malzemeyi Ekle & Ara</span>
          </button>
        </div>

        <!-- Seçilen Malzemelerin Rozetleri (Active Tags) -->
        <div id="selected-ingredients-wrapper" class="hidden flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white border border-rose-500/30">
          <span class="text-xs font-semibold text-rose-300 flex items-center gap-1 shrink-0">
            <span>🛒 Seçili Malzemeler:</span>
          </span>
          <div id="selected-ingredients-container" class="flex flex-wrap gap-1.5 items-center">
            <!-- JS ile dinamik rozetler -->
          </div>
          <button onclick="clearSelectedIngredients()" class="text-[11px] text-mistral-slate hover:text-rose-400 underline ml-auto transition">
            Temizle
          </button>
        </div>

        <!-- Hızlı Malzeme Etiketleri -->
        <div>
          <div class="text-[11px] text-mistral-slate mb-1.5 font-medium flex items-center gap-1">
            <span>⚡ Hızlı Seçim:</span>
            <span class="text-mistral-stone text-[10px]">(Tıklayarak listeye ekleyin)</span>
          </div>
          <div class="flex flex-wrap gap-2" id="pantry-tags-container">
            <!-- JS ile doldurulur -->
          </div>
        </div>

        <!-- Genel Tarif Arama (Yemek/İçecek Adı) -->
        <div class="pt-3 border-t border-mistral-hairline flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <input type="text" id="input-search" placeholder="Yemek veya tarif adı arayın (Örn: Pasta, Kebab, Soup)..." onkeyup="if(event.key==='Enter') executeSearch()" class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder-slate-500 focus:border-rose-400 focus:outline-none">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔍</span>
          </div>
          <button onclick="executeSearch()" class="px-5 py-2.5 rounded-xl text-mistral-ink font-boldbg-mistral-cream-light hover:bg-mistral-cream-deeper text-mistral-ink font-bold font-semibold text-xs transition">
            Tarif Adı Ara
          </button>
        </div>
      </div>

      <!-- FİLTRELER: Mutfak / Kategori Seçimi -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2" id="filter-buttons-container">
          <!-- JS ile doldurulur (Örn: Türk Mutfak, İtalyan, Tatlı, Alkolsüz vb.) -->
        </div>
        <div class="text-xs text-mistral-slate font-medium" id="results-count">
          Yükleniyor...
        </div>
      </div>

      <!-- TARİF KARTLARI GRİDİ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="recipes-grid">
        <!-- JS ile tarif kartları buraya basılır -->
      </div>

      <div id="loading-spinner" class="py-16 text-center text-mistral-slate text-sm flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin"></div>
        <span>Nefis tarifler hazırlanıyor...</span>
      </div>

      <div id="empty-state" class="hidden py-16 text-center text-mistral-slate text-sm">
        <div class="text-4xl mb-2">🍽️</div>
        <span>Aradığınız kriterlere uygun tarif bulunamadı. Başka bir malzeme veya arama terimi deneyebilirsiniz.</span>
      </div>

      <!-- KAYITLI TARİF DEFTERİM (MY RECIPE BOOK) -->
      <div class="mt-14 pt-8 border-t border-mistral-hairline">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-bold text-mistral-ink flex items-center gap-2">
              <span>📖</span> Tarif Defterim & Favoriler
            </h2>
            <p class="text-mistral-slate text-xs mt-1">
              Beğenip kaydettiğiniz yemek ve kokteyl tarifleri hesabınızla saklanır.
            </p>
          </div>
          <button onclick="clearAllSavedRecipes()" class="text-xs text-rose-400 hover:underline px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition">
            Defteri Temizle
          </button>
        </div>

        <div id="saved-recipes-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <!-- JS ile dinamik favoriler -->
        </div>
        <div id="saved-recipes-empty" class="p-8 text-center rounded-2xl bg-white border border-mistral-hairline text-mistral-stone text-xs">
          Henüz tarif defterinize bir lezzet eklemediniz. Tarif kartlarındaki 🔖 simgesine tıklayarak kaydedebilirsiniz.
        </div>
      </div>

      <!-- DETAY MODALI (RECIPE MODAL) -->
      <div id="recipe-modal" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div class="relative w-full max-w-2xl bg-white border border-mistral-hairline rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
          
          <!-- Kapat Butonu -->
          <button onclick="closeModal()" class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white hover:bg-white text-mistral-slate hover:text-white flex items-center justify-center transition border border-mistral-hairline text-sm">
            ✕
          </button>

          <!-- Modal Başlık Resmi -->
          <div class="relative h-64 sm:h-72 w-full overflow-hidden shrink-0">
            <img id="modal-img" src="" class="w-full h-full object-cover" alt="Tarif">
            <div class="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-16" style="background:linear-gradient(to top, rgba(0,0,0,0.6), transparent 70%)">
              <div class="flex flex-wrap gap-2 mb-2" id="modal-badges"></div>
              <h2 id="modal-title" class="text-2xl sm:text-3xl font-extrabold text-white" style="text-shadow:0 1px 6px rgba(0,0,0,0.45)"></h2>
            </div>
          </div>

          <!-- Modal İçerik -->
          <div class="p-6 overflow-y-auto space-y-6 flex-1">
            
            <!-- Aksiyon Butonları (Kaydet & Video) -->
            <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-mistral-hairline">
              <button onclick="toggleSaveCurrentModalRecipe()" id="btn-modal-save" class="px-4 py-2 rounded-xl bg-white hover:bg-mistral-cream text-xs font-semibold text-mistral-ink transition flex items-center gap-1.5 border border-mistral-hairline">
                <span id="modal-save-icon">🔖</span> <span id="modal-save-text">Tarif Defterime Kaydet</span>
              </button>

              <div id="modal-video-box"></div>
            </div>

            <!-- Malzemeler Listesi -->
            <div>
              <h3 class="text-sm font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
                <span>🧂</span> Gerekli Malzemeler & Ölçüler
              </h3>
              <div id="modal-ingredients" class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs"></div>
            </div>

            <!-- Hazırlanış Talimatı -->
            <div>
              <h3 class="text-sm font-bold uppercase tracking-wider text-teal-400 mb-3 flex items-center gap-1.5">
                <span>👩‍🍳</span> Adım Adım Hazırlanışı
              </h3>
              <div id="modal-instructions" class="text-xs sm:text-sm text-mistral-slate leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-mistral-hairline"></div>
            </div>

          </div>

        </div>
      </div>

      <!-- Toast Bildirimi -->
      <div id="lezzet-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-rose-500 text-white font-semibold text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı -->
    `;

    res.send(pageTemplate('Lezzet Atölyesi: Mutfak & Miksoloji', content, extraHead));
  };
};
