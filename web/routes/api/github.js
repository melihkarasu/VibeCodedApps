const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');

// =============================================================
// 9. GitHub Profil Analitiği & Dinamik SVG Kart API Endpoints
// =============================================================
const githubCache = new Map();

router.get('/github/user', async (req, res) => {
  const username = (req.query.username || '').trim().replace(/^@/, '');

  // Strix Güvenlik Denetimi: Sıkı GitHub Kullanıcı Adı Regex Doğrulaması (SSRF ve Enjeksiyon Engeli)
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
    return res.status(400).json({ success: false, error: 'Geçersiz GitHub kullanıcı adı formatı' });
  }

  const cacheKey = username.toLowerCase();
  if (githubCache.has(cacheKey)) {
    const cached = githubCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 15 * 60 * 1000) {
      return res.json(cached.data);
    }
  }

  try {
    const headers = { 'User-Agent': 'VibeCodedApps/1.0 (dev@vibecodedapps.local)' };

    // Kullanıcı bilgisi, sahip olduğu repolar ve YILDIZLADIĞI (starred) repoları çek
    const [uRes, rRes, sRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers, signal: AbortSignal.timeout(6000) }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`, { headers, signal: AbortSignal.timeout(6000) }),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/starred?per_page=100`, { headers, signal: AbortSignal.timeout(6000) })
    ]);

    if (!uRes.ok) {
      return res.status(404).json({ success: false, error: 'GitHub kullanıcısı bulunamadı' });
    }

    const user = await uRes.json();
    const repos = rRes.ok ? await rRes.json() : [];
    const starredRaw = sRes.ok ? await sRes.json() : [];

    // İstatistik hesaplamaları (Sahip olunan repolar)
    let totalStarsEarned = 0;
    let totalForks = 0;
    const langCounts = {};

    if (Array.isArray(repos)) {
      repos.forEach(r => {
        totalStarsEarned += (r.stargazers_count || 0);
        totalForks += (r.forks_count || 0);
        if (r.language) {
          langCounts[r.language] = (langCounts[r.language] || 0) + 1;
        }
      });
    }

    // Kullanıcının Yıldızladığı (Starred) Repolar
    const starredRepos = Array.isArray(starredRaw) ? starredRaw.map(s => ({
      name: s.name,
      full_name: s.full_name,
      html_url: s.html_url,
      description: s.description,
      language: s.language,
      stargazers_count: s.stargazers_count,
      forks_count: s.forks_count,
      owner: {
        login: s.owner?.login,
        avatar_url: s.owner?.avatar_url
      }
    })) : [];

    // 1. Kullanıcının Bizzat Yazdığı Repoların Dilleri (Owned Languages)
    const totalOwnedWithLang = Object.values(langCounts).reduce((a, b) => a + b, 0);
    const languages = {};
    Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([lang, count]) => {
        languages[lang] = totalOwnedWithLang > 0 ? Math.round((count / totalOwnedWithLang) * 100) : 0;
      });

    // 2. Takip Edilen / Yıldızlanan Projelerin Dilleri (Starred Languages)
    const starredLangCounts = {};
    if (starredRepos.length > 0) {
      starredRepos.forEach(s => {
        if (s.language) {
          starredLangCounts[s.language] = (starredLangCounts[s.language] || 0) + 1;
        }
      });
    }
    const totalStarredWithLang = Object.values(starredLangCounts).reduce((a, b) => a + b, 0);
    const starredLanguages = {};
    Object.entries(starredLangCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([lang, count]) => {
        starredLanguages[lang] = totalStarredWithLang > 0 ? Math.round((count / totalStarredWithLang) * 100) : 0;
      });

    // En popüler sahip olunan repolar
    const topRepos = Array.isArray(repos) 
      ? [...repos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)).slice(0, 6)
      : [];

    const result = {
      success: true,
      user: {
        login: user.login,
        name: user.name || user.login,
        avatar_url: user.avatar_url,
        html_url: user.html_url,
        bio: user.bio,
        company: user.company,
        location: user.location,
        blog: user.blog,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
        created_at: user.created_at
      },
      totalStars: totalStarsEarned,
      totalStarsEarned,
      totalStarred: starredRepos.length,
      starredCount: starredRepos.length,
      totalForks,
      languages,
      starredLanguages,
      hasOwnedLanguages: Object.keys(languages).length > 0,
      hasStarredLanguages: Object.keys(starredLanguages).length > 0,
      topRepos,
      starredRepos
    };

    githubCache.set(cacheKey, { data: result, timestamp: Date.now() });
    res.json(result);
  } catch(err) {
    res.status(500).json({ success: false, error: 'GitHub analizi sırasında hata oluştu' });
  }
});

// Dinamik SVG Kart Üretici (GET /api/github/card)
router.get('/github/card', async (req, res) => {
  const user = (req.query.user || 'melihkarasu').trim().replace(/^@/, '');
  const theme = (req.query.theme || 'dark').toLowerCase();

  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(user)) {
    return res.status(400).send('Invalid username');
  }

  // Önbellekten veya API'den veri al
  let stats = null;
  const cacheKey = user.toLowerCase();
  if (githubCache.has(cacheKey)) {
    stats = githubCache.get(cacheKey).data;
  } else {
    try {
      const resp = await fetch(`http://127.0.0.1:3000/api/github/user?username=${encodeURIComponent(user)}`);
      if (resp.ok) stats = await resp.json();
    } catch(e) {}
  }

  const uName = stats?.user?.name || user;
  const uLogin = stats?.user?.login || user;
  const starsEarned = stats?.totalStarsEarned || 0;
  const starredCount = stats?.starredCount || 0;
  const displayStars = starsEarned > 0 ? starsEarned : starredCount;
  const starsLabel = starsEarned > 0 ? 'YILDIZLAR' : 'YILDIZLANAN';
  const repos = stats?.user?.public_repos || (starredCount > 0 ? starredCount : 0);
  const followers = stats?.user?.followers || 0;
  const topLang = stats?.languages ? (Object.keys(stats.languages)[0] || 'Genel') : 'Genel';

  // Tema Renkleri
  const themes = {
    dark: { bg1: '#0f172a', bg2: '#1e293b', border: '#334155', title: '#f8fafc', accent: '#a855f7', text: '#94a3b8' },
    cyberpunk: { bg1: '#080811', bg2: '#161129', border: '#ec4899', title: '#06b6d4', accent: '#ec4899', text: '#cbd5e1' },
    emerald: { bg1: '#062016', bg2: '#0b3524', border: '#10b981', title: '#34d399', accent: '#10b981', text: '#a7f3d0' },
    slate: { bg1: '#18181b', bg2: '#27272a', border: '#3f3f46', title: '#f4f4f5', accent: '#38bdf8', text: '#a1a1aa' }
  };
  const t = themes[theme] || themes.dark;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="190" viewBox="0 0 460 190" fill="none">
    <rect width="460" height="190" rx="16" fill="${t.bg1}" stroke="${t.border}" stroke-width="1.5"/>
    
    <!-- Başlık ve Kullanıcı -->
    <text x="24" y="38" fill="${t.title}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="16" font-weight="800">${uName}</text>
    <text x="24" y="56" fill="${t.accent}" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="12" font-weight="600">@${uLogin}</text>

    <!-- İstatistik Kutuları -->
    <g transform="translate(24, 76)">
      <!-- Stars -->
      <rect x="0" y="0" width="95" height="52" rx="10" fill="${t.bg2}"/>
      <text x="12" y="20" fill="${t.text}" font-family="-apple-system,sans-serif" font-size="9" font-weight="700">${starsLabel}</text>
      <text x="12" y="40" fill="#fbbf24" font-family="-apple-system,sans-serif" font-size="15" font-weight="800">⭐ ${displayStars}</text>

      <!-- Repos -->
      <rect x="105" y="0" width="95" height="52" rx="10" fill="${t.bg2}"/>
      <text x="117" y="20" fill="${t.text}" font-family="-apple-system,sans-serif" font-size="9" font-weight="700">REPOLAR</text>
      <text x="117" y="40" fill="#f8fafc" font-family="-apple-system,sans-serif" font-size="15" font-weight="800">📦 ${repos}</text>

      <!-- Followers -->
      <rect x="210" y="0" width="95" height="52" rx="10" fill="${t.bg2}"/>
      <text x="222" y="20" fill="${t.text}" font-family="-apple-system,sans-serif" font-size="9" font-weight="700">TAKİPÇİLER</text>
      <text x="222" y="40" fill="${t.accent}" font-family="-apple-system,sans-serif" font-size="15" font-weight="800">👥 ${followers}</text>

      <!-- Lider Dil -->
      <rect x="315" y="0" width="95" height="52" rx="10" fill="${t.bg2}"/>
      <text x="327" y="20" fill="${t.text}" font-family="-apple-system,sans-serif" font-size="9" font-weight="700">LİDER DİL</text>
      <text x="327" y="40" fill="${t.title}" font-family="-apple-system,sans-serif" font-size="13" font-weight="800">${topLang.slice(0, 9)}</text>
    </g>

    <!-- Alt Bilgi Çubuğu -->
    <path d="M24 150 L436 150" stroke="${t.border}" stroke-width="1"/>
    <text x="24" y="172" fill="${t.text}" font-family="-apple-system,sans-serif" font-size="10" font-weight="500">VibeCodedApps • GitHub Developer Stats</text>
    <text x="436" y="172" text-anchor="end" fill="${t.accent}" font-family="-apple-system,sans-serif" font-size="10" font-weight="700">● LIVE STATS</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=900');
  res.send(svg);
});

module.exports = router;
