const COUNTRY_FLAGS = {
          TR: { flag: '🇹🇷', name: 'Türkiye' },
          DE: { flag: '🇩🇪', name: 'Almanya' },
          US: { flag: '🇺🇸', name: 'Amerika Birleşik Devletleri' },
          GB: { flag: '🇬🇧', name: 'Birleşik Krallık' },
          AZ: { flag: '🇦🇿', name: 'Azerbaycan' },
          FR: { flag: '🇫🇷', name: 'Fransa' },
          IT: { flag: '🇮🇹', name: 'İtalya' },
          ES: { flag: '🇪🇸', name: 'İspanya' },
          NL: { flag: '🇳🇱', name: 'Hollanda' },
          CH: { flag: '🇨🇭', name: 'İsviçre' },
          SE: { flag: '🇸🇪', name: 'İsveç' },
          NO: { flag: '🇳🇴', name: 'Norveç' },
          DK: { flag: '🇩🇰', name: 'Danimarka' },
          GR: { flag: '🇬🇷', name: 'Yunanistan' },
          JP: { flag: '🇯🇵', name: 'Japonya' },
          CA: { flag: '🇨🇦', name: 'Kanada' },
          AU: { flag: '🇦🇺', name: 'Avustralya' },
          RU: { flag: '🇷🇺', name: 'Rusya' },
          CN: { flag: '🇨🇳', name: 'Çin' },
          BR: { flag: '🇧🇷', name: 'Brezilya' }
        };

        const MONTH_NAMES = [
          'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
          'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];

        const DAY_NAMES_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

        // Yaygın tatil adlarının Türkçe çevirileri (Nager.Date name → Türkçe)
        const HOLIDAY_TR_MAP = {
          "new year's day": 'Yılbaşı',
          "new year day": 'Yılbaşı',
          "eid al-fitr first day": 'Ramazan Bayramı 1. Gün',
          "eid al-fitr second day": 'Ramazan Bayramı 2. Gün',
          "eid al-fitr third day": 'Ramazan Bayramı 3. Gün',
          "eid al-fitr fourth day": 'Ramazan Bayramı 4. Gün',
          "eid al-fitr": 'Ramazan Bayramı',
          "eid al-adha first day": 'Kurban Bayramı 1. Gün',
          "eid al-adha second day": 'Kurban Bayramı 2. Gün',
          "eid al-adha third day": 'Kurban Bayramı 3. Gün',
          "eid al-adha fourth day": 'Kurban Bayramı 4. Gün',
          "eid al-adha": 'Kurban Bayramı',
          "national independence & children's day": 'Ulusal Egemenlik ve Çocuk Bayramı',
          "national sovereignty and children's day": 'Ulusal Egemenlik ve Çocuk Bayramı',
          "commemoration of atatürk, youth and sports day": "Atatürk'ü Anma, Gençlik ve Spor Bayramı",
          "atatürk commemoration & youth day": "Atatürk'ü Anma, Gençlik ve Spor Bayramı",
          "ataturk commemoration & youth day": "Atatürk'ü Anma, Gençlik ve Spor Bayramı",
          "democracy and national unity day": 'Demokrasi ve Millî Birlik Günü',
          "labour day": 'İşçi Bayramı',
          "labor day": 'İşçi Bayramı',
          "good friday": "Kutsal Cuma",
          "easter monday": 'Paskalya Pazartesisi',
          "easter sunday": 'Paskalya',
          "easter": 'Paskalya',
          "ascension day": "Mesih'in Yükselişi",
          "pentecost": 'Hamsin Yortusu',
          "whit monday": 'Hamsin Yortusu (Pazartesi)',
          "christmas day": 'Noel',
          "christmas eve": 'Noel Arifesi',
          "second day of christmas": 'Noel 2. Gün',
          "boxing day": 'Noel Sonrası Kutlama Günü',
          "epiphany": 'Epifanya',
          "assumption day": "Meryem'in Göğe Yükselişi",
          "assumption of mary": "Meryem'in Göğe Yükselişi",
          "all saints' day": 'Azizler Günü',
          "all souls' day": 'Ölüler Günü',
          "immaculate conception": "Lekesiz Geçme",
          "independence day": 'Bağımsızlık Günü',
          "victory day": 'Zafer Bayramı',
          "republic day": 'Cumhuriyet Bayramı',
          "constitution day": 'Anayasa Günü',
          "national day": 'Ulusal Gün',
          "liberation day": 'Kurtuluş Günü',
          "unity day": 'Birlik Günü',
          "freedom day": 'Özgürlük Günü',
          "midsummer day": 'Yaz Ortası Günü',
          "midsummer eve": 'Yaz Ortası Arifesi',
          "saint stephen's day": 'Aziz Stefan Günü',
          "st. patrick's day": "Aziz Patrik Günü",
          "st george's day": 'Aziz Giorgi Günü',
          "spring bank holiday": 'İlkbahar Tatili',
          "summer bank holiday": 'Yaz Tatili',
          "queen's birthday": "Kraliçenin Doğum Günü",
          "king's birthday": "Kralın Doğum Günü",
          "king's day": "Kral Günü",
          "remembrance day": 'Anma Günü',
          "armistice day": 'Mütareke Günü',
          "thanksgiving day": "Şükran Günü",
          "columbus day": "Kolomb Günü",
          "martin luther king jr. day": "Martin Luther King Jr. Günü",
          "memorial day": "Şehitleri Anma Günü",
          "presidents' day": "Başkanlar Günü",
          "juneteenth": "Juneteenth (Özgürlük Günü)",
          "family day": "Aile Günü",
          "heritage day": "Miras Günü",
          "canada day": "Kanada Günü",
          "australia day": "Avustralya Günü",
          "anzac day": "Anzak Günü",
          "orthodox christmas day": "Ortodoks Noel",
          "orthodox easter monday": "Ortodoks Paskalya Pazartesisi",
          "orthodox easter": "Ortodoks Paskalya",
          "women's day": "Kadınlar Günü",
          "international women's day": "Dünya Kadınlar Günü",
          "children's day": "Çocuk Bayramı",
          "youth day": "Gençlik ve Spor Bayramı",
          "mother's day": "Anneler Günü",
          "father's day": "Babalar Günü",
          "new year's eve": "Yılbaşı Arifesi",
          "new year holiday": "Yılbaşı Tatili",
          "day after new year's day": "Yılbaşı Sonrası",
          "restore the independence of lithuania": "Litvanya Bağımsızlığının Yeniden Tesisi",
          "day of restoration of the state of lithuania": "Litvanya Devletinin Yeniden Kuruluşu",
          "german unity day": "Alman Birlik Günü",
          "reformation day": "Reformasyon Günü",
          "victory in europe day": "Avrupa Zafer Günü",
          "bastille day": "Bastille Günü",
          "veterans day": "Gaziler Günü",
          "washington's birthday": "Washington'un Doğum Günü",
          "thanksgiving": "Şükran Günü",
          "early may bank holiday": "Mayıs Başı Banka Tatili"
        };

        // Tek noktadan Türkçe tatil adı çözümü: localName → sözlük → İngilizce name
        function trHolidayName(h) {
          if (!h) return '';
          // 1. Yerel ad Türkçe karakterli mi? (TR/AZ gibi ülkelerde API zaten Türkçe döner)
          const local = h.localName || '';
          const english = h.name || '';
          const hasTrChars = /[çğıöşüÇĞİÖŞÜ]/.test(local) || /ıst|Bayram|Günü|Bayramı/.test(local);
          // Türkçe ad zaten yerelse doğrudan kullan
          if (hasTrChars) return local;
          // 2. Sözlükte İngilizce adın karşılığı var mı?
          const key = english.toLowerCase().trim();
          if (HOLIDAY_TR_MAP[key]) return HOLIDAY_TR_MAP[key];
          // 3. Yerel ad da İngilizce ad da çevrilemediyse yerel adı göster
          return local || english;
        }

        // Kısa hafta günü adı (Pzt, Sal, Çar...)
        function shortWeekday(dateStr) {
          const d = new Date(dateStr);
          const names = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
          return names[d.getDay()] || '';
        }

        let selectedCountries = ['TR']; // Varsayılan Türkiye
        let currentYear = new Date().getFullYear(); // Dinamik: her zaman güncel yıl
        let currentView = 'timeline'; // 'timeline' | 'matrix' | 'calendar'
        let holidaysCache = {}; // { '2026_TR': [...] }
        let allAvailableCountries = [];

        // 1. Ülke Yönetimi
        async function fetchAvailableCountries() {
          try {
            const res = await fetch('https://date.nager.at/api/v3/AvailableCountries');
            const data = await res.json();
            allAvailableCountries = data;

            const select = document.getElementById('select-all-countries');
            select.innerHTML = '<option value="">+ Başka bir ülke ekle...</option>';
            data.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => {
              const info = COUNTRY_FLAGS[c.countryCode] || { flag: '🌐' };
              const opt = new Option(`${info.flag} ${c.name} (${c.countryCode})`, c.countryCode);
              select.add(opt);
            });
          } catch(e) {}
        }

        function toggleCountry(code) {
          code = code.toUpperCase();
          if (selectedCountries.includes(code)) {
            if (selectedCountries.length === 1) {
              showToast('En az bir ülke seçili kalmalıdır.');
              return;
            }
            selectedCountries = selectedCountries.filter(c => c !== code);
          } else {
            selectedCountries.push(code);
          }
          renderSelectedCountryTags();
          loadData();
        }

        function renderSelectedCountryTags() {
          const container = document.getElementById('selected-countries-container');
          container.innerHTML = selectedCountries.map(code => {
            const info = COUNTRY_FLAGS[code] || { flag: '🌐', name: code };
            const isTr = (code === 'TR');
            return `
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border ${isTr ? 'border-amber-500/50 bg-amber-500/10 text-amber-300' : 'border-mistral-hairline text-mistral-ink'} text-xs font-bold shadow-sm">
                <span>${info.flag}</span>
                <span>${info.name}</span>
                <button onclick="toggleCountry('${code}')" class="ml-1 text-mistral-stone hover:text-rose-400 font-bold transition">✕</button>
              </span>
            `;
          }).join('');

          // Köprü tatil rozeti (ilk seçili ülke)
          const primary = selectedCountries[0] || 'TR';
          const primaryInfo = COUNTRY_FLAGS[primary] || { flag: '🌐', name: primary };
          document.getElementById('bridge-country-badge').innerText = `${primaryInfo.flag} ${primaryInfo.name}`;
        }

        // Dinamik yıl listesi: güncel yıl + sonraki 2 yıl (kod güncellemesi gerektirmez)
        function getAvailableYears() {
          const y = new Date().getFullYear();
          return [y, y + 1, y + 2];
        }

        function renderYearButtons() {
          const container = document.getElementById('year-buttons');
          if (!container) return;
          container.innerHTML = getAvailableYears().map(y => {
            const active = (y === currentYear);
            return `<button onclick="setYear(${y})" id="btn-year-${y}" class="px-3 py-1.5 rounded-xl text-xs font-bold ${active ? 'bg-amber-500 text-slate-950 transition shadow' : 'text-mistral-slate hover:text-white transition'}">${y}</button>`;
          }).join('');
        }

        function setYear(yr) {
          currentYear = yr;
          getAvailableYears().forEach(y => {
            const btn = document.getElementById('btn-year-' + y);
            if (!btn) return;
            if (y === yr) {
              btn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 transition shadow';
            } else {
              btn.className = 'px-3 py-1.5 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition';
            }
          });
          loadData();
        }

        function setViewMode(mode) {
          currentView = mode;
          ['timeline', 'matrix', 'calendar'].forEach(m => {
            const btn = document.getElementById('btn-view-' + m);
            if (m === mode) {
              btn.className = 'px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 transition flex items-center gap-1.5 shadow';
            } else {
              btn.className = 'px-4 py-1.5 rounded-lg text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-1.5';
            }
          });
          renderHolidaysView();
        }

        // 2. Veri Yükleme (Tatiller & Uzun Hafta Sonları)
        async function loadData() {
          showLoading(true);

          try {
            // Seçili ülkelerin tatillerini eşzamanlı çek
            await Promise.all(
              selectedCountries.map(async code => {
                const key = `${currentYear}_${code}`;
                if (!holidaysCache[key]) {
                  const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${code}`);
                  if (res.ok) {
                    holidaysCache[key] = await res.json();
                  }
                }
              })
            );

            // İlk seçili ülkenin köprü tatillerini çek
            const primaryCode = selectedCountries[0] || 'TR';
            const lwRes = await fetch(`https://date.nager.at/api/v3/LongWeekend/${currentYear}/${primaryCode}`);
            if (lwRes.ok) {
              const lwData = await lwRes.json();
              renderLongWeekends(lwData);
            }
          } catch(e) {
            console.error(e);
          } finally {
            showLoading(false);
            renderHolidaysView();
          }
        }

        function showLoading(show) {
          document.getElementById('loading-spinner').className = show ? 'py-16 text-center text-mistral-slate text-sm flex flex-col items-center gap-3' : 'hidden';
          if (show) {
            document.getElementById('holidays-main-container').innerHTML = '';
          }
        }

        // 3. Köprü Tatil Fırsatlarını Çiz
        function renderLongWeekends(list) {
          const container = document.getElementById('bridge-days-container');
          if (!list || list.length === 0) {
            container.innerHTML = '<div class="col-span-full text-xs text-mistral-stone">Bu yıl için uzun hafta sonu verisi bulunamadı.</div>';
            return;
          }

          // En cazip 4 köprü fırsatını filtrele
          const best = list.filter(w => w.dayCount >= 3).slice(0, 4);

          container.innerHTML = best.map(w => {
            const start = new Date(w.startDate);
            const end = new Date(w.endDate);
            const formatD = (d) => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;

            return `
              <div class="p-4 rounded-2xl bg-white border border-mistral-hairline shadow flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${w.needBridgeDay ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}">
                      ${w.dayCount} Gün Kesintisiz Tatil
                    </span>
                    <span class="text-[10px] text-mistral-slate font-mono">${w.needBridgeDay ? '⚡ 1 Gün İzin' : '✓ 0 Gün İzin'}</span>
                  </div>
                  <h4 class="font-black text-sm text-mistral-ink">${formatD(start)} - ${formatD(end)}</h4>
                  <p class="text-[11px] text-mistral-slate mt-1">
                    ${w.needBridgeDay ? 'Cuma veya Pazartesi köprüsü ile 4 gün tatil' : 'Hafta sonuyla birleşen doğal resmi tatil'}
                  </p>
                </div>
              </div>
            `;
          }).join('');
        }

        // 4. Görünüm Modlarını Çiz
        function renderHolidaysView() {
          const container = document.getElementById('holidays-main-container');
          const summaryCount = document.getElementById('holidays-summary-count');

          // Seçili tüm ülkelerin tatillerini birleştir
          let allHolidays = [];
          selectedCountries.forEach(code => {
            const list = holidaysCache[`${currentYear}_${code}`] || [];
            list.forEach(h => {
              allHolidays.push({ ...h, countryCode: code });
            });
          });

          summaryCount.innerText = `Toplam ${allHolidays.length} resmi tatil (${selectedCountries.length} ülke)`;

          if (currentView === 'timeline') {
            renderTimelineView(allHolidays);
          } else if (currentView === 'matrix') {
            renderMatrixView();
          } else if (currentView === 'calendar') {
            renderCalendarView(allHolidays);
          }
        }

        // Görünüm 1: Kronolojik Birleşik Zaman Çizelgesi
        function renderTimelineView(list) {
          const container = document.getElementById('holidays-main-container');

          // Tarihe göre sırala
          list.sort((a,b) => new Date(a.date) - new Date(b.date));

          // Aynı tarihteki tatilleri grupla
          const dateGroups = {};
          list.forEach(h => {
            if (!dateGroups[h.date]) dateGroups[h.date] = [];
            dateGroups[h.date].push(h);
          });

          const dates = Object.keys(dateGroups);

          container.innerHTML = `
            <div class="rounded-3xl bg-white border border-mistral-hairline overflow-hidden shadow-xl divide-y divide-slate-700/60">
              ${dates.map(dateStr => {
                const dateObj = new Date(dateStr);
                const dayName = dateObj.toLocaleDateString('tr-TR', { weekday: 'long' });
                const dayNum = dateObj.getDate();
                const monthName = MONTH_NAMES[dateObj.getMonth()];
                const items = dateGroups[dateStr];
                const isMulti = items.length > 1;

                return `
                  <div class="holiday-row p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition">
                    <!-- Tarih Bloğu -->
                    <div class="flex items-center gap-4 shrink-0">
                      <div class="w-14 h-14 rounded-2xl bg-white border border-mistral-hairline flex flex-col items-center justify-center text-center shadow-inner">
                        <span class="text-xs text-amber-400 font-bold uppercase leading-none">${monthName.slice(0,3)}</span>
                        <span class="text-xl font-black text-white font-mono leading-tight">${dayNum}</span>
                      </div>
                      <div>
                        <span class="font-bold text-sm text-mistral-ink block">${dayName}</span>
                        <span class="text-[11px] text-mistral-stone font-mono">${dateStr}</span>
                      </div>
                    </div>

                    <!-- Tatiller Listesi -->
                    <div class="flex-1 space-y-2">
                      ${items.map(item => {
                        const cInfo = COUNTRY_FLAGS[item.countryCode] || { flag: '🌐', name: item.countryCode };
                        return `
                          <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-mistral-hairline">
                            <div class="flex items-center gap-2">
                              <span class="text-base">${cInfo.flag}</span>
                              <span class="font-bold text-xs text-mistral-ink">${trHolidayName(item)}</span>
                            </div>
                            <span class="text-[10px] px-2 py-0.5 rounded-md bg-white text-mistral-slate font-mono">
                              ${cInfo.name}
                            </span>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }

        // Görünüm 2: Ülke Karşılaştırma Sütunları
        function renderMatrixView() {
          const container = document.getElementById('holidays-main-container');

          container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-${Math.min(4, selectedCountries.length)} gap-4 items-start">
              ${selectedCountries.map(code => {
                const cInfo = COUNTRY_FLAGS[code] || { flag: '🌐', name: code };
                const list = holidaysCache[`${currentYear}_${code}`] || [];

                return `
                  <div class="p-5 rounded-3xl bg-white border border-mistral-hairline shadow-xl space-y-3">
                    <div class="flex items-center justify-between pb-3 border-b border-mistral-hairline">
                      <div class="flex items-center gap-2">
                        <span class="text-2xl">${cInfo.flag}</span>
                        <h3 class="font-black text-sm text-mistral-ink">${cInfo.name}</h3>
                      </div>
                      <span class="px-2 py-0.5 rounded bg-white text-amber-400 font-mono text-xs font-bold">
                        ${list.length} Tatil
                      </span>
                    </div>

                    <div class="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                      ${list.map(h => {
                        const d = new Date(h.date);
                        return `
                          <div class="p-2.5 rounded-xl bg-white border border-mistral-hairline text-xs">
                            <div class="flex items-center justify-between mb-1">
                              <span class="text-mistral-slate font-mono text-[10px]">${h.date}</span>
                              <span class="font-bold text-mistral-ink bg-mistral-cream px-1.5 py-0.5 rounded text-[11px]">${shortWeekday(h.date)}</span>
                            </div>
                            <div class="font-bold text-mistral-ink">${trHolidayName(h)}</div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }

        // Görünüm 3: Ay Gruplu Takvim Görünümü
        function renderCalendarView(list) {
          const container = document.getElementById('holidays-main-container');

          // Aylara göre grupla (0..11)
          const months = Array.from({ length: 12 }, () => []);
          list.forEach(h => {
            const m = new Date(h.date).getMonth();
            months[m].push(h);
          });

          container.innerHTML = `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${months.map((mList, mIdx) => {
                mList.sort((a,b) => new Date(a.date) - new Date(b.date));
                return `
                  <div class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between mb-3 pb-2 border-b border-mistral-hairline">
                        <h3 class="font-black text-sm text-amber-400">${MONTH_NAMES[mIdx]} ${currentYear}</h3>
                        <span class="text-xs text-mistral-slate font-mono">${mList.length} Tatil</span>
                      </div>

                      ${mList.length === 0 ? `
                        <div class="text-center py-6 text-xs text-mistral-stone">Bu ayda resmi tatil yok.</div>
                      ` : `
                        <div class="space-y-2">
                          ${mList.map(h => {
                            const cInfo = COUNTRY_FLAGS[h.countryCode] || { flag: '🌐' };
                            const d = new Date(h.date).getDate();
                            return `
                              <div class="p-2 rounded-xl bg-white border border-mistral-hairline flex items-center justify-between text-xs">
                                <div class="flex items-center gap-2 truncate">
                                  <span>${cInfo.flag}</span>
                                  <span class="font-semibold text-mistral-ink truncate">${trHolidayName(h)}</span>
                                </div>
                                <span class="text-right shrink-0 ml-2">
                                  <span class="block text-amber-400 font-bold font-mono text-[11px]">${d} ${MONTH_NAMES[mIdx].slice(0,3)}</span>
                                  <span class="block text-mistral-slate font-bold text-[10px]">${shortWeekday(h.date)}</span>
                                </span>
                              </div>
                            `;
                          }).join('')}
                        </div>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }

        // 5. Takvim Dışa Aktarma (.ics / iCal Generator)
        function exportICS() {
          let allHolidays = [];
          selectedCountries.forEach(code => {
            const list = holidaysCache[`${currentYear}_${code}`] || [];
            list.forEach(h => allHolidays.push({ ...h, countryCode: code }));
          });

          if (allHolidays.length === 0) {
            showToast('Dışa aktarılacak tatil verisi bulunamadı.');
            return;
          }

          let icsContent = "BEGIN:VCALENDAR\\nVERSION:2.0\\nPRODID:-//VibeCodedApps//Global Holidays Calendar//TR\\nCALSCALE:GREGORIAN\\nMETHOD:PUBLISH\\n";

          allHolidays.forEach(h => {
            const dateClean = h.date.replace(/-/g, '');
            const cInfo = COUNTRY_FLAGS[h.countryCode] || { name: h.countryCode };
            const summary = `${cInfo.name} Tatili: ${trHolidayName(h)}`;

            icsContent += "BEGIN:VEVENT\\n";
            icsContent += `UID:${h.date}-${h.countryCode}@vibecodedapps\\n`;
            icsContent += `DTSTAMP:${dateClean}T000000Z\\n`;
            icsContent += `DTSTART;VALUE=DATE:${dateClean}\\n`;
            icsContent += `SUMMARY:${summary}\\n`;
            icsContent += `DESCRIPTION:${trHolidayName(h)} - ${cInfo.name} Resmi Tatili\\n`;
            icsContent += "STATUS:CONFIRMED\\n";
            icsContent += "TRANSP:TRANSPARENT\\n";
            icsContent += "END:VEVENT\\n";
          });

          icsContent += "END:VCALENDAR";

          const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `tatil-takvimi-${currentYear}-${selectedCountries.join('-')}.ics`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          showToast(`✓ ${allHolidays.length} resmi tatil .ics dosyası olarak indirildi!`);
        }

        function showToast(msg) {
          const toast = document.getElementById('tatil-toast');
          toast.innerText = msg;
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 3500);
        }

        // Başlangıç
        document.addEventListener('DOMContentLoaded', async () => {
          currentYear = new Date().getFullYear();
          renderYearButtons();
          renderSelectedCountryTags();
          await fetchAvailableCountries();
          await loadData();
        });
