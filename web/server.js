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
// 2. Vitrin & SSO Auth Sayfaları
// -------------------------------------------------------------
app.get(['/', '/app'], require('./routes/vitrin')(pageTemplate));
app.get('/app/auth', require('./routes/auth')(pageTemplate));

// -------------------------------------------------------------
// 3. Mikro Uygulama Modülleri (/app/*)
// -------------------------------------------------------------
app.get('/app/qr-studio', require('./routes/qr')(pageTemplate));
app.get('/app/doviz-cevirici', require('./routes/doviz')(pageTemplate));
app.get('/app/lezzet-atolyesi', require('./routes/lezzet')(pageTemplate));
app.get('/app/sozden-sarkiya', require('./routes/muzik')(pageTemplate));
app.get('/app/kultur-arena', require('./routes/kultur')(pageTemplate));
app.get('/app/dizi-rehberi', require('./routes/dizi')(pageTemplate));
app.get('/app/sanat-galerisi', require('./routes/sanat')(pageTemplate));
app.get('/app/tatil-takvimi', require('./routes/tatil')(pageTemplate));
app.get('/app/karbon-metre', require('./routes/karbon')(pageTemplate));
app.get('/app/tarim-hava', require('./routes/tarim')(pageTemplate));
app.get('/app/klasik-kutuphane', require('./routes/kutuphane')(pageTemplate));
app.get('/app/kuresel-gostergeler', require('./routes/refah')(pageTemplate));
app.get('/app/oyun-radar', require('./routes/oyun')(pageTemplate));
app.get('/app/sizinti-kontrol', require('./routes/sizinti')(pageTemplate));
app.get('/app/dns-kontrol', require('./routes/dns')(pageTemplate));
app.get('/app/github-analitik', require('./routes/github')(pageTemplate));
app.get('/app/doga-sesleri', require('./routes/doga')(pageTemplate));
app.get('/app/molekul-studyosu', require('./routes/molekul')(pageTemplate));

// 9 Yeni Mikro Uygulama Rotası
app.get('/app/iss-takip', require('./routes/iss')(pageTemplate));
app.get('/app/cografya-atlasi', require('./routes/atlas')(pageTemplate));
app.get('/app/hava-kalitesi', require('./routes/havakalite')(pageTemplate));
app.get('/app/oyun-arsivi', require('./routes/oyunlib')(pageTemplate));
app.get('/app/kripto-trend', require('./routes/kripto')(pageTemplate));
app.get('/app/ip-konum', require('./routes/ipgeo')(pageTemplate));
app.get('/app/gida-alerji', require('./routes/gida')(pageTemplate));
app.get('/app/dunya-radyo', require('./routes/radyo')(pageTemplate));
app.get('/app/sehir-bisiklet', require('./routes/bisiklet')(pageTemplate));
app.get('/app/renk-studyosu', require('./routes/renk')(pageTemplate));
app.get('/app/sayilar-atlasi', require('./routes/sayilar')(pageTemplate));
app.get('/app/evcil-rehber', require('./routes/evcil')(pageTemplate));
app.get('/app/deniz-dalga', require('./routes/deniz')(pageTemplate));

// 4 Yeni Mikro Uygulama Rotası
app.get('/app/unesco-miras', require('./routes/unesco')(pageTemplate));
app.get('/app/sesli-kitap', require('./routes/seslikitap')(pageTemplate));
app.get('/app/nobel-arsivi', require('./routes/nobel')(pageTemplate));
app.get('/app/oyun-rekorlari', require('./routes/speedrun')(pageTemplate));

// 3 Yeni Mikro Uygulama Rotası (Akor, Şiir, HTTP Status)
app.get('/app/gitar-akor', require('./routes/akor')(pageTemplate));
app.get('/app/siir-antolojisi', require('./routes/siir')(pageTemplate));
app.get('/app/http-status', require('./routes/httpstatus')(pageTemplate));

// İzmir Büyükşehir Belediyesi Nöbetçi Eczane Radarı
app.get('/app/nobetci-eczane', require('./routes/eczane')(pageTemplate));

// İlaç & Prospektüs Rehberi (openFDA & RxNorm)
app.get('/app/ilac-rehberi', require('./routes/ilac')(pageTemplate));

// İnteraktif Kas Anatomisi & Egzersiz Rehberi (workout-cool & Wger)
app.get('/app/kas-anatomisi', require('./routes/egzersiz')(pageTemplate));

// Tıp Bilimi & Klinik Araştırmalar Radarı (NIH ClinicalTrials.gov v2)
app.get('/app/klinik-arastirma', require('./routes/klinik')(pageTemplate));

// Küresel Sağlık Atlası (Dünya Sağlık Örgütü - WHO GHO OData API)
app.get('/app/dso-saglik', require('./routes/dso')(pageTemplate));

// Sunucuyu Başlat
app.listen(port, () => {
  console.log(`VibeCodedApps web service running on port ${port}`);
});
