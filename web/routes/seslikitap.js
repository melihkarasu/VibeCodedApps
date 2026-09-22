module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/seslikitap/app.js" defer></script>
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
            <span>🎧</span> Sesli Kütüphane & Dünya Klasikleri Çaları
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            LibriVox açık kamu malı arşivi ile dünya edebiyatı klasiklerinin seslendirilmiş kayıtları, bölüm listeleri ve ses çaları.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium" id="audio-books-count">Ses Arşivi Açık</span>
        </div>
      </div>

      <!-- ÇALAN SESLİ KİTAP KARTI (STICKY AUDIO DOCK) -->
      <div id="audiobook-dock" class="p-6 rounded-2xl bg-white border border-mistral-orange/40 shadow-md mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition">
        <div class="flex items-center gap-4 w-full sm:w-auto">
          <div class="w-14 h-14 rounded-xl bg-mistral-cream border border-mistral-beige-deep flex items-center justify-center text-2xl shrink-0">
            📖
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold text-mistral-orange uppercase tracking-wider block" id="dock-status">SESLİ KİTAP SEÇİN</span>
            <h3 class="text-lg font-bold font-editorial text-mistral-ink truncate" id="dock-title">Dinlemek İstediğiniz Eseri Seçin</h3>
            <p class="text-xs text-mistral-slate truncate" id="dock-author">Kamu malı dünya klasikleri</p>
          </div>
        </div>

        <!-- Oynatıcı Kontrolleri -->
        <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button 
            type="button" 
            onclick="toggleAudioPlay()" 
            id="btn-dock-play" 
            class="px-5 py-2.5 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white font-medium text-xs transition shadow-xs flex items-center gap-2 cursor-pointer">
            <span id="dock-play-icon">▶</span>
            <span id="dock-play-text">Oynat</span>
          </button>
          
          <a id="btn-dock-external" href="#" target="_blank" rel="noopener" class="hidden px-4 py-2.5 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep text-xs font-semibold transition items-center gap-1.5">
            <span>📥</span> LibriVox Sayfası &rarr;
          </a>
        </div>

        <audio id="audiobook-player" class="hidden"></audio>
      </div>

      <!-- ARAMA VE FİLTRE PANELİ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <input 
              type="text" 
              id="search-book" 
              placeholder="Eser veya yazar adı arayın (örn: Monte Cristo, Sherlock Holmes, Dracula, Pride)..." 
              onkeydown="if(event.key==='Enter') loadAudiobooks()"
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔍</span>
          </div>
          <button 
            type="button" 
            onclick="loadAudiobooks()" 
            class="px-5 py-2.5 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs font-medium transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <span>Sesli Kitap Bul</span> &rarr;
          </button>
        </div>

        <!-- Hızlı Eserler -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-mistral-hairline text-xs">
          <span class="text-mistral-stone font-medium mr-1">Örnek Başyapıtlar:</span>
          <button onclick="quickSearch('Sherlock Holmes')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🕵️‍♂️ Sherlock Holmes</button>
          <button onclick="quickSearch('Dracula')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🧛 Dracula</button>
          <button onclick="quickSearch('Monte Cristo')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">⚔️ Monte Cristo</button>
          <button onclick="quickSearch('Frankenstein')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">⚡ Frankenstein</button>
          <button onclick="quickSearch('Alice in Wonderland')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🐇 Alice in Wonderland</button>
        </div>
      </div>

      <!-- KİTAP KARTLARI IZGARASI -->
      <div id="books-loading" class="py-16 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">
          <span class="w-2.5 h-2.5 rounded-full bg-mistral-orange animate-ping"></span>
          <span>LibriVox sesli kitap arşivi taranıyor...</span>
        </div>
      </div>

      <div id="books-grid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <!-- JS ile çizilir -->
      </div>
    `;

    res.send(pageTemplate('Sesli Kütüphane & Dünya Klasikleri Çaları', content, extraHead));
  };
};
