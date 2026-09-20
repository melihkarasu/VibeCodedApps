const fs = require('fs');
const path = require('path');

// Disk üzerindeki kalıcı JSON önbellek dizini (Docker volume ile /app/cache -> host/web/cache kalıcıdır)
const CACHE_DIR = path.join(__dirname, '../../cache');

if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch (e) {
    console.warn('[Cache] Dizin oluşturulamadı:', e.message);
  }
}

// Varsayılan önbellek ömrü: 24 Saat (Günde 1 kez güncelleme)
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

// Eski/süresi dolmuş artık dosyaları silme eşiği (3 gün)
// 3 gün saklama nedeni: Dış API arızalanırsa veya kesinti yaşarsa 2-3 günlük veri kurtarıcı yedek olarak kullanılır.
const PURGE_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

let lastPurgeTime = 0;

/**
 * Otomatik Çöp Toplama (Garbage Collection / Purge):
 * - Disk üzerinde birikmeyi önlemek için 3 günden eski tarihli ve geçersiz JSON dosyalarını otomatik siler.
 * - Sabit anahtarlı dosyalar (örn: dso_country_TUR.json, nobel_prizes_all.json) zaten aynı dosyanın
 *   üzerine yazıldığı için asla birikmez.
 * - Tarih bazlı (örn: nobetci_eczane_2026-09-20.json, tcmb_today_2026-09-20.json) veya eski arama dosyaları
 *   3 günü doldurunca diskten tamamen temizlenir.
 */
function purgeExpiredCacheFiles(maxAgeMs = PURGE_THRESHOLD_MS) {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const fullPath = path.join(CACHE_DIR, file);
      try {
        const stats = fs.statSync(fullPath);
        const age = now - stats.mtimeMs;
        if (age > maxAgeMs) {
          fs.unlinkSync(fullPath);
          deletedCount++;
        }
      } catch (err) {
        // Dosya okunamadıysa veya silindiyse yoksay
      }
    }

    if (deletedCount > 0) {
      console.log(`[Cache Purge] ${deletedCount} adet süresi dolmuş eski JSON dosyası temizlendi.`);
    }
  } catch (e) {
    console.warn('[Cache Purge Hatası]:', e.message);
  }
}

// Günde 1 kez otomatik temizlik kontrolü yap
function checkAndRunDailyPurge() {
  const now = Date.now();
  if (now - lastPurgeTime > 24 * 60 * 60 * 1000) {
    lastPurgeTime = now;
    purgeExpiredCacheFiles();
  }
}

/**
 * Dosya Tabanlı Kalıcı JSON Önbellek Yöneticisi
 * @param {string} key - Önbellek dosya anahtarı (örn: 'dso_country_TUR', 'nobetci_eczane')
 * @param {Function} fetchFn - Önbellek yoksa veya 24 saatten eskiyse çalıştırılacak async fonksiyon
 * @param {number} [ttlMs] - Geçerlilik süresi (varsayılan: 24 saat)
 * @returns {Promise<any>}
 */
async function getCachedJson(key, fetchFn, ttlMs = DEFAULT_TTL_MS) {
  // İstek geldiğinde arka planda periyodik temizlik kontrolünü tetikle
  checkAndRunDailyPurge();

  const safeFilename = key.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 80) + '.json';
  const filePath = path.join(CACHE_DIR, safeFilename);

  // 1. Dosya var mı ve TTL süresinden (24 saat) daha taze mi?
  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      const age = Date.now() - stats.mtimeMs;
      if (age < ttlMs) {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.warn(`[JSON Cache Oku Hatası] ${key}:`, e.message);
    }
  }

  // 2. Süresi dolmuşsa veya dosya yoksa taze veriyi çek
  try {
    const data = await fetchFn();
    if (data && (data.success !== false || typeof data === 'object')) {
      try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      } catch (err) {
        console.warn(`[JSON Cache Yaz Hatası] ${key}:`, err.message);
      }
    }
    return data;
  } catch (err) {
    // 3. Dış ağ hatasında diskteki mevcut JSON'u kurtarıcı (fail-safe) olarak kullan
    if (fs.existsSync(filePath)) {
      try {
        console.warn(`[JSON Cache Stale Fallback] ${key} dış servis hatası, yerel JSON kullanılıyor.`);
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
      } catch (e) {}
    }
    throw err;
  }
}

// Sunucu başladığında ilk temizlik taramasını yap
setTimeout(purgeExpiredCacheFiles, 5000);

module.exports = {
  getCachedJson,
  purgeExpiredCacheFiles,
  CACHE_DIR,
  DEFAULT_TTL_MS
};
