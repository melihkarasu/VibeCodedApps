let currentTab = 'url';
      let currentLogo = null;
      let qrCodeInstance = null;

      // Preset Logo SVG data URIs
      const presetLogos = {
        github: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230f172a"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>',
        wifi: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230f172a"><path d="M12 3c-4.97 0-9.47 2.01-12.73 5.27l1.41 1.41C3.41 6.95 7.47 5 12 5s8.59 1.95 11.32 4.68l1.41-1.41C21.47 5.01 16.97 3 12 3zm0 4c-3.87 0-7.37 1.57-9.9 4.1l1.41 1.41C5.64 10.38 8.64 9 12 9s6.36 1.38 8.49 3.51l1.41-1.41C19.37 8.57 15.87 7 12 7zm0 4c-2.76 0-5.26 1.12-7.07 2.93l1.41 1.41C7.75 13.93 9.75 13 12 13s4.25.93 5.66 2.34l1.41-1.41C17.26 12.12 14.76 11 12 11zm0 4c-1.66 0-3.16.67-4.24 1.76l4.24 4.24 4.24-4.24C15.16 15.67 13.66 15 12 15z"/></svg>',
        link: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230f172a"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
        star: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23eab308"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
        bolt: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f59e0b"><path d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.97 17.55 11 21 11 21z"/></svg>'
      };

      function setTab(tab) {
        currentTab = tab;
        document.querySelectorAll('.tab-btn').forEach(b => {
          b.className = 'tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-slate transition flex flex-col items-center gap-1';
        });
        const activeBtn = document.getElementById('tab-' + tab);
        if (activeBtn) {
          activeBtn.className = 'tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-teal-500 bg-teal-500/20 text-teal-300 transition flex flex-col items-center gap-1';
        }
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
        const activePane = document.getElementById('pane-' + tab);
        if (activePane) activePane.classList.remove('hidden');
        updateQR();
      }

      function getPayloadData() {
        switch (currentTab) {
          case 'url':
            return document.getElementById('input-url').value.trim() || 'https://github.com/melihkarasu';
          case 'wifi':
            const ssid = document.getElementById('wifi-ssid').value.trim();
            const pass = document.getElementById('wifi-pass').value;
            const type = document.getElementById('wifi-type').value;
            const hidden = document.getElementById('wifi-hidden').checked;
            return `WIFI:S:${ssid};T:${type};P:${pass};H:${hidden};;`;
          case 'vcard':
            const fn = document.getElementById('vc-first').value.trim();
            const ln = document.getElementById('vc-last').value.trim();
            const ph = document.getElementById('vc-phone').value.trim();
            const em = document.getElementById('vc-email').value.trim();
            const org = document.getElementById('vc-org').value.trim();
            const ti = document.getElementById('vc-title').value.trim();
            return `BEGIN:VCARD\\nVERSION:3.0\\nN:${ln};${fn}\\nFN:${fn} ${ln}\\nORG:${org}\\nTITLE:${ti}\\nTEL:${ph}\\nEMAIL:${em}\\nEND:VCARD`;
          case 'text':
            return document.getElementById('input-text').value.trim() || 'VibeCodedApps QR Studio';
          case 'email':
            const to = document.getElementById('mail-to').value.trim();
            const sub = encodeURIComponent(document.getElementById('mail-subject').value.trim());
            const bod = encodeURIComponent(document.getElementById('mail-body').value.trim());
            return `mailto:${to}?subject=${sub}&body=${bod}`;
          case 'crypto':
            const ctype = document.getElementById('crypto-type').value;
            const addr = document.getElementById('crypto-address').value.trim();
            return addr ? `${ctype}:${addr}` : 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
          default:
            return 'https://github.com/melihkarasu';
        }
      }

      function toggleGradientMode() {
        const isGrad = document.getElementById('check-gradient').checked;
        const col2 = document.getElementById('col-color-2');
        if (isGrad) {
          col2.classList.remove('hidden');
        } else {
          col2.classList.add('hidden');
        }
      }

      function syncColorInput(idx) {
        const txt = document.getElementById(`color-${idx}-text`).value;
        if (/^#[0-9A-F]{6}$/i.test(txt)) {
          document.getElementById(`color-${idx}`).value = txt;
          updateQR();
        }
      }

      function applyPreset(c1, c2, bg = '#ffffff') {
        document.getElementById('color-1').value = c1;
        document.getElementById('color-1-text').value = c1;
        document.getElementById('color-2').value = c2;
        document.getElementById('color-2-text').value = c2;
        document.getElementById('check-gradient').checked = true;
        document.getElementById('col-color-2').classList.remove('hidden');
        document.getElementById('bg-mode').value = bg;
        handleBgChange();
        updateQR();
      }

      function handleBgChange() {
        const bgVal = document.getElementById('bg-mode').value;
        const box = document.getElementById('qr-box-wrapper');
        if (bgVal === 'transparent') {
          box.className = 'p-6 rounded-2xl checkerboard border border-mistral-hairline flex items-center justify-center transition shadow-inner';
        } else if (bgVal === '#0f172a' || bgVal === '#000000') {
          box.className = 'p-6 rounded-2xl bg-mistral-canvas border border-mistral-hairline flex items-center justify-center transition shadow-inner';
        } else {
          box.className = 'p-6 rounded-2xl bg-white border border-mistral-hairline flex items-center justify-center transition shadow-inner';
        }
      }

      function setPresetLogo(key) {
        currentLogo = presetLogos[key] || null;
        document.getElementById('btn-remove-logo').classList.remove('hidden');
        document.getElementById('logo-sliders').classList.remove('hidden');
        updateQR();
      }

      function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            currentLogo = e.target.result;
            document.getElementById('btn-remove-logo').classList.remove('hidden');
            document.getElementById('logo-sliders').classList.remove('hidden');
            updateQR();
          };
          reader.readAsDataURL(file);
        }
      }

      function removeLogo() {
        currentLogo = null;
        document.getElementById('file-logo').value = '';
        document.getElementById('btn-remove-logo').classList.add('hidden');
        document.getElementById('logo-sliders').classList.add('hidden');
        updateQR();
      }

      function buildQROptions(customSize = 280) {
        const data = getPayloadData();
        const dotsType = document.getElementById('opt-dots-type').value;
        const csType = document.getElementById('opt-corners-square-type').value;
        const cdType = document.getElementById('opt-corners-dot-type').value;
        const ecLevel = document.querySelector('input[name="ec-level"]:checked')?.value || 'Q';

        const isGrad = document.getElementById('check-gradient').checked;
        const c1 = document.getElementById('color-1').value;
        const c2 = document.getElementById('color-2').value;
        const bg = document.getElementById('bg-mode').value;

        // Keep text inputs in sync
        document.getElementById('color-1-text').value = c1;
        document.getElementById('color-2-text').value = c2;

        const dotsOptions = {
          type: dotsType
        };

        if (isGrad) {
          dotsOptions.gradient = {
            type: 'linear',
            rotation: 45,
            colorStops: [
              { offset: 0, color: c1 },
              { offset: 1, color: c2 }
            ]
          };
        } else {
          dotsOptions.color = c1;
        }

        const cornersSquareOptions = {
          type: csType,
          color: c1
        };

        const cornersDotOptions = {
          type: cdType,
          color: isGrad ? c2 : c1
        };

        const lSize = parseFloat(document.getElementById('logo-size').value) || 0.35;
        const lMargin = parseInt(document.getElementById('logo-margin').value) || 5;

        return {
          width: customSize,
          height: customSize,
          type: 'svg',
          data: data,
          image: currentLogo || undefined,
          dotsOptions: dotsOptions,
          cornersSquareOptions: cornersSquareOptions,
          cornersDotOptions: cornersDotOptions,
          backgroundOptions: {
            color: bg === 'transparent' ? 'transparent' : bg
          },
          imageOptions: {
            crossOrigin: 'anonymous',
            margin: lMargin,
            imageSize: lSize
          },
          qrOptions: {
            errorCorrectionLevel: ecLevel
          }
        };
      }

      function updateQR() {
        const container = document.getElementById('qr-canvas-container');
        if (!container) return;

        const options = buildQROptions(260);

        if (!qrCodeInstance) {
          qrCodeInstance = new QRCodeStyling(options);
          container.innerHTML = '';
          qrCodeInstance.append(container);
        } else {
          qrCodeInstance.update(options);
        }

        // Byte hesaplama
        const byteCount = new TextEncoder().encode(options.data).length;
        document.getElementById('qr-byte-badge').innerText = byteCount + ' Bayt';
      }

      function downloadQR(format) {
        const size = parseInt(document.getElementById('export-size').value) || 1000;
        const highResOptions = buildQROptions(size);
        const downloader = new QRCodeStyling(highResOptions);
        showToast('QR Kod ' + format.toUpperCase() + ' olarak indiriliyor...');
        downloader.download({
          name: 'qr-studio-' + currentTab + '-' + Date.now(),
          extension: format
        });
      }

      function copyToClipboard() {
        const size = 600;
        const options = buildQROptions(size);
        options.type = 'canvas';
        const cCode = new QRCodeStyling(options);
        cCode.getRawData('png').then(function(blob) {
          if (blob && navigator.clipboard && window.ClipboardItem) {
            navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]).then(function() {
              showToast('✓ QR Kod panoya kopyalandı!');
            }).catch(function() {
              showToast('Panoya kopyalama başarısız oldu.');
            });
          }
        });
      }

      function showToast(msg) {
        const toast = document.getElementById('status-toast');
        toast.innerText = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3500);
      }

      // -------------------------------------------------------------
      // Kayıtlı QR Kodlarım (Storage & Management)
      // -------------------------------------------------------------
      const STORAGE_KEY = 'vibe_saved_qrs';

      function getSavedQrs() {
        try {
          return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch(e) {
          return [];
        }
      }

      function saveCurrentQR() {
        const title = prompt('Bu QR kodu için bir başlık girin:', (currentTab.toUpperCase() + ' QR ' + new Date().toLocaleDateString('tr-TR')));
        if (!title) return;

        const qrs = getSavedQrs();
        const item = {
          id: 'qr_' + Date.now(),
          title: title,
          tab: currentTab,
          data: getPayloadData(),
          // Sekme form verileri (tüm alanlar eksiksiz saklanır)
          formData: {
            url: document.getElementById('input-url')?.value || '',
            wifi: {
              ssid: document.getElementById('wifi-ssid')?.value || '',
              pass: document.getElementById('wifi-pass')?.value || '',
              type: document.getElementById('wifi-type')?.value || 'WPA',
              hidden: document.getElementById('wifi-hidden')?.checked || false
            },
            vcard: {
              first: document.getElementById('vc-first')?.value || '',
              last: document.getElementById('vc-last')?.value || '',
              phone: document.getElementById('vc-phone')?.value || '',
              email: document.getElementById('vc-email')?.value || '',
              org: document.getElementById('vc-org')?.value || '',
              title: document.getElementById('vc-title')?.value || '',
              url: document.getElementById('vc-url')?.value || '',
              addr: document.getElementById('vc-addr')?.value || ''
            },
            text: document.getElementById('input-text')?.value || '',
            email: {
              to: document.getElementById('mail-to')?.value || '',
              sub: document.getElementById('mail-sub')?.value || '',
              body: document.getElementById('mail-body')?.value || ''
            },
            crypto: {
              type: document.getElementById('crypto-type')?.value || 'bitcoin',
              address: document.getElementById('crypto-address')?.value || '',
              amount: document.getElementById('crypto-amount')?.value || ''
            }
          },
          // Renk ve Desen ayarları
          color1: document.getElementById('color-1').value,
          color2: document.getElementById('color-2').value,
          isGrad: document.getElementById('check-gradient').checked,
          bg: document.getElementById('bg-mode').value,
          dotsType: document.getElementById('opt-dots-type').value,
          cornersSquareType: document.getElementById('opt-corners-square-type').value,
          cornersDotType: document.getElementById('opt-corners-dot-type').value,
          ecLevel: document.querySelector('input[name="ec-level"]:checked')?.value || 'Q',
          // Logo ayarları
          logo: currentLogo || null,
          logoSize: document.getElementById('logo-size')?.value || '0.35',
          date: new Date().toLocaleString('tr-TR')
        };

        qrs.unshift(item);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(qrs));
        renderSavedQrs();
        showToast('✓ "' + title + '" tüm bilgileriyle koleksiyonunuza kaydedildi!');
      }

      function renderSavedQrs() {
        const grid = document.getElementById('saved-qrs-grid');
        const empty = document.getElementById('saved-qrs-empty');
        const qrs = getSavedQrs();

        if (qrs.length === 0) {
          grid.innerHTML = '';
          empty.classList.remove('hidden');
          return;
        }

        empty.classList.add('hidden');
        grid.innerHTML = qrs.map(qr => `
          <div class="p-4 rounded-xl bg-white border border-mistral-hairline hover:border-teal-500/50 transition flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-500/20 text-teal-300 uppercase">${qr.tab}</span>
                <span class="text-[10px] text-mistral-stone">${qr.date}</span>
              </div>
              <h4 class="font-semibold text-sm text-mistral-ink mb-1 truncate">${qr.title}</h4>
              <p class="text-xs text-mistral-slate font-mono truncate mb-4">${qr.data}</p>
            </div>
            <div class="flex items-center justify-between gap-2 pt-3 border-t border-mistral-hairline">
              <button onclick="restoreSavedQR('${qr.id}')" class="text-xs px-2.5 py-1.5 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 font-medium transition">
                Yükle & Düzenle
              </button>
              <button onclick="deleteSavedQR('${qr.id}')" class="text-xs text-mistral-stone hover:text-rose-400 transition">
                Sil
              </button>
            </div>
          </div>
        `).join('');
      }

      function restoreSavedQR(id) {
        const qrs = getSavedQrs();
        const qr = qrs.find(q => q.id === id);
        if (!qr) return;

        // 1. Sekmeyi aktif et
        setTab(qr.tab);

        // 2. Sekme Girdi Alanlarını Eksiksiz Geri Yükle
        if (qr.formData) {
          if (qr.tab === 'url') {
            document.getElementById('input-url').value = qr.formData.url || qr.data || '';
          } else if (qr.tab === 'wifi') {
            document.getElementById('wifi-ssid').value = qr.formData.wifi?.ssid || '';
            document.getElementById('wifi-pass').value = qr.formData.wifi?.pass || '';
            document.getElementById('wifi-type').value = qr.formData.wifi?.type || 'WPA';
            document.getElementById('wifi-hidden').checked = !!qr.formData.wifi?.hidden;
          } else if (qr.tab === 'vcard') {
            document.getElementById('vc-first').value = qr.formData.vcard?.first || '';
            document.getElementById('vc-last').value = qr.formData.vcard?.last || '';
            document.getElementById('vc-phone').value = qr.formData.vcard?.phone || '';
            document.getElementById('vc-email').value = qr.formData.vcard?.email || '';
            document.getElementById('vc-org').value = qr.formData.vcard?.org || '';
            document.getElementById('vc-title').value = qr.formData.vcard?.title || '';
            document.getElementById('vc-url').value = qr.formData.vcard?.url || '';
            document.getElementById('vc-addr').value = qr.formData.vcard?.addr || '';
          } else if (qr.tab === 'text') {
            document.getElementById('input-text').value = qr.formData.text || qr.data || '';
          } else if (qr.tab === 'email') {
            document.getElementById('mail-to').value = qr.formData.email?.to || '';
            document.getElementById('mail-sub').value = qr.formData.email?.sub || '';
            document.getElementById('mail-body').value = qr.formData.email?.body || '';
          } else if (qr.tab === 'crypto') {
            document.getElementById('crypto-type').value = qr.formData.crypto?.type || 'bitcoin';
            document.getElementById('crypto-address').value = qr.formData.crypto?.address || '';
            document.getElementById('crypto-amount').value = qr.formData.crypto?.amount || '';
          }
        } else if (qr.data) {
          // Eski kayıtlardan ham veriyi ayrıştırıp form alanlarını doldurma (Akıllı Geriye Uyumluluk)
          if (qr.tab === 'url') {
            document.getElementById('input-url').value = qr.data;
          } else if (qr.tab === 'text') {
            document.getElementById('input-text').value = qr.data;
          } else if (qr.tab === 'wifi') {
            const parts = qr.data.split(';');
            parts.forEach(p => {
              if (p.startsWith('WIFI:S:') || p.startsWith('S:')) {
                document.getElementById('wifi-ssid').value = p.replace(/^WIFI:S:|^S:/, '');
              } else if (p.startsWith('T:')) {
                document.getElementById('wifi-type').value = p.substring(2);
              } else if (p.startsWith('P:')) {
                document.getElementById('wifi-pass').value = p.substring(2);
              } else if (p.startsWith('H:')) {
                document.getElementById('wifi-hidden').checked = (p.substring(2) === 'true');
              }
            });
          } else if (qr.tab === 'email') {
            const parts = qr.data.split(';');
            parts.forEach(p => {
              if (p.startsWith('MATMSG:TO:') || p.startsWith('TO:')) {
                document.getElementById('mail-to').value = p.replace(/^MATMSG:TO:|^TO:/, '');
              } else if (p.startsWith('SUB:')) {
                document.getElementById('mail-sub').value = p.substring(4);
              } else if (p.startsWith('BODY:')) {
                document.getElementById('mail-body').value = p.substring(5);
              }
            });
          } else if (qr.tab === 'crypto') {
            const parts = qr.data.split(':');
            if (parts.length > 1) {
              const cType = parts[0];
              const rest = parts[1].split('?amount=');
              document.getElementById('crypto-type').value = cType;
              if (rest[0]) document.getElementById('crypto-address').value = rest[0];
              if (rest[1]) document.getElementById('crypto-amount').value = rest[1];
            }
          } else if (qr.tab === 'vcard') {
            const lines = qr.data.split('\\n');
            lines.forEach(rawLine => {
              const line = rawLine.trim();
              if (line.startsWith('FN:')) {
                const nameParts = line.substring(3).trim().split(' ');
                document.getElementById('vc-first').value = nameParts[0] || '';
                document.getElementById('vc-last').value = nameParts.slice(1).join(' ') || '';
              } else if (line.startsWith('TEL')) {
                document.getElementById('vc-phone').value = line.split(':').slice(1).join(':').trim();
              } else if (line.startsWith('EMAIL')) {
                document.getElementById('vc-email').value = line.split(':').slice(1).join(':').trim();
              } else if (line.startsWith('ORG:')) {
                document.getElementById('vc-org').value = line.substring(4).trim();
              } else if (line.startsWith('TITLE:')) {
                document.getElementById('vc-title').value = line.substring(6).trim();
              } else if (line.startsWith('URL:')) {
                document.getElementById('vc-url').value = line.substring(4).trim();
              } else if (line.startsWith('ADR')) {
                const adrParts = line.split(':;;');
                if (adrParts.length > 1) {
                  document.getElementById('vc-addr').value = adrParts[1].trim();
                }
              }
            });
          }
        }

        // 3. Renk, Gradyan ve Zemin Ayarları
        if (qr.color1) document.getElementById('color-1').value = qr.color1;
        if (qr.color2) document.getElementById('color-2').value = qr.color2;
        if (qr.isGrad !== undefined) document.getElementById('check-gradient').checked = qr.isGrad;
        if (qr.bg) document.getElementById('bg-mode').value = qr.bg;

        // 4. Nokta ve Köşe Geometrileri
        if (qr.dotsType) document.getElementById('opt-dots-type').value = qr.dotsType;
        if (qr.cornersSquareType) document.getElementById('opt-corners-square-type').value = qr.cornersSquareType;
        if (qr.cornersDotType) document.getElementById('opt-corners-dot-type').value = qr.cornersDotType;

        // 5. Hata Düzeltme Seviyesi (EC Level)
        if (qr.ecLevel) {
          const ecRadio = document.querySelector('input[name="ec-level"][value="' + qr.ecLevel + '"]');
          if (ecRadio) ecRadio.checked = true;
        }

        // 6. Logo ve Boyut Ayarları
        if (qr.logo) {
          currentLogo = qr.logo;
          document.getElementById('btn-remove-logo').classList.remove('hidden');
          document.getElementById('logo-sliders').classList.remove('hidden');
          if (qr.logoSize) {
            document.getElementById('logo-size').value = qr.logoSize;
            document.getElementById('lbl-logo-size').innerText = qr.logoSize;
          }
        } else {
          removeLogo();
        }

        handleBgChange();
        toggleGradientMode();
        updateQR();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('✓ "' + qr.title + '" tüm alanlarıyla yüklendi!');
      }

      function deleteSavedQR(id) {
        if (!confirm('Bu kayıtlı QR kodunu silmek istediğinize emin misiniz?')) return;
        let qrs = getSavedQrs();
        qrs = qrs.filter(q => q.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(qrs));
        renderSavedQrs();
      }

      function clearAllSavedQrs() {
        if (!confirm('Tüm kayıtlı QR kodlarını silmek istediğinize emin misiniz?')) return;
        localStorage.removeItem(STORAGE_KEY);
        renderSavedQrs();
      }

      // Kullanıcı oturumu açıkken badge güncelle
      window.loadUserSavedQrs = function(user) {
        const badge = document.getElementById('qr-user-badge');
        const nameEl = document.getElementById('qr-user-name');
        if (badge && nameEl) {
          badge.classList.remove('hidden');
          badge.classList.add('flex');
          const name = user.user_metadata?.full_name || user.email || 'Kullanıcı';
          nameEl.innerText = name + ' Koleksiyonu';
        }
      };

      // İlk yükleme
      document.addEventListener('DOMContentLoaded', function() {
        handleBgChange();
        updateQR();
        renderSavedQrs();
      });
      // Fallback
      setTimeout(() => {
        if (!qrCodeInstance) {
          handleBgChange();
          updateQR();
          renderSavedQrs();
        }
      }, 300);
