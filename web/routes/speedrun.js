module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/speedrun/app.js?v=20261023a" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Oyun</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Speedrun Hall of Fame & Oyun Dünya Rekorları</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Speedrun.com açık veritabanı ile efsanevi video oyunlarının kırılması güç dünya rekoru bitirme süreleri (WR), şampiyon oyuncular ve kurallar.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="font-medium" id="speedrun-status">Canlı Rekorlar Açık</span>
        </div>
      </div>

      <!-- REKOR KARTLARI IZGARASI -->
      <div id="speedrun-loading" class="py-16 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">
          <span>Speedrun.com dünya rekorları taranıyor...</span>
        </div>
      </div>

      <div id="speedrun-grid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <!-- JS ile çizilir -->
      </div>

      <!-- BİLGİ VE REKOR KONSEPTİ KARTI -->
      <div class="p-6 rounded-2xl bg-mistral-cream border border-mistral-beige-deep text-xs text-mistral-slate space-y-3 mb-16">
        <h3 class="text-sm font-bold font-editorial text-mistral-ink flex items-center gap-2">
          <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></span> Speedrun Kategorileri Ne Anlama Gelir?
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
