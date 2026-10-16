// Common page template for VibeCodedApps - Mistral AI Design System (DESIGN.md)
// Modüler Mimari: Global stiller /static/css/mistral-theme.css ve ortak JS /static/js/core.js dosyalarına ayrıştırılmıştır.
const pageTemplate = (title, content, extraHead = '') => `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <script>
  (function() {
    try {
      var rawHash = window.location.hash || '';
      var rawSearch = window.location.search || '';
      var tokenStr = '', refreshTokenStr = '';
      if (rawHash.indexOf('access_token=') !== -1) {
        var hp = new URLSearchParams(rawHash.charAt(0) === '#' ? rawHash.substring(1) : rawHash);
        tokenStr = hp.get('access_token') || '';
        refreshTokenStr = hp.get('refresh_token') || '';
      } else if (rawSearch.indexOf('access_token=') !== -1) {
        var sp = new URLSearchParams(rawSearch.charAt(0) === '?' ? rawSearch.substring(1) : rawSearch);
        tokenStr = sp.get('access_token') || '';
        refreshTokenStr = sp.get('refresh_token') || '';
      }
      var isAuthPage = window.location.pathname === '/auth' || window.location.pathname === '/app/auth';
      if (tokenStr) {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, null, window.location.pathname);
        }
        try { localStorage.setItem('vibe_token', tokenStr); } catch(e) {}
        if (refreshTokenStr) { try { localStorage.setItem('vibe_refresh_token', refreshTokenStr); } catch(e) {} }
        try {
          var parts = tokenStr.split('.');
          var b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          var pld = JSON.parse(decodeURIComponent(escape(atob(b64))));
          var um = pld.user_metadata || {};
          var prof = { id: pld.sub || '', name: um.full_name || um.name || um.user_name || pld.email || 'Kullanici', avatar: um.avatar_url || '', email: pld.email || '' };
          localStorage.setItem('vibe_user', JSON.stringify(prof));
          document.cookie = 'vibe_user=' + encodeURIComponent(JSON.stringify(prof)) + '; path=/; max-age=31536000; SameSite=Lax';
          document.cookie = 'vibe_token=' + encodeURIComponent(tokenStr) + '; path=/; max-age=31536000; SameSite=Lax';
          window.__vibe_user = prof;
        } catch(e) {}
        if (isAuthPage) { document.documentElement.style.display = 'none'; window.location.replace('/'); return; }
      } else if (isAuthPage) {
        var existing = '';
        try { existing = localStorage.getItem('vibe_token') || ''; } catch(e) {}
        if (existing) { document.documentElement.style.display = 'none'; window.location.replace('/'); return; }
      }
    } catch(e) {}
  })();
  </script>
  <title>${title} - VibeCodedApps</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <!-- Precompiled Tailwind CSS (Zero Runtime / No CDN Delay) -->
  <link rel="stylesheet" href="/static/css/tailwind.min.css">
  <!-- Global Mistral AI Theme (Cache Destekli Statik CSS) -->
  <link rel="stylesheet" href="/static/css/mistral-theme.css?v=20261015b">
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
  <!-- Favicon: Koyu Zemin Üzerinde Beyaz MK -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23fa520f'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='-apple-system,BlinkMacSystemFont,Inter,sans-serif' font-weight='800' font-size='13' letter-spacing='-0.5'%3EMK%3C/text%3E%3C/svg%3E">
  <!-- Web Awesome <wa-icon> Custom Element Desteği -->
  <script>
    if (typeof customElements !== 'undefined' && !customElements.get('wa-icon')) {
      customElements.define('wa-icon', class extends HTMLElement {
        connectedCallback() {
          var name = this.getAttribute('name');
          this.style.display = 'inline-flex';
          this.style.alignItems = 'center';
          this.style.justifyContent = 'center';
          this.style.lineHeight = '1';
          if (!this.innerHTML.trim() && name) {
            this.innerHTML = '<i class="fa-solid fa-' + name + '"></i>';
          }
        }
      });
    }
  </script>
  <!-- Immediate OAuth Hash Fragment Token Capture & URL Sanitizer -->
  <script data-cfasync="false">
    (function() {
      try {
        var h = window.location.hash || '';
        var s = window.location.search || '';
        if (h.indexOf('access_token=') !== -1 || s.indexOf('access_token=') !== -1) {
          var p = new URLSearchParams(h.indexOf('access_token=') !== -1 ? (h.charAt(0) === '#' ? h.substring(1) : h) : (s.charAt(0) === '?' ? s.substring(1) : s));
          var at = p.get('access_token');
          var rt = p.get('refresh_token');
          if (at) {
            try { localStorage.setItem('vibe_token', at); } catch(e) {}
            if (rt) { try { localStorage.setItem('vibe_refresh_token', rt); } catch(e) {} }
          }
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            window.location.hash = '';
          }
        }
      } catch(e) {}
    })();
  </script>
  ${extraHead}
</head>
<body class="bg-mistral-canvas text-mistral-ink min-h-screen flex flex-col antialiased selection:bg-mistral-orange selection:text-white">
  <!-- Mistral Signature Sunset Stripe -->
  <div class="sunset-stripe"></div>

  <!-- Top Navigation (Modern Glassmorphism Header) -->
  <header class="border-b border-stone-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <a href="/" class="flex items-center gap-3 text-mistral-ink hover:text-mistral-orange transition group min-w-0">
          <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-mistral-orange to-amber-600 text-white flex items-center justify-center shadow-sm shrink-0 select-none" style="background: linear-gradient(135deg, #FA520F 0%, #EA580C 60%, #D97706 100%); box-shadow: 0 4px 12px -2px rgba(250, 82, 15, 0.35);">
            <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </span>
          <div class="min-w-0">
            <span class="font-extrabold text-sm sm:text-base tracking-tight block truncate">VIBE CODED APPS</span>
            <span class="text-[10px] text-stone-500 font-mono hidden sm:block">Açık Kaynak Mikro Uygulama Vitrini</span>
          </div>
        </a>
      </div>
      <div id="auth-nav" class="flex items-center gap-2">
        <a href="/auth" class="vibe-btn vibe-btn-sm vibe-btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          <span>Giriş Yap (SSO)</span>
        </a>
      </div>
      <script>
        (function() {
          try {
            var raw = localStorage.getItem('vibe_user');
            if (raw) {
              var p = JSON.parse(raw);
              var nav = document.getElementById('auth-nav');
              if (nav && p && (p.name || p.email)) {
                var name = p.name || 'Kullanıcı';
                var avatar = p.avatar || '';
                var userIconSvg = '<svg class="w-3.5 h-3.5 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
                var gearIconSvg = '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
                nav.innerHTML = '<div class="flex items-center gap-2 sm:gap-2.5">' +
                  '<a href="/admin" id="admin-nav-btn" class="hidden vibe-btn vibe-btn-xs vibe-btn-amber">' + gearIconSvg + '<span>Yönetim</span></a>' +
                  '<div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-stone-50 border border-stone-200">' +
                    (avatar ? '<img src="' + avatar + '" class="w-6 h-6 rounded-full border border-mistral-orange object-cover shrink-0" alt="Avatar">' : '<div class="w-6 h-6 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">' + userIconSvg + '</div>') +
                    '<span class="text-xs font-semibold text-mistral-ink max-w-[96px] sm:max-w-[160px] truncate">' + name + '</span>' +
                  '</div>' +
                  '<button type="button" onclick="logout()" class="vibe-btn vibe-btn-xs vibe-btn-secondary">Çıkış</button>' +
                '</div>';
                var token = localStorage.getItem('vibe_token');
                if (token) {
                  fetch('/api/admin/check', { headers: { 'Authorization': 'Bearer ' + token } })
                    .then(function(r) { return r.json(); })
                    .then(function(d) {
                      if (d && d.isAdmin) {
                        var btn = document.getElementById('admin-nav-btn');
                        if (btn) btn.classList.remove('hidden');
                      }
                    })
                    .catch(function() {});
                }
              }
            }
          } catch(e) {}
        })();
      </script>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
    ${content}
  </main>

  <!-- Mistral Signature Sunset Stripe Band -->
  <div class="sunset-stripe mt-auto"></div>

  <!-- Footer (Mistral Cream Surface) -->
  <footer class="bg-mistral-cream border-t border-mistral-beige-deep py-6 px-4 sm:px-6 text-mistral-slate text-xs sm:text-sm">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <a href="/" class="flex items-center gap-2.5 text-mistral-ink hover:text-mistral-orange transition">
          <span class="w-7 h-7 rounded-lg text-white flex items-center justify-center shadow-xs select-none" style="background: linear-gradient(135deg, #FA520F 0%, #D97706 100%);">
            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          </span>
          <span class="font-bold text-mistral-ink tracking-tight">VIBE CODED APPS</span>
        </a>
        <span class="text-stone-400">•</span>
        <span class="text-xs text-stone-600">45 Açık Kaynak Mikro Uygulama</span>
      </div>
      <div class="flex items-center gap-3">
        <a href="https://github.com/melihkarasu/VibeCodedApps" target="_blank" rel="noopener" class="vibe-btn vibe-btn-xs vibe-btn-secondary">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          <span>GitHub</span>
        </a>
      </div>
    </div>
  </footer>

  <!-- Global Auth Guard Overlay (Giriş Yapmamış Kullanıcılar İçin Sayfa Kilidi) -->
  <div id="page-auth-guard" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4" style="display: none;">
    <div class="bg-white max-w-md w-full rounded-2xl border border-mistral-hairline p-6 sm:p-8 shadow-2xl text-center">
      <div class="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-mistral-orange flex items-center justify-center mb-4 mx-auto shadow-xs">
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h3 class="text-2xl font-bold font-editorial text-mistral-ink mb-2">
        Oturum Açmanız Gerekiyor
      </h3>
      <p class="text-mistral-slate text-sm leading-relaxed mb-6">
        Bu uygulamayı kullanabilmek ve kişisel verilerinizi tüm cihazlarınızda güvenle saklayabilmek için lütfen giriş yapın.
      </p>
      <div class="space-y-3">
        <a id="auth-guard-gh-btn" href="/auth/v1/authorize?provider=github" class="vibe-btn vibe-btn-dark w-full !py-3">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          <span>GitHub ile Giriş Yap</span>
        </a>
        <a id="auth-guard-gg-btn" href="/auth/v1/authorize?provider=google" class="vibe-btn vibe-btn-secondary w-full !py-3">
          <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          <span>Google ile Giriş Yap</span>
        </a>
        <a href="/" class="block pt-2 text-xs text-mistral-slate hover:text-mistral-orange transition font-semibold">
          &larr; Ana Sayfaya Dön
        </a>
      </div>
    </div>
  </div>

  <script data-cfasync="false">
    (function() {
      try {
        var p = window.location.pathname;
        var isPublic = p === '/' || p === '/auth' || p === '/app/auth' || p === '/app' || p === '/admin' || p === '/app/admin';
        if (!isPublic) {
          var user = localStorage.getItem('vibe_user');
          if (!user) {
            var guard = document.getElementById('page-auth-guard');
            if (guard) {
              guard.style.display = 'flex';
              var target = encodeURIComponent(window.location.pathname + window.location.search);
              var gh = document.getElementById('auth-guard-gh-btn');
              if (gh) gh.href = '/auth/v1/authorize?provider=github&redirect_to=' + target;
              var gg = document.getElementById('auth-guard-gg-btn');
              if (gg) gg.href = '/auth/v1/authorize?provider=google&redirect_to=' + target;
            }
          }
        }
      } catch(e) {}
    })();
  </script>

  <!-- Global Core Utilities & SSO Authentication (Cache Destekli Statik JS) -->
  <script data-cfasync="false" src="/static/js/core.js?v=20261002a"></script>
</body>
</html>
`;

module.exports = pageTemplate;
