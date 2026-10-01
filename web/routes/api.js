/**
 * VibeCodedApps Modular API Orchestrator (web/routes/api.js)
 * 36 mikro servis alt modüllere (web/routes/api/*.js) ayrıştırılmıştır.
 * Tüm rotalar ve şemalar geriye dönük tam uyumludur (Zero-Breaking-Change).
 */
const express = require('express');
const router = express.Router();

// 1. Döviz & Piyasa
router.use('/', require('./api/tcmb'));
router.use('/', require('./api/kripto'));

// 2. Kültür, Edebiyat & Sanat
router.use('/', require('./api/arena'));
router.use('/', require('./api/kutuphane'));
router.use('/', require('./api/seslikitap'));
router.use('/', require('./api/siir'));
router.use('/', require('./api/unesco'));
router.use('/', require('./api/nobel'));

// 3. Eğlence, Medya & Oyun
router.use('/', require('./api/sudoku'));
router.use('/', require('./api/dizi'));
router.use('/', require('./api/radyo'));
router.use('/', require('./api/gitar'));
router.use('/', require('./api/oyun'));
router.use('/', require('./api/oyunlib'));
router.use('/', require('./api/speedrun'));

// 4. Doğa, Çevre & Bilim
router.use('/', require('./api/carbon'));
router.use('/', require('./api/doga'));
router.use('/', require('./api/molekul'));
router.use('/', require('./api/iss'));
router.use('/', require('./api/atlas'));
router.use('/', require('./api/openaq'));
router.use('/', require('./api/deniz'));
router.use('/', require('./api/sayilar'));
router.use('/', require('./api/evcil'));
router.use('/', require('./api/bisiklet'));
router.use('/', require('./api/food'));

// 5. Geliştirici & Ağ Teşhisi Araçları
router.use('/', require('./api/security'));
router.use('/', require('./api/dns'));
router.use('/', require('./api/github'));
router.use('/', require('./api/ipgeo'));
router.use('/', require('./api/renk'));
router.use('/', require('./api/httpstatus'));

// 6. Kimlik Doğrulama, Kullanıcı & Sağlık
router.use('/', require('./api/auth'));
router.use('/', require('./api/favorites'));
router.use('/', require('./api/user-data'));
router.use('/admin', require('./api/admin'));
router.use('/', require('./api/eczane'));
router.use('/', require('./api/ilac'));
router.use('/', require('./api/egzersiz'));
router.use('/', require('./api/klinik'));
router.use('/', require('./api/dso'));

module.exports = router;
