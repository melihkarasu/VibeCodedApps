module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/httpstatus/app.js" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-orange transition text-sm flex items-center gap-1 font-medium">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Geliştirici Araçları</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>💻</span> HTTP Durum Sözlüğü & Tarayıcı Röntgeni
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Web geliştiricileri için 1xx-5xx HTTP yanıt kodları referansı, cURL kodları ve ziyaretçinin canlı donanım/GPU parmak izi analizi.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span class="font-medium" id="http-status-badge">Teşhis Motoru Aktif</span>
        </div>
      </div>

      <!-- CANLI TARAYICI & DONANIM RÖNTGENİ PANELİ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-mistral-hairline">
          <div>
            <h3 class="text-base font-bold font-editorial text-mistral-ink flex items-center gap-2">
              <span>🔍</span> Cihaz & Donanım Röntgeniniz (Live Fingerprint)
            </h3>
            <p class="text-xs text-mistral-slate mt-0.5">
              Tarayıcınızın donanım, grafik kartı (GPU), çözünürlük ve ağ yeteneklerinin canlı teşhisi.
            </p>
          </div>
          <button onclick="detectHardware()" class="px-3 py-1.5 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep text-xs font-semibold transition">
            Yenile
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
            <span class="text-[10px] text-mistral-stone block">Ekran Çözünürlüğü</span>
            <strong class="text-mistral-ink font-mono font-bold" id="hw-screen">-</strong>
          </div>
          <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
            <span class="text-[10px] text-mistral-stone block">Piksel Oranı (DPR)</span>
            <strong class="text-mistral-ink font-mono font-bold" id="hw-dpr">-</strong>
          </div>
          <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
            <span class="text-[10px] text-mistral-stone block">CPU Çekirdek Sayısı</span>
            <strong class="text-mistral-ink font-mono font-bold" id="hw-cores">-</strong>
          </div>
          <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
            <span class="text-[10px] text-mistral-stone block">Ağ Bağlantısı</span>
            <strong class="text-emerald-700 font-bold" id="hw-online">Çevrimiçi (Online)</strong>
          </div>
          <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
            <span class="text-[10px] text-mistral-stone block">Sistem Dili</span>
            <strong class="text-mistral-ink font-bold" id="hw-lang">-</strong>
          </div>
          <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep">
            <span class="text-[10px] text-mistral-stone block">Grafik (GPU) Hızlandırma</span>
            <strong class="text-mistral-orange font-bold truncate block" id="hw-gpu">Tespit ediliyor...</strong>
          </div>
        </div>
      </div>

      <!-- HTTP DURUM KODLARI ARAMA & KATEGORİ SEÇİCİ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div class="sm:col-span-8 relative">
            <input 
              type="text" 
              id="status-search" 
              placeholder="Kod numarası veya açıklama ara (örn: 404, 418, 500, Unauthorized, Timeout)..." 
              oninput="filterStatusCodes()"
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔎</span>
          </div>

          <div class="sm:col-span-4">
            <select id="status-cat-select" onchange="filterStatusCodes()" class="w-full px-3 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange transition">
              <option value="all" selected>Tüm HTTP Kodları (1xx - 5xx)</option>
              <option value="2xx">🟢 2xx Başarılı (Success)</option>
              <option value="3xx">🔵 3xx Yönlendirme (Redirect)</option>
              <option value="4xx">🟠 4xx İstemci Hatası (Client Error)</option>
              <option value="5xx">🔴 5xx Sunucu Hatası (Server Error)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- DURUM KODLARI IZGARASI -->
      <div id="status-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16">
        <!-- JS ile çizilir -->
      </div>

      <!-- KOD DETAY MODALI -->
      <div id="status-modal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div class="relative w-full max-w-xl bg-white border border-mistral-hairline rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5">
          <button onclick="closeModal()" class="absolute top-4 right-4 w-8 h-8 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-slate hover:text-mistral-ink flex items-center justify-center text-sm font-bold transition">✕</button>

          <div class="flex items-center gap-4">
            <span class="px-4 py-2 rounded-xl bg-mistral-cream border border-mistral-beige-deep text-2xl font-bold font-mono text-mistral-orange" id="m-code">404</span>
            <div>
              <span class="text-xs font-semibold text-mistral-stone uppercase tracking-wider" id="m-category">İSTEMCİ HATASI</span>
              <h3 class="text-2xl font-bold font-editorial text-mistral-ink" id="m-title">Not Found</h3>
            </div>
          </div>

          <p class="text-sm text-mistral-slate leading-relaxed" id="m-desc">
            Açıklama yükleniyor...
          </p>

          <!-- Esprili Görsel (http.cat) -->
          <div class="aspect-video w-full rounded-xl overflow-hidden bg-mistral-cream border border-mistral-beige-deep flex items-center justify-center">
            <img id="m-img" src="" alt="HTTP Cat" class="w-full h-full object-contain">
          </div>

          <!-- Örnek Kod Bloğu -->
          <div class="space-y-1.5">
            <span class="text-xs font-bold text-mistral-ink block">Örnek cURL Çağrısı:</span>
            <pre id="m-curl" class="p-3 rounded-lg bg-mistral-charcoal text-white text-xs font-mono overflow-x-auto"></pre>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('HTTP Durum Sözlüğü & Tarayıcı Röntgeni', content, extraHead));
  };
};
