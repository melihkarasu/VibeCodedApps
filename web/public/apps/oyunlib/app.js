let allGamesList = [];
let currentGamePage = 1;
const GAMES_PER_PAGE = 24;

async function loadGames() {
  const grid = document.getElementById('games-grid');
  const loading = document.getElementById('games-loading');
  const q = (document.getElementById('game-search').value || '').trim();
  const genre = document.getElementById('game-genre').value;

  loading.classList.remove('hidden');
  grid.classList.add('hidden');

  try {
    const res = await fetch(`/api/oyun-lib/search?genre=${encodeURIComponent(genre)}&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    loading.classList.add('hidden');
    grid.classList.remove('hidden');

    allGamesList = data.games || [];
    currentGamePage = 1;
    document.getElementById('game-count-badge').innerText = allGamesList.length;
    renderGamesGrid();
  } catch (err) {
    loading.innerHTML = '<span class="text-rose-500 font-medium text-sm">Oyunlar alınamadı: ' + err.message + '</span>';
  }
}

function goToGamePage(page) {
  const totalPages = Math.max(1, Math.ceil(allGamesList.length / GAMES_PER_PAGE));
  currentGamePage = Math.max(1, Math.min(totalPages, page));
  renderGamesGrid();
  const grid = document.getElementById('games-grid');
  if (grid) window.scrollTo({ top: Math.max(0, grid.offsetTop - 120), behavior: 'smooth' });
}

function renderGamesGrid() {
  const grid = document.getElementById('games-grid');
  let pager = document.getElementById('games-pagination');
  if (!pager && grid) {
    pager = document.createElement('div');
    pager.id = 'games-pagination';
    pager.className = 'mt-6 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-mistral-hairline shadow-2xs';
    grid.insertAdjacentElement('afterend', pager);
  }

  if (allGamesList.length === 0) {
    grid.innerHTML = '<div class="col-span-full py-12 text-center text-mistral-slate text-sm font-medium">Aramanıza uygun oyun bulunamadı.</div>';
    if (pager) pager.classList.add('hidden');
    return;
  }

  const totalPages = Math.ceil(allGamesList.length / GAMES_PER_PAGE);
  if (currentGamePage > totalPages) currentGamePage = totalPages;
  const startIdx = (currentGamePage - 1) * GAMES_PER_PAGE;
  const pageItems = allGamesList.slice(startIdx, startIdx + GAMES_PER_PAGE);

  grid.innerHTML = pageItems.map(g => `
    <div class="rounded-xl bg-white border border-mistral-hairline hover:border-mistral-orange/40 hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between group">
      <div>
        <div class="relative overflow-hidden aspect-video bg-mistral-cream">
          <img src="${g.thumbnail}" alt="${g.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
          <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 backdrop-blur text-mistral-ink border border-mistral-hairline shadow-2xs">
            ${g.genre}
          </span>
        </div>
        <div class="p-4">
          <h3 class="text-base font-bold font-editorial text-mistral-ink group-hover:text-mistral-orange transition truncate mb-1">
            ${g.title}
          </h3>
          <p class="text-xs text-mistral-slate line-clamp-2 leading-relaxed mb-3">
            ${g.short_description || 'Açıklama mevcut değil.'}
          </p>
          <div class="flex items-center justify-between text-[11px] text-mistral-stone pt-2 border-t border-mistral-hairline">
            <span>${g.platform}</span>
            <span>${g.developer || ''}</span>
          </div>
        </div>
      </div>

      <div class="p-4 pt-0">
        <a href="${g.game_url}" target="_blank" rel="noopener" class="w-full py-2 px-3 rounded-md bg-mistral-cream-light hover:bg-mistral-orange hover:text-white font-bold border border-mistral-beige-deep text-mistral-ink text-xs font-semibold transition flex items-center justify-center gap-1.5">
          <span>Oyna & Sayfaya Git</span> &rarr;
        </a>
      </div>
    </div>
  `).join('');

  if (pager) {
    if (totalPages <= 1) {
      pager.classList.add('hidden');
    } else {
      pager.classList.remove('hidden');
      const endIdx = Math.min(allGamesList.length, startIdx + GAMES_PER_PAGE);
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentGamePage - 2 && i <= currentGamePage + 2)) {
          pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
          pages.push('...');
        }
      }
      const pageBtns = pages.map(p => {
        if (p === '...') return '<span class="px-2 text-xs text-mistral-stone">...</span>';
        const active = p === currentGamePage;
        return `<button type="button" onclick="goToGamePage(${p})" class="w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${active ? 'bg-mistral-orange text-white shadow-xs' : 'bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep'}">${p}</button>`;
      }).join('');

      pager.innerHTML = `
        <div class="text-xs text-mistral-slate">
          Toplam <strong class="text-mistral-ink">${allGamesList.length}</strong> oyundan <strong class="text-mistral-ink">${startIdx + 1}–${endIdx}</strong> arası gösteriliyor (Sayfa ${currentGamePage} / ${totalPages})
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <button type="button" onclick="goToGamePage(${currentGamePage - 1})" ${currentGamePage === 1 ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-ink disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer">&larr; Önceki</button>
          ${pageBtns}
          <button type="button" onclick="goToGamePage(${currentGamePage + 1})" ${currentGamePage === totalPages ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-ink disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer">Sonraki &rarr;</button>
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', loadGames);
