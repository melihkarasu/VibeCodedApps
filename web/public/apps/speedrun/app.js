async function loadSpeedrunRecords() {
          const loading = document.getElementById('speedrun-loading');
          const grid = document.getElementById('speedrun-grid');

          try {
            const res = await fetch('/api/speedrun/records');
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            loading.classList.add('hidden');
            grid.classList.remove('hidden');

            const records = data.records || [];
            grid.innerHTML = records.map(r => `
              <div class="rounded-xl bg-white border border-mistral-hairline hover:border-mistral-orange/40 hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between group">
                <div>
                  <div class="relative overflow-hidden aspect-video bg-mistral-cream">
                    <img src="${r.cover}" alt="${r.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 backdrop-blur text-mistral-ink border border-mistral-hairline shadow-2xs">
                      ${r.platform}
                    </span>
                  </div>

                  <div class="p-5 space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-mistral-orange uppercase tracking-wider">${r.category}</span>
                      <span class="text-[10px] text-mistral-stone">${r.releaseYear}</span>
                    </div>

                    <h3 class="text-xl font-bold font-editorial text-mistral-ink group-hover:text-mistral-orange transition truncate">
                      ${r.name}
                    </h3>

                    <!-- Rekor Süresi Kartı -->
                    <div class="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                      <div>
                        <span class="text-[10px] text-amber-800 uppercase font-semibold block">DÜNYA REKORU (WR)</span>
                        <strong class="text-base font-bold font-editorial text-mistral-ink">${r.recordTime}</strong>
                      </div>
                      <span class="text-2xl">👑</span>
                    </div>

                    <p class="text-xs text-mistral-slate pt-1">
                      Rekor Sahibi: <strong class="text-mistral-ink font-mono">${r.holder}</strong>
                    </p>
                  </div>
                </div>

                <div class="p-5 pt-0">
                  <a href="${r.speedrunUrl}" target="_blank" rel="noopener" class="w-full py-2 px-3 rounded-md bg-mistral-cream-light hover:bg-mistral-orange hover:text-mistral-ink font-bold border border-mistral-beige-deep text-mistral-ink text-xs font-semibold transition flex items-center justify-center gap-1.5">
                    <span>Liderlik Tablosunu Gör</span> &rarr;
                  </a>
                </div>
              </div>
            `).join('');

          } catch(err) {
            loading.innerHTML = '<span class="text-rose-500 font-medium text-sm">Rekorlar yüklenemedi: ' + err.message + '</span>';
          }
        }

        document.addEventListener('DOMContentLoaded', loadSpeedrunRecords);
