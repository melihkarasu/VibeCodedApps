module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/kultur/app.css">
      <script src="/static/apps/kultur/app.js" defer></script>
    `;

    const content = `
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/app" class="text-mistral-slate hover:text-white transition text-sm flex items-center gap-1">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">Mikro Uygulama #10</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight mt-1 text-mistral-ink flex items-center gap-2">
            <span>🌍</span> Kültür Arenası & Bilgi Yarışması
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5">
            Tek başına kendini sına veya arkadaşınla canlı düello yap; skorlarını, başarımlarını ve maç geçmişini takip et.
          </p>
        </div>

        <!-- Oyuncu Profil & XP Kartı -->
        <div id="player-profile-badge" class="flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-white border border-mistral-hairline shadow-lg">
          <div class="relative w-10 h-10 rounded-full overflow-hidden bg-mistral-cream border border-yellow-500/50 flex items-center justify-center shrink-0">
            <img id="player-avatar" src="" class="hidden w-full h-full object-cover">
            <span id="player-avatar-fallback" class="text-lg">👤</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span id="player-name" class="font-bold text-xs text-white">Misafir Yarışmacı</span>
              <span id="player-level-badge" class="px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 text-[10px] font-bold">Seviye 1</span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <div class="w-24 h-1.5 rounded-full bg-white overflow-hidden border border-mistral-hairline">
                <div id="player-xp-bar" class="h-full bg-white from-yellow-500 to-amber-400 rounded-full" style="width: 20%;"></div>
              </div>
              <span id="player-xp-text" class="text-[10px] text-mistral-slate font-mono">0 XP</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ANA SEKMELER (TABS) -->
      <div class="flex flex-wrap gap-2 mb-8 border-b border-mistral-hairline pb-3">
        <button onclick="switchArenaTab('solo')" id="tab-btn-solo" class="tab-arena-btn px-4 py-2 rounded-xl text-xs font-bold bg-yellow-500 text-slate-950 transition flex items-center gap-2 shadow">
          <span>🎯</span> Tek Başına Oyna
        </button>
        <button onclick="switchArenaTab('duel')" id="tab-btn-duel" class="tab-arena-btn px-4 py-2 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-2">
          <span>⚔️</span> 1v1 Düello Arenası
        </button>
        <button onclick="switchArenaTab('history')" id="tab-btn-history" class="tab-arena-btn px-4 py-2 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-2">
          <span>📜</span> Karşılaşma Geçmişi
        </button>
        <button onclick="switchArenaTab('stats')" id="tab-btn-stats" class="tab-arena-btn px-4 py-2 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-2">
          <span>📊</span> İstatistik & Başarımlar
        </button>
        <button onclick="switchArenaTab('leaderboard')" id="tab-btn-leaderboard" class="tab-arena-btn px-4 py-2 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-2">
          <span>🏆</span> Liderlik Tablosu
        </button>
      </div>

      <!-- ============================================================= -->
      <!-- SEKME 1: SOLO OYUN ARENASI                                     -->
      <!-- ============================================================= -->
      <div id="tab-content-solo" class="arena-tab-content space-y-6">
        
        <!-- Oyun Başlatma Ekranı (Lobi) -->
        <div id="solo-lobby" class="p-8 rounded-3xl bg-white border border-mistral-hairline shadow-2xl max-w-2xl mx-auto space-y-6 text-center">
          <div class="text-5xl mb-2">🏛️</div>
          <div>
            <h2 class="text-2xl font-black text-mistral-ink">Kültür Arenası: Solo Yarışma</h2>
            <p class="text-mistral-slate text-sm mt-1">Kategori ve zorluğu seç, her soru için 15 saniyede en hızlı doğru cevabı vererek rekor skora ulaş!</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate mb-1.5">Kategori Seçimi</label>
              <select id="solo-category" class="w-full px-4 py-3 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink focus:border-yellow-400 focus:outline-none">
                <option value="all">🎲 Karışık (Tüm Kategoriler)</option>
                <option value="cografya">🌍 Dünya Coğrafyası & Ülkeler</option>
                <option value="tarih">🏛️ Dünya Tarihi & Medeniyetler</option>
                <option value="bilim">🔬 Bilim, Teknoloji & Doğa</option>
                <option value="sanat">🎨 Sanat, Sinema & Kültür</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate mb-1.5">Zorluk Derecesi</label>
              <select id="solo-difficulty" class="w-full px-4 py-3 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink focus:border-yellow-400 focus:outline-none">
                <option value="easy">🟢 Kolay (Isınma Turları)</option>
                <option value="medium" selected>🟡 Orta (Dengeli Mücadele)</option>
                <option value="hard">🔴 Zor (Usta Bilgeler)</option>
              </select>
            </div>
          </div>

          <div class="pt-2">
            <button onclick="startSoloGame()" class="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-base shadow-xl shadow-yellow-500/20 transition transform hover:scale-105">
              🚀 Yarışmayı Başlat (10 Soru)
            </button>
          </div>
        </div>

        <!-- Aktif Soru Ekranı (Game Play Area) -->
        <div id="solo-gameplay" class="hidden max-w-2xl mx-auto space-y-5">
          <!-- Üst Durum Çubuğu -->
          <div class="p-4 rounded-2xl bg-white border border-mistral-hairline flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span id="game-cat-badge" class="px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 text-xs font-bold">Coğrafya</span>
              <span id="game-q-counter" class="text-xs text-mistral-slate font-mono">Soru 1/10</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <span class="text-[10px] text-mistral-slate block uppercase">Puan</span>
                <span id="game-score-display" class="font-extrabold text-sm text-yellow-400 font-mono">0</span>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-mistral-slate block uppercase">Seri</span>
                <span id="game-streak-display" class="font-extrabold text-sm text-rose-400 font-mono">🔥 0</span>
              </div>
            </div>
          </div>

          <!-- Zamanlayıcı Çubuğu -->
          <div class="w-full h-2.5 bg-white rounded-full overflow-hidden border border-mistral-hairline">
            <div id="game-timer-bar" class="h-full bg-white from-emerald-500 via-yellow-500 to-rose-500 timer-progress w-full"></div>
          </div>

          <!-- Soru Kartı -->
          <div class="p-8 rounded-3xl bg-white border border-mistral-hairline shadow-2xl space-y-6">
            <h3 id="game-question-text" class="text-xl sm:text-2xl font-bold text-mistral-ink leading-relaxed min-h-[4rem] flex items-center">
              Soru yükleniyor...
            </h3>

            <!-- 4 Seçenek Butonu -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2" id="game-options-container">
              <!-- JS ile butonlar -->
            </div>
          </div>
        </div>

        <!-- Sonuç ve Skor Ekranı -->
        <div id="solo-results" class="hidden p-8 rounded-3xl bg-white border border-mistral-hairline max-w-xl mx-auto text-center space-y-6 shadow-2xl">
          <div id="results-icon" class="text-6xl">🏆</div>
          <div>
            <h2 id="results-title" class="text-3xl font-black text-mistral-ink">Tebrikler!</h2>
            <p id="results-desc" class="text-mistral-slate text-sm mt-1">Yarışmayı başarıyla tamamladın.</p>
          </div>

          <!-- Skor Kartları -->
          <div class="grid grid-cols-3 gap-3">
            <div class="p-4 rounded-2xl bg-white border border-mistral-hairline">
              <span class="text-[10px] text-mistral-slate uppercase">Toplam Puan</span>
              <div id="res-score" class="text-2xl font-black text-yellow-400 font-mono mt-0.5">0</div>
            </div>
            <div class="p-4 rounded-2xl bg-white border border-mistral-hairline">
              <span class="text-[10px] text-mistral-slate uppercase">Doğru / Yanlış</span>
              <div id="res-correct-count" class="text-2xl font-black text-emerald-400 font-mono mt-0.5">0/10</div>
            </div>
            <div class="p-4 rounded-2xl bg-white border border-mistral-hairline">
              <span class="text-[10px] text-mistral-slate uppercase">Kazanılan XP</span>
              <div id="res-xp-earned" class="text-2xl font-black text-amber-400 font-mono mt-0.5">+0</div>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-mistral-hairline">
            <button onclick="startSoloGame()" class="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-sm transition">
              Tekrar Oyna
            </button>
            <button onclick="switchArenaTab('duel')" class="px-6 py-3 rounded-xl text-mistral-ink font-boldbg-mistral-cream-light hover:bg-mistral-cream-deeper text-mistral-ink font-bold font-bold text-sm transition">
              Arkadaşına Meydan Oku (Düello)
            </button>
          </div>
        </div>

      </div>

      <!-- ============================================================= -->
      <!-- SEKME 2: 1v1 DÜELLO ARENASI                                    -->
      <!-- ============================================================= -->
      <div id="tab-content-duel" class="arena-tab-content hidden space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          <!-- Sol: Oda Oluştur -->
          <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl space-y-4">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-3xl">⚔️</span>
              <div>
                <h3 class="text-lg font-bold text-mistral-ink">Yeni Düello Odası Kur</h3>
                <p class="text-xs text-mistral-slate">Oda kodunu arkadaşınla paylaş, aynı sorularla yarışın.</p>
              </div>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-mistral-slate mb-1">Düello Kategorisi</label>
                <select id="duel-cat-select" class="w-full px-3 py-2.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink">
                  <option value="all">🎲 Karışık Kültür Arenası</option>
                  <option value="cografya">🌍 Dünya Coğrafyası</option>
                  <option value="tarih">🏛️ Dünya Tarihi</option>
                  <option value="bilim">🔬 Bilim & Teknoloji</option>
                  <option value="sanat">🎨 Sanat & Sinema</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-mistral-slate mb-1">Zorluk Seviyesi</label>
                <select id="duel-diff-select" class="w-full px-3 py-2.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink">
                  <option value="easy">Kolay</option>
                  <option value="medium" selected>Orta</option>
                  <option value="hard">Zor</option>
                </select>
              </div>

              <button onclick="createDuelRoom()" class="w-full py-3 rounded-xl bg-white from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-xs transition shadow-lg shadow-rose-500/20">
                Oda Oluştur ve Başla &rarr;
              </button>
            </div>

            <!-- Oluşturulan Oda Bilgisi -->
            <div id="created-room-info" class="hidden p-4 rounded-2xl bg-white border border-yellow-500/30 space-y-2 text-center">
              <span class="text-xs text-mistral-slate uppercase font-semibold">Oda Kodunuz:</span>
              <div id="display-room-code" class="text-2xl font-black text-yellow-400 font-mono tracking-wider">ARENA-0000</div>
              <p class="text-[11px] text-mistral-slate">Arkadaşınız bu kodu girerek aynı sorularla yarışabilir.</p>
              <button onclick="copyRoomLink()" class="px-3 py-1.5 rounded-lg bg-white hover:bg-mistral-cream text-xs text-mistral-ink transition">
                🔗 Oda Bağlantısını Kopyala
              </button>
            </div>
          </div>

          <!-- Sağ: Odaya Katıl -->
          <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="text-3xl">🚪</span>
                <div>
                  <h3 class="text-lg font-bold text-mistral-ink">Mevcut Bir Odaya Katıl</h3>
                  <p class="text-xs text-mistral-slate">Arkadaşının gönderdiği 6 haneli oda kodunu gir.</p>
                </div>
              </div>

              <div class="space-y-3 mt-4">
                <div>
                  <label class="block text-xs font-semibold text-mistral-slate mb-1">Oda Kodu</label>
                  <input type="text" id="input-join-code" placeholder="Örn: ARENA-4921" class="w-full px-4 py-3 rounded-xl bg-white border border-mistral-hairline text-sm font-mono text-center uppercase tracking-widest text-white focus:border-yellow-400 focus:outline-none">
                </div>
              </div>
            </div>

            <button onclick="joinDuelRoom()" class="w-full py-3 rounded-xl text-mistral-ink font-boldbg-mistral-cream-light hover:bg-mistral-cream-deeper text-mistral-ink font-bold font-bold text-xs transition">
              Odaya Katıl ve Yarış &rarr;
            </button>
          </div>

        </div>

        <!-- Düello Sonuç Karşılaştırma Ekranı -->
        <div id="duel-comparison-card" class="hidden p-8 rounded-3xl bg-white border border-mistral-hairline max-w-2xl mx-auto shadow-2xl space-y-6 text-center">
          <div class="text-5xl" id="duel-verdict-icon">⚔️</div>
          <div>
            <h2 id="duel-verdict-title" class="text-2xl font-black text-mistral-ink">Düello Tamamlandı!</h2>
            <p id="duel-verdict-desc" class="text-mistral-slate text-xs mt-1">İki oyuncunun skor ve süre karşılaştırması:</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Oyuncu 1 -->
            <div id="duel-p1-box" class="p-4 rounded-2xl bg-white border border-mistral-hairline">
              <div class="w-12 h-12 rounded-full mx-auto mb-2 overflow-hidden bg-white flex items-center justify-center">
                <img id="duel-p1-avatar" src="" class="hidden w-full h-full object-cover">
                <span id="duel-p1-fallback">👤</span>
              </div>
              <h4 id="duel-p1-name" class="font-bold text-sm text-mistral-ink truncate">Oyuncu 1</h4>
              <div id="duel-p1-score" class="text-xl font-black text-yellow-400 font-mono mt-1">0 Puan</div>
            </div>

            <!-- Oyuncu 2 -->
            <div id="duel-p2-box" class="p-4 rounded-2xl bg-white border border-mistral-hairline">
              <div class="w-12 h-12 rounded-full mx-auto mb-2 overflow-hidden bg-white flex items-center justify-center">
                <img id="duel-p2-avatar" src="" class="hidden w-full h-full object-cover">
                <span id="duel-p2-fallback">👤</span>
              </div>
              <h4 id="duel-p2-name" class="font-bold text-sm text-mistral-ink truncate">Rakip Bekleniyor...</h4>
              <div id="duel-p2-score" class="text-xl font-black text-mistral-stone font-mono mt-1">-</div>
            </div>
          </div>

          <button onclick="switchArenaTab('history')" class="px-6 py-2.5 rounded-xl text-mistral-ink font-boldbg-mistral-cream-light hover:bg-mistral-cream-deeper text-mistral-ink font-bold font-semibold text-xs transition">
            Maç Geçmişine Git &rarr;
          </button>
        </div>
      </div>

      <!-- ============================================================= -->
      <!-- SEKME 3: KARŞILAŞMA GEÇMİŞİ (MATCH HISTORY)                    -->
      <!-- ============================================================= -->
      <div id="tab-content-history" class="arena-tab-content hidden space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-mistral-ink flex items-center gap-2">
              <span>📜</span> Düello & Karşılaşma Karnesi
            </h3>
            <p class="text-xs text-mistral-slate">Arkadaşlarınızla ve rakiplerinizle yaptığınız 1v1 düelloların sonuçları.</p>
          </div>
          <button onclick="clearMatchHistory()" class="text-xs text-rose-400 hover:underline">Geçmişi Temizle</button>
        </div>

        <div id="history-container" class="space-y-3">
          <!-- JS ile doldurulur -->
        </div>
        <div id="history-empty" class="p-12 text-center rounded-2xl bg-white border border-mistral-hairline text-mistral-stone text-sm">
          Henüz tamamlanmış bir düello karşılaşmanız bulunmuyor. "1v1 Düello Arenası"ndan bir oda kurup arkadaşınızı davet edebilirsiniz.
        </div>
      </div>

      <!-- ============================================================= -->
      <!-- SEKME 4: İSTATİSTİK & BAŞARIMLAR (STATS & ACHIEVEMENTS)         -->
      <!-- ============================================================= -->
      <div id="tab-content-stats" class="arena-tab-content hidden space-y-8">
        
        <!-- İstatistik Özet Kartları -->
        <div>
          <h3 class="text-base font-bold text-mistral-ink mb-3 flex items-center gap-2">
            <span>📊</span> Performans Göstergeleri
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="p-4 rounded-2xl bg-white border border-mistral-hairline text-center">
              <span class="text-[10px] text-mistral-slate uppercase font-semibold">Toplam Oyun</span>
              <div id="stat-total-games" class="text-2xl font-black text-white font-mono mt-1">0</div>
            </div>
            <div class="p-4 rounded-2xl bg-white border border-mistral-hairline text-center">
              <span class="text-[10px] text-mistral-slate uppercase font-semibold">Doğruluk Oranı</span>
              <div id="stat-accuracy" class="text-2xl font-black text-emerald-400 font-mono mt-1">%0</div>
            </div>
            <div class="p-4 rounded-2xl bg-white border border-mistral-hairline text-center">
              <span class="text-[10px] text-mistral-slate uppercase font-semibold">Düello Karnesi (G/M)</span>
              <div id="stat-win-loss" class="text-2xl font-black text-yellow-400 font-mono mt-1">0 / 0</div>
            </div>
            <div class="p-4 rounded-2xl bg-white border border-mistral-hairline text-center">
              <span class="text-[10px] text-mistral-slate uppercase font-semibold">Rekor Skor</span>
              <div id="stat-best-score" class="text-2xl font-black text-rose-400 font-mono mt-1">0</div>
            </div>
          </div>
        </div>

        <!-- Başarımlar & Rozetler (Achievements) -->
        <div>
          <h3 class="text-base font-bold text-mistral-ink mb-3 flex items-center gap-2">
            <span>🏅</span> Başarımlar & Rozetler
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="achievements-container">
            <!-- JS ile doldurulur -->
          </div>
        </div>

      </div>

      <!-- ============================================================= -->
      <!-- SEKME 5: GLOBAL LİDERLİK TABLOSU                              -->
      <!-- ============================================================= -->
      <div id="tab-content-leaderboard" class="arena-tab-content hidden space-y-6">
        <div>
          <h3 class="text-lg font-bold text-mistral-ink flex items-center gap-2">
            <span>🏆</span> Kültür Arenası Liderlik Sıralaması
          </h3>
          <p class="text-xs text-mistral-slate">En yüksek XP ve puana sahip en iyi yarışmacılar.</p>
        </div>

        <div class="overflow-x-auto rounded-2xl bg-white border border-mistral-hairline p-4">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-mistral-hairline text-mistral-slate">
                <th class="pb-3 pl-2">Sıra</th>
                <th class="pb-3">Yarışmacı</th>
                <th class="pb-3 text-center">Seviye</th>
                <th class="pb-3 text-right">Oyun</th>
                <th class="pb-3 text-right pr-2">Toplam XP</th>
              </tr>
            </thead>
            <tbody id="leaderboard-tbody" class="divide-y divide-slate-700/60">
              <!-- JS ile liderlik tablosu -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Toast Bildirimi -->
      <div id="arena-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-yellow-500 text-slate-950 font-bold text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı & Soru Havuzu -->
    `;

    res.send(pageTemplate('Kültür Arenası & Bilgi Yarışması', content, extraHead));
  };
};
