/**
 * KVKK & GDPR Scanner
 * 6698 Sayılı KVKK (2024/2026 Reformları), AB GDPR (EU 2016/679), 6563 ETK (İYS),
 * 6502 TKHK (Mesafeli Sözleşmeler) ve 5651 Sayılı Kanun Uyum Denetçisi
 * - Statik Kod Analizi (SAST) + Proje Yapısı & Canlı URL Denetim Motoru
 * - Tarayıcı İçi LLM Yapılandırması (Gemini API, Vertex AI, OpenAI, Claude, OpenRouter, Ollama)
 * - Otomatik PII & Sır Maskeleme (TCKN, IBAN, Kart, E-posta, Telefon, API Key)
 */

const SCAN_STATE = {
  activeTab: 'folder',
  files: [],
  findings: [],
  domainSummary: [],
  score: 100,
  grade: 'A',
  trMaxPenalty: 0,
  trMinPenalty: 0,
  gdprRisk: false,
  lastAIReport: '',
  filterSeverity: 'ALL'
};

const AUDIT_DOMAINS = [
  { id: 'RLS_DB', title: '1. Veritabanı Güvenliği & Supabase RLS', legalBasis: 'KVKK m.12 (Ceza m.18/1-b) · GDPR Art. 25, 32', penaltyText: '256.357 TL – 17.092.242 TL', minTL: 256357, maxTL: 17092242, gdpr: true },
  { id: 'FORMS_CONSENT', title: '2. Formlar, Aydınlatma Metni & Açık Rıza Ayrımı', legalBasis: 'KVKK m.5, m.10 (Ceza m.18/1-a) · GDPR Art. 6, 7, 13', penaltyText: '85.437 TL – 1.709.200 TL', minTL: 85437, maxTL: 1709200, gdpr: true },
  { id: 'EMAIL_ETK_IYS', title: '3. Ticari Elektronik İleti (E-Posta/SMS) & İYS', legalBasis: '6563 Sayılı ETK m.6 (Ceza m.12/1-a) · RFC 8058', penaltyText: '2.859 TL – 143.090 TL', minTL: 2859, maxTL: 143090, gdpr: false },
  { id: 'PAYMENT_TKHK', title: '4. Ödeme, Abonelik & Mesafeli Satış Sözleşmesi', legalBasis: '6502 Sayılı TKHK m.48/2 (Ceza m.77/1-a) · EU 2011/83', penaltyText: 'İşlem Başına 3.973 TL', minTL: 3973, maxTL: 397300, gdpr: false },
  { id: 'BREACH_72H', title: '5. Veri İhlali (72 Saat Bildirim Planı) & Denetim Logu', legalBasis: 'KVKK m.12/5 (Kurul 2019/10) · GDPR Art. 33-34', penaltyText: '256.357 TL – 17.092.242 TL', minTL: 256357, maxTL: 17092242, gdpr: true },
  { id: 'CROSS_BORDER', title: '6. Yurt Dışı Veri Aktarımı, Google Fonts & CDN', legalBasis: 'KVKK m.9 (Ceza m.18/1-d) · GDPR Art. 44-49 (LG München)', penaltyText: '85.437 TL – 17.092.242 TL + 100€ Tazminat', minTL: 85437, maxTL: 1709200, gdpr: true },
  { id: 'COOKIES_TRACKERS', title: '7. Çerez (Cookie) Banner, Önceden Rıza & İzleyiciler', legalBasis: 'KVKK Çerez Rehberi · ePrivacy Art. 5(3) · GDPR Art. 7', penaltyText: '85.437 TL – 1.709.200 TL', minTL: 85437, maxTL: 1709200, gdpr: true },
  { id: 'DSAR_ERASURE', title: '8. İlgili Kişi Hakları (DSAR), Silme & Anonimleştirme', legalBasis: 'KVKK m.7, m.11, m.13 · GDPR Art. 15-20', penaltyText: '256.357 TL – 17.092.242 TL', minTL: 256357, maxTL: 1709200, gdpr: true },
  { id: 'SPECIAL_DATA', title: '9. Özel Nitelikli Kişisel Veriler & Şifreleme', legalBasis: 'KVKK m.6 (Kurul 2018/10) · GDPR Art. 9, 32', penaltyText: '427.263 TL – 17.092.242 TL', minTL: 427263, maxTL: 17092242, gdpr: true },
  { id: 'PII_LOGS_LLM', title: '10. Loglama Hijyeni & Harici AI (LLM) PII Sızıntısı', legalBasis: 'KVKK m.4/2-ç, m.9, m.11/1-g · GDPR Art. 5(1)(c), Art. 22', penaltyText: '256.357 TL – 17.092.242 TL', minTL: 256357, maxTL: 17092242, gdpr: true }
];

function maskPIIAndSecrets(text) {
  if (!text) return '';
  return String(text)
    .replace(/\b[1-9][0-9]{10}\b/g, '[REDACTED_TCKN]')
    .replace(/\bTR[0-9]{2}\s?(?:[0-9]{4}\s?){5}[0-9]{2}\b/gi, '[REDACTED_IBAN]')
    .replace(/(?:AIza[0-9A-Za-z\-_]{35}|sk-[a-zA-Z0-9\-_]{20,}|ghp_[a-zA-Z0-9]{30,}|eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+)/g, '[REDACTED_SECRET_KEY]')
    .replace(/([a-zA-Z0-9._%+-]{1,2})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '$1***@$2')
    .replace(/(?:\+90|0)?\s?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, '[REDACTED_PHONE]');
}

function findLineNumber(content, index) {
  if (index <= 0) return 1;
  return content.slice(0, index).split('\n').length;
}

function getLineSnippet(content, lineNum) {
  const lines = content.split('\n');
  const start = Math.max(0, lineNum - 2);
  const end = Math.min(lines.length, lineNum + 2);
  return lines.slice(start, end).map((l, idx) => (start + idx + 1) + ': ' + l).join('\n');
}

function analyzeProjectFiles(files) {
  const findings = [];
  let hasBreachDoc = false;
  let hasAuditLogRef = false;

  for (const f of files) {
    const p = (f.path || '').toLowerCase();
    const c = f.content || '';

    if (p.includes('veri-ihlali') || p.includes('breach') || p.includes('incident') || c.includes('ihlalbildirimi.kvkk.gov.tr')) {
      hasBreachDoc = true;
    }
    if (/audit_logs|auditLog|denetim_log|security_logs/i.test(c)) {
      hasAuditLogRef = true;
    }

    // 1. VERİTABANI & SUPABASE RLS KURALLARI
    if (p.endsWith('.sql') || c.includes('CREATE TABLE')) {
      const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(public\.[a-zA-Z0-9_]+|[a-zA-Z0-9_]+)/gi;
      let match;
      while ((match = tableRegex.exec(c)) !== null) {
        const rawTable = match[1];
        const tableName = rawTable.replace(/^public\./i, '');
        const line = findLineNumber(c, match.index);
        const rlsEnableRegex = new RegExp('ALTER\\s+TABLE\\s+(?:ONLY\\s+)?(?:public\\.)?' + tableName + '\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY', 'i');
        const policyRegex = new RegExp('CREATE\\s+POLICY\\s+[^;]+ON\\s+(?:public\\.)?' + tableName, 'i');

        if (!rlsEnableRegex.test(c)) {
          findings.push({
            ruleId: 'KVKK-RLS-001',
            domainId: 'RLS_DB',
            severity: 'CRITICAL',
            title: 'Tabloda Row Level Security (RLS) Kapalı: ' + rawTable,
            legalBasis: 'KVKK m.12/1 (Ceza m.18/1-b) · GDPR Art. 25 & Art. 32',
            penalty2026: '256.357 TL – 17.092.242 TL',
            file: f.path,
            line: line,
            snippet: getLineSnippet(c, line),
            finding: rawTable + ' tablosu oluşturulmuş ancak ENABLE ROW LEVEL SECURITY tanımlanmamış. Ön yüzdeki anon key ile tüm tablo okunup değiştirilebilir.',
            remediation: 'ALTER TABLE public.' + tableName + ' ENABLE ROW LEVEL SECURITY; ve kullanıcı bazlı CREATE POLICY ekleyin.',
            fixCode: 'ALTER TABLE public.' + tableName + ' ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.' + tableName + ' FORCE ROW LEVEL SECURITY;\nCREATE POLICY "' + tableName + '_own_access" ON public.' + tableName + ' FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id);'
          });
        } else if (!policyRegex.test(c)) {
          findings.push({
            ruleId: 'KVKK-RLS-002',
            domainId: 'RLS_DB',
            severity: 'HIGH',
            title: 'RLS Açık Ancak Erişim Politikası (CREATE POLICY) Eksik: ' + rawTable,
            legalBasis: 'KVKK m.12/1 · GDPR Art. 32',
            penalty2026: '256.357 TL – 17.092.242 TL',
            file: f.path,
            line: line,
            snippet: getLineSnippet(c, line),
            finding: rawTable + ' tablosunda RLS etkinleştirilmiş fakat hiçbir CREATE POLICY tanımlanmamış.',
            remediation: 'Tablo için kullanıcı bazlı SELECT/INSERT/UPDATE/DELETE politikalarını tanımlayın.',
            fixCode: 'CREATE POLICY "' + tableName + '_select_own" ON public.' + tableName + ' FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);'
          });
        }
      }

      const permissiveMatch = /CREATE\s+POLICY[^;]+FOR\s+(?:ALL|UPDATE|DELETE|SELECT)[^;]+USING\s*\(\s*true\s*\)/i.exec(c);
      if (permissiveMatch) {
        const line = findLineNumber(c, permissiveMatch.index);
        findings.push({
          ruleId: 'KVKK-RLS-003',
          domainId: 'RLS_DB',
          severity: 'CRITICAL',
          title: 'Aşırı İzinli RLS Politikası: USING (true) ile Herkese Açık Tablo',
          legalBasis: 'KVKK m.12/1 (Ceza m.18/1-b) · GDPR Art. 32',
          penalty2026: '256.357 TL – 17.092.242 TL',
          file: f.path,
          line: line,
          snippet: getLineSnippet(c, line),
          finding: 'RLS politikasında USING (true) kullanılması tüm satırları herkese açar.',
          remediation: 'USING (true) yerine USING ((SELECT auth.uid()) = user_id) kullanın.',
          fixCode: 'USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);'
        });
      }
    }

    const serviceRoleMatch = /(?:NEXT_PUBLIC_|VITE_|REACT_APP_|PUBLIC_)[A-Z0-9_]*SERVICE_ROLE|supabase\.createClient\([^)]*service_role/i.exec(c);
    if (serviceRoleMatch) {
      const line = findLineNumber(c, serviceRoleMatch.index);
      findings.push({
        ruleId: 'KVKK-RLS-004',
        domainId: 'RLS_DB',
        severity: 'CRITICAL',
        title: 'Ön Yüzde (Client-Side) Supabase service_role Anahtarı Sızıntısı',
        legalBasis: 'KVKK m.12 (Ceza m.18/1-b) · GDPR Art. 32',
        penalty2026: '256.357 TL – 17.092.242 TL',
        file: f.path,
        line: line,
        snippet: getLineSnippet(c, line),
        finding: 'Ön yüz ortam değişkeninde (NEXT_PUBLIC_ / VITE_) veya istemci kodunda service_role anahtarı kullanılmış. Bu anahtar tüm RLS kurallarını devre dışı bırakır!',
        remediation: 'service_role anahtarını ön yüzden kaldırın, anahtarı rotate edin ve yalnızca sunucu modüllerinde kullanın.',
        fixCode: 'import "server-only";\nconst adminClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);'
      });
    }

    // 2. FORMLAR, AYDINLATMA METNİ & AÇIK RIZA AYRIMI
    if (/\.(tsx|jsx|html|vue|svelte|php|ejs)$/i.test(p) || c.includes('<form')) {
      const formMatch = /<form[\s\S]*?<\/form>/gi;
      let fm;
      while ((fm = formMatch.exec(c)) !== null) {
        const formHtml = fm[0];
        const line = findLineNumber(c, fm.index);
        const collectsPII = /type=["'](?:email|tel|password)["']|name=["'](?:email|phone|tel|full_name|name|tc|tckn|address|message)["']/i.test(formHtml);
        if (collectsPII) {
          const hasPrivacyLink = /aydinlatma|aydınlatma|gizlilik|privacy|kvkk/i.test(formHtml);
          if (!hasPrivacyLink) {
            findings.push({
              ruleId: 'KVKK-FORM-001',
              domainId: 'FORMS_CONSENT',
              severity: 'HIGH',
              title: 'Kişisel Veri Toplayan Formda Aydınlatma Metni Bağlantısı Eksik',
              legalBasis: 'KVKK m.10 (Ceza m.18/1-a) · GDPR Art. 13',
              penalty2026: '85.437 TL – 1.709.200 TL',
              file: f.path,
              line: line,
              snippet: getLineSnippet(c, line),
              finding: 'Kişisel veri toplayan <form> bileşeninde katmanlı Aydınlatma Metni açıklaması ve linki bulunmuyor.',
              remediation: 'Formun altına onaya tabi olmayan (checkbox içermeyen) Katmanlı Aydınlatma Metni bilgisi ve /hukuk/aydinlatma-metni linki ekleyin.',
              fixCode: '<p className="text-xs text-slate-600">Kişisel verileriniz sözleşmenin ifası (KVKK m.5/2-c) kapsamında işlenmektedir. <a href="/hukuk/aydinlatma-metni" target="_blank" rel="noopener">Aydınlatma Metni</a></p>'
            });
          }

          const preCheckedMatch = /<input[^>]*type=["']checkbox["'][^>]*?(?:defaultChecked(?:=\{?true\}?)?|checked(?:=["']checked["']|=\{true\}|\s|>))/i.exec(formHtml);
          if (preCheckedMatch) {
            const pcLine = findLineNumber(c, fm.index + preCheckedMatch.index);
            findings.push({
              ruleId: 'KVKK-FORM-002',
              domainId: 'FORMS_CONSENT',
              severity: 'CRITICAL',
              title: 'Varsayılan Olarak İşaretlenmiş (Pre-Ticked) Açık Rıza / Onay Kutusu',
              legalBasis: 'KVKK m.3/1-a, m.5 · GDPR Art. 4(11), Recital 32 (Planet49 C-673/17)',
              penalty2026: '85.437 TL – 1.709.200 TL + Geçersiz Rıza',
              file: f.path,
              line: pcLine,
              snippet: getLineSnippet(c, pcLine),
              finding: 'Onay kutusu varsayılan olarak işaretli (defaultChecked / checked) bırakılmış. Önceden işaretlenmiş kutularla alınan açık rıza hukuken geçersizdir.',
              remediation: 'defaultChecked={false} kullanın; kullanıcının aktif irade beyanıyla işaretlemesini sağlayın.',
              fixCode: '<input type="checkbox" name="marketing_email_consent" defaultChecked={false} />'
            });
          }

          const bundledMatch = /(<input[^>]*type=["']checkbox["'][^>]*required[^>]*>[\s\S]{0,260}(?:kampanya|pazarlama|bülten|ticari\s+elektronik|marketing|newsletter))|((?:aydınlatma|aydinlatma)[\s\S]{0,160}(?:kabul\s+ediyorum|onaylıyorum)[\s\S]{0,120}(?:kampanya|pazarlama|ticari))/i.exec(formHtml);
          if (bundledMatch) {
            const bLine = findLineNumber(c, fm.index + bundledMatch.index);
            findings.push({
              ruleId: 'KVKK-FORM-003',
              domainId: 'FORMS_CONSENT',
              severity: 'HIGH',
              title: 'Hizmetin Açık Rızaya Şart Koşulması / Aydınlatma ile Rızanın Birleştirilmesi (Bundled Consent)',
              legalBasis: 'KVKK m.4, m.5 · GDPR Art. 7(4)',
              penalty2026: '427.263 TL – 17.092.242 TL',
              file: f.path,
              line: bLine,
              snippet: getLineSnippet(c, bLine),
              finding: 'Aydınlatma metni ile ticari ileti/açık rıza tek bir onay kutusunda birleştirilmiş veya pazarlama rızası required (zorunlu) tutulmuş.',
              remediation: 'Aydınlatma metnini checkbox olmadan sunun; pazarlama açık rızasını required özniteliği olmayan ayrı bir checkbox ile isteğe bağlı alın.',
              fixCode: '<input type="checkbox" name="marketing_consent" defaultChecked={false} /> <!-- required YOK -->'
            });
          }
        }
      }
    }

    // 3. TİCARİ ELEKTRONİK İLETİ (E-POSTA / SMS) & İYS KURALLARI
    const mailSendMatch = /(?:transporter\.sendMail|resend\.emails\.send|sgMail\.send|mailgun\.messages|sendEmail|sendCampaign|sendNewsletter)\s*\(/i.exec(c);
    if (mailSendMatch) {
      const line = findLineNumber(c, mailSendMatch.index);
      const isMarketingFile = /campaign|newsletter|marketing|kampanya|bulten|duyuru|promo|broadcast/i.test(p + ' ' + c);
      if (isMarketingFile || /SELECT\s+.*FROM\s+(?:public\.)?users/i.test(c)) {
        if (!/marketing_consent|email_opt_in|unsubscribed_at|iys/i.test(c)) {
          findings.push({
            ruleId: 'KVKK-ETK-001',
            domainId: 'EMAIL_ETK_IYS',
            severity: 'CRITICAL',
            title: 'İzin (Opt-In) ve İYS Filtresi Olmadan Kampanya / Toplu E-Posta Gönderimi',
            legalBasis: '6563 Sayılı ETK m.6 (Ceza m.12/1-a) · KVKK m.5/1',
            penalty2026: '2.859 TL – 14.309 TL (Toplu gönderimde 10 katı: 143.090 TL)',
            file: f.path,
            line: line,
            snippet: getLineSnippet(c, line),
            finding: 'E-posta gönderim kodunda alıcıların ticari elektronik ileti izni (email_opt_in = true AND unsubscribed_at IS NULL) kontrol edilmiyor.',
            remediation: 'Sorguya WHERE email_opt_in = true AND unsubscribed_at IS NULL şartı ekleyin ve izin tarihini İYS uyumlu doğrulayın.',
            fixCode: 'WHERE c.email_opt_in = true AND c.unsubscribed_at IS NULL'
          });
        }
        if (!/List-Unsubscribe|unsubscribe|abonelikten/i.test(c)) {
          findings.push({
            ruleId: 'KVKK-ETK-002',
            domainId: 'EMAIL_ETK_IYS',
            severity: 'HIGH',
            title: 'Ticari E-Postada Abonelikten Çıkma Linki ve RFC 8058 List-Unsubscribe Başlığı Eksik',
            legalBasis: '6563 Sayılı ETK m.8 · FTC CAN-SPAM · RFC 8058',
            penalty2026: '2.859 TL – 143.090 TL',
            file: f.path,
            line: line,
            snippet: getLineSnippet(c, line),
            finding: 'Kampanya e-postasında tek tıkla ücretsiz ret (unsubscribe) bağlantısı ve List-Unsubscribe başlığı bulunmuyor.',
            remediation: 'E-posta başlıklarına List-Unsubscribe ve List-Unsubscribe-Post: List-Unsubscribe=One-Click ile altbilgiye çıkış linki ekleyin.',
            fixCode: 'headers: { "List-Unsubscribe": "<https://app.example.com/api/unsubscribe>", "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }'
          });
        }
      }
    }

    // 4. ÖDEME, ABONELİK & 6502 TKHK MESAFELİ SATIŞ KURALLARI
    const paymentMatch = /(?:stripe\.checkout\.sessions\.create|iyzipay|CheckoutFormInitialize|paytr|createPaymentSession|startSubscription)/i.exec(c);
    if (paymentMatch) {
      const line = findLineNumber(c, paymentMatch.index);
      if (!/pre_info|on_bilgilendirme|onBilgilendirme|mesafeli_satis|distance_sales|acceptedPreInfoForm|contract_acceptances/i.test(c)) {
        findings.push({
          ruleId: 'KVKK-TKHK-001',
          domainId: 'PAYMENT_TKHK',
          severity: 'HIGH',
          title: 'Ödeme Öncesi Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi Onay Kanıtı Eksik',
          legalBasis: '6502 Sayılı TKHK m.48/2 (Ceza m.77/1-a) · Mesafeli Sözleşmeler Yön. m.5 & m.20',
          penalty2026: 'Her Satış / Sözleşme Başına 3.973 TL',
          file: f.path,
          line: line,
          snippet: getLineSnippet(c, line),
          finding: 'Ödeme/abonelik oturumu başlatılırken Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi onay doğrulaması ve 3 yıl saklanacak SHA-256 kanıt kaydı bulunmuyor.',
          remediation: 'Ödeme başlatılmadan önce sözleşme onaylarını doğrulayın ve contract_acceptances tablosuna SHA-256 özetiyle kaydedin.',
          fixCode: 'await db.query("INSERT INTO public.contract_acceptances (user_id, plan_id, pre_info_accepted, distance_contract_accepted, contract_sha256) VALUES ($1,$2,true,true,$3)", [userId, planId, sha256]);'
        });
      }
    }

    // 6. YURT DIŞI VERİ AKTARIMI: GOOGLE FONTS & HARİCİ CDN
    const googleFontsMatch = /fonts\.googleapis\.com|fonts\.gstatic\.com/i.exec(c);
    if (googleFontsMatch) {
      const line = findLineNumber(c, googleFontsMatch.index);
      findings.push({
        ruleId: 'KVKK-XFER-001',
        domainId: 'CROSS_BORDER',
        severity: 'HIGH',
        title: 'Google Fonts CDN Kullanımı Nedeniyle Ziyaretçi IP Adresinin Yurt Dışına Aktarımı',
        legalBasis: 'KVKK m.9 · GDPR Art. 44-49 (LG München 20.01.2022, Az. 3 O 17493/21)',
        penalty2026: 'KVKK m.9 İdari Cezası + GDPR Ziyaretçi Başı 100 EUR Tazminat Riski',
        file: f.path,
        line: line,
        snippet: getLineSnippet(c, line),
        finding: 'Fontlar tarayıcı üzerinden doğrudan fonts.googleapis.com / fonts.gstatic.com adresinden yükleniyor. Ziyaretçi IP adresi yurt dışına aktarılıyor.',
        remediation: 'Font dosyalarını (.woff2) indirip kendi sunucunuzda barındırın (next/font/local veya yerel @font-face).',
        fixCode: 'import localFont from "next/font/local";\nconst inter = localFont({ src: "../public/fonts/Inter-Regular.woff2", display: "swap" });'
      });
    }

    // 7. ÇEREZ (COOKIE) & İZLEYİCİ (TRACKER) ÖNCEDEN RIZA KURALLARI
    const trackerMatch = /(?:googletagmanager\.com\/gtag\/js|connect\.facebook\.net|static\.hotjar\.com|clarity\.ms\/tag|analytics\.tiktok\.com)/i.exec(c);
    if (trackerMatch && !/consent|riza|cookie_preferences|hasAnalyticsConsent|ConsentGate/i.test(c)) {
      const line = findLineNumber(c, trackerMatch.index);
      findings.push({
        ruleId: 'KVKK-COOK-001',
        domainId: 'COOKIES_TRACKERS',
        severity: 'HIGH',
        title: 'Açık Rıza (Opt-In) Alınmadan Çalışan 3. Taraf Analitik / Pazarlama Takip Betiği',
        legalBasis: 'KVKK Çerez Uygulamaları Rehberi · ePrivacy Art. 5(3) · GDPR Art. 6(1)(a)',
        penalty2026: '85.437 TL – 1.709.200 TL',
        file: f.path,
        line: line,
        snippet: getLineSnippet(c, line),
        finding: 'Google Analytics / Meta Pixel / Hotjar / Clarity takip betiği kullanıcı çerez onayı kontrol edilmeden doğrudan sayfaya gömülmüş.',
        remediation: 'Zorunlu olmayan tüm analitik ve pazarlama betiklerini yalnızca kullanıcı Çerez Bannerında açık onay verdikten sonra yükleyin.',
        fixCode: 'if (cookieConsent.analytics === true) { loadGoogleAnalytics(); }'
      });
    }

    // 8. İLGİLİ KİŞİ HAKLARI (DSAR) & SADECE SOFT-DELETE TUZAĞI
    const softDeleteMatch = /UPDATE\s+(?:public\.)?users\s+SET\s+(?:deleted_at\s*=|is_deleted\s*=\s*true|active\s*=\s*false)(?![\s\S]{0,200}(?:ANONIM|anonymized|NULL))/i.exec(c);
    if (softDeleteMatch) {
      const line = findLineNumber(c, softDeleteMatch.index);
      findings.push({
        ruleId: 'KVKK-DSAR-001',
        domainId: 'DSAR_ERASURE',
        severity: 'MEDIUM',
        title: 'Hesap Silme İşleminde Kişisel Veriler Anonimleştirilmeden Yalnızca Soft-Delete Yapılmış',
        legalBasis: 'KVKK m.7 (Kişisel Verilerin Silinmesi Yön. m.7-9) · GDPR Art. 17 (Right to Erasure)',
        penalty2026: '256.357 TL – 17.092.242 TL',
        file: f.path,
        line: line,
        snippet: getLineSnippet(c, line),
        finding: 'Kullanıcı silme işleminde yalnızca deleted_at / is_deleted bayrağı güncellenmiş; ad, e-posta, telefon ve IP açık metin olarak tutulmaya devam ediyor.',
        remediation: 'Yasal saklama zorunluluğu olmayan PII alanlarını NULL/anonim değerlerle ezin ve fatura kayıtlarını aktif erişimden izole edin.',
        fixCode: "UPDATE public.users SET email = 'deleted-' || gen_random_uuid() || '@anonymized.local', full_name = 'ANONIM', phone = NULL, ip_address = NULL, is_anonymized = true WHERE id = $1;"
      });
    }

    // 9. ÖZEL NİTELİKLİ KİŞİSEL VERİLER
    const specialDataMatch = /(?:blood_type|kan_grubu|health_data|saglik_verisi|biometric|criminal_record|adli_sicil|religion|mezhep)\s+(?:TEXT|VARCHAR)/i.exec(c);
    if (specialDataMatch) {
      const line = findLineNumber(c, specialDataMatch.index);
      findings.push({
        ruleId: 'KVKK-SPEC-001',
        domainId: 'SPECIAL_DATA',
        severity: 'CRITICAL',
        title: 'Özel Nitelikli Kişisel Verinin Düz Metin (Plaintext) Sütunda Şifresiz Saklanması',
        legalBasis: 'KVKK m.6 & KVK Kurulu 2018/10 Sayılı Kararı · GDPR Art. 9 & Art. 32',
        penalty2026: '427.263 TL – 17.092.242 TL',
        file: f.path,
        line: line,
        snippet: getLineSnippet(c, line),
        finding: 'Sağlık, biyometrik, kan grubu veya adli sicil gibi özel nitelikli kişisel veriler veritabanında uygulama katmanı şifrelemesi olmadan TEXT/VARCHAR olarak tanımlanmış.',
        remediation: 'Özel nitelikli verileri AES-256-GCM (zarf şifreleme) ile şifreleyerek saklayın ve her erişimi audit_logs tablosuna kaydedin.',
        fixCode: '// AES-256-GCM uygulama katmanı şifrelemesi + KMS anahtar izolasyonu zorunludur (KVK Kurulu 2018/10)'
      });
    }

    // 10. LOGLAMA HİJYENİ & YAPAY ZEKA (LLM) PII SIZINTISI
    const rawLogMatch = /(?:console\.(?:log|info|error|warn)|logger\.(?:info|error|debug))\s*\([^)]*(?:req\.body|user\.password|user\.tckn|tc_identity|credit_card|cardNumber)/i.exec(c);
    if (rawLogMatch) {
      const line = findLineNumber(c, rawLogMatch.index);
      findings.push({
        ruleId: 'KVKK-AI-001',
        domainId: 'PII_LOGS_LLM',
        severity: 'HIGH',
        title: 'Uygulama Loglarına Maskelenmemiş Kişisel Veri (req.body / TCKN / Parola) Yazılması',
        legalBasis: 'KVKK m.4/2-ç (Veri Minimizasyonu) & m.12 · GDPR Art. 5(1)(c) & Art. 32',
        penalty2026: '256.357 TL – 17.092.242 TL',
        file: f.path,
        line: line,
        snippet: getLineSnippet(c, line),
        finding: 'Ham istek gövdesi (req.body) veya hassas kişisel veri alanı doğrudan loglara yazdırılıyor.',
        remediation: 'Loglamadan önce maskPII() fonksiyonu ile TCKN, parola, e-posta ve telefon alanlarını maskeleyin.',
        fixCode: 'logger.info({ body: maskPII(JSON.stringify(req.body)) }, "İstek işlendi");'
      });
    }

    const llmCallMatch = /(?:openai\.chat\.completions\.create|anthropic\.messages\.create|generateContent)\s*\([\s\S]{0,320}(?:user\.(?:fullName|email|phone|tckn|tc)|req\.body)/i.exec(c);
    if (llmCallMatch && !/maskPII|redact|anonymize/i.test(c)) {
      const line = findLineNumber(c, llmCallMatch.index);
      findings.push({
        ruleId: 'KVKK-AI-002',
        domainId: 'PII_LOGS_LLM',
        severity: 'HIGH',
        title: 'Harici Yapay Zeka (LLM) API Çağrısında Maskelenmemiş Kişisel Veri Aktarımı',
        legalBasis: 'KVKK m.9 (Yurt Dışı Aktarım) & m.4 · GDPR Art. 5(1)(c) & Art. 44',
        penalty2026: '256.357 TL – 17.092.242 TL',
        file: f.path,
        line: line,
        snippet: getLineSnippet(c, line),
        finding: 'Kullanıcıya ait kimlik/iletişim verileri maskelenmeden doğrudan yurt dışı LLM sağlayıcısına gönderiliyor.',
        remediation: 'Harici LLM çağrılarından önce maskPII() katmanı ile TCKN, ad, telefon ve e-posta verilerini sözde-anonimleştirin.',
        fixCode: 'const safePrompt = maskPII(rawUserPrompt);'
      });
    }
  }

  if (files.length >= 2) {
    if (!hasBreachDoc) {
      findings.push({
        ruleId: 'KVKK-BREACH-001',
        domainId: 'BREACH_72H',
        severity: 'HIGH',
        title: '72 Saatlik Veri İhlali Müdahale Planı (docs/veri-ihlali.md) Bulunamadı',
        legalBasis: 'KVKK m.12/5 & KVK Kurulu 24.01.2019 / 2019/10 Kararı · GDPR Art. 33',
        penalty2026: '256.357 TL – 17.092.242 TL',
        file: 'docs/veri-ihlali-mudahale-plani.md',
        line: 1,
        snippet: 'Proje dizininde veri sızıntısı halinde 72 saat içinde KVK Kuruluna ve ilgili kişilere yapılacak bildirim prosedürü mevcut değil.',
        finding: 'KVK Kurulu 2019/10 kararı uyarınca veri ihlali öğrenildiği andan itibaren en geç 72 saat içinde Kurula bildirilmelidir.',
        remediation: 'Üstteki "docs/veri-ihlali.md Taslağı İndir" butonuna tıklayarak 72 saatlik müdahale planını projenize ekleyin.',
        fixCode: '# docs/veri-ihlali-mudahale-plani.md dosyasını projeye dahil edin'
      });
    }
    if (!hasAuditLogRef) {
      findings.push({
        ruleId: 'KVKK-BREACH-002',
        domainId: 'BREACH_72H',
        severity: 'MEDIUM',
        title: 'Veri İhlali Tespiti İçin Değişmez Denetim Kaydı (audit_logs) Altyapısı Eksik',
        legalBasis: 'KVKK m.12/1 & 5651 Sayılı Kanun · GDPR Art. 32 & Art. 33',
        penalty2026: '256.357 TL – 17.092.242 TL',
        file: 'PROJE_GENELI',
        line: 1,
        snippet: 'Projede audit_logs / denetim izi tablosu veya güvenlik loglama katmanı tespit edilemedi.',
        finding: 'Bir veri sızıntısında hangi verilerin etkilendiğini 72 saat içinde tespit edebilmek için kritik erişimlerin denetim loguna kaydedilmesi gerekir.',
        remediation: 'Append-only public.audit_logs tablosu oluşturun ve kritik veri erişimlerini kaydedin.',
        fixCode: 'CREATE TABLE public.audit_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), actor_id UUID, action TEXT NOT NULL, resource_type TEXT, created_at TIMESTAMPTZ DEFAULT now());'
      });
    }
  }

  return findings;
}

function evaluateAndRenderFindings(files, findings) {
  SCAN_STATE.files = files;
  SCAN_STATE.findings = findings;

  let penaltyDeduction = 0;
  findings.forEach(f => {
    if (f.severity === 'CRITICAL') penaltyDeduction += 18;
    else if (f.severity === 'HIGH') penaltyDeduction += 10;
    else if (f.severity === 'MEDIUM') penaltyDeduction += 5;
    else penaltyDeduction += 2;
  });

  const score = Math.max(0, 100 - penaltyDeduction);
  SCAN_STATE.score = score;
  let grade = 'A';
  if (score < 50) grade = 'F';
  else if (score < 65) grade = 'D';
  else if (score < 78) grade = 'C';
  else if (score < 90) grade = 'B';
  SCAN_STATE.grade = grade;

  let minTotalTL = 0;
  let maxTotalTL = 0;
  let hasGdprViolation = false;

  const domainRows = AUDIT_DOMAINS.map(dom => {
    const domFindings = findings.filter(f => f.domainId === dom.id);
    const hasCrit = domFindings.some(f => f.severity === 'CRITICAL');
    const hasHigh = domFindings.some(f => f.severity === 'HIGH');
    let status = 'TAMAM';
    if (hasCrit) status = 'KRİTİK RİSK';
    else if (hasHigh || domFindings.length > 0) status = 'EKSİK / RİSK';

    if (domFindings.length > 0) {
      minTotalTL += dom.minTL;
      maxTotalTL += dom.maxTL;
      if (dom.gdpr) hasGdprViolation = true;
    }

    return {
      ...dom,
      status: status,
      findingsCount: domFindings.length,
      summary: domFindings.length > 0 ? domFindings.map(x => x.title + ' (' + x.file + ':' + x.line + ')').join(' · ') : 'İhlal tespit edilmedi (Uyumlu)'
    };
  });

  SCAN_STATE.domainSummary = domainRows;
  SCAN_STATE.trMinPenalty = minTotalTL;
  SCAN_STATE.trMaxPenalty = maxTotalTL;
  SCAN_STATE.gdprRisk = hasGdprViolation;

  document.getElementById('audit-summary-section').classList.remove('hidden');

  const gradeBadge = document.getElementById('compliance-grade-badge');
  gradeBadge.textContent = grade;
  gradeBadge.className = 'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold font-mono border ' + (
    grade === 'A' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' :
    grade === 'B' ? 'bg-blue-500/15 text-blue-600 border-blue-500/30' :
    grade === 'C' ? 'bg-amber-500/15 text-amber-600 border-amber-500/30' :
    'bg-red-500/15 text-red-600 border-red-500/30'
  );

  document.getElementById('compliance-score-val').textContent = score + ' / 100';
  document.getElementById('compliance-verdict-text').textContent =
    score >= 90 ? 'Yüksek KVKK & GDPR Uyumu' :
    score >= 70 ? 'Yayına Almadan Önce Düzeltme Gerekli' :
    'Kritik İdari Para Cezası Riski!';

  const critCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const medCount = findings.filter(f => f.severity === 'MEDIUM').length;

  document.getElementById('total-findings-count').textContent = String(findings.length);
  document.getElementById('scanned-files-count').textContent = files.length + ' kaynak dosyada';
  document.getElementById('crit-count-badge').textContent = critCount + ' Kritik';
  document.getElementById('high-count-badge').textContent = highCount + ' Yüksek';
  document.getElementById('med-count-badge').textContent = medCount + ' Orta';

  const fmtTL = (n) => n.toLocaleString('tr-TR') + ' TL';
  document.getElementById('tr-penalty-exposure').textContent =
    findings.length === 0 ? '0 TL (Risk Yok)' : fmtTL(minTotalTL) + ' – ' + fmtTL(maxTotalTL);

  document.getElementById('gdpr-exposure-text').textContent =
    hasGdprViolation
      ? '⚠️ GDPR Art. 83 (20M EUR / %4 Ciro) & IP Tazminat Riski Aktif'
      : '✅ GDPR Art. 5 / 25 / 32 Temel Kontrolleri Geçti';

  const tbody = document.getElementById('domain-matrix-tbody');
  tbody.innerHTML = domainRows.map(r => {
    const badgeHtml =
      r.status === 'TAMAM'
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700">✅ TAMAM</span>'
        : r.status === 'KRİTİK RİSK'
        ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-600">❌ KRİTİK RİSK</span>'
        : '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700">⚠️ EKSİK / RİSK</span>';

    return '<tr>' +
      '<td class="py-2.5 pr-3 font-semibold text-mistral-text">' + escapeHtml(r.title) + '</td>' +
      '<td class="py-2.5 px-3 font-mono text-[11px] text-mistral-muted">' + escapeHtml(r.legalBasis) + '</td>' +
      '<td class="py-2.5 px-3">' + badgeHtml + '</td>' +
      '<td class="py-2.5 px-3 font-mono text-[11px] text-red-600">' + (r.findingsCount > 0 ? escapeHtml(r.penaltyText) : '—') + '</td>' +
      '<td class="py-2.5 pl-3 text-mistral-muted">' + escapeHtml(r.summary) + '</td>' +
      '</tr>';
  }).join('');

  renderFindingsList('ALL');
}

function renderFindingsList(severityFilter) {
  SCAN_STATE.filterSeverity = severityFilter;
  const container = document.getElementById('findings-list-container');
  const filtered = severityFilter === 'ALL'
    ? SCAN_STATE.findings
    : SCAN_STATE.findings.filter(f => f.severity === severityFilter);

  if (filtered.length === 0) {
    container.innerHTML = '<div class="p-6 text-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs">🎉 Seçili filtrede herhangi bir KVKK veya GDPR ihlali tespit edilmedi!</div>';
    return;
  }

  container.innerHTML = filtered.map(f => {
    const sevBadge =
      f.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
      f.severity === 'HIGH' ? 'bg-amber-500 text-white' :
      'bg-blue-600 text-white';

    return '<div class="p-4 rounded-xl border border-mistral-border bg-mistral-tint/30 space-y-2.5">' +
      '<div class="flex flex-wrap items-center justify-between gap-2">' +
        '<div class="flex flex-wrap items-center gap-2">' +
          '<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ' + sevBadge + '">' + escapeHtml(f.severity) + '</span>' +
          '<span class="font-mono text-xs font-bold text-mistral-orange">' + escapeHtml(f.ruleId) + '</span>' +
          '<h4 class="text-xs sm:text-sm font-bold text-mistral-text">' + escapeHtml(f.title) + '</h4>' +
        '</div>' +
        '<span class="text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-600 font-semibold">⚖️ ' + escapeHtml(f.penalty2026) + '</span>' +
      '</div>' +
      '<div class="flex flex-wrap items-center gap-3 text-[11px] font-mono text-mistral-muted">' +
        '<span>📄 Dosya: <strong class="text-mistral-text">' + escapeHtml(f.file) + ':' + f.line + '</strong></span>' +
        '<span>🏛️ Dayanak: <strong class="text-mistral-text">' + escapeHtml(f.legalBasis) + '</strong></span>' +
      '</div>' +
      '<p class="text-xs text-mistral-text leading-relaxed">' + escapeHtml(f.finding) + '</p>' +
      '<div class="grid grid-cols-1 lg:grid-cols-2 gap-2.5 pt-1">' +
        '<div><div class="text-[10px] font-mono font-bold uppercase text-red-600 mb-1">❌ Tespit Edilen Kod / Durum</div>' +
        '<pre class="kvkk-code-block bg-red-950/90 text-red-100">' + escapeHtml(f.snippet) + '</pre></div>' +
        '<div><div class="text-[10px] font-mono font-bold uppercase text-emerald-600 mb-1">✅ Privacy-by-Design Uyumlu Çözüm (' + escapeHtml(f.remediation) + ')</div>' +
        '<pre class="kvkk-code-block bg-emerald-950/90 text-emerald-100">' + escapeHtml(f.fixCode || f.remediation) + '</pre></div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function filterFindings(sev) {
  renderFindingsList(sev);
}

function switchScanTab(tab) {
  SCAN_STATE.activeTab = tab;
  ['folder', 'github', 'code', 'url'].forEach(t => {
    const btn = document.getElementById('tab-btn-' + t);
    const panel = document.getElementById('scan-panel-' + t);
    if (btn) btn.classList.toggle('active', t === tab);
    if (panel) panel.classList.toggle('hidden', t !== tab);
  });
}

const ALLOWED_EXT = /\.(sql|ts|tsx|js|jsx|mjs|cjs|py|php|html|htm|vue|svelte|css|scss|env|example|md|json|yaml|yml)$/i;
const IGNORED_DIRS = /(^|\/)(\.git|node_modules|\.next|dist|build|vendor|__pycache__|coverage)(\/|$)/i;

async function readBrowserFileList(fileList) {
  const loaded = [];
  const maxFiles = 250;
  for (let i = 0; i < fileList.length && loaded.length < maxFiles; i++) {
    const file = fileList[i];
    const relPath = file.webkitRelativePath || file.name;
    if (IGNORED_DIRS.test(relPath)) continue;
    if (!ALLOWED_EXT.test(relPath) && !relPath.includes('.env')) continue;
    if (file.size > 512 * 1024) continue;
    try {
      const text = await file.text();
      loaded.push({ path: relPath, content: text });
    } catch (_) {}
  }
  return loaded;
}

async function handleFolderSelect(e) {
  const files = await readBrowserFileList(e.target.files || []);
  SCAN_STATE.files = files;
  const summary = document.getElementById('selected-files-summary');
  const txt = document.getElementById('selected-files-text');
  summary.classList.remove('hidden');
  txt.textContent = files.length + ' kaynak dosya analize hazır';
  runProjectAudit();
}

async function handleFilesSelect(e) {
  const files = await readBrowserFileList(e.target.files || []);
  SCAN_STATE.files = files;
  const summary = document.getElementById('selected-files-summary');
  const txt = document.getElementById('selected-files-text');
  summary.classList.remove('hidden');
  txt.textContent = files.length + ' dosya analize hazır';
  runProjectAudit();
}

function runProjectAudit() {
  if (!SCAN_STATE.files || SCAN_STATE.files.length === 0) return;
  const findings = analyzeProjectFiles(SCAN_STATE.files);
  evaluateAndRenderFindings(SCAN_STATE.files, findings);
}

function scanPastedCode() {
  const filename = document.getElementById('code-filename-input').value.trim() || 'snippet.tsx';
  const content = document.getElementById('code-paste-input').value;
  if (!content.trim()) return;
  const files = [{ path: filename, content: content }];
  const findings = analyzeProjectFiles(files);
  evaluateAndRenderFindings(files, findings);
}

async function scanGithubRepository() {
  const rawInput = document.getElementById('github-repo-input').value.trim();
  const token = document.getElementById('github-token-input').value.trim();
  if (!rawInput) return;

  const cleaned = rawInput.replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/+$/, '');
  const parts = cleaned.split('/');
  if (parts.length < 2) {
    alert('Lütfen kullanici/repo veya https://github.com/kullanici/repo formatında girin.');
    return;
  }
  const owner = parts[0];
  const repo = parts[1];

  const btn = document.getElementById('btn-scan-github');
  const origText = btn.textContent;
  btn.textContent = '⏳ Repo Dosyaları Çekiliyor...';
  btn.disabled = true;

  try {
    const headers = { 'Accept': 'application/vnd.github+json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const repoRes = await fetch('https://api.github.com/repos/' + owner + '/' + repo, { headers });
    if (!repoRes.ok) throw new Error('GitHub repo bilgisi alınamadı (HTTP ' + repoRes.status + ')');
    const repoInfo = await repoRes.json();
    const defaultBranch = repoInfo.default_branch || 'main';

    const treeRes = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/git/trees/' + defaultBranch + '?recursive=1', { headers });
    if (!treeRes.ok) throw new Error('Repo dosya ağacı alınamadı (HTTP ' + treeRes.status + ')');
    const treeData = await treeRes.json();

    const candidateBlobs = (treeData.tree || [])
      .filter(item => item.type === 'blob' && !IGNORED_DIRS.test(item.path) && ALLOWED_EXT.test(item.path) && (item.size || 0) < 180000)
      .slice(0, 45);

    const files = [];
    await Promise.all(candidateBlobs.map(async (blob) => {
      try {
        const rawUrl = 'https://raw.githubusercontent.com/' + owner + '/' + repo + '/' + defaultBranch + '/' + blob.path;
        const r = await fetch(rawUrl);
        if (r.ok) {
          const content = await r.text();
          files.push({ path: blob.path, content: content });
        }
      } catch (_) {}
    }));

    const findings = analyzeProjectFiles(files);
    evaluateAndRenderFindings(files, findings);
  } catch (err) {
    alert('GitHub tarama hatası: ' + (err.message || err));
  } finally {
    btn.textContent = origText;
    btn.disabled = false;
  }
}

async function scanLiveWebsite() {
  const urlInput = document.getElementById('live-url-input').value.trim();
  if (!urlInput) return;

  const btn = document.getElementById('btn-scan-url');
  const origText = btn.textContent;
  btn.textContent = '⏳ Site Denetleniyor...';
  btn.disabled = true;

  try {
    const basePath = window.location.pathname.replace(/\/+$/, '');
    const apiEndpoint = basePath.includes('kvkk-gdpr-scanner') ? basePath + '/api/scan-url' : '/api/scan-url';

    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlInput })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'URL taranamadı.');

    const files = [{ path: data.url, content: data.html || '' }];
    const findings = analyzeProjectFiles(files);

    const cookies = data.setCookies || [];
    cookies.forEach((ck, idx) => {
      const low = ck.toLowerCase();
      if (!low.includes('httponly') || !low.includes('secure')) {
        findings.push({
          ruleId: 'KVKK-COOK-002',
          domainId: 'COOKIES_TRACKERS',
          severity: 'MEDIUM',
          title: 'Set-Cookie Başlığında HttpOnly veya Secure Bayrağı Eksik',
          legalBasis: 'KVKK m.12 · GDPR Art. 32 · KVKK Çerez Rehberi',
          penalty2026: '256.357 TL – 17.092.242 TL',
          file: 'HTTP Response Header (Set-Cookie #' + (idx + 1) + ')',
          line: 1,
          snippet: ck,
          finding: 'Sunucu tarafından gönderilen çerezde Secure veya HttpOnly bayrağı eksik.',
          remediation: 'Tüm oturum ve tercih çerezlerinde Secure; HttpOnly; SameSite=Lax bayraklarını zorunlu kılın.',
          fixCode: 'Set-Cookie: session_id=...; Path=/; Secure; HttpOnly; SameSite=Lax'
        });
      }
    });

    evaluateAndRenderFindings(files, findings);
  } catch (err) {
    alert('Canlı site denetimi hatası: ' + (err.message || err));
  } finally {
    btn.textContent = origText;
    btn.disabled = false;
  }
}

function loadSampleSnippet(type) {
  switchScanTab('code');
  const fileEl = document.getElementById('code-filename-input');
  const codeEl = document.getElementById('code-paste-input');

  if (type === 'rls') {
    fileEl.value = 'supabase/migrations/001_init.sql';
    codeEl.value = '-- ÖRNEK İHLALLİ VERİTABANI ŞEMASI (KVKK m.12 & m.6)\nCREATE TABLE public.customer_profiles (\n  id UUID PRIMARY KEY,\n  full_name TEXT,\n  email TEXT,\n  phone TEXT,\n  tc_kimlik TEXT,\n  saglik_verisi TEXT\n);\n-- RLS açılmamış! Ayrıca ön yüzde service_role kullanılmış:\n-- const supabase = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);';
  } else if (type === 'form') {
    fileEl.value = 'src/components/RegisterForm.tsx';
    codeEl.value = 'export function RegisterForm() {\n  return (\n    <form action="/api/register" method="POST">\n      <input type="email" name="email" required />\n      <input type="tel" name="phone" required />\n      <label>\n        <input type="checkbox" name="kvkk_and_marketing" defaultChecked={true} required />\n        Aydınlatma metnini okudum kabul ediyorum ve kampanya/pazarlama e-postası gönderilmesine onay veriyorum.\n      </label>\n      <button type="submit">Kayıt Ol</button>\n    </form>\n  );\n}';
  } else if (type === 'email') {
    fileEl.value = 'src/jobs/sendCampaign.ts';
    codeEl.value = 'export async function sendPromoCampaign() {\n  const users = await db.query("SELECT email, full_name FROM public.users");\n  for (const user of users.rows) {\n    await resend.emails.send({\n      from: "kampanya@ornek.com",\n      to: user.email,\n      subject: "Büyük Kasım İndirimi!",\n      html: "<p>Hemen alışverişe başlayın!</p>"\n    });\n  }\n}';
  } else {
    fileEl.value = 'src/app/layout.tsx';
    codeEl.value = 'export default function RootLayout({ children }) {\n  console.log("Yeni kullanıcı isteği:", req.body);\n  const aiRes = await openai.chat.completions.create({\n    model: "gpt-4o",\n    messages: [{ role: "user", content: user.fullName + " " + user.tckn }]\n  });\n  return (\n    <html>\n      <head>\n        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />\n        <script async src="https://www.googletagmanager.com/gtag/js?id=G-12345678"></script>\n      </head>\n      <body>{children}</body>\n    </html>\n  );\n}';
  }
  scanPastedCode();
}

function loadSampleVulnerableProject() {
  const demoFiles = [
    {
      path: 'supabase/migrations/20261110_init.sql',
      content: 'CREATE TABLE public.users (\n  id UUID PRIMARY KEY,\n  email TEXT NOT NULL,\n  phone TEXT,\n  saglik_verisi TEXT\n);\n-- RLS kapalı bırakılmış!\n'
    },
    {
      path: 'src/components/SignupForm.tsx',
      content: 'import { createClient } from "@supabase/supabase-js";\nconst supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!);\n\nexport function SignupForm() {\n  return (\n    <form method="POST" action="/api/signup">\n      <input type="email" name="email" required />\n      <label>\n        <input type="checkbox" name="consent" defaultChecked={true} required />\n        Aydınlatma metnini kabul ediyorum ve kampanya/pazarlama bülteni almak istiyorum.\n      </label>\n    </form>\n  );\n}'
    },
    {
      path: 'src/app/layout.tsx',
      content: 'export default function Layout({ children }) {\n  return (\n    <html>\n      <head>\n        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />\n        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>\n      </head>\n      <body>{children}</body>\n    </html>\n  );\n}'
    },
    {
      path: 'src/api/checkout.ts',
      content: 'export async function createCheckout(req, res) {\n  console.log("Checkout payload:", req.body);\n  const session = await stripe.checkout.sessions.create({ mode: "subscription" });\n  const deleted = await db.query("UPDATE public.users SET deleted_at = now() WHERE id = $1", [req.user.id]);\n  await resend.emails.send({ to: req.user.email, subject: "Kampanya", html: "<p>Fırsat!</p>" });\n  return res.json({ url: session.url });\n}'
    }
  ];

  const findings = analyzeProjectFiles(demoFiles);
  evaluateAndRenderFindings(demoFiles, findings);
}

function getAIConfig() {
  try {
    const rawKvkk = localStorage.getItem('kvkk_ai_config');
    if (rawKvkk) {
      const parsed = JSON.parse(rawKvkk);
      return {
        provider: parsed.provider || 'gemini',
        model: parsed.model || 'gemini-3.8-flash',
        api_key: parsed.api_key || '',
        service_account_json: parsed.service_account_json || (parsed.auth && parsed.auth.type === 'service_account' ? parsed.auth.value : '') || '',
        project_id: parsed.project_id || '',
        region: parsed.region || 'global',
        auth_type: parsed.auth_type || (parsed.auth && parsed.auth.type) || 'service_account',
        base_url: parsed.base_url || '',
        redact_pii: parsed.redact_pii !== false
      };
    }
  } catch (_) {}
  return {
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    api_key: '',
    service_account_json: '',
    project_id: '',
    region: 'global',
    auth_type: 'service_account',
    base_url: '',
    redact_pii: true
  };
}

function hasValidAICredential(cfg) {
  if (!cfg) return false;
  if (cfg.provider === 'ollama' || cfg.provider === 'custom') return true;
  if (cfg.provider === 'vertex') {
    if (cfg.auth_type === 'api_key') return !!(cfg.api_key && cfg.api_key.length > 5);
    return !!(cfg.service_account_json && cfg.service_account_json.includes('private_key'));
  }
  return !!(cfg.api_key && cfg.api_key.length > 5);
}

function updateAIStatusButton() {
  const cfg = getAIConfig();
  const dot = document.getElementById('ai-status-dot');
  const label = document.getElementById('ai-status-label');
  if (!dot || !label) return;
  if (hasValidAICredential(cfg) && (cfg.api_key || cfg.service_account_json)) {
    dot.className = 'w-2 h-2 rounded-full bg-emerald-500';
    label.textContent = 'AI Hazır (' + cfg.provider.toUpperCase() + ' · ' + cfg.model + ')';
  } else {
    dot.className = 'w-2 h-2 rounded-full bg-amber-500';
    label.textContent = 'AI Ayarları';
  }
}

function setModelPreset(name) {
  const modelEl = document.getElementById('ai-model');
  if (modelEl) modelEl.value = name;
}

function syncAIModalFieldVisibility() {
  const p = document.getElementById('ai-provider')?.value || 'gemini';
  const authType = document.getElementById('ai-auth-type')?.value || 'service_account';
  const vertexFields = document.getElementById('ai-vertex-fields');
  const baseUrlBox = document.getElementById('ai-base-url-container');
  const authLabel = document.getElementById('ai-auth-label');
  const apiKeyInput = document.getElementById('ai-api-key');
  const saTextarea = document.getElementById('ai-service-account-json');

  if (vertexFields) vertexFields.classList.toggle('hidden', p !== 'vertex');
  if (baseUrlBox) baseUrlBox.classList.toggle('hidden', !(p === 'openai' || p === 'ollama' || p === 'custom'));

  const useServiceAccount = (p === 'vertex' && authType === 'service_account');
  if (apiKeyInput) apiKeyInput.classList.toggle('hidden', useServiceAccount);
  if (saTextarea) saTextarea.classList.toggle('hidden', !useServiceAccount);

  if (authLabel) {
    if (p === 'vertex') {
      authLabel.textContent = useServiceAccount
        ? 'Vertex Service Account JSON İçeriği'
        : 'Vertex AI API Anahtarı';
    } else if (p === 'gemini') {
      authLabel.textContent = 'Google Gemini API Anahtarı (AIza...)';
    } else if (p === 'anthropic') {
      authLabel.textContent = 'Anthropic API Anahtarı (sk-ant-...)';
    } else if (p === 'openrouter') {
      authLabel.textContent = 'OpenRouter API Anahtarı (sk-or-...)';
    } else if (p === 'ollama') {
      authLabel.textContent = 'API Anahtarı (Yerel Ollama için boş bırakılabilir)';
    } else {
      authLabel.textContent = 'API Anahtarı (sk-...)';
    }
  }
}

function openAIConfigModal() {
  const cfg = getAIConfig();
  document.getElementById('ai-provider').value = cfg.provider || 'gemini';
  document.getElementById('ai-model').value = cfg.model || 'gemini-3.8-flash';
  document.getElementById('ai-api-key').value = cfg.api_key || '';
  const saEl = document.getElementById('ai-service-account-json');
  if (saEl) saEl.value = cfg.service_account_json || '';
  const projEl = document.getElementById('ai-project-id');
  if (projEl) projEl.value = cfg.project_id || '';
  const regEl = document.getElementById('ai-region');
  if (regEl) regEl.value = cfg.region || 'global';
  const authTypeEl = document.getElementById('ai-auth-type');
  if (authTypeEl) authTypeEl.value = cfg.auth_type || 'service_account';
  document.getElementById('ai-base-url').value = cfg.base_url || '';
  document.getElementById('ai-redact-pii').checked = cfg.redact_pii !== false;
  syncAIModalFieldVisibility();
  document.getElementById('ai-config-modal').classList.remove('hidden');
}

function closeAIConfigModal() {
  document.getElementById('ai-config-modal').classList.add('hidden');
}

function onAuthTypeChange() {
  syncAIModalFieldVisibility();
}

function onAIProviderChange() {
  const p = document.getElementById('ai-provider').value;
  const m = document.getElementById('ai-model');
  const baseEl = document.getElementById('ai-base-url');
  const regEl = document.getElementById('ai-region');

  if (p === 'gemini' || p === 'vertex') m.value = 'gemini-3.8-flash';
  else if (p === 'openai') {
    m.value = 'gpt-4o';
    if (baseEl && (!baseEl.value || baseEl.value.includes('localhost:11434'))) baseEl.value = 'https://api.openai.com/v1';
  } else if (p === 'anthropic') m.value = 'claude-sonnet-4-5';
  else if (p === 'openrouter') m.value = 'google/gemini-3.8-flash';
  else if (p === 'groq') m.value = 'llama-3.3-70b-versatile';
  else if (p === 'ollama') {
    m.value = 'gemma3:12b';
    if (baseEl && (!baseEl.value || baseEl.value.includes('api.openai.com'))) baseEl.value = 'http://localhost:11434/v1';
  }

  if (p === 'vertex' && regEl && !regEl.value) {
    regEl.value = 'global';
  }
  syncAIModalFieldVisibility();
}

function saveAIConfig() {
  const provider = document.getElementById('ai-provider').value;
  const authType = document.getElementById('ai-auth-type')?.value || 'service_account';
  const saJson = (document.getElementById('ai-service-account-json')?.value || '').trim();
  let projectId = (document.getElementById('ai-project-id')?.value || '').trim();

  if (provider === 'vertex' && authType === 'service_account' && saJson && !projectId) {
    try {
      const parsedSa = JSON.parse(saJson);
      if (parsedSa && parsedSa.project_id) projectId = parsedSa.project_id;
    } catch (_) {}
  }

  const apiKey = document.getElementById('ai-api-key').value.trim();
  const cfg = {
    provider: provider,
    model: document.getElementById('ai-model').value.trim() || 'gemini-3.8-flash',
    api_key: apiKey,
    service_account_json: saJson,
    project_id: projectId,
    region: (document.getElementById('ai-region')?.value || 'global').trim() || 'global',
    auth_type: authType,
    auth: {
      type: authType,
      value: (provider === 'vertex' && authType === 'service_account') ? saJson : apiKey
    },
    base_url: document.getElementById('ai-base-url').value.trim(),
    redact_pii: document.getElementById('ai-redact-pii').checked
  };
  localStorage.setItem('kvkk_ai_config', JSON.stringify(cfg));
  updateAIStatusButton();
  closeAIConfigModal();
}

function clearAIConfig() {
  localStorage.removeItem('kvkk_ai_config');
  updateAIStatusButton();
  closeAIConfigModal();
}

async function callLLMWithConfig(systemPrompt, userPrompt) {
  const cfg = getAIConfig();
  if (!hasValidAICredential(cfg)) {
    openAIConfigModal();
    throw new Error('Lütfen önce AI Ayarları penceresinden API anahtarınızı veya Vertex kimlik bilginizi kaydedin.');
  }

  const finalUserPrompt = cfg.redact_pii !== false ? maskPIIAndSecrets(userPrompt) : userPrompt;
  const basePath = window.location.pathname.replace(/\/+$/, '');
  const apiEndpoint = basePath.includes('kvkk-gdpr-scanner') ? basePath + '/api/ai-analyze' : '/api/ai-analyze';

  const res = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ai_config: cfg, system_prompt: systemPrompt, user_prompt: finalUserPrompt })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'LLM yanıtı alınamadı.');
  return data.reply;
}

async function runAILegalAudit() {
  const panel = document.getElementById('ai-audit-panel');
  const loading = document.getElementById('ai-report-loading');
  const output = document.getElementById('ai-report-output');

  panel.classList.remove('hidden');
  loading.classList.remove('hidden');
  output.textContent = '';

  const systemPrompt = 'Sen kıdemli bir Bilişim & Veri Koruma Hukukçusu (6698 KVKK, AB GDPR, 6563 ETK/İYS, 6502 TKHK uzmanı) ve Principal Privacy-by-Design Yazılım Mühendisisin. Tespit edilen bulguları inceleyerek: 1) Yönetici Özeti ve 2026 Ceza Risk Analizi, 2) Her bulgu için somut hukuki gerekçe ve kopyalanabilir DÜZELTİLMİŞ KOD YAMASI, 3) Yayına çıkmadan önce Öncelikli Eylem Planı sun.';
  const findingsSummary = SCAN_STATE.findings.map((f, i) =>
    (i + 1) + '. [' + f.severity + '] ' + f.ruleId + ' - ' + f.title + ' (Dosya: ' + f.file + ':' + f.line + ') | Dayanak: ' + f.legalBasis + ' | Ceza: ' + f.penalty2026 + '\nKod:\n' + f.snippet
  ).join('\n\n');

  const userPrompt = 'Proje Uyum Skoru: ' + SCAN_STATE.score + '/100 (Not: ' + SCAN_STATE.grade + ')\nTaranan Dosya Sayısı: ' + SCAN_STATE.files.length + '\nToplam İhlal Sayısı: ' + SCAN_STATE.findings.length + '\n\nTespit Edilen Bulgular:\n' + (findingsSummary || 'Doğrudan statik ihlal bulunmadı.') + '\n\nLütfen bu projeyi KVKK ve GDPR açısından denetle ve uygulanabilir kod yamalarını üret.';

  try {
    const reply = await callLLMWithConfig(systemPrompt, userPrompt);
    SCAN_STATE.lastAIReport = reply;
    output.textContent = reply;
  } catch (err) {
    output.textContent = '⚠️ AI Analiz Hatası: ' + (err.message || err);
  } finally {
    loading.classList.add('hidden');
  }
}

async function generateAIDocument(docType) {
  const panel = document.getElementById('ai-audit-panel');
  const loading = document.getElementById('ai-report-loading');
  const output = document.getElementById('ai-report-output');
  panel.classList.remove('hidden');
  loading.classList.remove('hidden');

  const fileNames = SCAN_STATE.files.map(f => f.path).join(', ');
  const prompt = docType === 'aydinlatma'
    ? 'Bu yazılım projesi (Dosyalar: ' + fileNames + ') için KVKK Madde 10 ve GDPR Madde 13 uyumlu Katmanlı Aydınlatma Metni ve 6563 ETK uyumlu Ticari Elektronik İleti Açık Rıza Metni taslağını Markdown olarak hazırla.'
    : 'Bu yazılım projesi (Dosyalar: ' + fileNames + ') için KVK Kurulu 2019/10 sayılı Kararı (72 Saat Kuralı) ve GDPR Madde 33-34 uyumlu docs/veri-ihlali-mudahale-plani.md dosyasını saat saat eylem planıyla hazırla.';

  try {
    const reply = await callLLMWithConfig('Sen KVKK ve GDPR uzmanı bir bilişim hukukçususun.', prompt);
    SCAN_STATE.lastAIReport = reply;
    output.textContent = reply;
  } catch (err) {
    output.textContent = '⚠️ Belge Üretim Hatası: ' + (err.message || err);
  } finally {
    loading.classList.add('hidden');
  }
}

async function sendAIFollowup() {
  const input = document.getElementById('ai-followup-input');
  const question = input.value.trim();
  if (!question) return;
  input.value = '';

  const loading = document.getElementById('ai-report-loading');
  const output = document.getElementById('ai-report-output');
  loading.classList.remove('hidden');

  try {
    const context = SCAN_STATE.findings.map(f => f.ruleId + ': ' + f.title + ' (' + f.file + ':' + f.line + ')').join('; ');
    const reply = await callLLMWithConfig('Sen KVKK, GDPR, 6563 ETK ve Privacy-by-Design kodlama uzmanısın.', 'Mevcut Proje Bulguları: ' + context + '\n\nKullanıcı Sorusu: ' + question);
    output.textContent = (SCAN_STATE.lastAIReport ? SCAN_STATE.lastAIReport + '\n\n---\n\n' : '') + '💬 Soru: ' + question + '\n\n' + reply;
    SCAN_STATE.lastAIReport = output.textContent;
  } catch (err) {
    output.textContent += '\n\n⚠️ Hata: ' + (err.message || err);
  } finally {
    loading.classList.add('hidden');
  }
}

function copyAIReport() {
  if (!SCAN_STATE.lastAIReport) return;
  navigator.clipboard.writeText(SCAN_STATE.lastAIReport);
}

function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 200);
}

function exportComplianceMarkdown() {
  const now = new Date().toISOString();
  let md = '# ⚖️ KVKK & GDPR Uyum Denetim Raporu\n\n';
  md += '- **Tarih:** ' + now + '\n';
  md += '- **Uyum Skoru:** ' + SCAN_STATE.score + ' / 100 (Not: **' + SCAN_STATE.grade + '**)\n';
  md += '- **Taranan Dosya Sayısı:** ' + SCAN_STATE.files.length + '\n';
  md += '- **Toplam Bulgu:** ' + SCAN_STATE.findings.length + '\n';
  md += '- **2026 TR İdari Para Cezası Riski:** ' + SCAN_STATE.trMinPenalty.toLocaleString('tr-TR') + ' TL – ' + SCAN_STATE.trMaxPenalty.toLocaleString('tr-TR') + ' TL\n\n';
  md += '## 📋 10 Maddelik Özet Uyum Tablosu\n\n';
  md += '| Denetim Alanı | Mevzuat Dayanağı | Durum | 2026 Ceza Riski | Bulgu Özeti |\n';
  md += '| :--- | :--- | :---: | :--- | :--- |\n';
  SCAN_STATE.domainSummary.forEach(r => {
    md += '| ' + r.title + ' | ' + r.legalBasis + ' | **' + r.status + '** | ' + (r.findingsCount > 0 ? r.penaltyText : '—') + ' | ' + r.summary + ' |\n';
  });
  md += '\n## 🔍 Detaylı Teknik Bulgular ve Çözüm Önerileri\n\n';
  SCAN_STATE.findings.forEach((f, idx) => {
    md += '### ' + (idx + 1) + '. [' + f.severity + '] ' + f.ruleId + ' — ' + f.title + '\n';
    md += '- **Dosya ve Satır:** `' + f.file + ':' + f.line + '`\n';
    md += '- **Yasal Dayanak:** ' + f.legalBasis + '\n';
    md += '- **2026 Ceza Karşılığı:** ' + f.penalty2026 + '\n';
    md += '- **Tespit:** ' + f.finding + '\n';
    md += '- **Önerilen Düzeltme:** ' + f.remediation + '\n\n';
    md += '```\n' + (f.fixCode || f.remediation) + '\n```\n\n';
  });
  if (SCAN_STATE.lastAIReport) {
    md += '\n## 🤖 AI Hukukçu & Privacy Mühendisi Analizi\n\n' + SCAN_STATE.lastAIReport + '\n';
  }
  downloadBlob('kvkk-gdpr-uyum-raporu.md', md, 'text/markdown;charset=utf-8');
}

function exportComplianceJSON() {
  downloadBlob('kvkk-gdpr-uyum-raporu.json', JSON.stringify(SCAN_STATE, null, 2), 'application/json;charset=utf-8');
}

function exportBreachPlanTemplate() {
  const tpl = '# 🚨 Kişisel Veri İhlali Müdahale ve 72 Saat Bildirim Planı\n\n**Yasal Dayanak:** 6698 Sayılı KVKK m.12/5, KVK Kurulu 24.01.2019 tarih ve 2019/10 sayılı Kararı ve AB GDPR Madde 33-34.\n\n## 1. Kritik Süre Kuralı (72 Saat)\nVeri ihlalinin öğrenildiği andan itibaren gecikmeksizin ve **en geç 72 SAAT içinde** Kişisel Verileri Koruma Kuruluna (https://ihlalbildirimi.kvkk.gov.tr/) ve ilgili kişilere bildirim yapılması zorunludur.\n\n## 2. Saat Saat Eylem Planı\n- **0 – 4. Saat (İzolasyon & Kanıt Koruma):** Sızan anahtarları (service_role, JWT secret) derhal iptal et/döndür, RLS politikalarını kilitle, audit_logs kayıtlarını salt-okunur yedekle.\n- **4 – 24. Saat (Etki Analizi):** Etkilenen kişi sayısını ve veri kategorilerini tespit et.\n- **24 – 48. Saat (Form Hazırlığı):** KVKK Kişisel Veri İhlali Bildirim Formunu hazırla.\n- **48 – 72. Saat (Resmi Bildirim & Tebligat):** Kurul bildirimini tamamla ve etkilenen kullanıcılara şeffaf bildirim yap.\n';
  downloadBlob('veri-ihlali-mudahale-plani.md', tpl, 'text/markdown;charset=utf-8');
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  updateAIStatusButton();
});
