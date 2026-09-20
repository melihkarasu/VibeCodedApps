module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <link rel="stylesheet" href="/static/apps/dso/app.css?v=2.0" />
      <script src="/static/apps/dso/app.js?v=2.0" defer></script>
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
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Sağlık</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🌐</span> Küresel Sağlık Atlası (DSÖ)
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Dünya Sağlık Örgütü (WHO) Global Health Observatory resmi OData arşiviyle yaşam süresi, çocuk sağlığı ve aşılama göstergeleri.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium">WHO Global Health Observatory Bağlı</span>
        </div>
      </div>

      <!-- KONTROL & ÜLKE SEÇİM PANELİ -->
      <div class="p-5 sm:p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          
          <!-- Birincil Ülke Seçici (6 Kolon) -->
          <div class="sm:col-span-6 space-y-1.5">
            <label class="text-xs font-bold text-mistral-stone uppercase tracking-wider block">
              İncelenecek Ülke:
            </label>
            <div class="relative">
              <select 
                id="select-country-primary" 
                onchange="onPrimaryCountryChange()" 
                class="w-full px-4 py-3 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink font-semibold focus:outline-none focus:border-mistral-orange transition">
                <option value="TUR">🇹🇷 Türkiye (TUR)</option>
              </select>
            </div>
          </div>

          <!-- Karşılaştırma Modu Butonu (3 Kolon) -->
          <div class="sm:col-span-3 pt-4 sm:pt-5">
            <button 
              type="button" 
              onclick="toggleCompareMode()" 
              id="btn-toggle-compare"
              class="w-full px-4 py-3 rounded-lg bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs">
              <i class="fa-solid fa-code-compare text-xs"></i>
              <span>Başka Bir Ülkeyle Karşılaştır</span>
            </button>
          </div>

          <!-- Yükleniyor Göstergesi (3 Kolon) -->
          <div class="sm:col-span-3 pt-4 sm:pt-5 text-right">
            <span id="dso-loading-spinner" class="hidden text-xs text-mistral-orange font-medium flex items-center justify-end gap-1.5">
              <i class="fa-solid fa-spinner fa-spin"></i>
              <span>DSÖ Verileri Çekiliyor...</span>
            </span>
          </div>

        </div>

        <!-- İkinci Ülke Seçimi (Karşılaştırma Modu Açılınca Görünür) -->
        <div id="compare-select-container" class="hidden pt-3 border-t border-mistral-hairline">
          <div class="max-w-md space-y-1.5">
            <label class="text-xs font-bold text-blue-600 uppercase tracking-wider block flex items-center gap-1.5">
              <i class="fa-solid fa-code-compare"></i> Karşılaştırılacak 2. Ülke:
            </label>
            <select 
              id="select-country-compare" 
              onchange="onCompareCountryChange()" 
              class="w-full px-4 py-2.5 rounded-lg bg-white border border-blue-200 text-sm text-mistral-ink font-semibold focus:outline-none focus:border-blue-600 transition">
              <option value="DEU">🇩🇪 Almanya (DEU)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- KATEGORİ & TEMA SEÇİCİ SEKMELER -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-6 text-xs select-none">
        <button type="button" onclick="filterThemeCategory('all')" id="theme-btn-all" class="theme-tab-btn active px-3.5 py-2 rounded-xl bg-mistral-ink text-white font-semibold transition cursor-pointer shrink-0">
          🌟 Tüm Göstergeler (10 Metrik)
        </button>
        <button type="button" onclick="filterThemeCategory('life')" id="theme-btn-life" class="theme-tab-btn px-3.5 py-2 rounded-xl bg-white hover:bg-mistral-cream text-mistral-ink font-semibold border border-mistral-hairline transition cursor-pointer shrink-0">
          🩺 Yaşam Süresi & Çocuk
        </button>
        <button type="button" onclick="filterThemeCategory('system')" id="theme-btn-system" class="theme-tab-btn px-3.5 py-2 rounded-xl bg-white hover:bg-mistral-cream text-mistral-ink font-semibold border border-mistral-hairline transition cursor-pointer shrink-0">
          🏥 Sağlık Sistemi & Doktorlar
        </button>
        <button type="button" onclick="filterThemeCategory('lifestyle')" id="theme-btn-lifestyle" class="theme-tab-btn px-3.5 py-2 rounded-xl bg-white hover:bg-mistral-cream text-mistral-ink font-semibold border border-mistral-hairline transition cursor-pointer shrink-0">
          🍔 Obezite & Alkol Tüketimi
        </button>
        <button type="button" onclick="filterThemeCategory('mental')" id="theme-btn-mental" class="theme-tab-btn px-3.5 py-2 rounded-xl bg-white hover:bg-mistral-cream text-mistral-ink font-semibold border border-mistral-hairline transition cursor-pointer shrink-0">
          🧠 Ruh Sağlığı & İntihar
        </button>
        <button type="button" onclick="filterThemeCategory('environment')" id="theme-btn-environment" class="theme-tab-btn px-3.5 py-2 rounded-xl bg-white hover:bg-mistral-cream text-mistral-ink font-semibold border border-mistral-hairline transition cursor-pointer shrink-0">
          💧 Temiz Su & Aşılama
        </button>
      </div>

      <!-- KAPSAMLI SAĞLIK GÖSTERGELERİ (10'LU METRİK KARTLARI) -->
      <div id="metrics-cards-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <!-- 1. Doğumda Beklenen Yaşam Süresi -->
        <div class="dso-metric-card p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xs space-y-2" data-category="life">
          <div class="flex items-center justify-between text-xs text-mistral-stone font-bold uppercase tracking-wider">
            <span>Beklenen Yaşam Süresi</span>
            <span class="text-base">⏳</span>
          </div>
          <div id="metric-le-value" class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-ink">--</div>
          <p id="metric-le-detail" class="text-xs text-mistral-slate line-clamp-2 leading-relaxed">Veri yükleniyor...</p>
        </div>

        <!-- 2. Sağlıklı Yaşam Süresi (HALE) -->
        <div class="dso-metric-card p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xs space-y-2" data-category="life">
          <div class="flex items-center justify-between text-xs text-mistral-stone font-bold uppercase tracking-wider">
            <span>Sağlıklı Ömür (HALE)</span>
            <span class="text-base">🌱</span>
          </div>
          <div id="metric-hale-value" class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-ink">--</div>
          <p id="metric-hale-detail" class="text-xs text-mistral-slate line-clamp-2 leading-relaxed">Veri yükleniyor...</p>
        </div>

        <!-- 3. 5 Yaş Altı Ölüm Oranı -->
        <div class="dso-metric-card p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xs space-y-2" data-category="life">
          <div class="flex items-center justify-between text-xs text-mistral-stone font-bold uppercase tracking-wider">
            <span>5 Yaş Altı Ölüm Oranı</span>
            <span class="text-base">👶</span>
          </div>
          <div id="metric-u5-value" class="text-2xl sm:text-3xl font-bold font-editorial text-rose-700">--</div>
          <p id="metric-u5-detail" class="text-xs text-mistral-slate line-clamp-2 leading-relaxed">Veri yükleniyor...</p>
        </div>

        <!-- 4. Doktor Yoğunluğu (10.000 Kişide) -->
        <div class="dso-metric-card p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xs space-y-2" data-category="system">
          <div class="flex items-center justify-between text-xs text-mistral-stone font-bold uppercase tracking-wider">
            <span>Doktor Yoğunluğu</span>
            <span class="text-base">👨‍⚕️</span>
          </div>
          <div id="metric-doc-value" class="text-2xl sm:text-3xl font-bold font-editorial text-blue-700">--</div>
          <p id="metric-doc-detail" class="text-xs text-mistral-slate line-clamp-2 leading-relaxed">Veri yükleniyor...</p>
        </div>

        <!-- 5. Obezite Prevalansı -->
        <div class="dso-metric-card p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xs space-y-2" data-category="lifestyle">
          <div class="flex items-center justify-between text-xs text-mistral-stone font-bold uppercase tracking-wider">
            <span>Yetişkin Obezite Oranı</span>
            <span class="text-base">🍔</span>
          </div>
          <div id="metric-obe-value" class="text-2xl sm:text-3xl font-bold font-editorial text-amber-700">--</div>
          <p id="metric-obe-detail" class="text-xs text-mistral-slate line-clamp-2 leading-relaxed">Veri yükleniyor...</p>
        </div>

        <!-- 6. Alkol Tüketimi (Kişi Başı Yıllık Litre) -->
        <div class="dso-metric-card p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xs space-y-2" data-category="lifestyle">
          <div class="flex items-center justify-between text-xs text-mistral-stone font-bold uppercase tracking-wider">
            <span>Kişi Başı Alkol Tüketimi</span>
            <span class="text-base">🍷</span>
          </div>
          <div id="metric-alc-value" class="text-2xl sm:text-3xl font-bold font-editorial text-purple-700">--</div>
          <p id="metric-alc-detail" class="text-xs text-mistral-slate line-clamp-2 leading-relaxed">Veri yükleniyor...</p>
        </div>

        <!-- 7. İntihar Oranı (100.000 Kişide) -->
        <div class="dso-metric-card p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xs space-y-2" data-category="mental">
          <div class="flex items-center justify-between text-xs text-mistral-stone font-bold uppercase tracking-wider">
            <span>İntihar Oranı</span>
            <span class="text-base">🧠</span>
          </div>
          <div id="metric-sui-value" class="text-2xl sm:text-3xl font-bold font-editorial text-rose-800">--</div>
          <p id="metric-sui-detail" class="text-xs text-mistral-slate line-clamp-2 leading-relaxed">Veri yükleniyor...</p>
        </div>

        <!-- 8. Kızamık Aşı Kapsamı (MCV1) -->
        <div class="dso-metric-card p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xs space-y-2" data-category="environment">
          <div class="flex items-center justify-between text-xs text-mistral-stone font-bold uppercase tracking-wider">
            <span>Kızamık Aşı Kapsamı</span>
            <span class="text-base">💉</span>
          </div>
          <div id="metric-vac-value" class="text-2xl sm:text-3xl font-bold font-editorial text-emerald-700">--</div>
          <p id="metric-vac-detail" class="text-xs text-mistral-slate line-clamp-2 leading-relaxed">Veri yükleniyor...</p>
        </div>

        <!-- 9. Temiz İçme Suyu Erişimi -->
        <div class="dso-metric-card p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xs space-y-2" data-category="environment">
          <div class="flex items-center justify-between text-xs text-mistral-stone font-bold uppercase tracking-wider">
            <span>Temiz Suya Erişim</span>
            <span class="text-base">💧</span>
          </div>
          <div id="metric-water-value" class="text-2xl sm:text-3xl font-bold font-editorial text-cyan-700">--</div>
          <p id="metric-water-detail" class="text-xs text-mistral-slate line-clamp-2 leading-relaxed">Veri yükleniyor...</p>
        </div>

        <!-- 10. Hava Kirliliği Kaynaklı Ölümler -->
        <div class="dso-metric-card p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xs space-y-2" data-category="environment">
          <div class="flex items-center justify-between text-xs text-mistral-stone font-bold uppercase tracking-wider">
            <span>Hava Kirliliği Ölümleri</span>
            <span class="text-base">💨</span>
          </div>
          <div id="metric-air-value" class="text-2xl sm:text-3xl font-bold font-editorial text-stone-700">--</div>
          <p id="metric-air-detail" class="text-xs text-mistral-slate line-clamp-2 leading-relaxed">Veri yükleniyor...</p>
        </div>

      </div>

      <!-- TARİHSEL TREND ÇİZGİ GRAFİĞİ (CHART.JS) -->
      <div class="p-6 sm:p-8 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4 mb-16">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-mistral-hairline">
          <div>
            <h3 class="text-xl font-bold font-editorial text-mistral-ink tracking-tight flex items-center gap-2">
              <span>📈</span> Tarihsel Gelişim Eğrisi (2000 &ndash; Günümüz)
            </h3>
            <p class="text-xs text-mistral-slate mt-0.5">
              DSÖ resmi kayıtlarıyla son 20+ yıldaki ulusal sağlık dönüşümü.
            </p>
          </div>

          <!-- Metrik Değiştirici Butonlar -->
          <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-stone-100 border border-stone-200 text-xs">
            <button 
              type="button" 
              onclick="switchChartMetric('lifeExpectancy')" 
              id="btn-chart-lifeExpectancy"
              class="metric-chart-btn active px-2.5 py-1.5 rounded-md font-semibold bg-mistral-ink text-white transition cursor-pointer">
              ⏳ Yaşam Süresi
            </button>
            <button 
              type="button" 
              onclick="switchChartMetric('obesity')" 
              id="btn-chart-obesity"
              class="metric-chart-btn px-2.5 py-1.5 rounded-md font-semibold bg-white text-mistral-ink hover:bg-stone-200 transition cursor-pointer">
              🍔 Obezite (%)
            </button>
            <button 
              type="button" 
              onclick="switchChartMetric('doctors')" 
              id="btn-chart-doctors"
              class="metric-chart-btn px-2.5 py-1.5 rounded-md font-semibold bg-white text-mistral-ink hover:bg-stone-200 transition cursor-pointer">
              👨‍⚕️ Doktorlar
            </button>
            <button 
              type="button" 
              onclick="switchChartMetric('suicide')" 
              id="btn-chart-suicide"
              class="metric-chart-btn px-2.5 py-1.5 rounded-md font-semibold bg-white text-mistral-ink hover:bg-stone-200 transition cursor-pointer">
              🧠 İntihar (/100k)
            </button>
            <button 
              type="button" 
              onclick="switchChartMetric('vaccine')" 
              id="btn-chart-vaccine"
              class="metric-chart-btn px-2.5 py-1.5 rounded-md font-semibold bg-white text-mistral-ink hover:bg-stone-200 transition cursor-pointer">
              💉 Aşılama (%)
            </button>
          </div>
        </div>

        <!-- Grafik Tuvali -->
        <div class="chart-container-box">
          <canvas id="dso-chart-canvas"></canvas>
        </div>

        <div class="pt-3 border-t border-mistral-hairline flex flex-wrap items-center justify-between gap-2 text-[11px] text-mistral-stone">
          <span>Kaynak: World Health Organization (WHO) Global Health Observatory OData Service</span>
          <span>Son DSÖ Doğrulama Yılı: 2021-2025</span>
        </div>

      </div>
    `;

    res.send(pageTemplate('Küresel Sağlık Atlası (DSÖ)', content, extraHead));
  };
};
