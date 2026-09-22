module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/ilac/app.css?v=4.0" />
      <script src="/static/apps/ilac/app.js?v=4.0" defer></script>
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
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Sağlık</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>💊</span> İlaç & Prospektüs Rehberi
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Türkiye ve dünya farmakope veritabanı ile etken maddeler, prospektüs özeti, kontrendikasyonlar ve yan etki analitiği.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium" id="drug-source-tag">Farmakope & FDA Bağlı</span>
        </div>
      </div>

      <!-- ARAMA & HIZLI SEÇİM PANELİ -->
      <div class="p-5 sm:p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <input 
              type="text" 
              id="drug-search-input" 
              placeholder="İlaç adı veya ticari marka arayın (Örn: Calpol, Pedifen, Parol, Dolorex, Arveles, Augmentin)..." 
              onkeydown="if(event.key==='Enter') searchDrug()"
              class="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-4 text-mistral-stone text-sm"></i>
            <span id="search-loading" class="hidden absolute right-3.5 top-3.5 text-mistral-orange text-sm">
              <i class="fa-solid fa-spinner fa-spin"></i>
            </span>
          </div>
          <button 
            type="button" 
            onclick="searchDrug()" 
            class="px-6 py-3 rounded-lg bg-mistral-orange hover:bg-mistral-orange-deep text-white text-sm font-semibold transition shadow-xs cursor-pointer flex items-center justify-center gap-2 shrink-0">
            <span>Ara</span>
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>

        <!-- Hızlı Seçim Hap Butonları (Popüler Türkiye Markaları & Jenerikler) -->
        <div class="flex flex-wrap items-center gap-2 pt-1 text-xs text-mistral-slate">
          <span class="font-medium text-mistral-stone flex items-center gap-1">
            <i class="fa-solid fa-bolt text-mistral-orange text-[10px]"></i> Sık Arananlar:
          </span>
          <button type="button" onclick="selectPresetDrug('Calpol')" class="drug-pill-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream border border-stone-200 text-mistral-ink font-medium cursor-pointer">Calpol</button>
          <button type="button" onclick="selectPresetDrug('Pedifen')" class="drug-pill-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream border border-stone-200 text-mistral-ink font-medium cursor-pointer">Pedifen</button>
          <button type="button" onclick="selectPresetDrug('Parol')" class="drug-pill-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream border border-stone-200 text-mistral-ink font-medium cursor-pointer">Parol</button>
          <button type="button" onclick="selectPresetDrug('Dolorex')" class="drug-pill-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream border border-stone-200 text-mistral-ink font-medium cursor-pointer">Dolorex</button>
          <button type="button" onclick="selectPresetDrug('Arveles')" class="drug-pill-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream border border-stone-200 text-mistral-ink font-medium cursor-pointer">Arveles</button>
          <button type="button" onclick="selectPresetDrug('Apranax')" class="drug-pill-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream border border-stone-200 text-mistral-ink font-medium cursor-pointer">Apranax</button>
          <button type="button" onclick="selectPresetDrug('Augmentin')" class="drug-pill-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream border border-stone-200 text-mistral-ink font-medium cursor-pointer">Augmentin</button>
          <button type="button" onclick="selectPresetDrug('Aspirin')" class="drug-pill-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream border border-stone-200 text-mistral-ink font-medium cursor-pointer">Aspirin</button>
        </div>

        <!-- Çoklu Arama Sonuçları Listesi -->
        <div id="search-results-list" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-mistral-hairline">
        </div>

        <!-- Sonuç Bulunamadı Bilgilendirme Kutusu -->
        <div id="search-not-found" class="hidden p-6 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 text-sm space-y-3">
          <div class="flex items-center gap-2 font-bold text-amber-900 text-base">
            <i class="fa-solid fa-circle-info text-amber-600"></i>
            <span>İlaç Doğrudan Bulunamadı: <span id="not-found-query" class="font-mono text-mistral-ink font-normal"></span></span>
          </div>
          <p class="text-xs text-amber-800 leading-relaxed">
            Aradığınız ticari marka doğrudan bulunamadıysa, ilacın kutusunda yazan <strong>etken madde adını</strong> (örneğin <em>Parasetamol</em>, <em>İbuprofen</em>, <em>Amoksisilin</em>, <em>Lansoprazol</em>) aratabilir veya yukarıdaki sık aranan ilaçlardan birini seçebilirsiniz.
          </p>
        </div>
      </div>

      <!-- Çeviri Bilgilendirme Bannerı (İngilizce İçerik Geldiğinde Görünür) -->
      <div id="drug-translation-banner" class="hidden mb-6"></div>

      <!-- Yükleniyor İskeleti -->
      <div id="drug-loading-skeleton" class="hidden p-8 rounded-2xl bg-white border border-mistral-hairline shadow-sm text-center text-sm text-mistral-slate">
        <i class="fa-solid fa-spinner fa-spin text-2xl text-mistral-orange mb-2"></i>
        <div>İlaç prospektüs verileri ve yan etki analitiği hazırlanıyor...</div>
      </div>

      <!-- İLAÇ DETAYLARI VE PROSPEKTÜS KARTI -->
      <div id="drug-details-container" class="space-y-6 mb-16 transition-opacity duration-200">
        
        <!-- Üst İlaç Başlık Kartı -->
        <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-mistral-cream border border-mistral-beige-deep text-mistral-orange flex items-center justify-center text-2xl shrink-0 shadow-2xs">
              💊
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h2 id="drug-title" class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-ink tracking-tight">Calpol</h2>
                <span id="drug-route" class="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">Oral</span>
              </div>
              <div id="drug-generic" class="text-xs sm:text-sm text-mistral-slate font-medium mt-0.5">Parasetamol (Pediatrik Şurup/Süspansiyon)</div>
              <div class="text-[11px] text-mistral-stone mt-1">
                <span>Üretici / Dağıtıcı: </span>
                <span id="drug-manufacturer" class="font-medium text-mistral-slate">GSK, Atabay / Çeşitli Üreticiler</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="p-3 rounded-xl bg-mistral-cream/50 border border-mistral-hairline text-right hidden sm:block">
              <span class="text-[10px] text-mistral-stone uppercase font-bold tracking-wider block">Veri Doğrulama</span>
              <span class="text-xs font-semibold text-mistral-ink">Klinik Farmakope</span>
            </div>
          </div>
        </div>

        <!-- 1. KART: Genel Bakış & Endikasyonlar -->
        <div class="p-6 sm:p-8 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
          <div class="flex items-center gap-2.5 pb-3 border-b border-mistral-hairline">
            <span class="text-xl">📋</span>
            <h3 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink tracking-tight">Genel Bakış & Endikasyonlar</h3>
          </div>
          <div id="tab-content-purpose">Yükleniyor...</div>
        </div>

        <!-- 2. KART: Güvenlik Uyarıları & Kontrendikasyonlar -->
        <div class="p-6 sm:p-8 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
          <div class="flex items-center gap-2.5 pb-3 border-b border-mistral-hairline">
            <span class="text-xl text-rose-600">⚠️</span>
            <h3 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink tracking-tight">Güvenlik Uyarıları & Kontrendikasyonlar</h3>
          </div>
          <div id="tab-content-warnings">Yükleniyor...</div>
        </div>

        <!-- 3. KART: Bildirilen Yan Etkiler & Risk Analitiği -->
        <div class="p-6 sm:p-8 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
          <div class="flex items-center gap-2.5 pb-3 border-b border-mistral-hairline">
            <span class="text-xl text-mistral-orange">📊</span>
            <h3 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink tracking-tight">Bildirilen Yan Etkiler & Risk Dağılımı</h3>
          </div>
          <div id="tab-content-adverse">Yükleniyor...</div>
        </div>

        <!-- 4. KART: Standart Dozaj & Saklama Koşulları -->
        <div class="p-6 sm:p-8 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
          <div class="flex items-center gap-2.5 pb-3 border-b border-mistral-hairline">
            <span class="text-xl">⏱️</span>
            <h3 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink tracking-tight">Standart Kullanım, Dozaj & Saklama</h3>
          </div>
          <div id="tab-content-dosage">Yükleniyor...</div>
        </div>

      </div>
    `;

    res.send(pageTemplate('İlaç & Prospektüs Rehberi', content, extraHead));
  };
};
