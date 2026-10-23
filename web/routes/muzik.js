module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/muzik/app.css?v=20261023a">
      <script src="/static/apps/muzik/app.js?v=20261023a" defer></script>
    `;

    const content = `
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Popüler Kültür & Müzik</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Sözden Şarkıya & Müzik Dedektifi</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5">
            Aklınızda kalan bir dizeden şarkıyı bulun, sözlerini keşfedin ve 30 saniyelik önizlemesini dinleyin.
          </p>
        </div>

        <!-- Müzik Çalar Mini Gösterge -->
        <div id="global-player-bar" class="hidden items-center gap-3 p-2 px-4 rounded-2xl bg-white border border-mistral-hairline shadow-lg">
          <button onclick="toggleGlobalAudio()" id="btn-global-play" class="w-8 h-8 rounded-full bg-pink-500 hover:bg-pink-400 text-white flex items-center justify-center text-xs transition">
            ▶
          </button>
          <div class="text-xs max-w-[150px] truncate">
            <div id="global-track-name" class="font-bold text-mistral-ink truncate">Parça Adı</div>
            <div id="global-artist-name" class="text-[10px] text-mistral-slate truncate">Sanatçı</div>
          </div>
          <audio id="global-audio" onended="onAudioEnded()"></audio>
        </div>
      </div>

      <!-- KAYITLI ÇALMA LİSTEM (MY PLAYLIST) -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-bold text-mistral-ink flex items-center gap-2">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span> Favori Çalma Listem & Şarkılarım
            </h2>
            <p class="text-mistral-slate text-xs mt-1">
              Beğendiğiniz şarkıları tek tıkla koleksiyonunuza ekleyip dilediğiniz zaman dinleyebilir ve sözlerini açabilirsiniz.
            </p>
          </div>
          <button onclick="clearAllSavedSongs()" class="text-xs text-rose-400 hover:underline px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition">
            Listeyi Temizle
          </button>
        </div>

        <div id="saved-songs-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <!-- JS ile favoriler -->
        </div>
        <div id="saved-songs-empty" class="p-8 text-center rounded-2xl bg-white border border-mistral-hairline text-mistral-stone text-xs">
          Henüz çalma listenize bir parça eklemediniz. Şarkı kartlarındaki simgesine tıklayarak favorilerinize ekleyebilirsiniz.
        </div>
      </div>

      
      <!-- ARAMA VE ŞARKI BULUCU KARTI -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate mb-1">Müzik Dedektifi Arama Motoru</label>
          <p class="text-mistral-slate text-xs mb-3">
            Hatırladığınız herhangi bir şarkı sözünü, dizeyi veya şarkı/sanatçı adını yazın:
          </p>
          <div class="relative flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <input type="text" id="input-lyrics-search" value="is this the real life" placeholder="Örn:'mama just killed a man', 'benden öte benden ziyade', 'fly me to the moon'..." onkeyup="if(event.key==='Enter') searchMusic()" class="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-mistral-hairline focus:border-pink-400 focus:outline-none text-mistral-ink text-sm placeholder-slate-500">
              <span class="absolute left-3.5 top-3.5 text-mistral-stone text-base"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            </div>
            <button onclick="searchMusic()" class="px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-sm transition shadow-lg shadow-pink-500/20 shrink-0 flex items-center justify-center gap-2">
              <span>Şarkıyı Bul</span> &rarr;
            </button>
          </div>
        </div>

        <!-- Popüler Hızlı Örnekler -->
        <div class="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span class="text-mistral-stone">Örnek Keşifler:</span>
          <button onclick="quickSearch('is this the real life')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream text-mistral-slate transition border border-mistral-hairline">
            Queen - Bohemian Rhapsody
          </button>
          <button onclick="quickSearch('dönence dönence')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream text-mistral-slate transition border border-mistral-hairline">
            Barış Manço - Dönence
          </button>
          <button onclick="quickSearch('fly me to the moon')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream text-mistral-slate transition border border-mistral-hairline">
            Frank Sinatra - Fly Me to the Moon
          </button>
          <button onclick="quickSearch('fesupanallah')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream text-mistral-slate transition border border-mistral-hairline">
            Erkin Koray - Fesupanallah
          </button>
          <button onclick="quickSearch('i used to rule the world')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream text-mistral-slate transition border border-mistral-hairline">
            Coldplay - Viva La Vida
          </button>
        </div>
      </div>

      <!-- ARAMA SONUÇLARI BAŞLIĞI -->
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-bold text-mistral-ink flex items-center gap-2">
          <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span> Eşleşen Şarkılar
        </h2>
        <span id="results-count" class="text-xs text-mistral-slate font-mono">Aranıyor...</span>
      </div>

      <!-- SONUÇLAR GRİDİ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="music-results-grid">
        <!-- JS ile kartlar buraya eklenecek -->
      </div>

      <div id="loading-spinner" class="py-16 text-center text-mistral-slate text-sm flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin"></div>
        <span>Müzik arşivlerinde şarkı sözleri taranıyor...</span>
      </div>

      <div id="empty-state" class="hidden py-16 text-center text-mistral-slate text-sm">
        <div class="text-4xl mb-2"><svg class="w-6 h-6 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>
        <span>Bu sözlerle eşleşen bir şarkı bulunamadı. Lütfen kelimeleri kontrol edip tekrar deneyin.</span>
      </div>

      <!-- ŞARKI VE SÖZ DETAY MODALI -->
      <div id="lyrics-modal" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div class="relative w-full max-w-2xl bg-white border border-mistral-hairline rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
          
          <!-- Kapat Butonu -->
          <button onclick="closeModal()" class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white hover:bg-mistral-cream text-mistral-slate hover:text-mistral-orange flex items-center justify-center transition border border-mistral-hairline text-sm"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>

          <!-- Modal Başlık (Parça Bilgisi & Ses Çalar) -->
          <div class="p-6 bg-white border-b border-slate-750 flex flex-col sm:flex-row items-center gap-5 shrink-0">
            <div class="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg bg-white shrink-0">
              <img id="modal-cover-img" src="" class="w-full h-full object-cover" alt="Kapak">
            </div>
            
            <div class="flex-1 text-center sm:text-left min-w-0">
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span id="modal-genre-badge" class="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-bold">Müzik</span>
                <span id="modal-year-badge" class="px-2 py-0.5 rounded-full bg-mistral-cream text-mistral-slate text-[10px] font-mono"></span>
              </div>
              <h2 id="modal-song-title" class="text-xl sm:text-2xl font-black text-mistral-ink truncate"></h2>
              <p id="modal-artist-title" class="text-sm font-semibold text-pink-400 truncate mt-0.5"></p>
              <p id="modal-album-title" class="text-xs text-mistral-slate truncate mt-0.5"></p>
            </div>

            <!-- Ses Önizleme Butonu -->
            <div id="modal-preview-btn-container" class="shrink-0"></div>
          </div>

          <!-- Modal Sözler Gövdesi -->
          <div class="p-6 overflow-y-auto space-y-4 flex-1 lyrics-container bg-mistral-canvas">
            <div class="flex items-center justify-between pb-3 border-b border-mistral-hairline text-xs">
              <span class="text-mistral-slate uppercase font-semibold tracking-wider flex items-center gap-1.5">
                <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span> Şarkı Sözleri (Lyrics)
              </span>
              <div class="flex items-center gap-2">
                <button onclick="copyLyrics()" class="text-mistral-slate hover:text-pink-400 transition flex items-center gap-1">
                  <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span> Sözleri Kopyala
                </button>
                <span class="text-slate-700">•</span>
                <button onclick="toggleModalFavorite()" id="btn-modal-fav" class="text-mistral-slate hover:text-amber-400 transition flex items-center gap-1">
                  <span id="modal-fav-icon"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg></span> <span id="modal-fav-text">Listeme Ekle</span>
                </button>
              </div>
            </div>

            <!-- Sözlerin Basıldığı Alan -->
            <div id="modal-lyrics-body" class="text-sm text-mistral-slate leading-relaxed font-sans whitespace-pre-line text-center sm:text-left selection:bg-pink-500 selection:text-white"></div>
          </div>

        </div>
      </div>

      <!-- Toast Bildirimi -->
      <div id="music-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-pink-500 text-white font-semibold text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı -->
    `;

    res.send(pageTemplate('Sözden Şarkıya & Müzik Dedektifi', content, extraHead));
  };
};
