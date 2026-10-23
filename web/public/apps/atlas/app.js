let allCountries = [];
let filteredCountries = [];
let currentAtlasPage = 1;
const COUNTRIES_PER_PAGE = 36;

async function loadAtlas() {
  try {
    const res = await fetch('/api/atlas/countries');
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    allCountries = data.countries || [];
    document.getElementById('countries-loading').classList.add('hidden');
    document.getElementById('countries-grid').classList.remove('hidden');
    filterCountries();
  } catch (err) {
    document.getElementById('countries-loading').innerHTML = '<span class="text-rose-500 font-medium text-sm">Ülkeler arşivi yüklenemedi.</span>';
  }
}

function filterCountries() {
  const q = (document.getElementById('atlas-search').value || '').trim().toLowerCase();
  const region = document.getElementById('atlas-region').value;
  const sort = document.getElementById('atlas-sort').value;

  let list = allCountries.filter(c => {
    const matchQ = !q ||
      (c.commonName || '').toLowerCase().includes(q) ||
      (c.officialName || '').toLowerCase().includes(q) ||
      (c.capital || '').toLowerCase().includes(q);
    const matchR = region === 'all' || c.region === region;
    return matchQ && matchR;
  });

  if (sort === 'pop-desc') list.sort((a, b) => b.population - a.population);
  else if (sort === 'pop-asc') list.sort((a, b) => a.population - b.population);
  else if (sort === 'area-desc') list.sort((a, b) => b.area - a.area);
  else list.sort((a, b) => a.commonName.localeCompare(b.commonName));

  filteredCountries = list;
  currentAtlasPage = 1;
  document.getElementById('atlas-total-count').innerText = list.length;
  renderGrid();
}

function goToAtlasPage(page) {
  const totalPages = Math.max(1, Math.ceil(filteredCountries.length / COUNTRIES_PER_PAGE));
  currentAtlasPage = Math.max(1, Math.min(totalPages, page));
  renderGrid();
  const grid = document.getElementById('countries-grid');
  if (grid) window.scrollTo({ top: Math.max(0, grid.offsetTop - 120), behavior: 'smooth' });
}

function renderGrid() {
  const grid = document.getElementById('countries-grid');
  let pager = document.getElementById('atlas-pagination');
  if (!pager && grid) {
    pager = document.createElement('div');
    pager.id = 'atlas-pagination';
    pager.className = 'mt-6 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-mistral-hairline shadow-2xs';
    grid.insertAdjacentElement('afterend', pager);
  }

  if (filteredCountries.length === 0) {
    grid.innerHTML = '<div class="col-span-full py-12 text-center text-mistral-slate text-sm">Arama kriterlerine uygun ülke bulunamadı.</div>';
    if (pager) pager.classList.add('hidden');
    return;
  }

  const totalPages = Math.ceil(filteredCountries.length / COUNTRIES_PER_PAGE);
  if (currentAtlasPage > totalPages) currentAtlasPage = totalPages;
  const startIdx = (currentAtlasPage - 1) * COUNTRIES_PER_PAGE;
  const pageItems = filteredCountries.slice(startIdx, startIdx + COUNTRIES_PER_PAGE);

  grid.innerHTML = pageItems.map(c => `
    <div onclick="openModal('${c.cca2}')" class="p-5 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-orange/40 hover:shadow-md transition duration-200 cursor-pointer group flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <img src="${c.flagSvg}" alt="${c.commonName}" loading="lazy" class="w-10 h-7 object-cover rounded border border-mistral-hairline shadow-2xs group-hover:scale-105 transition-transform duration-200">
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep">${c.region}</span>
        </div>
        <h3 class="text-base font-bold font-editorial text-mistral-ink group-hover:text-mistral-orange transition truncate">
          ${c.commonName}
        </h3>
        <p class="text-xs text-mistral-slate mt-0.5 truncate">Başkent: ${c.capital}</p>
      </div>

      <div class="mt-4 pt-3 border-t border-mistral-hairline flex items-center justify-between text-[11px] text-mistral-stone font-medium">
        <span>${Number(c.population).toLocaleString('tr-TR')}</span>
        <span class="text-mistral-orange font-semibold group-hover:translate-x-0.5 transition-transform">İncele &rarr;</span>
      </div>
    </div>
  `).join('');

  if (pager) {
    if (totalPages <= 1) {
      pager.classList.add('hidden');
    } else {
      pager.classList.remove('hidden');
      const endIdx = Math.min(filteredCountries.length, startIdx + COUNTRIES_PER_PAGE);
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentAtlasPage - 2 && i <= currentAtlasPage + 2)) {
          pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
          pages.push('...');
        }
      }
      const pageBtns = pages.map(p => {
        if (p === '...') return '<span class="px-2 text-xs text-mistral-stone">...</span>';
        const active = p === currentAtlasPage;
        return `<button type="button" onclick="goToAtlasPage(${p})" class="w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${active ? 'bg-mistral-orange text-white shadow-xs' : 'bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep'}">${p}</button>`;
      }).join('');

      pager.innerHTML = `
        <div class="text-xs text-mistral-slate">
          Toplam <strong class="text-mistral-ink">${filteredCountries.length}</strong> ülkeden <strong class="text-mistral-ink">${startIdx + 1}–${endIdx}</strong> arası gösteriliyor (Sayfa ${currentAtlasPage} / ${totalPages})
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" onclick="goToAtlasPage(${currentAtlasPage - 1})" ${currentAtlasPage === 1 ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-ink disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer">&larr; Önceki</button>
          ${pageBtns}
          <button type="button" onclick="goToAtlasPage(${currentAtlasPage + 1})" ${currentAtlasPage === totalPages ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-ink disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer">Sonraki &rarr;</button>
        </div>
      `;
    }
  }
}

function openModal(cca2) {
  const c = allCountries.find(x => x.cca2 === cca2);
  if (!c) return;

  document.getElementById('m-flag').src = c.flagSvg;
  document.getElementById('m-name').innerText = c.commonName;
  document.getElementById('m-official').innerText = c.officialName;
  document.getElementById('m-capital').innerText = c.capital;
  document.getElementById('m-population').innerText = Number(c.population).toLocaleString('tr-TR') + ' kişi';
  document.getElementById('m-region').innerText = `${c.region} (${c.subregion || '-'})`;
  document.getElementById('m-area').innerText = c.area ? Number(c.area).toLocaleString('tr-TR') + ' km²' : '-';
  document.getElementById('m-currency').innerText = c.currencies;
  document.getElementById('m-languages').innerText = c.languages;
  
  const borders = c.borders && c.borders.length > 0 ? c.borders.join(', ') : 'Ada veya sınır komşusu yok';
  document.getElementById('m-borders').innerText = borders;
  document.getElementById('m-maps').href = `https://www.google.com/maps/place/${encodeURIComponent(c.commonName)}`;

  document.getElementById('country-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('country-modal').classList.add('hidden');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

document.addEventListener('DOMContentLoaded', loadAtlas);
