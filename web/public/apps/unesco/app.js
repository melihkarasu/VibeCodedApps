let unescoMap = null;
        let allSites = [];
        let markers = [];

        function initMap() {
          unescoMap = L.map('unesco-map', {
            center: [38.5, 30],
            zoom: 4
          });

          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19
          }).addTo(unescoMap);
        }

        async function loadSites() {
          try {
            const res = await fetch('/api/unesco/sites');
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            allSites = data.sites || [];
            document.getElementById('unesco-count-badge').innerText = allSites.length;
            filterSites();
          } catch(err) {
            alert('Miras alanları yüklenemedi: ' + err.message);
          }
        }

        function filterSites() {
          const q = (document.getElementById('unesco-search').value || '').trim().toLowerCase();
          const cat = document.getElementById('unesco-category-select').value;

          const list = allSites.filter(s => {
            const matchQ = !q || s.name.toLowerCase().includes(q) || s.country.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
            const matchCat = cat === 'all' || s.category.includes(cat);
            return matchQ && matchCat;
          });

          renderGrid(list);
          renderMarkers(list);
        }

        function quickFilter(txt) {
          document.getElementById('unesco-search').value = txt;
          filterSites();
        }

        function renderGrid(list) {
          const grid = document.getElementById('sites-grid');
          if (list.length === 0) {
            grid.innerHTML = '<div class="col-span-full py-12 text-center text-mistral-stone font-medium text-sm">Arama kriterlerine uygun miras alanı bulunamadı.</div>';
            return;
          }

          grid.innerHTML = list.map(s => `
            <div onclick="focusSite(${s.lat}, ${s.lon})" class="rounded-xl bg-white border border-mistral-hairline hover:border-mistral-orange/40 hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer">
              <div>
                <div class="relative overflow-hidden aspect-video bg-mistral-cream">
                  <img src="${s.image}" alt="${s.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                  <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 backdrop-blur text-mistral-ink border border-mistral-hairline shadow-2xs">
                    ${s.year} Yılı
                  </span>
                </div>
                <div class="p-5">
                  <span class="text-[11px] font-semibold text-mistral-orange uppercase tracking-wider block mb-1">📍 ${s.country}</span>
                  <h3 class="text-xl font-bold font-editorial text-mistral-ink group-hover:text-mistral-orange transition mb-2">
                    ${s.name}
                  </h3>
                  <p class="text-xs text-mistral-slate line-clamp-3 leading-relaxed">
                    ${s.description}
                  </p>
                </div>
              </div>

              <div class="p-5 pt-0">
                <div class="pt-3 border-t border-mistral-hairline flex items-center justify-between text-xs font-semibold text-mistral-orange">
                  <span>Haritada Konumlan &rarr;</span>
                  <span class="px-2 py-0.5 rounded-full bg-mistral-cream border border-mistral-beige-deep text-[10px] text-mistral-ink font-normal">${s.category}</span>
                </div>
              </div>
            </div>
          `).join('');
        }

        function renderMarkers(list) {
          markers.forEach(m => m.remove());
          markers = [];

          if (list.length > 0) {
            const group = [];
            list.forEach(s => {
              const customIcon = L.divIcon({
                html: '<div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); transform: translate(-12px, -12px);">🏛️</div>',
                className: 'unesco-marker',
                iconSize: [24, 24]
              });

              const m = L.marker([s.lat, s.lon], { icon: customIcon })
                .addTo(unescoMap)
                .bindPopup(`<strong>${s.name}</strong><br><span style="font-size:11px;color:#666;">${s.country} (${s.year})</span><br><p style="font-size:11px;margin-top:4px;">${s.description.slice(0,100)}...</p>`);

              markers.push(m);
              group.push([s.lat, s.lon]);
            });

            if (group.length > 0) {
              unescoMap.fitBounds(group, { padding: [50, 50], maxZoom: 8 });
            }
          }
        }

        function focusSite(lat, lon) {
          if (unescoMap) {
            unescoMap.setView([lat, lon], 10, { animate: true });
            window.scrollTo({ top: 220, behavior: 'smooth' });
          }
        }

        document.addEventListener('DOMContentLoaded', () => {
          initMap();
          loadSites();
        });
