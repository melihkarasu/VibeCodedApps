module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/gida/app.js?v=20260926i" defer></script>
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
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Popüler Kültür & Sağlık</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🏷️</span> Gıda Dedektifi & Kişisel Alerjen Kalkanı
          </h1>
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
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔍</span>
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
