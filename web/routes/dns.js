module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/dns/app.css">
      <script src="/static/apps/dns/app.js?v=20260926p" defer></script>
    `;

    const content = `
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-sm flex items-center gap-1">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold">Yeni Seri #5</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight mt-1 text-mistral-ink flex items-center gap-2">
            <span>🌐</span> DNS Kontrol & Ağ Teşhisi
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5">
            Cloudflare & Google DoH (DNS over HTTPS) ile anlık DNS kayıtları, küresel yayılım, SPF/DMARC ve gecikme testi.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-slate">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>DoH (DNS-over-HTTPS) Güvenli Protokol</span>
        </div>
      </div>

      <!-- 1. DOMAIN VE KAYIT TÜRÜ ARAMA PANELİ -->
      <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-5">
        
        <!-- Arama Çubuğu -->
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate mb-1.5">
            Sorgulanacak Alan Adı (Domain)
          </label>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <input type="text" id="input-domain" value="github.com" placeholder="Örn: google.com, cloudflare.com, turkiye.gov.tr..." onkeyup="if(event.key==='Enter') executeDnsLookup()" class="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-mistral-hairline text-sm font-mono text-mistral-ink placeholder-slate-500 focus:border-cyan-400 focus:outline-none">
              <span class="absolute left-3.5 top-3.5 text-mistral-stone text-base">🌐</span>
            </div>
            <button onclick="executeDnsLookup()" id="btn-lookup" class="px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm transition shadow-lg shadow-cyan-500/20 shrink-0 flex items-center justify-center gap-2">
              <span>⚡</span> Kayıtları Çözümle
            </button>
          </div>
        </div>

        <!-- Hızlı Örnekler -->
        <div class="flex flex-wrap items-center gap-2 text-xs pt-1">
          <span class="text-mistral-stone text-[11px]">Hızlı Örnekler:</span>
          <button onclick="quickLookup('github.com')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">github.com</button>
          <button onclick="quickLookup('google.com')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">google.com</button>
          <button onclick="quickLookup('cloudflare.com')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">cloudflare.com</button>
          <button onclick="quickLookup('turkiye.gov.tr')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">turkiye.gov.tr</button>
          <button onclick="quickLookup('wikipedia.org')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">wikipedia.org</button>
        </div>

        <!-- Kayıt Türü Sekmeleri (A, AAAA, MX, TXT, NS, SOA, ALL) -->
        <div class="pt-3 border-t border-mistral-hairline flex flex-wrap gap-2">
          <button onclick="setRecordType('A')" id="btn-type-A" class="type-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 transition shadow">A (IPv4)</button>
          <button onclick="setRecordType('AAAA')" id="btn-type-AAAA" class="type-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink transition">AAAA (IPv6)</button>
          <button onclick="setRecordType('CNAME')" id="btn-type-CNAME" class="type-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink transition">CNAME</button>
          <button onclick="setRecordType('MX')" id="btn-type-MX" class="type-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink transition">MX (Mail)</button>
          <button onclick="setRecordType('TXT')" id="btn-type-TXT" class="type-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink transition">TXT (SPF/DMARC)</button>
          <button onclick="setRecordType('NS')" id="btn-type-NS" class="type-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink transition">NS (Nameserver)</button>
          <button onclick="setRecordType('SOA')" id="btn-type-SOA" class="type-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink transition">SOA</button>
          <button onclick="setRecordType('ALL')" id="btn-type-ALL" class="type-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-mistral-hairline text-mistral-slate hover:text-mistral-ink transition">Kapsamlı Özet</button>
        </div>

      </div>

      <div id="loading-spinner" class="hidden py-16 text-center text-mistral-slate text-sm flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
        <span>Cloudflare ve Google DoH sunucularından DNS kayıtları çözümleniyor...</span>
      </div>

      <!-- 2. TEŞHİS VE ÖZET KARTLARI -->
      <div id="dns-results-area" class="space-y-8">
        
        <!-- Üst Metrikler (Gecikme, DNSSEC, Güvenlik) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow">
            <span class="text-[10px] text-mistral-slate uppercase font-bold">Cloudflare DoH Çözümleme</span>
            <div class="text-2xl font-black text-cyan-400 font-mono mt-1" id="val-cf-latency">-- ms</div>
            <p class="text-[11px] text-mistral-slate mt-1">1.1.1.1 Anycast Güvenli DNS</p>
          </div>

          <div class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow">
            <span class="text-[10px] text-mistral-slate uppercase font-bold">Google DoH Çözümleme</span>
            <div class="text-2xl font-black text-blue-400 font-mono mt-1" id="val-google-latency">-- ms</div>
            <p class="text-[11px] text-mistral-slate mt-1">8.8.8.8 Global DNS Resolver</p>
          </div>

          <div class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] text-mistral-slate uppercase font-bold">DNSSEC Durumu</span>
              <span id="badge-dnssec" class="px-2 py-0.5 rounded text-[10px] font-bold bg-mistral-cream text-mistral-slate">--</span>
            </div>
            <div class="text-sm font-bold text-mistral-ink mt-1" id="val-dnssec-text">Kontrol ediliyor...</div>
            <p class="text-[11px] text-mistral-slate mt-1">Kriptografik DNS doğrulama bayrağı</p>
          </div>

          <div class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] text-mistral-slate uppercase font-bold">E-Posta Güvenliği</span>
              <span id="badge-email-sec" class="px-2 py-0.5 rounded text-[10px] font-bold bg-mistral-cream text-mistral-slate">--</span>
            </div>
            <div class="text-xs font-bold text-mistral-ink mt-1" id="val-email-sec-text">SPF / DMARC Analizi</div>
            <p class="text-[11px] text-mistral-slate mt-1" id="val-email-sec-sub">Sahte e-posta koruması</p>
          </div>
        </div>

        <!-- Kayıtlar Tablosu -->
        <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-mistral-ink flex items-center gap-2">
                <span>📋</span> Çözümlenen DNS Kayıtları
              </h3>
              <p class="text-mistral-slate text-xs mt-0.5" id="records-table-sub">Domain ve kayıt tipi dökümü</p>
            </div>
            <span class="px-3 py-1 rounded-xl bg-white border border-mistral-hairline text-xs font-mono font-bold text-cyan-700" id="records-count-badge">
              0 Kayıt
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="border-b border-mistral-hairline text-mistral-slate">
                  <th class="pb-2.5 pl-2 font-semibold">Tür</th>
                  <th class="pb-2.5 font-semibold">Alan Adı (Host)</th>
                  <th class="pb-2.5 font-semibold">TTL</th>
                  <th class="pb-2.5 font-semibold">Çözümlenen Değer / Hedef (Data)</th>
                  <th class="pb-2.5 text-right pr-2">İşlem</th>
                </tr>
              </thead>
              <tbody id="dns-records-tbody" class="divide-y divide-mistral-hairline">
                <!-- JS ile satırlar -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. KÜRESEL DNS YAYILIM TESTİ (PROPAGATION SIMULATOR) -->
        <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-mistral-ink flex items-center gap-2">
                <span>🌍</span> Küresel DNS Çözümleme Ağı
              </h3>
              <p class="text-mistral-slate text-xs mt-0.5">Dünya genelindeki popüler resolver düğümlerinde A kaydı yayılım durumu:</p>
            </div>
            <span class="text-xs text-mistral-slate font-mono">Global Anycast</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1" id="global-nodes-grid">
            <!-- JS ile doldurulur -->
          </div>
        </div>

      </div>

      <!-- 4. SON SORGULANAN DOMAINLER (RECENT LOOKUPS) -->
      <div class="mt-14 pt-8 border-t border-mistral-hairline space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-mistral-ink flex items-center gap-2">
              <span>📚</span> Son Sorgulanan Alan Adları
            </h3>
            <p class="text-mistral-slate text-xs">Tek tıkla eski analizlerinize geri dönün.</p>
          </div>
          <button onclick="clearRecentLookups()" class="text-xs text-rose-400 hover:underline">Geçmişi Temizle</button>
        </div>

        <div id="recent-lookups-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <!-- JS ile doldurulur -->
        </div>
      </div>

      <!-- Toast Bildirimi -->
      <div id="dns-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı -->
    `;

    res.send(pageTemplate('DNS Kontrol & Ağ Teşhisi', content, extraHead));
  };
};
