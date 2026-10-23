module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="/static/apps/ipgeo/app.js?v=20261023a" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Geliştirici Araçları</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">IP Coğrafi Konum & Ağ İstihbaratı</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            ip-api altyapısı ve SSRF korumalı ağ teşhisi ile IP lokasyonu, İnternet Servis Sağlayıcısı (ISP), ASN ve harita koordinatları.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
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
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
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
            class="px-4 py-2.5 rounded-md text-mistral-ink font-bold bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer">
            <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span> Kendi IP'mi Getir
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

          <!-- Web Security Scanner SSRF Koruma Rozeti -->
          <div class="p-4 rounded-xl bg-mistral-cream-light border border-mistral-beige-deep text-xs text-mistral-slate space-y-1.5">
            <div class="font-bold text-mistral-ink flex items-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span> SSRF Savunması Aktif
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
