module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/radyo/app.js?v=20261023a" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Popüler Kültür & Radyo</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Dünya Radyo Kulesi & Canlı Frekanslar</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Radio Browser API ile 30.000+ küresel canlı radyo yayını, ülke ve müzik türü filtreleri ve kesintisiz Web Audio çaları.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="font-medium" id="radio-station-count">Frekanslar Taranıyor...</span>
        </div>
      </div>

      <!-- ÇALAN İSTASYON KARTI (STICKY PLAYER DOCK) -->
      <div id="player-dock" class="p-5 rounded-2xl bg-white border border-mistral-orange/40 shadow-md mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300">
        <div class="flex items-center gap-4 w-full sm:w-auto">
          <div class="w-14 h-14 rounded-xl bg-mistral-cream border border-mistral-beige-deep overflow-hidden flex items-center justify-center shrink-0 p-1">
            <img id="player-logo" src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80" alt="Logo" class="w-full h-full object-contain rounded-lg">
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-bold text-mistral-orange uppercase tracking-wider block" id="player-status">YAYIN BEKLENİYOR</span>
            <h3 class="text-lg font-bold font-editorial text-mistral-ink truncate" id="player-title">Bir Radyo İstasyonu Seçin</h3>
            <p class="text-xs text-mistral-slate truncate" id="player-country">Canlı müzik ve haber akışları</p>
          </div>
        </div>

        <!-- Kontroller & Canlı Dalga Animasyonu -->
        <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <!-- Ses Dalgası Equalizer Çubukları -->
          <div id="equalizer-bars" class="hidden items-center gap-1 h-6 px-2">
            </div>

          <!-- Oynat / Durdur Butonu -->
          <button 
            type="button" 
            onclick="togglePlayPause()" 
            id="btn-play-pause" 
            class="w-12 h-12 rounded-full bg-mistral-orange hover:bg-mistral-orange-deep text-white flex items-center justify-center text-xl transition shadow-xs cursor-pointer shrink-0">
            <span id="play-icon">▶</span>
          </button>

          <!-- Ses Seviyesi Kaydırıcısı -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-mistral-stone"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></span>
            <input 
              type="range" 
              id="volume-slider" 
              min="0" 
              max="1" 
              step="0.05" 
              value="0.8" 
              oninput="changeVolume(this.value)" 
              class="w-20 accent-mistral-orange cursor-pointer">
          </div>
        </div>

        <audio id="audio-stream" class="hidden" preload="none"></audio>
      </div>

      <!-- FİLTRE VE ARAMA KONTROLLERİ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <!-- Arama Kutusu -->
          <div class="sm:col-span-6 relative">
            <input 
              type="text" 
              id="radio-search" 
              placeholder="Radyo istasyonu veya frekans adı ara (örn: Kral, BBC, Virgin, Jazz)..." 
              onkeydown="if(event.key==='Enter') loadStations()"
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          </div>

          <!-- Ülke Seçici -->
          <div class="sm:col-span-3">
            <select id="radio-country" onchange="loadStations()" class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink focus:outline-none focus:border-mistral-orange transition">
              <option value="TR" selected>🇹🇷 Türkiye</option>
              <option value="ALL">Tüm Dünya</option>
              <option value="GB">🇬🇧 Birleşik Krallık</option>
              <option value="US">🇺🇸 Amerika Birleşik Devletleri</option>
              <option value="DE">🇩🇪 Almanya</option>
              <option value="FR">🇫🇷 Fransa</option>
              <option value="IT">🇮🇹 İtalya</option>
              <option value="ES">🇪🇸 İspanya</option>
              <option value="NL">🇳🇱 Hollanda</option>
              <option value="BR">🇧🇷 Brezilya</option>
              <option value="JP">🇯🇵 Japonya</option>
            </select>
          </div>

          <!-- Tür Seçici -->
          <div class="sm:col-span-3">
            <select id="radio-tag" onchange="loadStations()" class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink focus:outline-none focus:border-mistral-orange transition">
              <option value="all" selected>Tüm Müzik Türleri</option>
              <option value="pop">Pop</option>
              <option value="jazz">Caz (Jazz)</option>
              <option value="rock">Rock</option>
              <option value="classical">Klasik Müzik</option>
              <option value="news">Haber & Konuşma</option>
              <option value="electronic">Elektronik / Dans</option>
              <option value="chillout">Chillout & Lounge</option>
              <option value="oldies">Nostalji / 80s 90s</option>
              <option value="blues">Blues</option>
            </select>
          </div>
        </div>
      </div>

      <!-- RADYO İSTASYONLARI IZGARASI -->
      <div id="radio-loading" class="py-16 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">
          <span>Canlı radyo frekansları taranıyor...</span>
        </div>
      </div>

      <div id="stations-grid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16">
        <!-- JS ile dinamik çizilir -->
      </div>
    `;

    res.send(pageTemplate('Dünya Radyo Kulesi & Canlı Frekanslar', content, extraHead));
  };
};
