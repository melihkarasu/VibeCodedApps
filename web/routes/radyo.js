module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/radyo/app.js?v=20260926j" defer></script>
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
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Popüler Kültür & Eğlence</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>📻</span> Dünya Radyo Kulesi & Canlı Frekanslar
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Radio Browser API ile 30.000+ küresel canlı radyo yayını, ülke ve müzik türü filtreleri ve kesintisiz Web Audio çaları.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
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
            <span class="w-1 bg-mistral-orange rounded-full animate-pulse h-3"></span>
            <span class="w-1 bg-mistral-orange rounded-full animate-pulse h-6"></span>
            <span class="w-1 bg-mistral-orange rounded-full animate-pulse h-4"></span>
            <span class="w-1 bg-mistral-orange rounded-full animate-pulse h-5"></span>
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
            <span class="text-xs text-mistral-stone">🔊</span>
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
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔍</span>
          </div>

          <!-- Ülke Seçici -->
          <div class="sm:col-span-3">
            <select id="radio-country" onchange="loadStations()" class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink focus:outline-none focus:border-mistral-orange transition">
              <option value="TR" selected>🇹🇷 Türkiye</option>
              <option value="ALL">🌍 Tüm Dünya</option>
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
          <span class="w-2.5 h-2.5 rounded-full bg-mistral-orange animate-ping"></span>
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
