module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/sizinti/app.css?v=20261023a">
      <script src="/static/apps/sizinti/app.js?v=20261023a" defer></script>
    `;

    const content = `
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Geliştirici Araçları</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Sızıntı Kontrolü & Şifre Güvenliği</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5">
            HaveIBeenPwned k-Anonymity (SHA-1) protokolü ile şifrenizi asla iletmeden sızıntı denetimi ve entropi analizi.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-slate">
          <span>%100 Sıfır Bilgi (Zero-Knowledge) Garantisi</span>
        </div>
      </div>

      <!-- GÜVENLİK BİLGİLENDİRME BANNERI (DESIGN.md card-cream) -->
      <div class="p-4.5 rounded-2xl bg-mistral-cream border border-mistral-beige-deep flex items-start gap-3.5 mb-8 text-xs text-mistral-ink shadow-sm">
        <span class="text-xl shrink-0"><svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
        <div class="leading-relaxed">
          <strong class="text-mistral-ink font-bold">Gizlilik & Güvenlik Güvencesi:</strong> Şifreniz asla sunucumuza veya internete <u>gönderilmez</u>. Tarayıcınızda SHA-1 ile hash'lenir, yalnızca hash'in ilk 5 karakteri (k-Anonymity) HIBP veritabanına iletilerek geri dönen binlerce aday arasından yerel eşleşme yapılır.
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        <!-- SOL KOLON: Şifre Sızıntı & Entropi Analizi (7 Kolon) -->
        <div class="lg:col-span-7 space-y-6">
          
          <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-md space-y-5">
            <h2 class="text-base font-bold text-mistral-ink flex items-center gap-2">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span> Şifre Sızıntı & Güvenlik Taraması
            </h2>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate mb-1.5">
                Test Etmek İstediğiniz Şifre
              </label>
              <div class="flex flex-col sm:flex-row gap-2.5">
                <div class="relative flex-1">
                  <input 
                    type="password" 
                    id="input-password" 
                    placeholder="Şifrenizi yazın..." 
                    oninput="analyzePasswordStrengthOnly()" 
                    onkeydown="if(event.key==='Enter') runBreachCheck()" 
                    class="w-full pl-4 pr-20 py-3 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder-slate-500 focus:border-red-400 focus:outline-none font-mono">
                  <button type="button" onclick="togglePasswordVisibility()" class="absolute right-3 top-3 text-xs text-mistral-slate hover:text-mistral-ink px-2 py-1 rounded bg-mistral-cream-light border border-mistral-hairline transition">
                    <span id="btn-toggle-eye">Göster</span>
                  </button>
                </div>
                <button 
                  type="button" 
                  onclick="runBreachCheck()" 
                  id="btn-breach-check" 
                  class="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-red-600/20 shrink-0 flex items-center justify-center gap-2 cursor-pointer">
                  <span id="btn-check-icon"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                  <span id="btn-check-text">Sızıntıyı Kontrol Et</span>
                </button>
              </div>

              <!-- Hızlı Test Örnekleri -->
              <div class="flex flex-wrap items-center gap-2 pt-2.5 text-xs text-mistral-slate">
                <span class="text-mistral-stone text-[11px]">Hızlı Örnekler:</span>
                <button type="button" onclick="testSamplePassword('password123')" class="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-mono text-[11px] transition">password123 (Sızdırılmış)</button>
                <button type="button" onclick="testSamplePassword('123456789')" class="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-mono text-[11px] transition">123456789 (Sızdırılmış)</button>
                <button type="button" onclick="testSamplePassword('Tr$92#xLp@2026!K')" class="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-mono text-[11px] transition">Tr$92#xLp@... (Temiz)</button>
              </div>
            </div>

            <!-- Hızlı Güç Göstergesi Çubuğu -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs">
                <span class="text-mistral-slate">Parola Gücü & Entropi:</span>
                <span id="label-strength" class="font-bold text-mistral-slate">Henüz yazılmadı</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div id="meter-strength" class="h-full meter-bar bg-mistral-cream" style="width: 0%;"></div>
              </div>
            </div>

            <!-- Canlı Sızıntı Sonuç Kartı (DESIGN.md card-cream-soft & Açık Statü Zeminleri) -->
            <div id="breach-result-card" class="p-5 rounded-2xl bg-mistral-cream-light border border-mistral-beige-deep flex items-start gap-4 transition shadow-sm">
              <div id="breach-icon" class="text-3xl shrink-0"><svg class="w-6 h-6 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <div class="flex-1 min-w-0">
                <h3 id="breach-title" class="font-bold text-sm text-mistral-ink">Sızıntı Taraması Bekleniyor</h3>
                <p id="breach-desc" class="text-xs text-mistral-slate mt-1 leading-relaxed">
                  Şifrenizi yazıp <strong>"Sızıntıyı Kontrol Et"</strong> butonuna bastığınızda, 10+ milyar ifşa edilmiş şifre arasında k-Anonymity güvenliğiyle taranacaktır.
                </p>
                <div id="breach-stats" class="hidden mt-2.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold"></div>

                <!-- İnceleme Adımları Telemetrisi (Şeffaf Zero-Knowledge Göstergesi) -->
                <div id="breach-telemetry" class="hidden mt-4 pt-3 border-t border-mistral-beige-deep/60 space-y-2 text-xs font-mono text-mistral-ink bg-white/70 p-3 rounded-xl border border-mistral-hairline">
                  <div id="step-hash" class="flex items-center gap-2">
                    <span class="text-emerald-600 font-bold"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> <span>1. Tarayıcı SHA-1: <strong class="text-mistral-ink font-bold" id="hash-preview">-</strong></span>
                  </div>
                  <div id="step-api" class="flex items-center gap-2">
                    <span class="text-emerald-600 font-bold"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> <span>2. HIBP Range API İletisi (İlk 5 Karakter): <strong class="text-amber-700 font-bold" id="prefix-preview">-</strong></span>
                  </div>
                  <div id="step-match" class="flex items-center gap-2">
                    <span id="match-status-icon" class="text-emerald-600 font-bold"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> <span id="match-status-text" class="text-mistral-slate font-medium">3. Kalan 35 karakter yerel olarak eşleştirildi.</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detaylı Güvenlik Metrikleri Izgarası -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div class="p-3 rounded-xl bg-white border border-mistral-hairline text-center">
                <span class="text-[10px] text-mistral-slate uppercase">Karakter</span>
                <div id="stat-len" class="text-sm font-bold text-mistral-ink font-mono mt-0.5">0</div>
              </div>
              <div class="p-3 rounded-xl bg-white border border-mistral-hairline text-center">
                <span class="text-[10px] text-mistral-slate uppercase">Entropi</span>
                <div id="stat-entropy" class="text-sm font-bold text-blue-600 font-mono mt-0.5">0 bit</div>
              </div>
              <div class="p-3 rounded-xl bg-white border border-mistral-hairline text-center">
                <span class="text-[10px] text-mistral-slate uppercase">Kırılma Süresi</span>
                <div id="stat-crack-time" class="text-sm font-bold text-mistral-slate font-mono mt-0.5">-</div>
              </div>
              <div class="p-3 rounded-xl bg-white border border-mistral-hairline text-center">
                <span class="text-[10px] text-mistral-slate uppercase">Çeşitlilik</span>
                <div id="stat-diversity" class="text-sm font-bold text-mistral-slate font-mono mt-0.5">0/4</div>
              </div>
            </div>

          </div>

        </div>

        <!-- SAĞ KOLON: Kriptografik Şifre Üretici (5 Kolon) -->
        <div class="lg:col-span-5 space-y-6">
          
          <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl space-y-5">
            <h3 class="text-base font-bold text-mistral-ink flex items-center gap-2">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg></span> Güçlü Parola Üretici
            </h3>
            <p class="text-mistral-slate text-xs">
              Tarayıcınızın kriptografik rastgelelik motoru (crypto.getRandomValues) ile kırılması imkansız şifre oluşturun:
            </p>

            <!-- Üretilen Şifre Kutusu -->
            <div class="p-4 rounded-2xl bg-white border border-mistral-hairline flex items-center justify-between gap-3">
              <span id="gen-password-display" class="font-mono text-sm font-bold text-emerald-400 select-all truncate">
                Parola bekleniyor...
              </span>
              <button onclick="copyGeneratedPassword()" class="px-3 py-1.5 rounded-xl bg-white hover:bg-mistral-cream-light border border-mistral-hairline text-xs font-bold text-mistral-ink font-bold transition shrink-0 flex items-center gap-1">
                <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span> Kopyala
              </button>
            </div>

            <!-- Ayarlar -->
            <div class="space-y-4 pt-1">
              <div>
                <div class="flex justify-between text-xs text-mistral-slate mb-1">
                  <span>Uzunluk:</span>
                  <span id="label-gen-length" class="font-mono font-bold text-emerald-400">18 karakter</span>
                </div>
                <input type="range" id="gen-length" min="8" max="40" value="18" oninput="document.getElementById('label-gen-length').innerText=this.value+' karakter'; generateSecurePassword();" class="w-full accent-emerald-400 cursor-pointer">
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs text-mistral-slate">
                <label class="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white border border-mistral-hairline">
                  <input type="checkbox" id="chk-upper" checked onchange="generateSecurePassword()" class="rounded bg-white border-mistral-hairline text-emerald-500">
                  <span>Büyük Harf (A-Z)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white border border-mistral-hairline">
                  <input type="checkbox" id="chk-lower" checked onchange="generateSecurePassword()" class="rounded bg-white border-mistral-hairline text-emerald-500">
                  <span>Küçük Harf (a-z)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white border border-mistral-hairline">
                  <input type="checkbox" id="chk-numbers" checked onchange="generateSecurePassword()" class="rounded bg-white border-mistral-hairline text-emerald-500">
                  <span>Rakamlar (0-9)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-white border border-mistral-hairline">
                  <input type="checkbox" id="chk-symbols" checked onchange="generateSecurePassword()" class="rounded bg-white border-mistral-hairline text-emerald-500">
                  <span>Semboller (!@#$)</span>
                </label>
              </div>

              <button onclick="generateSecurePassword()" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition shadow flex items-center justify-center gap-1.5">
                <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></span> Yeni Parola Üret
              </button>
            </div>

          </div>

        </div>

      </div>

      <!-- 3. TARİHİ BÜYÜK VERİ SIZINTILARI REHBERİ (BREACH ARCHIVE) -->
      <div class="p-6 sm:p-8 rounded-3xl bg-white border border-mistral-hairline shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-mistral-ink flex items-center gap-2">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span> Tarihe Geçen Büyük Veri Sızıntıları Arşivi
            </h3>
            <p class="text-mistral-slate text-xs mt-0.5">Milyonlarca hesabın ifşa olduğu en büyük sızıntılar ve dersler:</p>
          </div>
          <span class="text-xs text-mistral-stone font-mono">Tarihsel İnceleme</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div class="p-4 rounded-2xl bg-white border border-mistral-hairline space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs text-white">Canva Sızıntısı</span>
              <span class="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">137 Milyon</span>
            </div>
            <p class="text-[11px] text-mistral-slate">2019 yılında kullanıcı adları, e-postalar ve bcrypt ile hashlenmiş şifreler ifşa oldu.</p>
          </div>

          <div class="p-4 rounded-2xl bg-white border border-mistral-hairline space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs text-white">LinkedIn Sızıntısı</span>
              <span class="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">164 Milyon</span>
            </div>
            <p class="text-[11px] text-mistral-slate">2012 yılında tuzsuz (unsalted) SHA-1 şifreleri sızdırıldı ve dakikalar içinde kırıldı.</p>
          </div>

          <div class="p-4 rounded-2xl bg-white border border-mistral-hairline space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs text-white">Adobe Sızıntısı</span>
              <span class="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">153 Milyon</span>
            </div>
            <p class="text-[11px] text-mistral-slate">2013'te simetrik 3DES algoritmasıyla şifrelenen parolalar ve şifre ipuçları ele geçirildi.</p>
          </div>

          <div class="p-4 rounded-2xl bg-white border border-mistral-hairline space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs text-white">Dropbox Sızıntısı</span>
              <span class="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">68 Milyon</span>
            </div>
            <p class="text-[11px] text-mistral-slate">2012 sızıntısında çalışan hesabı ele geçirilerek bcrypt korumalı kullanıcı verileri çalındı.</p>
          </div>
        </div>
      </div>

      <!-- Toast Bildirimi -->
      <div id="sizinti-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı (Web Crypto SHA-1 & k-Anonymity) -->
    `;

    res.send(pageTemplate('Sızıntı Kontrolü & Şifre Güvenliği', content, extraHead));
  };
};
