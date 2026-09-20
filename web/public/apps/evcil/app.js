let allBreeds = [];

        async function loadBreeds() {
          try {
            const res = await fetch('/api/pets/breeds');
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            allBreeds = data.breeds || [];
            document.getElementById('pets-loading').classList.add('hidden');
            document.getElementById('pets-grid').classList.remove('hidden');

            filterBreeds();
          } catch(err) {
            document.getElementById('pets-loading').innerHTML = '<span class="text-rose-500 font-medium text-sm">Irklar yüklenemedi: ' + err.message + '</span>';
          }
        }

        function filterBreeds() {
          const q = (document.getElementById('pet-search').value || '').trim().toLowerCase();
          const type = document.getElementById('pet-type-select').value;

          const list = allBreeds.filter(b => {
            const matchType = type === 'all' || b.petType === type;
            const matchQ = !q || b.name.toLowerCase().includes(q) || (b.temperament || '').toLowerCase().includes(q) || (b.origin || '').toLowerCase().includes(q);
            return matchType && matchQ;
          });

          document.getElementById('pet-count-badge').innerText = list.length;
          renderGrid(list);
        }

        function setTemperamentFilter(t) {
          document.getElementById('pet-search').value = t;
          filterBreeds();
        }

        function renderGrid(list) {
          const grid = document.getElementById('pets-grid');
          if (list.length === 0) {
            grid.innerHTML = '<div class="col-span-full py-12 text-center text-mistral-stone font-medium text-sm">Kriterlere uygun evcil dost bulunamadı.</div>';
            return;
          }

          grid.innerHTML = list.map(b => `
            <div onclick="openPetModal('${b.id}')" class="rounded-xl bg-white border border-mistral-hairline hover:border-mistral-orange/40 hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer">
              <div>
                <div class="relative overflow-hidden aspect-video bg-mistral-cream">
                  <img src="${b.image}" alt="${b.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                  <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 backdrop-blur text-mistral-ink border border-mistral-hairline shadow-2xs">
                    ${b.petType === 'cat' ? '🐱 Kedi' : '🐶 Köpek'}
                  </span>
                </div>
                <div class="p-4">
                  <h3 class="text-base font-bold font-editorial text-mistral-ink group-hover:text-mistral-orange transition truncate mb-0.5">
                    ${b.name}
                  </h3>
                  <span class="text-[11px] text-mistral-stone block mb-2">📍 ${b.origin}</span>
                  <p class="text-xs text-mistral-slate line-clamp-2 leading-relaxed">
                    ${b.temperament || b.description || 'Sevimli ve dost canlısı.'}
                  </p>
                </div>
              </div>

              <div class="p-4 pt-0">
                <div class="pt-2 border-t border-mistral-hairline flex items-center justify-between text-[11px] font-semibold text-mistral-orange">
                  <span>Detayları İncele &rarr;</span>
                  <span class="text-mistral-stone font-normal text-[10px]">⏳ ${b.lifeSpan}</span>
                </div>
              </div>
            </div>
          `).join('');
        }

        function openPetModal(id) {
          const b = allBreeds.find(x => x.id === id);
          if (!b) return;

          document.getElementById('m-pet-img').src = b.image;
          document.getElementById('m-pet-type').innerText = b.petType === 'cat' ? '🐱 KEDİ IRKI' : '🐶 KÖPEK IRKI';
          document.getElementById('m-pet-origin').innerText = '📍 ' + b.origin;
          document.getElementById('m-pet-name').innerText = b.name;
          document.getElementById('m-pet-desc').innerText = b.description || b.temperament || 'Özel ırk açıklaması bulunmuyor.';
          document.getElementById('m-pet-life').innerText = b.lifeSpan;
          document.getElementById('m-pet-friendly').innerText = `⭐ ${b.childFriendly}/5`;
          document.getElementById('m-pet-energy').innerText = `⚡ ${b.energyLevel}/5`;

          const tBox = document.getElementById('m-pet-temperament');
          const tags = (b.temperament || '').split(',').map(x => x.trim()).filter(Boolean);
          tBox.innerHTML = tags.map(t => `
            <span class="px-2 py-0.5 rounded-full bg-mistral-cream border border-mistral-beige-deep text-mistral-ink font-medium">${t}</span>
          `).join('');

          document.getElementById('pet-modal').classList.remove('hidden');
        }

        function closePetModal() {
          document.getElementById('pet-modal').classList.add('hidden');
        }

        document.addEventListener('DOMContentLoaded', loadBreeds);
