module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="/static/apps/ipgeo/app.js" defer></script>
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
            <span>🌐</span> IP Coğrafi Konum & Ağ İstihbaratı
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            ip-api altyapısı ve SSRF korumalı ağ teşhisi ile IP lokasyonu, İnternet Servis Sağlayıcısı (ISP), ASN ve harita koordinatları.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span class="font-medium" id="ip-badge-status">Teşhis Hazır</span>
        </div>
      </div>

      <!-- SORGULAMA KONTROLLERİ -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <input 
              type="text" 
              id="input-ip" 
              placeholder="IP adresi girin (örn: 8.8.8.8 veya 1.1.1.1) ya da boş bırakıp kendi IP'nizi arayın..." 
              onkeydown="if(event.key==='Enter') lookupIp()"
              class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm">🔎</span>
          </div>
          <button 
            type="button" 
            onclick="lookupIp()" 
            class="px-5 py-2.5 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs font-medium transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <span>Sorgula</span> &rarr;
          </button>
          <button 
            type="button" 
            onclick="lookupSelfIp()" 
            class="px-4 py-2.5 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer">
            <span>📍</span> Kendi IP'mi Getir
          </button>
        </div>

        <div id="ip-error-box" class="hidden p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"></div>
      </div>

      <!-- HARİTA VE DETAY KARTLARI -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        <!-- Sol: Ağ & Konum Bilgi Paneli (5 Kolon) -->
        <div class="lg:col-span-5 space-y-6">
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-mistral-hairline">
              <span class="text-xs text-mistral-stone font-semibold uppercase tracking-wider">Tespit Edilen IP</span>
              <strong class="text-base font-mono font-bold text-mistral-orange" id="res-ip">--</strong>
            </div>

            <div class="space-y-3 text-xs">
              <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep flex justify-between items-center">
                <span class="text-mistral-slate">Ülke & Kod:</span>
                <strong class="text-mistral-ink text-sm font-editorial" id="res-country">--</strong>
              </div>
              <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep flex justify-between items-center">
                <span class="text-mistral-slate">Şehir / Bölge:</span>
                <strong class="text-mistral-ink text-sm font-editorial" id="res-city">--</strong>
              </div>
              <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep flex justify-between items-center">
                <span class="text-mistral-slate">İnternet Servis Sağlayıcı (ISP):</span>
                <strong class="text-mistral-ink text-right max-w-[200px] truncate" id="res-isp">--</strong>
              </div>
              <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep flex justify-between items-center">
                <span class="text-mistral-slate">Otonom Sistem (ASN):</span>
                <strong class="text-mistral-ink text-right max-w-[200px] truncate font-mono text-[11px]" id="res-as">--</strong>
              </div>
              <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep flex justify-between items-center">
                <span class="text-mistral-slate">Saat Dilimi:</span>
                <strong class="text-mistral-ink" id="res-tz">--</strong>
              </div>
              <div class="p-3 rounded-xl bg-mistral-cream border border-mistral-beige-deep flex justify-between items-center">
                <span class="text-mistral-slate">Posta Kodu:</span>
                <strong class="text-mistral-ink" id="res-zip">--</strong>
              </div>
            </div>
          </div>

          <!-- Strix SSRF Koruma Rozeti -->
          <div class="p-4 rounded-xl bg-mistral-cream-light border border-mistral-beige-deep text-xs text-mistral-slate space-y-1.5">
            <div class="font-bold text-mistral-ink flex items-center gap-1.5">
              <span>🛡️</span> Strix SSRF Savunması Aktif
            </div>
            <p class="leading-relaxed text-[11px]">
              Dahili ağlar, yerel IP adresleri (127.0.0.1, 10.x, 192.168.x, 172.16-31.x) ve bulut metaveri IP'si sunucu tarafında filtrelenir; sadece genel internet adresleri çözümlenir.
            </p>
          </div>
        </div>

        <!-- Sağ: Leaflet Haritası (7 Kolon) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="p-3 rounded-2xl bg-white border border-mistral-hairline shadow-sm relative overflow-hidden">
            <div id="geo-map" class="w-full h-[450px] rounded-xl z-10"></div>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('IP Coğrafi Konum & Ağ İstihbaratı', content, extraHead));
  };
};
