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

            const games = data.games || [];
            document.getElementById('game-count-badge').innerText = games.length;

            if (games.length === 0) {
              grid.innerHTML = '<div class="col-span-full py-12 text-center text-mistral-slate text-sm font-medium">Aramanıza uygun oyun bulunamadı.</div>';
              return;
            }

            grid.innerHTML = games.map(g => `
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
                      <span>💻 ${g.platform}</span>
                      <span>${g.developer || ''}</span>
                    </div>
                  </div>
                </div>

                <div class="p-4 pt-0">
                  <a href="${g.game_url}" target="_blank" rel="noopener" class="w-full py-2 px-3 rounded-md bg-mistral-cream-light hover:bg-mistral-orange hover:text-mistral-ink font-bold border border-mistral-beige-deep text-mistral-ink text-xs font-semibold transition flex items-center justify-center gap-1.5">
                    <span>Oyna & Sayfaya Git</span> &rarr;
                  </a>
                </div>
              </div>
            `).join('');
          } catch(err) {
            loading.innerHTML = '<span class="text-rose-500 font-medium text-sm">Oyunlar alınamadı: ' + err.message + '</span>';
          }
        }

        document.addEventListener('DOMContentLoaded', loadGames);
