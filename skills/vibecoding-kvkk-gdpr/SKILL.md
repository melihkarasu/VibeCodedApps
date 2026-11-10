---
name: "vibecoding-kvkk-gdpr"
description: "6698 sayılı KVKK (2024/2026 reformları dahil), AB GDPR (General Data Protection Regulation), 6563 sayılı ETK (İYS), 6502 sayılı TKHK (Mesafeli Sözleşmeler) ve 5651 sayılı Kanun kapsamında Privacy by Design & by Default mimarisi, veri güvenliği (RLS, şifreleme, PII maskeleme), aydınlatma ve açık rıza mekanizmaları, çerez uyumu, yurt dışı veri aktarımı ve 72 saatlik veri ihlali müdahale kurallarını içeren kapsamlı yapay zeka ajan yönergesi. AI ajanları web, mobil, SaaS ve yapay zeka uygulamaları geliştirirken, kod üretirken, refaktör ederken veya denetlerken bu kurallara ZORUNLU olarak uymalıdır."
---

# ⚖️ VibeCoding KVKK & GDPR Rules

**AI Kodlama Ajanları İçin Veri Koruma Hukuku, Privacy-by-Design Mimarisi ve Mevzuat Uyum Yönergesi (KVKK · GDPR · ETK/İYS · TKHK · 5651)**

[![KVKK: 6698](https://img.shields.io/badge/KVKK-6698_Say%C4%B1l%C4%B1_Kanun-E11D48?style=flat-square)](https://www.kvkk.gov.tr/)
[![GDPR: EU 2016/679](https://img.shields.io/badge/GDPR-EU_2016%2F679-2563EB?style=flat-square)](https://gdpr-info.eu/)
[![ETK & İYS: 6563](https://img.shields.io/badge/ETK_%26_%C4%B0YS-6563_Say%C4%B1l%C4%B1_Kanun-059669?style=flat-square)](https://iys.org.tr/)
[![TKHK: 6502](https://img.shields.io/badge/TKHK-6502_Mesafeli_Sat%C4%B1%C5%9F-D97706?style=flat-square)](https://www.mevzuat.gov.tr/)
[![Standard: Privacy by Design](https://img.shields.io/badge/Architecture-Privacy_by_Design_%26_Default-7C3AED?style=flat-square)](https://github.com/melihkarasu)
[![Penalties: 2026 Updated](https://img.shields.io/badge/Ceza_Takvimi-2026_Yeniden_De%C4%9Ferleme-DC2626?style=flat-square)](https://www.kvkk.gov.tr/Icerik/8145/6698-sayili-kisisel-verilerin-korunmasi-kanunu-kapsaminda-idari-para-cezasi-tutarlari)

---

## 📖 Hukuki Vizyon ve Kapsam (Overview)

**VibeCoding KVKK & GDPR Rules**, yapay zeka kodlama ajanlarının (**Claude Code**, **Cursor**, **Windsurf**, **OpenClaw**, **GitHub Copilot** ve otonom yazılım iş akışları) geliştirdiği uygulamaların **tek bir satış bile yapmadan veya yayına çıktığı ilk gün** ağır idari para cezaları, erişim engelleri veya tazminat davalarıyla karşılaşmasını önlemek için bir **Bilişim ve Veri Koruma Hukukçusu** titizliğiyle tasarlanmıştır.

Geleneksel yazılım geliştirmede hukuki uyum genellikle ürün yayına çıktıktan sonra "eklenen metinler" sanılır. Oysa **KVKK Madde 12** ve **GDPR Madde 25 (Data Protection by Design and by Default)** uyarınca veri koruma; veritabanı şemasından (`Row Level Security`, `consent_logs`), ön yüz bileşenlerine (işaretlenmemiş açık rıza kutuları, yerel fontlar), e-posta/SMS kuyruklarından (İYS ve RFC 8058 `List-Unsubscribe`), loglama mimarisine kadar **doğrudan kaynak kodun içinde** inşa edilmek zorundadır.

---

## 🚀 Hızlı Entegrasyon (Quick Integration)

```bash
# 1. Repoyu klonlayın
git clone https://github.com/melihkarasu/vibecoding-kvkk-gdpr.git

# 2. OpenAI Codex (AGENTS.md), Cursor (.cursorrules) veya Claude Code (CLAUDE.md) olarak projeye ekleyin
cp vibecoding-kvkk-gdpr/AGENTS.md ./AGENTS.md
cp vibecoding-kvkk-gdpr/.cursorrules ./.cursorrules
cp vibecoding-kvkk-gdpr/CLAUDE.md ./CLAUDE.md

# 3. Veya OpenClaw / Claude Code Agent Skill olarak kurun
mkdir -p ~/.openclaw/workspace/skills/vibecoding-kvkk-gdpr
cp vibecoding-kvkk-gdpr/SKILL.md ~/.openclaw/workspace/skills/vibecoding-kvkk-gdpr/SKILL.md
```

| Dosya | Uyumlu Platform / Ajan | Amacı |
| :--- | :--- | :--- |
| **[`SKILL.md`](./SKILL.md)** | **OpenClaw · Claude Code · Codex Skills** | YAML üst verili (frontmatter) tam kapsamlı ajan yeteneği (Skill). |
| **[`AGENTS.md`](./AGENTS.md)** | **OpenAI Codex CLI / Codex Agent** | Codex ajanları için doğrudan proje kök dizini yönergesi. |
| **[`CLAUDE.md`](./CLAUDE.md)** | **Claude Code (`claude.md`)** | Claude Code için proje bazlı otomatik hukuk & gizlilik bellek dosyası. |
| **[`.cursorrules`](./.cursorrules)** | **Cursor IDE** | Cursor AI için otomatik yüklenen KVKK & GDPR kural seti. |
| **[`VibeCoding_KVKK_GDPR_Rules.md`](./VibeCoding_KVKK_GDPR_Rules.md)** | **Windsurf · Copilot · Custom LLM** | Bağımsız Markdown kural ve denetim referansı. |
| **[`README.md`](./README.md)** | **GitHub & Dokümantasyon** | Hızlı başvuru tabloları, 2026 ceza matrisi ve entegrasyon kılavuzu. |

---

## 🚨 2026 Yılı İdari Para Cezası ve Yaptırım Matrisi

AI ajanları kod yazarken veya denetim yaparken aşağıdaki her bir teknik eksikliğin doğrudan somut bir idari yaptırıma karşılık geldiğini bilerek hareket etmelidir:

| İhlal Alanı | Yasal Dayanak | 2026 İdari Para Cezası / Yaptırım Tutarı | Tipik Teknik Kök Neden (Kod Hatası) |
| :--- | :--- | :--- | :--- |
| **Aydınlatma Yükümlülüğü İhlali** | **KVKK m.10**<br>*(Ceza: m.18/1-a)* | **85.437 TL – 1.709.200 TL** | Kayıt, iletişim veya bülten formlarında veri toplanırken katmanlı aydınlatma metni bağlantısının bulunmaması veya rıza ile karıştırılması. |
| **Veri Güvenliği & 72 Saat Bildirim İhlali** | **KVKK m.12**<br>*(Ceza: m.18/1-b & Kurul 2019/10)* | **256.357 TL – 17.092.242 TL** | Supabase/PostgreSQL `public` şemasında RLS kapalı tablolar, ön yüzde `service_role` anahtarı sızıntısı, denetim logu ve 72 saat ihlal planı olmaması. |
| **Kurul Kararlarına Aykırılık** | **KVKK m.15**<br>*(Ceza: m.18/1-c)* | **427.263 TL – 17.092.242 TL** | Özel nitelikli verilerde (Kurul 2018/10) ek şifreleme/maskeleme yapılmaması, rızanın hizmet şartına bağlanması. |
| **VERBİS Kayıt Yükümlülüğü İhlali** | **KVKK m.16**<br>*(Ceza: m.18/1-ç)* | **341.800 TL – 17.092.242 TL** | Kod tabanında işlenen veri kategorilerinin ve saklama sürelerinin Veri Envanteri (ROPA) ile uyumsuz olması. |
| **Yurt Dışı Aktarım (Standart Sözleşme) Bildirim İhlali** | **KVKK m.9**<br>*(Ceza: m.18/1-d — 2024/2026 Reformu)* | **Yurt Dışı Aktarım İdari Para Cezası** | Yurt dışı bulut/AI/SaaS sağlayıcılarıyla yapılan Standart Sözleşmenin 5 iş günü içinde Kuruma bildirilmemesi veya izinsiz IP/veri aktarımı. |
| **İzinsiz Ticari Elektronik İleti (Spam)** | **6563 Sayılı ETK m.6**<br>*(Ceza: m.12/1-a)* | **2.859 TL – 14.309 TL**<br>*(Toplu gönderimde 10 katı: **143.090 TL**)* | Pazarlama izni (`marketing_consent`) olmayan kullanıcılara kampanya maili/SMS atılması, İYS senkronizasyonu ve abonelikten çıkma linki olmaması. |
| **Ön Bilgilendirme & Mesafeli Satış İhlali** | **6502 Sayılı TKHK m.48/2**<br>*(Ceza: m.77/1-a)* | **Satış / Sözleşme Başına 3.973 TL** | Ödeme adımından önce Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi onayının alınmaması, abonelik yenileme/iptal şartlarının gizlenmesi. |
| **AB Kullanıcıları & Yurt Dışı Veri Sızıntısı** | **GDPR Art. 5, 6, 25, 32, 44-49**<br>*(Ceza: Art. 83 & Art. 82)* | **20.000.000 EUR** veya **%4 Küresel Ciro**<br>+ Ziyaretçi Başı Tazminat *(örn. 100 EUR)* | Ücretsiz uygulamalar dahil AB ziyaretçilerinin IP adresinin Google Fonts CDN, izinsiz Analytics/Pixel veya LLM API'leri üzerinden AB/TR dışına aktarılması. |

---

## 🔟 AI Ajanları İçin 12 Altın Hukuk ve Gizlilik Kuralı (The 12 Golden Rules)

| # | Hukuki & Teknik Alan | ❌ Asla Yapma (Hukuka Aykırı / Ceza Riski) | ✅ Her Zaman Uygula (Privacy-by-Design Kalıbı) |
| :-: | :--- | :--- | :--- |
| **01** | **Veritabanı Güvenliği & RLS**<br>*(KVKK m.12 / GDPR Art. 32)* | Supabase/PostgreSQL `public` şemasında RLS'i kapalı bırakmak, politikasız tablo oluşturmak veya ön yüzde `service_role` anahtarı kullanmak. | Her tabloda `ENABLE ROW LEVEL SECURITY` ve `auth.uid() = user_id` politikası tanımla; `service_role` anahtarını yalnızca sunucu tarafında (Server Actions / Route Handlers) tut. |
| **02** | **Aydınlatma vs. Açık Rıza Ayrımı**<br>*(KVKK m.5, m.10 / GDPR Art. 7, 13)* | *"Aydınlatma metnini ve açık rızayı okudum, kabul ediyorum"* şeklinde tek bir onay kutusu koymak veya kutuyu varsayılan işaretli (`checked`) getirmek. | **Aydınlatma Metnini** onaya tabi tutmadan görünür link/katmanlı bilgi olarak sun; **Açık Rızayı** yalnızca gerekli hallerde, işleme amacı bazında **ayrı** ve **işaretlenmemiş (`checked={false}`)** kutularla al. |
| **03** | **Hizmetin Rızaya Şart Koşulmaması**<br>*(KVKK m.4, m.5 / GDPR Art. 7(4))* | Sözleşmenin ifası (kayıt/sipariş) için yeterli olan bir işlemde pazarlama veya 3. taraf paylaşım rızasını `required` (zorunlu) yapmak (*Bundled Consent*). | Temel hizmetin sunulması için zorunlu olmayan hiçbir açık rıza kutusuna `required` özniteliği koyma; kullanıcı rıza vermeden de kayıt olabilmeli ve alışveriş yapabilmelidir. |
| **04** | **Ticari Elektronik İleti & İYS**<br>*(6563 ETK m.6-8 / CAN-SPAM)* | Tüm `users` tablosuna toplu kampanya maili/SMS atmak, izin tarihini kaydetmemek veya mail altbilgisinde çıkış linki bulundurmamak. | Gönderim sorgusuna `WHERE marketing_consent = true AND unsubscribed_at IS NULL` şartı koy, izin/ret zaman damgasını İYS uyumlu kaydet ve her iletide tek tıkla `List-Unsubscribe` sun. |
| **05** | **Ödeme, Abonelik & Mesafeli Satış**<br>*(6502 TKHK m.48 / EU 2011/83)* | Kullanıcıyı doğrudan Stripe/iyzico ödeme ekranına yönlendirip Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi onayını kaydetmemek. | Ödeme tetiklenmeden önce Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi onayını al, sözleşme metninin SHA-256 özetiyle birlikte `contract_acceptances` tablosuna kaydet; abonelikte fiyat, yenileme tarihi ve iptal yolunu açıkça yaz. |
| **06** | **Yurt Dışı Veri Aktarımı & Font/CDN**<br>*(KVKK m.9 / GDPR Art. 44 / LG München)* | `fonts.googleapis.com`, `cdnjs` veya harici CDN'lerden tarayıcı üzerinden doğrudan font/betik yükleyerek ziyaretçi IP'sini yurt dışına sızdırmak. | Tüm fontları projeye dahil ederek kendi sunucunda barındır (`next/font/local` veya yerel `.woff2`); 3. taraf harici istekleri sunucu vekili (proxy) üzerinden geçir veya açık rızaya bağla. |
| **07** | **Çerez (Cookie) & İzleyici Yönetimi**<br>*(KVKK Çerez Rehberi / ePrivacy)* | Sayfa açılır açılmaz Google Analytics, Meta Pixel, Hotjar veya Clarity betiklerini çalıştırmak; çerez banner'ında "Reddet" butonunu gizlemek. | Zorunlu olmayan tüm betikleri `consent.analytics === true` kontrolü arkasına al; çerez banner'ında **"Kabul Et"** ve **"Tümünü Reddet"** butonlarını aynı ekranda, eşit boyut ve kontrastta göster (*No Dark Patterns*). |
| **08** | **Silme, Anonimleştirme & DSAR**<br>*(KVKK m.7, m.11 / GDPR Art. 15-20)* | "Hesabımı Sil" butonunda yalnızca `is_active = false` yapıp tüm PII verisini süresiz tutmak veya veri indirme (export) imkanı sunmamak. | Kullanıcıya verilerini JSON/CSV olarak indirme (`/api/privacy/export`) ve hesabını silme (`/api/privacy/delete-account`) uç noktaları sun; saklama süresi dolan PII verilerini kriptografik olarak anonimleştir. |
| **09** | **Özel Nitelikli Kişisel Veriler**<br>*(KVKK m.6, Kurul 2018/10 / GDPR Art. 9)* | Sağlık, biyometrik, cinsel hayat, din, ırk veya ceza mahkûmiyeti verilerini standart metin sütunlarında (`TEXT`) düz metin olarak saklamak. | Özel nitelikli verileri uygulama katmanında **AES-256-GCM** ile zarf şifrelemesine (envelope encryption) tabi tut, anahtarları KMS/HSM'de sakla ve her okuma işlemini denetim loguna yaz. |
| **10** | **72 Saat Veri İhlali & Denetim Logu**<br>*(KVKK m.12/5, 2019/10 / GDPR Art. 33)* | Yetkisiz erişim ve veri sızıntılarını tespit edecek erişim/hata kaydı tutmamak ve projede veri ihlali müdahale planı bulundurmamak. | Kritik veri erişimlerini değişmez (append-only) `audit_logs` tablosuna kaydet ve depoda 72 saatlik Kurul/Otorite bildirim prosedürünü içeren `docs/veri-ihlali-mudahale-plani.md` dosyasını hazır tut. |
| **11** | **Loglarda PII Maskeleme (Minimizasyon)**<br>*(KVKK m.4/2-ç / GDPR Art. 5(1)(c))* | `console.log(req.body)` veya Sentry/Datadog hata kayıtlarına TC Kimlik No, e-posta, telefon, açık IP, parola veya kredi kartı basmak. | Yapılandırılmış loglayıcıda (Pino/Winston) deterministik PII maskeleme (`redact`) katmanı kullan; e-posta, telefon, TCKN ve token alanlarını loga yazmadan önce maskele. |
| **12** | **Yapay Zeka (LLM) & Otomatik Karar**<br>*(KVKK m.9, m.11/1-g / GDPR Art. 22)* | Gerçek kullanıcı PII verilerini (ad, TCKN, telefon, sağlık bilgisi) doğrudan harici LLM API'lerine (OpenAI, Anthropic, Gemini) göndermek. | Harici AI çağrılarından önce PII verilerini sözde-anonimleştir (`<PERSON_1>`, `<PHONE_1>`), eğitim için veri kullanımını kapat (Zero Data Retention) ve otomatik skorlama/red kararlarına "İnsan Müdahalesi / İtiraz" hakkı ekle. |

---

## ⚖️ Hukukçu Gözüyle Derinlemesine Mevzuat ve Mimari Planlama

Bir yazılım projesini sıfırdan tasarlarken veya mevcut kodu incelerken AI ajanı aşağıdaki **4 Temel Hukuki Doktrin** üzerinden mimari kurguyu denetler:

### 1. Hukuki Sebep Analizi: "Her Şey İçin Açık Rıza Almak" Hukuka Aykırıdır!
* **KVKK m.5/2 ve GDPR Art. 6(1)** uyarınca kanunda öngörülen diğer hukuki sebeplerden biri varsa (örneğin **sözleşmenin kurulması veya ifası** — kullanıcı kaydı, sipariş teslimatı, fatura kesimi), ayrıca açık rıza alınması **hukuken geçersiz ve yanıltıcıdır**.
* Çünkü açık rıza **her zaman geri alınabilir** (KVKK m.5 / GDPR Art. 7(3)). Eğer fatura kesmek veya üye kaydı yapmak için açık rızaya dayanırsanız, kullanıcı rızasını geri çektiğinde faturayı silmeniz gerekir ki bu da **213 sayılı Vergi Usul Kanunu (VUK)** ve **6102 sayılı Türk Ticaret Kanunu (TTK)** (10 yıl saklama zorunluluğu) ile çelişir!
* **Mühendislik Kuralı:**
  * **Kayıt / Sipariş / Fatura Formu:** Hukuki sebep `CONTRACT` (KVKK m.5/2-c) ve `LEGAL_OBLIGATION` (KVKK m.5/2-ç). Yalnızca **Aydınlatma Metni** sunulur; açık rıza checkbox'ı **konulmaz**.
  * **Pazarlama / Bülten / Kampanya / Profilleme / Yurt Dışı Pazarlama Araçları:** Hukuki sebep `EXPLICIT_CONSENT` (KVKK m.5/1, 6563 ETK m.6). **Ayrı, opsiyonel ve varsayılan olarak boş** checkbox konulur.

### 2. İspat Yükü (Burden of Proof — GDPR Art. 7(1) & KVKK Kurul Kararları)
* Veri sorumlusu, ilgili kişinin hangi tarihte, hangi IP adresinden, **aydınlatma metninin ve açık rıza metninin hangi versiyonuna (`v1.2` vb.)** onay verdiğini teknik olarak ispatlamak zorundadır.
* Veritabanında yalnızca `users.marketing_consent = true` şeklinde tek bir boolean sütun tutmak **ispat yükünü karşılamaz**!
* **Mühendislik Kuralı:** Her projede ayrı bir `consent_logs` (veya `user_consents`) tablosu oluşturulmalı ve her onay/ret işlemi `consent_type`, `granted`, `policy_version`, `policy_sha256`, `ip_address`, `user_agent`, `created_at` alanlarıyla **append-only (değiştirilemez tarihçe)** olarak saklanmalıdır.

### 3. Yurt Dışına Veri Aktarımı (KVKK m.9 — 2024/2026 Yeni Rejim & GDPR Schrems II)
* **Tarayıcı Kaynaklı (Client-Side) Sızıntılar:** Kullanıcının tarayıcısı `fonts.googleapis.com`, `fonts.gstatic.com`, `cdn.jsdelivr.net`, `www.googletagmanager.com` veya `connect.facebook.net` adresine bağlandığı anda kullanıcının **IP adresi, tarayıcı parmak izi (User-Agent) ve ziyaret ettiği URL** yurt dışındaki sunuculara aktarılır.
  * *Emsal Karar:* Münih Bölge Mahkemesi (*LG München, 20.01.2022, Az. 3 O 17493/21*), Google Fonts'u uzaktan yükleyen bir web sitesinin ziyaretçi IP adresini izinsiz ABD'ye aktardığına hükmederek site sahibini tazminata mahkûm etmiştir.
* **Sunucu Kaynaklı (Server-Side) Aktarımlar:** Veritabanının (Supabase, Firebase, AWS RDS, MongoDB Atlas), e-posta servisinin (Resend, SendGrid, Mailgun) veya hata takip servisinin (Sentry) AB/Türkiye dışındaki veri merkezlerinde barındırılması KVKK m.9 kapsamında **Yurt Dışına Veri Aktarımıdır**.
  * **KVKK m.9 (2024/2026 Reformu):** Yeterlilik kararı bulunmayan ülkelere aktarımda **Standart Sözleşme (SCC)** imzalanması ve imzadan itibaren **5 iş günü içinde KVK Kurumu'na bildirilmesi** zorunludur; aksi halde m.18/1-d uyarınca idari para cezası uygulanır.

### 4. Saklama Süreleri ve Periyodik İmha (KVKK m.7 & Kişisel Verilerin Silinmesi Yönetmeliği)
* Türkiye mevzuatında temel yasal saklama süreleri kod içindeki **TTL / Retention** kurallarına doğrudan yansıtılmalıdır:
  * **Ticari Defter, Fatura ve Ödeme Kayıtları (TTK m.82 / VUK m.253):** **10 Yıl** (VUK için 5 yıl, TTK için 10 yıl — pratikte 10 yıl saklanır, ancak pazarlama/profil verisinden izole edilir).
  * **Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Kayıtları (Mesafeli Sözleşmeler Yön. m.20):** **3 Yıl**.
  * **Ticari Elektronik İleti Onay ve Ret Kayıtları (6563 ETK Yön. m.11):** İznin geçerliliği sona erdiği tarihten itibaren **3 Yıl**.
  * **İnternet Trafik ve Erişim Logları (5651 Sayılı Kanun):** **2 Yıl** (Zaman damgalı / bütünlüğü korunmuş olarak).
* **Periyodik İmha Cron Job'ı:** Saklama süresi dolan kişisel veriler, Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik m.11 uyarınca **en geç 6 aylık periyotlarla** çalışan otomatik bir görev (cron/worker) ile silinmeli veya anonimleştirilmelidir.

---

## 💻 Zorunlu Kod ve Mimari Kalıpları (Essential Code Patterns)

### 1. Supabase / PostgreSQL Row Level Security (RLS) ve Anahtar İzolasyonu
```sql
-- ❌ BAD: RLS kapalı tablo — ön yüzdeki anon key ile tüm kullanıcıların verisi okunup değiştirilebilir!
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  phone TEXT,
  tc_identity_no TEXT
);

-- ✅ GOOD: RLS zorunlu olarak açık, en az ayrıcalık (least privilege) politikaları tanımlı
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Kullanıcı yalnızca kendi profilini okuyabilir ve güncelleyebilir
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
```

```typescript
// ❌ BAD: Ön yüz (Client Component / Vite / NEXT_PUBLIC_) içinde service_role anahtarı kullanımı!
// Bu hata tüm RLS kurallarını bypass eder ve KVKK m.12'den 17 Milyon TL'ye kadar ceza doğurur.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! // ❌ KRİTİK İHLAL!
);

// ✅ GOOD: Ön yüzde yalnızca anon key; service_role anahtarı sadece sunucu ortamında ve fail-fast kontrolüyle
// lib/supabase/server-admin.ts (Sadece Server-Side, 'server-only' paketi ile korunmuş)
import "server-only";
import { createClient } from "@supabase/supabase-js";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  throw new Error("FATAL: SUPABASE_SERVICE_ROLE_KEY sunucu ortam değişkeni eksik.");
}
```

---

### 2. Hukuka Uygun Form: Katmanlı Aydınlatma + Granüler Açık Rıza + İspat Kaydı
```tsx
// ❌ BAD:
// 1. Aydınlatma metni ile pazarlama rızası tek kutuda birleştirilmiş (Bundled Consent)
// 2. Varsayılan olarak işaretli (defaultChecked={true})
// 3. Pazarlama rızası kayıt için zorunlu (required) tutulmuş
export function BadSignupForm() {
  return (
    <form>
      <input type="email" name="email" required />
      <label>
        <input type="checkbox" name="terms_and_marketing" defaultChecked={true} required />
        KVKK Aydınlatma Metnini okudum, kabul ediyorum ve tarafıma kampanya maili gönderilmesine onay veriyorum.
      </label>
      <button type="submit">Kayıt Ol</button>
    </form>
  );
}

// ✅ GOOD:
// 1. Katmanlı Aydınlatma Metni (onay kutusu olmadan, doğrudan erişilebilir link ve özet bilgi)
// 2. Pazarlama ve İYS izni tamamen ayrı, varsayılan olarak İŞARETLENMEMİŞ (defaultChecked={false}) ve OPSİYONEL
// 3. Metin versiyonu (privacy_notice_version) gizli alan veya API şeması ile sunucuya iletilir
export function CompliantSignupForm() {
  return (
    <form action="/api/auth/register" method="POST" className="space-y-4">
      <input type="hidden" name="privacy_notice_version" value="2026.11-v1" />

      <div>
        <label htmlFor="email">E-posta Adresi</label>
        <input id="email" type="email" name="email" required autoComplete="email" />
      </div>

      {/* KVKK m.10 & GDPR Art. 13 Katmanlı Aydınlatma Beyanı (Rıza şartına bağlanmaz!) */}
      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border">
        Kişisel verileriniz, üyelik sözleşmesinin kurulması ve ifası hukuki sebebine (KVKK m.5/2-c, GDPR Art. 6/1-b)
        dayanılarak işlenmektedir. Detaylı bilgi ve KVKK m.11 kapsamındaki haklarınız için{" "}
        <a href="/hukuk/aydinlatma-metni" target="_blank" rel="noopener noreferrer" className="underline font-medium">
          Kişisel Verilerin Korunması Aydınlatma Metni
        </a>
        ’ni inceleyebilirsiniz.
      </div>

      {/* 6563 ETK m.6 & KVKK m.5/1 Açık Rıza: Ayrı, Opsiyonel (required YOK) ve İşaretlenmemiş */}
      <div className="space-y-2">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="marketing_email_consent"
            value="true"
            defaultChecked={false}
          />
          <span>
            Tarafıma kampanya, indirim ve ürün duyuruları hakkında ticari elektronik ileti (e-posta)
            gönderilmesine ve iletişim verilerimin{" "}
            <a href="/hukuk/acik-riza-metni" target="_blank" rel="noopener noreferrer" className="underline">
              Ticari İleti Açık Rıza Metni
            </a>{" "}
            kapsamında işlenmesine onay veriyorum. <em>(İsteğe bağlı)</em>
          </span>
        </label>
      </div>

      <button type="submit">Üyeliği Tamamla</button>
    </form>
  );
}
```

```sql
-- ✅ GOOD: GDPR Art. 7(1) ve KVKK İspat Yükü İçin Değiştirilemez (Append-Only) Rıza Kayıt Tablosu
CREATE TABLE public.consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'marketing_email', 'marketing_sms', 'analytics_cookies', 'marketing_cookies', 'cross_border_transfer', 'special_category_data'
  )),
  granted BOOLEAN NOT NULL,
  policy_version TEXT NOT NULL,       -- Örn: "2026.11-v1"
  policy_sha256 TEXT NOT NULL,        -- Onay anındaki metnin SHA-256 özeti (inkâr edilemezlik)
  collection_method TEXT NOT NULL,    -- Örn: "signup_form_web", "cookie_banner", "account_settings"
  ip_address INET,
  user_agent TEXT,
  iys_synced_at TIMESTAMPTZ,          -- 6563 ETK kapsamında İYS'ye bildirim zamanı
  iys_transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;
```

---

### 3. Ticari Elektronik İleti (E-Posta/SMS), İYS ve Tek Tıkla Ret (`RFC 8058 List-Unsubscribe`)
```typescript
// ❌ BAD: Tüm kullanıcılara izin kontrolü olmadan kampanya maili atmak ve çıkış linki koymamak
const allUsers = await db.query("SELECT email FROM users");
for (const u of allUsers.rows) {
  await sendEmail({ to: u.email, subject: "Büyük İndirim!", html: "<p>Hemen alın!</p>" });
}

// ✅ GOOD: Sadece aktif açık rızası olanlara gönderim + RFC 8058 Tek Tıkla Abonelikten Çıkma Başlıkları
import crypto from "node:crypto";

function createUnsubscribeToken(userId: string, email: string): string {
  const secret = process.env.UNSUBSCRIBE_HMAC_SECRET;
  if (!secret) throw new Error("FATAL: UNSUBSCRIBE_HMAC_SECRET tanımlı değil.");
  const payload = Buffer.from(JSON.stringify({ sub: userId, email, iat: Date.now() })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export async function sendMarketingCampaign(campaignId: string) {
  // Yalnızca açık rızası olan ve abonelikten çıkmamış kullanıcıları seç
  const recipients = await db.query(`
    SELECT u.id, u.email, c.created_at AS consent_date, c.policy_version
    FROM public.users u
    INNER JOIN public.user_marketing_preferences c ON c.user_id = u.id
    WHERE c.email_opt_in = true
      AND c.unsubscribed_at IS NULL
  `);

  for (const recipient of recipients.rows) {
    const token = createUnsubscribeToken(recipient.id, recipient.email);
    const unsubscribeUrl = `https://${process.env.APP_DOMAIN}/api/marketing/unsubscribe?token=${token}`;

    await mailer.send({
      to: recipient.email,
      subject: "Kasım Ayı Ürün Güncellemeleri",
      headers: {
        // RFC 8058: Gmail, Apple Mail ve Outlook'ta üst barda "Abonelikten Çık" butonu çıkarır
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      html: `
        <p>Merhaba, yeni özelliklerimizi inceleyin...</p>
        <hr />
        <footer style="font-size:12px;color:#666;">
          Bu e-posta, ${new Date(recipient.consent_date).toLocaleDateString("tr-TR")} tarihinde verdiğiniz
          ticari elektronik ileti iznine istinaden gönderilmiştir. Dilediğiniz zaman ücretsiz olarak
          <a href="${unsubscribeUrl}">buraya tıklayarak e-posta listesinden ayrılabilirsiniz</a>.
        </footer>
      `,
    });
  }
}
```

---

### 4. 6502 TKHK Uyumlu Ödeme ve Abonelik Akışı (Ön Bilgilendirme & Mesafeli Satış)
```typescript
// ❌ BAD: Sözleşme onayı ve abonelik şartları doğrulanmadan doğrudan ödeme oturumu başlatmak
export async function POST_BadCheckout(req: Request) {
  const { planId } = await req.json();
  const session = await stripe.checkout.sessions.create({ /* ... */ });
  return Response.json({ url: session.url });
}

// ✅ GOOD: Ön Bilgilendirme Formu + Mesafeli Satış Sözleşmesi + Otomatik Yenileme Şartı Doğrulaması ve Kanıt Kaydı
import crypto from "node:crypto";
import { z } from "zod";

const CheckoutConsentSchema = z.object({
  planId: z.string().min(1),
  acceptedPreInfoForm: z.literal(true, {
    errorMap: () => ({ message: "Ön Bilgilendirme Formu onaylanmadan ödeme adımına geçilemez (6502 TKHK m.48)." }),
  }),
  acceptedDistanceSalesContract: z.literal(true, {
    errorMap: () => ({ message: "Mesafeli Satış Sözleşmesi onaylanmadan ödeme adımına geçilemez." }),
  }),
  contractTextSnapshot: z.string().min(100), // Kullanıcıya o an gösterilen dinamik sözleşme metni (fiyat, tarih, cayma hakkı dahil)
});

export async function POST_CompliantCheckout(req: Request) {
  const user = await requireAuthenticatedUser(req);
  const body = CheckoutConsentSchema.parse(await req.json());

  const contractSha256 = crypto
    .createHash("sha256")
    .update(body.contractTextSnapshot, "utf8")
    .digest("hex");

  // 3 yıl boyunca (Mesafeli Sözleşmeler Yön. m.20) saklanacak hukuki kanıt kaydı
  await db.query(
    `INSERT INTO public.contract_acceptances
      (user_id, plan_id, pre_info_accepted, distance_contract_accepted, contract_sha256, contract_snapshot, ip_address, user_agent)
     VALUES ($1, $2, true, true, $3, $4, $5, $6)`,
    [
      user.id,
      body.planId,
      contractSha256,
      body.contractTextSnapshot,
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      req.headers.get("user-agent") ?? null,
    ]
  );

  // Kanıt kaydedildikten sonra ödeme sağlayıcısına yönlendir
  const session = await createPaymentSession(user, body.planId);
  return Response.json({ checkoutUrl: session.url });
}
```

---

### 5. Yurt Dışı IP Sızıntısını Önleme: Yerel Fontlar (`next/font/local`) ve Rıza Kapılı Analitik
```html
<!-- ❌ BAD: Ziyaretçinin tarayıcısından doğrudan Google sunucularına bağlanarak IP adresini yurt dışına aktarır! -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

```tsx
// ✅ GOOD (Next.js / React):
// 1. Fontlar kendi sunucumuzdan (.woff2) sunulur; Google sunucularına hiçbir tarayıcı isteği gitmez.
// 2. Analitik betikleri yalnızca kullanıcı Çerez Banner'ında "Analitik Çerezleri Kabul Et" dedikten sonra yüklenir.
import localFont from "next/font/local";
import { ConsentGatedAnalytics } from "@/components/privacy/ConsentGatedAnalytics";

const inter = localFont({
  src: [
    { path: "../public/fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Inter-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/Inter-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        {children}
        {/* Kullanıcı açık rıza vermedikçe DOM'a hiçbir 3. taraf takip kodu enjekte edilmez */}
        <ConsentGatedAnalytics />
      </body>
    </html>
  );
}
```

---

### 6. İlgili Kişi Hakları (KVKK m.7, m.11 & GDPR Art. 17, 20): Veri Taşınabilirliği ve Kriptografik Anonimleştirme
```typescript
// ❌ BAD: Hesap silme talebinde sadece "deleted_at = now()" yapıp ad, e-posta, telefon ve IP kayıtlarını açık tutmak
await db.query("UPDATE users SET deleted_at = now() WHERE id = $1", [userId]);

// ✅ GOOD:
// 1. Yasal saklama zorunluluğu olmayan tüm kişisel verileri kalıcı olarak siler.
// 2. Fatura/Sipariş gibi VUK/TTK gereği 10 yıl saklanması zorunlu kayıtlardaki kullanıcı bağını koparır ve
//    aktif sistemden erişimi kapatarak karantina/arşiv şemasına taşır (KVKK Silme Yönetmeliği m.8-9).
export async function executeRightToErasure(userId: string, requestId: string) {
  await db.transaction(async (tx) => {
    // 1. Pazarlama, oturum, profil ve tercih verilerini tamamen imha et
    await tx.query("DELETE FROM public.user_marketing_preferences WHERE user_id = $1", [userId]);
    await tx.query("DELETE FROM public.user_sessions WHERE user_id = $1", [userId]);

    // 2. Ana kullanıcı kaydındaki PII alanlarını geri döndürülemez biçimde anonimleştir
    const anonymizedEmail = `deleted-${crypto.randomUUID()}@anonymized.local`;
    await tx.query(
      `UPDATE public.users
       SET email = $2,
           full_name = 'ANONIM_KULLANICI',
           phone = NULL,
           avatar_url = NULL,
           ip_address = NULL,
           is_anonymized = true,
           anonymized_at = now()
       WHERE id = $1`,
      [userId, anonymizedEmail]
    );

    // 3. KVKK m.13 / GDPR Art. 12 kapsamında DSAR talebinin yerine getirildiğini denetim izine kaydet
    await tx.query(
      `INSERT INTO public.audit_logs (actor_id, action, resource_type, resource_id, metadata)
       VALUES ($1, 'DSAR_ERASURE_COMPLETED', 'user', $1, $2)`,
      [userId, JSON.stringify({ dsar_request_id: requestId, retention_basis: "Kişisel Verilerin Silinmesi Yön. m.7" })]
    );
  });
}
```

---

### 7. Loglarda ve Harici Yapay Zeka (LLM) Çağrılarında Zorunlu PII Maskeleme
```typescript
// ❌ BAD: Kullanıcı verisini ve hata nesnesini maskelemeden loglamak veya doğrudan OpenAI/Gemini API'sine göndermek
console.log("Kayıt isteği alındı:", req.body);
const aiReply = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: `Müşteri: ${user.fullName}, TCKN: ${user.tckn}, Mesaj: ${user.message}` }],
});

// ✅ GOOD: Deterministik PII Maskeleme (TCKN, E-posta, Telefon, IBAN, Kredi Kartı, IP)
export function maskPII(input: string): string {
  return input
    // TC Kimlik No (11 haneli)
    .replace(/\b[1-9][0-9]{10}\b/g, "[REDACTED_TCKN]")
    // TR IBAN
    .replace(/\bTR[0-9]{2}\s?(?:[0-9]{4}\s?){5}[0-9]{2}\b/gi, "[REDACTED_IBAN]")
    // Kredi Kartı (16 haneli PAN)
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, "[REDACTED_CARD]")
    // E-posta Adresi
    .replace(/([a-zA-Z0-9._%+-]{1,2})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "$1***@$2")
    // TR Cep Telefonu
    .replace(/(?:\+90|0)?\s?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, "[REDACTED_PHONE]");
}
```

---

## 🕵️‍♂️ Yayına Almadan Önce Otomatik Uyum Denetim Protokolü (Pre-Launch Audit Workflow)

Kullanıcı bir projede **"KVKK / GDPR denetimi yap"**, **"yayına almadan önce uyum kontrolü yap"** veya **"hukuki riskleri raporla"** dediğinde AI ajanı **önce hiçbir dosyayı değiştirmeden** aşağıdaki **10 Maddelik Denetim Protokolünü** çalıştırır ve bulguları standart tabloyla raporlar:

1. **Veritabanı & Supabase RLS Kontrolü:**
   * `public` şemasındaki tüm tablolarda `ENABLE ROW LEVEL SECURITY` açık mı?
   * RLS açık olduğu halde hiçbir `CREATE POLICY` tanımlanmamış veya `USING (true)` ile herkese yazma/okuma açılmış tablo var mı?
   * Ön yüz kodlarında (`NEXT_PUBLIC_`, `VITE_`, `PUBLIC_`, `src/`) `service_role` anahtarı veya gizli veritabanı URI'si var mı?
2. **Formlar & Aydınlatma / Açık Rıza Ayrımı Kontrolü:**
   * Kişisel veri toplayan her formda (kayıt, giriş, iletişim, bülten, kariyer/CV, yorum) **Aydınlatma Metni** bağlantısı var mı?
   * Aydınlatma metni yanlışlıkla checkbox ile "onay" şartına mı bağlanmış?
   * Pazarlama / ticari ileti izni, **varsayılan olarak işaretlenmemiş (`checked={false}`)**, **zorunlu olmayan (`required` içermeyen)** ayrı bir kutuyla mı alınıyor?
   * Alınan açık rızaların versiyon, zaman damgası ve IP kanıtı `consent_logs` tablosuna kaydediliyor mu?
3. **Ticari Elektronik İleti (E-Posta / SMS) & İYS Kontrolü:**
   * Kampanya veya bülten gönderen kodlarda yalnızca izin vermiş (`opt_in = true`) ve ayrılmamış (`unsubscribed_at IS NULL`) alıcılar filtreleniyor mu?
   * İzin tarihi ve kaynağı kaydediliyor mu? İYS (İleti Yönetim Sistemi) senkronizasyonu veya dışa aktarım yapısı var mı?
   * Gönderilen her pazarlama mailinde tek tıkla abonelikten çıkma linki ve `List-Unsubscribe` başlığı var mı?
4. **Ödeme, E-Ticaret ve Abonelik (6502 TKHK) Kontrolü:**
   * Ödeme alınmadan önce **Ön Bilgilendirme Formu** ve **Mesafeli Satış Sözleşmesi** gösterilip onay kanıtı kaydediliyor mu?
   * Abonelik ekranlarında toplam fiyat, yenileme periyodu, otomatik yenileme tarihi ve kolay iptal yöntemi karanlık tasarım kalıbı (*dark pattern*) olmadan açıkça yazıyor mu?
5. **Veri İhlali Hazırlığı & 72 Saat Bildirim Planı Kontrolü:**
   * Kritik veri erişimleri ve kimlik doğrulama hataları için denetim kaydı (`audit_logs`) tutuluyor mu?
   * Bir veri sızıntısında **72 saat içinde KVK Kurulu'na (Karar 2019/10) ve GDPR Denetim Otoritesine (Art. 33)** bildirim için kimin ne yapacağını içeren `docs/veri-ihlali-mudahale-plani.md` (veya `docs/veri-ihlali.md`) dosyası mevcut mu? *(Yoksa ajan taslağı hemen önerir).*
6. **Yurt Dışına Veri Aktarımı & Harici Varlıklar Kontrolü:**
   * `fonts.googleapis.com`, `fonts.gstatic.com`, harici CDN'ler, Google Analytics, Meta Pixel, Hotjar vb. betikler ziyaretçinin tarayıcısından doğrudan yurt dışı sunuculara mı yükleniyor?
   * Fontların yerelde barındırılması (`next/font/local` / self-hosted `.woff2`) ve takip kodlarının çerez rıza kapısına (`ConsentGate`) bağlanması sağlanmış mı?
7. **Çerez (Cookie) Banner & Önceden Rıza Kontrolü:**
   * Çerez banner'ında **"Kabul Et"** ve **"Reddet"** butonları ilk katmanda eşit görsel ağırlıkta sunuluyor mu?
   * Oturum/kimlik çerezlerinde `HttpOnly`, `Secure` ve `SameSite=Lax/Strict` bayrakları eksiksiz mi?
8. **İlgili Kişi Hakları (DSAR — Silme & Veri Taşınabilirliği) Kontrolü:**
   * Kullanıcının kendi verilerini indirebileceği (JSON/CSV export) ve hesabını silebileceği/anonimleştirebileceği uç noktalar mevcut mu?
9. **Özel Nitelikli Kişisel Veriler & Şifreleme Kontrolü:**
   * Sağlık, biyometrik, TCKN veya finansal veriler işleniyorsa uygulama katmanı şifrelemesi (AES-256-GCM) ve erişim kısıtlaması var mı?
10. **Loglama Hijyeni & Yapay Zeka (LLM) PII Maskeleme Kontrolü:**
    * `console.log`, uygulama logları veya hata izleyicilere (Sentry vb.) düz metin PII sızıyor mu?
    * Harici LLM API'lerine (OpenAI, Anthropic, Gemini) gönderilen istemlerde (prompt) gerçek kullanıcı PII verileri maskeleniyor mu?

### 📊 Zorunlu Denetim Çıktı Tablosu Formatı

Ajan denetim sonunda bulgularını **mutlaka** aşağıdaki tablo formatında sunar (hukuki tavsiye yerine somut teknik bulgu ve mevzuat referansı yazar):

| Madde | Mevzuat Dayanağı | Durum | Dosya ve Satır | Teknik Bulgu & Önerilen Düzeltme |
| :--- | :--- | :-: | :--- | :--- |
| **1. Veritabanı & RLS** | KVKK m.12 / GDPR Art. 32 | ❌ **RİSK** / ⚠️ **EKSİK** / ✅ **TAMAM** | `supabase/migrations/001.sql:14` | `public.orders` tablosunda RLS kapalı. `ENABLE ROW LEVEL SECURITY` ve kullanıcı bazlı `POLICY` eklenmeli. |
| **2. Formlar & Rıza** | KVKK m.5, m.10 / GDPR Art. 7 | ... | `src/components/Register.tsx:42` | Pazarlama onay kutusu `defaultChecked` olarak gelmiş ve aydınlatma metniyle birleştirilmiş. Ayrıştırılmalı. |
| **3. E-Posta & İYS** | 6563 ETK m.6 / CAN-SPAM | ... | `src/jobs/newsletter.ts:19` | Abonelikten çıkma linki ve `List-Unsubscribe` başlığı eksik; `consent_logs` kontrolü eklenmeli. |
| **4. Ödeme & Sözleşme**| 6502 TKHK m.48 | ... | `src/app/checkout/page.tsx:88` | Ödeme öncesi Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi onay kaydı bulunmuyor. |
| **5. 72 Saat İhlal Planı**| KVKK m.12/5 (2019/10) / GDPR Art. 33 | ... | `docs/veri-ihlali-mudahale-plani.md` | Veri ihlali müdahale planı ve `audit_logs` tablosu eksik; şablon oluşturulmalı. |
| **6. Yurt Dışı Aktarım**| KVKK m.9 / GDPR Art. 44 | ... | `src/app/layout.tsx:12` | Google Fonts CDN üzerinden yükleniyor (IP sızıntısı). `next/font/local` ile yerel sunuma geçilmeli. |

---

## 📄 Hazır Uyum Şablonları (Ready-to-Generate Templates)

Denetim sırasında projede `docs/veri-ihlali-mudahale-plani.md` (veya `docs/veri-ihlali.md`) dosyası yoksa AI ajanı kullanıcı onayını alarak aşağıdaki standart şablonu projeye ekler:

<details>
<summary><strong>📌 Şablon: <code>docs/veri-ihlali-mudahale-plani.md</code> (72 Saatlik KVKK & GDPR Veri İhlali Müdahale Planı)</strong></summary>

```markdown
# 🚨 Kişisel Veri İhlali Müdahale ve 72 Saat Bildirim Planı

**Yasal Dayanak:** 6698 Sayılı KVKK m.12/5, KVK Kurulu 24.01.2019 tarih ve 2019/10 sayılı Kararı ve AB GDPR Madde 33-34.

## 1. Kritik Süre Kuralı (72 Saat)
Veri ihlalinin (yetkisiz erişim, veri sızıntısı, fidye yazılımı, yanlış yapılandırılmış RLS/S3 kovası vb.) **öğrenildiği andan itibaren gecikmeksizin ve en geç 72 SAAT içinde** Kişisel Verileri Koruma Kuruluna (ve kapsam dahilindeyse ilgili GDPR Denetim Otoritesine) bildirim yapılması yasal zorunluluktur.

## 2. Müdahale Ekibi ve Sorumluluklar
| Rol | Sorumlu Kişi / Birim | İletişim | Görev Tanımı |
| :--- | :--- | :--- | :--- |
| **Olay Müdahale Lideri** | `[Ad Soyad / CTO]` | `[Tel / E-posta]` | Teknik izolasyon, sızıntının durdurulması, logların dondurulması. |
| **Veri Sorumlusu İrtibat Kişisi** | `[Ad Soyad / VERBİS İrtibat]` | `[Tel / E-posta]` | KVKK Veri İhlali Bildirim Modülü üzerinden resmi bildirimin yapılması. |
| **Hukuk Müşaviri / DPO** | `[Ad Soyad / Hukuk]` | `[Tel / E-posta]` | KVK Kurulu İhlal Bildirim Formunun ve ilgili kişi tebligat metninin hazırlanması. |

## 3. Saat Saat Eylem Planı (0. Saat – 72. Saat)

### ⏱️ 0 – 4. Saat: Tespit, İzolasyon ve Kanıt Koruma
1. İhlale sebep olan erişim anahtarlarını (`service_role`, JWT secret, API key) derhal iptal et ve döndür (rotate).
2. Etkilenen veritabanı tablosu veya uç noktayı geçici bakım moduna al; RLS politikalarını doğrula.
3. **Logları Silme!** `audit_logs`, sunucu erişim kayıtları ve veritabanı WAL kayıtlarının SHA-256 özetini alarak salt-okunur (immutable) yedeğini oluştur.

### ⏱️ 4 – 24. Saat: Etki ve Kapsam Analizi
1. İhlalden etkilenen **kişi sayısını** ve **kişisel veri kategorilerini** (Kimlik, İletişim, Müşteri İşlem, Finans, Özel Nitelikli Veri) `audit_logs` üzerinden tespit et.
2. İhlalin gerçekleşme zamanını ve tespit edilme zamanını dakika bazında kayıt altına al.

### ⏱️ 24 – 48. Saat: Resmi Bildirim Hazırlığı
1. KVKK **Kişisel Veri İhlali Bildirim Formu**'nu doldur (Tüm detaylar henüz netleşmemişse KVK Kurulu 2019/10 kararı uyarınca mevcut bilgilerle **aşamalı bildirim** başlat).
2. İhlalden etkilenen kullanıcılara gönderilecek şeffaf bildirim metnini hazırla (İhlalin niteliği, olası sonuçları, alınan önlemler ve kullanıcının alabileceği tedbirler — örn. parola sıfırlama).

### ⏱️ 48 – 72. Saat: Kurul Bildirimi ve İlgili Kişi Tebligatı
1. **KVKK Bildirimi:** `https://ihlalbildirimi.kvkk.gov.tr/` adresi üzerinden resmi bildirimi tamamla ve başvuru takip numarasını arşivle.
2. **İlgili Kişi Bildirimi:** Etkilenen kişilerin iletişim adreslerine ulaşılabiliyorsa doğrudan (e-posta/SMS), ulaşılamıyorsa web sitesi ana sayfasından açık duyuru ile bildirim yap.
```
</details>

---

## 🔗 Kaynaklar ve Yasal Referanslar (References & Legal Sources)

* **KVKK (6698 Sayılı Kanun & 2026 İdari Para Cezası Tutarları):** [kvkk.gov.tr — 6698 Sayılı Kanun İdari Para Cezaları](https://www.kvkk.gov.tr/Icerik/8145/6698-sayili-kisisel-verilerin-korunmasi-kanunu-kapsaminda-idari-para-cezasi-tutarlari)
* **KVKK 72 Saat Veri İhlali Bildirimi (2019/10 Sayılı Kurul Kararı):** [kvkk.gov.tr — Veri İhlali Bildirimi Rehberi](https://www.kvkk.gov.tr/Icerik/5362/Veri-Ihlali-Bildirimi)
* **KVKK Çerez Uygulamaları Hakkında Rehber:** [kvkk.gov.tr — Çerez Rehberi](https://www.kvkk.gov.tr/Icerik/7353/Cerez-Uygulamalari-Hakkinda-Rehber)
* **AB Genel Veri Koruma Tüzüğü (GDPR — Regulation EU 2016/679):** [gdpr-info.eu](https://gdpr-info.eu/)
* **İleti Yönetim Sistemi (6563 Sayılı ETK & Ticari Elektronik İleti Mevzuatı):** [iys.org.tr](https://iys.org.tr/)
* **Supabase Row Level Security (RLS) Güvenlik Rehberi:** [supabase.com/docs/guides/database/postgres/row-level-security](https://supabase.com/docs/guides/database/postgres/row-level-security)
* **FTC CAN-SPAM Compliance Guide:** [ftc.gov — CAN-SPAM Act Guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
* **Pratik Kontrol Listesi İlham Kaynağı:** [CodeBaseHub #6977 — Uyum ve Güvenlik Kontrol Rehberi](https://www.codebasehub.pro/tr/source/6977)
* **Ekosistem & Güvenlik Entegrasyonu:** **[VibeCoding Security Rules](https://github.com/melihkarasu/vibecoding-security-rules)** & **[Web Security Scanner](https://github.com/melihkarasu/web-security-scanner)** ([Melih Karasu](https://github.com/melihkarasu)).

> *Not: Bu yetenek dosyası (Skill) yazılım geliştirme ve kod denetimi süreçlerinde Privacy-by-Design (Tasarımdan İtibaren Gizlilik) ilkelerini teknik olarak uygulamak amacıyla hazırlanmıştır. Somut uyuşmazlıklarda resmi hukuki mütalaa yerine geçmez.*
