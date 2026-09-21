const SHELF_KEY = '***';
        let currentRecordings = [];
        let activeSoundUrl = null;
        let visualizerAnimId = null;
        let quizTargetBird = null;

        // Dahili Öne Çıkan Seçkin Doğa Arşivi (Yüksek Kaliteli Fallback)
        const FEATURED_BIRDS = [
          {
            id: 'b1',
            commonName: 'Bülbül',
            sciName: 'Luscinia megarhynchos',
            place: 'İzmir / Ege Havzası',
            photo: 'https://images.unsplash.com/photo-1555169062-013468b47731?w=500&auto=format&fit=crop&q=80',
            soundUrl: 'https://static.inaturalist.org/sounds/2144945.mp3?1788433104'
          },
          {
            id: 'b2',
            commonName: 'Peçeli Baykuş',
            sciName: 'Tyto alba',
            place: 'Konya Ovası / Bozkır',
            photo: 'https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?w=500&auto=format&fit=crop&q=80',
            soundUrl: 'https://static.inaturalist.org/sounds/2147075.mp3?1788594539'
          },
          {
            id: 'b3',
            commonName: 'Saka Kuşu',
            sciName: 'Carduelis carduelis',
            place: 'Bursa / Uludağ Etekleri',
            photo: 'https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=500&auto=format&fit=crop&q=80',
            soundUrl: 'https://static.inaturalist.org/sounds/2139224.mp3?1788031807'
          },
          {
            id: 'b4',
            commonName: 'Kızılgerdan',
            sciName: 'Erithacus rubecula',
            place: 'Bolu / Yedigöller Ormanı',
            photo: 'https://images.unsplash.com/photo-1574063413132-355dbfd83e12?w=500&auto=format&fit=crop&q=80',
            soundUrl: 'https://static.inaturalist.org/sounds/2144782.m4a?1788414083'
          },
          {
            id: 'b5',
            commonName: 'Gökdoğan',
            sciName: 'Falco peregrinus',
            place: 'Antalya / Toros Dağları',
            photo: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=500&auto=format&fit=crop&q=80',
            soundUrl: 'https://static.inaturalist.org/sounds/2145903.wav?1788503461'
          },
          {
            id: 'b6',
            commonName: 'Flamingo',
            sciName: 'Phoenicopterus roseus',
            place: 'İzmir / Gediz Deltası Kuş Cenneti',
            photo: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=500&auto=format&fit=crop&q=80',
            soundUrl: 'https://static.inaturalist.org/sounds/2147868.wav?1788650541'
          }
        ];

        // 1. Veri Arama & Çekme
        async function fetchBirdSounds(query = 'Luscinia megarhynchos', title = 'Bülbül') {
          showLoading(true);
          document.getElementById('results-headline').innerText = `"${title}" Kayıtları`;

          try {
            const res = await fetch(`/api/doga/sounds?q=${encodeURIComponent(query)}`);
            const data = await res.json();

            if (data && data.results && data.results.length > 0) {
              currentRecordings = data.results;
              renderBirdCards(data.results);
            } else {
              // Fallback
              currentRecordings = FEATURED_BIRDS;
              renderBirdCards(FEATURED_BIRDS);
            }
          } catch(e) {
            currentRecordings = FEATURED_BIRDS;
            renderBirdCards(FEATURED_BIRDS);
          } finally {
            showLoading(false);
          }
        }

        function quickSearchBird(name, sci) {
          document.getElementById('input-bird-search').value = name;
          fetchBirdSounds(sci || name, name);
        }

        function executeBirdSearch() {
          const q = document.getElementById('input-bird-search').value.trim();
          if (!q) return;
          fetchBirdSounds(q, q);
        }

        function showLoading(show) {
          const spin = document.getElementById('loading-spinner');
          const grid = document.getElementById('birds-grid');
          if (show) {
            spin.classList.remove('hidden');
            grid.innerHTML = '';
            document.getElementById('results-count').innerText = 'Aranıyor...';
          } else {
            spin.classList.add('hidden');
          }
        }

        // 2. Kartları Ekrana Çiz
        function renderBirdCards(list) {
          const grid = document.getElementById('birds-grid');
          document.getElementById('results-count').innerText = `${list.length} ses kaydı listelendi`;

          grid.innerHTML = list.map((b, idx) => `
            <div class="bird-card p-4 rounded-3xl bg-white border border-mistral-hairline hover:border-emerald-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between group">
              <div>
                <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-white shadow">
                  <img src="${b.photo}" alt="${b.commonName}" loading="lazy" class="bird-img w-full h-full object-cover transition-transform duration-500">
                  <button onclick="playBirdSound('${b.soundUrl}', '${b.commonName.replace(/'/g, "\\\\'")}', '${b.sciName.replace(/'/g, "\\\\'")}', '${b.place.replace(/'/g, "\\\\'")}', '${b.photo}')" class="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center transition">
                    <span class="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-xl transform group-hover:scale-110 transition">
                      ▶
                    </span>
                  </button>
                </div>

                <h3 class="font-bold text-sm text-mistral-ink group-hover:text-emerald-400 transition truncate">${b.commonName}</h3>
                <p class="text-xs text-emerald-400/90 font-mono italic truncate mt-0.5">${b.sciName}</p>
                <p class="text-[11px] text-mistral-slate truncate mt-1">📍 ${b.place}</p>
              </div>

              <div class="pt-3 border-t border-mistral-hairline flex items-center justify-between mt-3 text-xs">
                <button onclick="playBirdSound('${b.soundUrl}', '${b.commonName.replace(/'/g, "\\\\'")}', '${b.sciName.replace(/'/g, "\\\\'")}', '${b.place.replace(/'/g, "\\\\'")}', '${b.photo}')" class="text-emerald-400 hover:underline font-bold">
                  Sesi Çal &rarr;
                </button>
                <button onclick="saveToNatureShelf('${b.commonName.replace(/'/g, "\\\\'")}', '${b.sciName.replace(/'/g, "\\\\'")}', '${b.place.replace(/'/g, "\\\\'")}', '${b.photo}', '${b.soundUrl}')" class="p-1.5 text-mistral-slate hover:text-amber-400 transition" title="Doğa Defterime Kaydet">
                  🔖
                </button>
              </div>
            </div>
          `).join('');
        }

        // 3. Ses Çalma & Bioakustik Spektrum Visualizer (AudioContext Bağımsız Güvenli Oynatıcı)
        function playBirdSound(url, name, sci, place, photo) {
          activeSoundUrl = url;
          const audio = document.getElementById('audio-element');
          if (!audio) return;

          // Hata dinleyicisi
          audio.onerror = () => {
            console.warn('Ses kaynağı yüklenemedi:', audio.src);
            document.getElementById('player-badge-type').innerText = 'Hata';
            document.getElementById('btn-master-play').innerText = '▶';
            showToast('⚠️ Ses dosyası yüklenemedi veya format desteklenmiyor.');
          };

          audio.src = url;

          document.getElementById('player-bird-name').innerText = name;
          document.getElementById('player-bird-sci').innerText = sci;
          document.getElementById('player-bird-place').innerText = place;
          document.getElementById('player-bird-img').src = photo;
          document.getElementById('player-badge-type').innerText = 'Çalıyor';
          document.getElementById('btn-master-play').innerText = '⏸';
          document.getElementById('visualizer-idle-text').classList.add('hidden');

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.warn('Ses oynatma hatası:', err);
              document.getElementById('player-badge-type').innerText = 'Durduruldu';
              document.getElementById('btn-master-play').innerText = '▶';
              showToast('Tarayıcı ses oynatmayı engelledi, lütfen tekrar tıklayın.');
            });
          }

          startVisualizer();
          showToast(`🎵 Çalıyor: ${name}`);
        }

        function toggleAudioPlay() {
          const audio = document.getElementById('audio-element');
          const btn = document.getElementById('btn-master-play');
          if (!audio) return;

          if (audio.paused) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch(err => {
                console.warn('Ses oynatma hatası:', err);
                showToast('Ses başlatılamadı.');
              });
            }
            btn.innerText = '⏸';
            document.getElementById('player-badge-type').innerText = 'Çalıyor';
            document.getElementById('visualizer-idle-text').classList.add('hidden');
            startVisualizer();
          } else {
            audio.pause();
            btn.innerText = '▶';
            document.getElementById('player-badge-type').innerText = 'Duraklatıldı';
          }
        }

        function updateAudioProgress() {
          const audio = document.getElementById('audio-element');
          const cur = Math.floor(audio.currentTime);
          const dur = Math.floor(audio.duration) || 0;

          const formatT = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
          document.getElementById('player-cur-time').innerText = formatT(cur);
          if (dur > 0) document.getElementById('player-dur-time').innerText = formatT(dur);
        }

        function onAudioEnded() {
          document.getElementById('btn-master-play').innerText = '▶';
          document.getElementById('player-badge-type').innerText = 'Tamamlandı';
          const idleText = document.getElementById('visualizer-idle-text');
          if (idleText) idleText.classList.remove('hidden');
        }

        function startVisualizer() {
          const audio = document.getElementById('audio-element');
          const canvas = document.getElementById('visualizer-canvas');
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = canvas.offsetWidth || 600;
          canvas.height = canvas.offsetHeight || 96;

          const barCount = 36;
          let phase = 0;

          if (visualizerAnimId) {
            cancelAnimationFrame(visualizerAnimId);
            visualizerAnimId = null;
          }

          function draw() {
            if (audio.paused || audio.ended) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              const idleText = document.getElementById('visualizer-idle-text');
              if (idleText) idleText.classList.remove('hidden');
              visualizerAnimId = null;
              return;
            }

            const idleText = document.getElementById('visualizer-idle-text');
            if (idleText) idleText.classList.add('hidden');

            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            phase += 0.08;
            const barWidth = canvas.width / barCount;

            for (let i = 0; i < barCount; i++) {
              // Kuş biyoakustik frekans dalgalarını modelleyen harmonik simülasyon
              const wave1 = Math.sin(phase * 1.6 + i * 0.35);
              const wave2 = Math.cos(phase * 2.4 + i * 0.2);
              const wave3 = Math.sin(phase * 3.8 + i * 0.65);
              const chirp = (Math.sin(phase * 5.2 + i * 1.1) > 0.6) ? 0.3 : 0;

              let norm = Math.abs(wave1 * 0.45 + wave2 * 0.35 + wave3 * 0.2) + chirp;
              norm = Math.min(1, Math.max(0.08, norm));

              const barHeight = norm * canvas.height * 0.85;
              const x = i * barWidth;
              const y = canvas.height - barHeight;

              const grad = ctx.createLinearGradient(0, canvas.height, 0, y);
              grad.addColorStop(0, '#10b981');
              grad.addColorStop(1, '#06b6d4');

              ctx.fillStyle = grad;
              ctx.fillRect(x + 1, y, Math.max(2, barWidth - 3), barHeight);
            }

            visualizerAnimId = requestAnimationFrame(draw);
          }

          draw();
        }

        // 4. "Kuş Sesini Tanı!" Mini Quiz
        function startBirdQuiz() {
          const randomIndex = Math.floor(Math.random() * FEATURED_BIRDS.length);
          quizTargetBird = FEATURED_BIRDS[randomIndex];

          // 3 sahte seçenek + 1 doğru seçenek
          const others = FEATURED_BIRDS.filter(b => b.id !== quizTargetBird.id).sort(() => Math.random() - 0.5).slice(0, 3);
          const options = [...others, quizTargetBird].sort(() => Math.random() - 0.5);

          document.getElementById('quiz-feedback').innerText = '';
          const container = document.getElementById('quiz-options-container');

          container.innerHTML = options.map(opt => `
            <button onclick="handleQuizAnswer('${opt.id}')" id="q-opt-${opt.id}" class="p-3 rounded-2xl bg-white border border-mistral-hairline hover:border-emerald-400 text-xs font-bold text-white transition text-center">
              ${opt.commonName}
            </button>
          `).join('');

          playQuizAudio();
        }

        function playQuizAudio() {
          if (!quizTargetBird) {
            startBirdQuiz();
            return;
          }
          const audio = document.getElementById('audio-element');
          if (!audio) return;

          audio.src = quizTargetBird.soundUrl;
          document.getElementById('player-bird-name').innerText = '??? (Kuş Sesini Tanı)';
          document.getElementById('player-bird-sci').innerText = 'Hangi kuş olduğunu tahmin edin!';
          document.getElementById('player-bird-place').innerText = quizTargetBird.place;
          document.getElementById('player-bird-img').src = 'https://images.unsplash.com/photo-1555169062-013468b47731?w=500&auto=format&fit=crop&q=80';
          document.getElementById('player-badge-type').innerText = 'Quiz Sesi';
          document.getElementById('btn-master-play').innerText = '⏸';
          document.getElementById('visualizer-idle-text').classList.add('hidden');

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.warn('Quiz ses oynatma hatası:', err);
              showToast('Tarayıcı ses oynatmayı engelledi, lütfen butona tekrar tıklayın.');
            });
          }
          startVisualizer();
          showToast('🎵 Quiz sesi çalıyor...');
        }

        function handleQuizAnswer(selectedId) {
          if (!quizTargetBird) return;
          const isCorrect = (selectedId === quizTargetBird.id);
          const btn = document.getElementById('q-opt-' + selectedId);
          const fb = document.getElementById('quiz-feedback');

          if (isCorrect) {
            btn.className = 'p-3 rounded-2xl bg-emerald-600 border border-emerald-400 text-xs font-bold text-white transition text-center';
            fb.innerText = `🎉 TEBRİKLER! Doğru bildiniz: ${quizTargetBird.commonName}`;
            fb.className = 'text-xs font-bold text-emerald-400';
            showToast('✓ Harika bir doğa kulağı!');
          } else {
            btn.className = 'p-3 rounded-2xl bg-rose-600 border border-rose-400 text-xs font-bold text-white transition text-center';
            fb.innerText = `Yanlış! Doğru cevap: ${quizTargetBird.commonName}`;
            fb.className = 'text-xs font-bold text-rose-400';
          }
        }

        // 5. Doğa Defterim (LocalStorage & SSO)
        function getNatureShelf() {
          try {
            return JSON.parse(localStorage.getItem(SHELF_KEY) || '[]');
          } catch(e) {
            return [];
          }
        }

        function saveToNatureShelf(commonName, sciName, place, photo, soundUrl) {
          let shelf = getNatureShelf();
          if (shelf.some(b => b.commonName === commonName)) {
            showToast('Bu kuş sesi zaten defterinizde kayıtlı.');
            return;
          }

          shelf.unshift({
            id: 'sh_' + Date.now(),
            commonName,
            sciName,
            place,
            photo,
            soundUrl,
            date: new Date().toLocaleDateString('tr-TR')
          });

          localStorage.setItem(SHELF_KEY, JSON.stringify(shelf));
          renderNatureShelf();
          showToast(`✓ "${commonName}" doğa defterinize eklendi!`);
        }

        function renderNatureShelf() {
          const grid = document.getElementById('nature-shelf-grid');
          const empty = document.getElementById('nature-shelf-empty');
          const shelf = getNatureShelf();

          if (shelf.length === 0) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
            return;
          }

          empty.classList.add('hidden');
          grid.innerHTML = shelf.map(b => `
            <div class="p-3 rounded-2xl bg-white border border-mistral-hairline hover:border-emerald-500/40 transition flex items-center gap-3">
              <img src="${b.photo}" class="w-12 h-12 rounded-xl object-cover shrink-0 cursor-pointer shadow" onclick="playBirdSound('${b.soundUrl}', '${b.commonName}', '${b.sciName}', '${b.place}', '${b.photo}')">
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-xs text-mistral-ink truncate cursor-pointer hover:text-emerald-400" onclick="playBirdSound('${b.soundUrl}', '${b.commonName}', '${b.sciName}', '${b.place}', '${b.photo}')">${b.commonName}</h4>
                <p class="text-[10px] text-emerald-400/90 font-mono italic truncate">${b.sciName}</p>
                <span class="text-[9px] text-mistral-stone">${b.date}</span>
              </div>
              <button onclick="removeFromNatureShelf('${b.id}')" class="text-xs text-mistral-stone hover:text-rose-400 p-1 transition" title="Sil">
                ✕
              </button>
            </div>
          `).join('');
        }

        function removeFromNatureShelf(id) {
          let shelf = getNatureShelf();
          shelf = shelf.filter(b => b.id !== id);
          localStorage.setItem(SHELF_KEY, JSON.stringify(shelf));
          renderNatureShelf();
        }

        function clearSavedNature() {
          if (!confirm('Doğa defterinizdeki tüm kayıtları silmek istediğinize emin misiniz?')) return;
          localStorage.removeItem(SHELF_KEY);
          renderNatureShelf();
        }

        function showToast(msg) {
          const toast = document.getElementById('doga-toast');
          toast.innerText = msg;
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 3500);
        }

        document.addEventListener('DOMContentLoaded', () => {
          fetchBirdSounds('Luscinia megarhynchos', 'Bülbül');
          renderNatureShelf();
          startBirdQuiz();
        });
