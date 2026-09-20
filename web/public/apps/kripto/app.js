let marketData = [];

        async function loadKripto() {
          try {
            const res = await fetch('/api/kripto/trend');
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            marketData = data.markets || [];
            document.getElementById('kripto-update-time').innerText = 'Güncellendi: ' + new Date().toLocaleTimeString('tr-TR');

            renderTrending(data.trending || []);
            renderMarketTable();
            populateCalculator();
          } catch(err) {
            document.getElementById('market-tbody').innerHTML = '<tr><td colspan="5" class="py-8 text-center text-rose-500">Piyasa verisi alınamadı: ' + err.message + '</td></tr>';
          }
        }

        function renderTrending(trending) {
          const box = document.getElementById('trending-container');
          if (trending.length === 0) {
            box.innerHTML = '<span class="text-mistral-stone">Trend bulunamadı</span>';
            return;
          }

          box.innerHTML = trending.map(t => `
            <span class="px-2.5 py-1 rounded-md bg-white border border-mistral-beige-deep text-mistral-ink font-semibold flex items-center gap-1.5 shadow-2xs">
              <img src="${t.thumb}" alt="${t.name}" class="w-3.5 h-3.5 rounded-full">
              ${t.name} (${t.symbol})
              <span class="text-mistral-stone text-[10px]">#${t.market_cap_rank || '-'}</span>
            </span>
          `).join('');
        }

        function renderMarketTable() {
          const tbody = document.getElementById('market-tbody');
          const q = (document.getElementById('search-kripto').value || '').trim().toLowerCase();

          const list = marketData.filter(m => !q || m.name.toLowerCase().includes(q) || m.symbol.toLowerCase().includes(q));

          if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-mistral-stone">Eşleşen coin bulunamadı.</td></tr>';
            return;
          }

          tbody.innerHTML = list.map(m => {
            const chg = m.price_change_percentage_24h || 0;
            const isPos = chg >= 0;
            return `
              <tr class="hover:bg-mistral-cream-light/60 transition">
                <td class="py-3 flex items-center gap-2.5">
                  <img src="${m.image}" alt="${m.name}" class="w-6 h-6 rounded-full shrink-0">
                  <div>
                    <span class="font-bold text-mistral-ink block">${m.name}</span>
                    <span class="text-[10px] text-mistral-stone uppercase">${m.symbol}</span>
                  </div>
                </td>
                <td class="py-3 text-right font-bold text-mistral-ink">
                  $${Number(m.current_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </td>
                <td class="py-3 text-right font-bold ${isPos ? 'text-emerald-600' : 'text-rose-600'}">
                  ${isPos ? '+' : ''}${chg.toFixed(2)}%
                </td>
                <td class="py-3 text-right text-mistral-stone hidden sm:table-cell">
                  $${Number(m.high_24h || 0).toLocaleString('en-US')}
                </td>
                <td class="py-3 text-right font-bold text-mistral-ink">
                  $${Number(m.market_cap || 0).toLocaleString('en-US')}
                </td>
              </tr>
            `;
          }).join('');
        }

        function populateCalculator() {
          const select = document.getElementById('calc-select');
          select.innerHTML = marketData.map(m => `
            <option value="${m.current_price}">${m.name} (${m.symbol})</option>
          `).join('');
          calculateKripto();
        }

        function calculateKripto() {
          const amount = parseFloat(document.getElementById('calc-amount').value) || 0;
          const price = parseFloat(document.getElementById('calc-select').value) || 0;
          const total = amount * price;

          document.getElementById('calc-result').innerText = '$' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        document.addEventListener('DOMContentLoaded', loadKripto);
