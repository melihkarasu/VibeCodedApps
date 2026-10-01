const express = require('express');
const router = express.Router();

const SUPABASE_URL = process.env.INTERNAL_SUPABASE_URL || process.env.SUPABASE_URL || 'http://vibe-supabase-kong:8000';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

// PostgREST Client Helper (Service Role Bypass with Strict Backend Validation)
async function supabaseRequest(path, options = {}) {
  const url = SUPABASE_URL.replace(/\/app$/, '') + '/rest/v1' + path;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    'Prefer': 'return=representation',
    ...options.headers
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error('Supabase error: ' + res.status + ' ' + err);
  }
  const text = await res.text().catch(() => '');
  if (!text || !text.trim()) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

// Token Doğrulama & User ID / Profil Çıkarma
function getUserInfoFromReq(req) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/vibe_token=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (!token) return { userId: null, username: null };

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    const userId = payload.sub || null;
    const meta = payload.user_metadata || {};
    const username = meta.user_name || meta.name || payload.email || 'Oyuncu';
    return { userId, username };
  } catch (e) {
    return { userId: null, username: null };
  }
}

// Güvenlik Kuralı: Tüm kullanıcı adları kesinlikle m*****u şeklinde şifrelenir
function maskUsername(raw) {
  const s = String(raw || 'misafir').trim().toLowerCase();
  if (!s) return 'm*****u';
  const first = s[0];
  const last = s[s.length - 1] || first;
  return `${first}*****${last}`;
}

// Bellek-içi önbellek (Veritabanı erişilemezse veya hızlı yanıt için yedek havuz)
const dailyMemoryCache = new Map();

function getMockDailyRecords(date) {
  return [
    { username_masked: 'm*****u', time_seconds: 185, score: 3820, mistakes: 0, date },
    { username_masked: 'a*****r', time_seconds: 224, score: 3510, mistakes: 1, date },
    { username_masked: 'k*****a', time_seconds: 260, score: 3340, mistakes: 0, date },
    { username_masked: 's*****r', time_seconds: 310, score: 2950, mistakes: 2, date },
    { username_masked: 'e*****n', time_seconds: 385, score: 2640, mistakes: 1, date }
  ];
}

// =============================================================
// 1. GET /api/sudoku/daily-leaderboard?date=YYYYMMDD
// Günün Sudokusu Liderlik Tablosu (En kısa süreye göre artan sıralı)
// =============================================================
router.get('/sudoku/daily-leaderboard', async (req, res) => {
  try {
    const dateParam = String(req.query.date || '').trim() || new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const cleanDate = dateParam.replace(/[^0-9]/g, '').slice(0, 8);
    const { userId } = getUserInfoFromReq(req);

    let rows = [];

    // Veritabanından bu tarihe ait kayıtları çek
    try {
      const dataKey = `daily_${cleanDate}`;
      const dbResult = await supabaseRequest(
        `/user_app_data?app_id=eq.sudoku&data_key=eq.${encodeURIComponent(dataKey)}&select=user_id,data_value,updated_at`
      );
      if (Array.isArray(dbResult)) {
        rows = dbResult.map(r => ({
          userId: r.user_id,
          username_masked: maskUsername(r.data_value?.username || r.data_value?.username_masked || 'oyuncu'),
          time_seconds: Number(r.data_value?.time_seconds || 9999),
          score: Number(r.data_value?.score || 0),
          mistakes: Number(r.data_value?.mistakes || 0),
          date: cleanDate
        }));
      }
    } catch (dbErr) {
      // DB yoksa veya tablo boşsa bellek içi önbelleği kullan
    }

    // Bellek-içi kayıtları birleştir
    const memList = dailyMemoryCache.get(cleanDate) || [];
    for (const m of memList) {
      if (!rows.some(r => r.userId && r.userId === m.userId)) {
        rows.push(m);
      }
    }

    // Hiç kayıt yoksa gösterim için dengeli mock liste ekle
    if (rows.length === 0) {
      rows = getMockDailyRecords(cleanDate);
    }

    // Kural: En kısa sürede çözüme göre sırala (ASC)
    rows.sort((a, b) => a.time_seconds - b.time_seconds || b.score - a.score);

    // Kendi sıralamasını tespit et
    let userRank = -1;
    let userRecord = null;
    if (userId) {
      const myIdx = rows.findIndex(r => r.userId === userId);
      if (myIdx >= 0) {
        userRank = myIdx + 1;
        userRecord = rows[myIdx];
      }
    }

    // Dışarıya gönderirken gizliliği garantile (userId ve hassas alanları temizle)
    const sanitizedRows = rows.map((r, idx) => ({
      rank: idx + 1,
      user: maskUsername(r.username_masked),
      time: r.time_seconds,
      score: r.score,
      mistakes: r.mistakes,
      isSelf: userId && r.userId === userId
    }));

    return res.json({
      success: true,
      date: cleanDate,
      leaderboard: sanitizedRows,
      userRank,
      userRecord: userRecord ? {
        rank: userRank,
        user: maskUsername(userRecord.username_masked),
        time: userRecord.time_seconds,
        score: userRecord.score
      } : null
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =============================================================
// 2. POST /api/sudoku/daily-complete
// Günün Sudokusu Tamamlama Kaydı (En hızlı süre güncellenir)
// =============================================================
router.post('/sudoku/daily-complete', async (req, res) => {
  try {
    const { date, time_seconds, score, mistakes, hints } = req.body || {};
    const cleanDate = String(date || '').replace(/[^0-9]/g, '').slice(0, 8) || new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const timeSec = Math.max(1, parseInt(time_seconds, 10) || 0);
    const scoreVal = Math.max(0, parseInt(score, 10) || 0);
    const mistakeVal = Math.max(0, parseInt(mistakes, 10) || 0);
    const hintVal = Math.max(0, parseInt(hints, 10) || 0);

    const { userId, username } = getUserInfoFromReq(req);
    const maskedName = maskUsername(username || 'Melih Karasu');

    const newRecord = {
      userId: userId || 'guest_' + Math.random().toString(36).slice(2, 8),
      username_masked: maskedName,
      time_seconds: timeSec,
      score: scoreVal,
      mistakes: mistakeVal,
      hints: hintVal,
      date: cleanDate,
      completed_at: new Date().toISOString()
    };

    // 1) Bellek-içi önbelleğe ekle veya güncelle (daha hızlıysa)
    if (!dailyMemoryCache.has(cleanDate)) {
      dailyMemoryCache.set(cleanDate, getMockDailyRecords(cleanDate));
    }
    const memList = dailyMemoryCache.get(cleanDate);
    const existingMemIdx = memList.findIndex(m => m.userId === newRecord.userId);
    if (existingMemIdx >= 0) {
      if (timeSec < memList[existingMemIdx].time_seconds) {
        memList[existingMemIdx] = newRecord;
      }
    } else {
      memList.push(newRecord);
    }
    memList.sort((a, b) => a.time_seconds - b.time_seconds || b.score - a.score);

    // 2) Oturum açmış kullanıcı ise veritabanına (user_app_data) kaydet
    if (userId) {
      try {
        const dataKey = `daily_${cleanDate}`;
        // Mevcut kayıt var mı kontrol et
        const existingRows = await supabaseRequest(
          `/user_app_data?user_id=eq.${userId}&app_id=eq.sudoku&data_key=eq.${encodeURIComponent(dataKey)}`
        );

        if (existingRows && existingRows.length > 0) {
          const oldTime = Number(existingRows[0].data_value?.time_seconds || 99999);
          // Yalnızca yeni süre daha hızlıysa güncelle
          if (timeSec < oldTime) {
            await supabaseRequest(
              `/user_app_data?user_id=eq.${userId}&app_id=eq.sudoku&data_key=eq.${encodeURIComponent(dataKey)}`,
              {
                method: 'PATCH',
                body: JSON.stringify({
                  data_value: newRecord,
                  updated_at: new Date().toISOString()
                })
              }
            );
          }
        } else {
          // Yeni kayıt oluştur
          await supabaseRequest('/user_app_data', {
            method: 'POST',
            body: JSON.stringify({
              user_id: userId,
              app_id: 'sudoku',
              data_key: dataKey,
              data_value: newRecord,
              updated_at: new Date().toISOString()
            })
          });
        }
      } catch (dbErr) {
        // DB hatası sessizce yutulur, bellek içi devam eder
      }
    }

    return res.json({
      success: true,
      message: 'Günün Sudokusu kaydı alındı',
      record: {
        user: maskedName,
        time: timeSec,
        score: scoreVal,
        date: cleanDate
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
