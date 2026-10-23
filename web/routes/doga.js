module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/doga/app.css?v=20261023a">
      <script src="/static/apps/doga/app.js?v=20261023a" defer></script>
    `;

    const content = `
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Coğrafya & Çevre</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Kuş Sesi Dedektifi & Doğa Arşivi</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5">
            iNaturalist Bioacoustics arşivi ile 500.000+ yabani kuş sesini keşfedin, spektrum dalgalarını inceleyin ve sesi tanıyın.
          </p>
        </div>

        <!-- Üst Rozet -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-slate">
          <span>iNaturalist Biyoakustik Arşivi</span>
        </div>
      </div>

      <!-- 1. MERKEZİ SES OYNATICI VE CANLI SES DALGASI (AUDIO VISUALIZER) -->
      <div class="p-6 sm:p-8 rounded-3xl bg-white border border-mistral-hairline shadow-2xl mb-8 space-y-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <div class="relative w-16 h-16 rounded-2xl overflow-hidden bg-white border border-mistral-hairline shadow-md shrink-0">
              <img id="player-bird-img" src="https://inaturalist-open-data.s3.amazonaws.com/photos/727792468/medium.jpg" class="w-full h-full object-cover">
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider" id="player-badge-type">Çalıyor</span>
                <span id="player-bird-place" class="text-xs text-mistral-slate font-mono truncate">Türkiye / Ege Havzası</span>
              </div>
              <h2 id="player-bird-name" class="text-xl sm:text-2xl font-black text-mistral-ink truncate">Bülbül (Common Nightingale)</h2>
              <p id="player-bird-sci" class="text-xs text-emerald-400 font-mono italic truncate mt-0.5">Luscinia megarhynchos</p>
            </div>
          </div>

          <!-- Oynatıcı Kontrolleri -->
          <div class="flex items-center gap-3 shrink-0">
            <button onclick="toggleAudioPlay()" id="btn-master-play" class="w-12 h-12 rounded-2xl bg-white from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black flex items-center justify-center text-lg transition shadow-lg shadow-emerald-500/20">
              ▶
            </button>
            <div class="text-xs font-mono text-mistral-slate">
              <span id="player-cur-time">00:00</span> / <span id="player-dur-time">--:--</span>
            </div>
          </div>
        </div>

        <!-- Canlı Ses Dalgası (HTML5 Canvas Visualizer) -->
        <div class="relative w-full h-24 rounded-2xl bg-mistral-canvas border border-mistral-hairline overflow-hidden flex items-center justify-center">
          <canvas id="visualizer-canvas" class="w-full h-full visualizer-canvas"></canvas>
          <div id="visualizer-idle-text" class="absolute pointer-events-none text-xs text-mistral-stone flex items-center gap-2">
            <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span> <span>Bir kuş sesi seçip oynatın</span>
          </div>
        </div>

        <audio id="audio-element" ontimeupdate="updateAudioProgress()" onended="onAudioEnded()"></audio>
      </div>

      <!-- 2. ARAMA VE TÜR FİLTRELEME PANELİ -->
      <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate mb-1.5">
            Kuş Adı veya Bilimsel Tür Arayın
          </label>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <input type="text" id="input-bird-search" placeholder="Örn: Bülbül, Baykuş, Saka Kuşu, Robin, Eagle, Alcedo atthis..." onkeyup="if(event.key==='Enter') executeBirdSearch()" class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder-slate-500 focus:border-emerald-400 focus:outline-none">
              <span class="absolute left-3.5 top-3 text-mistral-stone text-sm"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            </div>
            <button onclick="executeBirdSearch()" class="px-6 py-2.5 rounded-xl text-mistral-ink font-boldbg-mistral-cream-light hover:bg-mistral-cream-deeper text-mistral-ink font-bold font-bold text-xs transition shrink-0">
              Kuş Ara
            </button>
          </div>
        </div>

        <!-- Hızlı Popüler Türler -->
        <div class="flex flex-wrap items-center gap-1.5 text-xs pt-1">
          <span class="text-mistral-stone text-[11px] mr-1">Popüler Kuşlar:</span>
          <button onclick="quickSearchBird('Bülbül', 'Luscinia megarhynchos')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Bülbül</button>
          <button onclick="quickSearchBird('Peçeli Baykuş', 'Tyto alba')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Peçeli Baykuş</button>
          <button onclick="quickSearchBird('Saka Kuşu', 'Carduelis carduelis')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Saka Kuşu</button>
          <button onclick="quickSearchBird('Kızılgerdan', 'Erithacus rubecula')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Kızılgerdan</button>
          <button onclick="quickSearchBird('Gökdoğan', 'Falco peregrinus')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Gökdoğan</button>
          <button onclick="quickSearchBird('Orman Alaca Ağaçkakanı', 'Dendrocopos major')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Ağaçkakan</button>
          <button onclick="quickSearchBird('Flamingo', 'Phoenicopterus roseus')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Flamingo</button>
        </div>
      </div>

      <!-- 3. KUŞ SESLERİ LİSTESİ -->
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-bold text-mistral-ink flex items-center gap-2">
          <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></span> <span id="results-headline">Kuş Sesi Kayıtları</span>
        </h2>
        <span id="results-count" class="text-xs text-mistral-slate font-mono">Sesler taranıyor...</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="birds-grid">
        <!-- JS ile kartlar -->
      </div>

      <div id="loading-spinner" class="hidden py-16 text-center text-mistral-slate text-sm flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
        <span>Biyoakustik arşivinden kuş sesleri çekiliyor...</span>
      </div>

      <!-- 4. EĞLENCELİ MİNİ TEST: "KUŞ SESİNİ TANI!" -->
      <div class="mt-14 p-6 sm:p-8 rounded-3xl bg-white from-emerald-500/10   border border-emerald-500/30 shadow-2xl space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px] uppercase">Mini Oyun</span>
              <h3 class="text-base font-bold text-mistral-ink">Kuş Sesini Tanı! (Kulak Testi)</h3>
            </div>
            <p class="text-mistral-slate text-xs">Aşağıdaki sesi dinleyin ve 4 seçenek arasından hangi kuşa ait olduğunu tahmin edin:</p>
          </div>
          <button onclick="startBirdQuiz()" class="px-4 py-2 rounded-xl bg-white hover:bg-mistral-cream border border-mistral-hairline text-xs font-bold text-mistral-ink transition">
            Yeni Soru Getir
          </button>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-mistral-hairline flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button onclick="playQuizAudio()" id="btn-quiz-play" class="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-black text-sm transition shadow">
              ▶
            </button>
            <span class="text-xs font-mono text-mistral-slate">Sesi Dinle ve Tahmin Et</span>
          </div>
          <div id="quiz-feedback" class="text-xs font-bold"></div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="quiz-options-container">
          <!-- JS ile seçenek butonları -->
        </div>
      </div>

      <!-- 5. DOĞA DEFTERİM (FAVORİ SESLER) -->
      <div class="mt-14 pt-8 border-t border-mistral-hairline space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-mistral-ink flex items-center gap-2">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span> Doğa Defterim & Kayıtlı Kuş Sesleri
            </h3>
            <p class="text-mistral-slate text-xs">Beğendiğiniz kuş seslerini kaydedin, dilediğiniz an dinleyin.</p>
          </div>
          <button onclick="clearSavedNature()" class="text-xs text-rose-400 hover:underline">Defteri Temizle</button>
        </div>

        <div id="nature-shelf-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <!-- JS ile -->
        </div>
        <div id="nature-shelf-empty" class="p-8 text-center rounded-2xl bg-white border border-mistral-hairline text-mistral-stone text-xs">
          Henüz defterinize bir kuş sesi kaydetmediniz. Kartlardaki simgesine tıklayarak koleksiyonunuzu oluşturabilirsiniz.
        </div>
      </div>

      <!-- Toast Bildirimi -->
      <div id="doga-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı -->
    `;

    res.send(pageTemplate('Kuş Sesi Dedektifi & Doğa Arşivi', content, extraHead));
  };
};
