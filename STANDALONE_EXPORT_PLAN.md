# VibeCodedApps Standalone Repolara Dönüştürme & Dağıtım Planı

Bu belge, **VibeCodedApps** monoreposu içerisindeki 40+ mikro uygulamanın canlı sunucu yapısını (`app.melihkarasu.com`, Docker, Supabase SSO ve veritabanı senkronizasyonu) **hiç bozmadan**, GitHub üzerinde bağımsız (standalone), sunucusuz ve sadece `localStorage` ile çalışan müstakil açık kaynak repolar haline getirilmesi sürecini açıklar.

---

## 1. Temel Hedefler & İlkeler

1. **Canlı Ortamın Dokunulmazlığı:**
   - Mevcut monorepo (`vibe-coded-apps`), Express sunucusu (`server.js`), Docker konteynerleri (`vibe-web`) ve Supabase veritabanı entegrasyonu birebir korunacaktır.
   - Canlı ortamdaki güncellemeler ve deploy döngüsü etkilenmeyecektir.

2. **Sıfır Backend & Sıfır Kimlik Bağımlılığı (Zero-Backend / No-Auth):**
   - GitHub'da paylaşılacak repolarda Supabase OAuth (GitHub/Google) ve Auth Guard katmanı yer almayacaktır.
   - Her kullanıcı repoyu indirdiği gibi veya GitHub Pages üzerinden doğrudan tarayıcıda çalıştırabilecektir.
   - Favoriler, kayıtlı içerikler ve kişiselleştirmeler tamamen tarayıcı `localStorage` üzerinde izole tutulacaktır.

3. **Müstakil ve Taşınabilir Kod Tabanı:**
   - Her repo kendi içinde bağımsız bir `index.html`, `style.css`, `app.js` ve kapsamlı bir `README.md` barındıracaktır.
   - Tasarım dili olarak Mistral AI teması (Tailwind CSS, Inter/Newsreader fontları, FontAwesome) korunacaktır.

4. **GitHub Pages ile Tek Tıkla Canlı Demo:**
   - Her repo statik web standartlarına uygun olacağından, GitHub Settings -> Pages üzerinden `main` branch seçildiği an canlıya alınabilecektir (`https://melihkarasu.github.io/vibe-<app>/`).

---

## 2. Uygulama Kategorizasyonu

| Kategori | Açıklama | Çözüm Yolu | Örnek Uygulamalar |
| :--- | :--- | :--- | :--- |
| **Grup A: %100 İstemci Taraflı (Pure Client-Side)** | Hiçbir backend veya CORS proxy gerektirmez. | Tamamen statik HTML/JS + `localStorage`. Doğrudan GitHub Pages ile çalışır. | QR Studio, Akor/Tab Stüdyosu, Renk Paleti, Karbon Ayak İzi, Egzersiz, vb. |
| **Grup B: Harici Public API (CORS Destekli)** | Tarayıcıdan doğrudan erişilebilen açık API'ler kullanır. | Doğrudan API çağrısı + API Key/URL parametresi desteği. | Kripto Kurları, ISS Uydu Takibi, Döviz Kurları vb. |
| **Grup C: Proxy/Cache Gerektiren API'ler** | Rate-limit veya CORS kısıtı olan servisler. | Opsiyonel Client fallback / mock veri modu + küçük bağımsız Edge/Worker örneği. | Nöbetçi Eczane, Kütüphane API'leri vb. |

---

## 3. Bağımsız Uygulama Mimarisi (Dosya Yapısı)

Her bağımsız repo şu standart yapıya sahip olacaktır:

```
vibe-<app-name>/
├── index.html        # Temizlenmiş, auth-guard içermeyen standalone HTML
├── css/
│   ├── style.css     # Mistral teması ve uygulamaya özel stiller
│   └── tailwind.css  # Gerekli Tailwind CSS tanımları
├── js/
│   └── app.js        # Sadece localStorage kullanan uygulama mantığı
├── assets/           # İkonlar, logolar veya ekran görüntüleri
├── README.md         # Proje tanıtımı, özellikler ve canlı demo linki
├── LICENSE           # MIT Açık Kaynak Lisansı
└── .gitignore
```

---

## 4. Uygulama Adımları

### Aşama 1: Pilot Uygulama (QR Studio)
- QR Kod Üretici (`qr`) standalone repoya dönüştürülür.
- LocalStorage kaydetme/yükleme fonksiyonları doğrulanır.
- Bağımsız şablon ve README standardı oluşturulur.

### Aşama 2: Standalone Exporter Betiği Geliştirme (`export-standalone.js`)
- `web/routes/*.js` dosyalarındaki HTML şablonlarını ve `web/public/apps/*` içeriklerini otomatik ayrıştırıp standart dizine döken bir betik yazılır.
- Auth Guard, Supabase API ve monorepo linkleri otomatik temizlenir.

### Aşama 3: GitHub Dağıtımı & Pages Otomasyonu
- Hazırlanan uygulamalar için Melih Karasu GitHub hesabında repolar oluşturulur.
- GitHub Pages aktif edilir.
- Ana repodaki `README.md` dosyasına bu repoların açık kaynak liste linkleri (Vitrin) eklenir.
