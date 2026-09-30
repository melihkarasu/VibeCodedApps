const ART_DB_APP_ID = 'sanat-galerisi';
        const ART_DB_KEY = 'saved_art';
        let savedArtCache = [];

        function getAuthHeader() {
          const t = (typeof localStorage !== 'undefined' && localStorage.getItem('vibe_token')) || '';
          return t ? { 'Authorization': 'Bearer ' + t } : {};
        }

        // Eski localStorage koleksiyonunu bir kez veritabanına tasir (kural: monorepoda localStorage kullanılmaz)
        async function migrateLegacyArt() {
          try {
            const legacyRaw = localStorage.getItem('vibe_saved_art');
            if (!legacyRaw) return;
            let legacy;
            try { legacy = JSON.parse(legacyRaw); } catch(e2) { localStorage.removeItem('vibe_saved_art'); return; }
            if (Array.isArray(legacy) && legacy.length > 0 && savedArtCache.length === 0) {
              savedArtCache = legacy;
              renderSavedArt();
              const ok = await persistSavedArtToDb();
              if (ok) localStorage.removeItem('vibe_saved_art'); // yerel kopya yalnızca DB'ye yazıldıysa silinir
            } else {
              localStorage.removeItem('vibe_saved_art'); // DB dolu ya da legacy boş: yerel kopya gereksiz
            }
          } catch(e) {}
        }

        async function loadSavedArtFromDb() {
          try {
            const res = await fetch('/api/user-data/' + ART_DB_APP_ID, { headers: getAuthHeader(), credentials: 'include' });
            if (res.ok) {
              const json = await res.json();
              if (json && json.success && json.data && Array.isArray(json.data[ART_DB_KEY])) {
                savedArtCache = json.data[ART_DB_KEY];
              }
            }
            await migrateLegacyArt();
          } catch(e) {
            console.warn('[Sanat] Koleksiyon veritabanından alınamadı:', e.message);
          }
          renderSavedArt();
        }

        async function persistSavedArtToDb() {
          try {
            const res = await fetch('/api/user-data/' + ART_DB_APP_ID, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
              credentials: 'include',
              body: JSON.stringify({ key: ART_DB_KEY, value: savedArtCache })
            });
            if (res.status === 401) { showToast('Koleksiyonunuzun kaydedilmesi için giriş yapmanız gerekiyor.'); return false; }
            if (!res.ok) return false;
            return true;
          } catch(e) {
            console.error('[Sanat] Veritabanına kaydedilemedi:', e.message);
            return false;
          }
        }
        let currentArtworks = [];
        let currentModalArt = null;
        let currentZoom = 1;
        let panX = 0;
        let panY = 0;
        let isPanning = false;
        let startX = 0;
        let startY = 0;

        // 1. Eserleri Getir (The Met API)
        async function fetchArtworks(query, type = 'artist') {
          showLoading(true);
          document.getElementById('gallery-topic-title').innerText = `"${query}" Seçkisi`;

          try {
            const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(query)}&hasImages=true`;
            const sRes = await fetch(searchUrl);
            const sData = await sRes.json();

            if (!sData.objectIDs || sData.objectIDs.length === 0) {
              renderArtworks([]);
              return;
            }

            // En iyi ilk 16 eserin detaylarını çek
            const targetIds = sData.objectIDs.slice(0, 16);
            const detailed = await Promise.all(
              targetIds.map(async id => {
                try {
                  const res = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
                  if (!res.ok) return null;
                  return await res.json();
                } catch(e) {
                  return null;
                }
              })
            );

            const validArt = detailed.filter(item => item && (item.primaryImageSmall || item.primaryImage));
            currentArtworks = validArt;
            renderArtworks(validArt);
          } catch(err) {
            console.error(err);
            renderArtworks([]);
          }
        }

        function searchArt() {
          const q = document.getElementById('input-art-search').value.trim();
          if (!q) return;
          fetchArtworks(q, 'keyword');
        }

        function showLoading(show) {
          document.getElementById('loading-spinner').className = show ? 'py-16 text-center text-mistral-slate text-sm flex flex-col items-center gap-3' : 'hidden';
          if (show) {
            document.getElementById('artworks-grid').innerHTML = '';
            document.getElementById('empty-state').classList.add('hidden');
            document.getElementById('results-count').innerText = 'Arşiv taranıyor...';
          }
        }

        // 2. Eser Kartlarını Çiz
        function renderArtworks(list) {
          showLoading(false);
          const grid = document.getElementById('artworks-grid');
          const countEl = document.getElementById('results-count');
          const emptyEl = document.getElementById('empty-state');

          if (!list || list.length === 0) {
            grid.innerHTML = '';
            countEl.innerText = '0 eser bulundu';
            emptyEl.classList.remove('hidden');
            return;
          }

          emptyEl.classList.add('hidden');
          countEl.innerText = `${list.length} başyapıt sergileniyor`;

          grid.innerHTML = list.map(item => {
            const img = item.primaryImageSmall || item.primaryImage;
            const artist = item.artistDisplayName || 'Anonim Sanatçı';
            const date = item.objectDate || '';

            return `
              <div class="art-card p-4 rounded-3xl bg-white border border-mistral-hairline hover:border-purple-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between group">
                <div class="cursor-pointer" onclick="openDeepZoomModal(${item.objectID})">
                  <div class="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-3 bg-mistral-canvas shadow-md">
                    <img src="${img}" alt="${item.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500">
                    <div class="absolute inset-0 bg-white from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                      <span class="text-white text-xs font-semibold flex items-center gap-1.5">
                        <span>🔍</span> Derin İncele
                      </span>
                    </div>
                  </div>

                  <h3 class="font-bold text-sm text-mistral-ink group-hover:text-purple-400 transition truncate">${item.title}</h3>
                  <p class="text-xs text-purple-400/90 font-medium truncate mt-0.5">${artist}</p>
                  <p class="text-[11px] text-mistral-slate font-mono mt-0.5 truncate">${date || item.medium || 'The Met'}</p>
                </div>

                <div class="pt-3 border-t border-mistral-hairline flex items-center justify-between mt-3">
                  <button onclick="openDeepZoomModal(${item.objectID})" class="text-xs text-purple-400 hover:text-purple-300 font-semibold transition">
                    Detayları Gör &rarr;
                  </button>
                  <button onclick="quickSaveArt(${item.objectID}, '${item.title.replace(/'/g, "\\\\'")}', '${artist.replace(/'/g, "\\\\'")}', '${img}', '${date}')" class="text-xs text-mistral-slate hover:text-amber-400 transition p-1" title="Koleksiyonuma Kaydet">
                    🔖
                  </button>
                </div>
              </div>
            `;
          }).join('');
        }

        // 3. Derin Yakınlaştırma (Deep Zoom & Pan Modal)
        async function openDeepZoomModal(id) {
          showToast('Eser ve yüksek çözünürlüklü detaylar yükleniyor...');
          try {
            let item = currentArtworks.find(a => a.objectID === id);
            if (!item) {
              const res = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
              item = await res.json();
            }

            if (!item) return;
            currentModalArt = item;

            const highResImg = item.primaryImage || item.primaryImageSmall;
            document.getElementById('modal-zoom-img').src = highResImg;
            document.getElementById('modal-art-title').innerText = item.title;
            document.getElementById('modal-art-artist').innerText = item.artistDisplayName || 'Anonim';
            document.getElementById('modal-art-date').innerText = item.objectDate || '';
            document.getElementById('modal-art-medium').innerText = item.medium || 'Sanat Eseri';
            document.getElementById('modal-art-dims').innerText = item.dimensions || '';
            document.getElementById('modal-art-met-link').href = item.objectURL || 'https://www.metmuseum.org';

            resetZoom();
            updateModalSaveButtonState();
            hydrateModalDescription(item);
            document.getElementById('zoom-modal').classList.remove('hidden');
          } catch(e) {
            console.error(e);
          }
        }

        function closeZoomModal() {
          document.getElementById('zoom-modal').classList.add('hidden');
          currentModalArt = null;
        }

        function changeZoom(delta) {
          currentZoom = Math.min(4, Math.max(0.75, currentZoom + delta));
          updateTransform();
        }

        function resetZoom() {
          currentZoom = 1;
          panX = 0;
          panY = 0;
          updateTransform();
        }

        function updateTransform() {
          const img = document.getElementById('modal-zoom-img');
          img.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
          document.getElementById('zoom-level-text').innerText = Math.round(currentZoom * 100) + '%';
        }

        function handleWheel(e) {
          e.preventDefault();
          const delta = e.deltaY < 0 ? 0.15 : -0.15;
          changeZoom(delta);
        }

        function startPan(e) {
          isPanning = true;
          startX = e.clientX - panX;
          startY = e.clientY - panY;
        }

        function doPan(e) {
          if (!isPanning) return;
          panX = e.clientX - startX;
          panY = e.clientY - startY;
          updateTransform();
        }

        function endPan() {
          isPanning = false;
        }

        // 3b. Modal Aciklama: Met notu (nadir dolu) -> yoksa Vikipedi giris ozeti (CORS-acik)
        // (Kullanicinin 2026-09-29 talimati: aciklama yalnizca detay penceresinde, ek API istegi yalnizca modal acikken)
        // Not (2026-09-30): MyMemory hicbir uygulamaya gomulmez (kullanici kurali) — aciklama kaynak dilinde gosterilir.
        async function hydrateModalDescription(item) {
          const box = document.getElementById('modal-desc-box');
          const el = document.getElementById('modal-art-desc');
          const srcEl = document.getElementById('modal-art-desc-source');
          if (!box || !el) return;
          const oid = item.objectID;

          box.classList.add('hidden');
          el.innerText = '';
          if (srcEl) srcEl.innerText = '';

          let src = ((item.objectNote || '') + '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          let sourceLabel = 'The Met katalog notu';

          if (src.length < 30) {
            try {
              const q = [item.title, item.artistDisplayName].filter(Boolean).join(' ');
              const wikiUrl = 'https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrnamespace=0&gsrlimit=1&prop=extracts&exintro&explaintext&format=json&origin=*&gsrsearch=' + encodeURIComponent(q);
              const res = await fetch(wikiUrl);
              const data = await res.json();
              const pages = (data.query && data.query.pages) || {};
              const first = Object.values(pages)[0];
              src = ((first && first.extract) || '').replace(/\s+/g, ' ').trim();
              sourceLabel = 'Vikipedi';
            } catch(e) {
              src = '';
            }
          }

          if (src.length < 30) return;
          src = src.slice(0, 400);

          const isStillOpen = () => currentModalArt && currentModalArt.objectID === oid;

          el.innerText = src;
          if (srcEl) {
            srcEl.innerText = '📖 Kaynak: ' + sourceLabel;
          }
          if (isStillOpen()) box.classList.remove('hidden');
        }

        // 4. Kişisel Sanat Koleksiyonum (Storage)
        function getSavedArt() {
          return savedArtCache;
        }

        function toggleModalSaved() {
          if (!currentModalArt) return;
          const list = getSavedArt();
          const id = currentModalArt.objectID;
          const exists = list.some(a => a.id === id);

          if (exists) {
            const updated = list.filter(a => a.id !== id);
            savedArtCache = updated;
            showToast('Koleksiyonunuzdan çıkarıldı.');
          } else {
            list.unshift({
              id: id,
              title: currentModalArt.title,
              artist: currentModalArt.artistDisplayName || 'Anonim',
              img: currentModalArt.primaryImageSmall || currentModalArt.primaryImage,
              date: currentModalArt.objectDate || ''
            });
            savedArtCache = list;
            showToast('✓ Başyapıt koleksiyonunuza eklendi!');
          }

          updateModalSaveButtonState();
          renderSavedArt();
          persistSavedArtToDb();
        }

        function quickSaveArt(id, title, artist, img, date) {
          let list = getSavedArt();
          if (list.some(a => a.id === id)) {
            showToast('Bu eser zaten koleksiyonunuzda mevcut.');
            return;
          }
          list.unshift({ id, title, artist, img, date });
          savedArtCache = list;
          persistSavedArtToDb();
          showToast(`✓ "${title}" koleksiyonunuza eklendi!`);
          renderSavedArt();
        }

        function updateModalSaveButtonState() {
          if (!currentModalArt) return;
          const list = getSavedArt();
          const isSaved = list.some(a => a.id === currentModalArt.objectID);
          const icon = document.getElementById('modal-art-save-icon');
          const text = document.getElementById('modal-art-save-text');

          if (isSaved) {
            icon.innerText = '✓';
            text.innerText = 'Koleksiyonunuzda';
          } else {
            icon.innerText = '🔖';
            text.innerText = 'Koleksiyona Ekle';
          }
        }

        function renderSavedArt() {
          const grid = document.getElementById('saved-art-grid');
          const empty = document.getElementById('saved-art-empty');
          const list = getSavedArt();

          if (list.length === 0) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
            return;
          }

          empty.classList.add('hidden');
          grid.innerHTML = list.map(item => `
            <div class="p-3 rounded-2xl bg-white border border-mistral-hairline hover:border-purple-500/40 transition flex items-center gap-3">
              <img src="${item.img}" class="w-14 h-16 rounded-xl object-cover shrink-0 cursor-pointer shadow" onclick="openDeepZoomModal(${item.id})">
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-xs text-mistral-ink truncate cursor-pointer hover:text-purple-400" onclick="openDeepZoomModal(${item.id})">${item.title}</h4>
                <p class="text-[10px] text-purple-400 truncate">${item.artist}</p>
                <span class="text-[9px] text-mistral-stone font-mono">${item.date}</span>
              </div>
              <button onclick="removeSavedArt(${item.id})" class="text-xs text-mistral-stone hover:text-rose-400 p-1 transition" title="Sil">
                ✕
              </button>
            </div>
          `).join('');
        }

        function removeSavedArt(id) {
          let list = getSavedArt();
          savedArtCache = list.filter(a => a.id !== id);
          renderSavedArt();
          persistSavedArtToDb();
        }

        async function clearAllSavedArt() {
          if (!confirm('Tüm koleksiyonunuzu silmek istediğinize emin misiniz?')) return;
          savedArtCache = [];
          renderSavedArt();
          try {
            await fetch('/api/user-data/' + ART_DB_APP_ID + '/' + ART_DB_KEY, { method: 'DELETE', headers: getAuthHeader(), credentials: 'include' });
          } catch(e) {}
        }

        function showToast(msg) {
          const toast = document.getElementById('sanat-toast');
          toast.innerText = msg;
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 3500);
        }

        // Başlangıç
        document.addEventListener('DOMContentLoaded', () => {
          fetchArtworks('Van Gogh', 'artist');
          loadSavedArtFromDb();
        });
