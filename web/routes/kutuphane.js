module.exports = function(pageTemplate) {
  return function(req, res) {
    // Dijital Kütüphane Özel Varlıkları (Cache Destekli Modüler CSS & JS)
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/kutuphane/app.css">
      <script src="/static/apps/kutuphane/app.js" defer></script>
    `;

    const content = `
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/app" class="text-mistral-slate hover:text-white transition text-sm flex items-center gap-1">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">Yeni Seri #1</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight mt-1 text-mistral-ink flex items-center gap-2">
            <span>📖</span> Dijital Kütüphane & Klasik E-Kitap Okuyucu
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5">
            Project Gutenberg arşivindeki 70.000+ dünya klasiğini tarayıcıda doğrudan okuyun, özelleştirin ve kaldığınız yeri saklayın.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-slate">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Project Gutenberg Açık Arşivi</span>
        </div>
      </div>

      <!-- 0. İSİMLE / YAZARLA KİTAP ARAMA ÇUBUĞU -->
      <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-md mb-8 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-mistral-ink uppercase tracking-wider flex items-center gap-2">
            <span>🔍</span> İsimle veya Yazarla Kitap Ara
          </h2>
          <span class="text-xs text-mistral-stone font-mono">Project Gutenberg & Açık Arşiv</span>
        </div>

        <div class="flex flex-col sm:flex-row gap-2.5">
          <div class="relative flex-1">
            <input 
              type="text" 
              id="input-book-search" 
              placeholder="Örn: Suç ve Ceza, Dostoyevski, Frankenstein, Kafka, Gurur ve Önyargı, Sherlock Holmes..." 
              onkeydown="if(event.key==='Enter') searchBooks()"
              class="w-full pl-10 pr-20 py-3 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder-slate-400 focus:border-emerald-500 focus:outline-none font-medium">
            <span class="absolute left-3.5 top-3.5 text-mistral-stone text-sm">🔎</span>
            <button onclick="clearSearchInput()" id="btn-clear-search" class="hidden absolute right-3 top-3 text-xs text-mistral-stone hover:text-mistral-ink px-2 py-1 rounded bg-mistral-cream-light border border-mistral-hairline transition cursor-pointer">
              Temizle
            </button>
          </div>
          <button 
            type="button" 
            onclick="searchBooks()" 
            id="btn-search-book" 
            class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-600/20 shrink-0 flex items-center justify-center gap-2 cursor-pointer">
            <span id="search-spinner" class="hidden animate-spin">⏳</span>
            <span>Kitap Ara</span>
          </button>
        </div>

        <!-- Hızlı Arama Önerileri -->
        <div class="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span class="text-mistral-stone text-[11px] mr-1">Popüler Aramalar:</span>
          <button onclick="searchBooks('Dostoyevski')" class="px-2.5 py-1 rounded-lg bg-mistral-cream-light hover:bg-mistral-cream text-mistral-ink font-semibold text-[11px] border border-mistral-beige-deep transition cursor-pointer">Dostoyevski</button>
          <button onclick="searchBooks('Tolstoy')" class="px-2.5 py-1 rounded-lg bg-mistral-cream-light hover:bg-mistral-cream text-mistral-ink font-semibold text-[11px] border border-mistral-beige-deep transition cursor-pointer">Tolstoy</button>
          <button onclick="searchBooks('Kafka')" class="px-2.5 py-1 rounded-lg bg-mistral-cream-light hover:bg-mistral-cream text-mistral-ink font-semibold text-[11px] border border-mistral-beige-deep transition cursor-pointer">Kafka</button>
          <button onclick="searchBooks('Jane Austen')" class="px-2.5 py-1 rounded-lg bg-mistral-cream-light hover:bg-mistral-cream text-mistral-ink font-semibold text-[11px] border border-mistral-beige-deep transition cursor-pointer">Jane Austen</button>
          <button onclick="searchBooks('Frankenstein')" class="px-2.5 py-1 rounded-lg bg-mistral-cream-light hover:bg-mistral-cream text-mistral-ink font-semibold text-[11px] border border-mistral-beige-deep transition cursor-pointer">Frankenstein</button>
          <button onclick="searchBooks('Sherlock Holmes')" class="px-2.5 py-1 rounded-lg bg-mistral-cream-light hover:bg-mistral-cream text-mistral-ink font-semibold text-[11px] border border-mistral-beige-deep transition cursor-pointer">Sherlock Holmes</button>
          <button onclick="searchBooks('Dracula')" class="px-2.5 py-1 rounded-lg bg-mistral-cream-light hover:bg-mistral-cream text-mistral-ink font-semibold text-[11px] border border-mistral-beige-deep transition cursor-pointer">Dracula</button>
          <button onclick="searchBooks('Savaş Sanatı')" class="px-2.5 py-1 rounded-lg bg-mistral-cream-light hover:bg-mistral-cream text-mistral-ink font-semibold text-[11px] border border-mistral-beige-deep transition cursor-pointer">Savaş Sanatı</button>
        </div>

        <!-- Arama Sonuçları Paneli -->
        <div id="search-results-section" class="hidden pt-4 border-t border-mistral-hairline space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-mistral-ink uppercase tracking-wider flex items-center gap-1.5" id="search-results-header">
              <span>📚</span> Arama Sonuçları
            </h3>
            <button onclick="closeSearchResults()" class="text-xs text-mistral-slate hover:text-mistral-ink cursor-pointer">Sonuçları Kapat ✕</button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" id="search-results-grid">
            <!-- app.js ile doldurulur -->
          </div>
        </div>
      </div>

      <!-- 1. HIZLI ERİŞİM VE ÖNE ÇIKAN DÜNYA KLASİKLERİ -->
      <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-sm font-bold text-mistral-ink uppercase tracking-wider flex items-center gap-2">
              <span>🏛️</span> Seçkin Dünya Edebiyatı Klasikleri
            </h2>
            <p class="text-mistral-slate text-xs mt-0.5">
              Aşağıdaki başyapıtlardan birine tıklayarak anında tam metin e-kitap okuyucuyu başlatın:
            </p>
          </div>

          <!-- Özel Gutenberg Kitap ID ile Açma -->
          <div class="flex items-center gap-2 shrink-0">
            <input type="number" id="input-gutenberg-id" placeholder="Gutenberg ID (Örn: 84)" class="w-44 px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs font-mono text-mistral-ink focus:border-emerald-400 focus:outline-none">
            <button onclick="loadCustomGutenbergBook()" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow cursor-pointer">
              Kitabı Aç
            </button>
          </div>
        </div>

        <!-- Hızlı Kategori Filtre Butonları -->
        <div class="flex flex-wrap gap-2 pt-1 text-xs">
          <button onclick="filterBooks('all')" id="f-all" class="filter-tag-btn px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold transition shadow cursor-pointer">Tüm Klasikler</button>
          <button onclick="filterBooks('roman')" id="f-roman" class="filter-tag-btn px-3 py-1.5 rounded-xl bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition cursor-pointer">Roman & Kurgu</button>
          <button onclick="filterBooks('felsefe')" id="f-felsefe" class="filter-tag-btn px-3 py-1.5 rounded-xl bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition cursor-pointer">Felsefe & Strateji</button>
          <button onclick="filterBooks('macera')" id="f-macera" class="filter-tag-btn px-3 py-1.5 rounded-xl bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition cursor-pointer">Macera & Gotik</button>
          <button onclick="filterBooks('bilim')" id="f-bilim" class="filter-tag-btn px-3 py-1.5 rounded-xl bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition cursor-pointer">Bilimkurgu & Distopya</button>
        </div>

        <!-- Kitap Kartları Izgarası -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2" id="books-grid">
          <!-- app.js ile doldurulur -->
        </div>
      </div>

      <!-- 2. KİŞİSEL KİTAPLIĞIM & OKUMA TAKİP LİSTEM -->
      <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-mistral-ink flex items-center gap-2">
            <span>📚</span> Kişisel Kitaplığım & Kaldığım Yerler
          </h3>
          <button onclick="clearShelf()" class="text-xs text-rose-400 hover:underline cursor-pointer">Kitaplığı Temizle</button>
        </div>

        <div id="shelf-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <!-- app.js ile doldurulur -->
        </div>
        <div id="shelf-empty" class="p-8 text-center rounded-2xl bg-white border border-mistral-hairline text-mistral-stone text-xs">
          Henüz kitaplığınıza bir eser eklemediniz. Yukarıdaki kitaplardan birini okumaya başladığınızda ilerlemeniz buraya otomatik kaydedilir.
        </div>
      </div>

      <!-- 3. TAM EKRAN E-KİTAP OKUYUCU MODALI (IN-BROWSER E-READER) -->
      <div id="reader-modal" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between overflow-hidden">
        
        <!-- Okuyucu Üst Araç Çubuğu (Controls Bar) -->
        <header class="p-3 sm:p-4 bg-white border-b border-mistral-hairline flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
          <div class="flex items-center gap-3 min-w-0">
            <button onclick="closeReader()" class="px-3 py-1.5 rounded-xl bg-white hover:bg-mistral-cream-light text-mistral-slate hover:text-mistral-ink font-bold text-xs transition flex items-center gap-1.5 border border-mistral-hairline cursor-pointer">
              &larr; Çıkış
            </button>
            <div class="min-w-0">
              <h3 id="reader-book-title" class="font-bold text-sm text-mistral-ink truncate max-w-xs sm:max-w-md">Kitap Adı</h3>
              <p id="reader-book-author" class="text-xs text-emerald-400 truncate">Yazar</p>
            </div>
          </div>

          <!-- Okuma Ayarları (Font, Boyut, Tema) -->
          <div class="flex items-center gap-2 sm:gap-3">
            
            <!-- Tema Seçici (Koyu / Sepya / Açık) -->
            <div class="flex p-0.5 rounded-xl bg-white border border-mistral-hairline text-xs">
              <button onclick="setReaderTheme('dark')" id="theme-btn-dark" class="px-2.5 py-1 rounded-lg text-mistral-slate font-bold transition cursor-pointer" title="Koyu Mod">🌙</button>
              <button onclick="setReaderTheme('sepya')" id="theme-btn-sepya" class="px-2.5 py-1 rounded-lg text-mistral-slate font-bold transition cursor-pointer" title="Sepya Kitap Kağıdı">📜</button>
              <button onclick="setReaderTheme('light')" id="theme-btn-light" class="px-2.5 py-1 rounded-lg text-mistral-slate font-bold transition cursor-pointer" title="Açık Mod">☀️</button>
            </div>

            <!-- Font Ailesi (Serif / Sans) -->
            <button onclick="toggleFontFamily()" id="btn-font-family" class="px-3 py-1.5 rounded-xl bg-white hover:bg-mistral-cream border border-mistral-hairline text-xs font-bold text-mistral-slate transition cursor-pointer" title="Yazı Tipini Değiştir">
              Serif
            </button>

            <!-- Font Büyüklüğü (A- / A+) -->
            <div class="flex items-center bg-white rounded-xl border border-mistral-hairline text-xs font-mono">
              <button onclick="changeFontSize(-2)" class="w-8 h-8 rounded-l-xl hover:bg-mistral-cream text-mistral-slate flex items-center justify-center font-bold cursor-pointer" title="Küçült">A-</button>
              <span id="label-font-size" class="px-2 text-mistral-slate">18px</span>
              <button onclick="changeFontSize(2)" class="w-8 h-8 rounded-r-xl hover:bg-mistral-cream text-mistral-slate flex items-center justify-center font-bold cursor-pointer" title="Büyüt">A+</button>
            </div>

            <!-- Sesli Dinle Butonu (TTS Özelliği) -->
            <button onclick="toggleTtsBar()" id="btn-toggle-tts" class="px-3 py-1.5 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink font-bold text-xs transition shadow flex items-center gap-1.5 border border-mistral-beige-deep cursor-pointer">
              <span>🎧</span> <span>Sesli Dinle</span>
            </button>

            <!-- Yer İmi Kaydet -->
            <button onclick="saveBookmark()" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow flex items-center gap-1 cursor-pointer">
              <span>🔖</span> <span class="hidden sm:inline">Kaldığım Yeri Kaydet</span>
            </button>
          </div>
        </header>

        <!-- TTS Sesli Kitap Oynatıcı Çubuğu -->
        <div id="tts-player-bar" class="hidden px-4 py-2.5 bg-mistral-cream border-b border-mistral-beige-deep flex flex-wrap items-center justify-between gap-3 text-xs text-mistral-ink shrink-0 z-20 shadow-inner">
          <div class="flex items-center gap-2">
            <button onclick="togglePlayPauseSpeech()" id="btn-tts-play" class="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center shadow cursor-pointer">
              ▶
            </button>
            <button onclick="stopSpeech()" class="w-8 h-8 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-mistral-hairline font-bold flex items-center justify-center shadow-sm cursor-pointer" title="Durdur">
              ⏹
            </button>
            <span id="tts-status-text" class="text-xs font-semibold ml-1.5">Sesli okuma hazır</span>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5 mr-1">
              <span class="text-mistral-slate text-[11px]">Dil:</span>
              <select id="select-tts-lang" onchange="changeSpeechLanguage(this.value)" class="px-2 py-0.5 rounded-lg bg-white border border-mistral-hairline text-mistral-ink text-xs font-semibold focus:outline-none">
                <option value="en-US">🇺🇸 İngilizce (US)</option>
                <option value="tr-TR">🇹🇷 Türkçe (TR)</option>
                <option value="en-GB">🇬🇧 İngilizce (UK)</option>
                <option value="de-DE">🇩🇪 Almanca</option>
                <option value="fr-FR">🇫🇷 Fransızca</option>
              </select>
            </div>
            <span class="text-mistral-slate text-[11px]">Hız:</span>
            <div class="flex rounded-lg bg-white border border-mistral-hairline p-0.5 text-[11px] font-mono">
              <button onclick="setSpeechRate(0.8)" id="rate-btn-08" class="px-2 py-0.5 rounded text-mistral-slate hover:text-mistral-ink cursor-pointer">0.8x</button>
              <button onclick="setSpeechRate(1.0)" id="rate-btn-10" class="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold cursor-pointer">1.0x</button>
              <button onclick="setSpeechRate(1.25)" id="rate-btn-125" class="px-2 py-0.5 rounded text-mistral-slate hover:text-mistral-ink cursor-pointer">1.25x</button>
              <button onclick="setSpeechRate(1.5)" id="rate-btn-15" class="px-2 py-0.5 rounded text-mistral-slate hover:text-mistral-ink cursor-pointer">1.5x</button>
            </div>
            <span class="text-mistral-stone text-[11px] hidden md:inline ml-2">(İstediğiniz paragrafa tıklayarak oradan dinleyebilirsiniz)</span>
          </div>
        </div>

        <!-- Okuma Metni Alanı (Reading Viewport) -->
        <div id="reader-viewport" class="flex-1 overflow-y-auto p-6 sm:p-12 book-theme-dark font-serif-reader transition-colors duration-300" onscroll="handleScroll()">
          <div class="max-w-3xl mx-auto space-y-6 text-justify leading-relaxed" id="reader-text-content">
            <!-- app.js ile kitap metni buraya yüklenecek -->
          </div>
        </div>

        <!-- Okuyucu Alt İlerleme Çubuğu -->
        <footer class="p-3 bg-white border-t border-mistral-hairline flex items-center justify-between text-xs text-mistral-slate shrink-0 z-20">
          <span id="reader-stats-wordcount">0 Kelime</span>
          <div class="flex items-center gap-3">
            <span id="reader-progress-pct" class="font-mono font-bold text-emerald-400">%0 Okundu</span>
            <div class="w-32 h-1.5 rounded-full bg-white overflow-hidden">
              <div id="reader-progress-bar" class="h-full bg-emerald-500 rounded-full" style="width: 0%;"></div>
            </div>
          </div>
        </footer>

      </div>
    `;

    res.send(pageTemplate('Dijital Kütüphane & Klasik Okuyucu', content, extraHead));
  };
};
