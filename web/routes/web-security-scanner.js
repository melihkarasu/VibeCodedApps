module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/web-security-scanner/app.css?v=20261023a">
      <script src="/static/apps/web-security-scanner/app.js?v=20261023a" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mistral-hairline pb-5">
        <div class="flex items-start sm:items-center gap-3.5">
          <div class="wss-brand-icon" aria-hidden="true">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2.5 mb-1 flex-wrap">
              <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                <span>Vitrine Dön</span>
              </a>
              <span class="text-stone-300">|</span>
              <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-bold font-mono">Güvenlik &amp; Teşhis</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">
              Web Security Scanner
            </h1>
            <p class="text-xs text-mistral-slate mt-0.5">
              Pasif Güvenlik Başlıkları, DoH DNS &amp; SSL Taraması • Sıfır WAF &amp; Abuse Riski
            </p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <a href="https://github.com/melihkarasu/web-security-scanner" target="_blank" rel="noopener" class="wss-btn wss-btn-dark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            <span>Standalone Repo (GitHub)</span>
          </a>
          <button type="button" onclick="exportMarkdownReport()" class="wss-btn wss-btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Rapor İndir (.md)</span>
          </button>
        </div>
      </div>

      <!-- GİRİŞ & ARAMA KOMUTA MERKEZİ (ÖN PLANDA, MOBİL UYUMLU) -->
      <div class="mb-6 wss-hero-card p-5 sm:p-7">
        <div class="max-w-3xl mb-4">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold mb-2">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span>PASİF WEB &amp; DNS GÜVENLİK TARAMASI</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold font-editorial text-mistral-ink mb-1">Web Sitesi Güvenlik Taraması</h2>
          <p class="text-xs sm:text-sm text-mistral-slate leading-relaxed">
            Hedef siteye hiçbir zararlı payload göndermeden, yalnızca açık DNS/DoH kayıtlarını ve HTTP güvenlik başlıklarını (CSP, HSTS, X-Frame-Options, DMARC) pasif yöntemlerle denetler.
          </p>
        </div>

        <!-- Omni Input Bar -->
        <div class="wss-omni-dock flex flex-col sm:flex-row gap-2.5">
          <div class="relative flex-1 flex items-center min-w-0">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <input 
              type="text" 
              id="target-input" 
              placeholder="örn: siteniz.com veya https://siteniz.com" 
              class="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm font-mono text-mistral-ink placeholder-stone-400 transition-all"
            />
          </div>
          <button 
            type="button"
            id="scan-btn" 
            onclick="startSecurityScan()" 
            class="wss-btn wss-btn-primary wss-mobile-full !py-3 !px-6 text-sm font-bold disabled:opacity-50"
          >
            <svg id="scan-spinner" class="hidden animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            <span id="scan-btn-text">Güvenlik Taramasını Başlat</span>
          </button>
        </div>
      </div>

      <!-- Modern Sekmeler (Yatay Kaydırılabilir) -->
      <div class="mb-6">
        <nav class="wss-tabs-nav" aria-label="Tarama Sekmeleri">
          <button type="button" id="tab-btn-audit" onclick="switchTab('audit')" class="wss-tab-btn active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Denetim Sonuçları &amp; Skor</span>
          </button>
          <button type="button" id="tab-btn-headers" onclick="switchTab('headers')" class="wss-tab-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            <span>Ham Header Taraması (cURL)</span>
          </button>
          <button type="button" id="tab-btn-checklist" onclick="switchTab('checklist')" class="wss-tab-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Güvenlik Kılavuzu &amp; Tam Sürüm Karşılaştırması</span>
          </button>
        </nav>
      </div>

      <!-- SEKME 1: DENETİM SONUÇLARI -->
      <div id="tab-content-audit" class="space-y-6">

        <!-- Boş Durum (İlk Açılış) -->
        <div id="scan-empty-state" class="text-center py-12 px-6 bg-white border border-dashed border-stone-300 rounded-2xl shadow-xs">
          <div class="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-mistral-orange flex items-center justify-center mx-auto mb-3">
            <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/></svg>
          </div>
          <h3 class="text-base font-bold font-editorial text-mistral-ink mb-1">Henüz Bir Alan Adı Taranmadı</h3>
          <p class="text-xs text-mistral-slate max-w-md mx-auto mb-4">
            Yukarıdaki arama çubuğuna bir alan adı girerek pasif güvenlik denetimini başlatabilirsiniz.
          </p>
          <button type="button" onclick="document.getElementById('target-input').focus()" class="wss-btn wss-btn-dark">
            <span>Alan Adı Girin</span>
          </button>
        </div>

        <!-- Canlı Sonuçlar (Gizli başlar) -->
        <div id="scan-results" class="hidden space-y-6">

          <!-- Skor Kartı & Genel Durum -->
          <div class="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div class="flex items-center gap-4 sm:gap-5">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center text-center p-2 shrink-0">
                <span id="score-grade-badge" class="px-2.5 py-0.5 rounded-full text-base sm:text-lg font-bold font-mono tracking-wider bg-emerald-600 text-white">A</span>
                <span class="text-[10px] text-stone-500 font-mono mt-1">Not</span>
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="text-2xl font-bold font-mono text-mistral-ink" id="score-number">--</span>
                  <span class="text-sm text-stone-400 font-mono">/ 100</span>
                  <span class="text-xs font-bold text-mistral-slate">• <span id="score-domain" class="font-mono text-stone-900"></span></span>
                </div>
                <p id="score-summary" class="text-xs text-mistral-slate max-w-xl leading-relaxed">
                  Denetim tamamlandı.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-stone-100">
              <button type="button" onclick="exportMarkdownReport()" class="wss-btn wss-btn-dark wss-mobile-full">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Raporu Dışa Aktar (.md)</span>
              </button>
            </div>
          </div>

          <!-- Sızıntı & Teknoloji İfşası Uyarısı (Opsiyonel) -->
          <div id="leaks-card" class="hidden bg-rose-50/70 border border-rose-200 rounded-2xl p-5 shadow-xs">
            <div class="flex items-center gap-2 mb-2 text-rose-800 font-bold text-sm">
              <svg class="w-4 h-4 text-rose-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>Sunucu &amp; Teknoloji Bilgi İfşası (Information Disclosure)</span>
            </div>
            <p class="text-xs text-rose-700 mb-3">
              Aşağıdaki başlıklarda tam sunucu yazılımı veya çalışma ortamı sürümü açıkça tespit edildi. Bu durum saldırganların hedefe yönelik exploit aramasını kolaylaştırır:
            </p>
            <div id="leaks-container" class="space-y-2"></div>
          </div>

          <!-- 2 Sütunlu Grid: Sol = HTTP Başlıkları, Sağ = DNS & E-posta -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Sol Sütun: HTTP Güvenlik Başlıkları -->
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-stone-200">
                <h3 class="text-base font-bold font-editorial text-mistral-ink flex items-center gap-2">
                  <svg class="w-4 h-4 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>HTTP Güvenlik Başlıkları</span>
                </h3>
                <span class="text-[11px] font-mono text-stone-500">6 Temel Başlık</span>
              </div>
              
              <div id="headers-list-container" class="space-y-3"></div>
            </div>

            <!-- Sağ Sütun: DNS, E-posta & Ağ Savunması -->
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-stone-200">
                <h3 class="text-base font-bold font-editorial text-mistral-ink flex items-center gap-2">
                  <svg class="w-4 h-4 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span>DNS, E-posta &amp; Alan Adı Kalkanları</span>
                </h3>
                <span class="text-[11px] font-mono text-stone-500">DoH Canlı Doğrulama</span>
              </div>

              <div id="dns-list-container" class="space-y-3"></div>
            </div>

          </div>

        </div>

      </div>

      <!-- SEKME 2: HAM HEADER TARAMASI (cURL MODU) -->
      <div id="tab-content-headers" class="hidden space-y-6">
        <div class="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <h3 class="text-lg font-bold font-editorial text-mistral-ink mb-1.5 flex items-center gap-2">
            <svg class="w-4 h-4 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            <span>Derin Header Taraması &amp; cURL Çıktısı Ayrıştırma</span>
          </h3>
          <p class="text-xs text-mistral-slate mb-4">
            Terminalinizden aldığınız <code class="inline-code font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-800">curl -I https://alanadiniz.com</code> çıktısını doğrudan buraya yapıştırarak anında derin denetim yapabilirsiniz:
          </p>

          <div class="mb-4">
            <textarea 
              id="manual-headers-input" 
              rows="8" 
              placeholder="HTTP/2 200&#10;date: Wed, 09 Oct 2026 12:00:00 GMT&#10;content-type: text/html&#10;content-security-policy: default-src'self';&#10;strict-transport-security: max-age=31536000; includeSubDomains; preload&#10;x-frame-options: SAMEORIGIN&#10;x-content-type-options: nosniff"
              class="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-mistral-ink placeholder-stone-400 transition-all"
            ></textarea>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span class="text-[11px] text-stone-500">Başlıkları yapıştırdıktan sonra aşağıdaki butona tıklayın.</span>
            <button type="button" onclick="startSecurityScan()" class="wss-btn wss-btn-primary">
              <span>Başlıkları Ayrıştır ve Puanla</span>
            </button>
          </div>
        </div>
      </div>

      <!-- SEKME 3: GÜVENLİK KILAVUZU & TAM SÜRÜM KARŞILAŞTIRMASI -->
      <div id="tab-content-checklist" class="hidden space-y-6">
        <!-- LOKAL vs WEB VERSİYON BİLGİLENDİRME & KARŞILAŞTIRMA KARTI -->
        <div class="rounded-2xl border border-orange-200 bg-orange-50/40 p-5 sm:p-6 shadow-xs">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-orange-200/60">
            <div>
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300 font-bold text-[11px] font-mono mb-2">
                <span>Tam Kapsamlı Standalone Sürüm</span>
              </div>
              <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">
                SAST, Aktif Güvenlik Testleri, AI Red Team &amp; Konteyner Sandbox
              </h2>
              <p class="text-xs text-mistral-slate mt-1 max-w-3xl leading-relaxed">
                Tarayıcı güvenlik sınırları (CORS) nedeniyle bu vitrin sayfasında üçüncü parti sitelere aktif test veya derin kaynak kod analizi yapılamaz. Tam yetenekli konsolu yerel makinenizde sıfır bağımlılıkla çalışan Python sunucusuyla başlatabilirsiniz.
              </p>
            </div>
            <div class="flex flex-wrap gap-2 shrink-0">
              <a href="https://github.com/melihkarasu/web-security-scanner" target="_blank" rel="noopener" class="wss-btn wss-btn-primary">
                <span>GitHub Reposuna Git</span>
              </a>
            </div>
          </div>

          <div class="bg-stone-900 rounded-xl p-3.5 sm:p-4 text-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="font-mono text-xs overflow-x-auto text-emerald-400 select-all">
              <span class="text-stone-400"># Lokal sunucuyu sıfır bağımlılıkla tek komutta başlatın:</span><br>
              git clone https://github.com/melihkarasu/web-security-scanner.git &amp;&amp; cd web-security-scanner &amp;&amp; python3 server.py
            </div>
          </div>
        </div>

        <div class="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
            <div>
              <h3 class="text-lg font-bold font-editorial text-mistral-ink mb-1">Modern Web Güvenliği Kontrol Listesi</h3>
              <p class="text-xs text-mistral-slate">VibeCodedApps, OWASP Top 10 ve Web Security Scanner güvenlik denetimlerinden derlenen kritik kontrol noktaları.</p>
            </div>
            <span class="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-mistral-orange font-bold border border-orange-200">6 Altın İlke</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <h4 class="font-bold text-sm text-mistral-ink mb-1">01. Çok Katmanlı SSRF &amp; DNS Rebinding Koruması (CWE-918)</h4>
              <p class="text-xs text-mistral-slate leading-relaxed">
                Dışarı istek atan tüm backend servislerinde istek öncesinde DNS çözümlenmeli; özel IP aralıkları ve Cloud Metadata engellenmelidir.
              </p>
            </div>
            <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <h4 class="font-bold text-sm text-mistral-ink mb-1">02. Veritabanı Düzeyinde Row Level Security (RLS)</h4>
              <p class="text-xs text-mistral-slate leading-relaxed">
                PostgreSQL üzerinde RLS (<code class="inline-code font-mono text-stone-800">auth.uid() = user_id</code>) daima açık olmalı, IDOR/BOLA veritabanı motorunda engellenmelidir.
              </p>
            </div>
            <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <h4 class="font-bold text-sm text-mistral-ink mb-1">03. Katı Gizlilik &amp; Liderlik Tablosu Maskelemesi</h4>
              <p class="text-xs text-mistral-slate leading-relaxed">
                Genel sıralamalarda kullanıcı isimleri katı maskeleme kuralı (<code class="inline-code font-mono text-stone-800">m*****u</code>) ile korunmalı, açık PII sızdırılmamalıdır.
              </p>
            </div>
            <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <h4 class="font-bold text-sm text-mistral-ink mb-1">04. Fail-Fast Secret Hijyeni</h4>
              <p class="text-xs text-mistral-slate leading-relaxed">
                Kaynak kodda hiçbir zaman açık metin yedek anahtar bulunmamalıdır. Ortam değişkeni yoksa uygulama fail-fast ile durmalıdır.
              </p>
            </div>
            <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <h4 class="font-bold text-sm text-mistral-ink mb-1">05. OAuth Token URL Sızıntısı &amp; Erken Yakalama</h4>
              <p class="text-xs text-mistral-slate leading-relaxed">
                OAuth dönüşlerinde <code class="inline-code font-mono text-stone-800">access_token</code> ilk boyamadan önce senkron yakalanıp <code class="inline-code font-mono text-stone-800">history.replaceState</code> ile temizlenmelidir.
              </p>
            </div>
            <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <h4 class="font-bold text-sm text-mistral-ink mb-1">06. Güvenli Pano Kopyalama Fallback Motoru</h4>
              <p class="text-xs text-mistral-slate leading-relaxed">
                HTTPS dışı ortamlarda gizli textarea ve <code class="inline-code font-mono text-stone-800">document.execCommand('copy')</code> geri dönüş motoru sağlanmalıdır.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('Web Security Scanner — Pasif Güvenlik Denetimi', content, extraHead));
  };
};
