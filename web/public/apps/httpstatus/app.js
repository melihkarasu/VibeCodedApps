let allStatuses = [];

        async function loadStatuses() {
          try {
            const res = await fetch('/api/http/statuses');
            const data = await res.json();
            if (!data.success) throw new Error('HTTP kodları alınamadı');

            allStatuses = data.statuses || [];
            filterStatusCodes();
          } catch(err) {
            alert('Durum kodları yüklenemedi: ' + err.message);
          }
        }

        function filterStatusCodes() {
          const q = (document.getElementById('status-search').value || '').trim().toLowerCase();
          const cat = document.getElementById('status-cat-select').value;

          const list = allStatuses.filter(s => {
            const matchQ = !q || String(s.code).includes(q) || s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
            const matchCat = cat === 'all' || s.category.includes(cat);
            return matchQ && matchCat;
          });

          renderGrid(list);
        }

        function renderGrid(list) {
          const grid = document.getElementById('status-grid');
          if (list.length === 0) {
            grid.innerHTML = '<div class="col-span-full py-12 text-center text-mistral-stone font-medium text-sm">Arama kriterlerine uygun HTTP kodu bulunamadı.</div>';
            return;
          }

          grid.innerHTML = list.map(s => {
            let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            if (s.code >= 300 && s.code < 400) badgeBg = 'bg-blue-50 text-blue-800 border-blue-200';
            if (s.code >= 400 && s.code < 500) badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
            if (s.code >= 500) badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';

            return `
              <div onclick="openModal(${s.code})" class="p-5 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-orange/40 hover:shadow-md transition duration-200 flex flex-col justify-between group cursor-pointer">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-2xl font-bold font-mono text-mistral-ink group-hover:text-mistral-orange transition">${s.code}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}">
                      ${s.category.split(' ')[0]}
                    </span>
                  </div>
                  <h4 class="text-base font-bold font-editorial text-mistral-ink mb-1.5 truncate">${s.title}</h4>
                  <p class="text-xs text-mistral-slate line-clamp-2 leading-relaxed">
                    ${s.desc}
                  </p>
                </div>

                <div class="pt-3 mt-4 border-t border-mistral-hairline flex items-center justify-between text-xs font-semibold text-mistral-orange">
                  <span>Detayları İncele &rarr;</span>
                  <span class="text-[10px] text-mistral-stone font-mono">RFC Standart</span>
                </div>
              </div>
            `;
          }).join('');
        }

        function openModal(code) {
          const s = allStatuses.find(x => x.code === code);
          if (!s) return;

          document.getElementById('m-code').innerText = s.code;
          document.getElementById('m-title').innerText = s.title;
          document.getElementById('m-category').innerText = s.category.toUpperCase();
          document.getElementById('m-desc').innerText = s.desc;
          document.getElementById('m-img').src = s.catImg;
          document.getElementById('m-curl').innerText = `curl -I https://httpstat.us/${s.code}`;

          document.getElementById('status-modal').classList.remove('hidden');
        }

        function closeModal() {
          document.getElementById('status-modal').classList.add('hidden');
        }

        function detectHardware() {
          document.getElementById('hw-screen').innerText = `${window.screen.width} x ${window.screen.height}`;
          document.getElementById('hw-dpr').innerText = (window.devicePixelRatio || 1) + 'x';
          document.getElementById('hw-cores').innerText = (navigator.hardwareConcurrency || '-') + ' Çekirdek';
          document.getElementById('hw-online').innerText = navigator.onLine ? 'Çevrimiçi' : 'Çevrimdışı';
          document.getElementById('hw-lang').innerText = navigator.language || 'tr-TR';

          try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
              const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
              const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'WebGL Destekli';
              document.getElementById('hw-gpu').innerText = renderer.replace(/ANGLE \\(|\\)/g, '').split(',')[0].slice(0, 30);
            } else {
              document.getElementById('hw-gpu').innerText = 'WebGL Kapalı';
            }
          } catch(e) {
            document.getElementById('hw-gpu').innerText = 'Standart GPU';
          }
        }

        document.addEventListener('DOMContentLoaded', () => {
          loadStatuses();
          detectHardware();
        });
