let allBreeds = [];
let filteredBreeds = [];
let currentPetPage = 1;
const PETS_PER_PAGE = 24;

async function loadBreeds() {
  try {
    const res = await fetch('/api/pets/breeds');
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    allBreeds = data.breeds || [];
    document.getElementById('pets-loading').classList.add('hidden');
    document.getElementById('pets-grid').classList.remove('hidden');

    filterBreeds();
  } catch (err) {
    document.getElementById('pets-loading').innerHTML = '<span class="text-rose-500 font-medium text-sm">Irklar yüklenemedi: ' + err.message + '</span>';
  }
}

function filterBreeds() {
  const q = (document.getElementById('pet-search').value || '').trim().toLowerCase();
  const type = document.getElementById('pet-type-select').value;

  filteredBreeds = allBreeds.filter(b => {
    const matchType = type === 'all' || b.petType === type;
    const matchQ = !q ||
      (b.name || '').toLowerCase().includes(q) ||
      (b.temperament || '').toLowerCase().includes(q) ||
      (b.origin || '').toLowerCase().includes(q) ||
      (b.description || '').toLowerCase().includes(q);
    return matchType && matchQ;
  });

  currentPetPage = 1;
  document.getElementById('pet-count-badge').innerText = filteredBreeds.length;
  renderGrid();
}

function setTemperamentFilter(t) {
  document.getElementById('pet-search').value = t;
  filterBreeds();
}

function goToPetPage(page) {
  const totalPages = Math.max(1, Math.ceil(filteredBreeds.length / PETS_PER_PAGE));
  currentPetPage = Math.max(1, Math.min(totalPages, page));
  renderGrid();
  const grid = document.getElementById('pets-grid');
  if (grid) {
    window.scrollTo({ top: Math.max(0, grid.offsetTop - 120), behavior: 'smooth' });
  }
}

function renderGrid() {
  const grid = document.getElementById('pets-grid');
  let pager = document.getElementById('pets-pagination');
  if (!pager && grid) {
    pager = document.createElement('div');
    pager.id = 'pets-pagination';
    pager.className = 'mb-16 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-mistral-hairline shadow-2xs';
    grid.insertAdjacentElement('afterend', pager);
  }

  if (filteredBreeds.length === 0) {
    grid.innerHTML = '<div class="col-span-full py-12 text-center text-mistral-stone font-medium text-sm">Kriterlere uygun evcil dost bulunamadı.</div>';
    if (pager) pager.classList.add('hidden');
    return;
  }

  const totalPages = Math.ceil(filteredBreeds.length / PETS_PER_PAGE);
  if (currentPetPage > totalPages) currentPetPage = totalPages;
  const startIdx = (currentPetPage - 1) * PETS_PER_PAGE;
  const pageItems = filteredBreeds.slice(startIdx, startIdx + PETS_PER_PAGE);

  grid.innerHTML = pageItems.map(b => {
    const fallbackImg = b.petType === 'cat'
      ? 'https://cdn2.thecatapi.com/images/0XYvRd7oD.jpg'
      : 'https://cdn2.thedogapi.com/images/BJa4kxc4X.jpg';
    return `
      <div onclick="openPetModal('${b.id}')" class="rounded-xl bg-white border border-mistral-hairline hover:border-mistral-orange/40 hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer">
        <div>
          <div class="relative overflow-hidden aspect-video bg-mistral-cream">
            <img src="${b.image}" alt="${b.name}" loading="lazy" onerror="if(this.src.endsWith('.jpg')&&!this.dataset.pngTried){this.dataset.pngTried='1';this.src=this.src.slice(0,-4)+'.png';}else{this.src='${fallbackImg}';}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 backdrop-blur text-mistral-ink border border-mistral-hairline shadow-2xs">
              ${b.petType === 'cat' ? 'Kedi' : 'Köpek'}
            </span>
          </div>
          <div class="p-4">
            <h3 class="text-base font-bold font-editorial text-mistral-ink group-hover:text-mistral-orange transition truncate mb-0.5">
              ${b.name}
            </h3>
            <span class="text-[11px] text-mistral-stone block mb-2">${b.origin}</span>
            <p class="text-xs text-mistral-slate line-clamp-2 leading-relaxed">
              ${b.temperament || b.description || 'Sevimli ve dost canlısı.'}
            </p>
          </div>
        </div>

        <div class="p-4 pt-0">
          <div class="pt-2 border-t border-mistral-hairline flex items-center justify-between text-[11px] font-semibold text-mistral-orange">
            <span>Detayları İncele &rarr;</span>
            <span class="text-mistral-stone font-normal text-[10px]">${b.lifeSpan}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (pager) {
    if (totalPages <= 1) {
      pager.classList.add('hidden');
    } else {
      pager.classList.remove('hidden');
      const endIdx = Math.min(filteredBreeds.length, startIdx + PETS_PER_PAGE);
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPetPage - 2 && i <= currentPetPage + 2)) {
          pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
          pages.push('...');
        }
      }
      const pageBtns = pages.map(p => {
        if (p === '...') return '<span class="px-2 text-xs text-mistral-stone">...</span>';
        const active = p === currentPetPage;
        return `<button type="button" onclick="goToPetPage(${p})" class="w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${active ? 'bg-mistral-orange text-white shadow-xs' : 'bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep'}">${p}</button>`;
      }).join('');

      pager.innerHTML = `
        <div class="text-xs text-mistral-slate">
          Toplam <strong class="text-mistral-ink">${filteredBreeds.length}</strong> ırktan <strong class="text-mistral-ink">${startIdx + 1}–${endIdx}</strong> arası gösteriliyor (Sayfa ${currentPetPage} / ${totalPages})
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" onclick="goToPetPage(${currentPetPage - 1})" ${currentPetPage === 1 ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-ink disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer">&larr; Önceki</button>
          ${pageBtns}
          <button type="button" onclick="goToPetPage(${currentPetPage + 1})" ${currentPetPage === totalPages ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-ink disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer">Sonraki &rarr;</button>
        </div>
      `;
    }
  }
}

function openPetModal(id) {
  const b = allBreeds.find(x => x.id === id);
  if (!b) return;

  const fallbackImg = b.petType === 'cat'
    ? 'https://cdn2.thecatapi.com/images/0XYvRd7oD.jpg'
    : 'https://cdn2.thedogapi.com/images/BJa4kxc4X.jpg';
  const mImg = document.getElementById('m-pet-img');
  delete mImg.dataset.pngTried;
  mImg.onerror = function() {
    if (this.src.endsWith('.jpg') && !this.dataset.pngTried) {
      this.dataset.pngTried = '1';
      this.src = this.src.slice(0, -4) + '.png';
    } else {
      this.src = fallbackImg;
    }
  };
  mImg.src = b.image;
  document.getElementById('m-pet-type').innerText = b.petType === 'cat' ? 'KEDİ IRKI' : 'KÖPEK IRKI';
  document.getElementById('m-pet-origin').innerText = '' + b.origin;
  document.getElementById('m-pet-name').innerText = b.name;
  document.getElementById('m-pet-desc').innerText = b.description || b.temperament || 'Özel ırk açıklaması bulunmuyor.';
  document.getElementById('m-pet-life').innerText = b.lifeSpan;
  document.getElementById('m-pet-friendly').innerText = `${b.childFriendly}/5`;
  document.getElementById('m-pet-energy').innerText = `${b.energyLevel}/5`;

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

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePetModal();
});

document.addEventListener('DOMContentLoaded', loadBreeds);
