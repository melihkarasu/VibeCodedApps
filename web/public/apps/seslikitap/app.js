let currentBooks = [];
        let activeBook = null;
        let currentTrackIndex = 0;
        let isSeeking = false;
        const player = document.getElementById('audiobook-player');
        // 7. Dinleme İlerlemesi (Veritabanı — user_audio_progress tablosu)
        // Kullanıcı kimliği sunucu tarafında vibe_token çerezinden çözülür (getUserIdFromReq).
        // Kural: monorepoda localStorage kullanılmaz; ilerleme yalnızca veritabanında tutulur.
        async function saveProgress() {
          if (!activeBook || !activeBook.id) return;
          try {
            const res = await fetch('/api/seslikitap/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                bookId: String(activeBook.id),
                trackIndex: currentTrackIndex,
                positionSec: Math.floor(player.currentTime || 0),
                bookTitle: activeBook.title,
                authors: activeBook.authors
              })
            });
            if (res.ok) {
              const data = await res.json().catch(() => null);
              if (data && data.saved) upsertLibraryEntry(); // Kitaplığım görünümünü tazele
            }
          } catch(e) {}
        }

        // Kaldığı yeri getir (veritabanı)
        async function getSavedProgress(bookId) {
          try {
            const res = await fetch('/api/seslikitap/progress?bookId=' + encodeURIComponent(bookId), { credentials: 'include' });
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.progress) {
                return { trackIndex: data.progress.trackIndex, positionSec: data.progress.positionSec, source: 'db' };
              }
            }
          } catch(e) {}
          return null;
        }

        // ===== KİTAPLIĞIM (dinlenen kitapların listesi ve yönetimi — veritabanı) =====
        let libraryCache = [];
        let libraryAuthenticated = false;

        function escapeHtml(s) {
          return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        }

        async function loadMyLibrary() {
          try {
            const res = await fetch('/api/seslikitap/library', { credentials: 'include' });
            if (res.ok) {
              const data = await res.json();
              if (data.success && Array.isArray(data.library)) {
                libraryCache = data.library;
                libraryAuthenticated = !!data.authenticated;
              }
            }
          } catch(e) {}
          renderMyLibrary();
        }

        // saveProgress başarılı olduğunda önbelleği yerinde güncelle (yeniden fetch yok)
        function upsertLibraryEntry() {
          if (!libraryAuthenticated || !activeBook || !activeBook.id) return;
          const patch = {
            bookId: activeBook.id,
            trackIndex: currentTrackIndex,
            positionSec: Math.floor(player.currentTime || 0),
            bookTitle: activeBook.title,
            authors: activeBook.authors,
            updatedAt: new Date().toISOString()
          };
          const entry = libraryCache.find(x => x.bookId === activeBook.id);
          if (entry) {
            // en üste taşı (son dinlenen önce)
            libraryCache = libraryCache.filter(x => x.bookId !== activeBook.id);
            libraryCache.unshift(Object.assign(entry, patch));
          } else {
            libraryCache.unshift(patch);
          }
          renderMyLibrary();
        }

        function renderMyLibrary() {
          const section = document.getElementById('my-library-section');
          const grid = document.getElementById('my-library-grid');
          const count = document.getElementById('my-library-count');
          if (!section || !grid || !count) return;

          if (!libraryAuthenticated || libraryCache.length === 0) {
            section.classList.add('hidden');
            grid.innerHTML = '';
            return;
          }
          section.classList.remove('hidden');
          count.innerText = String(libraryCache.length);

          grid.innerHTML = libraryCache.map((p, idx) => {
            const trackNo = (p.trackIndex || 0) + 1;
            const pos = formatTime(p.positionSec || 0);
            const when = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('tr-TR') : '';
            const isPlaying = activeBook && activeBook.id === p.bookId;
            return `
            <div class="p-4 rounded-xl bg-white border ${isPlaying ? 'border-mistral-orange/40' : 'border-mistral-hairline hover:border-mistral-orange/40'} hover:shadow-md transition duration-200 flex flex-col justify-between gap-3">
              <div>
                <div class="flex items-center justify-between gap-2 mb-1">
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep">🔖 Bölüm ${trackNo}</span>
                  <span class="text-[10px] text-mistral-stone">${escapeHtml(pos)}</span>
                </div>
                <h3 class="text-sm font-bold text-mistral-ink leading-snug mb-0.5">${escapeHtml(p.bookTitle || p.bookId)}</h3>
                <span class="text-xs text-mistral-slate block truncate">✍️ ${escapeHtml(p.authors || 'Bilinmiyor')}</span>
                ${when ? `<span class="text-[10px] text-mistral-stone block mt-1">Son dinlenme: ${when}</span>` : ''}
              </div>
              <div class="pt-2 border-t border-mistral-hairline flex items-center justify-between gap-2">
                <button onclick="resumeFromLibrary(${idx})" class="px-3 py-1.5 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs font-semibold transition">▶ Devam Et</button>
                <button onclick="removeFromLibrary(${idx})" class="text-xs text-rose-500 hover:text-rose-600 hover:underline transition">Kaldır</button>
              </div>
            </div>`;
          }).join('');
        }

        async function resumeFromLibrary(idx) {
          const p = libraryCache[idx];
          if (!p) return;
          let b = currentBooks.find(x => x.id === p.bookId);
          if (!b) {
            b = {
              id: p.bookId,
              title: p.bookTitle || 'Başlıksız Eser',
              authors: p.authors || 'Bilinmiyor',
              description: '',
              downloads: 0,
              language: 'English',
              detailsUrl: 'https://archive.org/details/' + p.bookId,
              tracks: null
            };
            currentBooks.unshift(b);
          }
          await selectAndPlayBook(b, true);
        }

        async function removeFromLibrary(idx) {
          const p = libraryCache[idx];
          if (!p) return;
          if (!confirm('"' + (p.bookTitle || p.bookId) + '" kitaplığından kaldırılsın mı?')) return;
          try {
            const res = await fetch('/api/seslikitap/progress?bookId=' + encodeURIComponent(p.bookId), { method: 'DELETE', credentials: 'include' });
            if (res.ok) {
              libraryCache.splice(idx, 1);
              renderMyLibrary();
            }
          } catch(e) {}
        }

        function formatTime(sec) {
          const s = Math.max(0, Math.floor(sec || 0));
          const h = Math.floor(s / 3600);
          const m = Math.floor((s % 3600) / 60);
          const r = s % 60;
          if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
          return m + ':' + String(r).padStart(2, '0');
        }

        async function loadAudiobooks() {
          const loading = document.getElementById('books-loading');
          const grid = document.getElementById('books-grid');
          const q = (document.getElementById('search-book').value || '').trim();

          loading.classList.remove('hidden');
          grid.classList.add('hidden');

          try {
            // archive.org librivoxaudio koleksiyonu (CORS-open, LibriVox kayıtları)
            let query = 'collection:librivoxaudio AND mediatype:audio';
            if (q) {
              query += ' AND (title:(' + q + ') OR creator:(' + q + '))';
            } else {
              query += ' AND (title:(sherlock) OR title:(dracula) OR title:(frankenstein) OR title:(alice) OR title:(monte cristo))';
            }

            const url = 'https://archive.org/advancedsearch.php?q=' + encodeURIComponent(query) +
              '&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=creator&fl%5B%5D=description&fl%5B%5D=downloads&fl%5B%5D=language' +
              '&rows=24&output=json&sort%5B%5D=downloads+desc';

            const res = await fetch(url);
            if (!res.ok) throw new Error('Arşiv servisi yanıt vermedi (HTTP ' + res.status + ')');
            const data = await res.json();
            const docs = (data.response && data.response.docs) || [];

            currentBooks = docs.map(d => ({
              id: d.identifier,
              title: stripHtml(d.title) || 'Başlıksız Eser',
              authors: formatCreator(d.creator),
              description: stripHtml(d.description).slice(0, 300) || 'Açıklama bulunmuyor.',
              downloads: Number(d.downloads) || 0,
              language: Array.isArray(d.language) ? d.language[0] : (d.language || 'English'),
              detailsUrl: 'https://archive.org/details/' + d.identifier,
              tracks: null
            }));

            document.getElementById('audio-books-count').innerText = currentBooks.length + ' Sesli Kitap';

            loading.classList.add('hidden');
            grid.classList.remove('hidden');

            renderBooks(currentBooks);
          } catch(err) {
            console.error('loadAudiobooks error:', err);
            loading.innerHTML = '<span class="text-rose-500 font-medium text-sm">Sesli kitaplar yüklenemedi: ' + err.message + '</span>';
          }
        }

        function stripHtml(s) {
          return String(s || '').replace(/<[^>]+>/g, '').trim();
        }

        function formatCreator(creator) {
          if (Array.isArray(creator)) return creator.join(', ') || 'Bilinmiyor';
          return String(creator || 'Bilinmiyor');
        }

        function quickSearch(title) {
          document.getElementById('search-book').value = title;
          loadAudiobooks();
        }

        function renderBooks(list) {
          const grid = document.getElementById('books-grid');
          if (list.length === 0) {
            grid.innerHTML = '<div class="col-span-full py-12 text-center text-mistral-stone font-medium text-sm">Aramanıza uygun sesli kitap bulunamadı.</div>';
            return;
          }

          grid.innerHTML = list.map((b, idx) => `
            <div class="p-6 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-orange/40 hover:shadow-md transition duration-200 flex flex-col justify-between group">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="text-2xl">🎧</span>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep">
                    ⬇️ ${(b.downloads || 0).toLocaleString('tr-TR')} dinlenme
                  </span>
                </div>
                <h3 class="text-lg font-bold font-editorial text-mistral-ink group-hover:text-mistral-orange transition truncate mb-1">
                  ${b.title}
                </h3>
                <span class="text-xs font-semibold text-mistral-slate block mb-2">✍️ ${b.authors}</span>
                <p class="text-xs text-mistral-slate line-clamp-3 leading-relaxed mb-4">
                  ${b.description}
                </p>
              </div>

              <div class="pt-3 border-t border-mistral-hairline flex items-center justify-center gap-2">
                <button 
                  onclick="selectAndPlayBookByIdx(${idx})"
                  class="w-full py-2.5 px-3 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>▶</span> Dinle
                </button>
              </div>
            </div>
          `).join('');
        }

        function selectAndPlayBookByIdx(idx) {
          const b = currentBooks[idx];
          if (b) selectAndPlayBook(b);
        }

        // Metadata endpoint'ten MP3 bölüm listesini çek ve çalmaya başla
        async function selectAndPlayBook(b, autoResume) {
          activeBook = b;
          document.getElementById('dock-status').innerText = 'SESLİ KİTAP SEÇİLDİ';
          document.getElementById('dock-title').innerText = b.title;
          document.getElementById('dock-author').innerText = b.authors + (b.downloads ? ' • ⬇️ ' + b.downloads.toLocaleString('tr-TR') : '');

          window.scrollTo({ top: 100, behavior: 'smooth' });

          if (!b.tracks) {
            try {
              const res = await fetch('https://archive.org/metadata/' + encodeURIComponent(b.id));
              if (!res.ok) throw new Error('Bölüm verileri alınamadı');
              const data = await res.json();
              const files = data.files || [];
              const mp3s = files.filter(f => f.name && f.name.toLowerCase().endsWith('.mp3'));
              const preferred = mp3s.filter(f => f.name.includes('64kb'));
              const chosen = preferred.length > 0 ? preferred : mp3s;

              b.tracks = chosen.map(f => ({
                title: stripHtml(f.title || f.name).replace(/\.mp3$/i, ''),
                length: f.length || '',
                url: 'https://archive.org/download/' + b.id + '/' + encodeURI(f.name)
              }));
              b.totalTime = formatDuration(b.tracks.reduce((sum, t) => sum + parseLength(t.length), 0));
            } catch(e) {
              console.error('metadata error:', e);
              b.tracks = [];
            }
          }

          if (b.tracks.length === 0) {
            document.getElementById('dock-status').innerText = 'SES DOSYASI BULUNAMADI';
            document.getElementById('dock-author').innerText = b.authors + ' • Bu eser için ses dosyası bulunamadı';
            return;
          }

          document.getElementById('dock-author').innerText = b.authors + ' • Toplam Süre: ' + (b.totalTime || 'Belirtilmemiş');

          // Tam oynatıcı panelini göster ve bölüm listesini çiz
          const panel = document.getElementById('player-panel');
          if (panel) panel.classList.remove('hidden');
          renderTrackList();
          updateTrackButtons();

          // Kaldığım yerden devam (veritabanı; Kitaplığım'daki "Devam Et"ten gelinirse onaysız)
          const saved = await getSavedProgress(b.id);
          if (saved && (saved.trackIndex > 0 || saved.positionSec > 15)) {
            const tIdx = Math.min(saved.trackIndex || 0, b.tracks.length - 1);
            if (autoResume) {
              playTrack(tIdx, saved.positionSec);
              return;
            }
            const src = saved.source === 'db' ? 'hesabınızdan' : 'cihazınızdan';
            const resume = confirm('Bu kitabı daha önce dinlemiştiniz (' + src + '):\n\nBölüm ' + (tIdx + 1) + ', ' + formatTime(saved.positionSec) + ' pozisyonundan devam edilsin mi?\n\n(Tamam = Kaldığım yerden devam / İptal = Baştan başla)');
            if (resume) {
              playTrack(tIdx, saved.positionSec);
              return;
            }
          }

          playTrack(0);
        }

        function playTrack(i, startSec = 0) {
          if (!activeBook || !activeBook.tracks || activeBook.tracks.length === 0) return;
          if (i < 0 || i >= activeBook.tracks.length) {
            stopPlayback();
            return;
          }
          currentTrackIndex = i;
          const t = activeBook.tracks[i];

          player.src = t.url;
          if (startSec > 0) {
            player.currentTime = startSec;
          }
          player.play().catch(err => {
            console.error('play error:', err);
            // Otomatik oynatma engellendiyse: hazır durumda bırak, kullanıcı Oynat'a bassın
            document.getElementById('dock-status').innerText = 'OYNATMAYA HAZIR';
            const panelPlay = document.getElementById('btn-panel-play');
            if (panelPlay) panelPlay.innerText = '▶';
          });

          document.getElementById('dock-play-icon').innerText = '⏸';
          document.getElementById('dock-play-text').innerText = 'Duraklat';
          document.getElementById('dock-status').innerText = 'ŞİMDİ ÇALIYOR';
          document.getElementById('dock-author').innerText = activeBook.authors +
            ' • Bölüm ' + (i + 1) + '/' + activeBook.tracks.length +
            (t.length ? ' • ' + t.length : '');

          const panelPlay = document.getElementById('btn-panel-play');
          if (panelPlay) panelPlay.innerText = '⏸';

          updateTrackProgressLabel();
          renderTrackList();
          updateTrackButtons();
          saveProgress();
          updateMediaSession();
        }

        function toggleAudioPlay() {
          if (!activeBook) {
            if (currentBooks.length > 0) selectAndPlayBook(currentBooks[0]);
            return;
          }

          if (!player.src) {
            selectAndPlayBook(activeBook);
            return;
          }

          if (player.paused) {
            player.play().catch(err => {
              console.error('play error:', err);
              document.getElementById('dock-status').innerText = 'OYNATMA HAZIR';
              const panelPlay = document.getElementById('btn-panel-play');
              if (panelPlay) panelPlay.innerText = '▶';
            });
          } else {
            player.pause();
          }
        }

        function stopPlayback() {
          saveProgress();
          player.pause();
          player.removeAttribute('src');
          currentTrackIndex = 0;
          document.getElementById('dock-play-icon').innerText = '▶';
          document.getElementById('dock-play-text').innerText = 'Oynat';
          const panelPlay = document.getElementById('btn-panel-play');
          if (panelPlay) panelPlay.innerText = '▶';
        }

        // ===== TAM OYNATICI KONTROLLERİ =====
        function seekTo(value) {
          if (!player.duration || isNaN(player.duration)) return;
          isSeeking = true;
          player.currentTime = (value / 1000) * player.duration;
          document.getElementById('time-current').innerText = formatTime(player.currentTime);
          setTimeout(() => { isSeeking = false; }, 200);
        }

        function skipForward() {
          if (player.duration) {
            player.currentTime = Math.min(player.duration - 1, player.currentTime + 10);
            saveProgress();
          }
        }

        function skipBackward() {
          player.currentTime = Math.max(0, player.currentTime - 10);
          saveProgress();
        }

        function prevTrack() {
          if (currentTrackIndex > 0) {
            playTrack(currentTrackIndex - 1);
          } else if (player.duration) {
            player.currentTime = 0;
          }
        }

        function nextTrack() {
          if (activeBook && activeBook.tracks && currentTrackIndex + 1 < activeBook.tracks.length) {
            playTrack(currentTrackIndex + 1);
          }
        }

        function setPlaybackRate(rate) {
          player.playbackRate = parseFloat(rate) || 1;
        }

        function setVolume(v) {
          player.volume = Math.min(1, Math.max(0, parseFloat(v)));
          if (player.volume > 0 && player.muted) {
            player.muted = false;
            updateMuteIcon();
          }
        }

        function toggleMute() {
          player.muted = !player.muted;
          updateMuteIcon();
        }

        function updateMuteIcon() {
          const btn = document.getElementById('btn-mute');
          if (btn) btn.innerText = (player.muted || player.volume === 0) ? '🔇' : '🔊';
        }

        function renderTrackList() {
          const box = document.getElementById('track-list');
          if (!box || !activeBook || !activeBook.tracks) return;

          document.getElementById('track-count').innerText = activeBook.tracks.length;

          box.innerHTML = activeBook.tracks.map((t, idx) => {
            const active = (idx === currentTrackIndex);
            return `
              <div onclick="playTrack(${idx})" class="p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition ${active ? 'bg-orange-50 border border-orange-300' : 'bg-mistral-cream-light hover:bg-mistral-cream border border-mistral-hairline'}">
                <div class="flex items-center gap-2 truncate">
                  <span class="${active ? 'text-orange-600 font-bold' : 'text-mistral-stone'}">${active ? '▶' : (idx + 1)}</span>
                  <span class="font-medium text-mistral-ink truncate">${t.title}</span>
                </div>
                <span class="text-mistral-slate font-mono text-[10px] shrink-0">${t.length || ''}</span>
              </div>
            `;
          }).join('');
        }

        function updateTrackButtons() {
          const prevBtn = document.getElementById('btn-prev-track');
          const nextBtn = document.getElementById('btn-next-track');
          if (prevBtn) {
            prevBtn.disabled = currentTrackIndex <= 0;
            prevBtn.style.opacity = currentTrackIndex <= 0 ? '0.4' : '1';
          }
          if (nextBtn && activeBook && activeBook.tracks) {
            nextBtn.disabled = currentTrackIndex + 1 >= activeBook.tracks.length;
            nextBtn.style.opacity = currentTrackIndex + 1 >= activeBook.tracks.length ? '0.4' : '1';
          }
        }

        function updateTrackProgressLabel() {
          const label = document.getElementById('track-progress-label');
          if (label && activeBook && activeBook.tracks) {
            label.innerText = 'Bölüm ' + (currentTrackIndex + 1) + '/' + activeBook.tracks.length;
          }
        }

        function parseLength(len) {
          if (!len) return 0;
          const s = String(len);
          if (s.includes(':')) {
            const parts = s.split(':').map(p => parseInt(p, 10) || 0);
            if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
            if (parts.length === 2) return parts[0] * 60 + parts[1];
            return 0;
          }
          return parseFloat(s) || 0;
        }

        function formatDuration(totalSec) {
          if (!totalSec || totalSec <= 0) return '';
          const hrs = Math.floor(totalSec / 3600);
          const mins = Math.round((totalSec % 3600) / 60);
          if (hrs > 0) return hrs + ' saat ' + mins + ' dk';
          return mins + ' dk';
        }

        function updateMediaSession() {
          if (!('mediaSession' in navigator) || !activeBook) return;
          try {
            const t = activeBook.tracks && activeBook.tracks[currentTrackIndex];
            navigator.mediaSession.metadata = new MediaMetadata({
              title: t ? t.title : activeBook.title,
              artist: activeBook.authors,
              album: activeBook.title
            });
            navigator.mediaSession.setActionHandler('play', () => player.play());
            navigator.mediaSession.setActionHandler('pause', () => player.pause());
            navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
            navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
            navigator.mediaSession.setActionHandler('seekbackward', () => skipBackward());
            navigator.mediaSession.setActionHandler('seekforward', () => skipForward());
          } catch(e) {}
        }

        // Audio olay dinleyicileri
        player.addEventListener('timeupdate', () => {
          if (isSeeking || !player.duration || isNaN(player.duration)) return;

          const pct = (player.currentTime / player.duration) * 1000;
          const seekBar = document.getElementById('seek-bar');
          if (seekBar) seekBar.value = Math.round(pct);

          const tCur = document.getElementById('time-current');
          const tTot = document.getElementById('time-total');
          if (tCur) tCur.innerText = formatTime(player.currentTime);
          if (tTot) tTot.innerText = formatTime(player.duration);

          if (Math.floor(player.currentTime) % 5 === 0) {
            saveProgress();
          }
        });

        player.addEventListener('loadedmetadata', () => {
          const tTot = document.getElementById('time-total');
          if (tTot) tTot.innerText = formatTime(player.duration);
          updateMediaSession();
        });

        player.addEventListener('play', () => {
          document.getElementById('dock-play-icon').innerText = '⏸';
          document.getElementById('dock-play-text').innerText = 'Duraklat';
          document.getElementById('dock-status').innerText = 'ŞİMDİ ÇALIYOR';
          const panelPlay = document.getElementById('btn-panel-play');
          if (panelPlay) panelPlay.innerText = '⏸';
        });

        player.addEventListener('pause', () => {
          if (!player.ended) {
            document.getElementById('dock-play-icon').innerText = '▶';
            document.getElementById('dock-play-text').innerText = 'Devam Et';
            document.getElementById('dock-status').innerText = 'DURAKLATILDI';
            const panelPlay = document.getElementById('btn-panel-play');
            if (panelPlay) panelPlay.innerText = '▶';
            saveProgress();
          }
        });

        player.addEventListener('ended', () => {
          if (activeBook && activeBook.tracks && currentTrackIndex + 1 < activeBook.tracks.length) {
            playTrack(currentTrackIndex + 1);
          } else {
            document.getElementById('dock-play-icon').innerText = '▶';
            document.getElementById('dock-play-text').innerText = 'Oynat';
            document.getElementById('dock-status').innerText = 'TAMAMLANDI';
            const panelPlay = document.getElementById('btn-panel-play');
            if (panelPlay) panelPlay.innerText = '▶';
            saveProgress();
          }
        });

        window.addEventListener('beforeunload', () => saveProgress());

        document.addEventListener('DOMContentLoaded', () => {
          loadAudiobooks();
          loadMyLibrary();
        });

        // Window globals for inline onclicks
        window.loadAudiobooks = loadAudiobooks;
        window.quickSearch = quickSearch;
        window.selectAndPlayBook = selectAndPlayBook;
        window.toggleAudioPlay = toggleAudioPlay;
        window.seekTo = seekTo;
        window.skipForward = skipForward;
        window.skipBackward = skipBackward;
        window.prevTrack = prevTrack;
        window.nextTrack = nextTrack;
        window.setPlaybackRate = setPlaybackRate;
        window.setVolume = setVolume;
        window.toggleMute = toggleMute;
        window.playTrack = playTrack;
        window.selectAndPlayBookByIdx = selectAndPlayBookByIdx;
        window.resumeFromLibrary = resumeFromLibrary;
        window.removeFromLibrary = removeFromLibrary;
