module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/sayilar/app.js" defer></script>
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
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Uzay & Bilim</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🧮</span> Sayılar Atlası & Matematiksel Merak
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Numbers & Math motoru ile sayıların asallık, Fibonacci, bölen analizi, ikili kodları ve tarihteki gizemli gerçekleri.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium" id="num-status">Analiz Motoru Hazır</span>
        </div>
      </div>

      <!-- SORGULAMA & GİRDİ PANELİ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <input 
              type="number" 
              id="input-number" 
              value="42" 
              min="0" 
              max="10000000"
              placeholder="Pozitif bir tam sayı girin (örn: 7, 42, 73, 1729)..." 
              onkeydown="if(event.key==='Enter') analyzeNumber()"
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm font-mono font-bold text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔢</span>
          </div>
          <button 
            type="button" 
            onclick="analyzeNumber()" 
            class="px-5 py-2.5 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs font-medium transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <span>Analiz Et</span> &rarr;
          </button>
          <button 
            type="button" 
            onclick="randomFact()" 
            class="px-4 py-2.5 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer">
            <span>🎲</span> Rastgele Sayı
          </button>
        </div>

        <!-- Hızlı Örnek Sayılar -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-mistral-hairline text-xs">
          <span class="text-mistral-stone font-medium mr-1">Özel Sayılar:</span>
          <button onclick="setQuickNumber(7)" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">7 (Mistik Asal)</button>
          <button onclick="setQuickNumber(13)" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">13 (Fibonacci)</button>
          <button onclick="setQuickNumber(42)" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">42 (Nihai Cevap)</button>
          <button onclick="setQuickNumber(64)" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">64 (Satranç / 8² / 4³)</button>
          <button onclick="setQuickNumber(73)" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">73 (Sheldon Asalı)</button>
          <button onclick="setQuickNumber(365)" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">365 (Yıl Günleri)</button>
          <button onclick="setQuickNumber(1729)" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">1729 (Ramanujan Taksi)</button>
        </div>
      </div>

      <!-- ANALİZ SONUÇLARI -->
      <div id="num-results" class="space-y-6 mb-16">
        <!-- Ana İlginç Gerçek Kartı -->
        <div class="p-8 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-mistral-hairline">
            <span class="text-xs font-bold text-mistral-orange uppercase tracking-wider">SAYININ HİKAYESİ & MERAK EDİLENLER</span>
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold" id="res-badge-type">Tam Sayı</span>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-mistral-cream border border-mistral-beige-deep flex items-center justify-center text-2xl sm:text-3xl font-bold font-editorial text-mistral-ink shrink-0 shadow-2xs" id="res-big-number">
              42
            </div>
            <div class="space-y-1">
              <p class="text-base sm:text-lg text-mistral-ink leading-relaxed font-editorial font-normal" id="res-fact-text">
                Kırk iki (42), Douglas Adams'ın 'Otostopçunun Galaksi Rehberi'ne göre 'Hayatın, Evrenin ve Her Şeyin Nihai Cevabı'dır.
              </p>
            </div>
          </div>
        </div>

        <!-- Matematiksel Özellikler Matrisi (Mistral Grid) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl bg-white border border-mistral-hairline shadow-xs text-center">
            <span class="text-[11px] text-mistral-stone block font-medium">Asallık Durumu</span>
            <strong class="text-base font-editorial mt-1 block" id="res-prime">-</strong>
          </div>

          <div class="p-4 rounded-xl bg-white border border-mistral-hairline shadow-xs text-center">
            <span class="text-[11px] text-mistral-stone block font-medium">Parite</span>
            <strong class="text-base font-editorial text-mistral-ink mt-1 block" id="res-parity">-</strong>
          </div>

          <div class="p-4 rounded-xl bg-white border border-mistral-hairline shadow-xs text-center">
            <span class="text-[11px] text-mistral-stone block font-medium">Fibonacci Dizisi</span>
            <strong class="text-base font-editorial mt-1 block" id="res-fib">-</strong>
          </div>

          <div class="p-4 rounded-xl bg-white border border-mistral-hairline shadow-xs text-center">
            <span class="text-[11px] text-mistral-stone block font-medium">Karekökü (√)</span>
            <strong class="text-base font-editorial text-mistral-ink mt-1 block" id="res-sqrt">-</strong>
          </div>
        </div>

        <!-- Bilgisayar & Kod Dönüşümleri -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
            <span class="text-[10px] text-mistral-slate uppercase font-bold block mb-1">İkili Kod (Binary)</span>
            <code class="text-xs font-mono font-bold text-mistral-ink block break-all" id="res-bin">-</code>
          </div>

          <div class="p-4 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
            <span class="text-[10px] text-mistral-slate uppercase font-bold block mb-1">Onaltılık Kod (Hex)</span>
            <code class="text-xs font-mono font-bold text-mistral-ink block" id="res-hex">-</code>
          </div>

          <div class="p-4 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
            <span class="text-[10px] text-mistral-slate uppercase font-bold block mb-1">Romen Rakamı</span>
            <strong class="text-base font-editorial text-mistral-ink block" id="res-roman">-</strong>
          </div>
        </div>

        <!-- Asal Çarpanlar -->
        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <span class="text-xs font-bold text-mistral-ink block mb-1">Asal Çarpanlarına Ayrımı:</span>
          <p class="text-xs font-mono text-mistral-slate" id="res-factors">-</p>
        </div>
      </div>
    `;

    res.send(pageTemplate('Sayılar Atlası & Matematiksel Merak', content, extraHead));
  };
};
