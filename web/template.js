// Common page template for VibeCodedApps - Mistral AI Design System (DESIGN.md)
// Modüler Mimari: Global stiller /static/css/mistral-theme.css ve ortak JS /static/js/core.js dosyalarına ayrıştırılmıştır.
const pageTemplate = (title, content, extraHead = '') => `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - VibeCodedApps</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <!-- Precompiled Tailwind CSS (Zero Runtime / No CDN Delay) -->
  <link rel="stylesheet" href="/static/css/tailwind.min.css">
  <!-- Global Mistral AI Theme (Cache Destekli Statik CSS) -->
  <link rel="stylesheet" href="/static/css/mistral-theme.css">
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
  <!-- Favicon: Koyu Zemin Üzerinde Beyaz MK -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%231c1917' stroke='%2344403c' stroke-width='1.5'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='-apple-system,BlinkMacSystemFont,Inter,sans-serif' font-weight='800' font-size='13' letter-spacing='-0.5'%3EMK%3C/text%3E%3C/svg%3E">
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
  <!-- Top Navigation (Mistral AI Header) -->
  <header class="border-b border-mistral-hairline bg-white/95 backdrop-blur sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <a href="/" class="flex items-center gap-2.5 text-mistral-ink hover:text-mistral-orange transition font-semibold text-lg tracking-tight">
          <span class="w-8 h-8 rounded-lg bg-stone-900 border border-stone-700/80 text-white flex items-center justify-center gap-0.5 shadow-xs select-none">
            <wa-icon name="m" style="color: rgb(255, 255, 255); font-size: 13px;"></wa-icon>
            <wa-icon name="k" style="color: rgb(255, 255, 255); font-size: 13px;"></wa-icon>
          </span>
          <span class="font-bold tracking-tight">VIBE CODED APPS</span>
        </a>
      </div>
      <div id="auth-nav" class="flex items-center gap-3">
        <a href="/auth" class="text-xs sm:text-sm px-4 py-2 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white font-medium transition shadow-sm">
          Giriş Yap (SSO)
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
                nav.innerHTML = '<div class="flex items-center gap-2.5 sm:gap-3">' +
                  (p.email && p.email.toLowerCase() === process.env.ADMIN_EMAIL ? '<a href="/admin" class="text-xs px-2.5 py-1.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold transition flex items-center gap-1 shadow-2xs"><span>⚙️</span><span>Yönetim</span></a>' : '') +
                  (avatar ? '<img src="' + avatar + '" class="w-7 h-7 rounded-full border border-mistral-orange shadow-sm object-cover" alt="Avatar">' : '<div class="w-7 h-7 rounded-full bg-mistral-cream border border-mistral-beige-deep text-mistral-ink flex items-center justify-center text-xs font-bold">👤</div>') +
                  '<span class="text-xs sm:text-sm font-semibold text-mistral-ink max-w-[120px] sm:max-w-[180px] truncate">' + name + '</span>' +
                  '<button type="button" onclick="logout()" class="text-xs px-2.5 py-1.5 rounded-md bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition font-medium cursor-pointer">Çıkış</button>' +
                '</div>';
              }
            }
          } catch(e) {}
        })();
      </script>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
    ${content}
  </main>

  <!-- Mistral Signature Sunset Stripe Band -->
  <div class="sunset-stripe mt-auto"></div>

  <!-- Footer (Mistral Cream Surface) -->
  <footer class="bg-mistral-cream border-t border-mistral-beige-deep py-8 px-6 text-mistral-slate text-sm">
    <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <a href="/" class="flex items-center gap-3 text-mistral-ink hover:text-mistral-orange transition">
          <span class="w-7 h-7 rounded-lg bg-stone-900 border border-stone-700/80 text-white flex items-center justify-center gap-0.5 shadow-xs select-none">
            <wa-icon name="m" style="color: rgb(255, 255, 255); font-size: 11px;"></wa-icon>
            <wa-icon name="k" style="color: rgb(255, 255, 255); font-size: 11px;"></wa-icon>
          </span>
          <span class="font-bold text-mistral-ink tracking-tight">VIBE CODED APPS</span>
        </a>
      </div>
      <div>
        <a href="https://github.com/melihkarasu" target="_blank" rel="noopener" class="text-xs font-semibold text-mistral-ink hover:text-mistral-orange transition flex items-center gap-1.5">
          <i class="fa-brands fa-github text-sm"></i>
          <span>GitHub</span>
        </a>
      </div>
    </div>
  </footer>

  <!-- Global Auth Guard Overlay (Giriş Yapmamış Kullanıcılar İçin Sayfa Kilidi) -->
  <div id="page-auth-guard" class="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4" style="display: none;">
    <div class="bg-white max-w-md w-full rounded-2xl border border-mistral-hairline p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200">
      <div class="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl mb-4 mx-auto shadow-2xs">
        🔒
      </div>
      <h3 class="text-2xl font-bold font-editorial text-mistral-ink mb-2">
        Oturum Açmanız Gerekiyor
      </h3>
      <p class="text-mistral-slate text-sm leading-relaxed mb-6">
        Bu uygulamayı kullanabilmek ve kişisel verilerinizi tüm cihazlarınızda güvenle saklayabilmek için lütfen giriş yapın.
      </p>
      <div class="space-y-3">
        <a id="auth-guard-gh-btn" href="/auth/v1/authorize?provider=github" class="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-medium transition shadow-sm cursor-pointer">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          <span>GitHub ile Giriş Yap</span>
        </a>
        <a id="auth-guard-gg-btn" href="/auth/v1/authorize?provider=google" class="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium transition border border-mistral-hairline shadow-sm cursor-pointer">
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
  <script data-cfasync="false" src="/static/js/core.js?v=20260922"></script>
</body>
</html>
`;

module.exports = pageTemplate;
