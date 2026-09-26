module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/akor/app.js?v=20260926l" defer></script>
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
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Popüler Kültür & Müzik</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🎸</span> Akustik: Gitar Akor & Tab Stüdyosu
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Gitar akor şemaları, parmak fretboard kılavuzu, canlı transpoze (ton değiştirme) aracı ve çalım için otomatik sayfa kaydırma.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span class="font-medium" id="chord-studio-status">Akor Motoru Hazır</span>
        </div>
      </div>

      <!-- KONTROL ÇUBUĞU (Şarkı Seçimi, Transpoze & Auto-Scroll) -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <!-- Şarkı Seçici -->
          <div class="sm:col-span-5">
            <label class="block text-xs font-medium text-mistral-stone mb-1">Şarkı Repertuarı:</label>
            <select id="select-song" onchange="onSongSelect()" class="w-full px-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink font-semibold focus:outline-none focus:border-mistral-orange transition">
              <!-- JS ile doldurulur -->
            </select>
          </div>

          <!-- Transpoze Kontrolleri -->
          <div class="sm:col-span-4 flex items-center gap-2">
            <div class="flex-1">
              <label class="block text-xs font-medium text-mistral-stone mb-1">Ton (Transpoze):</label>
              <div class="flex items-center gap-1.5 p-1 rounded-lg bg-mistral-cream border border-mistral-beige-deep">
                <button onclick="transpose(-1)" class="w-8 h-8 rounded bg-white hover:bg-mistral-cream text-mistral-ink font-bold text-sm shadow-2xs transition">♭ -1</button>
                <span id="lbl-transpose-val" class="flex-1 text-center font-mono font-bold text-xs text-mistral-orange">Orijinal (0)</span>
                <button onclick="transpose(1)" class="w-8 h-8 rounded bg-white hover:bg-mistral-cream text-mistral-ink font-bold text-sm shadow-2xs transition">♯ +1</button>
              </div>
            </div>
          </div>

          <!-- Otomatik Kaydırma (Auto-Scroll) -->
          <div class="sm:col-span-3">
            <label class="block text-xs font-medium text-mistral-stone mb-1">Otomatik Kaydırma:</label>
            <button 
              type="button" 
              onclick="toggleAutoScroll()" 
              id="btn-autoscroll" 
              class="w-full py-2.5 px-3 rounded-lg text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
              <span id="scroll-icon">📜</span> <span id="scroll-text">Kaydırmayı Başlat</span>
            </button>
          </div>
        </div>

        <!-- Hızlı Akor Butonları -->
        <div class="pt-2 border-t border-mistral-hairline flex flex-wrap items-center gap-1.5 text-xs">
          <span class="text-mistral-stone font-medium mr-1">Akor Şemaları:</span>
          <div id="chord-pills" class="flex flex-wrap gap-1.5">
            <!-- JS ile doldurulur -->
          </div>
        </div>
      </div>

      <!-- ANA İÇERİK: ŞARKI SÖZLERİ & FRETBOARD ŞEMASI -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        <!-- Sol: Şarkı Akorları & Sözleri (8 Kolon) -->
        <div class="lg:col-span-8 space-y-4">
          <div class="p-8 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4 relative">
            <div class="flex items-center justify-between pb-4 border-b border-mistral-hairline">
              <div>
                <h2 class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-ink" id="song-title">Şarkı Başlığı</h2>
                <span class="text-xs font-semibold text-mistral-slate block mt-0.5" id="song-artist">Sanatçı</span>
              </div>
              <span class="px-3 py-1 rounded-full bg-mistral-cream border border-mistral-beige-deep text-xs font-bold text-mistral-ink" id="song-key">
                Ton: Am
              </span>
            </div>

            <!-- Akorlu Şarkı Metni -->
            <pre id="song-sheet" class="font-mono text-sm sm:text-base text-mistral-ink leading-loose whitespace-pre-wrap select-text p-2"></pre>
          </div>
        </div>

        <!-- Sağ: Fretboard Parmak Basış Diyagramı (4 Kolon) -->
        <div class="lg:col-span-4 space-y-6">
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4 text-center">
            <div class="flex items-center justify-between pb-3 border-b border-mistral-hairline">
              <span class="text-xs uppercase tracking-wider text-mistral-stone font-semibold">AKOR DİYAGRAMI</span>
              <strong class="text-lg font-bold font-editorial text-mistral-orange" id="active-chord-name">Do Majör (C)</strong>
            </div>

            <!-- Fretboard Görseli -->
            <div class="p-4 rounded-xl bg-mistral-cream/50 border border-mistral-beige-deep inline-block mx-auto">
              <div id="fretboard-display" class="font-mono text-xs text-mistral-ink space-y-1 text-left">
                <!-- JS ile çizilir -->
              </div>
            </div>

            <p class="text-xs text-mistral-slate leading-relaxed">
              Yukarıdaki şemada <strong>(0)</strong> açık tel, <strong>(x)</strong> vurulmayan tel, <strong>(1,2,3,4)</strong> ise basılacak perde numaralarını gösterir.
            </p>
          </div>

          <!-- Müzisyen İpuçları Kartı -->
          <div class="p-5 rounded-xl bg-mistral-cream-light border border-mistral-beige-deep text-xs text-mistral-slate space-y-2">
            <div class="font-bold text-mistral-ink flex items-center gap-1.5">
              <span>💡</span> Transpoze İpucu
            </div>
            <p class="leading-relaxed">
              Vokalinizin ses aralığı şarkının orijinal tonuna uymuyorsa, üst kısımdaki <strong>♯ +1</strong> veya <strong>♭ -1</strong> butonlarıyla tüm şarkının akorlarını anında yarımşar ses kaydırabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('Akustik: Gitar Akor & Tab Stüdyosu', content, extraHead));
  };
};
