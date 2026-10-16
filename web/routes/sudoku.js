module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/sudoku/app.css?v=20261017a">
      <script src="/static/apps/sudoku/app.js?v=20261017a" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Eylemler -->
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mistral-hairline pb-4">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-700 text-[11px] font-bold">Zeka & Mantık</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Sudoku Arena</h1></div>
          <p class="text-xs text-mistral-slate mt-0.5">
            Deterministik tohum motoru • Günün ortak mücadelesi & süreli liderlik tablosu
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button onclick="openLeaderboardModal()" class="px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline hover:bg-mistral-cream text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
            <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></span> Liderlik Tablosu
          </button>
          <button onclick="openStatsModal()" class="px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline hover:bg-mistral-cream text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
            <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span> İstatistikler
          </button>
          <button onclick="shareGameLink()" class="px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-orange text-xs font-bold text-mistral-orange transition flex items-center gap-1.5 shadow-sm" title="Aynı bulmaca linkini kopyala">
            <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></span> Paylaş
          </button>
        </div>
      </div>

      <!-- 1. GÖRÜNÜM: BAŞLANGIÇ MERKEZİ (LOBBY) -->
      <section id="lobby-view" class="space-y-6">
        
        <!-- Yarım Kalan Oyun Bildirimi -->
        <div id="lobby-resume-card" class="hidden p-5 rounded-3xl bg-amber-50/90 border border-amber-200 text-amber-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start sm:items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-amber-200/80 flex items-center justify-center text-xl shrink-0"><svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></div>
            <div>
              <div class="font-bold text-sm" id="lobby-resume-title">Yarım kalan bir oyununuz var!</div>
              <div class="text-xs text-amber-800/80 mt-0.5" id="lobby-resume-desc">Kaldığınız yerden süreniz ve hamlelerinizle devam edebilirsiniz.</div>
            </div>
          </div>
          <div class="flex items-center gap-2.5 shrink-0">
            <button onclick="resumeSavedGame()" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow flex items-center gap-1.5">
              <span>▶️</span> Devam Et
            </button>
            <button onclick="deleteSavedGame()" class="px-3 py-2 rounded-xl bg-white border border-amber-300 hover:bg-rose-50 text-rose-700 text-xs font-bold transition flex items-center gap-1" title="Önceki oyunu hafızadan tamamen sil">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></span> Oyunu Sil
            </button>
          </div>
        </div>

        <!-- 3 GRUP BAŞLATMA ALANI -->
        <div class="p-6 sm:p-8 rounded-3xl bg-white border border-mistral-hairline shadow-sm space-y-6">
          
          <div>
            <h2 class="text-xl font-bold font-editorial text-mistral-ink flex items-center gap-2">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg></span> Yeni Bir Sudoku Başlat
            </h2>
            <p class="text-xs text-mistral-slate mt-1">
              Zorluk seviyesi seçin, özel bir bulmaca ID'si girin veya günün ortak yarışmasına katılın.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            <!-- GRUP 1: Zorluk Seviyesi Seçimi -->
            <div class="p-5 rounded-2xl bg-[#fafaf9] border border-mistral-hairline flex flex-col justify-between space-y-4">
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-lg"><svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span>
                  <h3 class="font-bold text-sm text-mistral-ink">1. Zorluk Seviyesi</h3>
                </div>
                <p class="text-[11px] text-mistral-slate mb-3">
                  İpucu yoğunluğuna göre seviyenizi belirleyin.
                </p>
                
                <div class="grid grid-cols-2 gap-1.5">
                  <button onclick="selectLobbyDifficulty('easy')" id="lobby-diff-easy" class="px-3 py-2 rounded-xl text-xs font-bold transition bg-white border border-mistral-hairline text-mistral-ink hover:bg-mistral-cream flex items-center gap-1.5 justify-center">
                    <span class="font-mono text-blue-600">●○○○</span> <span>Kolay</span>
                  </button>
                  <button onclick="selectLobbyDifficulty('medium')" id="lobby-diff-medium" class="px-3 py-2 rounded-xl text-xs font-bold transition bg-stone-900 text-white border border-stone-900 shadow-sm flex items-center gap-1.5 justify-center">
                    <span class="font-mono text-indigo-400">●●○○</span> <span>Orta</span>
                  </button>
                  <button onclick="selectLobbyDifficulty('hard')" id="lobby-diff-hard" class="px-3 py-2 rounded-xl text-xs font-bold transition bg-white border border-mistral-hairline text-mistral-ink hover:bg-mistral-cream flex items-center gap-1.5 justify-center">
                    <span class="font-mono text-orange-500">●●●○</span> <span>Zor</span>
                  </button>
                  <button onclick="selectLobbyDifficulty('expert')" id="lobby-diff-expert" class="px-3 py-2 rounded-xl text-xs font-bold transition bg-white border border-mistral-hairline text-mistral-ink hover:bg-mistral-cream flex items-center gap-1.5 justify-center">
                    <span class="font-mono text-red-600">●●●●</span> <span>Uzman</span>
                  </button>
                </div>
              </div>

              <button onclick="startFromLobbyDifficulty()" class="w-full py-2.5 rounded-xl bg-[#fa520f] hover:bg-[#cc3a05] text-white text-xs font-bold transition shadow flex items-center justify-center gap-1.5">
                <span>▶️</span> Başlat
              </button>
            </div>

            <!-- GRUP 2: ID Girme Kutusu ve Yükle Butonu -->
            <div class="p-5 rounded-2xl bg-[#fafaf9] border border-mistral-hairline flex flex-col justify-between space-y-4">
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-lg"><svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span>
                  <h3 class="font-bold text-sm text-mistral-ink">2. Bulmaca ID Gir</h3>
                </div>
                <p class="text-[11px] text-mistral-slate mb-3">
                  Arkadaşınızın paylaştığı veya daha önce oynadığınız herhangi bir ID numarası.
                </p>
                
                <div class="space-y-2">
                  <input type="number" id="lobby-input-puzzle-id" placeholder="ID (örn: 325, 1402)" min="1" max="999999" class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-mistral-hairline text-xs font-mono font-bold text-mistral-ink focus:border-mistral-orange focus:outline-none">
                  <div class="text-[10px] text-mistral-stone">Aynı ID tüm cihazlarda aynı tahtayı açar.</div>
                </div>
              </div>

              <button onclick="loadFromLobbyId()" class="w-full py-2.5 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-hairline text-xs font-bold transition flex items-center justify-center gap-1.5">
                <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span> Yükle
              </button>
            </div>

            <!-- GRUP 3: Günün Sudokusu Butonu -->
            <div class="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between space-y-4">
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-lg"><svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
                  <h3 class="font-bold text-sm text-amber-900">3. Günün Sudokusu</h3>
                </div>
                <p class="text-[11px] text-amber-800/80 mb-3">
                  Günün tarihine özel ortak bulmaca! En kısa sürede çözerek liderlik tablosuna adınızı yazdırın.
                </p>
                <div class="p-2.5 rounded-xl bg-white/80 border border-amber-200 text-[11px] font-mono font-bold text-amber-900 flex items-center justify-between" id="lobby-daily-date-label">
                  <span>Tarih Kodu:</span>
                  <span id="lobby-daily-code">20261001</span>
                </div>
              </div>

              <button onclick="startDailyChallenge()" class="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow flex items-center justify-center gap-1.5">
                <span>⭐</span> Başlat
              </button>
            </div>

          </div>

        </div>

      </section>

      <!-- 2. GÖRÜNÜM: OYUN ALANI (Başlangıçta gizli) -->
      <section id="game-view" class="hidden space-y-6">
        
        <!-- Oyun İçi Kontrol ve Durum Başlığı -->
        <div class="p-3.5 sm:p-4 rounded-2xl bg-white border border-mistral-hairline shadow-sm flex items-center justify-between gap-3 text-xs">
          
          <div class="flex items-center gap-2.5">
            <button onclick="returnToLobby()" class="px-2.5 py-1.5 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink font-bold transition flex items-center gap-1 text-[11px]" title="Oyunu kaydedip ana menüye dön">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg></span> Menü
            </button>
            <span class="px-2.5 py-1 rounded-lg bg-mistral-cream border border-mistral-hairline font-mono font-bold text-[11px]" id="badge-puzzle-id">
              ID: #325
            </span>
            <span class="text-mistral-slate font-medium hidden sm:inline" id="badge-difficulty-name">Orta</span>
          </div>

          <div class="flex items-center gap-3">
            <!-- Kronometre & Duraklat Butonu -->
            <div class="flex items-center gap-1.5 font-mono font-bold bg-mistral-cream px-2.5 py-1 rounded-xl border border-mistral-hairline">
              <span id="timer-display" class="text-sm">00:00</span>
              <button onclick="togglePauseGame()" id="btn-pause-toggle" class="p-0.5 rounded hover:opacity-80 text-mistral-slate transition text-sm" title="Duraklat / Devam Et">
                ⏸️
              </button>
            </div>

            <!-- Hata & İpucu Sayacı -->
            <div class="flex items-center gap-2 font-mono text-[11px]">
              <span id="mistakes-counter" class="text-mistral-slate font-bold">0/3</span>
            </div>
          </div>

        </div>

        <!-- OYUN GRIDİ VE SAĞ PANEL -->
        <main class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Sol: Sudoku Tahtası & Duraklatma Katmanı -->
          <div class="lg:col-span-7 flex flex-col items-center">
            
            <!-- Eylemler: Geri Al, Sil, Not Modu, İpucu (Tahtanın Doğrudan Üstünde) -->
            <div class="grid grid-cols-4 gap-2 w-full max-w-[480px] mb-3">
              <button onclick="actionUndo()" class="py-2 px-1 sm:px-2 rounded-xl bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm" title="Son hamleyi geri al (Ctrl+Z)">
                <span>↩️</span>
                <span>Geri Al</span>
              </button>
              <button onclick="actionErase()" class="py-2 px-1 sm:px-2 rounded-xl bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm" title="Seçili hücreyi temizle (Delete)">
                <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></span>
                <span>Sil</span>
              </button>
              <button onclick="actionToggleNotes()" id="btn-note-mode" class="py-2 px-1 sm:px-2 rounded-xl bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm" title="Aday sayıları not al (N tuşu)">
                <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span>
                <span id="note-mode-label">Not</span>
              </button>
              <button onclick="actionHint()" id="btn-hint" class="py-2 px-1 sm:px-2 rounded-xl bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm" title="Doğru sayıyı aç (-150 puan)">
                <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg></span>
                <span id="hint-btn-label">İpucu (3)</span>
              </button>
            </div>

            <div class="relative w-full max-w-[480px]">
              
              <!-- Asıl Sudoku Tahtası -->
              <div id="sudoku-board" class="sudoku-board shadow-xl">
                <!-- 81 hücre JS ile üretilir -->
              </div>

              <!-- Duraklatma / Blur Katmanı (Anti-Cheat) -->
              <div id="pause-overlay" class="hidden absolute inset-0 z-20 backdrop-blur-md bg-white/85 rounded-xl flex flex-col items-center justify-center p-6 text-center shadow-lg transition-all">
                <div class="w-14 h-14 rounded-full bg-mistral-cream border border-mistral-hairline flex items-center justify-center text-2xl mb-3 shadow-inner">
                  ⏸️
                </div>
                <h3 class="text-lg font-bold font-editorial text-mistral-ink mb-1">Oyun Duraklatıldı</h3>
                <p class="text-xs text-mistral-slate max-w-xs mb-6">
                  Tahtadaki sayılar gizlendi. Devam edebilir veya oyunu kaydedip yeni oyun menüsüne dönebilirsiniz.
                </p>
                <div class="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs">
                  <button onclick="togglePauseGame()" class="w-full py-2.5 rounded-xl bg-[#fa520f] hover:bg-[#cc3a05] text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5">
                    <span>▶️</span> Devam Et
                  </button>
                  <button onclick="pauseAndOpenNewGame()" class="w-full py-2.5 rounded-xl bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm">
                    <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></span> Yeni Oyun
                  </button>
                </div>
              </div>

            </div>

          </div>

          <!-- Sağ: Numaratör ve Skor Kartı -->
          <div class="lg:col-span-5 w-full flex flex-col gap-4">

            <!-- 1-9 Dokunmatik Numaratör -->
            <div class="p-4 sm:p-5 rounded-2xl bg-white border border-mistral-hairline shadow-sm">
              <div class="text-[11px] font-bold text-mistral-slate uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Rakamlar (1 - 9)</span>
                <span class="text-[10px] font-normal text-mistral-stone">Klavye veya dokunma</span>
              </div>

              <div class="grid grid-cols-3 sm:grid-cols-9 lg:grid-cols-3 gap-2">
                <button onclick="inputNumber(1)" id="numpad-1" class="h-11 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink font-mono font-bold text-lg transition flex flex-col items-center justify-center shadow-sm">
                  <span>1</span><span class="num-key-badge" id="remain-1">9</span>
                </button>
                <button onclick="inputNumber(2)" id="numpad-2" class="h-11 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink font-mono font-bold text-lg transition flex flex-col items-center justify-center shadow-sm">
                  <span>2</span><span class="num-key-badge" id="remain-2">9</span>
                </button>
                <button onclick="inputNumber(3)" id="numpad-3" class="h-11 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink font-mono font-bold text-lg transition flex flex-col items-center justify-center shadow-sm">
                  <span>3</span><span class="num-key-badge" id="remain-3">9</span>
                </button>
                <button onclick="inputNumber(4)" id="numpad-4" class="h-11 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink font-mono font-bold text-lg transition flex flex-col items-center justify-center shadow-sm">
                  <span>4</span><span class="num-key-badge" id="remain-4">9</span>
                </button>
                <button onclick="inputNumber(5)" id="numpad-5" class="h-11 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink font-mono font-bold text-lg transition flex flex-col items-center justify-center shadow-sm">
                  <span>5</span><span class="num-key-badge" id="remain-5">9</span>
                </button>
                <button onclick="inputNumber(6)" id="numpad-6" class="h-11 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink font-mono font-bold text-lg transition flex flex-col items-center justify-center shadow-sm">
                  <span>6</span><span class="num-key-badge" id="remain-6">9</span>
                </button>
                <button onclick="inputNumber(7)" id="numpad-7" class="h-11 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink font-mono font-bold text-lg transition flex flex-col items-center justify-center shadow-sm">
                  <span>7</span><span class="num-key-badge" id="remain-7">9</span>
                </button>
                <button onclick="inputNumber(8)" id="numpad-8" class="h-11 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink font-mono font-bold text-lg transition flex flex-col items-center justify-center shadow-sm">
                  <span>8</span><span class="num-key-badge" id="remain-8">9</span>
                </button>
                <button onclick="inputNumber(9)" id="numpad-9" class="h-11 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink font-mono font-bold text-lg transition flex flex-col items-center justify-center shadow-sm">
                  <span>9</span><span class="num-key-badge" id="remain-9">9</span>
                </button>
              </div>
            </div>

            <!-- Canlı Puan & İlerleme -->
            <div class="p-4 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-xs text-mistral-slate font-medium">Hesaplanan Puan:</span>
                <span class="text-lg font-black font-mono text-mistral-orange" id="live-score-display">0 Puan</span>
              </div>
              <div class="w-full bg-mistral-cream h-2 rounded-full overflow-hidden">
                <div id="progress-bar-fill" class="bg-emerald-500 h-full transition-all duration-300" style="width: 0%"></div>
              </div>
              <div class="flex items-center justify-between text-[11px] text-mistral-slate font-mono">
                <span id="cells-filled-label">Tamamlanan: 0 / 81</span>
                <span id="best-score-label">Bu ID Rekoru: -</span>
              </div>
            </div>

          </div>

        </main>

      </section>

      <!-- MODAL: KAZANDINIZ (VICTORY MODAL) -->
      <div id="victory-modal" class="hidden fixed inset-0 z-50 backdrop-blur-md bg-black/60 flex items-center justify-center p-4">
        <div class="max-w-md w-full rounded-3xl bg-white border border-mistral-hairline shadow-2xl p-6 sm:p-8 text-center space-y-5 animate-scaleUp">
          <div class="text-5xl animate-bounce"><svg class="w-6 h-6 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
          <div>
            <h2 class="text-2xl font-black font-editorial text-mistral-ink">Tebrikler, Bulmaca Çözüldü!</h2>
            <p class="text-xs text-mistral-slate mt-1" id="victory-sub-title">Sudoku başarıyla tamamlandı.</p>
          </div>

          <!-- Skor Kartı -->
          <div class="p-4 rounded-2xl bg-mistral-cream/60 border border-mistral-hairline space-y-2 text-xs">
            <div class="flex justify-between items-center text-mistral-slate">
              <span>Bulmaca ID:</span>
              <span class="font-mono font-bold text-mistral-ink" id="v-puzzle-id">#325</span>
            </div>
            <div class="flex justify-between items-center text-mistral-slate">
              <span>Çözüm Süresi:</span>
              <span class="font-mono font-bold text-mistral-ink" id="v-time">04:12</span>
            </div>
            <div class="flex justify-between items-center text-mistral-slate">
              <span>Taban & Süre Bonusu:</span>
              <span class="font-mono font-bold text-emerald-600" id="v-bonus">+1.250 Puan</span>
            </div>
            <div class="flex justify-between items-center text-mistral-slate">
              <span>Hata & İpucu Kesintisi:</span>
              <span class="font-mono font-bold text-rose-500" id="v-penalty">-50 Puan</span>
            </div>
            <div class="pt-2 border-t border-mistral-hairline flex justify-between items-center text-sm font-bold">
              <span>Toplam Kazanılan Puan:</span>
              <span class="font-mono text-xl text-mistral-orange" id="v-final-score">1.450</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button onclick="shareGameLink()" class="w-full py-2.5 rounded-xl bg-white border border-mistral-hairline hover:bg-mistral-cream text-xs font-bold transition flex items-center justify-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></span> Skoru Paylaş
            </button>
            <button onclick="startNextGame()" class="w-full py-2.5 rounded-xl bg-[#fa520f] hover:bg-[#cc3a05] text-white text-xs font-bold transition shadow flex items-center justify-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></span> Sıradaki Bulmaca
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL: LİDERLİK TABLOSU & REKORLAR (GİZLİLİK MASKELİ) -->
      <div id="leaderboard-modal" class="hidden fixed inset-0 z-50 backdrop-blur-md bg-black/60 flex items-center justify-center p-4">
        <div class="max-w-2xl w-full rounded-3xl bg-white border border-mistral-hairline shadow-2xl p-6 flex flex-col max-h-[85vh]">
          
          <div class="flex items-center justify-between pb-4 border-b border-mistral-hairline">
            <div class="flex items-center gap-2">
              <span class="text-2xl"><svg class="w-6 h-6 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></span>
              <div>
                <h3 class="text-lg font-bold font-editorial text-mistral-ink">Sudoku Arena Liderlik Tablosu</h3>
                <p class="text-[11px] text-mistral-slate">Günün ortak meydan okuması ve genel sıralama • Gizlilik korumalı</p>
              </div>
            </div>
            <button onclick="closeLeaderboardModal()" class="w-8 h-8 rounded-full bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-slate flex items-center justify-center text-sm font-bold transition">
              
            </button>
          </div>

          <!-- Tab Filtreleri -->
          <div class="flex items-center gap-2 my-4">
            <button onclick="renderLeaderboardTab('daily')" id="lb-tab-daily" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-600 text-white transition">
              Günün Sudokusu (En Hızlı Süre)
            </button>
            <button onclick="renderLeaderboardTab('all')" id="lb-tab-all" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink transition">
              Genel Sıralama (Puan)
            </button>
          </div>

          <!-- Liste Tablosu -->
          <div class="overflow-y-auto flex-1 divide-y divide-mistral-hairline text-xs font-mono" id="leaderboard-rows-container">
            <!-- JS ile dinamik satırlar -->
          </div>

          <!-- Kullanıcının Kendi Sıralaması Vurgusu -->
          <div class="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs font-bold">
            <div class="flex items-center gap-2">
              <span>⭐</span>
              <span id="my-rank-label">Senin Durumun: Liderlik yükleniyor...</span>
            </div>
            <span class="text-amber-800 font-mono" id="my-rank-score">-</span>
          </div>

        </div>
      </div>

      <!-- MODAL: İSTATİSTİKLER -->
      <div id="stats-modal" class="hidden fixed inset-0 z-50 backdrop-blur-md bg-black/60 flex items-center justify-center p-4">
        <div class="max-w-lg w-full rounded-3xl bg-white border border-mistral-hairline shadow-2xl p-6 flex flex-col max-h-[85vh]">
          
          <div class="flex items-center justify-between pb-4 border-b border-mistral-hairline">
            <div class="flex items-center gap-2">
              <span class="text-2xl"><svg class="w-6 h-6 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span>
              <h3 class="text-lg font-bold font-editorial text-mistral-ink">Oyuncu İstatistikleri</h3>
            </div>
            <button onclick="closeStatsModal()" class="w-8 h-8 rounded-full bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-slate flex items-center justify-center text-sm font-bold transition">
              
            </button>
          </div>

          <div class="overflow-y-auto py-4 space-y-5 text-xs">
            
            <!-- Genel Toplam Kartları -->
            <div>
              <div class="text-[11px] font-bold text-mistral-slate uppercase tracking-wider mb-2.5">Genel Toplam (Ömür Boyu)</div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div class="p-3 rounded-xl bg-mistral-cream/50 border border-mistral-hairline text-center">
                  <div class="text-[10px] text-mistral-slate">Çözülen</div>
                  <div class="text-lg font-black font-mono text-mistral-ink mt-0.5" id="st-total-solved">0</div>
                </div>
                <div class="p-3 rounded-xl bg-mistral-cream/50 border border-mistral-hairline text-center">
                  <div class="text-[10px] text-mistral-slate">Toplam XP</div>
                  <div class="text-lg font-black font-mono text-mistral-orange mt-0.5" id="st-total-xp">0</div>
                </div>
                <div class="p-3 rounded-xl bg-mistral-cream/50 border border-mistral-hairline text-center">
                  <div class="text-[10px] text-mistral-slate">En İyi Skor</div>
                  <div class="text-lg font-black font-mono text-emerald-600 mt-0.5" id="st-best-score">0</div>
                </div>
                <div class="p-3 rounded-xl bg-mistral-cream/50 border border-mistral-hairline text-center">
                  <div class="text-[10px] text-mistral-slate">En Hızlı</div>
                  <div class="text-lg font-black font-mono text-mistral-ink mt-0.5" id="st-best-time">-</div>
                </div>
              </div>
            </div>

            <!-- Tekil Bulmaca Kayıtları -->
            <div>
              <div class="text-[11px] font-bold text-mistral-slate uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Çözülen Bulmaca Rekorları</span>
                <span class="text-[10px] font-normal text-mistral-stone">Aynı ID için en yüksek skor saklanır</span>
              </div>
              <div class="border border-mistral-hairline rounded-xl overflow-hidden divide-y divide-mistral-hairline max-h-48 overflow-y-auto" id="solved-puzzles-list">
                <!-- JS ile dinamik -->
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- Toast Bildirimi -->
      <div id="game-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-[#1f1f1f] text-white font-bold text-xs shadow-2xl transition z-50"></div>
    `;

    res.send(pageTemplate('Sudoku Arena — Akıl & Mantık Oyunu', content, extraHead));
  };
};
