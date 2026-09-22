const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Statik Dosyalar (CSS, JS, Uygulama Varlıkları - Cache Destekli)
app.use('/static', express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// Ortak Sayfa Şablonu (Tailwind, Header, Zero-Flicker SSO Auth & Token Refresh)
const pageTemplate = require('./template');

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'vibe-web',
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// 1. Dahili Backend API Router (/api/*)
// -------------------------------------------------------------
app.use('/api', require('./routes/api'));

// -------------------------------------------------------------
// 2. Vitrin & SSO Auth Sayfaları (Ana Sayfa Doğrudan /)
// -------------------------------------------------------------
app.get('/', require('./routes/vitrin')(pageTemplate));
app.get('/app', (req, res) => res.redirect(301, '/'));

app.get(['/auth', '/app/auth'], require('./routes/auth')(pageTemplate));

// -------------------------------------------------------------
// 3. Mikro Uygulama Modülleri (Hem /:name hem /app/:name destekli)
// -------------------------------------------------------------
const routeMap = [
  { paths: ['/qr-studio', '/app/qr-studio'], route: './routes/qr' },
  { paths: ['/doviz-cevirici', '/app/doviz-cevirici'], route: './routes/doviz' },
  { paths: ['/lezzet-atolyesi', '/app/lezzet-atolyesi'], route: './routes/lezzet' },
  { paths: ['/sozden-sarkiya', '/app/sozden-sarkiya'], route: './routes/muzik' },
  { paths: ['/kultur-arena', '/app/kultur-arena'], route: './routes/kultur' },
  { paths: ['/dizi-rehberi', '/app/dizi-rehberi'], route: './routes/dizi' },
  { paths: ['/sanat-galerisi', '/app/sanat-galerisi'], route: './routes/sanat' },
  { paths: ['/tatil-takvimi', '/app/tatil-takvimi'], route: './routes/tatil' },
  { paths: ['/karbon-metre', '/app/karbon-metre'], route: './routes/karbon' },
  { paths: ['/tarim-hava', '/app/tarim-hava'], route: './routes/tarim' },
  { paths: ['/klasik-kutuphane', '/app/klasik-kutuphane'], route: './routes/kutuphane' },
  { paths: ['/kuresel-gostergeler', '/app/kuresel-gostergeler'], route: './routes/refah' },
  { paths: ['/oyun-radar', '/app/oyun-radar'], route: './routes/oyun' },
  { paths: ['/sizinti-kontrol', '/app/sizinti-kontrol'], route: './routes/sizinti' },
  { paths: ['/dns-kontrol', '/app/dns-kontrol'], route: './routes/dns' },
  { paths: ['/github-analitik', '/app/github-analitik'], route: './routes/github' },
  { paths: ['/doga-sesleri', '/app/doga-sesleri'], route: './routes/doga' },
  { paths: ['/molekul-studyosu', '/app/molekul-studyosu'], route: './routes/molekul' },
  { paths: ['/iss-takip', '/app/iss-takip'], route: './routes/iss' },
  { paths: ['/cografya-atlasi', '/app/cografya-atlasi'], route: './routes/atlas' },
  { paths: ['/hava-kalitesi', '/app/hava-kalitesi'], route: './routes/havakalite' },
  { paths: ['/oyun-arsivi', '/app/oyun-arsivi'], route: './routes/oyunlib' },
  { paths: ['/kripto-trend', '/app/kripto-trend'], route: './routes/kripto' },
  { paths: ['/ip-konum', '/app/ip-konum'], route: './routes/ipgeo' },
  { paths: ['/gida-alerji', '/app/gida-alerji'], route: './routes/gida' },
  { paths: ['/dunya-radyo', '/app/dunya-radyo'], route: './routes/radyo' },
  { paths: ['/sehir-bisiklet', '/app/sehir-bisiklet'], route: './routes/bisiklet' },
  { paths: ['/renk-studyosu', '/app/renk-studyosu'], route: './routes/renk' },
  { paths: ['/sayilar-atlasi', '/app/sayilar-atlasi'], route: './routes/sayilar' },
  { paths: ['/evcil-rehber', '/app/evcil-rehber'], route: './routes/evcil' },
  { paths: ['/deniz-dalga', '/app/deniz-dalga'], route: './routes/deniz' },
  { paths: ['/unesco-miras', '/app/unesco-miras'], route: './routes/unesco' },
  { paths: ['/sesli-kitap', '/app/sesli-kitap'], route: './routes/seslikitap' },
  { paths: ['/nobel-arsivi', '/app/nobel-arsivi'], route: './routes/nobel' },
  { paths: ['/oyun-rekorlari', '/app/oyun-rekorlari'], route: './routes/speedrun' },
  { paths: ['/gitar-akor', '/app/gitar-akor'], route: './routes/akor' },
  { paths: ['/siir-antolojisi', '/app/siir-antolojisi'], route: './routes/siir' },
  { paths: ['/http-status', '/app/http-status'], route: './routes/httpstatus' },
  { paths: ['/nobetci-eczane', '/app/nobetci-eczane'], route: './routes/eczane' },
  { paths: ['/ilac-rehberi', '/app/ilac-rehberi'], route: './routes/ilac' },
  { paths: ['/kas-anatomisi', '/app/kas-anatomisi'], route: './routes/egzersiz' },
  { paths: ['/klinik-arastirma', '/app/klinik-arastirma'], route: './routes/klinik' },
  { paths: ['/dso-saglik', '/app/dso-saglik'], route: './routes/dso' },
  { paths: ['/lezzet-atolyesi', '/app/lezzet-atolyesi'], route: './routes/lezzet' }
];

routeMap.forEach(item => {
  const handler = require(item.route)(pageTemplate);
  app.get(item.paths, handler);
});

// Sunucuyu Başlat
app.listen(port, () => {
  console.log(`VibeCodedApps web service running on port ${port}`);
});
