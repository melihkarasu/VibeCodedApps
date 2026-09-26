module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/renk/app.js?v=20260926s" defer></script>
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
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Geliştirici & Tasarım Araçları</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🎨</span> Harmoni: Akıllı Renk Paleti & Kontrast Stüdyosu
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            The Color API ile matematiksel renk uyumları (analog, tamamlayıcı, triad), WCAG erişilebilirlik kontrast puanı ve CSS/Tailwind dışa aktarımı.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium" id="color-mode-status">Harmoni Motoru Hazır</span>
        </div>
      </div>

      <!-- KONTROL PANELİ: RENK SEÇİCİ, MOD VE RASTGELE BUTONU -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <!-- Baz Renk Seçici -->
          <div class="sm:col-span-5 flex items-center gap-3">
            <input 
              type="color" 
              id="input-color-picker" 
              value="#fa520f" 
              onchange="onColorPickerChange(this.value)" 
              class="w-12 h-12 rounded-xl border border-mistral-hairline cursor-pointer shrink-0 p-1 bg-white">
            <div class="flex-1 relative">
              <span class="text-xs text-mistral-stone font-medium block mb-1">Baz Renk (HEX):</span>
              <input 
                type="text" 
                id="input-hex-text" 
                value="#FA520F" 
                maxlength="7"
                oninput="onHexTextChange(this.value)"
                class="w-full px-3 py-2 rounded-lg bg-white border border-mistral-hairline text-sm font-mono font-bold text-mistral-ink uppercase focus:outline-none focus:border-mistral-orange transition">
            </div>
          </div>

          <!-- Harmoni Şema Modu -->
          <div class="sm:col-span-4">
            <span class="text-xs text-mistral-stone font-medium block mb-1">Harmoni Şeması:</span>
            <select id="select-mode" onchange="generatePalette()" class="w-full px-3 py-2 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink focus:outline-none focus:border-mistral-orange transition">
              <option value="analogic" selected>Analog (Analogic - Komşu Renkler)</option>
              <option value="complement">Tamamlayıcı (Complementary - Zıt Renk)</option>
              <option value="triad">Üçlü Harmoni (Triad - 120°)</option>
              <option value="quad">Dörtlü Kare (Quad / Tetradic)</option>
              <option value="monochrome">Monokrom (Tek Renk Tonları)</option>
              <option value="analogic-complement">Analog + Tamamlayıcı</option>
            </select>
          </div>

          <!-- Rastgele / Üret Butonları -->
          <div class="sm:col-span-3 flex gap-2 pt-5 sm:pt-0">
            <button 
              type="button" 
              onclick="randomColor()" 
              title="Rastgele Renk Üret"
              class="flex-1 py-2.5 px-3 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
              <span>🎲</span> Rastgele
            </button>
            <button 
              type="button" 
              onclick="generatePalette()" 
              class="flex-1 py-2.5 px-3 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white font-medium text-xs transition shadow-xs flex items-center justify-center gap-1 cursor-pointer">
              <span>Oluştur</span> &rarr;
            </button>
          </div>
        </div>

        <!-- Hazır İlham Paletleri -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-mistral-hairline text-xs">
          <span class="text-mistral-stone font-medium mr-1">İlham Presetleri:</span>
          <button onclick="setPreset('#FA520F', 'analogic')" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🌅 Mistral Sunset</button>
          <button onclick="setPreset('#0F766E', 'triad')" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🌲 Orman Zümrütü</button>
          <button onclick="setPreset('#6366F1', 'complement')" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🌌 Gece Göğü</button>
          <button onclick="setPreset('#EC4899', 'quad')" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🍬 Neon Şeker</button>
          <button onclick="setPreset('#D97706', 'monochrome')" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🍂 Sonbahar Kehribar</button>
        </div>
      </div>

      <!-- 5'Lİ RENK PALETİ GÖRSEL BLOKLARI -->
      <div id="palette-loading" class="hidden py-16 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">
          <span class="w-2.5 h-2.5 rounded-full bg-mistral-orange animate-ping"></span>
          <span>Renk spektrumu hesaplanıyor...</span>
        </div>
      </div>

      <div id="palette-container" class="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-10">
        <!-- JS ile 5 renk kartı çizilir -->
      </div>

      <!-- WCAG ERİŞİLEBİLİRLİK & KOD DIŞA AKTARIMI -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        <!-- Sol: WCAG Kontrast Analizörü (6 Kolon) -->
        <div class="lg:col-span-6 space-y-4">
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-mistral-hairline">
              <h3 class="text-base font-bold font-editorial text-mistral-ink flex items-center gap-2">
                <span>👁️</span> WCAG Okunabilirlik Kontrast Analizi
              </h3>
              <span class="text-xs text-mistral-stone font-mono" id="lbl-contrast-hex">#FA520F</span>
            </div>

            <p class="text-xs text-mistral-slate leading-relaxed">
              Web İçeriği Erişilebilirlik Yönergeleri (WCAG 2.1) gereğince, normal metinlerde en az <strong>4.5:1</strong> (AA seviyesi), büyük başlıklarda ise en az <strong>3:1</strong> kontrast oranı bulunmalıdır.
            </p>

            <!-- Kontrast Önizleme Kartları -->
            <div class="grid grid-cols-2 gap-3 text-xs">
              <!-- Beyaz Metin ile Kontrast -->
              <div id="card-contrast-white" class="p-4 rounded-xl flex flex-col justify-between h-32 text-white shadow-xs transition">
                <span class="text-[11px] font-bold opacity-90">Beyaz Metin Üzerinde</span>
                <span class="text-base font-bold">Örnek Metin</span>
                <div class="flex items-center justify-between pt-2 border-t border-white/20 text-[10px]">
                  <span id="ratio-white">Oran: --</span>
                  <span id="badge-white" class="px-1.5 py-0.5 rounded font-bold bg-white/20">--</span>
                </div>
              </div>

              <!-- Siyah Metin ile Kontrast -->
              <div id="card-contrast-black" class="p-4 rounded-xl flex flex-col justify-between h-32 text-[#1f1f1f] shadow-xs transition">
                <span class="text-[11px] font-bold opacity-80">Koyu Mürekkep Üzerinde</span>
                <span class="text-base font-bold">Örnek Metin</span>
                <div class="flex items-center justify-between pt-2 border-t border-black/10 text-[10px]">
                  <span id="ratio-black">Oran: --</span>
                  <span id="badge-black" class="px-1.5 py-0.5 rounded font-bold bg-black/10">--</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sağ: CSS & Tailwind Dışa Aktarımı (6 Kolon) -->
        <div class="lg:col-span-6 space-y-4">
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-mistral-hairline">
              <h3 class="text-base font-bold font-editorial text-mistral-ink flex items-center gap-2">
                <span>💻</span> Kod Olarak Dışa Aktar
              </h3>
              <div class="flex gap-1.5 text-xs">
                <button onclick="setExportFormat('css')" id="btn-fmt-css" class="px-2.5 py-1 rounded-md bg-mistral-orange text-white font-semibold transition">CSS Vars</button>
                <button onclick="setExportFormat('tailwind')" id="btn-fmt-tailwind" class="px-2.5 py-1 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">Tailwind</button>
              </div>
            </div>

            <!-- Kod Bloğu -->
            <div class="relative">
              <pre id="code-output" class="p-4 rounded-xl bg-mistral-charcoal text-white text-xs font-mono overflow-x-auto leading-relaxed border border-mistral-hairline-soft h-36"></pre>
              <button 
                onclick="copyCode()" 
                id="btn-copy-code"
                class="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition backdrop-blur border border-white/20 flex items-center gap-1">
                <span>📋</span> Kopyala
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('Harmoni: Akıllı Renk Paleti & Kontrast Stüdyosu', content, extraHead));
  };
};
