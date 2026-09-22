module.exports = function(pageTemplate) {
  return function(req, res) {
    const categories = [
      {
        id: "saglik",
        title: "Sağlık",
        icon: "🏥",
        desc: "Nöbetçi eczaneler, ilaç prospektüsleri, medikal rehberler ve sağlık verileri",
        apps: [
          {
            id: "nobetci-eczane",
            name: "İzmir Nöbetçi Eczane Radarı",
            icon: "💊",
            desc: "İzmir BB Açık Veri API'si ve OpenStreetMap ile canlı konum, en yakın 5 nöbetçi eczane, mesafe ve tek tıkla arama/yol tarifi.",
            url: "/nobetci-eczane",
            action: "Eczaneleri Bul"
          },
          {
            id: "ilac-rehberi",
            name: "İlaç & Prospektüs Rehberi",
            icon: "💊",
            desc: "U.S. FDA ve resmi farmakope veri tabanı ile etken maddeler, prospektüs özeti, kullanım uyarıları ve açık bildirilmiş yan etki analitiği.",
            url: "/ilac-rehberi",
            action: "İlacı İncele"
          },
          {
            id: "kas-anatomisi",
            name: "İnteraktif Kas Anatomisi & Egzersiz",
            icon: "🏋️",
            desc: "workout-cool ve Wger verileriyle interaktif vücut kas haritası, hedeflenen egzersizler, doğru form rehberi ve duruş terapisi.",
            url: "/kas-anatomisi",
            action: "Anatomiyi Keşfet"
          },
          {
            id: "klinik-arastirma",
            name: "Klinik Araştırmalar Radarı",
            icon: "🔬",
            desc: "NIH ClinicalTrials.gov v2 API ile kanser, diyabet ve nörolojideki aktif klinik deneyler, faz aşamaları ve deneysel tedaviler.",
            url: "/klinik-arastirma",
            action: "Çalışmaları İncele"
          },
          {
            id: "dso-saglik",
            name: "Küresel Sağlık Atlası (DSÖ)",
            icon: "🌐",
            desc: "Dünya Sağlık Örgütü resmi verileriyle Türkiye ve 190+ ülkenin beklenen yaşam süresi, aşılanma ve mortalite göstergeleri.",
            url: "/dso-saglik",
            action: "Göstergeleri İncele"
          }
        ]
      },

      {
        id: "cografya-doga",
        title: "Coğrafya, Doğa & Çevre",
        icon: "🌱",
        desc: "İklim, tarımsal meteoroloji, çevre bilinci, küresel atlas ve hava kalitesi",
        apps: [
          {
            id: "tarim-hava",
            name: "Akıllı Tarım & Zirai Hava",
            icon: "🌾",
            desc: "Open-Meteo ile toprak nemi/sıcaklığı derinlikleri, don riski erken uyarı sistemi, evapotranspirasyon ve sulama tavsiyeleri.",
            url: "/tarim-hava",
            action: "Paneli Başlat"
          },
          {
            id: "karbon-metre",
            name: "Web Karbon Ayak İzi",
            icon: "🌱",
            desc: "Web sitelerinin sayfa yükleme başına CO2 salımı, yeşil hosting doğrulaması ve gömülebilir dinamik eko-rozet.",
            url: "/karbon-metre",
            action: "Ölçümü Başlat"
          },
          {
            id: "doga-sesleri",
            name: "Kuş Sesi Dedektifi",
            icon: "🐦",
            desc: "iNaturalist biyoakustik arşivi ile 500.000+ yabani kuş sesi, canlı spektrum ses dalgası ve mini tahmin testi.",
            url: "/doga-sesleri",
            action: "Sesleri Dinle"
          },
          {
            id: "cografya-atlasi",
            name: "Küresel Coğrafya Atlası",
            icon: "🌍",
            desc: "REST Countries API ile 250 dünya ülkesinin bayrakları, başkentleri, nüfusu, dilleri ve sınır komşuları.",
            url: "/cografya-atlasi",
            action: "Atlası İncele"
          },
          {
            id: "hava-kalitesi",
            name: "Canlı Hava Kalitesi Radarı",
            icon: "💨",
            desc: "Dünya şehirlerinin canlı PM2.5, PM10, NO2 kirlilik seviyeleri, Avrupa AQI endeksi ve sağlık tavsiyeleri.",
            url: "/hava-kalitesi",
            action: "Havayı Ölç"
          },
          {
            id: "sehir-bisiklet",
            name: "Şehir Bisiklet Rehberi",
            icon: "🚲",
            desc: "CityBikes API ile 400+ dünya metropolünde canlı bisiklet durakları, boş bisiklet ve park yuvası haritası.",
            url: "/sehir-bisiklet",
            action: "Durakları Gör"
          },
          {
            id: "deniz-dalga",
            name: "Mavi Rota: Dalga & Sörf Radarı",
            icon: "🌊",
            desc: "Open-Meteo Marine API ile Ege, Akdeniz ve Karadeniz kıyılarında canlı dalga boyu, periyot ve sörf uygunluğu.",
            url: "/deniz-dalga",
            action: "Denizi İncele"
          },
          ]
      },
      {
        id: "uzay-bilim",
        title: "Uzay & Bilim",
        icon: "🧬",
        desc: "Moleküler kimya, 3D WebGL modelleme ve canlı yörünge takibi",
        apps: [
          {
            id: "molekul-studyosu",
            name: "3D Molekül Stüdyosu",
            icon: "🧬",
            desc: "PubChem 3D Conformer ve 3Dmol.js WebGL motoruyla kimyasalların ve ilaçların 3D atomik modellemesi.",
            url: "/molekul-studyosu",
            action: "Stüdyoyu Başlat"
          },
          {
            id: "iss-takip",
            name: "Where is ISS? Uzay Radarı",
            icon: "🛰️",
            desc: "Uluslararası Uzay İstasyonu'nun (ISS) anlık enlem, boylam, 27.600 km/s yörünge hızı ve canlı haritası.",
            url: "/iss-takip",
            action: "İstasyonu Takip Et"
          },
          {
            id: "sayilar-atlasi",
            name: "Sayılar Atlası & Matematik",
            icon: "🧮",
            desc: "Numbers motoru ile sayıların asallık, Fibonacci, bölen analizi, ikili kodları ve tarihteki gizemli gerçekleri.",
            url: "/sayilar-atlasi",
            action: "Sayıyı Keşfet"
          },
          {
            id: "nobel-arsivi",
            name: "Nobel Ödülleri Arşivi",
            icon: "🎖️",
            desc: "Nobel Vakfı resmi API'si ile 1901'den günümüze bilim insanları, çığır açan keşifler ve edebiyat ödülleri.",
            url: "/nobel-arsivi",
            action: "Arşivi İncele"
          }
        ]
      },
      {
        id: "sanat-tarih-edebiyat",
        title: "Sanat, Tarih & Edebiyat",
        icon: "🎨",
        desc: "Klasik edebiyat, küresel müzeler, görsel sanatlar, tatil hafızası ve kelime oyunları",
        apps: [
          {
            id: "sanat-galerisi",
            name: "Global Sanat Galerisi",
            icon: "🎨",
            desc: "The Met Museum dijital arşivi ile usta ressamlar, derin yakınlaştırma (deep zoom) ve kişisel sanat sergisi.",
            url: "/sanat-galerisi",
            action: "Galeriyi Gez"
          },
          {
            id: "klasik-kutuphane",
            name: "Dijital Kütüphane",
            icon: "📖",
            desc: "Project Gutenberg ile 70.000+ dünya klasiği, tarayıcı içi e-kitap okuyucu, yer imleri ve kişisel kitaplık.",
            url: "/klasik-kutuphane",
            action: "Okumaya Başla"
          },
          {
            id: "tatil-takvimi",
            name: "Küresel Tatil Takvimi",
            icon: "📅",
            desc: "100+ ülkenin resmi tatilleri, eşzamanlı çoklu ülke karşılaştırması, akıllı köprü izin fırsatları ve iCal desteği.",
            url: "/tatil-takvimi",
            action: "Takvimi Aç"
          },
          {
            id: "unesco-miras",
            name: "UNESCO Dünya Mirası Atlası",
            icon: "🏛️",
            desc: "Göbeklitepe'den Machu Picchu'ya dünya mirası alanları, fotoğrafları, kabul yılları ve harita konumları.",
            url: "/unesco-miras",
            action: "Mirasları Keşfet"
          },
          {
            id: "sesli-kitap",
            name: "Sesli Kütüphane (LibriVox)",
            icon: "🎧",
            desc: "LibriVox açık kamu malı arşivi ile dünya edebiyatı klasiklerinin seslendirilmiş kayıtları ve ses çaları.",
            url: "/sesli-kitap",
            action: "Kitap Dinle"
          },
          {
            id: "siir-antolojisi",
            name: "Şiir Vahası: Şiir Antolojisi",
            icon: "📜",
            desc: "PoetryDB açık arşivi ile Shakespeare, Poe, Dickinson ve usta şairlerin 3.000+ eseri ve tipografik okuyucu.",
            url: "/siir-antolojisi",
            action: "Şiirleri Oku"
          }
        ]
      },
      {
        id: "oyun",
        title: "Oyun",
        icon: "🎮",
        desc: "İnteraktif bilgi yarışmaları, çok oyunculu düellolar ve dijital oyun kütüphanesi",
        apps: [
          {
            id: "kultur-arena",
            name: "Kültür Arenası & Trivia",
            icon: "🌍",
            desc: "Solo yarışma, 1v1 canlı düello odaları, başarımlar, XP seviyeleri ve detaylı karşılaşma geçmişi.",
            url: "/kultur-arena",
            action: "Arenaya Gir"
          },
          {
            id: "oyun-radar",
            name: "Steam & Epic Fırsat Avcısı",
            icon: "🏷️",
            desc: "CheapShark & GamerPower ile anlık büyük indirimler, %100 ücretsiz kalıcı hediyeler ve istek listesi.",
            url: "/oyun-radar",
            action: "Fırsatları Yakala"
          },
          {
            id: "oyun-arsivi",
            name: "Oyun Keşif Kütüphanesi",
            icon: "🕹️",
            desc: "FreeToGame ve açık oyun veritabanı ile PC ve tarayıcı tabanlı yüzlerce oyun, tür filtreleri ve detaylar.",
            url: "/oyun-arsivi",
            action: "Oyunları Keşfet"
          },
          {
            id: "oyun-rekorlari",
            name: "Speedrun Oyun Rekorları",
            icon: "⚡",
            desc: "Speedrun.com açık veritabanı ile popüler video oyunlarının dünya rekoru bitirme süreleri ve liderleri.",
            url: "/oyun-rekorlari",
            action: "Rekorları Gör"
          }
        ]
      },
      {
        id: "populer-kultur",
        title: "Popüler Kültür & Eğlence",
        icon: "🍿",
        desc: "Dizi/film ajandası, miksoloji, gastronomi, müzik ve besin alerjen dedektifi",
        apps: [
          {
            id: "dizi-rehberi",
            name: "Dizi & Sezon Takipçisi",
            icon: "🎬",
            desc: "IMDb & TVmaze ile bölüm bazlı sezon takibi, izleme ajandası ve IMDb linkiyle özel yapım ekleme.",
            url: "/dizi-rehberi",
            action: "Rehberi Başlat"
          },
          {
            id: "sozden-sarkiya",
            name: "Sözden Şarkıya",
            icon: "🎵",
            desc: "LRCLIB & iTunes ile aklınızda kalan sözlerden şarkı tespiti, tam şarkı sözleri ve 30 saniyelik ses önizlemesi.",
            url: "/sozden-sarkiya",
            action: "Dedektifi Başlat"
          },
          {
            id: "lezzet-atolyesi",
            name: "Lezzet Atölyesi",
            icon: "🍹",
            desc: "TheMealDB, Forkify ve TheCocktailDB ile mutfak & miksoloji barı, malzeme arama ve tarif defteri.",
            url: "/lezzet-atolyesi",
            action: "Atölyeyi Başlat"
          },
          {
            id: "gida-alerji",
            name: "Gıda Dedektifi & Alerjen Kalkanı",
            icon: "🏷️",
            desc: "Open Food Facts ile barkod tarama, Nutri-Score, besin değerleri ve kişisel alerji uyarısı.",
            url: "/gida-alerji",
            action: "Ürünü İncele"
          },
          {
            id: "dunya-radyo",
            name: "Dünya Radyo Kulesi",
            icon: "📻",
            desc: "Radio Browser API ile 30.000+ küresel canlı radyo yayını, ülke ve müzik türü filtreleri ve Web Audio çaları.",
            url: "/dunya-radyo",
            action: "Radyoyu Dinle"
          },
          {
            id: "evcil-rehber",
            name: "Evcil Dostlar Ansiklopedisi",
            icon: "🐾",
            desc: "TheCatAPI & Dog CEO ile 150+ kedi ve köpek ırkı, mizaç analizi, yaşam süresi ve çocuk dostluğu rehberi.",
            url: "/evcil-rehber",
            action: "Irkları Keşfet"
          },
          {
            id: "gitar-akor",
            name: "Akustik: Gitar Akor & Tab",
            icon: "🎸",
            desc: "Gitar akor şemaları, parmak basış rehberi, canlı transpoze (ton değiştirici) ve otomatik sayfa kaydırma.",
            url: "/gitar-akor",
            action: "Stüdyoyu Başlat"
          }
        ]
      },
      {
        id: "finans-piyasa",
        title: "Finans & Piyasa",
        icon: "📊",
        desc: "Canlı döviz kurları, merkez bankaları verileri, makroekonomi ve kripto paralar",
        apps: [
          {
            id: "doviz-cevirici",
            name: "Anlık Döviz Çevirici",
            icon: "💱",
            desc: "Frankfurter & ECB resmi kurları ile 30+ para birimi, anlık çapraz kur çevirisi, Chart.js trend grafikleri ve getiri analizi.",
            url: "/doviz-cevirici",
            action: "Çeviriciyi Başlat"
          },
          {
            id: "kuresel-gostergeler",
            name: "Küresel Refah Göstergesi",
            icon: "📊",
            desc: "World Bank resmi verileriyle son 30 yıllık GSYİH, ömür, enflasyon, enerji ve refah endeksi analizi.",
            url: "/kuresel-gostergeler",
            action: "Göstergeleri İncele"
          },
          {
            id: "kripto-trend",
            name: "Kripto Trend & Piyasa Radarı",
            icon: "🪙",
            desc: "CoinGecko API ile anlık kripto para fiyatları, 24 saatlik değişimler, trend tokenlar ve dönüştürücü.",
            url: "/kripto-trend",
            action: "Piyasayı İzle"
          }
        ]
      },
      {
        id: "gelistirici-araclari",
        title: "Geliştirici Araçları",
        icon: "💻",
        badge: "Geliştirici Araçları",
        desc: "Ağ teşhisi, DNS yayılımı, parola güvenlik testleri, IP lokasyonu ve GitHub profil analitiği",
        apps: [
          {
            id: "github-analitik",
            name: "GitHub Profil Analitiği",
            icon: `<i class="fa-brands fa-github" style="color: rgb(0, 0, 0);"></i>`,
            desc: "Repo yıldızları, dil dağılımı, geliştirici kıdemi ve profillere gömülebilir dinamik SVG kartı üretimi.",
            url: "/github-analitik",
            action: "Profili İncele"
          },
          {
            id: "dns-kontrol",
            name: "DNS Kontrol & Ağ Teşhisi",
            icon: "🌐",
            desc: "Cloudflare & Google DoH ile anlık A, MX, TXT, NS kayıtları, küresel yayılım, SPF/DMARC ve gecikme testi.",
            url: "/dns-kontrol",
            action: "Kayıtları Çözümle"
          },
          {
            id: "sizinti-kontrol",
            name: "Sızıntı Kontrolü & Güvenlik",
            icon: "🛡️",
            desc: "HaveIBeenPwned k-Anonymity (SHA-1) protokolü ile sıfır bilgi garantili şifre sızıntı denetimi ve entropi analizi.",
            url: "/sizinti-kontrol",
            action: "Güvenliği Test Et"
          },
          {
            id: "ip-konum",
            name: "IP Coğrafi Konum & İstihbarat",
            icon: "📍",
            desc: "ip-api ve SSRF korumalı altyapıyla IP lokasyonu, İnternet Servis Sağlayıcı (ISP), ASN ve harita koordinatları.",
            url: "/ip-konum",
            action: "Konumu Bul"
          },
          {
            id: "renk-studyosu",
            name: "Harmoni: Renk & Kontrast Stüdyosu",
            icon: "🎨",
            desc: "The Color API ile analog, komplementer renk şemaları, WCAG erişilebilirlik kontrast analizi ve CSS dışa aktarımı.",
            url: "/renk-studyosu",
            action: "Palet Üret"
          },
          {
            id: "http-status",
            name: "HTTP Sözlüğü & Cihaz Röntgeni",
            icon: "💻",
            desc: "1xx-5xx HTTP durum kodları referansı, çözüm rehberi, cURL örnekleri ve canlı donanım/GPU parmak izi analizi.",
            url: "/http-status",
            action: "Teşhisi Aç"
          }
        ]
      },
      {
        id: "web-araclari",
        title: "Web Araçları",
        icon: "🛠️",
        desc: "Gündelik dijital ihtiyaçlar ve pratik web yardımcıları",
        apps: [
          {
            id: "qr-studio",
            name: "QR Studio",
            icon: "📱",
            desc: "Vektörel, logolu, gradyan renkli ve çok formatlı (URL, Wi-Fi, vCard) profesyonel QR üretici.",
            url: "/qr-studio",
            action: "Stüdyoyu Başlat"
          }
        ]
      }
    ];

    const totalApps = categories.reduce((sum, c) => sum + c.apps.length, 0);

    // Tüm uygulamaların haritası (Favori render için)
    const appsMap = {};
    categories.forEach(c => {
      c.apps.forEach(a => {
        appsMap[a.id] = a;
      });
    });

    // Accordion Sections (Mistral AI Editorial Style)
    const accordionHtml = categories.map((c) => {
      return `
        <div class="accordion-item mb-6 bg-white border-2 border-stone-300/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all duration-200">
          <!-- Accordion Header / Trigger -->
          <button 
            type="button" 
            onclick="toggleAccordion('${c.id}')"
            aria-expanded="true"
            id="acc-btn-${c.id}"
            class="w-full px-6 py-5 flex items-center justify-between text-left bg-stone-50/90 hover:bg-mistral-cream/50 border-b border-stone-200/80 transition group cursor-pointer select-none">
            
            <div class="flex items-center gap-4">
              <span class="w-11 h-11 rounded-xl bg-white border border-stone-300 text-mistral-ink flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                ${c.icon}
              </span>
              <div>
                <div class="flex flex-wrap items-center gap-2.5">
                  <h2 class="text-xl sm:text-2xl font-bold font-editorial text-mistral-ink tracking-tight group-hover:text-mistral-orange transition-colors">
                    ${c.title}
                  </h2>
                  <span class="text-xs px-2.5 py-0.5 rounded-full bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep font-semibold tracking-wide">
                    ${c.apps.length} Uygulama
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-mistral-slate mt-1 font-normal line-clamp-1 sm:line-clamp-none">
                  ${c.desc}
                </p>
              </div>
            </div>

            <!-- Chevron Icon -->
            <div class="ml-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-white border border-stone-300 group-hover:bg-mistral-cream transition shadow-2xs">
              <svg id="chevron-${c.id}" class="w-4 h-4 text-mistral-slate transform transition-transform duration-300 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </button>

          <!-- Accordion Body / App Cards Grid -->
          <div id="acc-body-${c.id}" class="accordion-content px-6 pb-6 pt-4 border-t border-stone-200/70 bg-[#f8f6f0] block">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              ${c.apps.map(app => `
                <div class="relative p-6 rounded-xl bg-white border-2 border-stone-200 hover:border-mistral-orange hover:shadow-lg transition duration-200 group flex flex-col justify-between ring-1 ring-black/5">
                  <div>
                    <!-- Üst Satır: İkon + İsim (2 satır) + Büyütülmüş Fav Butonu -->
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-11 h-11 shrink-0 rounded-xl bg-mistral-cream border border-mistral-beige-deep flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                        ${app.icon}
                      </div>
                      <h3 class="text-base sm:text-lg font-bold font-editorial text-mistral-ink tracking-tight leading-snug line-clamp-2 flex-1 min-w-0" title="${app.name}">
                        ${app.name}
                      </h3>
                      <button 
                        type="button"
                        onclick="toggleFav(event, '${app.id}')"
                        id="star-btn-${app.id}"
                        title="Favorilere Ekle / Çıkar"
                        class="shrink-0 w-10 h-10 rounded-xl border transition flex items-center justify-center cursor-pointer bg-stone-50 hover:bg-amber-50 border-stone-200 hover:border-amber-300 text-stone-400 hover:text-amber-500 shadow-2xs">
                        <span id="star-icon-${app.id}" class="text-xl leading-none select-none">☆</span>
                      </button>
                    </div>

                    <p class="text-mistral-slate text-sm leading-relaxed mb-6">
                      ${app.desc}
                    </p>
                  </div>

                  <a href="${app.url}" class="inline-flex items-center gap-2 text-mistral-orange hover:text-mistral-orange-deep text-sm font-semibold pt-2 border-t border-mistral-hairline-soft group-hover:border-mistral-orange/20 transition">
                    <span>${app.action}</span> &rarr;
                  </a>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const content = `
      <!-- Mistral Hero Banner -->
      <div class="mb-12 pt-4 text-center max-w-3xl mx-auto">
        <h1 class="text-4xl sm:text-6xl font-normal font-editorial tracking-tight text-mistral-ink mb-5 leading-tight">
          Yenilikçi Mikro Uygulamalar<br>
          <span class="italic text-mistral-orange">Tamamen Ücretsiz</span>
        </h1>
        <p class="text-mistral-slate text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
          Uzaydan moleküllere, coğrafyadan finans ve kelime düellolarına kadar bağımsız mikro web uygulamaları. Odak kategorilerde, açılır kapanır modüler mimaride.
        </p>

        <!-- Stat Callout Bar (Mistral Editorial Style) -->
        <div class="grid grid-cols-3 gap-4 max-w-2xl mx-auto p-5 rounded-xl bg-mistral-cream border border-mistral-beige-deep text-mistral-ink shadow-xs mb-8">
          <div>
            <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-orange">${totalApps}</div>
            <div class="text-xs text-mistral-slate font-medium mt-0.5">Mikro Uygulama</div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-orange">${categories.length}</div>
            <div class="text-xs text-mistral-slate font-medium mt-0.5">Ana Kategori</div>
          </div>
          <div>
            <div class="text-2xl sm:text-3xl font-bold font-editorial text-mistral-orange">%100</div>
            <div class="text-xs text-mistral-slate font-medium mt-0.5">Ücretsiz</div>
          </div>
        </div>
      </div>

      <!-- Accordion Header & Controls -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-mistral-hairline">
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold font-editorial text-mistral-ink">Kategori Dizinleri</span>
          <span class="text-xs text-mistral-stone">• Açılır kapanır akordion paneller</span>
        </div>
        <div class="flex items-center gap-2">
          <button 
            type="button"
            onclick="expandAllAccordions()" 
            class="px-3.5 py-1.5 rounded-md bg-mistral-ink hover:bg-mistral-ink-tint text-white text-xs font-medium transition shadow-xs flex items-center gap-1.5 cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            Tümünü Aç
          </button>
          <button 
            type="button"
            onclick="collapseAllAccordions()" 
            class="px-3.5 py-1.5 rounded-md bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink text-xs font-medium transition shadow-xs flex items-center gap-1.5 cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
            Tümünü Kapat
          </button>
        </div>
      </div>

      <!-- Accordions Container -->
      <div id="accordions-container" class="space-y-4 mb-16">
        
        <!-- 0. ⭐ EN ÜSTTE: FAVORİLERİM AKORDİYONU (Sadece Oturum Açıkken Görünür) -->
        <div id="section-favorites" class="accordion-item mb-6 bg-white border-2 border-amber-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-amber-400 transition-all duration-200">
          <!-- Accordion Header -->
          <button 
            type="button" 
            onclick="toggleAccordion('favorites')"
            aria-expanded="true"
            id="acc-btn-favorites"
            class="w-full px-6 py-5 flex items-center justify-between text-left bg-gradient-to-r from-amber-50/40 via-white to-white hover:bg-amber-50/60 transition group cursor-pointer select-none">
            
            <div class="flex items-center gap-4">
              <span class="w-10 h-10 rounded-md bg-amber-100/80 border border-amber-300 text-amber-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
                ⭐
              </span>
              <div>
                <div class="flex flex-wrap items-center gap-2.5">
                  <h2 class="text-xl sm:text-2xl font-bold font-editorial text-mistral-ink tracking-tight group-hover:text-amber-600 transition-colors">
                    Favorilerim
                  </h2>
                  <span id="fav-badge-count" class="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-semibold tracking-wide">
                    0 Uygulama
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-mistral-slate mt-1 font-normal line-clamp-1 sm:line-clamp-none">
                  Hızlı erişim için yıldızladığınız ve başa sabitlediğiniz kişisel mikro uygulamalar
                </p>
              </div>
            </div>

            <!-- Chevron Icon -->
            <div class="ml-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-white border border-amber-200 group-hover:bg-amber-50 transition">
              <svg id="chevron-favorites" class="w-4 h-4 text-amber-700 transform transition-transform duration-300 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </button>

          <!-- Accordion Body -->
          <div id="acc-body-favorites" class="accordion-content px-6 pb-6 pt-4 border-t border-amber-200/80 bg-amber-50/30 block">
            <!-- Boş Durum (Favori Yoksa) -->
            <div id="fav-empty-state" class="p-8 text-center rounded-xl bg-white/90 border-2 border-dashed border-amber-200 text-mistral-slate text-sm mt-2 shadow-2xs">
              <div class="text-3xl mb-2">⭐</div>
              <p class="font-bold text-mistral-ink">Henüz favori bir uygulama eklemediniz.</p>
              <p class="text-xs text-mistral-stone mt-1 max-w-md mx-auto">
                Aşağıdaki kategorilerde yer alan kartların sağ üstündeki yıldız (☆) simgesine tıklayarak sık kullandığınız araçları bu alana sabitleyebilirsiniz.
              </p>
              <p class="text-xs text-amber-700/80 mt-3 font-medium">
                💡 İpucu: Favorilerinizi tüm cihazlarınızda eşitlemek için <a href="/auth" class="text-mistral-orange underline font-semibold">giriş yapabilirsiniz</a>.
              </p>
            </div>

            <!-- Favori Kartlar Izgarası -->
            <div id="fav-cards-grid" class="hidden grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              <!-- JS ile dinamik çizilir -->
            </div>
          </div>
        </div>

        <!-- DİĞER 8 KATEGORİ -->
        ${accordionHtml}
      </div>

      <!-- Vitrin Auth Required Modal (Giriş Yapılmamışsa Açılan Modal) -->
      <div id="vitrin-auth-modal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4" style="display: none;">
        <div class="bg-white max-w-md w-full rounded-2xl border border-mistral-hairline p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
          <div class="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl mb-4 mx-auto shadow-2xs">
            🔒
          </div>
          <h3 class="text-2xl font-bold font-editorial text-mistral-ink mb-2">
            Giriş Yapmanız Gerekiyor
          </h3>
          <p class="text-mistral-slate text-sm leading-relaxed mb-6">
            <strong id="vitrin-modal-app-name" class="text-mistral-ink">Bu uygulamayı</strong> kullanabilmek ve verilerinizi tüm cihazlarınızda senkronize edebilmek için lütfen giriş yapın.
          </p>
          <div class="space-y-3">
            <a id="vitrin-modal-gh-btn" href="/auth/v1/authorize?provider=github" class="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-medium transition shadow-sm cursor-pointer">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              <span>GitHub ile Giriş Yap</span>
            </a>
            <a id="vitrin-modal-gg-btn" href="/auth/v1/authorize?provider=google" class="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium transition border border-mistral-hairline shadow-sm cursor-pointer">
              <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              <span>Google ile Giriş Yap</span>
            </a>
            <button type="button" onclick="closeVitrinAuthModal()" class="w-full py-2.5 px-4 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink text-xs font-semibold transition border border-mistral-beige-deep cursor-pointer">
              Vazgeç
            </button>
          </div>
        </div>
      </div>

      <script>
        // Tüm Uygulama Tanımları
        const APPS_DATA = ${JSON.stringify(appsMap)};

        function getVitrinUser() {
          try {
            const raw = localStorage.getItem('vibe_user');
            return raw ? JSON.parse(raw) : null;
          } catch(e) {
            return null;
          }
        }

        // Senkron (localStorage) favori listesi
        function getFavoritesSync() {
          const user = getVitrinUser();
          const candidateKeys = ['vibe_favorite_apps', 'vibe_favs_user'];
          if (user && user.id) candidateKeys.push('vibe_favs_' + user.id);
          if (user && user.email) candidateKeys.push('vibe_favs_' + user.email);

          const foundSet = new Set();
          for (const k of candidateKeys) {
            try {
              const raw = localStorage.getItem(k);
              if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) {
                  arr.forEach(id => {
                    if (APPS_DATA[id]) foundSet.add(id);
                  });
                }
              }
            } catch(e) {}
          }
          return Array.from(foundSet);
        }

        let favoritesCache = null;
        let isFetchingFavorites = false;

        async function fetchFavoritesFromAPI() {
          const user = getVitrinUser();
          if (!user) return;
          const token = localStorage.getItem('vibe_token');
          if (!token) return;

          if (isFetchingFavorites) return;
          isFetchingFavorites = true;

          try {
            const res = await fetch('/api/favorites', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (res.ok) {
              const data = await res.json();
              if (data.success && Array.isArray(data.favorites)) {
                try {
                  const merged = Array.from(new Set([...data.favorites, ...getFavoritesSync()]));
                  const json = JSON.stringify(merged);
                  if (user.id) localStorage.setItem('vibe_favs_' + user.id, json);
                  if (user.email) localStorage.setItem('vibe_favs_' + user.email, json);
                  localStorage.setItem('vibe_favs_user', json);
                  localStorage.setItem('vibe_favorite_apps', json);
                  favoritesCache = merged;
                } catch(e) {
                  favoritesCache = data.favorites;
                }
                updateFavoriteUI();
              }
            }
          } catch(err) {
            console.warn('Favoriler sunucudan senkronize edilemedi:', err.message);
          } finally {
            isFetchingFavorites = false;
          }
        }

        function getFavorites() {
          if (favoritesCache !== null) return favoritesCache;
          return getFavoritesSync();
        }

        async function saveFavoritesToAPI(appId, action) {
          const token = localStorage.getItem('vibe_token');
          if (!token) return;
          try {
            await fetch('/api/favorites', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
              },
              body: JSON.stringify({ app_id: appId, action: action })
            });
          } catch(err) {
            console.warn('Favori sunucuya kaydedilemedi:', err.message);
          }
        }

        function saveFavorites(list) {
          const user = getVitrinUser();
          try {
            const json = JSON.stringify(list);
            if (user && user.id) localStorage.setItem('vibe_favs_' + user.id, json);
            if (user && user.email) localStorage.setItem('vibe_favs_' + user.email, json);
            localStorage.setItem('vibe_favs_user', json);
            localStorage.setItem('vibe_favorite_apps', json);
          } catch(e) {}

          favoritesCache = list;
          updateFavoriteUI();
        }

        function toggleFav(e, appId) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }

          let favs = [...getFavorites()];
          const idx = favs.indexOf(appId);
          const isAdding = idx < 0;

          if (isAdding) {
            favs.unshift(appId);
            if (window.showToast) window.showToast('★ Favorilere eklendi!');
          } else {
            favs.splice(idx, 1);
            if (window.showToast) window.showToast('Favorilerden kaldırıldı');
          }

          saveFavorites(favs);
          saveFavoritesToAPI(appId, isAdding ? 'add' : 'remove');
        }

        function updateFavoriteUI() {
          const secFav = document.getElementById('section-favorites');
          if (secFav) {
            secFav.classList.remove('hidden');
          }

          const favs = getFavorites();
          const badge = document.getElementById('fav-badge-count');
          const emptyState = document.getElementById('fav-empty-state');
          const grid = document.getElementById('fav-cards-grid');

          if (badge) {
            badge.innerText = favs.length + ' Uygulama';
          }

          // 1. Tüm sayfa genelindeki yıldız butonlarını güncelle
          Object.keys(APPS_DATA).forEach(id => {
            const btn = document.getElementById('star-btn-' + id);
            const icon = document.getElementById('star-icon-' + id);
            const isFav = favs.includes(id);

            if (btn && icon) {
              if (isFav) {
                btn.className = 'shrink-0 w-10 h-10 rounded-xl border transition flex items-center justify-center cursor-pointer bg-amber-50 border-amber-300 text-amber-500 shadow-2xs';
                icon.innerText = '★';
              } else {
                btn.className = 'shrink-0 w-10 h-10 rounded-xl border transition flex items-center justify-center cursor-pointer bg-stone-50 hover:bg-amber-50 border-stone-200 hover:border-amber-300 text-stone-400 hover:text-amber-500 shadow-2xs';
                icon.innerText = '☆';
              }
            }
          });

          // 2. Favorilerim Akordiyonunu Doldur
          if (!emptyState || !grid) return;

          if (favs.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.style.display = 'block';
            grid.classList.add('hidden');
            grid.classList.remove('grid');
            grid.style.display = 'none';
            grid.innerHTML = '';
          } else {
            emptyState.classList.add('hidden');
            emptyState.style.display = 'none';
            grid.classList.remove('hidden');
            grid.classList.add('grid');
            grid.style.display = 'grid';

            grid.innerHTML = favs.map(id => {
              const app = APPS_DATA[id];
              if (!app) return '';
              return '<div class="p-6 rounded-xl bg-white border-2 border-stone-200 hover:border-amber-400 hover:shadow-lg transition duration-200 group flex flex-col justify-between ring-1 ring-black/5">' +
                '<div>' +
                  '<div class="flex items-center gap-3 mb-4">' +
                    '<div class="w-11 h-11 shrink-0 rounded-xl bg-amber-100/60 border border-amber-200 text-amber-700 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform duration-200 shadow-2xs">' + app.icon + '</div>' +
                    '<h3 class="text-base sm:text-lg font-bold font-editorial text-mistral-ink tracking-tight leading-snug line-clamp-2 flex-1 min-w-0" title="' + app.name + '">' + app.name + '</h3>' +
                    '<button type="button" onclick="toggleFav(event, \\'' + app.id + '\\')" title="Favorilerden Çıkar" class="shrink-0 w-10 h-10 rounded-xl border transition flex items-center justify-center cursor-pointer bg-amber-50 border-amber-300 text-amber-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-300 shadow-2xs"><span class="text-xl leading-none select-none">★</span></button>' +
                  '</div>' +
                  '<p class="text-mistral-slate text-sm leading-relaxed mb-6">' + app.desc + '</p>' +
                '</div>' +
                '<a href="' + app.url + '" class="inline-flex items-center gap-2 text-mistral-orange hover:text-mistral-orange-deep text-sm font-semibold pt-2 border-t border-stone-100 group-hover:border-mistral-orange/20 transition">' +
                  '<span>' + app.action + '</span> &rarr;' +
                '</a>' +
              '</div>';
            }).join('');
          }
        }

        // Dinamik Oturum Değişikliklerini Dinle
        window.addEventListener('vibe_auth_change', function() {
          fetchFavoritesFromAPI();
          updateFavoriteUI();
        });

        window.addEventListener('storage', function(e) {
          if (e.key === 'vibe_user' || (e.key && e.key.startsWith('vibe_favs_'))) {
            updateFavoriteUI();
          }
        });

                // Akordion Açma / Kapama (Kusursuz display ve chevron dönüşü)
        window.toggleAccordion = function(catId) {
          var body = document.getElementById("acc-body-" + catId);
          var chevron = document.getElementById("chevron-" + catId);
          var btn = document.getElementById("acc-btn-" + catId);

          if (!body) return;

          var isHidden = body.style.display === "none" || body.classList.contains("hidden");

          if (isHidden) {
            body.style.display = "block";
            body.classList.remove("hidden");
            body.classList.add("block");
            if (chevron) {
              chevron.style.transform = "rotate(180deg)";
            }
            if (btn) btn.setAttribute("aria-expanded", "true");
          } else {
            body.style.display = "none";
            body.classList.remove("block");
            body.classList.add("hidden");
            if (chevron) {
              chevron.style.transform = "rotate(0deg)";
            }
            if (btn) btn.setAttribute("aria-expanded", "false");
          }
        };

        window.expandAllAccordions = function() {
          document.querySelectorAll(".accordion-content").forEach(function(b) {
            b.style.display = "block";
            b.classList.remove("hidden");
            b.classList.add("block");
          });
          document.querySelectorAll("[id^='chevron-']").forEach(function(c) {
            c.style.transform = "rotate(180deg)";
          });
          document.querySelectorAll("[id^='acc-btn-']").forEach(function(btn) {
            btn.setAttribute("aria-expanded", "true");
          });
        };

        window.collapseAllAccordions = function() {
          document.querySelectorAll(".accordion-content").forEach(function(b) {
            b.style.display = "none";
            b.classList.remove("block");
            b.classList.add("hidden");
          });
          document.querySelectorAll("[id^='chevron-']").forEach(function(c) {
            c.style.transform = "rotate(0deg)";
          });
          document.querySelectorAll("[id^='acc-btn-']").forEach(function(btn) {
            btn.setAttribute("aria-expanded", "false");
          });
        };

        // Sayfa Yüklendiğinde
        document.addEventListener('DOMContentLoaded', () => {
          updateFavoriteUI();
          fetchFavoritesFromAPI();

          // Giriş Yapmamış Kullanıcılar İçin Kart Tıklama Koruması
          document.addEventListener('click', function(e) {
            var cardLink = e.target.closest('a[href^="/app/"], a[href^="/nobetci-"], a[href^="/ilac-"], a[href^="/kas-"], a[href^="/qr-"], a[href^="/doviz-"], a[href^="/lezzet-"], a[href^="/sozden-"], a[href^="/kultur-"], a[href^="/dizi-"], a[href^="/sanat-"], a[href^="/tatil-"], a[href^="/karbon-"], a[href^="/tarim-"], a[href^="/klasik-"], a[href^="/kuresel-"], a[href^="/oyun-"], a[href^="/sizinti-"], a[href^="/dns-"], a[href^="/github-"], a[href^="/doga-"], a[href^="/molekul-"], a[href^="/iss-"], a[href^="/cografya-"], a[href^="/hava-"], a[href^="/kripto-"], a[href^="/ip-"], a[href^="/gida-"], a[href^="/dunya-"], a[href^="/sehir-"], a[href^="/renk-"], a[href^="/sayilar-"], a[href^="/evcil-"], a[href^="/deniz-"], a[href^="/unesco-"], a[href^="/sesli-"], a[href^="/nobel-"], a[href^="/gitar-"], a[href^="/siir-"], a[href^="/http-"], a[href^="/dso-"], a[href^="/klinik-"]');
            if (cardLink && !cardLink.getAttribute('href').includes('/auth')) {
              var user = getVitrinUser();
              if (!user) {
                e.preventDefault();
                e.stopPropagation();
                var targetUrl = cardLink.getAttribute('href');
                var appCard = cardLink.closest('.group');
                var appName = appCard ? (appCard.querySelector('h3')?.innerText || 'Uygulama') : 'Uygulama';
                openVitrinAuthModal(appName, targetUrl);
              }
            }
          });
        });

        function openVitrinAuthModal(appName, targetUrl) {
          var modal = document.getElementById('vitrin-auth-modal');
          var nameEl = document.getElementById('vitrin-modal-app-name');
          var gh = document.getElementById('vitrin-modal-gh-btn');
          var gg = document.getElementById('vitrin-modal-gg-btn');

          if (nameEl) nameEl.innerText = appName;
          var encodedTarget = encodeURIComponent(targetUrl);
          if (gh) gh.href = '/auth/v1/authorize?provider=github&redirect_to=' + encodedTarget;
          if (gg) gg.href = '/auth/v1/authorize?provider=google&redirect_to=' + encodedTarget;

          if (modal) {
            modal.style.display = 'flex';
          }
        }

        function closeVitrinAuthModal() {
          var modal = document.getElementById('vitrin-auth-modal');
          if (modal) {
            modal.style.display = 'none';
          }
        }

        window.closeVitrinAuthModal = closeVitrinAuthModal;

        // Hemen başlat
        updateFavoriteUI();
        fetchFavoritesFromAPI();
      </script>
    `;

    res.send(pageTemplate('Vitrin', content));
  };
};
