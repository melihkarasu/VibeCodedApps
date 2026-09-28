module.exports = function(pageTemplate) {
  return function(req, res) {
  const extraHead = `
      <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js"></script>
      <link rel="stylesheet" href="/static/apps/qr/app.css">
      <script src="/static/apps/qr/app.js" defer></script>
    `;

  const content = `
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <a href="/" class="text-mistral-slate hover:text-white transition text-sm flex items-center gap-1">
            &larr; Vitrine Dön
          </a>
          <span class="text-mistral-stone">|</span>
          <span class="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-semibold">Mikro Uygulama #1</span>
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight mt-1 text-mistral-ink flex items-center gap-2">
          <span>📱</span> QR Studio
        </h1>
        <p class="text-mistral-slate text-sm mt-0.5">
          Gradyan renkli, logolu ve yüksek çözünürlüklü vektörel QR kod tasarım platformu.
        </p>
      </div>
      <div id="qr-user-badge" class="hidden items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-slate">
        <span class="w-2 h-2 rounded-full bg-teal-400"></span>
        <span id="qr-user-name">Kullanıcı Koleksiyonu Aktif</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- SOL KOLON: Form ve Tasarım Ayarları (7 Kolon) -->
      <div class="lg:col-span-7 space-y-6">
        
        <!-- 1. VERİ TÜRÜ SEÇİMİ (TABS) -->
        <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm">
          <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate mb-3">1. İçerik Türü</label>
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
            <button onclick="setTab('url')" id="tab-url" class="tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-teal-500 bg-teal-500/20 text-teal-300 transition flex flex-col items-center gap-1">
              <span class="text-base">🔗</span> URL
            </button>
            <button onclick="setTab('wifi')" id="tab-wifi" class="tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-slate transition flex flex-col items-center gap-1">
              <span class="text-base">📶</span> Wi-Fi
            </button>
            <button onclick="setTab('vcard')" id="tab-vcard" class="tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-slate transition flex flex-col items-center gap-1">
              <span class="text-base">👤</span> vCard
            </button>
            <button onclick="setTab('text')" id="tab-text" class="tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-slate transition flex flex-col items-center gap-1">
              <span class="text-base">📝</span> Metin
            </button>
            <button onclick="setTab('email')" id="tab-email" class="tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-slate transition flex flex-col items-center gap-1">
              <span class="text-base">✉️</span> E-posta
            </button>
            <button onclick="setTab('crypto')" id="tab-crypto" class="tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-slate transition flex flex-col items-center gap-1">
              <span class="text-base">💳</span> Kripto
            </button>
          </div>

          <!-- TAB PANELLERİ -->
          <!-- URL Pane -->
          <div id="pane-url" class="tab-pane space-y-3">
            <div>
              <label class="block text-xs font-medium text-mistral-slate mb-1">Web Sitesi Adresi (URL)</label>
              <input type="url" id="input-url" value="https://github.com/melihkarasu" oninput="updateQR()" placeholder="https://example.com" class="w-full px-4 py-2.5 rounded-xl bg-white border border-mistral-hairline focus:border-teal-400 focus:outline-none text-mistral-ink text-sm">
            </div>
            <div class="flex items-center gap-2">
              <button onclick="document.getElementById('input-url').value='https://github.com/melihkarasu'; updateQR();" class="text-xs text-teal-400 hover:underline">Örnek: GitHub Profilim</button>
              <span class="text-mistral-stone">•</span>
              <button onclick="document.getElementById('input-url').value='https://github.com/melihkarasu/VibeCodedApps'; updateQR();" class="text-xs text-teal-400 hover:underline">Örnek: VibeCodedApps</button>
            </div>
          </div>

          <!-- Wi-Fi Pane -->
          <div id="pane-wifi" class="tab-pane hidden space-y-3">
            <div>
              <label class="block text-xs font-medium text-mistral-slate mb-1">Ağ Adı (SSID)</label>
              <input type="text" id="wifi-ssid" placeholder="Ev_Wi-Fi" oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">Şifre</label>
                <input type="text" id="wifi-pass" placeholder="Ağ Şifresi" oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
              </div>
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">Şifreleme Türü</label>
                <select id="wifi-type" onchange="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink">
                  <option value="WPA">WPA/WPA2 (Standart)</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Şifresiz (Açık Ağ)</option>
                </select>
              </div>
            </div>
            <label class="flex items-center gap-2 text-xs text-mistral-slate cursor-pointer pt-1">
              <input type="checkbox" id="wifi-hidden" onchange="updateQR()" class="rounded bg-white border-mistral-hairline text-teal-500">
              Bu gizli bir ağdır (SSID gizli)
            </label>
          </div>

          <!-- vCard Pane -->
          <div id="pane-vcard" class="tab-pane hidden space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">Ad</label>
                <input type="text" id="vc-first" placeholder="Melih" oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
              </div>
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">Soyad</label>
                <input type="text" id="vc-last" placeholder="Karasu" oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">Telefon</label>
                <input type="tel" id="vc-phone" placeholder="+90 555 000 0000" oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
              </div>
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">E-posta</label>
                <input type="email" id="vc-email" placeholder="ornek@alanadi.com" oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">Şirket / Kurum</label>
                <input type="text" id="vc-org" placeholder="Şirket A.Ş." oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
              </div>
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">Unvan</label>
                <input type="text" id="vc-title" placeholder="Yazılım Mühendisi" oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
              </div>
            </div>
          </div>

          <!-- Plain Text Pane -->
          <div id="pane-text" class="tab-pane hidden space-y-3">
            <div>
              <label class="block text-xs font-medium text-mistral-slate mb-1">Serbest Metin / Not</label>
              <textarea id="input-text" rows="3" placeholder="QR koda dönüştürmek istediğiniz herhangi bir metni buraya yazın..." oninput="updateQR()" class="w-full px-4 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink"></textarea>
            </div>
          </div>

          <!-- Email Pane -->
          <div id="pane-email" class="tab-pane hidden space-y-3">
            <div>
              <label class="block text-xs font-medium text-mistral-slate mb-1">Alıcı E-posta</label>
              <input type="email" id="mail-to" placeholder="iletisim@alanadi.com" oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-mistral-slate mb-1">Konu</label>
              <input type="text" id="mail-subject" placeholder="Merhaba!" oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
            </div>
            <div>
              <label class="block text-xs font-medium text-mistral-slate mb-1">Mesaj Gövdesi</label>
              <textarea id="mail-body" rows="2" placeholder="E-posta içeriği..." oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm"></textarea>
            </div>
          </div>

          <!-- Crypto Pane -->
          <div id="pane-crypto" class="tab-pane hidden space-y-3">
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">Para Birimi</label>
                <select id="crypto-type" onchange="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink">
                  <option value="bitcoin">Bitcoin (BTC)</option>
                  <option value="ethereum">Ethereum (ETH)</option>
                  <option value="solana">Solana (SOL)</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="block text-xs font-medium text-mistral-slate mb-1">Cüzdan Adresi</label>
                <input type="text" id="crypto-address" placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
              </div>
            </div>
          </div>

        </div>

        <!-- 2. STİL & ŞEKİL AYARLARI -->
        <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-5">
          <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate">2. Desen & Şekil Stilleri</label>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Nokta Tipi -->
            <div>
              <label class="block text-xs font-medium text-mistral-slate mb-1.5">Gövde Deseni</label>
              <select id="opt-dots-type" onchange="updateQR()" class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink">
                <option value="extra-rounded">Ekstra Yuvarlak</option>
                <option value="rounded" selected>Yuvarlak (Rounded)</option>
                <option value="dots">Nokta (Dots)</option>
                <option value="classy">Zarif (Classy)</option>
                <option value="square">Klasik Kare</option>
              </select>
            </div>

            <!-- Köşe Kare Tipi -->
            <div>
              <label class="block text-xs font-medium text-mistral-slate mb-1.5">Köşe Çerçevesi</label>
              <select id="opt-corners-square-type" onchange="updateQR()" class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink">
                <option value="extra-rounded" selected>Ekstra Yuvarlak</option>
                <option value="dot">Dairesel</option>
                <option value="square">Kare</option>
              </select>
            </div>

            <!-- Köşe Noktası Tipi -->
            <div>
              <label class="block text-xs font-medium text-mistral-slate mb-1.5">Köşe Göz Noktası</label>
              <select id="opt-corners-dot-type" onchange="updateQR()" class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink">
                <option value="dot" selected>Dairesel (Dot)</option>
                <option value="square">Kare (Square)</option>
              </select>
            </div>
          </div>

          <!-- Hata Düzeltme Seviyesi -->
          <div class="pt-2 border-t border-mistral-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span class="text-mistral-slate">Hata Düzeltme Seviyesi (Error Correction):</span>
            <div class="flex gap-2">
              <label class="cursor-pointer px-2.5 py-1 rounded-lg border border-mistral-hairline bg-white has-[:checked]:border-teal-500 has-[:checked]:bg-teal-500/20 has-[:checked]:text-teal-300">
                <input type="radio" name="ec-level" value="L" onchange="updateQR()" class="hidden"> L (%7)
              </label>
              <label class="cursor-pointer px-2.5 py-1 rounded-lg border border-mistral-hairline bg-white has-[:checked]:border-teal-500 has-[:checked]:bg-teal-500/20 has-[:checked]:text-teal-300">
                <input type="radio" name="ec-level" value="M" onchange="updateQR()" class="hidden"> M (%15)
              </label>
              <label class="cursor-pointer px-2.5 py-1 rounded-lg border border-mistral-hairline bg-white has-[:checked]:border-teal-500 has-[:checked]:bg-teal-500/20 has-[:checked]:text-teal-300">
                <input type="radio" name="ec-level" value="Q" checked onchange="updateQR()" class="hidden"> Q (%25)
              </label>
              <label class="cursor-pointer px-2.5 py-1 rounded-lg border border-mistral-hairline bg-white has-[:checked]:border-teal-500 has-[:checked]:bg-teal-500/20 has-[:checked]:text-teal-300">
                <input type="radio" name="ec-level" value="H" onchange="updateQR()" class="hidden"> H (%30 - Logo)
              </label>
            </div>
          </div>
        </div>

        <!-- 3. RENKLER & GRADYAN -->
        <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-5">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate">3. Renkler & Gradyan</label>
            <div class="flex items-center gap-2">
              <label class="text-xs text-mistral-slate">Gradyan Modu:</label>
              <input type="checkbox" id="check-gradient" checked onchange="toggleGradientMode(); updateQR();" class="rounded bg-white border-mistral-hairline text-teal-500">
            </div>
          </div>

          <!-- Hazır Şık Temalar -->
          <div>
            <span class="block text-xs text-mistral-slate mb-2">Hazır Gradyan Paletleri:</span>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <button onclick="applyPreset('#14b8a6', '#6366f1')" class="py-1.5 px-2 rounded-lg bg-white from-teal-500 to-indigo-500 text-[10px] font-semibold text-white shadow hover:scale-105 transition">Cyberpunk</button>
              <button onclick="applyPreset('#f97316', '#ec4899')" class="py-1.5 px-2 rounded-lg bg-white from-orange-500 to-pink-500 text-[10px] font-semibold text-white shadow hover:scale-105 transition">Sunset</button>
              <button onclick="applyPreset('#10b981', '#06b6d4')" class="py-1.5 px-2 rounded-lg bg-white from-emerald-500 to-cyan-500 text-[10px] font-semibold text-white shadow hover:scale-105 transition">Emerald</button>
              <button onclick="applyPreset('#8b5cf6', '#3b82f6')" class="py-1.5 px-2 rounded-lg bg-white from-violet-500 to-blue-500 text-[10px] font-semibold text-white shadow hover:scale-105 transition">Royal</button>
              <button onclick="applyPreset('#eab308', '#ef4444')" class="py-1.5 px-2 rounded-lg bg-white from-yellow-500 to-red-500 text-[10px] font-semibold text-white shadow hover:scale-105 transition">Amber Fire</button>
              <button onclick="applyPreset('#0f172a', '#334155', '#ffffff')" class="py-1.5 px-2 rounded-lg bg-white border border-mistral-hairline text-[10px] font-semibold text-white shadow hover:scale-105 transition">Monokrom</button>
            </div>
          </div>

          <!-- Renk Seçiciler -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label class="block text-xs font-medium text-mistral-slate mb-1.5">Ön Plan (Renk 1)</label>
              <div class="flex items-center gap-2">
                <input type="color" id="color-1" value="#14b8a6" oninput="updateQR()" class="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-mistral-hairline">
                <input type="text" id="color-1-text" value="#14b8a6" onchange="syncColorInput(1)" class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs font-mono">
              </div>
            </div>

            <div id="col-color-2">
              <label class="block text-xs font-medium text-mistral-slate mb-1.5">Bitiş (Renk 2)</label>
              <div class="flex items-center gap-2">
                <input type="color" id="color-2" value="#6366f1" oninput="updateQR()" class="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-mistral-hairline">
                <input type="text" id="color-2-text" value="#6366f1" onchange="syncColorInput(2)" class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs font-mono">
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-mistral-slate mb-1.5">Arka Plan</label>
              <div class="flex items-center gap-2">
                <select id="bg-mode" onchange="handleBgChange(); updateQR();" class="w-full px-3 py-2.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink">
                  <option value="#ffffff">Beyaz (#ffffff)</option>
                  <option value="transparent">Şeffaf (Transparent)</option>
                  <option value="#0f172a">Koyu Slate (#0f172a)</option>
                  <option value="#000000">Siyah (#000000)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. LOGO & ORTA SİMGE -->
        <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate">4. Orta Logo / İkon</label>
            <button id="btn-remove-logo" onclick="removeLogo()" class="hidden text-xs text-rose-400 hover:underline">Logoyu Kaldır</button>
          </div>

          <!-- Hazır İkonlar -->
          <div>
            <span class="block text-xs text-mistral-slate mb-2">Popüler Hazır Simgeler:</span>
            <div class="flex flex-wrap gap-2">
              <button onclick="setPresetLogo('github')" class="px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-hairline text-xs flex items-center gap-1.5">
                <span>🐙</span> GitHub
              </button>
              <button onclick="setPresetLogo('wifi')" class="px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-hairline text-xs flex items-center gap-1.5">
                <span>📶</span> Wi-Fi
              </button>
              <button onclick="setPresetLogo('link')" class="px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-hairline text-xs flex items-center gap-1.5">
                <span>🔗</span> Link
              </button>
              <button onclick="setPresetLogo('star')" class="px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-hairline text-xs flex items-center gap-1.5">
                <span>⭐</span> Yıldız
              </button>
              <button onclick="setPresetLogo('bolt')" class="px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-hairline text-xs flex items-center gap-1.5">
                <span>⚡</span> Şimşek
              </button>
            </div>
          </div>

          <!-- Özel Dosya Yükleme -->
          <div class="pt-2">
            <label class="block text-xs text-mistral-slate mb-1">Veya Kendi Logonuzu Yükleyin (PNG, SVG, JPG):</label>
            <input type="file" id="file-logo" accept="image/*" onchange="handleFileUpload(event)" class="text-xs text-mistral-slate file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:text-mistral-ink font-boldbg-mistral-cream-light file:text-mistral-ink font-bold hover:file:bg-mistral-cream-deeper cursor-pointer">
          </div>

          <!-- Logo Boyut & Margin Slider -->
          <div id="logo-sliders" class="hidden grid grid-cols-2 gap-4 pt-3 border-t border-mistral-hairline">
            <div>
              <div class="flex justify-between text-xs text-mistral-slate mb-1">
                <span>Logo Boyutu:</span>
                <span id="lbl-logo-size">0.35</span>
              </div>
              <input type="range" id="logo-size" min="0.15" max="0.5" step="0.05" value="0.35" oninput="document.getElementById('lbl-logo-size').innerText=this.value; updateQR();" class="w-full accent-teal-400">
            </div>
            <div>
              <div class="flex justify-between text-xs text-mistral-slate mb-1">
                <span>Kenar Boşluğu (Margin):</span>
                <span id="lbl-logo-margin">5</span>
              </div>
              <input type="range" id="logo-margin" min="0" max="20" step="1" value="5" oninput="document.getElementById('lbl-logo-margin').innerText=this.value; updateQR();" class="w-full accent-teal-400">
            </div>
          </div>
        </div>

      </div>

      <!-- SAĞ KOLON: Canlı Önizleme & İndirme (5 Kolon - Sticky) -->
      <div class="lg:col-span-5 sticky top-24 space-y-6">
        <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xl flex flex-col items-center">
          
          <div class="w-full flex items-center justify-between mb-4">
            <span class="text-xs font-semibold uppercase tracking-wider text-mistral-slate">Canlı Önizleme</span>
            <span id="qr-byte-badge" class="px-2 py-0.5 rounded-full bg-mistral-cream text-[10px] text-mistral-slate font-mono">Hazır</span>
          </div>

          <!-- QR Container -->
          <div id="qr-box-wrapper" class="p-6 rounded-2xl bg-white border border-mistral-hairline flex items-center justify-center transition-all duration-300 shadow-inner">
            <div id="qr-canvas-container" class="flex items-center justify-center"></div>
          </div>

          <!-- Dışa Aktarma Boyutu -->
          <div class="w-full mt-6 pt-4 border-t border-mistral-hairline flex items-center justify-between">
            <span class="text-xs text-mistral-slate font-medium">İndirme Çözünürlüğü:</span>
            <select id="export-size" class="px-3 py-1.5 rounded-lg bg-white border border-mistral-hairline text-xs text-mistral-ink">
              <option value="500">500 x 500 px (Hızlı)</option>
              <option value="1000" selected>1000 x 1000 px (HD)</option>
              <option value="2000">2000 x 2000 px (Ultra / Baskı)</option>
            </select>
          </div>

          <!-- Aksiyon Butonları -->
          <div class="w-full grid grid-cols-2 gap-3 mt-4">
            <button onclick="downloadQR('png')" class="py-3 px-4 rounded-xl bg-white from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-medium text-sm transition shadow-md shadow-teal-500/20 flex items-center justify-center gap-2">
              <span>📥</span> PNG İndir
            </button>
            <button onclick="downloadQR('svg')" class="py-3 px-4 rounded-xl text-mistral-ink font-boldbg-mistral-cream-light hover:bg-mistral-cream-deeper text-mistral-ink font-bold font-medium text-sm transition flex items-center justify-center gap-2">
              <span>📐</span> SVG İndir
            </button>
          </div>

          <div class="w-full grid grid-cols-2 gap-3 mt-2">
            <button onclick="copyToClipboard()" id="btn-copy" class="py-2.5 px-3 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-hairline text-mistral-slate text-xs transition flex items-center justify-center gap-1.5">
              <span>📋</span> Panoya Kopyala
            </button>
            <button onclick="saveCurrentQR()" id="btn-save-qr" class="py-2.5 px-3 rounded-xl bg-white border border-teal-500/40 hover:border-teal-400 text-teal-300 text-xs transition flex items-center justify-center gap-1.5">
              <span>💾</span> Koleksiyonuma Kaydet
            </button>
          </div>

          <div id="status-toast" class="hidden mt-3 w-full py-2 px-3 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs text-center transition"></div>

        </div>
      </div>
    </div>

    <!-- ALT BÖLÜM: Kayıtlı QR Kodlarım (Koleksiyon) -->
    <div class="mt-14 pt-8 border-t border-mistral-hairline">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-mistral-ink flex items-center gap-2">
            <span>📚</span> Kayıtlı QR Koleksiyonum
          </h2>
          <p class="text-mistral-slate text-xs mt-1">
            Tekil kimlik doğrulama (SSO) ile bu tarayıcı ve hesabınıza kaydedilen özel tasarım QR kodlarınız.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="clearAllSavedQrs()" class="text-xs text-rose-400 hover:underline px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition">
            Tümünü Temizle
          </button>
        </div>
      </div>

      <div id="saved-qrs-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <!-- Dinamik olarak doldurulur -->
      </div>
      <div id="saved-qrs-empty" class="p-12 text-center rounded-2xl bg-white border border-mistral-hairline text-mistral-stone text-sm">
        Henüz kaydedilmiş bir QR kodunuz bulunmuyor. Yukarıdan bir QR oluşturup "Koleksiyonuma Kaydet" butonuna tıklayabilirsiniz.
      </div>
    </div>

    <!-- QR Studio Client Logic -->
  `;

  res.send(pageTemplate('QR Studio', content, extraHead));

  };
};
