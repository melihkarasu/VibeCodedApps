module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/atlas/app.js" defer></script>
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
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Coğrafya, Doğa & Çevre</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🌍</span> Küresel Coğrafya Atlası
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            REST Countries API ile dünyanın 250 bağımsız ülkesi, bayrakları, demografisi, sınır komşuları ve para birimleri.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="text-mistral-orange font-bold text-sm" id="atlas-total-count">250</span>
          <span class="text-mistral-slate font-medium">Ülke Listeleniyor</span>
        </div>
      </div>

      <!-- FİLTRE VE ARAMA KONTROLLERİ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <!-- Arama Kutusu -->
          <div class="sm:col-span-6 relative">
            <input 
              type="text" 
              id="atlas-search" 
              oninput="filterCountries()"
              placeholder="Ülke adı veya başkent ara (örn: Türkiye, Japan, Berlin)..." 
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔍</span>
          </div>

          <!-- Kıta Filtresi -->
          <div class="sm:col-span-3">
            <select id="atlas-region" onchange="filterCountries()" class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink focus:outline-none focus:border-mistral-orange transition">
              <option value="all">Tüm Kıtalar (Global)</option>
              <option value="Europe">Avrupa (Europe)</option>
              <option value="Asia">Asya (Asia)</option>
              <option value="Africa">Afrika (Africa)</option>
              <option value="Americas">Amerika (Americas)</option>
              <option value="Oceania">Okyanusya (Oceania)</option>
            </select>
          </div>

          <!-- Sıralama -->
          <div class="sm:col-span-3">
            <select id="atlas-sort" onchange="filterCountries()" class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink focus:outline-none focus:border-mistral-orange transition">
              <option value="name">İsme Göre (A-Z)</option>
              <option value="pop-desc">Nüfus (En Yüksek)</option>
              <option value="pop-asc">Nüfus (En Düşük)</option>
              <option value="area-desc">Yüzölçümü (En Büyük)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- ÜLKE KARTLARI IZGARASI -->
      <div id="countries-loading" class="py-16 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">
          <span class="w-2.5 h-2.5 rounded-full bg-mistral-orange animate-ping"></span>
          <span>Dünya veritabanı yükleniyor...</span>
        </div>
      </div>

      <div id="countries-grid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
        <!-- JS ile doldurulur -->
      </div>

      <!-- ÜLKE DETAY MODALI -->
      <div id="country-modal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div class="relative w-full max-w-xl bg-white border border-mistral-hairline rounded-2xl shadow-xl overflow-hidden p-6 space-y-5 animate-in fade-in duration-200">
          <button onclick="closeModal()" class="absolute top-4 right-4 w-8 h-8 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-slate hover:text-mistral-ink flex items-center justify-center text-sm font-bold transition">✕</button>
          
          <div class="flex items-center gap-4">
            <img id="m-flag" src="" alt="Bayrak" class="w-16 h-11 object-cover rounded-md border border-mistral-hairline shadow-2xs shrink-0">
            <div>
              <h3 class="text-2xl font-bold font-editorial text-mistral-ink" id="m-name">Ülke Adı</h3>
              <p class="text-xs text-mistral-slate font-medium" id="m-official">Resmi Adı</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
              <span class="text-mistral-slate block mb-0.5">Başkent</span>
              <strong class="text-mistral-ink text-sm font-editorial" id="m-capital">-</strong>
            </div>
            <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
              <span class="text-mistral-slate block mb-0.5">Nüfus</span>
              <strong class="text-mistral-ink text-sm font-editorial" id="m-population">-</strong>
            </div>
            <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
              <span class="text-mistral-slate block mb-0.5">Bölge & Kıta</span>
              <strong class="text-mistral-ink text-sm font-editorial" id="m-region">-</strong>
            </div>
            <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
              <span class="text-mistral-slate block mb-0.5">Yüzölçümü</span>
              <strong class="text-mistral-ink text-sm font-editorial" id="m-area">-</strong>
            </div>
          </div>

          <div class="space-y-2 text-xs border-t border-mistral-hairline pt-4">
            <div>
              <span class="text-mistral-slate">Para Birimi:</span>
              <strong class="text-mistral-ink ml-1" id="m-currency">-</strong>
            </div>
            <div>
              <span class="text-mistral-slate">Resmi Diller:</span>
              <strong class="text-mistral-ink ml-1" id="m-languages">-</strong>
            </div>
            <div>
              <span class="text-mistral-slate">Sınır Komşuları:</span>
              <span class="ml-1" id="m-borders">-</span>
            </div>
          </div>

          <div class="pt-2 flex justify-end">
            <a id="m-maps" href="#" target="_blank" rel="noopener" class="px-4 py-2 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white font-medium text-xs transition shadow-xs flex items-center gap-1.5">
              <span>🗺️</span> Google Haritalarda Gör &rarr;
            </a>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('Küresel Coğrafya Atlası', content, extraHead));
  };
};
