function safeCopyToClipboard(text, msg) {
  if (window.copyToClipboard) {
    window.copyToClipboard(text, msg);
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (window.showToast) window.showToast('✓ ' + (msg || 'Panoya kopyalandı!'));
    }).catch(() => fallbackExecCopy(text, msg));
  } else {
    fallbackExecCopy(text, msg);
  }
}
function fallbackExecCopy(text, msg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    if (window.showToast) window.showToast('✓ ' + (msg || 'Panoya kopyalandı!'));
  } catch(e) {
    if (window.showToast) window.showToast('Kopyalama başarısız');
  }
  document.body.removeChild(ta);
}

const CURRENCIES = {
          USD: { name: 'ABD Doları', flag: '🇺🇸', symbol: '$' },
          EUR: { name: 'Euro', flag: '🇪🇺', symbol: '€' },
          TRY: { name: 'Türk Lirası', flag: '🇹🇷', symbol: '₺' },
          GBP: { name: 'İngiliz Sterlini', flag: '🇬🇧', symbol: '£' },
          CHF: { name: 'İsviçre Frangı', flag: '🇨🇭', symbol: 'CHF' },
          JPY: { name: 'Japon Yeni', flag: '🇯🇵', symbol: '¥' },
          CAD: { name: 'Kanada Doları', flag: '🇨🇦', symbol: 'C$' },
          AUD: { name: 'Avustralya Doları', flag: '🇦🇺', symbol: 'A$' },
          SAR: { name: 'Suudi Arabistan Riyali', flag: '🇸🇦', symbol: 'SR' },
          KWD: { name: 'Kuveyt Dinarı', flag: '🇰🇼', symbol: 'KD' },
          QAR: { name: 'Katar Riyali', flag: '🇶🇦', symbol: 'QR' },
          AED: { name: 'BAE Dirhemi', flag: '🇦🇪', symbol: 'AED' },
          CNY: { name: 'Çin Yuanı', flag: '🇨🇳', symbol: '¥' },
          RUB: { name: 'Rus Rublesi', flag: '🇷🇺', symbol: '₽' },
          SEK: { name: 'İsveç Kronu', flag: '🇸🇪', symbol: 'kr' },
          NOK: { name: 'Norveç Kronu', flag: '🇳🇴', symbol: 'kr' },
          DKK: { name: 'Danimarka Kronu', flag: '🇩🇰', symbol: 'kr' },
          BGN: { name: 'Bulgar Levası', flag: '🇧🇬', symbol: 'лв' },
          RON: { name: 'Romanya Leyi', flag: '🇷🇴', symbol: 'lei' },
          AZN: { name: 'Azerbaycan Manatı', flag: '🇦🇿', symbol: '₼' },
          KRW: { name: 'Güney Kore Wonu', flag: '🇰🇷', symbol: '₩' },
          INR: { name: 'Hindistan Rupisi', flag: '🇮🇳', symbol: '₹' },
          SGD: { name: 'Singapur Doları', flag: '🇸🇬', symbol: 'S$' },
          NZD: { name: 'Yeni Zelanda Doları', flag: '🇳🇿', symbol: 'NZ$' },
          HKD: { name: 'Hong Kong Doları', flag: '🇭🇰', symbol: 'HK$' },
          BRL: { name: 'Brezilya Reali', flag: '🇧🇷', symbol: 'R$' },
          MXN: { name: 'Meksika Pezosu', flag: '🇲🇽', symbol: 'Mex$' },
          PLN: { name: 'Polonya Zlotisi', flag: '🇵🇱', symbol: 'zł' },
          ZAR: { name: 'Güney Afrika Randı', flag: '🇿🇦', symbol: 'R' },
          HUF: { name: 'Macar Forinti', flag: '🇭🇺', symbol: 'Ft' },
          CZK: { name: 'Çek Korunası', flag: '🇨🇿', symbol: 'Kč' },
          ILS: { name: 'İsrail Şekeli', flag: '🇮🇱', symbol: '₪' }
        };

        const POPULAR_TICKERS = [
          { from: 'USD', to: 'TRY' },
          { from: 'EUR', to: 'TRY' },
          { from: 'GBP', to: 'TRY' },
          { from: 'CHF', to: 'TRY' },
          { from: 'EUR', to: 'USD' },
          { from: 'USD', to: 'JPY' }
        ];

        let activeSource = 'tcmb'; // 'tcmb' veya 'ecb'
        let tcmbRateType = 'forexSelling'; // 'forexSelling', 'forexBuying', 'banknoteSelling', 'banknoteBuying'
        let tcmbData = null;
        let ecbData = null;
        let chartInstance = null;
        let currentPeriod = '1m';

        // 1. Veri Kaynağını Değiştir (TCMB vs ECB)
        async function setDataSource(source) {
          activeSource = source;
          const btnTcmb = document.getElementById('btn-src-tcmb');
          const btnEcb = document.getElementById('btn-src-ecb');
          const tcmbTypeBox = document.getElementById('tcmb-rate-type-container');
          const convSourceLabel = document.getElementById('conv-source-label');

          if (source === 'tcmb') {
            btnTcmb.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 transition flex items-center gap-1.5 shadow';
            btnEcb.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-mistral-slate hover:text-white transition flex items-center gap-1.5';
            tcmbTypeBox.classList.remove('hidden');
            convSourceLabel.innerText = '🏛️ TCMB Resmi Kurları';
            document.getElementById('matrix-title').innerHTML = '<span>🏛️</span> TCMB Gösterge Kurları';
            document.getElementById('matrix-desc').innerText = 'TCMB resmi döviz ve efektif alış/satış kurları:';
            document.getElementById('th-col-1').innerText = 'Döviz Alış';
            document.getElementById('th-col-2').innerText = 'Döviz Satış';
            document.getElementById('th-col-3').innerText = 'Efektif Satış';
            if (!tcmbData) await fetchTcmbRates();
            updateSourceBadge();
          } else {
            btnEcb.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 transition flex items-center gap-1.5 shadow';
            btnTcmb.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-mistral-slate hover:text-white transition flex items-center gap-1.5';
            tcmbTypeBox.classList.add('hidden');
            convSourceLabel.innerText = '🌍 ECB Uluslararası Kurlar';
            document.getElementById('matrix-title').innerHTML = '<span>🌐</span> Çoklu Kur Matrisi';
            document.getElementById('matrix-desc').innerText = 'Girilen tutarın dünya genelindeki karşılıkları:';
            document.getElementById('th-col-1').innerText = 'Birim Kur';
            document.getElementById('th-col-2').innerText = 'Toplam Değer';
            document.getElementById('th-col-3').innerText = 'Fark';
            if (!ecbData) await fetchEcbRates('USD');
            updateSourceBadge();
          }

          calculateConversion();
          updateMultiRatesTable();
          loadTickers();
        }

        function setTcmbRateType(type) {
          tcmbRateType = type;
          ['forexSelling', 'forexBuying', 'banknoteSelling', 'banknoteBuying'].forEach(t => {
            const btn = document.getElementById('btn-type-' + t);
            if (t === type) {
              btn.className = 'px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold transition';
            } else {
              btn.className = 'px-2 py-1 rounded text-mistral-slate hover:text-white transition';
            }
          });
          calculateConversion();
        }

        function updateSourceBadge() {
          const badge = document.getElementById('source-date-badge');
          if (activeSource === 'tcmb' && tcmbData) {
            badge.innerText = `TCMB Bülten: ${tcmbData.tarih} (No: ${tcmbData.bultenNo})`;
          } else if (activeSource === 'ecb' && ecbData) {
            badge.innerText = `ECB Kapanış: ${ecbData.date}`;
          }
        }

        // 2. TCMB ve ECB Veri Çekme
        async function fetchTcmbRates() {
          try {
            const res = await fetch('/api/tcmb');
            const data = await res.json();
            if (data && data.success) {
              tcmbData = data;
              return data;
            }
          } catch(e) {
            console.error('TCMB çekme hatası:', e);
          }
          return null;
        }

        async function fetchEcbRates(base) {
          try {
            const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${base}`);
            const data = await res.json();
            ecbData = data;
            return data;
          } catch(e) {
            console.error('ECB çekme hatası:', e);
          }
          return null;
        }

        // 3. Para Birimi Seçicilerini Doldur
        function populateCurrencySelects() {
          const fromSel = document.getElementById('select-from');
          const toSel = document.getElementById('select-to');
          fromSel.innerHTML = '';
          toSel.innerHTML = '';

          const priority = ['USD', 'EUR', 'TRY', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'SAR', 'KWD', 'QAR'];
          const sortedKeys = Object.keys(CURRENCIES).sort((a, b) => {
            const idxA = priority.indexOf(a);
            const idxB = priority.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
          });

          sortedKeys.forEach(code => {
            const c = CURRENCIES[code];
            const optFrom = new Option(`${c.flag} ${code} - ${c.name}`, code);
            const optTo = new Option(`${c.flag} ${code} - ${c.name}`, code);
            fromSel.add(optFrom);
            toSel.add(optTo);
          });

          fromSel.value = 'USD';
          toSel.value = 'TRY';
        }

        // 4. Çevirme ve Hesaplama Motoru
        function calculateConversion() {
          const from = document.getElementById('select-from').value;
          const to = document.getElementById('select-to').value;
          const amount = parseFloat(document.getElementById('input-amount').value) || 0;

          let rate = 1;

          if (from === to) {
            rate = 1;
          } else if (activeSource === 'tcmb' && tcmbData && tcmbData.rates) {
            // TCMB Hesaplaması
            const rates = tcmbData.rates;
            
            const getTcmbTRY = (code) => {
              if (code === 'TRY') return 1;
              const r = rates[code];
              if (!r) return null;
              const val = r[tcmbRateType] || r.forexSelling || r.forexBuying;
              return val ? (val / r.unit) : null;
            };

            const fromInTRY = getTcmbTRY(from);
            const toInTRY = getTcmbTRY(to);

            if (fromInTRY && toInTRY) {
              rate = fromInTRY / toInTRY;
            } else if (ecbData && ecbData.rates) {
              // TCMB'de olmayan para birimi için ECB yedek
              rate = ecbData.rates[to] || 1;
            }
          } else if (activeSource === 'ecb' && ecbData && ecbData.rates) {
            // ECB Hesaplaması
            if (from === ecbData.base) {
              rate = ecbData.rates[to] || 1;
            } else {
              const fromRate = ecbData.rates[from] || 1;
              const toRate = ecbData.rates[to] || 1;
              rate = toRate / fromRate;
            }
          }

          const total = amount * rate;
          const toInfo = CURRENCIES[to] || { symbol: '' };
          const fromInfo = CURRENCIES[from] || { symbol: '' };

          document.getElementById('res-calc-formula').innerText = `${amount.toLocaleString('tr-TR')} ${from} (${activeSource === 'tcmb' ? 'TCMB' : 'ECB'}) =`;
          document.getElementById('res-main-amount').innerText = `${total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${toInfo.symbol || to}`;
          document.getElementById('res-unit-rate').innerText = `1 ${from} = ${rate.toFixed(4)} ${to}`;
          
          const inverse = rate > 0 ? (1 / rate).toFixed(4) : 0;
          document.getElementById('res-inverse-rate').innerText = `1 ${to} = ${inverse} ${from}`;

          document.getElementById('matrix-base-label').innerText = `${amount} ${from} karşılığı`;
        }

        async function onCurrencyChange(isBaseChanged) {
          const from = document.getElementById('select-from').value;
          document.getElementById('amount-symbol').innerText = from;
          updateFavoriteButtonState();

          if (activeSource === 'ecb' && (isBaseChanged || !ecbData || ecbData.base !== from)) {
            await fetchEcbRates(from);
          }
          calculateConversion();
          updateMultiRatesTable();
          loadChartData();
          runSimulation();
        }

        function swapCurrencies() {
          const fromSel = document.getElementById('select-from');
          const toSel = document.getElementById('select-to');
          const temp = fromSel.value;
          fromSel.value = toSel.value;
          toSel.value = temp;
          onCurrencyChange(true);
        }

        // 5. Hızlı Kurlar Bandı (Ticker)
        async function loadTickers() {
          const container = document.getElementById('ticker-container');
          container.innerHTML = '';

          POPULAR_TICKERS.forEach(pair => {
            let rate = null;

            if (activeSource === 'tcmb' && tcmbData && tcmbData.rates) {
              const rates = tcmbData.rates;
              if (pair.to === 'TRY' && rates[pair.from]) {
                rate = rates[pair.from].forexSelling;
              } else if (pair.from === 'TRY' && rates[pair.to]) {
                rate = 1 / rates[pair.to].forexBuying;
              } else if (rates[pair.from] && rates[pair.to]) {
                rate = rates[pair.from].forexSelling / rates[pair.to].forexSelling;
              }
            } else if (ecbData && ecbData.rates) {
              if (pair.from === ecbData.base) rate = ecbData.rates[pair.to];
              else if (pair.from === 'USD') rate = ecbData.rates[pair.to];
            }

            const cFrom = CURRENCIES[pair.from] || { flag: '' };
            const cTo = CURRENCIES[pair.to] || { flag: '' };

            const card = document.createElement('div');
            card.className = 'p-3 rounded-xl bg-white border border-mistral-hairline hover:border-emerald-500/50 cursor-pointer transition shadow hover:scale-[1.02] flex flex-col justify-between';
            card.onclick = () => {
              document.getElementById('select-from').value = pair.from;
              document.getElementById('select-to').value = pair.to;
              onCurrencyChange(true);
              window.scrollTo({ top: 180, behavior: 'smooth' });
            };
            card.innerHTML = `
              <div class="flex items-center justify-between text-xs text-mistral-slate mb-1">
                <span class="font-bold text-mistral-ink">${pair.from}/${pair.to}</span>
                <span>${cFrom.flag}${cTo.flag}</span>
              </div>
              <div class="text-base font-extrabold text-emerald-400">
                ${rate ? rate.toFixed(4) : '-'}
              </div>
            `;
            container.appendChild(card);
          });
        }

        // 6. Çoklu Karşılaştırma / TCMB Gösterge Tablosu
        function updateMultiRatesTable() {
          const tbody = document.getElementById('multi-rates-tbody');
          if (!tbody) return;

          const amount = parseFloat(document.getElementById('input-amount').value) || 0;
          const from = document.getElementById('select-from').value;

          if (activeSource === 'tcmb' && tcmbData && tcmbData.rates) {
            // TCMB Detaylı Gösterge Tablosu
            const tRates = tcmbData.rates;
            const codes = Object.keys(tRates).sort();

            tbody.innerHTML = codes.map(code => {
              const item = tRates[code];
              const c = CURRENCIES[code] || { name: item.name, flag: '🌐', symbol: '' };
              const fBuy = item.forexBuying ? item.forexBuying.toFixed(4) : '-';
              const fSell = item.forexSelling ? item.forexSelling.toFixed(4) : '-';
              const bSell = item.banknoteSelling ? item.banknoteSelling.toFixed(4) : '-';

              return `
                <tr class="hover:bg-mistral-cream cursor-pointer transition" onclick="selectTargetCurrency('${code}')">
                  <td class="py-2.5 flex items-center gap-2">
                    <span class="text-base">${c.flag}</span>
                    <div>
                      <span class="font-bold text-mistral-ink">${code}</span>
                      <span class="text-[10px] text-mistral-slate block truncate max-w-[100px]">${item.name}</span>
                    </div>
                  </td>
                  <td class="py-2.5 text-right font-mono text-mistral-slate">${fBuy}</td>
                  <td class="py-2.5 text-right font-mono font-bold text-emerald-400">${fSell}</td>
                  <td class="py-2.5 text-right font-mono text-mistral-slate">${bSell}</td>
                </tr>
              `;
            }).join('');
          } else if (ecbData && ecbData.rates) {
            // ECB Çoklu Kur Matrisi
            const targets = ['TRY', 'EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'CNY', 'NOK', 'SEK', 'DKK', 'INR'];
            tbody.innerHTML = targets
              .filter(code => code !== from)
              .map(code => {
                const rate = ecbData.rates[code] || 0;
                const total = amount * rate;
                const c = CURRENCIES[code] || { name: code, flag: '🌐', symbol: '' };
                return `
                  <tr class="hover:bg-mistral-cream cursor-pointer transition" onclick="selectTargetCurrency('${code}')">
                    <td class="py-2.5 flex items-center gap-2">
                      <span class="text-base">${c.flag}</span>
                      <div>
                        <span class="font-bold text-mistral-ink">${code}</span>
                        <span class="text-[10px] text-mistral-slate hidden sm:inline ml-1">(${c.name})</span>
                      </div>
                    </td>
                    <td class="py-2.5 text-right font-mono text-mistral-slate">${rate.toFixed(4)}</td>
                    <td class="py-2.5 text-right font-mono font-bold text-emerald-400">${total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${c.symbol}</td>
                    <td class="py-2.5 text-right font-mono text-mistral-stone">-</td>
                  </tr>
                `;
              }).join('');
          }
        }

        function selectTargetCurrency(code) {
          document.getElementById('select-to').value = code;
          onCurrencyChange(false);
        }

        // 7. Tarihsel Grafik (Chart.js)
        function setChartPeriod(period) {
          currentPeriod = period;
          document.querySelectorAll('.period-btn').forEach(b => {
            b.className = 'period-btn px-3 py-1 rounded-lg text-xs font-semibold text-mistral-slate hover:text-white transition';
          });
          const active = document.getElementById('btn-period-' + period);
          if (active) active.className = 'period-btn px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 transition';
          loadChartData();
        }

        function getStartDateForPeriod(period) {
          const d = new Date();
          if (period === '7d') d.setDate(d.getDate() - 7);
          else if (period === '1m') d.setMonth(d.getMonth() - 1);
          else if (period === '3m') d.setMonth(d.getMonth() - 3);
          else if (period === '1y') d.setFullYear(d.getFullYear() - 1);
          return d.toISOString().split('T')[0];
        }

        async function loadChartData() {
          const from = document.getElementById('select-from').value;
          const to = document.getElementById('select-to').value;
          document.getElementById('chart-title').innerText = `${from} / ${to} Kur Değişim Grafiği`;

          if (from === to) {
            renderChart(['Bugün'], [1]);
            return;
          }

          const start = getStartDateForPeriod(currentPeriod);
          const end = new Date().toISOString().split('T')[0];

          try {
            const url = `https://api.frankfurter.dev/v1/${start}..${end}?base=${from}&symbols=${to}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Grafik API Hatası');
            const data = await res.json();

            const dates = Object.keys(data.rates || {}).sort();
            const values = dates.map(d => data.rates[d][to]);

            if (values.length > 0) {
              const min = Math.min(...values);
              const max = Math.max(...values);
              const avg = values.reduce((a, b) => a + b, 0) / values.length;
              const first = values[0];
              const last = values[values.length - 1];
              const changePct = ((last - first) / first) * 100;

              document.getElementById('stat-high').innerText = max.toFixed(4);
              document.getElementById('stat-low').innerText = min.toFixed(4);
              document.getElementById('stat-avg').innerText = avg.toFixed(4);
              
              const chgEl = document.getElementById('stat-change');
              chgEl.innerText = (changePct >= 0 ? '+' : '') + changePct.toFixed(2) + '%';
              chgEl.className = 'text-sm font-bold mt-0.5 ' + (changePct >= 0 ? 'text-emerald-400' : 'text-rose-400');
            }

            renderChart(dates, values);
          } catch(err) {
            console.error('Grafik yükleme hatası:', err);
          }
        }

        function renderChart(labels, data) {
          const ctx = document.getElementById('currency-chart').getContext('2d');
          if (chartInstance) chartInstance.destroy();

          const gradient = ctx.createLinearGradient(0, 0, 0, 240);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

          chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
              labels: labels.map(l => {
                const parts = l.split('-');
                return parts.length === 3 ? `${parts[2]}/${parts[1]}` : l;
              }),
              datasets: [{
                label: 'Kur',
                data: data,
                borderColor: '#10b981',
                borderWidth: 2.5,
                backgroundColor: gradient,
                fill: true,
                tension: 0.3,
                pointRadius: labels.length > 35 ? 0 : 2,
                pointHoverRadius: 5,
                pointBackgroundColor: '#10b981'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                intersect: false,
                mode: 'index'
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#0f172a',
                  titleColor: '#94a3b8',
                  bodyColor: '#10b981',
                  borderColor: '#334155',
                  borderWidth: 1,
                  padding: 10,
                  displayColors: false,
                  callbacks: {
                    label: (context) => `Kur: ${context.parsed.y.toFixed(4)}`
                  }
                }
              },
              scales: {
                x: {
                  grid: { color: 'rgba(51, 65, 85, 0.2)' },
                  ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 8 }
                },
                y: {
                  grid: { color: 'rgba(51, 65, 85, 0.3)' },
                  ticks: { color: '#94a3b8', font: { size: 10 } }
                }
              }
            }
          });
        }

        // 8. Geçmiş Getiri Simülatörü
        async function runSimulation() {
          const curr = document.getElementById('sim-currency').value;
          const amount = parseFloat(document.getElementById('sim-amount').value) || 0;
          const period = document.getElementById('sim-period').value;

          const start = getStartDateForPeriod(period);
          const end = new Date().toISOString().split('T')[0];

          try {
            const res = await fetch(`https://api.frankfurter.dev/v1/${start}..${end}?base=${curr}&symbols=TRY`);
            const data = await res.json();
            const dates = Object.keys(data.rates || {}).sort();
            if (dates.length < 2) return;

            const pastRate = data.rates[dates[0]].TRY;
            const nowRate = (activeSource === 'tcmb' && tcmbData && tcmbData.rates[curr]) 
              ? tcmbData.rates[curr].forexSelling 
              : data.rates[dates[dates.length - 1]].TRY;

            const pastVal = amount * pastRate;
            const nowVal = amount * nowRate;
            const profit = nowVal - pastVal;
            const profitPct = ((nowVal - pastVal) / pastVal) * 100;

            document.getElementById('sim-past-val').innerText = pastVal.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' ₺';
            document.getElementById('sim-now-val').innerText = nowVal.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' ₺';
            
            const profEl = document.getElementById('sim-profit');
            profEl.innerText = (profit >= 0 ? '+' : '') + profit.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ` ₺ (%${profitPct.toFixed(1)})`;
            profEl.className = 'text-sm font-bold mt-0.5 ' + (profit >= 0 ? 'text-emerald-400' : 'text-rose-400');
          } catch(e) {
            console.error('Simülasyon hatası:', e);
          }
        }

        // 9. Favoriler (Watchlist)
        const FAV_STORAGE_KEY = 'vibe_fav_currencies';

        function getFavorites() {
          try {
            return JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || '[]');
          } catch(e) {
            return [];
          }
        }

        function toggleFavorite() {
          const from = document.getElementById('select-from').value;
          const to = document.getElementById('select-to').value;
          const key = `${from}_${to}`;
          let favs = getFavorites();

          if (favs.includes(key)) {
            favs = favs.filter(k => k !== key);
            showToast(`${from}/${to} favorilerden çıkarıldı.`);
          } else {
            favs.unshift(key);
            showToast(`✓ ${from}/${to} favorilere eklendi!`);
          }

          localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favs));
          updateFavoriteButtonState();
          renderFavorites();
        }

        function updateFavoriteButtonState() {
          const from = document.getElementById('select-from').value;
          const to = document.getElementById('select-to').value;
          const key = `${from}_${to}`;
          const favs = getFavorites();
          const isFav = favs.includes(key);

          const star = document.getElementById('star-icon');
          const btn = document.getElementById('btn-fav-star');
          if (isFav) {
            star.innerText = '★';
            btn.className = 'text-xs text-amber-400 font-medium transition flex items-center gap-1';
          } else {
            star.innerText = '☆';
            btn.className = 'text-xs text-mistral-slate hover:text-amber-400 transition flex items-center gap-1';
          }
        }

        function renderFavorites() {
          const container = document.getElementById('favorites-container');
          const empty = document.getElementById('favorites-empty');
          const favs = getFavorites();

          if (favs.length === 0) {
            container.innerHTML = '';
            empty.classList.remove('hidden');
            return;
          }

          empty.classList.add('hidden');
          container.innerHTML = favs.map(pair => {
            const [f, t] = pair.split('_');
            const cF = CURRENCIES[f] || { flag: '' };
            const cT = CURRENCIES[t] || { flag: '' };
            return `
              <div class="p-3 rounded-xl bg-white border border-mistral-hairline hover:border-emerald-500/40 transition flex items-center justify-between">
                <div class="flex items-center gap-2 cursor-pointer" onclick="loadFavoritePair('${f}', '${t}')">
                  <span class="text-base">${cF.flag}${cT.flag}</span>
                  <span class="font-bold text-sm text-mistral-ink">${f} / ${t}</span>
                </div>
                <div class="flex items-center gap-2">
                  <button onclick="loadFavoritePair('${f}', '${t}')" class="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-medium transition">
                    Yükle
                  </button>
                  <button onclick="removeFavorite('${pair}')" class="text-xs text-mistral-stone hover:text-rose-400 transition">
                    ✕
                  </button>
                </div>
              </div>
            `;
          }).join('');
        }

        function loadFavoritePair(from, to) {
          document.getElementById('select-from').value = from;
          document.getElementById('select-to').value = to;
          onCurrencyChange(true);
          window.scrollTo({ top: 180, behavior: 'smooth' });
        }

        function removeFavorite(pair) {
          let favs = getFavorites();
          favs = favs.filter(p => p !== pair);
          localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favs));
          updateFavoriteButtonState();
          renderFavorites();
        }

        function clearAllFavorites() {
          if (!confirm('Tüm favori pariteleri silmek istediğinize emin misiniz?')) return;
          localStorage.removeItem(FAV_STORAGE_KEY);
          updateFavoriteButtonState();
          renderFavorites();
        }

        // 10. Kopyalama & Toast
        function copyRateToClipboard() {
          const from = document.getElementById('select-from').value;
          const to = document.getElementById('select-to').value;
          const rateText = document.getElementById('res-unit-rate').innerText;
          navigator.clipboard.writeText(rateText).then(() => {
            showToast('✓ Kur panoya kopyalandı!');
          });
        }

        function showToast(msg) {
          const toast = document.getElementById('doviz-toast');
          toast.innerText = msg;
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 3500);
        }

        // Başlangıç
        document.addEventListener('DOMContentLoaded', async () => {
          populateCurrencySelects();
          await Promise.all([
            fetchTcmbRates(),
            fetchEcbRates('USD')
          ]);
          setDataSource('tcmb');
          loadChartData();
          runSimulation();
          renderFavorites();
          updateFavoriteButtonState();
        });
