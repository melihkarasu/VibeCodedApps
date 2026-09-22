module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        .user-pulse-marker {
          position: relative;
          width: 20px;
          height: 20px;
        }
        .user-pulse-marker .core-dot {
          position: absolute;
          width: 14px;
          height: 14px;
          left: 3px;
          top: 3px;
          background: #2563eb;
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(37,99,235,0.8);
          z-index: 2;
        }
        .user-pulse-marker .pulse-ring {
          position: absolute;
          width: 28px;
          height: 28px;
          left: -4px;
          top: -4px;
          border-radius: 50%;
          background: rgba(37,99,235,0.35);
          animation: pulse-ring-anim 2s infinite ease-out;
          z-index: 1;
        }
        @keyframes pulse-ring-anim {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .pharmacy-badge-marker {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          font-weight: 700;
          color: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          border: 2px solid white;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .pharmacy-badge-marker:hover {
          transform: scale(1.15);
        }
        .pharmacy-top5-marker {
          background: #059669; /* Emerald */
          width: 32px;
          height: 32px;
          font-size: 13px;
        }
        .pharmacy-standard-marker {
          background: #dc2626; /* Red */
          width: 26px;
          height: 26px;
          font-size: 11px;
        }
        .custom-eczane-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e5e5;
          padding: 2px;
        }
        .custom-eczane-popup .leaflet-popup-content {
          margin: 12px 14px;
          line-height: 1.4;
        }
      </style>
      <script src="/static/apps/eczane/app.js?v=4.0" defer></script>
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
            <span>🏥</span> İzmir Nöbetçi Eczane Radarı
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            İzmir Büyükşehir Belediyesi Açık Veri Portalı API'si ile güncel nöbetçi eczaneler, canlı konum tespiti ve en yakın 5 eczane rehberi.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium" id="eczane-status-label">İzmir BB Açık Veri Bağlı</span>
        </div>
      </div>

      <!-- KONTROL & KONUM & FİLTRE PANELİ -->
      <div class="p-5 sm:p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          
          <!-- Konum Butonu (Sadeleştirilmiş Tek "Konumum" Butonu) -->
          <div class="sm:col-span-5 flex items-center gap-2">
            <button 
              type="button" 
              onclick="handleMyLocationClick()" 
              id="btn-get-gps" 
              class="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer shrink-0">
              <i class="fa-solid fa-location-crosshairs text-base"></i>
              <span>Konumum</span>
            </button>

            <!-- Örnek / Alternatif Konum Seçimi -->
            <select 
              id="select-preset-location" 
              onchange="onPresetLocationChange()" 
              class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-xs sm:text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange transition">
              <option value="gps">🎯 Canlı GPS Konumum</option>
              <option value="konak" selected>📍 Konak, İzmir (C4PQ+8Q)</option>
              <option value="alsancak">📍 Alsancak / Kıbrıs Şehitleri</option>
              <option value="karsiyaka">📍 Karşıyaka Çarşı / İskele</option>
              <option value="bornova">📍 Bornova Meydan / Küçükpark</option>
              <option value="buca">📍 Buca Heykel / Çevik Bir</option>
              <option value="balcova">📍 Balçova / Ekonomi Ünv.</option>
              <option value="cigli">📍 Çiğli / Anadolu Caddesi</option>
              <option value="gaziemir">📍 Gaziemir / Optimum</option>
              <option value="bayrakli">📍 Bayraklı / Adliye</option>
            </select>
          </div>

          <!-- İlçe / Bölge Filtresi -->
          <div class="sm:col-span-3">
            <select 
              id="select-district" 
              onchange="onDistrictFilterChange()" 
              class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-xs sm:text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange transition">
              <option value="">İlçe / Bölge Seçin (Tümü)</option>
            </select>
          </div>

          <!-- İsimle Arama -->
          <div class="sm:col-span-4 relative">
            <input 
              type="text" 
              id="search-input" 
              placeholder="Eczane adı veya sokak ara..." 
              oninput="onSearchInput()"
              class="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-xs sm:text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-3.5 text-mistral-stone text-xs"></i>
          </div>
        </div>

        <!-- Bilgi İpucu Şeridi -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-mistral-hairline text-xs text-mistral-slate">
          <div class="flex items-center gap-1.5">
            <i class="fa-regular fa-lightbulb text-mistral-orange"></i>
            <span><strong>İpucu:</strong> Haritada dilediğiniz bir noktaya tıklayarak referans konumunuzu anında taşıyabilirsiniz.</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="fitAllPharmacies()" class="text-mistral-slate hover:text-mistral-ink font-semibold flex items-center gap-1">
              <i class="fa-solid fa-expand text-[10px]"></i> Tüm İzmir'i Göster
            </button>
          </div>
        </div>
      </div>

      <!-- HARİTA VE EN YAKIN ECZANELER GRID (Arama Kutusunun Hemen Altında) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        <!-- Sol: OpenStreetMap Haritası (7 Kolon) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="p-3 rounded-2xl bg-white border border-mistral-hairline shadow-sm relative overflow-hidden">
            <div id="eczane-map" class="w-full h-[560px] rounded-xl z-10"></div>
            
            <!-- Harita Lejantı -->
            <div class="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur border border-mistral-hairline px-3.5 py-2.5 rounded-lg shadow-sm text-xs text-mistral-ink flex flex-wrap items-center gap-4">
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-xs"></span>
                <span>Konumunuz</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center border border-white">1</span>
                <span>En Yakın 5 Eczane</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center border border-white">&plus;</span>
                <span>Nöbetçi Eczaneler</span>
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
                <span>Diğer Nöbetçi Eczaneler</span>
                <span id="filtered-pharmacies-count" class="px-2 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-[11px] font-semibold">0</span>
              </h4>
              <button 
                type="button" 
                onclick="toggleAllPharmaciesList()" 
                id="btn-toggle-all"
                class="text-xs text-mistral-orange hover:underline font-semibold">
                Göster / Gizle
              </button>
            </div>

            <div id="all-pharmacies-box" class="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-xs hidden">
              <!-- JS ile doldurulur -->
            </div>
          </div>

        </div>

      </div>

      <!-- İSTATİSTİK ŞERİDİ (Haritanın Altında) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Toplam Nöbetçi Eczane</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-ink" id="stat-total-pharmacies">--</div>
          <div class="text-[11px] text-mistral-stone mt-0.5">İzmir Genelinde Bugün</div>
        </div>

        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">En Yakın Eczane</div>
          <div class="text-2xl sm:text-3xl font-bold font-editorial text-emerald-600" id="stat-nearest-dist">--</div>
          <div class="text-[11px] text-mistral-stone mt-0.5 truncate" id="stat-nearest-name">Hesaplanıyor...</div>
        </div>

        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Aktif Referans Konum</div>
          <div class="text-base sm:text-lg font-bold font-editorial text-mistral-ink truncate mt-1" id="stat-loc-label">Konak Meydanı</div>
          <div class="text-[11px] text-mistral-stone mt-0.5" id="stat-loc-source">Örnek Merkez Nokta</div>
        </div>

        <div class="p-5 rounded-xl bg-white border border-mistral-hairline shadow-xs">
          <div class="text-xs text-mistral-slate font-medium mb-1">Nöbetçi Tarihi</div>
          <div class="text-base sm:text-lg font-bold font-editorial text-mistral-orange truncate mt-1" id="stat-duty-date">Bugün</div>
          <div class="text-[11px] text-mistral-stone mt-0.5">08:00 - Ertesi Gün 08:00</div>
        </div>
      </div>
    `;

    res.send(pageTemplate('İzmir Nöbetçi Eczane Radarı', content, extraHead));
  };
};
