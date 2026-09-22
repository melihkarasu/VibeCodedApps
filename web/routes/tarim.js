module.exports = function(pageTemplate) {
  return function(req, res) {
        const extraHead = `
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <link rel="stylesheet" href="/static/apps/tarim/app.css">
      <script src="/static/apps/tarim/app.js" defer></script>
    `;

    const content = `
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-white transition text-sm flex items-center gap-1">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-semibold">Mikro Uygulama #1</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight mt-1 text-mistral-ink flex items-center gap-2">
            <span>🌾</span> Akıllı Tarım & Zirai Hava Paneli
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5">
            Türkiye genelinde 100+ tarım havzası ve il/ilçe arama motoru ile toprak nemi, don uyarısı ve sulama tavsiyeleri.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-slate">
          <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span>Open-Meteo Zirai Model (FAO-56)</span>
        </div>
      </div>

      <!-- 1. DİNAMİK HAVZA / İL / İLÇE ARAMA VE SEÇİM PANELİ -->
      <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-5">
        
        <!-- Arama Çubuğu ve Ekin Seçimi -->
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          
          <!-- Canlı Arama Çubuğu (Autocomplete Search Input) -->
          <div class="sm:col-span-6 relative">
            <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate mb-1.5 flex items-center justify-between">
              <span>Tarım Havzası, İl veya İlçe Ara</span>
              <span class="text-[10px] text-teal-400 lowercase font-normal">tüm türkiye & serbest arama</span>
            </label>
            <div class="relative">
              <input type="text" id="input-region-search" placeholder="Örn: Polatlı, Söke, Ceyhan, Kumluca, Bafra, Akhisar, İpsala..." oninput="handleSearchInput(event)" onfocus="handleSearchFocus()" onkeydown="handleSearchKeydown(event)" autocomplete="off" class="w-full pl-10 pr-8 py-3 rounded-xl bg-white border border-mistral-hairline text-sm font-semibold text-mistral-ink placeholder-slate-500 focus:border-teal-400 focus:outline-none">
              <span class="absolute left-3.5 top-3.5 text-mistral-stone text-base">🔍</span>
              <button onclick="clearSearchInput()" id="btn-clear-search" class="hidden absolute right-3 top-3 text-mistral-stone hover:text-mistral-slate text-sm">✕</button>
            </div>

            <!-- Otomatik Tamamlama Açılır Kutusu (Autocomplete Dropdown) -->
            <div id="search-dropdown" class="hidden absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-mistral-hairline rounded-2xl shadow-2xl search-results-dropdown p-2 space-y-1">
              <!-- JS ile doldurulur -->
            </div>
          </div>

          <!-- Ekin / Ürün Türü Seçici -->
          <div class="sm:col-span-3">
            <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate mb-1.5">Ekin / Ürün Türü</label>
            <select id="select-crop" onchange="updateCropRecommendations()" class="w-full px-3 py-3 rounded-xl bg-white border border-mistral-hairline text-sm font-semibold text-mistral-ink focus:border-teal-400 focus:outline-none">
              <option value="wheat">🌾 Buğday / Arpa (Tahıllar)</option>
              <option value="corn">🌽 Mısır</option>
              <option value="cotton">☁️ Pamuk</option>
              <option value="tomato">🍅 Domates / Biber (Sebze)</option>
              <option value="sunflower">🌻 Ayçiçeği</option>
              <option value="olive">🫒 Zeytin</option>
              <option value="citrus">🍊 Narenciye</option>
            </select>
          </div>

          <!-- Konumumu Al Butonu -->
          <div class="sm:col-span-3">
            <button onclick="getGPSLocation()" id="btn-gps" class="w-full py-3 rounded-xl text-mistral-ink font-boldbg-mistral-cream-light hover:bg-mistral-cream-deeper text-mistral-ink font-bold font-bold text-xs transition flex items-center justify-center gap-1.5 shadow">
              <span>📍</span> Tarlamın Konumunu Al
            </button>
          </div>
        </div>

        <!-- Hızlı Tarım Havzası Filtreleri (Kategoriler) -->
        <div class="space-y-2 pt-1">
          <div class="flex items-center justify-between text-xs text-mistral-slate">
            <span class="font-semibold text-mistral-slate">Öne Çıkan Başlıca Tarım Havzaları:</span>
            <span class="text-[11px] text-mistral-stone">tıklayarak doğrudan seçin</span>
          </div>
          <div class="flex flex-wrap gap-1.5 text-xs">
            <button onclick="selectQuickRegion(37.87, 32.49, 'Konya Ovası', 'Tahıl & Bakliyat Havzası')" class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink hover:border-teal-400 transition flex items-center gap-1">
              🌾 Konya Ovası
            </button>
            <button onclick="selectQuickRegion(39.58, 32.14, 'Polatlı (Ankara)', 'Tahıl Ambarı')" class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink hover:border-teal-400 transition flex items-center gap-1">
              🌾 Polatlı
            </button>
            <button onclick="selectQuickRegion(36.99, 35.32, 'Adana / Çukurova', 'Narenciye, Pamuk & Mısır')" class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink hover:border-teal-400 transition flex items-center gap-1">
              🍊 Çukurova
            </button>
            <button onclick="selectQuickRegion(36.88, 30.70, 'Antalya (Kumluca & Serik)', 'Örtüaltı Seracılık')" class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink hover:border-teal-400 transition flex items-center gap-1">
              🍅 Antalya Seracılık
            </button>
            <button onclick="selectQuickRegion(37.75, 27.40, 'Söke Ovası (Aydın)', 'Pamuk & Zeytin Havzası')" class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink hover:border-teal-400 transition flex items-center gap-1">
              ☁️ Söke Ovası
            </button>
            <button onclick="selectQuickRegion(38.61, 27.42, 'Manisa (Gediz Havzası)', 'Bağcılık & Çekirdeksiz Üzüm')" class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink hover:border-teal-400 transition flex items-center gap-1">
              🍇 Gediz Havzası
            </button>
            <button onclick="selectQuickRegion(37.16, 38.79, 'Harran Ovası (Şanlıurfa)', 'GAP Pamuk & Hububat')" class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink hover:border-teal-400 transition flex items-center gap-1">
              🌾 Harran Ovası
            </button>
            <button onclick="selectQuickRegion(41.28, 36.33, 'Çarşamba & Bafra Ovaları (Samsun)', 'Sebze & Çeltik')" class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink hover:border-teal-400 transition flex items-center gap-1">
              🌽 Çarşamba / Bafra
            </button>
            <button onclick="selectQuickRegion(40.97, 27.51, 'Trakya (Tekirdağ & Edirne)', 'Ayçiçeği & Buğday')" class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink hover:border-teal-400 transition flex items-center gap-1">
              🌻 Trakya Havzası
            </button>
            <button onclick="selectQuickRegion(38.35, 38.31, 'Malatya Ovası', 'Dünya Kayısı Başkenti')" class="px-2.5 py-1.5 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-ink hover:border-teal-400 transition flex items-center gap-1">
              🍑 Malatya Ovası
            </button>
          </div>
        </div>

        <!-- Aktif Bölge Bilgi Rozeti -->
        <div class="pt-3 border-t border-mistral-hairline flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-mistral-slate">Aktif Seçili Bölge:</span>
            <span id="label-active-region-name" class="font-bold text-white bg-white px-3 py-1 rounded-lg border border-mistral-hairline">Konya Ovası</span>
            <span id="label-active-coords" class="font-mono text-teal-400 font-bold">37.87° N, 32.49° E</span>
          </div>
          <button onclick="saveCurrentField()" class="text-xs px-3.5 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 font-medium transition flex items-center gap-1 border border-teal-500/40">
            <span>💾</span> Bu Parseli Kaydet
          </button>
        </div>
      </div>

      <!-- 2. ANLIK ZİRAİ UYARI VE TAVSİYE KARTLARI (ACTIONABLE ALERTS) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <!-- 1. Don Riski -->
        <div id="card-frost" class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs uppercase font-bold text-mistral-slate">Don Riski Durumu</span>
              <span id="badge-frost" class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">Güvenli</span>
            </div>
            <div class="text-2xl font-black text-white mt-1" id="val-surface-temp">14°C</div>
            <p class="text-[11px] text-mistral-slate mt-1" id="desc-frost">Önümüzdeki 48 saat içinde zirai don tehlikesi beklenmiyor.</p>
          </div>
        </div>

        <!-- 2. Sulama Tavsiyesi (ET0) -->
        <div id="card-irrigation" class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs uppercase font-bold text-mistral-slate">Sulama İhtiyacı</span>
              <span id="badge-irrigation" class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">Orta İhtiyaç</span>
            </div>
            <div class="text-2xl font-black text-blue-400 mt-1" id="val-et0">4.2 mm/gün</div>
            <p class="text-[11px] text-mistral-slate mt-1" id="desc-irrigation">Günlük buharlaşma orta düzeyde. Akşam serinliğinde sulama önerilir.</p>
          </div>
        </div>

        <!-- 3. İlaçlama Uygunluk Penceresi (Spray Window) -->
        <div id="card-spray" class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs uppercase font-bold text-mistral-slate">İlaçlama Uygunluğu</span>
              <span id="badge-spray" class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">Uygun</span>
            </div>
            <div class="text-2xl font-black text-emerald-400 mt-1" id="val-wind">8 km/h</div>
            <p class="text-[11px] text-mistral-slate mt-1" id="desc-spray">Rüzgar ve nem koşulları zirai ilaçlama (pülverizatör) için ideal.</p>
          </div>
        </div>

        <!-- 4. Ekim & Çimlenme Uygunluğu -->
        <div id="card-planting" class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs uppercase font-bold text-mistral-slate">Ekim / Çimlenme</span>
              <span id="badge-planting" class="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300">İdeal Sıcaklık</span>
            </div>
            <div class="text-2xl font-black text-yellow-400 mt-1" id="val-seedbed-temp">18°C</div>
            <p class="text-[11px] text-mistral-slate mt-1" id="desc-planting">Tohum yatağı sıcaklığı seçilen ürünün çimlenme eşiğinin üzerinde.</p>
          </div>
        </div>

      </div>

      <!-- 3. TOPRAK DERİNLİK VE NEM PROFİLİ (SOIL DEPTH MATRIX) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        <!-- Sol: Toprak Katmanları Kartı (7 Kolon) -->
        <div class="lg:col-span-7 p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-mistral-ink flex items-center gap-2">
              <span>🌱</span> Toprak Sıcaklığı & Nem Katman Profili
            </h3>
            <span class="text-xs text-mistral-slate font-mono">Derinlik Seviyeleri</span>
          </div>
          <p class="text-mistral-slate text-xs">
            Farklı kök derinliklerindeki anlık sensör/model verileri (0 cm yüzey, 6 cm tohum yatağı, 18 cm ana kök bölgesi):
          </p>

          <div class="space-y-3 pt-2">
            <!-- 0 cm Yüzey -->
            <div class="p-4 rounded-2xl bg-white border border-mistral-hairline flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                  0cm
                </div>
                <div>
                  <h4 class="font-bold text-xs text-mistral-ink">Yüzey Katmanı</h4>
                  <span class="text-[10px] text-mistral-slate">Güneş ışınımı ve hava etkileşim alanı</span>
                </div>
              </div>
              <div class="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span class="text-[10px] text-mistral-stone block uppercase">Sıcaklık</span>
                  <span id="soil-temp-0" class="font-bold text-white text-sm">--°C</span>
                </div>
                <div>
                  <span class="text-[10px] text-mistral-stone block uppercase">Nem (0-1cm)</span>
                  <span id="soil-moist-0" class="font-bold text-teal-400 text-sm">-- %</span>
                </div>
              </div>
            </div>

            <!-- 6 cm Tohum Yatağı -->
            <div class="p-4 rounded-2xl bg-white border border-mistral-hairline flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                  6cm
                </div>
                <div>
                  <h4 class="font-bold text-xs text-mistral-ink">Tohum Yatağı Derinliği</h4>
                  <span class="text-[10px] text-mistral-slate">Tohum ekimi ve ilk filizlenme derinliği</span>
                </div>
              </div>
              <div class="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span class="text-[10px] text-mistral-stone block uppercase">Sıcaklık</span>
                  <span id="soil-temp-6" class="font-bold text-white text-sm">--°C</span>
                </div>
                <div>
                  <span class="text-[10px] text-mistral-stone block uppercase">Nem (1-3cm)</span>
                  <span id="soil-moist-6" class="font-bold text-teal-400 text-sm">-- %</span>
                </div>
              </div>
            </div>

            <!-- 18 cm Kök Bölgesi -->
            <div class="p-4 rounded-2xl bg-white border border-mistral-hairline flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">
                  18cm
                </div>
                <div>
                  <h4 class="font-bold text-xs text-mistral-ink">Ana Kök Bölgesi</h4>
                  <span class="text-[10px] text-mistral-slate">Kılcal köklerin ana su çekim derinliği</span>
                </div>
              </div>
              <div class="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span class="text-[10px] text-mistral-stone block uppercase">Sıcaklık</span>
                  <span id="soil-temp-18" class="font-bold text-white text-sm">--°C</span>
                </div>
                <div>
                  <span class="text-[10px] text-mistral-stone block uppercase">Nem (3-9cm)</span>
                  <span id="soil-moist-18" class="font-bold text-teal-400 text-sm">-- %</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sağ: Günlük Zirai Özet Tablosu (5 Kolon) -->
        <div class="lg:col-span-5 p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl space-y-4">
          <h3 class="text-sm font-bold text-mistral-ink flex items-center gap-2">
            <span>📅</span> 7 Günlük Zirai Tahmin Özeti
          </h3>
          <p class="text-mistral-slate text-xs">
            Günlük maksimum/minimum sıcaklık, buharlaşma (ET0) ve beklenen yağış miktarları:
          </p>

          <div class="overflow-x-auto max-h-[290px] overflow-y-auto pr-1">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="border-b border-mistral-hairline text-mistral-slate">
                  <th class="pb-2">Tarih</th>
                  <th class="pb-2 text-center">Gündüz/Gece</th>
                  <th class="pb-2 text-right">Buharlaşma</th>
                  <th class="pb-2 text-right">Yağış</th>
                </tr>
              </thead>
              <tbody id="daily-agro-tbody" class="divide-y divide-slate-700/60 font-mono">
                <!-- JS ile -->
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- 4. İNTERAKTİF ZİRAİ GRAFİKLER (Chart.js) -->
      <div class="p-6 sm:p-8 rounded-3xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-base font-bold text-mistral-ink flex items-center gap-2">
              <span>📊</span> Toprak Sıcaklığı ve Buharlaşma Trendi (7 Günlük)
            </h3>
            <p class="text-mistral-slate text-xs mt-0.5">Tohum yatağı sıcaklığı ve FAO-56 referans evapotranspirasyon eğrisi</p>
          </div>
          <div class="flex items-center gap-4 text-xs font-semibold">
            <span class="flex items-center gap-1.5 text-teal-400">
              <span class="w-3 h-3 rounded-full bg-teal-500"></span> Toprak Sıcaklığı (6cm)
            </span>
            <span class="flex items-center gap-1.5 text-blue-400">
              <span class="w-3 h-3 rounded-full bg-blue-500"></span> Buharlaşma (ET0)
            </span>
          </div>
        </div>

        <div class="relative w-full h-64 sm:h-72 mt-2">
          <canvas id="agro-chart"></canvas>
        </div>
      </div>

      <!-- 5. KAYITLI TARLALARIM / PARSELLERİM (MY FARM FIELDS) -->
      <div class="mt-14 pt-8 border-t border-mistral-hairline space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-mistral-ink flex items-center gap-2">
              <span>🌾</span> Kayıtlı Tarlalarım & Parsellerim
            </h3>
            <p class="text-mistral-slate text-xs">Sık takip ettiğiniz tarla koordinatlarını ve ekin türlerini kaydedin.</p>
          </div>
          <button onclick="clearSavedFields()" class="text-xs text-rose-400 hover:underline">Tümünü Sil</button>
        </div>

        <div id="saved-fields-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <!-- JS ile doldurulur -->
        </div>
        <div id="saved-fields-empty" class="p-8 text-center rounded-2xl bg-white border border-mistral-hairline text-mistral-stone text-xs">
          Henüz kayıtlı bir tarlanız bulunmuyor. Yukarıdaki "Bu Parseli Kaydet" butonuna tıklayarak ilk parselinizi ekleyebilirsiniz.
        </div>
      </div>

      <!-- Toast Bildirimi -->
      <div id="tarim-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-teal-500 text-slate-950 font-black text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı & Genişletilmiş Türkiye Tarım Havzaları Veritabanı -->
    `;

    res.send(pageTemplate('Akıllı Tarım & Zirai Hava', content, extraHead));
  };
};
