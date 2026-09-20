const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');

// =============================================================
// 34. Hızlı / Demo SSO Oturum Açma (Melih Karasu)
// =============================================================
router.post('/auth/quick-login', (req, res) => {
  // Güvenlik Koruması (CWE-306): Üretim ortamında yetkisiz token üretimini engelle
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEMO_LOGIN !== 'true') {
    return res.status(403).json({
      success: false,
      error: 'Güvenlik Uyarısı: Hızlı demo girişi üretim ortamında devre dışıdır.'
    });
  }

  // Güvenlik Koruması (CWE-798): Sabit fallback anahtarını kaldır, fail-fast yap
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({
      success: false,
      error: 'Sunucu yapılandırma hatası: JWT_SECRET ortam değişkeni tanımlı değil.'
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: 'REDACTED',
    email: 'REDACTED',
    role: 'authenticated',
    aud: 'authenticated',
    exp: now + 30 * 86400, // 30 gün geçerli
    user_metadata: {
      full_name: 'Melih Karasu',
      name: 'Melih Karasu',
      avatar_url: 'https://avatars.githubusercontent.com/u/144457496?v=4',
      email: 'REDACTED'
    }
  })).toString('base64url');
  const crypto = require('crypto');
  const sig = crypto.createHmac('sha256', secret).update(header + '.' + payload).digest('base64url');
  const token = header + '.' + payload + '.' + sig;

  res.json({
    success: true,
    access_token: token,
    refresh_token: token,
    expires_in: 30 * 86400,
    user: {
      id: 'REDACTED',
      email: 'REDACTED',
      user_metadata: {
        full_name: 'Melih Karasu',
        name: 'Melih Karasu',
        avatar_url: 'https://avatars.githubusercontent.com/u/144457496?v=4',
        email: 'REDACTED'
      }
    }
  });
});

module.exports = router;
