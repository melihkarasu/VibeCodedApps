module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/web-security-scanner/app.css?v=20261010a">
      <script src="/static/apps/web-security-scanner/app.js?v=20261010a" defer></script>
    `;

    const content = `
      <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mistral-hairline pb-4">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs flex items-center gap-1 font-medium">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-bold">Güvenlik & Teşhis</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial flex items-center gap-2">
            <span>🛡️</span> Web Security Scanner
          </h1>
          <p class="text-xs text-mistral-slate mt-0.5">
            Pasif Güvenlik Başlıkları, DoH DNS & SSL Taraması • Sıfır WAF & Abuse Riski
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="exportMarkdownReport()" class="px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-mistral-ink transition-all flex items-center gap-1.5 cursor-pointer shadow-xs">
            <span>📥</span>
            <span>Rapor İndir (.md)</span>
          </button>
        </div>
      </div>

      <!-- Giriş & Arama Kutusu -->
      <div class="mb-8 bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div class="max-w-3xl mb-4">
          <h2 class="text-xl sm:text-2xl font-bold font-editorial text-mistral-ink mb-1.5">Web Sitesi Güvenlik Taraması</h2>
          <p class="text-xs sm:text-sm text-mistral-slate">
            Hedef siteye hiçbir zararlı payload göndermeden, yalnızca açık DNS/DoH kayıtlarını ve HTTP güvenlik başlıklarını (CSP, HSTS, X-Frame-Options, DMARC) pasif yöntemlerle denetler.
          </p>
        </div>

        <!-- Input Bar -->
        <div class="flex flex-col sm:flex-row gap-2.5">
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 text-sm">
              🌐
            </div>
            <input 
              type="text" 
              id="target-input" 
              placeholder="örn: siteniz.com veya https://siteniz.com" 
              class="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono text-mistral-ink placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          <button 
            id="scan-btn" 
            onclick="startSecurityScan()" 
            class="px-6 py-3 rounded-xl bg-mistral-orange text-white font-semibold text-sm hover:bg-mistral-orange transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span id="scan-spinner" class="hidden animate-spin">⏳</span>
            <span id="scan-btn-text">Güvenlik Taramasını Başlat</span>
          </button>
        </div>
      </div>

      <!-- Sekmeler -->
      <div class="flex items-center gap-2 border-b border-stone-200 mb-6 pb-2">
        <button id="tab-btn-audit" onclick="switchTab('audit')" class="px-4 py-2 rounded-lg text-xs font-bold bg-white text-mistral-ink shadow-xs border border-stone-200 transition-all cursor-pointer">
          🔍 Denetim Sonuçları & Skor
        </button>
        <button id="tab-btn-headers" onclick="switchTab('headers')" class="px-4 py-2 rounded-lg text-xs font-semibold text-mistral-slate hover:text-mistral-ink transition-all cursor-pointer">
          📋 Ham Header Taraması (cURL)
        </button>
        <button id="tab-btn-checklist" onclick="switchTab('checklist')" class="px-4 py-2 rounded-lg text-xs font-semibold text-mistral-slate hover:text-mistral-ink transition-all cursor-pointer">
          🛡️ Güvenlik Kılavuzu & Checklist
        </button>
      </div>

      <!-- SEKME 1: DENETİM SONUÇLARI -->
      <div id="tab-content-audit" class="space-y-6">

        <!-- Boş Durum (İlk Açılış) -->
        <div id="scan-empty-state" class="text-center py-16 bg-white border border-stone-200/80 rounded-2xl p-8 shadow-xs">
          <div class="w-14 h-14 rounded-2xl bg-orange-50 text-mistral-orange flex items-center justify-center text-2xl mx-auto mb-3">
            🔎
          </div>
          <h3 class="text-base font-bold font-editorial text-mistral-ink mb-1">Henüz Bir Alan Adı Taranmadı</h3>
          <p class="text-xs text-mistral-slate max-w-md mx-auto mb-4">
            Yukarıdaki arama çubuğuna bir alan adı girerek pasif güvenlik denetimini başlatabilirsiniz.
          </p>
          <button onclick="document.getElementById('target-input').focus()" class="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-all cursor-pointer">
            Kendi Alan Adınızı Test Edin
          </button>
        </div>

        <!-- Canlı Sonuçlar (Gizli başlar) -->
        <div id="scan-results" class="hidden space-y-6">

          <!-- Skor Kartı & Genel Durum -->
          <div class="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div class="flex items-center gap-5">
              <div class="w-20 h-20 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center text-center p-2">
                <span id="score-grade-badge" class="px-2.5 py-0.5 rounded-full text-lg font-bold font-mono tracking-wider bg-emerald-600 text-white">A</span>
                <span class="text-[10px] text-stone-500 font-mono mt-1">Not</span>
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-2xl font-bold font-mono text-mistral-ink" id="score-number">--</span>
                  <span class="text-sm text-stone-400 font-mono">/ 100</span>
                  <span class="text-xs font-bold text-mistral-slate ml-2">• <span id="score-domain" class="font-mono text-stone-900"></span></span>
                </div>
                <p id="score-summary" class="text-xs text-mistral-slate max-w-xl">
                  Denetim tamamlandı.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-stone-100">
              <button onclick="exportMarkdownReport()" class="w-full md:w-auto px-4 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                <span>📄</span>
                <span>Raporu Dışa Aktar (.md)</span>
              </button>
            </div>
          </div>

          <!-- Sızıntı & Teknoloji İfşası Uyarısı (Opsiyonel) -->
          <div id="leaks-card" class="hidden bg-rose-50/70 border border-rose-200 rounded-2xl p-5 shadow-xs">
            <div class="flex items-center gap-2 mb-2 text-rose-800 font-bold text-sm">
              <span>⚠️</span>
              <span>Sunucu & Teknoloji Bilgi İfşası (Information Disclosure)</span>
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
                  <span>🛡️</span>
                  <span>HTTP Güvenlik Başlıkları</span>
                </h3>
                <span class="text-[11px] font-mono text-stone-500">6 Temel Başlık</span>
              </div>
              
              <div id="headers-list-container" class="space-y-3">
                <!-- JS ile dinamik doldurulur -->
              </div>
            </div>

            <!-- Sağ Sütun: DNS, E-posta & Ağ Savunması -->
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-stone-200">
                <h3 class="text-base font-bold font-editorial text-mistral-ink flex items-center gap-2">
                  <span>🌐</span>
                  <span>DNS, E-posta & Alan Adı Kalkanları</span>
                </h3>
                <span class="text-[11px] font-mono text-stone-500">DoH Canlı Doğrulama</span>
              </div>

              <div id="dns-list-container" class="space-y-3">
                <!-- JS ile dinamik doldurulur -->
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- SEKME 2: HAM HEADER TARAMASI (cURL MODU) -->
      <div id="tab-content-headers" class="hidden space-y-6">
        <div class="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
          <h3 class="text-lg font-bold font-editorial text-mistral-ink mb-1.5 flex items-center gap-2">
            <span>📋</span>
            <span>Derin Header Taraması & cURL Çıktısı Ayrıştırma</span>
          </h3>
          <p class="text-xs text-mistral-slate mb-4">
            Terminalinizden aldığınız <code class="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-stone-800">curl -I https://alanadiniz.com</code> çıktısını doğrudan buraya yapıştırarak anında derin denetim yapabilirsiniz:
          </p>

          <div class="mb-4">
            <textarea 
              id="manual-headers-input" 
              rows="8" 
              placeholder="HTTP/2 200&#10;date: Wed, 09 Oct 2026 12:00:00 GMT&#10;content-type: text/html&#10;content-security-policy: default-src 'self';&#10;strict-transport-security: max-age=31536000; includeSubDomains; preload&#10;x-frame-options: SAMEORIGIN&#10;x-content-type-options: nosniff"
              class="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-mistral-ink placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            ></textarea>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-[11px] text-stone-500">Başlıkları yapıştırdıktan sonra yukarıdaki "Güvenlik Taramasını Başlat" butonuna tıklayın.</span>
            <button onclick="startSecurityScan()" class="px-5 py-2.5 rounded-xl bg-mistral-orange text-white text-xs font-semibold hover:bg-mistral-orange transition-all cursor-pointer shadow-xs">
              Başlıkları Ayrıştır ve Puanla
            </button>
          </div>
        </div>
      </div>

      <!-- SEKME 3: GÜVENLİK KILAVUZU & CHECKLIST -->
      <div id="tab-content-checklist" class="hidden space-y-6">
        <div class="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
            <div>
              <h3 class="text-lg font-bold font-editorial text-mistral-ink mb-1">Modern Web Güvenliği Kontrol Listesi</h3>
              <p class="text-xs text-mistral-slate">VibeCodedApps, OWASP Top 10 ve Web Security Scanner güvenlik deneyimlerinden derlenen kritik kontrol noktaları.</p>
            </div>
            <span class="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-mistral-orange font-bold border border-orange-200">6 Altın İlke</span>
          </div>

          <div class="space-y-4">
            
            <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <h4 class="font-bold text-sm text-mistral-ink mb-1 flex items-center gap-2">
                <span class="text-base">1️⃣</span>
                <span>Çok Katmanlı SSRF & DNS Rebinding Koruması (CWE-918)</span>
              </h4>
              <p class="text-xs text-mistral-slate mb-2">
                Dışarı istek atan tüm backend servislerinde sadece hostname regex kontrolü yetersizdir. İstek öncesinde DNS çözümlenmeli; <code class="font-mono text-stone-800">127.0.0.0/8</code>, <code class="font-mono text-stone-800">10.0.0.0/8</code>, <code class="font-mono text-stone-800">169.254.169.254</code> (Cloud Metadata), CGNAT ve hex IP gösterimleri (<code class="font-mono text-stone-800">0x7f000001</code>) engellenmelidir. Yönlendirmelerde (302) her adımda adres yeniden test edilmelidir.
              </p>
            </div>

            <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <h4 class="font-bold text-sm text-mistral-ink mb-1 flex items-center gap-2">
                <span class="text-base">2️⃣</span>
                <span>Veritabanı Düzeyinde Row Level Security (RLS)</span>
              </h4>
              <p class="text-xs text-mistral-slate mb-2">
                İstemci tarafında açık anonim anahtarlar (Supabase vb.) kullanıldığında kullanıcı izolasyonu yalnızca API katmanına bırakılamaz. PostgreSQL üzerinde RLS (<code class="font-mono text-stone-800">auth.uid() = user_id</code>) daima açık olmalı, yetkisiz kullanıcıların başkalarının kayıtlarını görmesi (IDOR/BOLA) veritabanı motorunda engellenmelidir.
              </p>
            </div>

            <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <h4 class="font-bold text-sm text-mistral-ink mb-1 flex items-center gap-2">
                <span class="text-base">3️⃣</span>
                <span>Katı Gizlilik & Liderlik Tablosu Maskelemesi</span>
              </h4>
              <p class="text-xs text-mistral-slate mb-2">
                Genel sıralamalarda ve liderlik tablolarında kullanıcı isimleri veya e-postaları doğrudan yayınlanmamalıdır. Katı maskeleme kuralı (<code class="font-mono text-stone-800">m*****u</code> — ilk ve son harf açık, ortası 5 yıldız) ile PII (Kişisel Tanımlanabilir Bilgi) ifşası önlenmelidir.
              </p>
            </div>

            <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <h4 class="font-bold text-sm text-mistral-ink mb-1 flex items-center gap-2">
                <span class="text-base">4️⃣</span>
                <span>Fail-Fast Secret Hijyeni & Demo Uç Noktalarının Kapatılması</span>
              </h4>
              <p class="text-xs text-mistral-slate mb-2">
                Kaynak kodda hiçbir zaman <code class="font-mono text-stone-800">process.env.SECRET || 'default'</code> gibi açık metin yedek anahtar bulunmamalıdır. Ortam değişkeni yoksa uygulama güvenle çökmelidir (fail-fast). Test amaçlı açılan şifresiz hızlı giriş (quick-login) uç noktaları üretimde tamamen kaldırılmalıdır.
              </p>
            </div>

            <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <h4 class="font-bold text-sm text-mistral-ink mb-1 flex items-center gap-2">
                <span class="text-base">5️⃣</span>
                <span>OAuth Token URL Sızıntısı & Erken Yakalama</span>
              </h4>
              <p class="text-xs text-mistral-slate mb-2">
                OAuth giriş dönüşlerinde hash veya query parametresindeki <code class="font-mono text-stone-800">access_token</code>, sayfanın ilk boyamasından (first paint) önce senkron olarak yakalanmalı ve <code class="font-mono text-stone-800">history.replaceState</code> ile adres satırından silinmelidir. Aksi takdirde token tarayıcı geçmişine ve ekran paylaşımlarına sızar.
              </p>
            </div>

            <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <h4 class="font-bold text-sm text-mistral-ink mb-1 flex items-center gap-2">
                <span class="text-base">6️⃣</span>
                <span>Güvenli Pano Kopyalama Fallback Motoru</span>
              </h4>
              <p class="text-xs text-mistral-slate mb-2">
                Modern tarayıcılar <code class="font-mono text-stone-800">navigator.clipboard</code> API'sini sadece HTTPS ve localhost altında çalıştırır. HTTP veya IP üzerinden erişilen ortamlarda gizli textarea ve <code class="font-mono text-stone-800">document.execCommand('copy')</code> geri dönüş (fallback) motoru sağlanmalıdır.
              </p>
            </div>

          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate({ content, extraHead, title: 'Web Security Scanner — Pasif Güvenlik Denetimi' }));
  };
};
