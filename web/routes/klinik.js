module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/klinik/app.css?v=2.0" />
      <script src="/static/apps/klinik/app.js?v=2.0" defer></script>
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
            <span>🔬</span> Klinik Araştırmalar Radarı
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            U.S. National Institutes of Health (NIH) ClinicalTrials.gov v2 açık kütüğü ile aktif klinik deneyler, faz aşamaları ve deneysel tedaviler.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium">NIH ClinicalTrials v2 Bağlı</span>
        </div>
      </div>

      <!-- ARAMA & KAPSAMLI FİLTRE PANELİ -->
      <div class="p-5 sm:p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        
        <!-- Arama Çubuğu & Türkiye Filtresi -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <input 
              type="text" 
              id="study-search-input" 
              placeholder="Hastalık, tedavi veya molekül arayın (Örn: Kanser, Diyabet, Alzheimer, mRNA, İmmünoterapi)..." 
              value="kanser"
              onkeydown="if(event.key==='Enter') searchStudies()"
              class="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-4 text-mistral-stone text-sm"></i>
            <span id="search-loading" class="hidden absolute right-3.5 top-3.5 text-mistral-orange text-sm">
              <i class="fa-solid fa-spinner fa-spin"></i>
            </span>
          </div>

          <!-- Türkiye Konum Filtresi -->
          <button 
            type="button" 
            onclick="toggleTurkeyOnly()" 
            id="btn-toggle-turkey"
            class="px-4 py-3 rounded-lg bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 shrink-0">
            <span>🌍 Küresel / Tüm Ülkeler</span>
          </button>

          <!-- Ara Butonu -->
          <button 
            type="button" 
            onclick="searchStudies()" 
            class="px-6 py-3 rounded-lg bg-mistral-orange hover:bg-mistral-orange-deep text-white text-sm font-semibold transition shadow-xs cursor-pointer flex items-center justify-center gap-2 shrink-0">
            <span>Araştırmaları Bul</span>
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>

        <!-- Hızlı Konu & Hastalık Çipleri -->
        <div class="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-mistral-slate">
          <span class="font-medium text-mistral-stone mr-1 flex items-center gap-1">
            <i class="fa-solid fa-bolt text-mistral-orange text-[10px]"></i> Popüler Alanlar:
          </span>
          <button type="button" onclick="selectPresetCondition('kanser')" id="cond-kanser" class="preset-cond-btn active px-2.5 py-1 rounded-md bg-stone-900 text-white font-medium cursor-pointer">🎗️ Kanser / Onkoloji</button>
          <button type="button" onclick="selectPresetCondition('diyabet')" id="cond-diyabet" class="preset-cond-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium cursor-pointer">🩸 Diyabet</button>
          <button type="button" onclick="selectPresetCondition('alzheimer')" id="cond-alzheimer" class="preset-cond-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium cursor-pointer">🧠 Alzheimer & Nöroloji</button>
          <button type="button" onclick="selectPresetCondition('kalp')" id="cond-kalp" class="preset-cond-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium cursor-pointer">❤️ Kardiyovasküler</button>
          <button type="button" onclick="selectPresetCondition('mrna')" id="cond-mrna" class="preset-cond-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium cursor-pointer">🧬 mRNA & Gen Terapisi</button>
          <button type="button" onclick="selectPresetCondition('astım')" id="cond-astım" class="preset-cond-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium cursor-pointer">🫁 Astım & Solunum</button>
        </div>

        <!-- Faz Aşama Filtreleri -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-mistral-hairline text-xs">
          <span class="text-mistral-stone font-medium mr-1">Klinik Faz:</span>
          <button type="button" onclick="filterByPhase('ALL')" id="phase-ALL" class="phase-filter-btn active px-3 py-1 rounded-md border border-mistral-orange font-bold text-mistral-orange cursor-pointer">Tüm Fazlar</button>
          <button type="button" onclick="filterByPhase('PHASE1')" id="phase-PHASE1" class="phase-filter-btn px-3 py-1 rounded-md border border-mistral-hairline text-mistral-slate hover:bg-stone-50 cursor-pointer">Faz I (İlk Güvenlik)</button>
          <button type="button" onclick="filterByPhase('PHASE2')" id="phase-PHASE2" class="phase-filter-btn px-3 py-1 rounded-md border border-mistral-hairline text-mistral-slate hover:bg-stone-50 cursor-pointer">Faz II (Etkinlik)</button>
          <button type="button" onclick="filterByPhase('PHASE3')" id="phase-PHASE3" class="phase-filter-btn px-3 py-1 rounded-md border border-mistral-hairline text-mistral-slate hover:bg-stone-50 cursor-pointer">Faz III (Geniş Çaplı)</button>
          <button type="button" onclick="filterByPhase('PHASE4')" id="phase-PHASE4" class="phase-filter-btn px-3 py-1 rounded-md border border-mistral-hairline text-mistral-slate hover:bg-stone-50 cursor-pointer">Faz IV (Pazarlama Sonrası)</button>
        </div>

      </div>

      <!-- ⭐ TAKİP ETTİĞİM KLİNİK ARAŞTIRMALAR (CANLI DURUM TAKİP PANELİ) -->
      <div id="followed-studies-section" class="mb-12 p-6 rounded-2xl bg-white border-2 border-amber-300 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-mistral-hairline">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center text-xl shrink-0">
              ⭐
            </span>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold font-editorial text-mistral-ink tracking-tight">Takip Ettiğim Klinik Araştırmalar</h2>
                <span id="followed-count-badge" class="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold font-mono">0 Çalışma</span>
              </div>
              <p class="text-xs text-mistral-slate mt-0.5">
                İlgi duyduğunuz çalışmaları yıldızlayarak kaydedin; resmi NIH kütüğü üzerinden canlı durum değişikliklerini (Hasta Alımı, Tamamlanma vb.) takip edin.
              </p>
            </div>
          </div>

          <!-- Canlı Güncelleme & Eylemler -->
          <div class="flex flex-wrap items-center gap-2">
            <button 
              type="button" 
              onclick="refreshFollowedStudiesLive()" 
              id="btn-refresh-followed"
              title="ClinicalTrials.gov üzerinden en güncel durumları sorgula"
              class="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs">
              <i class="fa-solid fa-arrows-rotate text-xs" id="refresh-spinner-icon"></i>
              <span>Canlı Durumları Güncelle</span>
            </button>
            <button 
              type="button" 
              onclick="exportFollowedStudies()" 
              title="Takip Listesini Kopyala"
              class="px-3 py-2 rounded-lg bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs">
              <i class="fa-brands fa-markdown text-mistral-stone"></i>
              <span>Listeyi Kopyala</span>
            </button>
            <button 
              type="button" 
              onclick="clearFollowedStudies()" 
              title="Tüm Takibi Temizle"
              class="px-2.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition cursor-pointer">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>

        <!-- Takip Listesi Kutusu -->
        <div id="followed-items-container">
          <div class="p-8 text-center rounded-xl bg-amber-50/40 border border-dashed border-amber-200 text-xs text-mistral-stone">
            Henüz takip ettiğiniz bir klinik çalışma yok. Aşağıdaki katalogda yer alan araştırmaların üzerindeki <strong>"☆ Takip Et"</strong> butonuna tıklayarak çalışmaları buraya sabitleyebilir, canlı faz ve kabul durumlarını izleyebilirsiniz.
          </div>
        </div>
      </div>

      <!-- ÇALIŞMA LİSTESİ BAŞLIĞI -->
      <div class="flex items-center justify-between pb-3 mb-6 border-b border-mistral-hairline">
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-bold font-editorial text-mistral-ink tracking-tight">Klinik Deneyler Kataloğu</h2>
          <span id="study-count-label" class="text-xs px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep font-semibold">Yükleniyor...</span>
        </div>
      </div>

      <!-- ÇALIŞMA KARTLARI IZGARASI -->
      <div id="studies-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <div class="col-span-full p-12 text-center text-sm text-mistral-stone">
          <i class="fa-solid fa-spinner fa-spin text-xl text-mistral-orange mb-2 block"></i>
          Klinik araştırmalar yükleniyor...
        </div>
      </div>

      <!-- DETAY MODAL DİYALOĞU -->
      <div id="study-modal" class="custom-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-mistral-hairline transition-all transform duration-200">
          <div id="modal-study-content">
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('Klinik Araştırmalar Radarı', content, extraHead));
  };
};
