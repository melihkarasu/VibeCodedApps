module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/gida/app.js?v=20260926i" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Popüler Kültür & Beslenme</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="8" x2="7" y2="16"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="17" y1="8" x2="17" y2="16"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Gıda Dedektifi & Kişisel Alerjen Kalkanı</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Open Food Facts ile 3M+ barkodlu gıda ürününü sorgulayın, Nutri-Score değerini görün ve kişisel alerjen profilinizle risk uyarısı alın.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span class="font-medium">Open Food Facts Veritabanı Açık</span>
        </div>
      </div>

      <!-- KULLANICI KİŞİSEL ALERJEN PROFİLİ BANT / MODAL -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-mistral-hairline">
          <div>
            <h3 class="text-base font-bold font-editorial text-mistral-ink flex items-center gap-2">
              <span>🛡️</span> Kişisel Alerji Profiliniz
            </h3>
            <p class="text-xs text-mistral-slate mt-0.5">
              Hassas olduğunuz alerjenleri seçin; sorguladığınız ürünlerde eşleşme olursa sistem kırmızı alarm verecektir.
            </p>
          </div>
          <button onclick="saveAllergens()" class="px-3.5 py-1.5 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep text-xs font-semibold transition shrink-0">
            Kaydet (Tarayıcıda Sakla)
          </button>
        </div>

        <!-- Yaygın Alerjen Seçim Kutuları -->
        <div class="flex flex-wrap gap-2 text-xs" id="allergen-pills">
          <!-- JS ile doldurulur -->
        </div>

        <div class="flex items-center gap-2 pt-1">
          <input type="text" id="custom-allergen-input" placeholder="Özel alerjen ekle (örn: çilek, susam)..." onkeydown="if(event.key==='Enter') addCustomAllergen()" class="px-3 py-1.5 rounded-lg bg-white border border-mistral-hairline text-xs text-mistral-ink focus:outline-none focus:border-mistral-orange">
          <button onclick="addCustomAllergen()" class="px-3 py-1.5 rounded-lg text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep text-xs font-medium transition">Ekle</button>
        </div>
      </div>

      <!-- ÜRÜN ARAMA & BARKOD KONTROLÜ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <input 
              type="text" 
              id="food-search-input" 
              placeholder="Ürün adı veya 8-13 haneli barkod numarası girin (örn: Nutella, 3017620422003, Ülker, Eti)..." 
              onkeydown="if(event.key==='Enter') searchFood()"
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          </div>
          <button 
            type="button" 
            onclick="searchFood()" 
            class="px-5 py-2.5 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs font-medium transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <span>Ürünü Tara</span> &rarr;
          </button>
        </div>

        <!-- Popüler Örnekler -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-mistral-hairline text-xs">
          <span class="text-mistral-stone font-medium mr-1">Örnek Ürünler:</span>
          <button onclick="quickFood('3017620422003')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🌰 Nutella (Barkod)</button>
          <button onclick="quickFood('Eti Karam')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🍫 Eti Karam</button>
          <button onclick="quickFood('Sütaş Süt')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🥛 Sütaş Süt</button>
          <button onclick="quickFood('Barilla Spaghetti')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🍝 Barilla Makarna</button>
        </div>
      </div>

      <!-- SONUÇLAR VE ALERJEN UYARI ALANI -->
      <div id="food-loading" class="hidden py-16 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">
          <span class="w-2.5 h-2.5 rounded-full bg-mistral-orange animate-ping"></span>
          <span>Open Food Facts taranıyor...</span>
        </div>
      </div>

      <div id="food-results" class="space-y-6 mb-16">
        <!-- JS ile ürün kartları çizilir -->
      </div>
    `;

    res.send(pageTemplate('Gıda Dedektifi & Kişisel Alerjen Kalkanı', content, extraHead));
  };
};
