module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/seslikitap/app.js?v=20260929a" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Sanat & Edebiyat</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Sesli Kütüphane & Dünya Klasikleri Çaları</h1></div>
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
        </div>

        <audio id="audiobook-player" class="hidden"></audio>
      </div>

      <!-- TAM OYNATICI PANELİ (FULL PLAYER PANEL - Uygulama İçi Yönetim) -->
      <div id="player-panel" class="hidden p-6 rounded-2xl bg-white border border-mistral-hairline shadow-md mb-8 space-y-4">
        <!-- İlerleme Çubuğu (Seekable) -->
        <div class="space-y-1.5">
          <input type="range" id="seek-bar" min="0" max="1000" value="0" step="1" class="w-full accent-orange-600 cursor-pointer" oninput="seekTo(this.value)">
          <div class="flex items-center justify-between text-[11px] text-mistral-slate font-mono">
            <span id="time-current">0:00</span>
            <span id="track-progress-label" class="font-bold text-mistral-ink"></span>
            <span id="time-total">0:00</span>
          </div>
        </div>

        <!-- Kontrol Butonları -->
        <div class="flex flex-wrap items-center justify-center gap-2">
          <button onclick="prevTrack()" id="btn-prev-track" class="px-3 py-2 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink font-bold text-sm transition cursor-pointer" title="Önceki Bölüm">⏮</button>
          <button onclick="skipBackward()" class="px-3 py-2 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink font-bold text-xs transition cursor-pointer" title="10 saniye geri">⏪ 10s</button>
          <button onclick="toggleAudioPlay()" id="btn-panel-play" class="px-6 py-2.5 rounded-lg bg-mistral-orange hover:bg-mistral-orange-deep text-white font-bold text-sm transition shadow cursor-pointer">▶</button>
          <button onclick="skipForward()" class="px-3 py-2 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink font-bold text-xs transition cursor-pointer" title="10 saniye ileri">10s ⏩</button>
          <button onclick="nextTrack()" id="btn-next-track" class="px-3 py-2 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink font-bold text-sm transition cursor-pointer" title="Sonraki Bölüm">⏭</button>
        </div>

        <!-- Hız ve Ses Kontrolleri -->
        <div class="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-mistral-hairline">
          <div class="flex items-center gap-2">
            <span class="text-mistral-slate font-medium">Hız:</span>
            <select id="playback-rate" onchange="setPlaybackRate(this.value)" class="px-2 py-1 rounded-lg bg-white border border-mistral-hairline text-mistral-ink font-bold focus:outline-none cursor-pointer">
              <option value="0.75">0.75x</option>
              <option value="1" selected>1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>
          <div class="flex items-center gap-2 flex-1 max-w-[240px]">
            <button onclick="toggleMute()" id="btn-mute" class="text-mistral-ink hover:text-mistral-orange transition text-base cursor-pointer" title="Sessize Al">🔊</button>
            <input type="range" id="volume-bar" min="0" max="1" step="0.05" value="1" class="flex-1 accent-orange-600 cursor-pointer" oninput="setVolume(this.value)">
          </div>
          <span class="text-[10px] text-mistral-stone hidden sm:inline" id="progress-sync-note">💡 Kaldığınız yer otomatik kaydedilir</span>
        </div>

        <!-- Bölüm Listesi -->
        <div class="space-y-2 pt-2">
          <h4 class="text-sm font-bold font-editorial text-mistral-ink">Bölümler (<span id="track-count">0</span>)</h4>
          <div id="track-list" class="space-y-1.5 max-h-[300px] overflow-y-auto pr-1"></div>
        </div>
      </div>

      <!-- KİTAPLIĞIM (Dinlenen Kitaplar — Veritabanı) -->
      <div id="my-library-section" class="hidden mb-8">
        <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold font-editorial text-mistral-ink flex items-center gap-2">
              <span>📚</span> Kitaplığım
              <span id="my-library-count" class="px-2 py-0.5 rounded bg-mistral-cream border border-mistral-beige-deep text-mistral-ink font-mono text-xs font-bold">0</span>
            </h2>
          </div>
          <p class="text-xs text-mistral-slate -mt-2">Hesabınızda dinlediğiniz kitaplar — kaldığınız yerden devam edebilir veya listeden kaldırabilirsiniz.</p>
          <div id="my-library-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- JS ile çizilir -->
          </div>
        </div>
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
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
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
