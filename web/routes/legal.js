module.exports = function registerLegalRoutes(app, pageTemplate) {
  const renderLegalNav = (activeSlug) => `
    <div class="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-mistral-beige-deep/80">
      <a href="/aydinlatma-metni" class="vibe-btn vibe-btn-sm ${activeSlug === 'aydinlatma-metni' ? 'vibe-btn-primary' : 'vibe-btn-secondary'}" style="${activeSlug === 'aydinlatma-metni' ? '' : 'background:#FFFFFF !important; color:#0F172A !important; border:1px solid #CBD5E1 !important;'}">
        Aydınlatma Metni
      </a>
      <a href="/gizlilik-politikasi" class="vibe-btn vibe-btn-sm ${activeSlug === 'gizlilik-politikasi' ? 'vibe-btn-primary' : 'vibe-btn-secondary'}" style="${activeSlug === 'gizlilik-politikasi' ? '' : 'background:#FFFFFF !important; color:#0F172A !important; border:1px solid #CBD5E1 !important;'}">
        Gizlilik Politikası
      </a>
      <a href="/cerez-politikasi" class="vibe-btn vibe-btn-sm ${activeSlug === 'cerez-politikasi' ? 'vibe-btn-primary' : 'vibe-btn-secondary'}" style="${activeSlug === 'cerez-politikasi' ? '' : 'background:#FFFFFF !important; color:#0F172A !important; border:1px solid #CBD5E1 !important;'}">
        Çerez Politikası
      </a>
      <a href="/kullanim-kosullari" class="vibe-btn vibe-btn-sm ${activeSlug === 'kullanim-kosullari' ? 'vibe-btn-primary' : 'vibe-btn-secondary'}" style="${activeSlug === 'kullanim-kosullari' ? '' : 'background:#FFFFFF !important; color:#0F172A !important; border:1px solid #CBD5E1 !important;'}">
        Kullanım Koşulları
      </a>
      <button type="button" onclick="window.openVibeCookieModal && window.openVibeCookieModal()" class="vibe-btn vibe-btn-sm cursor-pointer" style="background:#FFF7ED !important; color:#EA580C !important; border:1px solid #FDBA74 !important; font-weight:600 !important;">
        Çerez Tercihleri
      </button>
    </div>
  `;

  // Legacy /test* redirects to clean live routes
  app.get(['/test', '/test/'], (req, res) => res.redirect(301, '/'));
  app.get(['/test/kullanim-kosullari', '/test/kullanim-kosullari/'], (req, res) => res.redirect(301, '/kullanim-kosullari'));
  app.get(['/test/gizlilik-politikasi', '/test/gizlilik-politikasi/'], (req, res) => res.redirect(301, '/gizlilik-politikasi'));
  app.get(['/test/cerez-politikasi', '/test/cerez-politikasi/'], (req, res) => res.redirect(301, '/cerez-politikasi'));
  app.get(['/test/aydinlatma-metni', '/test/aydinlatma-metni/'], (req, res) => res.redirect(301, '/aydinlatma-metni'));

  // 1. /aydinlatma-metni (KVKK m.10 & GDPR Art. 13 Katmanlı Aydınlatma Metni — Rızaya Tabi Olmayan ve Rızaya Tabi Olan Süreçlerin Net Ayrımı)
  app.get(['/aydinlatma-metni', '/aydinlatma-metni/', '/app/aydinlatma-metni'], (req, res) => {
    const content = `
      <div class="space-y-6">
        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-8 shadow-xs">
          <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-mistral-orange mb-2">VIBE CODED APPS — MK STUDIO</div>
          <h1 class="text-2xl sm:text-4xl font-bold font-editorial text-mistral-ink tracking-tight mb-2">Kişisel Verilerin Korunması Aydınlatma Metni</h1>
          <p class="text-sm sm:text-base text-mistral-slate leading-relaxed max-w-3xl">
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") Madde 10, Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ ve AB Genel Veri Koruma Tüzüğü ("GDPR") Madde 13–14 kapsamında bilgilendirme metnidir. Son güncelleme: 11 Kasım 2026.
          </p>
          ${renderLegalNav('aydinlatma-metni')}
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">1. Veri Sorumlusu ve Aydınlatma Yükümlülüğünün Niteliği</h2>
          <p class="text-sm text-mistral-slate leading-relaxed">
            <strong>app.melihkarasu.com</strong> ("Platform") üzerinde gerçekleştirilen kişisel veri işleme faaliyetleri kapsamında veri sorumlusu <strong>Melih Karasu (MK Studio — Vibe Coded Apps)</strong>'dur. İşbu Aydınlatma Metni bir "açık rıza onayı" değil, yasal bilgilendirme yükümlülüğünün yerine getirilmesidir.
          </p>
          <p class="text-sm text-mistral-slate leading-relaxed">
            KVKK Madde 5/2 ve GDPR Madde 6(1) uyarınca; bir sözleşmenin/hizmetin ifası, kanunlarda açıkça öngörülme veya veri sorumlusunun meşru menfaati kapsamındaki veri işleme süreçleri (zorunlu oturum çerezleri, güvenlik logları ve SSO giriş doğrulaması) açık rızanıza tabi olmaksızın yürütülür ve bu süreçler hakkında işbu metinle şeffaf biçimde bilgilendirilirsiniz. Buna karşılık <strong>analitik ölçümleme, reklam gösterimi ve anlık konum kullanımı</strong> gibi süreçler hem işbu aydınlatmaya tabidir hem de yalnızca sizin <strong>ayrı ve serbest iradeli açık rızanız</strong> bulunması halinde çalıştırılır.
          </p>
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">2. Rıza Aranmaksızın Yasal Sebeplerle İşlenen Veriler (Bilgilendirme Kapsamı)</h2>
          <p class="text-xs sm:text-sm text-mistral-slate">Aşağıdaki veri kategorileri Platform'un güvenli ve işlevsel biçimde çalışması için kanuni istisnalar kapsamında işlenmektedir:</p>
          <div class="overflow-x-auto border border-mistral-beige-deep rounded-xl">
            <table class="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr class="bg-mistral-cream border-b border-mistral-beige-deep text-mistral-ink font-semibold">
                  <th class="p-3.5">Süreç / Veri Kategorisi</th>
                  <th class="p-3.5">İşlenen Veriler &amp; Elde Edilme Yöntemi</th>
                  <th class="p-3.5">İşleme Amacı</th>
                  <th class="p-3.5">Hukuki Sebep (Onay Gerekmez)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200 text-mistral-slate">
                <tr class="hover:bg-stone-50/70">
                  <td class="p-3.5 font-semibold text-mistral-ink">Zorunlu Çerezler ve Yerel Depolama</td>
                  <td class="p-3.5"><code>vibe_token</code>, <code>vibe_refresh_token</code>, <code>vibe_user</code>, <code>vibe_cookie_consent_v1</code> ve uygulama içi durum anahtarları (tarayıcı üzerinden otomatik)</td>
                  <td class="p-3.5">SSO oturumunun sürdürülmesi, sayfa yenilemelerinde oturum korunması ve çerez tercihlerinizin hatırlanması</td>
                  <td class="p-3.5"><strong class="text-mistral-ink">Hizmetin İfası &amp; Meşru Menfaat</strong><br><span class="text-[11px] font-mono">KVKK m.5/2-c, f · ePrivacy m.5/3</span></td>
                </tr>
                <tr class="hover:bg-stone-50/70">
                  <td class="p-3.5 font-semibold text-mistral-ink">Tekil Oturum Açma (Unified SSO)</td>
                  <td class="p-3.5">GitHub veya Google OAuth 2.0 üzerinden aktarılan kullanıcı ID, ad/kullanıcı adı, e-posta ve profil görseli URL'si</td>
                  <td class="p-3.5">Kayıtlı kullanıcılara mikro uygulama erişiminin açılması, favori listesi ve liderlik tablosu skorlarının kullanıcıyla eşleştirilmesi</td>
                  <td class="p-3.5"><strong class="text-mistral-ink">Sözleşmenin / Hizmetin Kurulması ve İfası</strong><br><span class="text-[11px] font-mono">KVKK m.5/2-c · GDPR Art. 6(1)(b)</span></td>
                </tr>
                <tr class="hover:bg-stone-50/70">
                  <td class="p-3.5 font-semibold text-mistral-ink">Bilgi Güvenliği ve Trafik Logları</td>
                  <td class="p-3.5">IP adresi, istek zaman damgası, HTTP metodu/durum kodu ve tarayıcı üst bilgisi (sunucu ağ katmanı üzerinden otomatik)</td>
                  <td class="p-3.5">Siber saldırıların ve hız sınırı (rate-limit) ihlallerinin önlenmesi, sistem güvenliği ve yasal trafik kaydı tutulması</td>
                  <td class="p-3.5"><strong class="text-mistral-ink">Kanunlarda Öngörülme &amp; Hukuki Yükümlülük</strong><br><span class="text-[11px] font-mono">5651 s. Kanun · KVKK m.5/2-a, ç · GDPR Art. 6(1)(c), (f)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">3. Açık Rızanıza Tabi Olarak İşlenen Veriler (Varsayılan Kapalı / Opt-In)</h2>
          <p class="text-xs sm:text-sm text-mistral-slate">Aşağıdaki süreçler sayfa ilk açıldığında <strong>varsayılan olarak kapalıdır</strong>; yalnızca Çerez Tercih Paneli veya tarayıcı izin penceresi üzerinden açık onay vermeniz halinde devreye girer ve dilediğiniz an geri çekilebilir:</p>
          <div class="overflow-x-auto border border-mistral-beige-deep rounded-xl">
            <table class="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr class="bg-mistral-cream border-b border-mistral-beige-deep text-mistral-ink font-semibold">
                  <th class="p-3.5">Süreç / Veri Kategorisi</th>
                  <th class="p-3.5">İşlenen Veriler &amp; Alıcı Grubu</th>
                  <th class="p-3.5">İşleme Amacı</th>
                  <th class="p-3.5">Hukuki Sebep &amp; Kontrol</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200 text-mistral-slate">
                <tr class="hover:bg-stone-50/70">
                  <td class="p-3.5 font-semibold text-mistral-ink">Performans ve Trafik Analitiği</td>
                  <td class="p-3.5"><code>_ga</code>, <code>_ga_*</code> çerez tanımlayıcıları, anonimleştirilmiş IP ile sayfa görüntüleme istatistikleri (Google Ireland Ltd. / Google LLC)</td>
                  <td class="p-3.5">Hangi mikro uygulamaların ilgi gördüğünü ve sayfa performansını anonim olarak ölçmek</td>
                  <td class="p-3.5"><strong class="text-mistral-ink">Açık Rıza</strong><br><span class="text-[11px] font-mono">KVKK m.5/1 &amp; m.9 · GDPR Art. 6(1)(a)</span></td>
                </tr>
                <tr class="hover:bg-stone-50/70">
                  <td class="p-3.5 font-semibold text-mistral-ink">Yan Sütun Reklam Gösterimi</td>
                  <td class="p-3.5"><code>__gads</code>, <code>__gpi</code>, <code>IDE</code> reklam çerezleri ve gösterim/frekans verileri (Google AdSense — Google Ireland Ltd. / Google LLC)</td>
                  <td class="p-3.5">Açık kaynak platformun ücretsiz sürdürülebilirliğini desteklemek üzere geniş ekran yan sütunlarında (Side Rail) reklam sunmak</td>
                  <td class="p-3.5"><strong class="text-mistral-ink">Açık Rıza</strong><br><span class="text-[11px] font-mono">KVKK m.5/1 &amp; m.9 · GDPR Art. 6(1)(a)</span></td>
                </tr>
                <tr class="hover:bg-stone-50/70">
                  <td class="p-3.5 font-semibold text-mistral-ink">Anlık Coğrafi Konum (Geolocation)</td>
                  <td class="p-3.5">Nöbetçi Eczane veya Hava Kalitesi gibi araçlarda tarayıcı izin penceresinden onaylanan anlık enlem/boylam bilgisi</td>
                  <td class="p-3.5">Bulunduğunuz konuma en yakın nöbetçi eczaneyi veya istasyonu listelemek (sunucuda kalıcı profil olarak saklanmaz)</td>
                  <td class="p-3.5"><strong class="text-mistral-ink">Açık Rıza</strong><br><span class="text-[11px] font-mono">KVKK m.5/1 · GDPR Art. 6(1)(a)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">4. Yurt Dışı Veri Aktarımı ve Yerel Barındırma Önlemleri</h2>
          <ul class="list-disc pl-5 space-y-2 text-sm text-mistral-slate leading-relaxed">
            <li><strong>Yazı Tipleri ve Statik Kütüphaneler (Yurt Dışı Aktarım Yoktur):</strong> Platform'da kullanılan tüm yazı tipleri (<code>Newsreader</code>, <code>Inter</code>, <code>JetBrains Mono</code>) ve stil dosyaları doğrudan kendi sunucumuzdan sunulmaktadır; sayfa açılışında Google Fonts veya harici CDN sunucularına ziyaretçi IP adresi aktarılmaz.</li>
            <li><strong>OAuth ve Açık Rızalı Servisler:</strong> Yalnızca GitHub/Google ile giriş yapmayı seçtiğinizde ilgili kimlik sağlayıcısıyla doğrulama gerçekleştirilir; ayrıca çerez panelinden açık rıza vermeniz halinde Google Analytics ve Google AdSense betikleri yüklenir.</li>
          </ul>
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">5. KVKK Madde 11 ve GDPR Madde 15–22 Kapsamındaki Haklarınız</h2>
          <p class="text-sm text-mistral-slate leading-relaxed">
            Veri sahibi (ilgili kişi) olarak her zaman; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde/dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme, KVKK m.7 ve GDPR m.17 çerçevesinde silinmesini veya yok edilmesini isteme, otomatik sistem analizlerine itiraz etme, açık rızaya dayalı tercihlerinizi geri çekme ve Kişisel Verileri Koruma Kurumu'na (KVKK) veya yetkili Veri Koruma Otoritesine şikâyette bulunma haklarına sahipsiniz.
          </p>
          <p class="text-sm text-mistral-slate leading-relaxed">
            Başvurularınızı <a href="https://melihkarasu.com" target="_blank" rel="noopener noreferrer" class="text-mistral-orange underline font-medium">melihkarasu.com</a> üzerindeki iletişim kanalları veya <a href="https://github.com/melihkarasu" target="_blank" rel="noopener noreferrer" class="text-mistral-orange underline font-medium">github.com/melihkarasu</a> üzerinden iletebilirsiniz; talepleriniz niteliğine göre en kısa sürede ve en geç <strong>30 gün</strong> içinde ücretsiz olarak sonuçlandırılır.
          </p>
        </section>
      </div>
    `;
    res.send(pageTemplate('Aydınlatma Metni', content));
  });

  // 2. /kullanim-kosullari
  app.get(['/kullanim-kosullari', '/kullanim-kosullari/', '/app/kullanim-kosullari'], (req, res) => {
    const content = `
      <div class="space-y-6">
        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-8 shadow-xs">
          <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-mistral-orange mb-2">VIBE CODED APPS — MK STUDIO</div>
          <h1 class="text-2xl sm:text-4xl font-bold font-editorial text-mistral-ink tracking-tight mb-2">Kullanım Koşulları</h1>
          <p class="text-sm sm:text-base text-mistral-slate leading-relaxed max-w-3xl">
            Vibe Coded Apps (app.melihkarasu.com) açık kaynak mikro uygulama vitrini kullanım şartları, hizmet kapsamı ve sorumluluk sınırları. Son güncelleme: 11 Kasım 2026.
          </p>
          ${renderLegalNav('kullanim-kosullari')}
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">1. Taraflar, Amaç ve Kapsam</h2>
          <p class="text-sm text-mistral-slate leading-relaxed">
            İşbu Kullanım Koşulları ("Koşullar"), <strong>app.melihkarasu.com</strong> alan adlı internet sitesi ve altında çalışan tüm interaktif mikro web uygulamalarını ("Platform" veya "Vibe Coded Apps") ziyaret eden veya kullanan tüm gerçek ve tüzel kişilerin ("Kullanıcı") Platform'dan yararlanma şartlarını düzenler. Platform'a erişim sağlamanız veya herhangi bir mikro uygulamayı kullanmanız, işbu Koşulları okuduğunuz, anladığınız ve kabul ettiğiniz anlamına gelir.
          </p>
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">2. Platform'un Sunduğu Hizmetler ve Mikro Uygulama Mimarisi</h2>
          <ul class="list-disc pl-5 space-y-2 text-sm text-mistral-slate leading-relaxed">
            <li><strong>2.1. Açık Kaynak Mikro Uygulama Vitrini:</strong> Vibe Coded Apps; kültür-sanat, bilim, coğrafya, veri görselleştirme, günlük bulmaca/oyun, finansal hesaplama, sağlıklı yaşam ve geliştirici araçları kategorilerinde açık veri kaynakları ve genel API'lar üzerine kurulu interaktif web uygulamaları sunan bağımsız bir teknoloji ve portföy platformudur.</li>
            <li><strong>2.2. Tekil Oturum Açma (Unified SSO) Zorunluluğu ve Bağımsız Sürümler:</strong> Platform (<code>app.melihkarasu.com</code>) üzerinde yer alan mikro uygulamaları yalnızca GitHub veya Google hesabı ile (OAuth 2.0 üzerinden) giriş yapmış kullanıcılar kullanabilir. Giriş yapmadan (oturum açmadan) kullanmak isteyen kullanıcılar, uygulamaların açık kaynak <strong>GitHub repolarını</strong> (<a href="https://github.com/melihkarasu" target="_blank" rel="noopener noreferrer" class="text-mistral-orange underline font-medium">github.com/melihkarasu</a>) ve bağımsız <strong>GitHub Pages</strong> sürümlerini kullanabilir.</li>
          </ul>
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">3. Veri Kaynakları ve Profesyonel Tavsiye Niteliği Taşımama (Sorumluluk Sınırı)</h2>
          <ul class="list-disc pl-5 space-y-2 text-sm text-mistral-slate leading-relaxed">
            <li><strong>3.1. Finans, Kripto ve Ekonomi Araçları:</strong> Kripto Trend, Bütçe/Mevduat/Kredi simülatörleri ve döviz/emtia göstergeleri yalnızca genel bilgilendirme ve matematiksel simülasyon amaçlıdır; 6362 sayılı Sermaye Piyasası Kanunu kapsamında <strong>yatırım danışmanlığı veya finansal tavsiye niteliği taşımaz</strong>.</li>
            <li><strong>3.2. Sağlık, Beslenme ve Yaşam Araçları:</strong> DSÖ Sağlık Göstergeleri, E-Kodu / Gıda Katkı Maddesi Çözümleyici, Beden Kitle İndeksi / Kalori araçları ve Doğa Sesleri modülleri kamuya açık bilimsel veri setlerine dayanır; <strong>tıbbi teşhis, tedavi veya hekim tavsiyesi yerine geçmez</strong>.</li>
            <li><strong>3.3. Nöbetçi Eczane, Hava Kalitesi, Deprem ve Ulaşım Verileri:</strong> İlgili mikro uygulamalarda gösterilen veriler resmi/açık kaynak web servislerinden (belediye açık veri portalleri, AFAD/USGS, Open-Meteo, NASA, ISS vb.) anlık veya periyodik olarak çekilmektedir. Kaynak servislerdeki gecikme, kesinti veya veri farklılıklarından Platform sorumlu tutulamaz; acil durumlarda ilgili resmi kurumların birincil kanalları esas alınmalıdır.</li>
          </ul>
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">4. Kullanım Kuralları ve Yasaklı Faaliyetler</h2>
          <p class="text-sm text-mistral-slate leading-relaxed">Kullanıcı, Platform'u kullanırken aşağıdaki kurallara uymayı kabul eder:</p>
          <ul class="list-disc pl-5 space-y-2 text-sm text-mistral-slate leading-relaxed">
            <li>Platform'un sunucu ve servis altyapısına aşırı yük bindirecek, hız sınırlarını (rate limit) aşmaya çalışacak veya hizmeti aksatacak otomatik bot/script istekleri göndermemek,</li>
            <li>Bulmaca ve oyun modüllerindeki (Sudoku, Kelime Oyunu, Satranç vb.) liderlik tablolarına hileli skor göndermemek veya servis isteklerini manipüle etmemek,</li>
            <li>Web güvenlik, mevzuat uyum ve geliştirici araçlarını yalnızca kendi yetkili olduğu alan adları ve eğitim/analiz amaçları doğrultusunda, yürürlükteki Türkiye Cumhuriyeti mevzuatına ve Avrupa Birliği düzenlemelerine uygun şekilde kullanmak.</li>
          </ul>
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">5. Fikri Mülkiyet Hakları ve Uygulanacak Hukuk</h2>
          <ul class="list-disc pl-5 space-y-2 text-sm text-mistral-slate leading-relaxed">
            <li><strong>5.1. Fikri Mülkiyet:</strong> Platform'un özgün yazılım mimarisi, arayüz tasarımı ve MK Studio / Vibe Coded Apps markalaması 5846 sayılı Fikir ve Sanat Eserleri Kanunu (FSEK) kapsamında korunmaktadır. GitHub üzerinde açık kaynak lisansıyla paylaşılan bağımsız modüller ilgili depo lisans koşullarına tabidir.</li>
            <li><strong>5.2. Yetkili Hukuk ve İletişim:</strong> İşbu Koşulların uygulanmasından doğabilecek uyuşmazlıklarda <strong>Türkiye Cumhuriyeti hukuku</strong> uygulanır. Her türlü bildirim ve iletişim için <a href="https://melihkarasu.com" target="_blank" rel="noopener noreferrer" class="text-mistral-orange underline font-medium">melihkarasu.com</a> veya <a href="https://github.com/melihkarasu" target="_blank" rel="noopener noreferrer" class="text-mistral-orange underline font-medium">GitHub (@melihkarasu)</a> üzerinden iletişime geçilebilir.</li>
          </ul>
        </section>
      </div>
    `;
    res.send(pageTemplate('Kullanım Koşulları', content));
  });

  // 3. /gizlilik-politikasi
  app.get(['/gizlilik-politikasi', '/gizlilik-politikasi/', '/app/gizlilik-politikasi'], (req, res) => {
    const content = `
      <div class="space-y-6">
        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-8 shadow-xs">
          <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-mistral-orange mb-2">VIBE CODED APPS — MK STUDIO</div>
          <h1 class="text-2xl sm:text-4xl font-bold font-editorial text-mistral-ink tracking-tight mb-2">Gizlilik Politikası</h1>
          <p class="text-sm sm:text-base text-mistral-slate leading-relaxed max-w-3xl">
            Vibe Coded Apps (app.melihkarasu.com) veri güvenliği mimarisi, istemci tarafı (client-side) işleme ilkeleri ve gizlilik taahhütleri. Son güncelleme: 11 Kasım 2026.
          </p>
          ${renderLegalNav('gizlilik-politikasi')}
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">1. Gizlilik Yaklaşımımız (Privacy by Design &amp; by Default)</h2>
          <p class="text-sm text-mistral-slate leading-relaxed">
            <strong>app.melihkarasu.com</strong> ("Platform"), KVKK Madde 12 ve GDPR Madde 25 kapsamındaki <em>"Tasarımdan İtibaren ve Varsayılan Olarak Veri Koruma"</em> ilkelerine göre inşa edilmiştir. Kişisel verilerinizin hukuki sebeplerine ve veri sahibi haklarınıza ilişkin resmî tablo için ayrıca <a href="/aydinlatma-metni" class="text-mistral-orange underline font-medium">Aydınlatma Metni</a> sayfamızı inceleyebilirsiniz.
          </p>
          <ul class="list-disc pl-5 space-y-2 text-sm text-mistral-slate leading-relaxed">
            <li><strong>İstemci Tarafı (Client-Side) Veri İşleme:</strong> QR üretici, kod/güvenlik tarayıcı, renk/ses stüdyosu, finansal hesaplayıcılar gibi mikro uygulamalarda girdiğiniz metinler ve seçtiğiniz yerel dosyalar doğrudan tarayıcınızın belleğinde işlenir; sunucularımıza kalıcı olarak yüklenmez.</li>
            <li><strong>İzole Veritabanı ve Satır Düzeyinde Güvenlik (RLS):</strong> Oturum açtığınızda favorileriniz ve uygulama içi kayıtlarınız kendi sunucumuzda barındırılan izole Supabase/PostgreSQL altyapısında, kullanıcı kimliğinizle sınırlandırılmış erişim kontrolleri altında saklanır.</li>
            <li><strong>Liderlik Tablolarında Veri Maskeleme:</strong> Günlük bulmaca ve oyun liderlik tablolarında diğer kullanıcılara tam e-posta veya kimlik bilginiz gösterilmez; kullanıcı adları gizlilik odaklı maskeleme ile sunulur.</li>
          </ul>
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">2. Üçüncü Taraf Servisler ve Varsayılan Koruma</h2>
          <ul class="list-disc pl-5 space-y-2 text-sm text-mistral-slate leading-relaxed">
            <li><strong>Yerel Font ve Varlık Sunumu:</strong> Ziyaretçilerin IP adreslerinin sayfa açılışında yurt dışı font/CDN sağlayıcılarına sızmasını önlemek amacıyla tüm yazı tipleri ve stil dosyaları doğrudan kendi sunucumuzdan sunulmaktadır.</li>
            <li><strong>Önceden Rıza Kapısı (Prior Consent Gate):</strong> Google Analytics ve Google AdSense betikleri siz Çerez Tercih Panelinden açık onay verene kadar yüklenmez ve çalıştırılmaz. "Sadece Zorunlular" seçeneğini tercih ettiğinizde bu üçüncü taraf takipçiler tamamen devre dışı kalır.</li>
            <li><strong>Harici Yapay Zeka (BYOK / Maskeleme):</strong> Kullanıcının kendi API anahtarıyla çalıştırdığı yapay zeka analiz modüllerinde kişisel veri maskeleme (PII Redaction) katmanı varsayılan olarak aktiftir.</li>
          </ul>
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">3. Veri Saklama Süreleri, Hesap Silme ve İletişim</h2>
          <ul class="list-disc pl-5 space-y-2 text-sm text-mistral-slate leading-relaxed">
            <li><strong>Saklama Süreleri:</strong> Bilgi güvenliği ve trafik kayıtları 5651 sayılı Kanun gereği azami <strong>2 yıl</strong> saklanır. SSO kullanıcı profili, favoriler ve skor kayıtları kullanıcı hesabının silinmesini talep edene kadar muhafaza edilir.</li>
            <li><strong>Silme ve Başvuru Kanalı:</strong> Hesabınızın ve ilişkili tüm uygulama verilerinizin silinmesi veya taşınması taleplerinizi <a href="https://melihkarasu.com" target="_blank" rel="noopener noreferrer" class="text-mistral-orange underline font-medium">melihkarasu.com</a> üzerindeki iletişim kanalları aracılığıyla iletebilirsiniz; başvurularınız en geç <strong>30 gün</strong> içinde ücretsiz olarak sonuçlandırılır.</li>
          </ul>
        </section>
      </div>
    `;
    res.send(pageTemplate('Gizlilik Politikası', content));
  });

  // 4. /cerez-politikasi
  app.get(['/cerez-politikasi', '/cerez-politikasi/', '/app/cerez-politikasi'], (req, res) => {
    const content = `
      <div class="space-y-6">
        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-8 shadow-xs">
          <div class="text-[11px] font-mono font-bold uppercase tracking-widest text-mistral-orange mb-2">VIBE CODED APPS — MK STUDIO</div>
          <h1 class="text-2xl sm:text-4xl font-bold font-editorial text-mistral-ink tracking-tight mb-2">Çerez ve Yerel Depolama Politikası</h1>
          <p class="text-sm sm:text-base text-mistral-slate leading-relaxed max-w-3xl">
            Platform üzerinde kullanılan çerezler (cookies), tarayıcı yerel depolama alanları (localStorage) ve tercih yönetimi. Son güncelleme: 11 Kasım 2026.
          </p>
          ${renderLegalNav('cerez-politikasi')}
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">1. Amaç, Aydınlatma ve Açık Rıza Ayrımı</h2>
          <p class="text-sm text-mistral-slate leading-relaxed">
            İşbu Çerez ve Yerel Depolama Politikası, <strong>app.melihkarasu.com</strong> ("Platform") üzerinde kullanılan HTTP çerezleri ve tarayıcı yerel depolama alanları (<code>localStorage</code>, <code>sessionStorage</code>) hakkında ziyaretçileri 6698 sayılı KVKK, Kişisel Verileri Koruma Kurumu Çerez Uygulamaları Hakkında Rehber ve Avrupa Birliği (ePrivacy / GDPR) düzenlemelerine uygun olarak bilgilendirmek amacıyla hazırlanmıştır.
          </p>
          <p class="text-sm text-mistral-slate leading-relaxed">
            Mevzuat uyarınca <strong>Zorunlu ve İşlevsel Teknolojiler</strong>, talep ettiğiniz bilgi toplumu hizmetinin sunulması için kesinlikle gerekli olduğundan açık rızanıza tabi değildir; bu teknolojiler hakkında <a href="/aydinlatma-metni" class="text-mistral-orange underline font-medium">Aydınlatma Metni</a> ve işbu politika ile bilgilendirme yapılır. Buna karşılık <strong>Analitik</strong> ve <strong>Reklam/Pazarlama</strong> çerezleri varsayılan olarak kapalıdır ve yalnızca açık rıza vermeniz halinde yüklenir.
          </p>
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div>
            <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">2. Zorunlu ve İşlevsel Teknolojiler (Aydınlatmaya Tabi — Onay Gerekmez)</h2>
            <p class="text-xs sm:text-sm text-mistral-slate mt-1">Platform'un temel işlevlerini yerine getirebilmesi, SSO oturumunuzun korunması ve çerez tercihlerinizin hatırlanması için KVKK m.5/2-c ve m.5/2-f kapsamında kullanılır:</p>
          </div>
          <div class="overflow-x-auto border border-mistral-beige-deep rounded-xl">
            <table class="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr class="bg-mistral-cream border-b border-mistral-beige-deep text-mistral-ink font-semibold">
                  <th class="p-3.5">Ad / Anahtar</th>
                  <th class="p-3.5">Sağlayıcı</th>
                  <th class="p-3.5">Tür</th>
                  <th class="p-3.5">Saklama Süresi</th>
                  <th class="p-3.5">Kullanım Amacı</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200 text-mistral-slate">
                <tr class="hover:bg-stone-50/70">
                  <td class="p-3.5 font-mono text-xs text-mistral-ink">vibe_token, vibe_refresh_token</td>
                  <td class="p-3.5 font-mono text-xs">app.melihkarasu.com</td>
                  <td class="p-3.5">Çerez &amp; localStorage</td>
                  <td class="p-3.5">1 Yıl / Çıkış yapılana kadar</td>
                  <td class="p-3.5">Kullanıcının GitHub/Google SSO oturumunu doğrulamak ve yenilemek</td>
                </tr>
                <tr class="hover:bg-stone-50/70">
                  <td class="p-3.5 font-mono text-xs text-mistral-ink">vibe_user</td>
                  <td class="p-3.5 font-mono text-xs">app.melihkarasu.com</td>
                  <td class="p-3.5">Çerez &amp; localStorage</td>
                  <td class="p-3.5">1 Yıl / Çıkış yapılana kadar</td>
                  <td class="p-3.5">Üst barda kullanıcı adını ve profil resmini sayfa titremesi olmadan (Zero-Flicker) göstermek</td>
                </tr>
                <tr class="hover:bg-stone-50/70">
                  <td class="p-3.5 font-mono text-xs text-mistral-ink">vibe_cookie_consent_v1</td>
                  <td class="p-3.5 font-mono text-xs">app.melihkarasu.com</td>
                  <td class="p-3.5">localStorage</td>
                  <td class="p-3.5">1 Yıl</td>
                  <td class="p-3.5">Kullanıcının çerez onay/ret tercihlerini ve zaman damgasını kaydetmek</td>
                </tr>
                <tr class="hover:bg-stone-50/70">
                  <td class="p-3.5 font-mono text-xs text-mistral-ink">vibe_favs, uygulama durumları</td>
                  <td class="p-3.5 font-mono text-xs">app.melihkarasu.com</td>
                  <td class="p-3.5">localStorage</td>
                  <td class="p-3.5">Kalıcı (Silinene kadar)</td>
                  <td class="p-3.5">Favori uygulamaları, günlük oyun ilerlemelerini ve mikro uygulama içi ayarları cihazda saklamak</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div>
            <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">3. Performans, Analitik ve Reklam Çerezleri (Aydınlatma + Açık Rızaya Tabi)</h2>
            <p class="text-xs sm:text-sm text-mistral-slate mt-1">Yalnızca açık rıza vermeniz halinde yüklenir; rıza verilmediğinde ilgili dış betikler tarayıcınıza çağrılmaz:</p>
          </div>
          <div class="overflow-x-auto border border-mistral-beige-deep rounded-xl">
            <table class="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr class="bg-mistral-cream border-b border-mistral-beige-deep text-mistral-ink font-semibold">
                  <th class="p-3.5">Çerez Adı</th>
                  <th class="p-3.5">Sağlayıcı</th>
                  <th class="p-3.5">Kategori</th>
                  <th class="p-3.5">Saklama Süresi</th>
                  <th class="p-3.5">Kullanım Amacı</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200 text-mistral-slate">
                <tr class="hover:bg-stone-50/70">
                  <td class="p-3.5 font-mono text-xs text-mistral-ink">_ga, _ga_*</td>
                  <td class="p-3.5">Google Analytics</td>
                  <td class="p-3.5">Analitik</td>
                  <td class="p-3.5">2 Yıl</td>
                  <td class="p-3.5">Tekil ziyaretçileri anonim bir istemci kimliği ile ayırt ederek trafik ve oturum istatistiği üretmek</td>
                </tr>
                <tr class="hover:bg-stone-50/70">
                  <td class="p-3.5 font-mono text-xs text-mistral-ink">__gads, __gpi</td>
                  <td class="p-3.5">Google AdSense</td>
                  <td class="p-3.5">Reklam / Pazarlama</td>
                  <td class="p-3.5">13 Ay</td>
                  <td class="p-3.5">Yan sütunlarda (Side Rail) gösterilen reklamların sıklığını ayarlamak ve reklam performansını ölçmek</td>
                </tr>
                <tr class="hover:bg-stone-50/70">
                  <td class="p-3.5 font-mono text-xs text-mistral-ink">IDE, test_cookie</td>
                  <td class="p-3.5">Google DoubleClick</td>
                  <td class="p-3.5">Reklam / Pazarlama</td>
                  <td class="p-3.5">1 Yıl / 15 Dk</td>
                  <td class="p-3.5">Tarayıcının çerez desteğini kontrol etmek ve rıza durumuna göre reklam sunmak</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="bg-white border border-mistral-beige-deep rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 class="text-lg sm:text-xl font-bold font-editorial text-mistral-ink">4. Çerez Tercihlerinizi Nasıl Yönetebilirsiniz?</h2>
          <p class="text-sm text-mistral-slate leading-relaxed">
            Aşağıdaki butona tıklayarak veya sayfanın en altındaki (Footer) <strong>"Çerez Tercihleri"</strong> bağlantısını kullanarak Analitik ve Reklam çerezlerine verdiğiniz onayı dilediğiniz zaman değiştirebilir ya da geri çekebilirsiniz. Ayrıca tarayıcınızın gizlilik ayarlarından çerezleri ve <code>localStorage</code> verilerini her zaman temizleyebilirsiniz.
          </p>
          <div>
            <button type="button" onclick="window.openVibeCookieModal && window.openVibeCookieModal()" class="vibe-btn vibe-btn-primary cursor-pointer" style="padding:0.625rem 1.25rem; font-size:0.875rem;">
              Çerez Tercih Panelini Aç
            </button>
          </div>
        </section>
      </div>
    `;
    res.send(pageTemplate('Çerez ve Yerel Depolama Politikası', content));
  });
};
