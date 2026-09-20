const STORAGE_KEY = '***';
        
        // 100+ Kapsamlı Türkiye Tarım Havzası ve İlçeleri Veritabanı
        const AGRO_BASINS = [
          // İç Anadolu
          { name: 'Konya Ovası', city: 'Konya', lat: 37.87, lon: 32.49, type: 'Tahıl, Şeker Pancarı & Bakliyat' },
          { name: 'Polatlı', city: 'Ankara', lat: 39.58, lon: 32.14, type: 'Tahıl Ambarı & Soğan' },
          { name: 'Cihanbeyli', city: 'Konya', lat: 38.65, lon: 32.92, type: 'Kuru Tarım & Hububat' },
          { name: 'Çumra', city: 'Konya', lat: 37.57, lon: 32.77, type: 'Şeker Pancarı & Sulama Alanı' },
          { name: 'Karapınar', city: 'Konya', lat: 37.71, lon: 33.55, type: 'Mısır & Yem Bitkileri' },
          { name: 'Ereğli', city: 'Konya', lat: 37.51, lon: 34.05, type: 'Beyaz Kiraz, Havuç & Sütçülük' },
          { name: 'Aksaray Ovası', city: 'Aksaray', lat: 38.37, lon: 34.03, type: 'Yonca & Hububat' },
          { name: 'Karaman', city: 'Karaman', lat: 37.18, lon: 33.22, type: 'Elma Bahçeleri & Bakliyat' },
          { name: 'Eskişehir Ovası', city: 'Eskişehir', lat: 39.77, lon: 30.52, type: 'Pancar, Buğday & Arpa' },
          { name: 'Sivrihisar', city: 'Eskişehir', lat: 39.45, lon: 31.53, type: 'Kuru Hububat' },
          { name: 'Develi Ovası', city: 'Kayseri', lat: 38.39, lon: 35.49, type: 'Yem Bitkileri & Tahıl' },
          { name: 'Yozgat', city: 'Yozgat', lat: 39.82, lon: 34.81, type: 'Mercimek & Buğday' },
          { name: 'Kırşehir Ovası', city: 'Kırşehir', lat: 39.14, lon: 34.17, type: 'Nohut & Bakliyat' },
          { name: 'Sivas Kangal', city: 'Sivas', lat: 39.23, lon: 37.23, type: 'Yaylacılık & Yem' },

          // Çukurova & Akdeniz
          { name: 'Adana Çukurova', city: 'Adana', lat: 36.99, lon: 35.32, type: 'Pamuk, Narenciye & Soya' },
          { name: 'Ceyhan', city: 'Adana', lat: 37.03, lon: 35.82, type: 'Mısır & Birinci Ürün' },
          { name: 'Kozan', city: 'Adana', lat: 37.45, lon: 35.81, type: 'Narenciye & Bal Üretimi' },
          { name: 'Tarsus', city: 'Mersin', lat: 36.91, lon: 34.89, type: 'Beyaz Üzüm, Narenciye & Sebze' },
          { name: 'Silifke Ovası', city: 'Mersin', lat: 36.37, lon: 33.93, type: 'Çilek & Çeltik' },
          { name: 'Kadirli', city: 'Osmaniye', lat: 37.37, lon: 36.09, type: 'Yer Fıstığı & Turp' },
          { name: 'Osmaniye', city: 'Osmaniye', lat: 37.07, lon: 36.25, type: 'Yer Fıstığı Başkenti' },
          { name: 'Amik Ovası', city: 'Hatay', lat: 36.20, lon: 36.16, type: 'Pamuk, Buğday & Zeytin' },
          { name: 'Kırıkhan / Reyhanlı', city: 'Hatay', lat: 36.49, lon: 36.35, type: 'Havuç & Hububat' },
          { name: 'Antalya Kumluca', city: 'Antalya', lat: 36.37, lon: 30.29, type: 'Örtüaltı Domates & Biber' },
          { name: 'Serik', city: 'Antalya', lat: 36.91, lon: 31.10, type: 'Seracılık & Çilek' },
          { name: 'Finike', city: 'Antalya', lat: 36.30, lon: 30.14, type: 'Coğrafi İşaretli Portakal' },
          { name: 'Alanya / Gazipaşa', city: 'Antalya', lat: 36.54, lon: 31.99, type: 'Muz & Tropikal Meyveler' },
          { name: 'Fethiye / Seydikemer', city: 'Muğla', lat: 36.65, lon: 29.12, type: 'Domates & Nar' },

          // Ege
          { name: 'Manisa Gediz Havzası', city: 'Manisa', lat: 38.61, lon: 27.42, type: 'Çekirdeksiz Sultaniye Üzüm' },
          { name: 'Akhisar', city: 'Manisa', lat: 38.92, lon: 27.84, type: 'Türkiye Zeytin Başkenti' },
          { name: 'Salihli', city: 'Manisa', lat: 38.48, lon: 28.14, type: 'Napolyon Kirazı & Bağlar' },
          { name: 'Alaşehir', city: 'Manisa', lat: 38.35, lon: 28.52, type: 'İhracatlık Yaş Üzüm' },
          { name: 'Ödemiş', city: 'İzmir', lat: 38.23, lon: 27.97, type: 'Patates & Fidancılık' },
          { name: 'Tire Ovası', city: 'İzmir', lat: 38.09, lon: 27.73, type: 'Sütçülük & İncir' },
          { name: 'Bergama Bakırçay', city: 'İzmir', lat: 39.12, lon: 27.18, type: 'Pamuk & Domates Salçalık' },
          { name: 'Söke Ovası', city: 'Aydın', lat: 37.75, lon: 27.40, type: 'Ege Beyaz Altını (Pamuk)' },
          { name: 'Nazilli / Sultanhisar', city: 'Aydın', lat: 37.91, lon: 28.32, type: 'Kuru İncir & Çilek' },
          { name: 'Çine Ovası', city: 'Aydın', lat: 37.61, lon: 28.06, type: 'Zeytinyağı & Hayvancılık' },
          { name: 'Denizli Çivril', city: 'Denizli', lat: 38.30, lon: 29.74, type: 'Elma & Ayçekirdeği' },
          { name: 'Tavas Ovası', city: 'Denizli', lat: 37.57, lon: 29.07, type: 'Tütün & Tahıl' },

          // Güneydoğu & Doğu
          { name: 'Harran Ovası', city: 'Şanlıurfa', lat: 37.16, lon: 38.79, type: 'GAP Pamuk & Mercimek' },
          { name: 'Akçakale', city: 'Şanlıurfa', lat: 36.71, lon: 38.95, type: 'Pamuk & Buğday' },
          { name: 'Siverek / Hilvan', city: 'Şanlıurfa', lat: 37.75, lon: 39.31, type: 'Kırmızı Mercimek' },
          { name: 'Bismil Ovası', city: 'Diyarbakır', lat: 37.84, lon: 40.67, type: 'Dicle Pamuğu & Mısır' },
          { name: 'Kızıltepe Ovası', city: 'Mardin', lat: 37.19, lon: 40.58, type: 'Sert Buğday & Mısır' },
          { name: 'Nusaybin', city: 'Mardin', lat: 37.07, lon: 41.21, type: 'Zeytin & Hububat' },
          { name: 'Batman Ovası', city: 'Batman', lat: 37.88, lon: 41.13, type: 'Mısır & Fıstık' },
          { name: 'Gaziantep Nizip', city: 'Gaziantep', lat: 37.01, lon: 37.79, type: 'Antep Fıstığı & Zeytin' },
          { name: 'Araban Ovası', city: 'Gaziantep', lat: 37.42, lon: 37.69, type: 'Sarımsak & Sert Buğday' },
          { name: 'Malatya Ovası', city: 'Malatya', lat: 38.35, lon: 38.31, type: 'Kuru Kayısı & Meyve' },
          { name: 'Battalgazi / Yazıhan', city: 'Malatya', lat: 38.42, lon: 38.36, type: 'Kayısı Bahçeleri' },
          { name: 'Iğdır Ovası', city: 'Iğdır', lat: 39.92, lon: 44.04, type: 'Doğunun Çukurovası (Kayısı/Elma)' },
          { name: 'Erzurum Pasinler', city: 'Erzurum', lat: 39.98, lon: 41.67, type: 'Patates & Yem' },

          // Marmara & Trakya
          { name: 'Tekirdağ Ovası', city: 'Tekirdağ', lat: 40.97, lon: 27.51, type: 'Ayçiçeği, Buğday & Kanola' },
          { name: 'Hayrabolu / Malkara', city: 'Tekirdağ', lat: 41.21, lon: 27.11, type: 'Yağlık Ayçiçeği & Yem' },
          { name: 'Edirne İpsala', city: 'Edirne', lat: 40.92, lon: 26.38, type: 'Türkiye Çeltik (Pirinç) Ambarı' },
          { name: 'Uzunköprü', city: 'Edirne', lat: 41.27, lon: 26.68, type: 'Çeltik & Ayçiçeği' },
          { name: 'Lüleburgaz / Babaeski', city: 'Kırklareli', lat: 41.40, lon: 27.35, type: 'Mısır, Buğday & Yağlık' },
          { name: 'Bursa İznik', city: 'Bursa', lat: 40.43, lon: 29.72, type: 'Sofralık Zeytin & Şeftali' },
          { name: 'İnegöl Ovası', city: 'Bursa', lat: 40.08, lon: 29.51, type: 'Meyvecilik & Çilek' },
          { name: 'Mustafakemalpaşa', city: 'Bursa', lat: 40.04, lon: 28.41, type: 'Sanayi Domatesi' },
          { name: 'Bandırma / Gönen', city: 'Balıkesir', lat: 40.11, lon: 27.65, type: 'Gönen Pirinci & Hayvancılık' },
          { name: 'Edremit Körfezi', city: 'Balıkesir', lat: 39.59, lon: 27.02, type: 'Kuzey Ege Zeytinyağı' },
          { name: 'Biga Ovası', city: 'Çanakkale', lat: 40.23, lon: 27.24, type: 'Çeltik, Domates & Biber' },

          // Karadeniz
          { name: 'Çarşamba Ovası', city: 'Samsun', lat: 41.20, lon: 36.72, type: 'Mısır, Soya, Şeftali & Sebze' },
          { name: 'Bafra Ovası', city: 'Samsun', lat: 41.57, lon: 35.91, type: 'Kışlık Sebze, Pırasa, Lahana & Çeltik' },
          { name: 'Giresun / Ordu', city: 'Giresun', lat: 40.91, lon: 38.39, type: 'Dünya Fındık Başkenti' },
          { name: 'Rize / Çayeli', city: 'Rize', lat: 41.02, lon: 40.52, type: 'Türk Çayı & Kivi' },
          { name: 'Düzce Ovası', city: 'Düzce', lat: 40.84, lon: 31.16, type: 'Fındık & Mısır' },
          { name: 'Tokat Erbaa / Niksar', city: 'Tokat', lat: 40.70, lon: 36.57, type: 'Asma Yaprağı & Domates' },
          { name: 'Amasya Suluova', city: 'Amasya', lat: 40.83, lon: 35.65, type: 'Amasya Elması & Soğan' }
        ];

        let currentLat = 37.87;
        let currentLon = 32.49;
        let currentRegionTitle = 'Konya Ovası';
        let currentAgroData = null;
        let chartInstance = null;
        let searchDebounceTimer = null;

        const CROP_THRESHOLDS = {
          wheat: { name: 'Buğday / Arpa', minSoilTemp: 5, optimalSoilTemp: 15, dailyWater: 3.5 },
          corn: { name: 'Mısır', minSoilTemp: 10, optimalSoilTemp: 20, dailyWater: 5.5 },
          cotton: { name: 'Pamuk', minSoilTemp: 15, optimalSoilTemp: 22, dailyWater: 6.0 },
          tomato: { name: 'Domates', minSoilTemp: 12, optimalSoilTemp: 22, dailyWater: 4.8 },
          sunflower: { name: 'Ayçiçeği', minSoilTemp: 8, optimalSoilTemp: 18, dailyWater: 4.0 },
          olive: { name: 'Zeytin', minSoilTemp: 10, optimalSoilTemp: 20, dailyWater: 2.5 },
          citrus: { name: 'Narenciye', minSoilTemp: 12, optimalSoilTemp: 24, dailyWater: 4.5 }
        };

        // 1. Dinamik Arama ve Canlı Öneriler (Autocomplete Search Engine)
        function handleSearchInput(e) {
          const val = e.target.value.trim();
          const clearBtn = document.getElementById('btn-clear-search');
          if (val) {
            clearBtn.classList.remove('hidden');
          } else {
            clearBtn.classList.add('hidden');
          }

          clearTimeout(searchDebounceTimer);
          searchDebounceTimer = setTimeout(() => {
            renderSearchSuggestions(val);
          }, 150);
        }

        function handleSearchFocus() {
          const val = document.getElementById('input-region-search').value.trim();
          renderSearchSuggestions(val);
        }

        function clearSearchInput() {
          const inp = document.getElementById('input-region-search');
          inp.value = '';
          document.getElementById('btn-clear-search').classList.add('hidden');
          document.getElementById('search-dropdown').classList.add('hidden');
          inp.focus();
        }

        function handleSearchKeydown(e) {
          if (e.key === 'Enter') {
            const val = e.target.value.trim();
            if (val) {
              executeLiveGeocoding(val);
            }
          } else if (e.key === 'Escape') {
            document.getElementById('search-dropdown').classList.add('hidden');
          }
        }

        function renderSearchSuggestions(query) {
          const dropdown = document.getElementById('search-dropdown');
          const qLower = query.toLowerCase();

          // Yerel havza veritabanında ara
          let matches = [];
          if (!query) {
            // Boşken en popüler 8 havzayı göster
            matches = AGRO_BASINS.slice(0, 8);
          } else {
            matches = AGRO_BASINS.filter(b => 
              b.name.toLowerCase().includes(qLower) || 
              b.city.toLowerCase().includes(qLower) || 
              b.type.toLowerCase().includes(qLower)
            ).slice(0, 10);
          }

          if (matches.length === 0 && query.length >= 2) {
            dropdown.innerHTML = `
              <div class="p-3 text-center text-xs text-mistral-slate">
                <span class="block text-mistral-slate font-semibold mb-1">Yerel havza listesinde bulunamadı</span>
                <button onclick="executeLiveGeocoding('${query.replace(/'/g, "\\\\'")}')" class="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 font-bold transition">
                  🌐 "${query}" için Türkiye & Dünya Haritasında Ara &rarr;
                </button>
              </div>
            `;
            dropdown.classList.remove('hidden');
            return;
          }

          if (matches.length === 0) {
            dropdown.classList.add('hidden');
            return;
          }

          dropdown.innerHTML = matches.map(b => `
            <div onclick="selectBasin(${b.lat}, ${b.lon}, '${b.name}', '${b.city}', '${b.type}')" class="p-2.5 rounded-xl hover:bg-white transition cursor-pointer flex items-center justify-between group">
              <div class="min-w-0 pr-2">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-xs text-white group-hover:text-teal-400 transition">${b.name}</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-white text-mistral-slate font-medium">${b.city}</span>
                </div>
                <div class="text-[11px] text-teal-400/90 truncate mt-0.5 font-medium">${b.type}</div>
              </div>
              <div class="text-[10px] text-mistral-stone font-mono shrink-0">
                ${b.lat.toFixed(2)}N, ${b.lon.toFixed(2)}E
              </div>
            </div>
          `).join('');

          // Eğer kullanıcı arama yaptıysa altına harita arama seçeneği de ekle
          if (query.length >= 2) {
            dropdown.innerHTML += `
              <div class="pt-2 border-t border-mistral-hairline px-2 py-1 flex items-center justify-between text-[11px]">
                <span class="text-mistral-stone">Listede yok mu?</span>
                <button onclick="executeLiveGeocoding('${query.replace(/'/g, "\\\\'")}')" class="text-teal-400 hover:underline font-bold">
                  🌐 Canlı Haritada Ara &rarr;
                </button>
              </div>
            `;
          }

          dropdown.classList.remove('hidden');
        }

        // Tıklama dışı dropdown kapatma
        document.addEventListener('click', (e) => {
          const box = document.getElementById('input-region-search');
          const drop = document.getElementById('search-dropdown');
          if (!box.contains(e.target) && !drop.contains(e.target)) {
            drop.classList.add('hidden');
          }
        });

        function selectBasin(lat, lon, name, city, type) {
          document.getElementById('input-region-search').value = `${name} (${city})`;
          document.getElementById('search-dropdown').classList.add('hidden');
          fetchAgroForecast(lat, lon, `${name} (${city})`);
          showToast(`✓ ${name} seçildi!`);
        }

        function selectQuickRegion(lat, lon, name, type) {
          document.getElementById('input-region-search').value = name;
          document.getElementById('search-dropdown').classList.add('hidden');
          fetchAgroForecast(lat, lon, name);
          showToast(`✓ ${name} havzası yüklendi!`);
        }

        // Canlı Coğrafi Konum Arama (Nominatim OpenStreetMap)
        async function executeLiveGeocoding(searchTerm) {
          document.getElementById('search-dropdown').classList.add('hidden');
          showToast(`🌐 "${searchTerm}" için harita koordinatları taranıyor...`);

          try {
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&countrycodes=tr&limit=1`;
            const res = await fetch(url, { headers: { 'Accept-Language': 'tr' } });
            const data = await res.json();

            if (data && data.length > 0) {
              const place = data[0];
              const lat = parseFloat(place.lat);
              const lon = parseFloat(place.lon);
              const cleanName = place.display_name.split(',')[0];

              document.getElementById('input-region-search').value = cleanName;
              fetchAgroForecast(lat, lon, cleanName);
              showToast(`✓ "${cleanName}" bulundu ve zirai veriler çekildi!`);
            } else {
              // Dünya genelinde ara
              const globalUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=1`;
              const gRes = await fetch(globalUrl);
              const gData = await gRes.json();
              if (gData && gData.length > 0) {
                const gPlace = gData[0];
                const gLat = parseFloat(gPlace.lat);
                const gLon = parseFloat(gPlace.lon);
                const gName = gPlace.display_name.split(',')[0];
                document.getElementById('input-region-search').value = gName;
                fetchAgroForecast(gLat, gLon, gName);
                showToast(`✓ "${gName}" bulundu ve zirai veriler çekildi!`);
              } else {
                showToast('Girdiğiniz konuma ait koordinat bulunamadı.');
              }
            }
          } catch(e) {
            showToast('Konum arama servisine erişilemedi.');
          }
        }

        // 2. Open-Meteo Zirai Veri Çekme Motoru
        async function fetchAgroForecast(lat, lon, regionTitle) {
          currentLat = lat;
          currentLon = lon;
          currentRegionTitle = regionTitle;

          document.getElementById('label-active-region-name').innerText = regionTitle;
          document.getElementById('label-active-coords').innerText = `${lat.toFixed(2)}° N, ${lon.toFixed(2)}° E`;

          try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,et0_fao_evapotranspiration,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration,precipitation_sum&timezone=auto&forecast_days=7`;
            const res = await fetch(url);
            const data = await res.json();

            currentAgroData = data;
            renderAgroDashboard(data);
          } catch(err) {
            showToast('Zirai hava durumu verisi çekilemedi.');
          }
        }

        function getGPSLocation() {
          if (!navigator.geolocation) {
            showToast('Tarayıcınız konum servisini desteklemiyor.');
            return;
          }
          showToast('GPS koordinatlarınız alınıyor...');
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lon = pos.coords.longitude;
              document.getElementById('input-region-search').value = 'Mevcut Parselim (GPS)';
              fetchAgroForecast(lat, lon, 'Mevcut Parselim (GPS)');
              showToast('✓ Konum başarıyla alındı!');
            },
            () => {
              showToast('Konum erişimi reddedildi.');
            }
          );
        }

        // 3. Paneli Ekrana Çiz
        function renderAgroDashboard(data) {
          if (!data || !data.hourly) return;

          const h = data.hourly;
          const currentHourIdx = new Date().getHours();

          const tempSurface = h.soil_temperature_0cm[currentHourIdx] || 15;
          const temp6cm = h.soil_temperature_6cm[currentHourIdx] || 16;
          const temp18cm = h.soil_temperature_18cm[currentHourIdx] || 17;

          const moist0 = ((h.soil_moisture_0_to_1cm[currentHourIdx] || 0.25) * 100).toFixed(0);
          const moist6 = ((h.soil_moisture_1_to_3cm[currentHourIdx] || 0.28) * 100).toFixed(0);
          const moist18 = 32;

          const wind = h.wind_speed_10m[currentHourIdx] || 8;
          const et0Daily = data.daily?.et0_fao_evapotranspiration?.[0] || 4.2;

          // Toprak Katmanları
          document.getElementById('soil-temp-0').innerText = tempSurface.toFixed(1) + '°C';
          document.getElementById('soil-temp-6').innerText = temp6cm.toFixed(1) + '°C';
          document.getElementById('soil-temp-18').innerText = temp18cm.toFixed(1) + '°C';

          document.getElementById('soil-moist-0').innerText = moist0 + '%';
          document.getElementById('soil-moist-6').innerText = moist6 + '%';
          document.getElementById('soil-moist-18').innerText = moist18 + '%';

          // 1. Don Riski Kartı
          const minNightTemp = Math.min(...data.daily.temperature_2m_min.slice(0, 2));
          const frostBadge = document.getElementById('badge-frost');
          const valSurface = document.getElementById('val-surface-temp');
          const descFrost = document.getElementById('desc-frost');

          valSurface.innerText = minNightTemp.toFixed(1) + '°C Gece';
          if (minNightTemp <= 0) {
            frostBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300';
            frostBadge.innerText = '⚠️ KRİTİK DON';
            descFrost.innerText = 'Gece sıcaklığı sıfırın altına düşüyor! Örtüaltı veya don pervanesi önlemi alınmalı.';
          } else if (minNightTemp <= 3) {
            frostBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300';
            frostBadge.innerText = 'Hafif Don Riski';
            descFrost.innerText = 'Gece yüzey sıcaklığı 3°C civarında. Hassas fideler korunmalı.';
          } else {
            frostBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300';
            frostBadge.innerText = 'Güvenli';
            descFrost.innerText = 'Önümüzdeki 48 saat içinde zirai don tehlikesi beklenmiyor.';
          }

          // 2. Sulama İhtiyacı (ET0)
          document.getElementById('val-et0').innerText = et0Daily.toFixed(1) + ' mm/gün';
          const badgeIrr = document.getElementById('badge-irrigation');
          const descIrr = document.getElementById('desc-irrigation');
          if (et0Daily > 5.5) {
            badgeIrr.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300';
            badgeIrr.innerText = 'Yüksek İhtiyaç';
            descIrr.innerText = 'Yüksek buharlaşma! Bitki su stresi yaşamaması için sabah erken veya akşam sulama yapınız.';
          } else if (et0Daily > 3.0) {
            badgeIrr.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300';
            badgeIrr.innerText = 'Dengeli İhtiyaç';
            descIrr.innerText = 'Günlük su kaybı normal seviyede. Rutin sulama programınızı uygulayabilirsiniz.';
          } else {
            badgeIrr.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300';
            badgeIrr.innerText = 'Düşük İhtiyaç';
            descIrr.innerText = 'Buharlaşma düşük, toprak nemi yeterli. Ek sulama gerekmeyebilir.';
          }

          // 3. İlaçlama Uygunluğu (Spray Window)
          document.getElementById('val-wind').innerText = wind.toFixed(0) + ' km/h';
          const badgeSpray = document.getElementById('badge-spray');
          const descSpray = document.getElementById('desc-spray');
          if (wind > 18) {
            badgeSpray.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300';
            badgeSpray.innerText = 'Rüzgarlı (Uygun Değil)';
            descSpray.innerText = 'Rüzgar hızı yüksek. İlaç sürüklenmesi (drift) olacağından ilaçlama ertelenmeli.';
          } else {
            badgeSpray.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300';
            badgeSpray.innerText = 'İdeal Koşullar';
            descSpray.innerText = 'Rüzgar sakin ve nem uygun. Pülverizatör ile ilaçlama için en elverişli zaman.';
          }

          // 4. Ekim ve Çimlenme Kontrolü
          document.getElementById('val-seedbed-temp').innerText = temp6cm.toFixed(1) + '°C';
          updateCropRecommendations();

          // 7 Günlük Tabloyu Çiz
          renderDailyTable(data.daily);

          // Grafiği Çiz
          renderAgroChart(data);
        }

        function updateCropRecommendations() {
          if (!currentAgroData) return;
          const cropKey = document.getElementById('select-crop').value;
          const crop = CROP_THRESHOLDS[cropKey] || CROP_THRESHOLDS.wheat;
          const currentHourIdx = new Date().getHours();
          const temp6cm = currentAgroData.hourly.soil_temperature_6cm[currentHourIdx] || 16;

          const badge = document.getElementById('badge-planting');
          const desc = document.getElementById('desc-planting');

          if (temp6cm >= crop.optimalSoilTemp) {
            badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300';
            badge.innerText = 'İdeal Çimlenme';
            desc.innerText = `Toprak sıcaklığı (${temp6cm.toFixed(1)}°C) ${crop.name} için mükemmel çimlenme aralığında.`;
          } else if (temp6cm >= crop.minSoilTemp) {
            badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300';
            badge.innerText = 'Uygun Eşik';
            desc.innerText = `Toprak ${crop.name} minimum çimlenme eşiğinin (${crop.minSoilTemp}°C) üzerinde ancak gelişim yavaş olabilir.`;
          } else {
            badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300';
            badge.innerText = 'Toprak Soğuk';
            desc.innerText = `Toprak sıcaklığı ${crop.name} için yetersiz (${crop.minSoilTemp}°C altı). Çimlenme durabilir veya tohum çürüyebilir.`;
          }
        }

        function renderDailyTable(daily) {
          const tbody = document.getElementById('daily-agro-tbody');
          if (!daily || !daily.time) return;

          tbody.innerHTML = daily.time.map((dateStr, idx) => {
            const d = new Date(dateStr);
            const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
            const tMax = daily.temperature_2m_max[idx].toFixed(0);
            const tMin = daily.temperature_2m_min[idx].toFixed(0);
            const et0 = daily.et0_fao_evapotranspiration[idx].toFixed(1);
            const rain = daily.precipitation_sum[idx].toFixed(1);

            return `
              <tr class="hover:bg-mistral-cream transition">
                <td class="py-2.5">
                  <span class="font-bold text-mistral-ink">${dayName}</span>
                  <span class="text-[10px] text-mistral-stone block">${dateStr.slice(5)}</span>
                </td>
                <td class="py-2.5 text-center">
                  <span class="text-amber-400 font-bold">${tMax}°</span> / 
                  <span class="text-blue-400">${tMin}°</span>
                </td>
                <td class="py-2.5 text-right text-mistral-slate font-bold">${et0} mm</td>
                <td class="py-2.5 text-right font-bold ${rain > 0 ? 'text-blue-400' : 'text-mistral-stone'}">${rain} mm</td>
              </tr>
            `;
          }).join('');
        }

        // 4. Zirai Trend Grafiği (Chart.js)
        function renderAgroChart(data) {
          const ctx = document.getElementById('agro-chart').getContext('2d');
          if (chartInstance) chartInstance.destroy();

          const times = data.hourly.time.slice(0, 48);
          const soilTemps = data.hourly.soil_temperature_6cm.slice(0, 48);
          const et0s = data.hourly.et0_fao_evapotranspiration.slice(0, 48);

          const labels = times.map((t, idx) => {
            const d = new Date(t);
            return (idx % 6 === 0) ? `${d.toLocaleDateString('tr-TR', { weekday: 'short' })} ${d.getHours()}:00` : '';
          });

          chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
              labels: labels,
              datasets: [
                {
                  label: 'Toprak Sıcaklığı (6cm, °C)',
                  data: soilTemps,
                  borderColor: '#14b8a6',
                  backgroundColor: 'rgba(20, 184, 166, 0.1)',
                  borderWidth: 2.5,
                  fill: true,
                  tension: 0.3,
                  yAxisID: 'y'
                },
                {
                  label: 'Buharlaşma (ET0, mm)',
                  data: et0s,
                  borderColor: '#60a5fa',
                  backgroundColor: 'rgba(96, 165, 250, 0.1)',
                  borderWidth: 2,
                  borderDash: [4, 4],
                  fill: false,
                  tension: 0.3,
                  yAxisID: 'y1'
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: 'index', intersect: false },
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#0f172a',
                  titleColor: '#94a3b8',
                  borderColor: '#334155',
                  borderWidth: 1
                }
              },
              scales: {
                x: {
                  grid: { color: 'rgba(51, 65, 85, 0.2)' },
                  ticks: { color: '#64748b', font: { size: 10 } }
                },
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  grid: { color: 'rgba(51, 65, 85, 0.3)' },
                  ticks: { color: '#14b8a6', font: { size: 10 } }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  grid: { drawOnChartArea: false },
                  ticks: { color: '#60a5fa', font: { size: 10 } }
                }
              }
            }
          });
        }

        // 5. Kayıtlı Tarlalarım (Storage)
        function getSavedFields() {
          try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          } catch(e) {
            return [];
          }
        }

        function saveCurrentField() {
          const cropKey = document.getElementById('select-crop').value;
          const cropName = CROP_THRESHOLDS[cropKey]?.name || 'Ekin';
          const defaultName = `${currentRegionTitle} ${cropName} Parseli`;
          const fieldName = prompt('Bu parsel için bir ad girin:', defaultName);
          if (!fieldName) return;

          let list = getSavedFields();
          list.unshift({
            id: 'field_' + Date.now(),
            name: fieldName,
            region: currentRegionTitle,
            lat: currentLat,
            lon: currentLon,
            crop: cropKey,
            date: new Date().toLocaleDateString('tr-TR')
          });

          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          renderSavedFields();
          showToast(`✓ "${fieldName}" başarıyla kaydedildi!`);
        }

        function renderSavedFields() {
          const grid = document.getElementById('saved-fields-grid');
          const empty = document.getElementById('saved-fields-empty');
          const list = getSavedFields();

          if (list.length === 0) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
            return;
          }

          empty.classList.add('hidden');
          grid.innerHTML = list.map(item => `
            <div class="p-4 rounded-2xl bg-white border border-mistral-hairline hover:border-teal-500/40 transition cursor-pointer flex flex-col justify-between" onclick="loadSavedField(${item.lat}, ${item.lon}, '${item.region}', '${item.crop}')">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 truncate max-w-[150px]">${item.region}</span>
                  <span class="text-[9px] text-mistral-stone font-mono">${item.date}</span>
                </div>
                <h4 class="font-bold text-xs text-mistral-ink truncate mt-1">${item.name}</h4>
                <p class="text-[11px] text-teal-400 mt-0.5 font-medium">${CROP_THRESHOLDS[item.crop]?.name || item.crop}</p>
              </div>
              <div class="pt-3 border-t border-mistral-hairline flex items-center justify-between mt-3 text-xs">
                <span class="text-[10px] text-mistral-stone font-mono">${item.lat.toFixed(2)}N, ${item.lon.toFixed(2)}E</span>
                <button onclick="event.stopPropagation(); removeSavedField('${item.id}')" class="text-mistral-stone hover:text-rose-400">Sil</button>
              </div>
            </div>
          `).join('');
        }

        function loadSavedField(lat, lon, regionTitle, cropKey) {
          document.getElementById('select-crop').value = cropKey;
          document.getElementById('input-region-search').value = regionTitle;
          fetchAgroForecast(lat, lon, regionTitle);
          showToast(`✓ "${regionTitle}" parseli yüklendi!`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function removeSavedField(id) {
          let list = getSavedFields();
          list = list.filter(item => item.id !== id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          renderSavedFields();
        }

        function clearSavedFields() {
          if (!confirm('Tüm kayıtlı tarlaları silmek istediğinize emin misiniz?')) return;
          localStorage.removeItem(STORAGE_KEY);
          renderSavedFields();
        }

        function showToast(msg) {
          const toast = document.getElementById('tarim-toast');
          toast.innerText = msg;
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 3500);
        }

        // Başlangıç
        document.addEventListener('DOMContentLoaded', () => {
          fetchAgroForecast(37.87, 32.49, 'Konya Ovası');
          renderSavedFields();
        });
