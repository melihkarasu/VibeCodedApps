# Vibe Coded Apps - Portföy Mikro Uygulamaları & Sistem Dokümantasyonu

## 📌 1. Proje Vizyonu ve Mimari Özeti
**VibeCodedApps**, açık kaynak ve ücretsiz genel API'lar üzerine kurulu, modern, performanslı ve interaktif mikro web uygulamalarından oluşan bir **Developer Portfolio (Vibe Coding Vitrini)** projesidir.

- **URL Mimarisi:** Vitrin `/app` (veya kök dizin `/`) altında yer alır. Her mikro uygulama `/app/{appname}` yolunda bağımsız bir modül olarak çalışır.
- **Tekil Kimlik Doğrulama (Unified SSO):** Supabase GoTrue altyapısıyla **GitHub OAuth** tabanlı tekil giriş sistemi kurulmuştur. Oturum açan kullanıcının profili (ad, avatar, e-posta) tüm uygulamalar arasında senkronize olur.
- **Veri Kalıcılığı:** Kullanıcıların izleme listeleri, favori pariteleri, kayıtlı QR kodları, düello geçmişi, başarımları, kişisel tarif defteri, kitaplığı ve tarlaları hem `localStorage` önbelleğinde hem de kullanıcı oturumuyla ilişkilendirilerek korunur.

---

## 🛠️ 2. Sistem & Modüler Mimari Yapısı

Sistem `/home/MK/.openclaw/workspace/vibe-coded-apps` dizininde, izole Docker ağı (`vibe-network`) üzerinde koşan mikro servislerden oluşur.

```text
[ İnternet / Kullanıcı ]
          │
     :8088 / :8443
          ▼
   ┌──────────────┐
   │  vibe-nginx  │ (Reverse Proxy, CSP, Permissions-Policy, Güvenlik Başlıkları)
   └──────┬───────┘
          │
          ├── /static/*          ──►  vibe-web:3000/public (Statik CSS/JS Varlıkları - 1 Günlük Browser Cache)
          │                              │
          │                              ├── public/css/mistral-theme.css (Global Tasarım & CSS Standartları)
          │                              ├── public/js/core.js (SSO Token Refresh, Toast, Safe Clipboard)
          │                              └── public/apps/{app}/ (app.css & app.js Ayrıştırılmış Modüller)
          │
          ├── /app/*, /api/*, /  ──►  vibe-web:3000 (Node.js & Express - Saf HTML Şablonları)
          │                              │
          │                              ├── web/server.js (~55 Satır Modüler Giriş Noktası)
          │                              ├── web/template.js (Hafif Şablon, Zero-Flicker SSO, Ortak Linkler)
          │                              ├── web/routes/
          │                              │     ├── vitrin.js (Ana Vitrin ve Kartlar)
          │                              │     ├── auth.js (SSO Giriş Sayfası)
          │                              │     └── {app}.js (Saf HTML İskeleti - Zero Inline Code)
          │                              └── web/routes/api/ (Sub-Router Pattern - 38 Bağımsız Alt Servis)
          │
          ├── /auth/v1/*         ──►  vibe-supabase-auth:9999 (GoTrue v2.164.0)
          │
          └── [Güvenlik]         ──►  vibe-strix (AI Destekli Pentest & Güvenlik Ajanı)
```

### Modüler Kod Dağılımı (`web/`) & Sub-Router Mimarisi
1. **`server.js` (~55 Satır):** Yalnızca Express sunucu başlangıcı, `express.static('/static', 'public', { maxAge: '1d' })` middleware'i ve modüler rota (`routes/`) bağlamalarını içeren tertemiz bir giriş noktası.
2. **`template.js` (~60 Satır):** Ortak sayfa iskeletini sunar; harici `/static/css/mistral-theme.css` ve `/static/js/core.js` dosyalarını bağlar.
3. **`public/css/mistral-theme.css`:** Mistral AI renk paleti, tipografi, sunset stripe ve koyu zemin temizleme kurallarını içeren, tarayıcıda önbelleklenen merkezi CSS dosyası.
4. **`public/js/core.js`:** Supabase OAuth token yakalama, profil senkronizasyonu, otomatik token yenileme (`token refresh`), global bildirim sistemi (`showToast`) ve HTTP/IP ortamlarında çalışan güvenli panoya kopyalama motorunu (`safeCopyToClipboard`) barındırır.
5. **`public/apps/{app}/` (`app.css` & `app.js`):** Mikro uygulamaların tüm istemci script ve stilleri rota dosyalarından çıkarılarak buraya taşınmıştır. Node.js template string kaçış riskleri sıfırlanmış, tarayıcılar tarafından önbelleklenerek sayfa geçişleri hızlandırılmıştır.
6. **Ana API Orkestratörü (`web/routes/api.js`):** Yalnızca ~50 satırdan oluşur; alt modülleri içe aktarıp `/api` yoluna bağlar (Mounting Orchestrator).
7. **Modüler Alt Servisler (`web/routes/api/*.js`):** Single Responsibility ilkesi doğrultusunda, tüm harici API proxy servisleri (TCMB, HIBP, IMDb, Gutenberg, Carbon, Arena vb.) kendi bağımsız dosyasında izole `express.Router()` olarak çalışır.
8. **Güvenlik Yardımcısı (`web/routes/api/utils.js`):** DNS çözümlemesi ve IP filtrelemeli gelişmiş SSRF korumasını (`isPrivateAddress`) tüm proxy modülleriyle ortak paylaşır.
9. **Saf Rota Şablonları (`web/routes/{app}.js`):** Sadece saf HTML iskeletini tutan, hafif rota şablonlarıdır.

---

## 🔐 3. Güvenlik

Projenin güvenliği; otonom penetrasyon testleri, SAST statik kod analizleri ve katmanlı savunma mimarisiyle en üst standartlara getirilmiştir.

### Güvenlik Denetim Araçları & Metodolojisi
- **[usestrix/strix](https://github.com/usestrix/strix) (`vibe-strix`):** Sistemin tam yüzey dinamik penetrasyon testlerini yürüten, otonom AI güvenlik denetim ajanı. Çalışma zamanında (runtime) SSRF, açık port, yetkilendirme bypass ve HTTP başlık zafiyetlerini proaktif olarak denetler.
- **[ersinkoc/security-check](https://github.com/ersinkoc/security-check):** OWASP Top 10, CWE kontrolleri, bağımlılık açıkları ve SAST statik kod analizleriyle üretim ortamı güvenlik sertleştirmelerini sağlayan kapsamlı güvenlik denetim kütüphanesi.
- **[cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill):** `ersinkoc/security-check` tarafından benimsenen; kanıt odaklı denetim (coverage-led hunting), izole çalışma ortamı doğrulaması ve sistematik zafiyet sınıflandırmasını sağlayan güvenlik metodolojisi.

### Uygulanan Kritik Savunma Önlemleri & Güvenlik Sertleştirmeleri
1. **Çok Katmanlı SSRF & DNS Rebinding Savunması (CWE-918):**
   - Dış ağa istek atan tüm proxy servislerinde (`/api/carbon/analyze`, `/api/dns/lookup`, `/api/wayback/available` vb.) `web/routes/api/utils.js` içindeki `isPrivateAddress()` fonksiyonu devrededir.
   - Sadece domain metni değil; **DNS çözümlemesi yapılarak gerçek IP adresleri** denetlenir.
   - `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16` (Cloud Metadata / AWS / GCP), `100.64.0.0/10` (CGNAT), `::1` ve Docker iç ağları (`vibe-*`, `supabase-*`) tamamen engellenir; uygunsuz istekler `403 Forbidden` ile reddedilir.
2. **Yetkisiz Demo Girişinin Kısıtlanması (CWE-306):**
   - `/api/auth/quick-login` uç noktası üretim ortamında varsayılan olarak **tamamen devre dışı** bırakılmıştır (`HTTP 403 Forbidden`). Sadece `ENABLE_DEMO_LOGIN=true` bayrağı açıkça tanımlandığında test amaçlı çalışır. Yetkisiz kişilerin parola veya OAuth olmadan geçerli JWT üretmesi engellenmiştir.
3. **Sabit Fallback Secret Temizliği (CWE-798):**
   - Kaynak kodda yer alan tüm açık metin yedek anahtarlar kaldırılmıştır. Ortam değişkeni (`JWT_SECRET`) eksikse sahte anahtar üretilmez, sistem güvenli şekilde hata vererek durur (`fail-fast`).
4. **Deterministik Bağımlılık Kilidi (CWE-1188):**
   - `web/package-lock.json` ile bağımlılık sürümleri kilitlenerek konteyner kurulumlarında sürüm kaymaları ve tedarik zinciri uyumsuzlukları önlenmiştir.
5. **Sıkı Girdi Doğrulaması (Whitelisting & Regex) & XSS Koruması (CWE-79):**
   - API uç noktalarına gelen tüm parametreler sıkı tip ve regex denetiminden geçer (örn. HIBP hash önekleri için `/^[0-9A-F]{5}$/`, ülke kodları için `/^[A-Z]{3}$/`).
   - Dış API'lardan gelen veriler arayüze basılırken doğrudan `innerHTML`'e aktarılmaz; `escapeHtml()` veya güvenli `textContent` ile sanitize edilir.
6. **HTTP Güvenlik Başlıkları (`vibe.conf`):**
   - `Content-Security-Policy (CSP)`: XSS ve yetkisiz betik yürütmeyi tarayıcı düzeyinde kısıtlayan sıkı CSP politikası (`default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:;`).
   - `Permissions-Policy`: Tarayıcı donanım erişimleri (`camera`, `microphone`, `geolocation`) sınırlandırılmıştır.
   - `X-Frame-Options: SAMEORIGIN` (Clickjacking savunması), `X-Content-Type-Options: nosniff` (MIME sniffing engeli).
7. **Veritabanı Düzeyinde RLS (Row Level Security):**
   - Supabase PostgreSQL üzerinde `public.user_favorites` tablosu oluşturulmuş ve RLS politikaları (`auth.uid() = user_id`) tanımlanmıştır. Kullanıcılar yalnızca kendi ekledikleri favorileri görüntüleyebilir ve değiştirebilir.
8. **Evrensel Güvenli Kopyalama Motoru (`safeCopyToClipboard`):**
   - Modern tarayıcıların `navigator.clipboard` API'sini yalnızca HTTPS ve localhost altında çalıştırması kısıtlamasına karşı, HTTP ve IP tabanlı erişimlerde otomatik olarak gizli bir metin alanı açarak `document.execCommand('copy')` ile panoya kopyalama yapan hibrit geri dönüş (fallback) motoru entegre edilmiştir.

---

## 🚀 4. Canlıdaki Mikro Uygulamalar ve Tematik Kategori Hiyerarşisi

Tüm uygulamalar `/app` vitrininde mantıksal kategoriler altında hiyerarşik olarak listelenir, açılır/kapanır akordiyon panelleriyle yönetilir ve yıldız butonuyla en üstteki **⭐ Favorilerim** listesine sabitlenebilir:

### 🏥 Sağlık
- **💊 İzmir Nöbetçi Eczane Radarı** (`/app/nobetci-eczane`): İzmir Büyükşehir Belediyesi Açık Veri Portalı API'si ve OpenStreetMap (Leaflet) ile canlı GPS/merkez konum tespiti, İzmir genelindeki tüm nöbetçi eczanelerin harita işaretçileri, mesafeleriyle en yakın eczaneler listesi, tek tıkla arama (`tel:`) ve Google Maps yol tarifi.
- **💊 İlaç & Prospektüs Rehberi** (`/app/ilac-rehberi`): U.S. FDA (openFDA) & RxNorm veritabanı ile etken maddeler, prospektüs özeti, kullanım uyarıları ve açık bildirilmiş yan etki analitiği.
- **🏋️ İnteraktif Kas Anatomisi & Egzersiz** (`/app/kas-anatomisi`): workout-cool ve Wger verileriyle interaktif vücut kas haritası, hedeflenen egzersizler, doğru form rehberi ve duruş terapisi.
- **🔬 Klinik Araştırmalar Radarı** (`/app/klinik-arastirma`): NIH ClinicalTrials.gov v2 API ile kanser, diyabet ve nörolojideki aktif klinik deneyler, faz aşamaları ve deneysel tedaviler.
- **🌐 Küresel Sağlık Atlası (DSÖ)** (`/app/dso-saglik`): Dünya Sağlık Örgütü (WHO GHO OData) resmi verileriyle Türkiye ve dünya ülkelerinin beklenen yaşam süresi, aşılanma ve mortalite göstergeleri.

### 🌱 Coğrafya, Doğa & Çevre
- **🌾 Akıllı Tarım & Zirai Hava** (`/app/tarim-hava`): Open-Meteo & OSM Nominatim ile toprak nemi/sıcaklığı derinlikleri, don riski erken uyarı sistemi, evapotranspirasyon ve sulama tavsiyeleri.
- **🌱 Web Karbon Ayak İzi** (`/app/karbon-metre`): The Green Web Foundation ile sayfa yükleme başına CO2 salımı, yeşil hosting analizi, gömülebilir dinamik SVG eko-rozet.
- **🐦 Kuş Sesi Dedektifi** (`/app/doga-sesleri`): iNaturalist Bioacoustics ile yabani kuş sesleri arşivi, Web Audio canlı spektrum ses dalgası ve tahmin testi.
- **🌍 Küresel Coğrafya Atlası** (`/app/cografya-atlasi`): REST Countries API ile dünya ülkelerinin bayrakları, başkentleri, nüfusu, dilleri ve sınır komşuları.
- **💨 Canlı Hava Kalitesi Radarı** (`/app/hava-kalitesi`): OpenAQ ve Open-Meteo ile dünya şehirlerinin canlı PM2.5, PM10, NO2 kirlilik seviyeleri, Avrupa AQI endeksi ve sağlık tavsiyeleri.
- **🚲 Şehir Bisiklet Rehberi** (`/app/sehir-bisiklet`): CityBikes API ile küresel metropollerde (İstanbul İsbike, Paris Vélib, Londra Santander vb.) canlı bisiklet durakları, boş bisiklet ve park yuvası haritası.
- **🌊 Mavi Rota: Dalga & Sörf Radarı** (`/app/deniz-dalga`): Open-Meteo Marine API ile Ege, Akdeniz ve Karadeniz kıyılarında canlı dalga boyu, periyot, rüzgar dalgası ve sörf/yüzme uygunluğu.

### 🧬 Uzay & Bilim
- **🧬 3D Molekül Stüdyosu** (`/app/molekul-studyosu`): PubChem REST API & 3Dmol.js WebGL ile kimyasalların ve ilaç etken maddelerinin 3D atomik modellemesi.
- **🛰️ Where is ISS? Uzay Radarı** (`/app/iss-takip`): Uluslararası Uzay İstasyonu'nun (ISS) anlık enlem, boylam, 27.600 km/s yörünge hızı, irtifası ve Leaflet canlı haritası.
- **🧮 Sayılar Atlası & Matematik** (`/app/sayilar-atlasi`): Numbers & Math motoru ile sayıların asallık, Fibonacci, bölen analizi, ikili kodları ve tarihteki gizemli gerçekleri.
- **🎖️ Nobel Ödülleri Arşivi** (`/app/nobel-arsivi`): Nobel Vakfı resmi API'si ile 1901'den günümüze bilim insanları, çığır açan keşifler ve edebiyat ödülleri.

### 🎨 Sanat, Tarih & Edebiyat
- **🎨 Global Sanat Galerisi** (`/app/sanat-galerisi`): The Met Museum Open Access ile usta ressamlar, 4x derin yakınlaştırma (deep zoom) tuvali ve kişisel sanat sergisi.
- **📖 Dijital Kütüphane** (`/app/klasik-kutuphane`): Project Gutenberg arşivi, akıllı arama motoru (`/api/kutuphane/search`), Web Speech API yerleşik sesli kitap dinleme motoru, yer imleri ve temalar.
- **📅 Küresel Tatil Takvimi** (`/app/tatil-takvimi`): Nager.Date API ile ülkelerin resmi tatilleri, eşzamanlı çoklu ülke, köprü izin fırsatları ve .ics (iCal) aktarımı.
- **🏛️ UNESCO Dünya Mirası Atlası** (`/app/unesco-miras`): Göbeklitepe'den Machu Picchu'ya dünya mirası alanları, fotoğrafları, kabul yılları ve harita konumları.
- **🎧 Sesli Kütüphane (LibriVox)** (`/app/sesli-kitap`): LibriVox açık kamu malı arşivi ile dünya edebiyatı klasiklerinin seslendirilmiş kayıtları ve ses çaları.
- **📜 Şiir Vahası: Şiir Antolojisi** (`/app/siir-antolojisi`): PoetryDB açık arşivi ile usta şairlerin eserleri ve tipografik okuyucu.

### 🎮 Oyun
- **🌍 Kültür Arenası & Trivia** (`/app/kultur-arena`): Dahili soru bankası & Web Audio ile solo yarışma, 1v1 canlı düello oda sistemi, Nobel soruları, başarımlar ve XP sıralaması.
- **🏷️ Steam & Epic Fırsat Avcısı** (`/app/oyun-radar`): CheapShark & GamerPower ile büyük indirimler, %100 ücretsiz kalıcı hediyeler, tasarruf yüzdesi ve istek listesi.
- **🕹️ Oyun Keşif Kütüphanesi** (`/app/oyun-arsivi`): FreeToGame ve açık oyun veritabanı ile PC ve tarayıcı tabanlı oyunlar, tür filtreleri ve detaylar.
- **⚡ Speedrun Oyun Rekorları** (`/app/oyun-rekorlari`): Speedrun.com açık veritabanı ile popüler video oyunlarının dünya rekoru bitirme süreleri ve liderleri.

### 🍿 Popüler Kültür & Eğlence
- **🎬 Dizi & Sezon Takipçisi** (`/app/dizi-rehberi`): TVmaze & Cinemeta ile IMDb linki/ID'si ile yapım ekleme, bölüm bazlı sezon takip listesi ve izleme süresi.
- **🎵 Sözden Şarkıya** (`/app/sozden-sarkiya`): LRCLIB & iTunes Search API ile akılda kalan sözlerden şarkı tespiti, ses önizleme çaları ve tam şarkı sözleri.
- **🍹 Lezzet Atölyesi** (`/app/lezzet-atolyesi`): TheMealDB, Forkify v2 & TheCocktailDB ile mutfak & miksoloji barı, malzeme arama ve tarif defteri.
- **🏷️ Gıda Dedektifi & Alerjen Kalkanı** (`/app/gida-alerji`): Open Food Facts ile barkod tarama, Nutri-Score, besin değerleri ve kişisel alerji uyarısı.
- **📻 Dünya Radyo Kulesi** (`/app/dunya-radyo`): Radio Browser API ile binlerce küresel canlı radyo yayını, ülke ve müzik türü filtreleri ve Web Audio çaları.
- **🐾 Evcil Dostlar Ansiklopedisi** (`/app/evcil-rehber`): TheCatAPI & Dog CEO ile kedi ve köpek ırkları, mizaç analizi, yaşam süresi ve çocuk dostluğu rehberi.
- **🎸 Akustik: Gitar Akor & Tab** (`/app/gitar-akor`): Gitar akor şemaları, parmak basış rehberi, canlı transpoze (ton değiştirici) ve otomatik sayfa kaydırma.

### 📊 Finans & Piyasa
- **💱 Anlık Döviz Çevirici** (`/app/doviz-cevirici`): TCMB XML bülteni + Frankfurter (ECB) ile para birimleri, anlık çapraz kur çevirisi, Chart.js trend grafikleri ve getiri analizi.
- **📊 Küresel Refah Göstergesi** (`/app/kuresel-gostergeler`): World Bank Open Data API ile son 30 yıllık GSYİH, yaşam süresi, enflasyon ve refah endeksi analizi.
- **🪙 Kripto Trend & Piyasa Radarı** (`/app/kripto-trend`): CoinGecko API ile anlık kripto para fiyatları, 24 saatlik değişimler, trend tokenlar ve dönüştürücü.

### 💻 Geliştirici Araçları
- **🐙 GitHub Profil Analitiği** (`/app/github-analitik`): GitHub REST API ile repo yıldızları, dil dağılımı, geliştirici kıdem seviyesi ve dinamik SVG kart stüdyosu.
- **🌐 DNS Kontrol & Ağ Teşhisi** (`/app/dns-kontrol`): Cloudflare & Google DoH ile A, MX, TXT, NS kayıtları, küresel yayılım, DoH gecikme testi ve SPF/DMARC denetimi.
- **🛡️ Sızıntı Kontrolü & Güvenlik** (`/app/sizinti-kontrol`): HaveIBeenPwned k-Anonymity (SHA-1) protokolü ile sıfır bilgi sızıntı kontrolü, bit entropisi ve parola üretici.
- **📍 IP Coğrafi Konum & İstihbarat** (`/app/ip-konum`): ip-api ve SSRF korumalı altyapıyla IP lokasyonu, İnternet Servis Sağlayıcı (ISP), ASN ve harita koordinatları.
- **🎨 Harmoni: Renk & Kontrast Stüdyosu** (`/app/renk-studyosu`): The Color API ile analog, komplementer, monokrom renk şemaları, WCAG kontrast analizi ve CSS/Tailwind export.
- **💻 HTTP Sözlüğü & Cihaz Röntgeni** (`/app/http-status`): 1xx-5xx HTTP durum kodları referansı, çözüm rehberi, cURL örnekleri ve canlı donanım/GPU parmak izi analizi.

### 🛠️ Web Araçları
- **📱 QR Studio** (`/app/qr-studio`): qr-code-styling Canvas/SVG ile vektörel QR üretici, içerik türleri, tam alan geri yükleme desteği ve SVG/PNG indirme.

---

## 🔌 5. Dahili Backend API Endpointleri & Servis Kataloğu

Tüm harici veri sağlayıcıları, `web/routes/api/` altındaki izole modüller tarafından yönetilir ve çok katmanlı SSRF korumasıyla güvene alınır:

| Endpoint | Metot | İlgili Alt Modül (`routes/api/`) | Güvenlik / Açıklama |
|---|---|---|---|
| `/health` | `GET` | `server.js` | Sunucu sağlık durumu denetimi |
| `/api/tcmb` | `GET` | `tcmb.js` | TCMB resmi XML bültenini çeker, ayrıştırır ve 15 dk önbellekle sunar |
| `/api/dizi/imdb?id=...` | `GET` | `dizi.js` | IMDb ID veya linkini Cinemeta & TVmaze üzerinden çözer |
| `/api/arena/rooms` | `POST/GET`| `arena.js` | Kültür Arenası 1v1 düello oda sistemi ve skor yönetimi |
| `/api/carbon/analyze?url=...` | `GET` | `carbon.js` | SSRF korumalı canlı web sitesi boyutu ölçümü ve Green Web analizi |
| `/api/kutuphane/search?q=...` | `GET` | `kutuphane.js` | Akıllı Türkçe normalizasyonlu Gutenberg arama motoru |
| `/api/kutuphane/read?id=...` | `GET` | `kutuphane.js` | Gutenberg kitap metnini çeker, telif kalıplarını temizler |
| `/api/oyun/free` / `deals` | `GET` | `oyun.js` | GamerPower & CheapShark oyun indirim takipçisi |
| `/api/security/pwned-range` | `GET` | `security.js` | HIBP k-Anonymity SHA-1 hash aralığı proxy'si |
| `/api/dns/lookup` | `GET` | `dns.js` | SSRF korumalı Cloudflare/Google DoH DNS çözümleyici |
| `/api/github/user` / `card` | `GET` | `github.js` | GitHub profil analitiği ve dinamik SVG kart motoru |
| `/api/doga/sounds` | `GET` | `doga.js` | iNaturalist biyoakustik yabani kuş sesleri arşivi |
| `/api/molekul/data` | `GET` | `molekul.js` | PubChem REST API 3D conformer SDF kimyasal molekül servisi |
| `/api/iss/now` | `GET` | `iss.js` | Where is ISS? canlı yörünge telemetrisi ve koordinatları |
| `/api/atlas/countries` | `GET` | `atlas.js` | REST Countries dünya ülkeleri önbellekli arşivi |
| `/api/openaq/latest?city=...` | `GET` | `openaq.js` | Open-Meteo & OpenAQ canlı hava kalitesi endeksi (AQI) |
| `/api/oyun-lib/search` | `GET` | `oyunlib.js` | FreeToGame açık oyun kütüphanesi arama servisi |
| `/api/kripto/trend` | `GET` | `kripto.js` | CoinGecko ilk 25 kripto para ve trend token servisi |
| `/api/ip/lookup?ip=...` | `GET` | `ipgeo.js` | SSRF korumalı genel IP coğrafi konum ve ISP tespiti |
| `/api/food/search?barcode=...`| `GET` | `food.js` | Open Food Facts barkod & ürün arama ve Nutri-Score |
| `/api/radio/stations` | `GET` | `radyo.js` | Radio Browser canlı radyo arama ve stream servisi |
| `/api/bisiklet/networks` | `GET` | `bisiklet.js` | CityBikes küresel paylaşımlı bisiklet durak ağı |
| `/api/renk/scheme?hex=...` | `GET` | `renk.js` | The Color API renk uyum şemaları ve kontrast analizi |
| `/api/marine/forecast` | `GET` | `deniz.js` | Open-Meteo Marine deniz dalga boyu ve sörf uygunluğu |
| `/api/unesco/sites` | `GET` | `unesco.js` | UNESCO Dünya Mirası Alanları koordinat ve fotoğrafları |
| `/api/librivox/audiobooks` | `GET` | `seslikitap.js` | LibriVox açık kaynak sesli kitaplar arşivi |
| `/api/nobel/prizes` | `GET` | `nobel.js` | Nobel Vakfı resmi ödüller ve kazananlar arşivi |
| `/api/speedrun/records` | `GET` | `speedrun.js` | Speedrun.com oyun dünya rekorları |
| `/api/numbers/fact` | `GET` | `sayilar.js` | Numbers & Math analiz motoru ve matematik trivia |
| `/api/pets/breeds` | `GET` | `evcil.js` | TheCatAPI & Dog CEO evcil ırklar ansiklopedisi |
| `/api/chords/library` | `GET` | `gitar.js` | Gitar akor diyagramları ve transpoze şarkı motoru |
| `/api/poetry/random` | `GET` | `siir.js` | PoetryDB dünya şiirleri ve şair arşivi |
| `/api/http/statuses` | `GET` | `httpstatus.js` | 1xx-5xx HTTP durum kodları referansı |
| `/api/favorites` | `GET/POST`| `favorites.js` | Supabase PostgreSQL RLS tabanlı favori uygulamalar API |
| `/api/nobetci-eczane` | `GET` | `eczane.js` | İzmir BB Açık Veri Portalı canlı nöbetçi eczaneler servisi |
| `/api/ilac/*` | `GET` | `ilac.js` | openFDA & RxNorm ilaç prospektüsü ve advers olay analitiği |
| `/api/egzersiz/*` | `GET` | `egzersiz.js` | workout-cool & Wger kas anatomisi ve egzersiz kütüphanesi |
| `/api/klinik/*` | `GET` | `klinik.js` | NIH ClinicalTrials.gov v2 klinik araştırmalar servisi |
| `/api/dso/*` | `GET` | `dso.js` | Dünya Sağlık Örgütü (WHO) GHO OData küresel sağlık göstergeleri |

---

## 📦 6. Yeni / Canlı Sunucuya Taşıma Rehberi (Production Migration Checklist)

Projeyi başka bir sanal sunucuya (VPS), bulut sağlayıcısına veya yeni bir ortama taşırken aşağıdaki kontrol listesine dikkat edilmelidir:

| Adım | İşlem | Neden Önemli? |
| :--- | :--- | :--- |
| **1. `.env` Dosyası** | `.env.example` üzerinden `.env` dosyasını yeni sunucuya kopyalayın ve `JWT_SECRET` değerinin tanımlı olduğundan emin olun. | Kod içerisindeki sabit yedek anahtar kaldırıldığı için `JWT_SECRET` tanımlı olmazsa sistem fail-fast olarak hata verir. |
| **2. Ortam Modu** | `.env` içinde `NODE_ENV=production` olduğundan emin olun. | Demo hızlı girişinin (`/api/auth/quick-login`) kapalı kalmasını garanti eder. |
| **3. GitHub OAuth Callback** | GitHub Developer Settings > OAuth Apps altındaki **Authorization callback URL** alanını yeni sunucunun IP/Domain adresine güncelleyin (`http://yeni-ip-veya-domain:8088/auth/v1/callback`). | Giriş yaptıktan sonra kullanıcıların eski sunucuya yönlenmesini engeller. |
| **4. Supabase Veritabanı** | `user_favorites` tablosunu yeni sunucudaki Postgres veritabanında oluşturun veya mevcut DB volume'ünü taşıyın: `CREATE TABLE public.user_favorites (id BIGSERIAL PRIMARY KEY, user_id UUID REFERENCES auth.users(id), app_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(user_id, app_id));` ve RLS politikalarını açın. | Kullanıcı favorilerinin yeni sunucuda da veritabanına sorunsuz yazılabilmesi için gereklidir. |
| **5. Portlar & Güvenlik Duvarı** | Host üzerinde yalnızca `8088` (HTTP) ve `8443` (HTTPS) portlarını dış dünyaya açın; `5432` (Postgres) ve dahili portları dışa açmayın. | Veritabanının doğrudan internete maruz kalmasını engeller. |
| **6. Docker Başlatma** | `docker compose down` ardından `docker compose up -d --build` komutuyla konteynerları ayağa kaldırın. | `package-lock.json` ile kilitlenen güvenli ve deterministik bağımlılıkların derlenmesini sağlar. |

---

## 🏆 7. Krediler & Açık Kaynak Teşekkürleri (Credits & Attributions)

VibeCodedApps ekosisteminin geliştirilmesi, arayüz tasarımı, açık veri kaynakları ve güvenlik altyapısı aşağıdaki öncü açık kaynak projeler, geliştirici toplulukları ve platformlarla mümkün kılınmıştır:

- **[OpenClaw](https://github.com/openclaw/openclaw):** Bu projedeki tüm sistem mimarisini, Docker altyapısını, servis entegrasyonlarını, refactoring ve deployment süreçlerini yalnızca Telegram üzerinden doğal dille mesajlaşarak otonom olarak yöneten ve hayata geçiren yapay zeka ajan platformu.
- **[Google Gemini](https://github.com/google-gemini):** Projenin kodlanması, modüler mikro servislerin inşası, güvenlik açıklarının onarımı ve full-stack geliştirme süreçlerinde kullanılan **Gemini 3.8 Flash** temel yapay zeka modeli.
- **[VoltAgent / awesome-design-md](https://github.com/VoltAgent/awesome-design-md):** Vitrinde ve uygulamalarda kullanılan modern, editoryal ve zarif **Mistral AI Tasarım Sistemi** kurallarının (`design.md`) keşfedilmesini sağlayan tasarım reposu.
- **[public-apis / public-apis](https://github.com/public-apis/public-apis):** Portföydeki mikro uygulamaların beslendiği açık, ücretsiz ve kamuya açık API kaynaklarının keşfedilmesini sağlayan küresel topluluk dizini.
- **[usestrix / strix](https://github.com/usestrix/strix) (`vibe-strix`):** Sistemin tam yüzey sızma testlerini (penetration testing) otonom olarak yürüten, SSRF, DNS Rebinding ve güvenlik açıklarını tespit eden AI güvenlik ajanı.
- **[ersinkoc / security-check](https://github.com/ersinkoc/security-check):** OWASP Top 10, CWE kontrolleri ve statik kod analizi (SAST) ile sistemin üretim ortamına hazırlanmasını sağlayan güvenlik tarama paketi.
- **[Cloudflare / security-audit-skill](https://github.com/cloudflare/security-audit-skill):** Projede yürütülen güvenlik denetimlerinin kanıt modelini ve metodolojisini şekillendiren açık kaynak güvenlik denetim yeteneği.
- **[Supabase GoTrue & PostgreSQL](https://github.com/supabase/gotrue):** GitHub OAuth SSO tekil kimlik doğrulama mimarisi ve Row Level Security (RLS) tabanlı veri izolasyonu.
- **[Troy Hunt / Have I Been Pwned](https://haveibeenpwned.com/API/v3):** Güvenlik araçları modülünde sıfır bilgi garantili k-Anonymity (SHA-1) parola sızıntı denetim servisi.
- **[The Green Web Foundation](https://www.thegreenwebfoundation.org/):** Web Karbon Ayak İzi uygulamasında veri merkezi yeşil enerji doğrulaması ve CO2 emisyon hesaplama modelleri.
- **[Leaflet](https://github.com/Leaflet/Leaflet) & [OpenStreetMap](https://www.openstreetmap.org/):** Nöbetçi eczaneler, bisiklet durakları, uzay istasyonu takibi ve UNESCO dünya mirası alanları için açık coğrafi harita motoru.
- **[Nginx Reverse Proxy](https://nginx.org/):** Çok katmanlı CSP (Content-Security-Policy), Permissions-Policy, Clickjacking savunması ve statik varlık önbellekleme altyapısı.
