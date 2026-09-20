module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script src="/static/apps/deniz/app.js" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/app" class="text-mistral-slate hover:text-mistral-orange transition text-sm flex items-center gap-1 font-medium">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Coğrafya, Doğa & Çevre</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🌊</span> Mavi Rota: Denizcilik, Dalga & Sörf Radarı
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Open-Meteo Marine API ile Ege, Akdeniz ve Karadeniz kıyılarında canlı dalga boyu, periyot, rüzgar dalgası ve sörf uygunluğu.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
          <span class="font-medium" id="marine-status-badge">Deniz Telemetrisi Açık</span>
        </div>
      </div>

      <!-- KIYI & SPOT SEÇİCİ PANEL -->
      <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-8 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div class="sm:col-span-8">
            <select id="select-spot" onchange="onSpotChange()" class="w-full px-4 py-2.5 rounded-lg bg-white border border-mistral-hairline text-sm text-mistral-ink font-medium focus:outline-none focus:border-mistral-orange transition">
              <option value="alacati" selected>🏄‍♂️ Alaçatı Sörf Koyu (İzmir / Ege)</option>
              <option value="bodrum">⛵ Bodrum Yalıkavak (Muğla / Güney Ege)</option>
              <option value="kas">🤿 Kaş / Kaputaş Kıyısı (Antalya / Akdeniz)</option>
              <option value="bozcaada">🍇 Bozcaada Ayazma Koyu (Çanakkale / Kuzey Ege)</option>
              <option value="sile">🌊 Şile & Karadeniz Kıyıları (İstanbul / Karadeniz)</option>
              <option value="antalya">🏖️ Antalya Konyaaltı Körfezi (Akdeniz)</option>
              <option value="datca">🌅 Datça Palamutbükü (Ege-Akdeniz Birleşimi)</option>
              <option value="cesme">🏊‍♂️ Çeşme Ilıca Plajı (İzmir)</option>
              <option value="fethiye">🛶 Fethiye Ölüdeniz Lagünü (Muğla)</option>
            </select>
          </div>
          <div class="sm:col-span-4 flex gap-2">
            <button 
              type="button" 
              onclick="refreshMarineData()" 
              class="w-full py-2.5 px-4 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white font-medium text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
              <span>🔄</span> Dalga Durumunu Yenile
            </button>
          </div>
        </div>

        <!-- Hızlı Kıyı Hapları -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-mistral-hairline text-xs">
          <span class="text-mistral-stone font-medium mr-1">Popüler Noktalar:</span>
          <button onclick="setSpot('alacati')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🏄‍♂️ Alaçatı</button>
          <button onclick="setSpot('bodrum')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">⛵ Bodrum</button>
          <button onclick="setSpot('kas')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🤿 Kaş</button>
          <button onclick="setSpot('sile')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🌊 Şile</button>
          <button onclick="setSpot('bozcaada')" class="px-2.5 py-1 rounded-md text-mistral-ink font-boldbg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition">🍇 Bozcaada</button>
        </div>
      </div>

      <!-- CANLI DALGA DURUM KARTI & İSTATİSTİKLER -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        <!-- Sol: Dalga Durumu ve Tavsiye Paneli (5 Kolon) -->
        <div class="lg:col-span-5 space-y-6">
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm text-center relative overflow-hidden">
            <span class="text-xs uppercase tracking-wider text-mistral-stone font-semibold" id="lbl-spot-title">ALAÇATI SÖRF KOYU</span>
            
            <div class="my-4">
              <span class="text-6xl sm:text-7xl font-bold font-editorial text-mistral-ink" id="val-wave-height">0.4</span>
              <span class="text-xs text-mistral-slate block mt-1">Metre Dalga Yüksekliği</span>
            </div>

            <!-- Deniz Durumu Rozeti -->
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 border shadow-2xs" id="box-condition-badge">
              <span id="txt-condition">Sakin & Durgun</span>
            </div>

            <!-- Aktivite & Güvenlik Tavsiyesi -->
            <div class="p-4 rounded-xl bg-mistral-cream border border-mistral-beige-deep text-left text-xs text-mistral-slate space-y-2">
              <div class="font-bold text-mistral-ink flex items-center gap-1.5">
                <span>⚓</span> Deniz & Sörf Uygunluğu
              </div>
              <p id="txt-marine-advice" class="leading-relaxed">
                Deniz çarşaf gibi. Yüzme, kano, SUP ve aile aktiviteleri için son derece ideal.
              </p>
            </div>
          </div>

          <!-- Denizcilik Parametreleri Grid -->
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-4 rounded-xl bg-white border border-mistral-hairline shadow-xs">
              <span class="text-mistral-stone block font-medium">Dalga Periyodu</span>
              <strong class="text-xl font-bold font-editorial text-mistral-ink mt-1 block" id="val-wave-period">3.2 s</strong>
              <span class="text-[10px] text-mistral-stone">İki dalga arası süre</span>
            </div>

            <div class="p-4 rounded-xl bg-white border border-mistral-hairline shadow-xs">
              <span class="text-mistral-stone block font-medium">Rüzgar Dalgası</span>
              <strong class="text-xl font-bold font-editorial text-mistral-orange mt-1 block" id="val-wind-wave">0.1 m</strong>
              <span class="text-[10px] text-mistral-stone">Yüzey çalkantısı</span>
            </div>

            <div class="p-4 rounded-xl bg-white border border-mistral-hairline shadow-xs">
              <span class="text-mistral-stone block font-medium">Dalga Açısı / Yönü</span>
              <strong class="text-xl font-bold font-editorial text-mistral-ink mt-1 block" id="val-wave-dir">180°</strong>
              <span class="text-[10px] text-mistral-stone" id="val-wave-cardinal">Güney</span>
            </div>

            <div class="p-4 rounded-xl bg-white border border-mistral-hairline shadow-xs">
              <span class="text-mistral-stone block font-medium">Koordinat</span>
              <strong class="text-xs font-mono font-bold text-mistral-slate mt-1 block" id="val-coords">38.25° / 26.38°</strong>
              <span class="text-[10px] text-mistral-stone">Enlem / Boylam</span>
            </div>
          </div>
        </div>

        <!-- Sağ: 48 Saatlik Dalga Boyu Tahmin Grafiği (7 Kolon) -->
        <div class="lg:col-span-7 space-y-6">
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-mistral-hairline">
              <div>
                <h3 class="text-base font-bold font-editorial text-mistral-ink">48 Saatlik Dalga Boyu Tahmin Grafiği</h3>
                <p class="text-xs text-mistral-stone mt-0.5">Metre cinsinden saatlik dalga yüksekliği seyri</p>
              </div>
            </div>

            <div class="h-[280px]">
              <canvas id="chart-marine"></canvas>
            </div>
          </div>

          <!-- Denizcilik Rehber Kartı -->
          <div class="p-5 rounded-xl bg-mistral-cream-light border border-mistral-beige-deep text-xs text-mistral-slate space-y-2">
            <div class="font-bold text-mistral-ink flex items-center gap-1.5">
              <span>🏄‍♀️</span> Sörfçüler ve Yelkenciler İçin İpucu
            </div>
            <p class="leading-relaxed">
              <strong>Dalga Periyodu (Period):</strong> Periyot süresi ne kadar uzunsa (örn: 8-12 saniye), dalgalar o kadar düzenli, güçlü ve sörf için kalitelidir. Kısa periyotlu dalgalar (2-4 saniye) genellikle yerel rüzgarın yarattığı düzensiz yüzey çalkantısını gösterir.
            </p>
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('Mavi Rota: Denizcilik, Dalga & Sörf Radarı', content, extraHead));
  };
};
