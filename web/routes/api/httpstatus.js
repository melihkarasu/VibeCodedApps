const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');

// =============================================================
// 33. HTTP Status Codes & Geliştirici Teşhis Kütüphanesi
// =============================================================
const HTTP_CODES = [
  { code: 200, title: 'OK', category: '2xx Başarılı', desc: 'İstek başarıyla karşılandı ve yanıt gövdesi istemciye iletildi.', catImg: 'https://http.cat/200' },
  { code: 201, title: 'Created', category: '2xx Başarılı', desc: 'İstek başarılı oldu ve sunucuda yeni bir kaynak oluşturuldu (ör. POST kaydı).', catImg: 'https://http.cat/201' },
  { code: 204, title: 'No Content', category: '2xx Başarılı', desc: 'İstek başarılı oldu ancak geri dönecek herhangi bir gövde (body) içeriği yok.', catImg: 'https://http.cat/204' },
  { code: 301, title: 'Moved Permanently', category: '3xx Yönlendirme', desc: 'İstenen kaynak kalıcı olarak yeni bir URL adresine taşındı; SEO için kritik.', catImg: 'https://http.cat/301' },
  { code: 304, title: 'Not Modified', category: '3xx Yönlendirme', desc: 'Kaynak önbellekten beri değişmedi (ETag/Cache-Control), tekrar indirilmez.', catImg: 'https://http.cat/304' },
  { code: 400, title: 'Bad Request', category: '4xx İstemci Hatası', desc: 'Sunucu, geçersiz sözdizimi veya eksik parametre nedeniyle isteği işleyemedi.', catImg: 'https://http.cat/400' },
  { code: 401, title: 'Unauthorized', category: '4xx İstemci Hatası', desc: 'Kimlik doğrulama gereklidir; geçerli bir Bearer Token veya API anahtarı eksik.', catImg: 'https://http.cat/401' },
  { code: 403, title: 'Forbidden', category: '4xx İstemci Hatası', desc: 'Kimlik doğrulansa dahi kullanıcının bu kaynağa erişim yetkisi (RBAC) bulunmuyor.', catImg: 'https://http.cat/403' },
  { code: 404, title: 'Not Found', category: '4xx İstemci Hatası', desc: 'İstenen uç nokta veya kaynak sunucuda bulunamadı.', catImg: 'https://http.cat/404' },
  { code: 418, title: "I'm a Teapot", category: '4xx Esprili / RFC 2324', desc: '1 Nisan 1998 HTCPFC protokolü şakası: "Ben bir çaydanlığım, kahve yapamam."', catImg: 'https://http.cat/418' },
  { code: 429, title: 'Too Many Requests', category: '4xx İstemci Hatası', desc: 'Hız limiti (Rate Limit) aşıldı; istemci belirlenen sürede çok fazla istek gönderdi.', catImg: 'https://http.cat/429' },
  { code: 500, title: 'Internal Server Error', category: '5xx Sunucu Hatası', desc: 'Sunucu tarafında beklenmeyen bir istisna (crash/exception) meydana geldi.', catImg: 'https://http.cat/500' },
  { code: 502, title: 'Bad Gateway', category: '5xx Sunucu Hatası', desc: 'Ters vekil (Reverse Proxy / Nginx), arka uç uygulamasından geçersiz yanıt aldı.', catImg: 'https://http.cat/502' },
  { code: 503, title: 'Service Unavailable', category: '5xx Sunucu Hatası', desc: 'Sunucu aşırı yük altında veya bakım modunda olduğundan geçici olarak kapalı.', catImg: 'https://http.cat/503' }
];

router.get('/http/statuses', (req, res) => {
  res.json({
    success: true,
    count: HTTP_CODES.length,
    statuses: HTTP_CODES
  });
});

module.exports = router;
