module.exports = function(pageTemplate) {
  return function(req, res) {
  const extraHead = `
      <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js"></script>
      <link rel="stylesheet" href="/static/apps/qr/app.css?v=20261017a">
      <script src="/static/apps/qr/app.js?v=20261017a" defer></script>
    `;

  const content = `
    <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
          <span class="text-mistral-stone">|</span>
          <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Web Araçları</span>
        </div>
        <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">QR Studio</h1></div>
        <p class="text-mistral-slate text-sm mt-0.5">
          Gradyan renkli, logolu ve yüksek çözünürlüklü vektörel QR kod tasarım platformu.
        </p>
      </div>
      <div id="qr-user-badge" class="hidden items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-slate">
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
            <button onclick="setTab('url')" id="tab-url" class="tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-teal-500 bg-teal-500/20 text-teal-700 transition flex flex-col items-center gap-1">
              <span class="text-base"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></span> URL
            </button>
            <button onclick="setTab('wifi')" id="tab-wifi" class="tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-slate transition flex flex-col items-center gap-1">
              <span class="text-base"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span> Wi-Fi
            </button>
            <button onclick="setTab('vcard')" id="tab-vcard" class="tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-slate transition flex flex-col items-center gap-1">
              <span class="text-base"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span> vCard
            </button>
            <button onclick="setTab('text')" id="tab-text" class="tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-slate transition flex flex-col items-center gap-1">
              <span class="text-base"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span> Metin
            </button>
            <button onclick="setTab('email')" id="tab-email" class="tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-slate transition flex flex-col items-center gap-1">
              <span class="text-base"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span> E-posta
            </button>
            <button onclick="setTab('crypto')" id="tab-crypto" class="tab-btn py-2 px-3 rounded-xl text-xs font-medium border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-slate transition flex flex-col items-center gap-1">
              <span class="text-base"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span> Kripto
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
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">Web Sitesi</label>
                <input type="url" id="vc-url" placeholder="https://example.com" oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
              </div>
              <div>
                <label class="block text-xs font-medium text-mistral-slate mb-1">Adres</label>
                <input type="text" id="vc-addr" placeholder="Şehir, Ülke" oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
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
            <div>
              <label class="block text-xs font-medium text-mistral-slate mb-1">Miktar (Opsiyonel)</label>
              <input type="text" id="crypto-amount" placeholder="0.05" oninput="updateQR()" class="w-full px-4 py-2 rounded-xl bg-white border border-mistral-hairline text-sm">
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
              <label class="cursor-pointer px-2.5 py-1 rounded-lg border border-mistral-hairline bg-white has-[:checked]:border-teal-500 has-[:checked]:bg-teal-500/20 has-[:checked]:text-teal-700">
                <input type="radio" name="ec-level" value="L" onchange="updateQR()" class="hidden"> L (%7)
              </label>
              <label class="cursor-pointer px-2.5 py-1 rounded-lg border border-mistral-hairline bg-white has-[:checked]:border-teal-500 has-[:checked]:bg-teal-500/20 has-[:checked]:text-teal-700">
                <input type="radio" name="ec-level" value="M" onchange="updateQR()" class="hidden"> M (%15)
              </label>
              <label class="cursor-pointer px-2.5 py-1 rounded-lg border border-mistral-hairline bg-white has-[:checked]:border-teal-500 has-[:checked]:bg-teal-500/20 has-[:checked]:text-teal-700">
                <input type="radio" name="ec-level" value="Q" checked onchange="updateQR()" class="hidden"> Q (%25)
              </label>
              <label class="cursor-pointer px-2.5 py-1 rounded-lg border border-mistral-hairline bg-white has-[:checked]:border-teal-500 has-[:checked]:bg-teal-500/20 has-[:checked]:text-teal-700">
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
              <button onclick="applyPreset('#14b8a6', '#6366f1')" style="background-image: linear-gradient(135deg, #14b8a6, #6366f1)" class="py-1.5 px-2 rounded-lg text-[10px] font-semibold text-white shadow hover:scale-105 transition">Cyberpunk</button>
              <button onclick="applyPreset('#f97316', '#ec4899')" style="background-image: linear-gradient(135deg, #f97316, #ec4899)" class="py-1.5 px-2 rounded-lg text-[10px] font-semibold text-white shadow hover:scale-105 transition">Sunset</button>
              <button onclick="applyPreset('#10b981', '#06b6d4')" style="background-image: linear-gradient(135deg, #10b981, #06b6d4)" class="py-1.5 px-2 rounded-lg text-[10px] font-semibold text-white shadow hover:scale-105 transition">Emerald</button>
              <button onclick="applyPreset('#8b5cf6', '#3b82f6')" style="background-image: linear-gradient(135deg, #8b5cf6, #3b82f6)" class="py-1.5 px-2 rounded-lg text-[10px] font-semibold text-white shadow hover:scale-105 transition">Royal</button>
              <button onclick="applyPreset('#eab308', '#ef4444')" style="background-image: linear-gradient(135deg, #eab308, #ef4444)" class="py-1.5 px-2 rounded-lg text-[10px] font-semibold text-white shadow hover:scale-105 transition">Amber Fire</button>
              <button onclick="applyPreset('#0f172a', '#334155', '#ffffff')" style="background-color: #0f172a" class="py-1.5 px-2 rounded-lg border border-mistral-hairline text-[10px] font-semibold text-white shadow hover:scale-105 transition">Monokrom</button>
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
                <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg></span> GitHub
              </button>
              <button onclick="setPresetLogo('wifi')" class="px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-hairline text-xs flex items-center gap-1.5">
                <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span> Wi-Fi
              </button>
              <button onclick="setPresetLogo('link')" class="px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-hairline text-xs flex items-center gap-1.5">
                <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></span> Link
              </button>
              <button onclick="setPresetLogo('star')" class="px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-hairline text-xs flex items-center gap-1.5">
                <span>⭐</span> Yıldız
              </button>
              <button onclick="setPresetLogo('bolt')" class="px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-hairline text-xs flex items-center gap-1.5">
                <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span> Şimşek
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
            <button onclick="downloadQR('png')" class="py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-medium text-sm transition shadow-md shadow-teal-500/20 flex items-center justify-center gap-2">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span> PNG İndir
            </button>
            <button onclick="downloadQR('svg')" class="py-3 px-4 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep font-medium text-sm transition flex items-center justify-center gap-2">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span> SVG İndir
            </button>
          </div>

          <div class="w-full grid grid-cols-2 gap-3 mt-2">
            <button onclick="copyToClipboard()" id="btn-copy" class="py-2.5 px-3 rounded-xl bg-white border border-mistral-hairline hover:border-mistral-hairline text-mistral-slate text-xs transition flex items-center justify-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span> Panoya Kopyala
            </button>
            <button onclick="saveCurrentQR()" id="btn-save-qr" class="py-2.5 px-3 rounded-xl bg-white border border-teal-500/40 hover:border-teal-400 text-teal-700 text-xs transition flex items-center justify-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></span> Koleksiyonuma Kaydet
            </button>
          </div>

          <div id="status-toast" class="hidden mt-3 w-full py-2 px-3 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-700 text-xs text-center transition"></div>

        </div>
      </div>
    </div>

    <!-- ALT BÖLÜM: Kayıtlı QR Kodlarım (Koleksiyon) -->
    <div class="mt-14 pt-8 border-t border-mistral-hairline">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold text-mistral-ink flex items-center gap-2">
            <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span> Kayıtlı QR Koleksiyonum
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
