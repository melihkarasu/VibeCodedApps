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
        <a href="/app" class="flex items-center gap-2.5 text-mistral-ink hover:text-mistral-orange transition font-semibold text-lg tracking-tight">
          <span class="w-8 h-8 rounded-lg bg-stone-900 border border-stone-700/80 text-white flex items-center justify-center gap-0.5 shadow-xs select-none">
            <wa-icon name="m" style="color: rgb(255, 255, 255); font-size: 13px;"></wa-icon>
            <wa-icon name="k" style="color: rgb(255, 255, 255); font-size: 13px;"></wa-icon>
          </span>
          <span class="font-bold tracking-tight">VIBE CODED APPS</span>
        </a>
      </div>
      <div id="auth-nav" class="flex items-center gap-3">
        <a href="/app/auth" class="text-xs sm:text-sm px-4 py-2 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white font-medium transition shadow-sm">
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
        <span class="w-7 h-7 rounded-lg bg-stone-900 border border-stone-700/80 text-white flex items-center justify-center gap-0.5 shadow-xs select-none">
          <wa-icon name="m" style="color: rgb(255, 255, 255); font-size: 11px;"></wa-icon>
          <wa-icon name="k" style="color: rgb(255, 255, 255); font-size: 11px;"></wa-icon>
        </span>
        <span class="font-bold text-mistral-ink tracking-tight">VIBE CODED APPS</span>
      </div>
      <div>
        <a href="https://github.com/melihkarasu" target="_blank" rel="noopener" class="text-xs font-semibold text-mistral-ink hover:text-mistral-orange transition flex items-center gap-1.5">
          <i class="fa-brands fa-github text-sm"></i>
          <span>GitHub</span>
        </a>
      </div>
    </div>
  </footer>

  <!-- Global Core Utilities & SSO Authentication (Cache Destekli Statik JS) -->
  <script data-cfasync="false" src="/static/js/core.js?v=20260922"></script>
</body>
</html>
`;

module.exports = pageTemplate;
