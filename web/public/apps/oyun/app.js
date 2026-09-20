const WISHLIST_KEY = '***';
        let currentTab = 'free'; // 'free' | 'deals'
        let selectedStores = ['1', '25']; // Steam + Epic
        let currentDealsList = [];

        // 1. Sekme Değiştirme
        function switchTab(tab) {
          currentTab = tab;
          const btnFree = document.getElementById('tab-btn-free');
          const btnDeals = document.getElementById('tab-btn-deals');
          const storesBox = document.getElementById('stores-filter-box');
          const listTitle = document.getElementById('deals-list-title');

          if (tab === 'free') {
            btnFree.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white transition flex items-center gap-1.5 shadow';
            btnDeals.className = 'px-4 py-2 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-1.5';
            storesBox.classList.add('hidden');
            listTitle.innerHTML = '<span>🎁</span> Şu An %100 Ücretsiz Olan Oyunlar (Kalıcı Hediyeler)';
            fetchFreeGames();
          } else {
            btnDeals.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white transition flex items-center gap-1.5 shadow';
            btnFree.className = 'px-4 py-2 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-1.5';
            storesBox.classList.remove('hidden');
            listTitle.innerHTML = '<span>🔥</span> En Büyük İndirim Fırsatları (Steam & Epic Games)';
            fetchDiscountDeals();
          }
        }

        function toggleStore(storeId) {
          if (selectedStores.includes(storeId)) {
            if (selectedStores.length === 1) {
              showToast('En az bir mağaza seçili kalmalıdır.');
              return;
            }
            selectedStores = selectedStores.filter(s => s !== storeId);
          } else {
            selectedStores.push(storeId);
          }

          ['1', '25', '7'].forEach(s => {
            const btn = document.getElementById('st-' + s);
            if (selectedStores.includes(s)) {
              btn.className = 'store-tag-btn px-2.5 py-1 rounded-lg bg-violet-500/20 border border-violet-500/50 text-violet-300 font-bold transition';
            } else {
              btn.className = 'store-tag-btn px-2.5 py-1 rounded-lg bg-white border border-mistral-hairline text-mistral-slate hover:text-white transition';
            }
          });

          fetchDiscountDeals();
        }

        // 2. Veri Çekme (API Endpoints)
        function showLoading(show) {
          const spin = document.getElementById('loading-spinner');
          const grid = document.getElementById('deals-grid');
          const empty = document.getElementById('empty-state');
          if (show) {
            spin.classList.remove('hidden');
            grid.innerHTML = '';
            empty.classList.add('hidden');
            document.getElementById('results-count').innerText = 'Fırsatlar taranıyor...';
          } else {
            spin.classList.add('hidden');
          }
        }

        async function fetchFreeGames() {
          showLoading(true);
          try {
            const res = await fetch('/api/oyun/free');
            const data = await res.json();
            if (Array.isArray(data)) {
              currentDealsList = data;
              renderFreeGames(data);
            } else {
              renderFreeGames([]);
            }
          } catch(e) {
            renderFreeGames([]);
          }
        }

        async function fetchDiscountDeals(searchTitle = '') {
          showLoading(true);
          try {
            const storesParam = selectedStores.join(',');
            let url = `/api/oyun/deals?stores=${encodeURIComponent(storesParam)}`;
            if (searchTitle) url += `&title=${encodeURIComponent(searchTitle)}`;

            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) {
              currentDealsList = data;
              renderDiscountDeals(data);
            } else {
              renderDiscountDeals([]);
            }
          } catch(e) {
            renderDiscountDeals([]);
          }
        }

        function searchGames() {
          const q = document.getElementById('input-game-search').value.trim();
          if (!q) {
            switchTab(currentTab);
            return;
          }
          if (currentTab === 'free') {
            // Ücretsizler içinde ara
            const filtered = currentDealsList.filter(g => g.title.toLowerCase().includes(q.toLowerCase()));
            renderFreeGames(filtered);
          } else {
            fetchDiscountDeals(q);
          }
        }

        // 3. Kartları Ekrana Çiz
        function renderFreeGames(list) {
          showLoading(false);
          const grid = document.getElementById('deals-grid');
          const countEl = document.getElementById('results-count');
          const empty = document.getElementById('empty-state');

          if (!list || list.length === 0) {
            grid.innerHTML = '';
            countEl.innerText = '0 ücretsiz oyun';
            empty.classList.remove('hidden');
            return;
          }

          empty.classList.add('hidden');
          countEl.innerText = `${list.length} adet %100 ücretsiz oyun aktif`;

          grid.innerHTML = list.map(item => {
            const worth = item.worth || 'Ücretsiz';
            const platforms = item.platforms || 'PC';
            const img = item.image || item.thumbnail;
            const url = item.open_giveaway_url || '#';

            return `
              <div class="deal-card p-4 rounded-3xl bg-white border border-mistral-hairline hover:border-violet-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between group">
                <div>
                  <div class="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-3 bg-white shadow">
                    <img src="${img}" alt="${item.title}" loading="lazy" class="deal-img w-full h-full object-cover transition-transform duration-500">
                    <div class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow">
                      %100 ÜCRETSİZ
                    </div>
                    <div class="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] text-mistral-slate font-mono">
                      Değeri: <span class="line-through text-mistral-slate">${worth}</span>
                    </div>
                  </div>

                  <h3 class="font-bold text-sm text-mistral-ink group-hover:text-violet-400 transition truncate">${item.title}</h3>
                  <p class="text-xs text-mistral-slate mt-1 line-clamp-2 leading-relaxed">${item.description || ''}</p>
                </div>

                <div class="pt-3 border-t border-mistral-hairline flex items-center justify-between mt-3">
                  <a href="${url}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition flex items-center gap-1">
                    <span>🎁</span> Oyunu Al &rarr;
                  </a>
                  <button onclick="saveToWishlist('${item.title.replace(/'/g, "\\\\'")}', '0.00', '${worth}', '${img}', '${url}')" class="p-1.5 text-mistral-slate hover:text-amber-400 transition" title="İstek Listeme Kaydet">
                    🔖
                  </button>
                </div>
              </div>
            `;
          }).join('');
        }

        function renderDiscountDeals(list) {
          showLoading(false);
          const grid = document.getElementById('deals-grid');
          const countEl = document.getElementById('results-count');
          const empty = document.getElementById('empty-state');

          if (!list || list.length === 0) {
            grid.innerHTML = '';
            countEl.innerText = '0 fırsat bulundu';
            empty.classList.remove('hidden');
            return;
          }

          empty.classList.add('hidden');
          countEl.innerText = `${list.length} indirimli fırsat listelendi`;

          const storeNames = {
            '1': { name: 'Steam', icon: '♨️' },
            '25': { name: 'Epic Games', icon: '⚡' },
            '7': { name: 'GOG', icon: '👾' },
            '11': { name: 'Humble', icon: '📦' }
          };

          grid.innerHTML = list.map(d => {
            const savings = Math.round(parseFloat(d.savings));
            const store = storeNames[d.storeID] || { name: 'Mağaza', icon: '🎮' };
            const dealUrl = `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(d.dealID)}`;
            const steamRating = d.steamRatingText ? `${d.steamRatingText} (%${d.steamRatingPercent})` : '';

            return `
              <div class="deal-card p-4 rounded-3xl bg-white border border-mistral-hairline hover:border-violet-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between group">
                <div>
                  <div class="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-3 bg-white shadow">
                    <img src="${d.thumb}" alt="${d.title}" loading="lazy" class="deal-img w-full h-full object-cover transition-transform duration-500">
                    <div class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-rose-600 text-white font-black text-xs font-mono shadow">
                      -%${savings}
                    </div>
                    <div class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1">
                      <span>${store.icon}</span> ${store.name}
                    </div>
                  </div>

                  <h3 class="font-bold text-sm text-mistral-ink group-hover:text-violet-400 transition truncate">${d.title}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs text-mistral-stone line-through font-mono">$${d.normalPrice}</span>
                    <span class="text-base font-black text-emerald-400 font-mono">$${d.salePrice}</span>
                  </div>
                  ${steamRating ? `<p class="text-[10px] text-mistral-slate truncate mt-1">👍 ${steamRating}</p>` : ''}
                </div>

                <div class="pt-3 border-t border-mistral-hairline flex items-center justify-between mt-3">
                  <a href="${dealUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition flex items-center gap-1">
                    <span>Fırsatı Gör</span> &rarr;
                  </a>
                  <button onclick="saveToWishlist('${d.title.replace(/'/g, "\\\\'")}', '$${d.salePrice}', '$${d.normalPrice}', '${d.thumb}', '${dealUrl}')" class="p-1.5 text-mistral-slate hover:text-amber-400 transition" title="İstek Listeme Kaydet">
                    🔖
                  </button>
                </div>
              </div>
            `;
          }).join('');
        }

        // 4. İstek Listesi (Wishlist & LocalStorage)
        function getWishlist() {
          try {
            return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
          } catch(e) {
            return [];
          }
        }

        function saveToWishlist(title, price, oldPrice, thumb, url) {
          let list = getWishlist();
          if (list.some(item => item.title === title)) {
            showToast('Bu oyun zaten istek listenizde bulunuyor.');
            return;
          }

          list.unshift({
            id: 'wl_' + Date.now(),
            title: title,
            price: price,
            oldPrice: oldPrice,
            thumb: thumb,
            url: url,
            date: new Date().toLocaleDateString('tr-TR')
          });

          localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
          renderWishlist();
          showToast(`✓ "${title}" istek listenize kaydedildi!`);
        }

        function renderWishlist() {
          const grid = document.getElementById('wishlist-grid');
          const empty = document.getElementById('wishlist-empty');
          const list = getWishlist();

          if (list.length === 0) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
            return;
          }

          empty.classList.add('hidden');
          grid.innerHTML = list.map(item => `
            <div class="p-3 rounded-2xl bg-white border border-mistral-hairline hover:border-violet-500/40 transition flex items-center gap-3">
              <img src="${item.thumb}" class="w-14 h-14 rounded-xl object-cover shrink-0 shadow bg-white">
              <div class="flex-1 min-w-0">
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="font-bold text-xs text-white truncate block hover:text-violet-400 transition">${item.title}</a>
                <div class="flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
                  <span class="text-emerald-400 font-bold">${item.price}</span>
                  <span class="text-mistral-stone line-through">${item.oldPrice}</span>
                </div>
              </div>
              <button onclick="removeFromWishlist('${item.id}')" class="text-mistral-stone hover:text-rose-400 p-1 text-xs transition" title="Sil">
                ✕
              </button>
            </div>
          `).join('');
        }

        function removeFromWishlist(id) {
          let list = getWishlist();
          list = list.filter(item => item.id !== id);
          localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
          renderWishlist();
        }

        function clearWishlist() {
          if (!confirm('İstek listenizi tamamen temizlemek istediğinize emin misiniz?')) return;
          localStorage.removeItem(WISHLIST_KEY);
          renderWishlist();
        }

        function showToast(msg) {
          const toast = document.getElementById('game-toast');
          toast.innerText = msg;
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 3500);
        }

        // Başlangıç
        document.addEventListener('DOMContentLoaded', () => {
          fetchFreeGames();
          renderWishlist();
        });
