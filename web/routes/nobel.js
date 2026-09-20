module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/nobel/app.js" defer></script>
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
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Uzay & Bilim</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🎖️</span> Nobel Ödülleri Arşivi & Bilim Hafızası
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Nobel Vakfı resmi API'si ile 1901'den günümüze Fizik, Kimya, Tıp, Edebiyat, Barış ve Ekonomi ödülleri, kazananlar ve çığır açan keşifleri.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="text-mistral-orange font-bold text-sm" id="nobel-count-badge">Yükleniyor...</span>
          <span class="text-mistral-slate font-medium">Ödül Kaydı</span>
        </div>
      </div>

      <!-- FİLTRE VE ARAMA PANELİ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div class="sm:col-span-8 relative">
            <input 
              type="text" 
              id="nobel-search" 
              placeholder="Kazanan kişi, kurum veya gerekçe ara (örn: Aziz Sancar, Curie, Einstein, DNA, Barış)..." 
              oninput="filterNobelPrizes()"
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔍</span>
          </div>
          <div class="sm:col-span-4">
            <select id="nobel-category-select" onchange="filterNobelPrizes()" class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange transition">
              <option value="all" selected>Tüm Kategoriler (1901 - Günümüz)</option>
              <option value="Chemistry">🧪 Kimya (Chemistry)</option>
              <option value="Physics">⚛️ Fizik (Physics)</option>
              <option value="Medicine">🧬 Fizyoloji / Tıp (Medicine)</option>
              <option value="Literature">✍️ Edebiyat (Literature)</option>
              <option value="Peace">🕊️ Barış (Peace)</option>
              <option value="Economic Sciences">📊 Ekonomi (Economic Sciences)</option>
            </select>
          </div>
        </div>

        <!-- Hızlı Filtre Butonları -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-mistral-hairline text-xs">
          <span class="text-mistral-stone font-medium mr-1">Tarihi İsimler:</span>
          <button onclick="quickNobel('Aziz Sancar')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇹🇷 Aziz Sancar (Kimya 2015)</button>
          <button onclick="quickNobel('Orhan Pamuk')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🇹🇷 Orhan Pamuk (Edebiyat 2006)</button>
          <button onclick="quickNobel('Curie')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">⚛️ Marie Curie (Fizik & Kimya)</button>
          <button onclick="quickNobel('Einstein')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">💡 Albert Einstein</button>
          <button onclick="quickNobel('')" class="px-2.5 py-1 rounded-md bg-white hover:bg-mistral-cream text-mistral-stone border border-mistral-hairline transition">Tümünü Göster</button>
        </div>
      </div>

      <!-- ÖDÜL KARTLARI IZGARASI -->
      <div id="nobel-loading" class="py-16 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">
          <span class="w-2.5 h-2.5 rounded-full bg-mistral-orange animate-ping"></span>
          <span>Nobel Vakfı resmi arşivi taranıyor...</span>
        </div>
      </div>

      <div id="nobel-grid" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <!-- JS ile çizilir -->
      </div>
    `;

    res.send(pageTemplate('Nobel Ödülleri Arşivi & Bilim Hafızası', content, extraHead));
  };
};
