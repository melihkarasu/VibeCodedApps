let currentStations = [];
        let activeStation = null;
        const audio = document.getElementById('audio-stream');

        async function loadStations() {
          const loading = document.getElementById('radio-loading');
          const grid = document.getElementById('stations-grid');
          const country = document.getElementById('radio-country').value;
          const tag = document.getElementById('radio-tag').value;
          const q = (document.getElementById('radio-search').value || '').trim();

          loading.classList.remove('hidden');
          grid.classList.add('hidden');

          try {
            const url = `/api/radio/stations?country=${encodeURIComponent(country)}&tag=${encodeURIComponent(tag)}&q=${encodeURIComponent(q)}`;
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) throw new Error(data.error);

            currentStations = data.stations || [];
            document.getElementById('radio-station-count').innerText = currentStations.length + ' Canlı İstasyon';

            loading.classList.add('hidden');
            grid.classList.remove('hidden');

            renderStations(currentStations);
          } catch(err) {
            loading.innerHTML = '<span class="text-rose-500 font-medium text-sm">İstasyonlar yüklenemedi: ' + err.message + '</span>';
          }
        }

        function renderStations(list) {
          const grid = document.getElementById('stations-grid');
          if (list.length === 0) {
            grid.innerHTML = '<div class="col-span-full py-12 text-center text-mistral-slate text-sm font-medium">Bu filtreye uygun radyo istasyonu bulunamadı.</div>';
            return;
          }

          grid.innerHTML = list.map(s => {
            const isPlayingThis = activeStation && activeStation.id === s.id;
            return `
              <div class="p-4 rounded-xl bg-white border ${isPlayingThis ? 'border-mistral-orange shadow-sm bg-mistral-cream-light/40' : 'border-mistral-hairline'} hover:border-mistral-orange/40 hover:shadow-sm transition flex flex-col justify-between group">
                <div>
                  <div class="flex items-center gap-3 mb-3">
                    <img 
                      src="${s.favicon}" 
                      alt="${s.name}" 
                      onerror="this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80'"
                      class="w-10 h-10 rounded-lg object-contain bg-mistral-cream p-1 border border-mistral-hairline shrink-0">
                    <div class="min-w-0">
                      <h4 class="font-bold text-sm font-editorial text-mistral-ink truncate group-hover:text-mistral-orange transition">${s.name}</h4>
                      <span class="text-[10px] text-mistral-stone block truncate">${s.country || 'Global'} ${s.bitrate ? '• ' + s.bitrate + ' kbps' : ''}</span>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-1 mb-4">
                    ${(s.tags || []).map(t => `<span class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-mistral-cream border border-mistral-beige-deep text-mistral-ink">${t}</span>`).join('')}
                  </div>
                </div>

                <div class="pt-2 border-t border-mistral-hairline flex items-center justify-between gap-2">
                  <button 
                    onclick="playStation('${s.id}')" 
                    class="flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${isPlayingThis ? 'bg-mistral-orange text-white' : 'text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep'}">
                    <span>${isPlayingThis ? '⏸ Durdur' : '▶ Canlı Dinle'}</span>
                  </button>
                </div>
              </div>
            `;
          }).join('');
        }

        function playStation(id) {
          const s = currentStations.find(x => x.id === id);
          if (!s) return;

          if (activeStation && activeStation.id === s.id && !audio.paused) {
            audio.pause();
            updatePlayerUI(false);
            return;
          }

          activeStation = s;
          audio.src = s.url;
          audio.play().then(() => {
            updatePlayerUI(true);
          }).catch(err => {
            alert('Bu istasyon şu anda canlı yayın vermiyor veya format desteklenmiyor.');
            updatePlayerUI(false);
          });
        }

        function togglePlayPause() {
          if (!activeStation) {
            if (currentStations.length > 0) playStation(currentStations[0].id);
            return;
          }

          if (audio.paused) {
            audio.play().then(() => updatePlayerUI(true));
          } else {
            audio.pause();
            updatePlayerUI(false);
          }
        }

        function updatePlayerUI(isPlaying) {
          const status = document.getElementById('player-status');
          const title = document.getElementById('player-title');
          const country = document.getElementById('player-country');
          const logo = document.getElementById('player-logo');
          const playIcon = document.getElementById('play-icon');
          const eqBars = document.getElementById('equalizer-bars');

          if (activeStation) {
            title.innerText = activeStation.name;
            country.innerText = (activeStation.country || 'Global Yayın') + (activeStation.bitrate ? ' • ' + activeStation.bitrate + ' kbps HD Stream' : '');
            if (activeStation.favicon) logo.src = activeStation.favicon;
          }

          if (isPlaying) {
            status.innerText = 'CANLI YAYINDA';
            status.className = 'text-[10px] font-bold text-emerald-600 uppercase tracking-wider block';
            playIcon.innerText = '⏸';
            eqBars.classList.remove('hidden');
            eqBars.classList.add('flex');
          } else {
            status.innerText = 'DURAKLATILDI';
            status.className = 'text-[10px] font-bold text-mistral-orange uppercase tracking-wider block';
            playIcon.innerText = '▶';
            eqBars.classList.add('hidden');
            eqBars.classList.remove('flex');
          }

          renderStations(currentStations);
        }

        function changeVolume(val) {
          audio.volume = parseFloat(val);
        }

        audio.addEventListener('error', () => {
          updatePlayerUI(false);
        });

        document.addEventListener('DOMContentLoaded', loadStations);
