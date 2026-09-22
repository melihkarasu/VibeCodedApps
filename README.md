# Vibe Coded Apps - Portföy Mikro Uygulamaları & Sistem Dokümantasyonu

## 📌 1. Proje Vizyonu ve Mimari Özeti
**VibeCodedApps**, açık kaynak ve ücretsiz genel API'lar üzerine kurulu, modern, performanslı ve interaktif mikro web uygulamalarından oluşan bir **Developer Portfolio (Vibe Coding Vitrini)** projesidir.

- **URL Mimarisi:** Vitrin doğrudan kök dizin `/` altında çalışır. Eski `/app` adresi kalıcı yönlendirmeyle (`HTTP 301`) ana sayfaya yönlendirilir. Mikro uygulamalar hem `/{appname}` hem de geriye dönük `/app/{appname}` rotalarıyla sunulur.
- **Tekil Kimlik Doğrulama (Unified SSO):** Supabase GoTrue altyapısıyla **GitHub ve Google OAuth** tabanlı çift sağlayıcılı tekil giriş sistemi kurulmuştur.
- **Katı Erişim Koruması (Global Auth Guard):** Tüm mikro uygulamalar oturum açmış kullanıcılara özeldir. Giriş yapmamış bir kullanıcı ana sayfada bir uygulamaya tıkladığında veya doğrudan uygulama adresine gittiğinde, oturum açmasını isteyen modal ve GitHub/Google giriş butonları devreye girer; giriş sonrası kullanıcı doğrudan hedef uygulamaya yönlendirilir.
- **Kalıcı Bulut Veritabanı Senkronizasyonu (`user_app_data`):** Kullanıcıların kişisel antrenman programları, tarif defterleri, okuma listeleri ve tercihleri sadece tarayıcı `localStorage`'ında değil, Supabase PostgreSQL üzerindeki `public.user_app_data` tablosunda saklanır. Performans için veriler yalnızca ilgili uygulama açıldığında çekilir ve tüm cihazlar arasında senkronize kalır.

---

## 🛠️ 2. Sistem & Modüler Mimari Yapısı

Sistem izole Docker ağı (`vibe-network`) üzerinde koşan mikro servislerden oluşur:

```text
[ İnternet / Kullanıcı ]
          │
     :8088 / :8443
          ▼
   ┌──────────────┐
   │  vibe-nginx  │ (Reverse Proxy, SSL, CSP, Permissions-Policy, Güvenlik Başlıkları)
   └──────┬───────┘
          │
          ├── /static/*          ──►  vibe-web:3000/public (Precompiled Tailwind, Mistral Theme, core.js)
          │                              │
          │                              ├── public/css/tailwind.min.css (Derlenmiş Standalone CSS)
          │                              ├── public/css/mistral-theme.css (Global Tasarım & CSS Standartları)
          │                              ├── public/js/core.js (SSO Token Refresh, Toast, DB Data Sync)
          │                              └── public/apps/{app}/ (app.css & app.js Ayrıştırılmış Modüller)
          │
          ├── /, /app/*, /api/*  ──►  vibe-web:3000 (Node.js & Express - Saf HTML Şablonları & Auth Guard)
          │                              │
          │                              ├── web/server.js (Modüler Giriş Noktası & Çift Rota Eşlemesi)
          │                              ├── web/template.js (Zero-Flicker SSO, Auth Guard Overlay, Sanitizer)
          │                              ├── web/routes/
          │                              │     ├── vitrin.js (Ana Vitrin, Kategori Akordiyonları & Auth Modal)
          │                              │     ├── auth.js (GitHub & Google SSO Giriş Sayfası)
          │                              │     └── {app}.js (Saf HTML İskeletleri)
          │                              └── web/routes/api/ (Sub-Router Pattern - 39 Bağımsız Alt Servis)
          │
          ├── /auth/v1/*         ──►  vibe-supabase-auth:9999 (GoTrue v2.164.0 - GitHub & Google)
          ├── /rest/v1/*         ──►  vibe-supabase-rest:3000 (PostgREST v12.2.0)
          ├── [Veritabanı]       ──►  vibe-supabase-db:5432 (PostgreSQL 15 - RLS Korumalı)
          │
          └── [Güvenlik]         ──►  vibe-strix (AI Destekli Pentest & Güvenlik Ajanı)
```

### Modüler Kod Dağılımı (`web/`) & Sub-Router Mimarisi
1. **`server.js`:** Express sunucu başlangıcı, `/` ana sayfa sunumu, `/app` $\rightarrow$ `/` 301 yönlendirmesi, `/static` önbellekli statik dosya sunumu ve çift rota (`['/:name', '/app/:name']`) bağlamalarını içeren tertemiz giriş noktası.
2. **`template.js`:** Ortak sayfa iskeletini, senkron URL token temizleme betiğini (`replaceState`), navbar durum yönetimini ve giriş yapmamış kullanıcıları mikro uygulamalarda kilit altına alan **Global Auth Guard** modal overlay'ini barındırır.
3. **`public/css/tailwind.min.css`:** Runtime CDN derleme gecikmelerini ve uyarılarını sıfırlayan, üretim ortamı için önceden derlenmiş 70 KB'lık bağımsız Tailwind CSS paketi.
4. **`public/css/mistral-theme.css`:** Mistral AI renk paleti, tipografi, sunset stripe ve editoryal tasarım standartlarını içeren merkezi stil dosyası.
5. **`public/js/core.js`:** Supabase OAuth token yakalama, profil senkronizasyonu, otomatik token yenileme (`token refresh`), global bildirim sistemi (`showToast`) ve uygulama bazlı veritabanı senkronizasyon motorunu (`syncAppUserData`, `saveAppUserData`) barındırır.
6. **`public/apps/{app}/` (`app.css` & `app.js`):** Mikro uygulamaların tüm istemci script ve stilleri rota dosyalarından tamamen ayrıştırılmıştır.
7. **Modüler Alt Servisler (`web/routes/api/*.js`):** Single Responsibility ilkesi doğrultusunda, tüm harici API proxy servisleri ve kullanıcı veri yönetim servisi (`user-data.js`) bağımsız `express.Router()` olarak çalışır.

---

## 🔐 3. Güvenlik

Projenin güvenliği; otonom penetrasyon testleri, SAST statik kod analizleri ve katmanlı savunma mimarisiyle en üst standartlara getirilmiştir.

### Güvenlik Denetim Araçları & Metodolojisi
- **[usestrix/strix](https://github.com/usestrix/strix) (`vibe-strix`):** Sistemin tam yüzey dinamik penetrasyon testlerini yürüten, otonom AI güvenlik denetim ajanı. Çalışma zamanında (runtime) SSRF, açık port, yetkilendirme bypass ve HTTP başlık zafiyetlerini proaktif olarak denetler.
- **[ersinkoc/security-check](https://github.com/ersinkoc/security-check):** OWASP Top 10, CWE kontrolleri, bağımlılık açıkları ve SAST statik kod analizleriyle üretim ortamı güvenlik sertleştirmelerini sağlayan kapsamlı güvenlik denetim paketi.
- **[cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill):** Kanıt odaklı denetim (coverage-led hunting), izole çalışma ortamı doğrulaması ve sistematik zafiyet sınıflandırması sağlayan güvenlik metodolojisi.

### Uygulanan Kritik Savunma Önlemleri & Güvenlik Sertleştirmeleri
1. **Çok Katmanlı SSRF & DNS Rebinding Savunması (CWE-918):**
   - Dış ağa istek atan tüm proxy servislerinde (`web/routes/api/utils.js`) `isPrivateAddress()` fonksiyonu devrededir.
   - Sadece domain metni değil; **DNS çözümlemesi yapılarak gerçek IP adresleri** denetlenir.
   - `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16` (Cloud Metadata), `100.64.0.0/10` (CGNAT), `::1` ve Docker iç ağları (`vibe-*`, `supabase-*`) tamamen engellenir (`403 Forbidden`).
2. **Sabit Fallback Secret ve Açık Hesap Temizliği (CWE-798, CWE-306):**
   - Kaynak kodda yer alan sabit anahtarlar ve geliştirme aşamasındaki hızlı giriş kurguları tamamen temizlenmiştir.
   - Ortam değişkeni (`JWT_SECRET`) eksikse sahte anahtar üretilmez, fail-fast olarak güvenli şekilde durur.
   - Canlı sunucudaki `.env` dosyasının izinleri `chmod 600` ile sıkılaştırılmıştır.
3. **HTTP Güvenlik Başlıkları & Nginx Koruması (`vibe.conf`):**
   - `Content-Security-Policy`: XSS kısıtlamalı CSP politikası.
   - `X-Frame-Options: SAMEORIGIN` (Clickjacking savunması), `X-Content-Type-Options: nosniff` (MIME sniffing engeli).
   - `.env`, `.git`, `.htaccess` uzantılarına web üzerinden yapılan tüm doğrudan erişimler Nginx tarafından anında `404 Not Found` ile engellenir.
4. **Veritabanı Düzeyinde RLS (Row Level Security):**
   - `public.user_favorites` ve `public.user_app_data` tabloları Supabase RLS politikaları (`auth.uid() = user_id`) ile korunur. Hiçbir kullanıcı bir başkasının verisini okuyamaz veya üzerine yazamaz.
5. **URL Token Dezenfeksiyonu (Instant Hash Sanitizer):**
   - OAuth dönüşlerinde adres çubuğuna düşen `#access_token=...` parametreleri, sayfa başlığında (`<head>`) çalışan senkron JavaScript betiği ile milisaniyeler içinde `localStorage`'a alınıp adres çubuğundan silinir (`replaceState`). Böylece token'ların tarayıcı geçmişinde veya ekran paylaşımlarında açıkta kalması önlenir.

---

## 🚀 4. Canlıdaki Mikro Uygulamalar ve Tematik Kategori Hiyerarşisi

Tüm uygulamalar `/` vitrininde kategoriler altında hiyerarşik olarak listelenir, açılır/kapanır akordiyon panelleriyle yönetilir ve yıldız butonuyla en üstteki **⭐ Favorilerim** listesine eklenebilir. Uygulamalara erişim oturum açma zorunluluğuna bağlıdır.

### 🏥 Sağlık
- **💊 İzmir Nöbetçi Eczane Radarı** (`/nobetci-eczane`): İzmir Büyükşehir Belediyesi Açık Veri Portalı API'si ve Leaflet haritası ile canlı cihaz GPS konum tespiti. İzin verilmediğinde varsayılan **C4PQ+8Q Konak, İzmir** merkez alınarak en yakın nöbetçi eczaneler sıralanır, tek tıkla arama (`tel:`) ve Google Maps yol tarifi sunulur.
- **💊 İlaç & Prospektüs Rehberi** (`/ilac-rehberi`): openFDA & RxNorm veritabanı ile etken maddeler, prospektüs özeti ve yan etki analitiği.
- **🏋️ İnteraktif Kas Anatomisi & Egzersiz** (`/kas-anatomisi`): workout-cool ve Wger verileriyle interaktif kas haritası, antrenman kurgusu ve veritabanına kaydedilen kişisel spor programı.
- **🔬 Klinik Araştırmalar Radarı** (`/klinik-arastirma`): NIH ClinicalTrials.gov v2 API ile aktif klinik deneyler, faz aşamaları ve deneysel tedaviler.
- **🌐 Küresel Sağlık Atlası (DSÖ)** (`/dso-saglik`): Dünya Sağlık Örgütü (WHO GHO OData) verileriyle ülkelerin beklenen yaşam süresi, aşılanma ve sağlık göstergeleri.

### 🌱 Coğrafya, Doğa & Çevre
- **🌾 Akıllı Tarım & Zirai Hava** (`/tarim-hava`): Toprak nemi/sıcaklığı derinlikleri, don riski erken uyarı sistemi ve sulama tavsiyeleri.
- **🌱 Web Karbon Ayak İzi** (`/karbon-metre`): Sayfa yükleme başına CO2 salımı, yeşil hosting analizi ve dinamik SVG eko-rozet.
- **🐦 Kuş Sesi Dedektifi** (`/doga-sesleri`): iNaturalist Bioacoustics yabani kuş sesleri arşivi, Web Audio canlı spektrum ses dalgası.
- **🌍 Küresel Coğrafya Atlası** (`/cografya-atlasi`): REST Countries API ile dünya ülkelerinin bayrakları, başkentleri ve sınır komşuları.
- **💨 Canlı Hava Kalitesi Radarı** (`/hava-kalitesi`): OpenAQ ve Open-Meteo ile dünya şehirlerinin canlı PM2.5, PM10, NO2 seviyeleri ve AQI endeksi.
- **🚲 Şehir Bisiklet Rehberi** (`/sehir-bisiklet`): CityBikes API ile küresel metropollerde canlı bisiklet durakları ve boş bisiklet haritası.
- **🌊 Mavi Rota: Dalga & Sörf Radarı** (`/deniz-dalga`): Ege, Akdeniz ve Karadeniz kıyılarında canlı dalga boyu, periyot ve rüzgar dalgası uygunluğu.

### 🧬 Uzay & Bilim
- **🧬 3D Molekül Stüdyosu** (`/molekul-studyosu`): PubChem REST API & 3Dmol.js WebGL ile kimyasalların 3D atomik modellemesi.
- **🛰️ Where is ISS? Uzay Radarı** (`/iss-takip`): Uluslararası Uzay İstasyonu'nun anlık koordinatları, yörünge hızı ve canlı haritası.
- **🧮 Sayılar Atlası & Matematik** (`/sayilar-atlasi`): Asallık, Fibonacci, bölen analizi, ikili kodlar ve matematik trivia motoru.
- **🎖️ Nobel Ödülleri Arşivi** (`/nobel-arsivi`): 1901'den günümüze bilim insanları, çığır açan keşifler ve edebiyat ödülleri.

### 🎨 Sanat, Tarih & Edebiyat
- **🎨 Global Sanat Galerisi** (`/sanat-galerisi`): The Met Museum Open Access ile usta ressamlar, 4x derin yakınlaştırma ve kişisel sergi.
- **📖 Dijital Kütüphane** (`/klasik-kutuphane`): Project Gutenberg arşivi, Web Speech sesli kitap motoru, yer imleri ve bulut senkronize okuma listesi.
- **📅 Küresel Tatil Takvimi** (`/tatil-takvimi`): Nager.Date API ile ülkelerin resmi tatilleri, köprü izin fırsatları ve .ics takvim aktarımı.
- **🏛️ UNESCO Dünya Mirası Atlası** (`/unesco-miras`): Dünya mirası alanları, fotoğrafları, kabul yılları ve harita konumları.
- **🎧 Sesli Kütüphane (LibriVox)** (`/sesli-kitap`): LibriVox kamu malı seslendirilmiş dünya klasikleri ve ses çaları.
- **📜 Şiir Vahası: Şiir Antolojisi** (`/siir-antolojisi`): PoetryDB açık arşivi ile usta şairlerin eserleri ve tipografik okuyucu.

### 🎮 Oyun
- **🌍 Kültür Arenası & Trivia** (`/kultur-arena`): Dahili soru bankası & Web Audio ile solo yarışma, 1v1 canlı düello ve skor sıralaması.
- **🏷️ Steam & Epic Fırsat Avcısı** (`/oyun-radar`): CheapShark & GamerPower ile büyük indirimler, %100 ücretsiz kalıcı hediyeler.
- **🕹️ Oyun Keşif Kütüphanesi** (`/oyun-arsivi`): FreeToGame ve açık oyun veritabanı ile PC ve tarayıcı oyunları.
- **⚡ Speedrun Oyun Rekorları** (`/oyun-rekorlari`): Speedrun.com açık veritabanı ile popüler video oyunlarının dünya rekorları.

### 🍿 Popüler Kültür & Eğlence
- **🎬 Dizi & Sezon Takipçisi** (`/dizi-rehberi`): TVmaze & Cinemeta ile dizi ekleme, bölüm bazlı sezon takip listesi.
- **🎵 Sözden Şarkıya** (`/sozden-sarkiya`): LRCLIB & iTunes Search API ile akılda kalan sözlerden şarkı ve söz tespiti.
- **🍹 Lezzet Atölyesi** (`/lezzet-atolyesi`): TheMealDB & TheCocktailDB ile malzeme arama ve veritabanı senkronize tarif defteri.
- **🏷️ Gıda Dedektifi & Alerjen Kalkanı** (`/gida-alerji`): Open Food Facts ile barkod tarama, Nutri-Score ve kişisel alerji uyarısı.
- **📻 Dünya Radyo Kulesi** (`/dunya-radyo`): Radio Browser API ile binlerce küresel canlı radyo yayını ve Web Audio çaları.
- **🐾 Evcil Dostlar Ansiklopedisi** (`/evcil-rehber`): TheCatAPI & Dog CEO ile kedi/köpek ırkları, mizaç analizi ve çocuk dostluğu rehberi.
- **🎸 Akustik: Gitar Akor & Tab** (`/gitar-akor`): Akor şemaları, parmak basış rehberi, canlı transpoze ve otomatik kaydırma.

### 📊 Finans & Piyasa
- **💱 Anlık Döviz Çevirici** (`/doviz-cevirici`): TCMB XML bülteni + Frankfurter (ECB) ile para birimleri ve trend grafikleri.
- **📊 Küresel Refah Göstergesi** (`/kuresel-gostergeler`): World Bank Open Data API ile 30 yıllık GSYİH, enflasyon ve refah endeksi analizi.
- **🪙 Kripto Trend & Piyasa Radarı** (`/kripto-trend`): CoinGecko API ile anlık kripto para fiyatları ve trend tokenlar.

### 💻 Geliştirici Araçları
- **🐙 GitHub Profil Analitiği** (`/github-analitik`): GitHub REST API ile repo yıldızları, dil dağılımı ve dinamik SVG kart stüdyosu.
- **🌐 DNS Kontrol & Ağ Teşhisi** (`/dns-kontrol`): Cloudflare & Google DoH ile DNS kayıtları, gecikme testi ve SPF/DMARC denetimi.
- **🛡️ Sızıntı Kontrolü & Güvenlik** (`/sizinti-kontrol`): HaveIBeenPwned k-Anonymity (SHA-1) sıfır bilgi parola sızıntı denetimi.
- **📍 IP Coğrafi Konum & İstihbarat** (`/ip-konum`): SSRF korumalı genel IP lokasyonu, ISS ve ASN analizi.
- **🎨 Harmoni: Renk & Kontrast Stüdyosu** (`/renk-studyosu`): The Color API ile renk şemaları, WCAG kontrast analizi ve CSS/Tailwind export.
- **💻 HTTP Sözlüğü & Cihaz Röntgeni** (`/http-status`): HTTP durum kodları referansı ve canlı donanım/GPU analizi.

### 🛠️ Web Araçları
- **📱 QR Studio** (`/qr-studio`): qr-code-styling ile vektörel QR üretici, içerik türleri ve SVG/PNG indirme.

---

## 🔌 5. Dahili Backend API Endpointleri & Servis Kataloğu

| Endpoint | Metot | İlgili Alt Modül (`routes/api/`) | Güvenlik / Açıklama |
|---|---|---|---|
| `/health` | `GET` | `server.js` | Sunucu sağlık durumu denetimi |
| `/api/user-data/:appId` | `GET/POST/DELETE` | `user-data.js` | Kullanıcı bazlı izole bulut veri senkronizasyon servisi (RLS korumalı) |
| `/api/favorites` | `GET/POST`| `favorites.js` | Supabase PostgreSQL RLS tabanlı favori uygulamalar API |
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
| `/api/nobetci-eczane` | `GET` | `eczane.js` | İzmir BB Açık Veri Portalı canlı nöbetçi eczaneler servisi |
| `/api/ilac/*` | `GET` | `ilac.js` | openFDA & RxNorm ilaç prospektüsü ve advers olay analitiği |
| `/api/egzersiz/*` | `GET` | `egzersiz.js` | workout-cool & Wger kas anatomisi ve egzersiz kütüphanesi |
| `/api/klinik/*` | `GET` | `klinik.js` | NIH ClinicalTrials.gov v2 klinik araştırmalar servisi |
| `/api/dso/*` | `GET` | `dso.js` | Dünya Sağlık Örgütü (WHO) GHO OData küresel sağlık göstergeleri |

---

## 📦 6. Yeni / Canlı Sunucuya Taşıma Rehberi (Production Migration Checklist)

| Adım | İşlem | Neden Önemli? |
| :--- | :--- | :--- |
| **1. `.env` Dosyası** | `.env.example` üzerinden `.env` dosyasını yeni sunucuya kopyalayın, `JWT_SECRET`, GitHub ve Google OAuth istemci bilgilerini tanımlayın. | Kod içerisindeki sabit yedek anahtarlar kaldırıldığı için eksik anahtarda sistem fail-fast durur. |
| **2. Ortam Modu & İzinler** | `NODE_ENV=production` tanımlayın ve `.env` dosya izinlerini `chmod 600` yapın. | Hassas kimlik bilgilerinin ve veritabanı anahtarlarının korunmasını sağlar. |
| **3. OAuth Callback URL'leri** | GitHub ve Google Cloud Console üzerindeki **Authorized Redirect URI** alanlarını `https://app.melihkarasu.com/auth/v1/callback` olarak ayarlayın. | Kullanıcıların onay sonrası doğru adrese geri dönebilmesini sağlar. |
| **4. Supabase Veritabanı** | `user_favorites` ve `user_app_data` tablolarını Postgres veritabanında oluşturun ve RLS politikalarını açın (`01-init.sql`). | Kullanıcı favorilerinin ve kişisel uygulama verilerinin veritabanına yazılabilmesi için şarttır. |
| **5. Portlar & Güvenlik Duvarı** | Yalnızca `80` (HTTP) ve `443` (HTTPS) portlarını web trafiğine açın; `5432` (Postgres) ve dahili portları dışa kapatın. | Veritabanının doğrudan internete maruz kalmasını engeller. |
| **6. Docker Başlatma** | `docker compose up -d --build` komutuyla konteynerları ayağa kaldırın. | Güvenli ve deterministik bağımlılıkların derlenmesini sağlar. |

---

## 🏆 7. Krediler & Açık Kaynak Teşekkürleri (Credits & Attributions)

- **[OpenClaw](https://github.com/openclaw/openclaw):** Bu projedeki tüm sistem mimarisini, Docker altyapısını, servis entegrasyonlarını, refactoring ve deployment süreçlerini yalnızca Telegram üzerinden doğal dille mesajlaşarak otonom olarak yöneten ve hayata geçiren yapay zeka ajan platformu.
- **[Google Gemini](https://github.com/google-gemini):** Projenin kodlanması, modüler mikro servislerin inşası, güvenlik açıklarının onarımı ve full-stack geliştirme süreçlerinde kullanılan **Gemini 3.8 Flash** temel yapay zeka modeli.
- **[VoltAgent / awesome-design-md](https://github.com/VoltAgent/awesome-design-md):** Vitrinde ve uygulamalarda kullanılan modern, editoryal ve zarif **Mistral AI Tasarım Sistemi** kurallarının (`design.md`) keşfedilmesini sağlayan tasarım reposu.
- **[public-apis / public-apis](https://github.com/public-apis/public-apis):** Portföydeki mikro uygulamaların beslendiği açık, ücretsiz ve kamuya açık API kaynaklarının keşfedilmesini sağlayan küresel topluluk dizini.
- **[usestrix / strix](https://github.com/usestrix/strix) (`vibe-strix`):** Sistemin tam yüzey sızma testlerini (penetration testing) otonom olarak yürüten, SSRF, DNS Rebinding ve güvenlik açıklarını tespit eden AI güvenlik ajanı.
- **[ersinkoc / security-check](https://github.com/ersinkoc/security-check):** OWASP Top 10, CWE kontrolleri ve statik kod analizi (SAST) ile sistemin üretim ortamına hazırlanmasını sağlayan güvenlik tarama paketi.
- **[Cloudflare / security-audit-skill](https://github.com/cloudflare/security-audit-skill):** Projede yürütülen güvenlik denetimlerinin kanıt modelini ve metodolojisini şekillendiren açık kaynak güvenlik denetim yeteneği.
- **[Supabase GoTrue & PostgreSQL](https://github.com/supabase/gotrue):** GitHub ve Google OAuth SSO tekil kimlik doğrulama mimarisi ve Row Level Security (RLS) tabanlı veri izolasyonu.
- **[Troy Hunt / Have I Been Pwned](https://haveibeenpwned.com/API/v3):** Güvenlik araçları modülünde sıfır bilgi garantili k-Anonymity (SHA-1) parola sızıntı denetim servisi.
- **[The Green Web Foundation](https://www.thegreenwebfoundation.org/):** Web Karbon Ayak İzi uygulamasında veri merkezi yeşil enerji doğrulaması ve CO2 emisyon hesaplama modelleri.
- **[Leaflet](https://github.com/Leaflet/Leaflet) & [OpenStreetMap](https://www.openstreetmap.org/):** Nöbetçi eczaneler, bisiklet durakları, uzay istasyonu takibi ve UNESCO dünya mirası alanları için açık coğrafi harita motoru.
- **[Nginx Reverse Proxy](https://nginx.org/):** Çok katmanlı CSP (Content-Security-Policy), Permissions-Policy, Clickjacking savunması ve statik varlık önbellekleme altyapısı.
