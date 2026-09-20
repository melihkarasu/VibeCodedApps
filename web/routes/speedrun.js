module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/speedrun/app.js" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/app" class="text-mistral-slate hover:text-mistral-orange transition text-sm flex items-center gap-1 font-medium">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Oyun</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>⚡</span> Speedrun Hall of Fame & Oyun Dünya Rekorları
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Speedrun.com açık veritabanı ile efsanevi video oyunlarının kırılması güç dünya rekoru bitirme süreleri (WR), şampiyon oyuncular ve kurallar.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span class="font-medium" id="speedrun-status">Canlı Rekorlar Açık</span>
        </div>
      </div>

      <!-- REKOR KARTLARI IZGARASI -->
      <div id="speedrun-loading" class="py-16 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">
          <span class="w-2.5 h-2.5 rounded-full bg-mistral-orange animate-ping"></span>
          <span>Speedrun.com dünya rekorları taranıyor...</span>
        </div>
      </div>

      <div id="speedrun-grid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <!-- JS ile çizilir -->
      </div>

      <!-- BİLGİ VE REKOR KONSEPTİ KARTI -->
      <div class="p-6 rounded-2xl bg-mistral-cream border border-mistral-beige-deep text-xs text-mistral-slate space-y-3 mb-16">
        <h3 class="text-sm font-bold font-editorial text-mistral-ink flex items-center gap-2">
          <span>🏆</span> Speedrun Kategorileri Ne Anlama Gelir?
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div class="p-3 rounded-xl bg-white border border-mistral-hairline">
            <strong class="text-mistral-ink block mb-0.5">Any% (Herhangi Bir Yüzde):</strong>
            <span>Oyunu baştan sona en hızlı şekilde bitirmeyi hedefler; yan görevler veya toplanabilir öğeler önemsenmez.</span>
          </div>
          <div class="p-3 rounded-xl bg-white border border-mistral-hairline">
            <strong class="text-mistral-ink block mb-0.5">100% (Tamamlama):</strong>
            <span>Oyunun tüm bölümlerini, gizli yıldızlarını, başarımlarını ve toplanabilir tüm nesnelerini eksiksiz bitirme rekorudur.</span>
          </div>
          <div class="p-3 rounded-xl bg-white border border-mistral-hairline">
            <strong class="text-mistral-ink block mb-0.5">Glitchless (Hilesiz / Doğal):</strong>
            <span>Oyun içi yazılım hatalarından (duvardan geçme, harita dışına çıkma vb.) faydalanmadan, yapımcının tasarladığı mekaniklerle koşulur.</span>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('Speedrun Hall of Fame & Oyun Dünya Rekorları', content, extraHead));
  };
};
