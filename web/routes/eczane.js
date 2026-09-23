module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        #eczane-map {
          height: 560px;
          border-radius: 12px;
          border: 1px solid #e5e5e5;
        }
        .user-pulse-marker {
          position: relative;
        }
        .pulse-ring {
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.35);
          animation: map-pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
          top: -4px;
          left: -4px;
        }
        .core-dot {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #2563eb;
          border: 2.5px solid #ffffff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          top: 3px;
          left: 3px;
        }
        @keyframes map-pulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .pharmacy-badge-marker {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          font-weight: 700;
          font-family: inherit;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          border: 2px solid #ffffff;
          color: white;
          cursor: pointer;
        }
        .pharmacy-top5-marker {
          background: #059669;
          font-size: 13px;
        }
        .pharmacy-standard-marker {
          background: #e11d48;
          font-size: 11px;
        }
        .custom-eczane-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          border: 1px solid #e5e5e5;
          padding: 2px;
        }
        .custom-eczane-popup .leaflet-popup-content {
          margin: 12px 14px;
          line-height: 1.4;
        }
      </style>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="/static/apps/eczane/app.js?v=10.0" defer></script>
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
            <span>🏥</span> Nöbetçi Eczaneler
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Türkiye genelinde 81 il ve tüm ilçelerde güncel nöbetçi eczaneler, canlı konum tespiti ve en yakın eczane rehberi.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium" id="eczane-status-label">81 İl Canlı Eczane API</span>
        </div>
      </div>

      <!-- KONUM İZİN BİLDİRİM ÇUBUĞU (Kullanıcı Tıklaması ile İzin Tetikleme) -->
      <div id="location-permission-banner" class="hidden mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-950 transition-all shadow-xs">
        <div class="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
          <span class="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-base shadow-xs">
            <i class="fa-solid fa-location-dot"></i>
          </span>
          <span id="location-banner-text">📍 Bulunduğunuz şehirdeki en yakın nöbetçi eczaneleri görmek için konumunuzu tespit edelim:</span>
        </div>
        <button 
          type="button" 
          id="btn-banner-gps" 
          onclick="handleMyLocationClick()" 
          class="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer">
          <i class="fa-solid fa-location-crosshairs"></i>
          <span>Konumumu Tespit Et</span>
        </button>
      </div>

      <!-- KONTROL & KONUM & FİLTRE PANELİ -->
      <div class="p-5 sm:p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        
        <!-- Üst Satır: Konum, İl ve İlçe Seçimi (Ferah 3 Kolon) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          
          <!-- Konum Butonu (GPS) -->
          <div class="sm:col-span-2 lg:col-span-4">
            <label class="block text-xs font-semibold text-mistral-slate mb-1.5 flex items-center gap-1.5">
              <i class="fa-solid fa-location-crosshairs text-mistral-orange"></i>
              <span>Canlı Konum</span>
            </label>
            <button 
              type="button" 
              onclick="handleMyLocationClick()" 
              id="btn-get-gps" 
              class="w-full h-11 px-4 rounded-xl bg-mistral-orange hover:bg-mistral-orange-deep text-white text-sm font-semibold flex items-center justify-center gap-2.5 transition shadow-xs cursor-pointer whitespace-nowrap">
              <i class="fa-solid fa-location-crosshairs text-base"></i>
              <span class="tracking-wide">Konumumu Tespit Et</span>
            </button>
          </div>

          <!-- İl Seçimi (81 İl) -->
          <div class="sm:col-span-1 lg:col-span-4">
            <label for="select-city" class="block text-xs font-semibold text-mistral-slate mb-1.5 flex items-center gap-1.5">
              <i class="fa-solid fa-city text-mistral-orange"></i>
              <span>İl Seçin</span>
            </label>
            <div class="relative">
              <select 
                id="select-city" 
                onchange="onCityChange()" 
                class="w-full h-11 px-3.5 pr-9 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange focus:ring-2 focus:ring-mistral-orange/20 transition cursor-pointer appearance-none">
                <option value="ankara" selected>📍 Ankara (Başkent)</option>
                <option value="istanbul">📍 İstanbul</option>
                <option value="izmir">📍 İzmir</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-mistral-stone">
                <i class="fa-solid fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>

          <!-- İlçe / Bölge Filtresi -->
          <div class="sm:col-span-1 lg:col-span-4">
            <label for="select-district" class="block text-xs font-semibold text-mistral-slate mb-1.5 flex items-center gap-1.5">
              <i class="fa-solid fa-map-pin text-mistral-orange"></i>
              <span>İlçe / Bölge</span>
            </label>
            <div class="relative">
              <select 
                id="select-district" 
                onchange="onDistrictChange()" 
                class="w-full h-11 px-3.5 pr-9 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange focus:ring-2 focus:ring-mistral-orange/20 transition cursor-pointer appearance-none">
                <option value="cankaya" selected>Çankaya</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-mistral-stone">
                <i class="fa-solid fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Alt Satır: Geniş Arama Kutusu (Tam Genişlik) -->
        <div>
          <label for="search-input" class="block text-xs font-semibold text-mistral-slate mb-1.5 flex items-center gap-1.5">
            <i class="fa-solid fa-magnifying-glass text-mistral-orange"></i>
            <span>Eczane veya Sokak Ara</span>
          </label>
          <div class="relative">
            <input 
              type="text" 
              id="search-input" 
              placeholder="Eczane adı, mahalle, cadde veya sokak adı yazarak anında filtreleyin..." 
              oninput="onSearchInput()"
              class="w-full h-11 pl-11 pr-4 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange focus:ring-2 focus:ring-mistral-orange/20 transition shadow-inner-sm">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-mistral-stone text-sm"></i>
          </div>
        </div>

        <!-- Bilgi İpucu Şeridi -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-mistral-hairline text-xs text-mistral-slate">
          <div class="flex items-center gap-1.5">
            <i class="fa-regular fa-lightbulb text-mistral-orange"></i>
            <span><strong>İpucu:</strong> Haritada dilediğiniz bir noktaya tıklayarak referans konumunuzu taşıyabilir veya listeden il/ilçe değiştirebilirsiniz.</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="fitAllPharmacies()" class="text-mistral-slate hover:text-mistral-ink font-semibold flex items-center gap-1 cursor-pointer">
              <i class="fa-solid fa-expand text-[10px]"></i> Tüm Eczaneleri Göster
            </button>
          </div>
        </div>
      </div>

      <!-- HARİTA VE EN YAKIN ECZANELER GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        <!-- Sol: OpenStreetMap Haritası (7 Kolon) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="p-3 rounded-2xl bg-white border border-mistral-hairline shadow-sm relative overflow-hidden">
            <div id="eczane-map" class="w-full h-[560px] rounded-xl z-10"></div>
            
            <!-- Harita Lejantı -->
            <div class="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur border border-mistral-hairline px-3.5 py-2.5 rounded-lg shadow-sm text-xs text-mistral-ink flex flex-wrap items-center gap-4">
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-xs"></span>
                <span>Referans Konum</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center border border-white">1</span>
                <span>En Yakın 5 Eczane</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center border border-white">&plus;</span>
                <span>Diğer Nöbetçiler</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Sağ: En Yakın 5 Eczane & Detay Listesi (5 Kolon) -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- EN YAKIN 5 ECZANE KARTI -->
          <div class="p-6 rounded-2xl bg-white border border-emerald-500/30 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs uppercase tracking-wider text-emerald-600 font-bold block mb-0.5 flex items-center gap-1">
                  <i class="fa-solid fa-location-dot"></i> EN YAKIN 5 NÖBETÇİ ECZANE
                </span>
                <h3 class="text-xl font-bold font-editorial text-mistral-ink">
                  Mesafe Sıralı Liste
                </h3>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                Canlı Mesafe
              </span>
            </div>

            <!-- 5 Eczane Kart Listesi -->
            <div id="nearest-pharmacies-list" class="space-y-3">
              <div class="p-4 rounded-xl bg-mistral-cream text-center text-xs text-mistral-slate">
                Eczaneler yükleniyor ve mesafeler hesaplanıyor...
              </div>
            </div>
          </div>

          <!-- DİĞER / TÜM ECZANELER LİSTESİ -->
          <div class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-bold font-editorial text-mistral-ink flex items-center gap-2">
                <span>Bölgedeki Tüm Nöbetçiler</span>
                <span id="filtered-pharmacies-count" class="px-2 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-[11px] font-semibold">0</span>
              </h4>
              <button 
                type="button" 
                onclick="toggleAllPharmaciesList()" 
                id="btn-toggle-all"
                class="text-xs text-mistral-orange hover:underline font-semibold cursor-pointer">
                Gizle / Göster
              </button>
            </div>

            <div id="all-pharmacies-box" class="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-xs">
              <!-- JS ile doldurulur -->
            </div>
          </div>

        </div>

      </div>

      <!-- İSTATİSTİK ŞERİDİ -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Bölgede Nöbetçi</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-ink" id="stat-total-pharmacies">--</div>
          <div class="text-[11px] text-mistral-stone mt-0.5" id="stat-duty-city-label">Seçili Bölgede</div>
        </div>

        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">En Yakın Eczane</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-emerald-600" id="stat-nearest-dist">--</div>
          <div class="text-[11px] text-mistral-stone mt-0.5 truncate" id="stat-nearest-name">Hesaplanıyor...</div>
        </div>

        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Aktif Referans Konum</div>
          <div class="text-base sm:text-lg font-bold font-editorial text-mistral-ink truncate mt-1" id="stat-loc-label">Anıtkabir / Çankaya</div>
          <div class="text-[11px] text-mistral-stone mt-0.5" id="stat-loc-source">Referans Nokta</div>
        </div>

        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Nöbetçi Tarihi</div>
          <div class="text-base sm:text-lg font-bold font-editorial text-mistral-orange truncate mt-1" id="stat-duty-date">Bugün</div>
          <div class="text-[11px] text-mistral-stone mt-0.5">Resmi Nöbet Çizelgesi</div>
        </div>
      </div>
    `;

    res.send(pageTemplate('Nöbetçi Eczaneler', content, extraHead));
  };
};
