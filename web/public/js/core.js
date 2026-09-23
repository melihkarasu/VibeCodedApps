/**
 * VibeCodedApps Core Utilities & Persistent SSO Authentication (core.js)
 * Ortak istemci yardımcıları, kalıcı oturum yönetimi, token yenileme ve global bildirimler.
 */

// 1. Global Bildirim (Toast) Sistemi
window.showToast = function(msg, duration = 3500) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-mistral-orange text-white font-bold text-xs shadow-2xl transition-all duration-300 z-50 transform translate-y-0 opacity-100 flex items-center gap-2 border border-mistral-orange-deep';
    document.body.appendChild(toast);
  }

  toast.innerHTML = '<span>⚡</span> <span>' + msg + '</span>';
  toast.classList.remove('hidden');
  toast.style.display = 'flex';

  if (window._toastTimeout) clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.style.display = 'none';
    toast.classList.add('hidden');
  }, duration);
};

// 2. Panoya Kopyalama Yardımcısı
window.copyToClipboard = function(text, successMsg = 'Panoya kopyalandı!') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      window.showToast('✓ ' + successMsg);
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
};

function fallbackCopy(text, successMsg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    window.showToast('✓ ' + successMsg);
  } catch (err) {
    window.showToast('Kopyalama başarısız oldu');
  }
  document.body.removeChild(ta);
}

// 3. Global Auth Yardımcıları
window.getAuthUser = function() {
  try {
    const raw = localStorage.getItem('vibe_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

window.isLoggedIn = function() {
  return !!window.getAuthUser();
};

window.notifyAuthChange = function(isAuth, user) {
  try {
    window.dispatchEvent(new CustomEvent('vibe_auth_change', {
      detail: { loggedIn: !!isAuth, user: user || null }
    }));
  } catch (e) {}
};

// Cookie senkronizasyonu
function syncAuthCookies(prof, token) {
  try {
    if (prof) {
      document.cookie = 'vibe_user=' + encodeURIComponent(JSON.stringify(prof)) + '; path=/; max-age=31536000; SameSite=Lax';
    }
    if (token) {
      document.cookie = 'vibe_token=' + encodeURIComponent(token) + '; path=/; max-age=31536000; SameSite=Lax';
    }
  } catch (e) {}
}

function clearAuthCookies() {
  try {
    document.cookie = 'vibe_user=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'vibe_token=; path=/; max-age=0; SameSite=Lax';
  } catch (e) {}
}

// JWT Çözümleme
function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

// 4. SSO Oturum Yönetimi & Supabase Token Refresh
(function() {
  const authNav = document.getElementById('auth-nav');

  function renderUserNav(profile) {
    const currentNav = document.getElementById('auth-nav');
    if (currentNav && profile) {
      const name = profile.name || 'Kullanıcı';
      const avatar = profile.avatar || '';
      currentNav.innerHTML = `
        <div class="flex items-center gap-2.5 sm:gap-3">
          ${avatar ? '<img src="' + avatar + '" class="w-7 h-7 rounded-full border border-mistral-orange shadow-sm object-cover" alt="Avatar">' : '<div class="w-7 h-7 rounded-full bg-mistral-cream border border-mistral-beige-deep text-mistral-ink flex items-center justify-center text-xs font-bold">👤</div>'}
          <span class="text-xs sm:text-sm font-semibold text-mistral-ink max-w-[120px] sm:max-w-[180px] truncate">${name}</span>
          <button type="button" onclick="logout()" class="text-xs px-2.5 py-1.5 rounded-md bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink border border-mistral-beige-deep transition font-medium cursor-pointer">Çıkış</button>
        </div>
      `;
    }

    const authCard = document.getElementById('auth-card');
    if (authCard && profile) {
      const name = profile.name || 'Kullanıcı';
      const avatar = profile.avatar || '';
      authCard.innerHTML = `
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-mistral-orange shadow-lg">
            ${avatar ? '<img src="' + avatar + '" class="w-full h-full object-cover">' : '<div class="w-full h-full bg-slate-200 flex items-center justify-center text-3xl">👤</div>'}
          </div>
          <h3 class="text-xl font-bold font-editorial text-mistral-ink">${name}</h3>
          <p class="text-sm text-mistral-slate mb-6">${profile.email || ''}</p>
          <div class="p-3 mb-6 rounded-md bg-mistral-cream border border-mistral-beige-deep text-mistral-ink text-xs font-medium">
            ✓ Oturumunuz açık durumda. Tüm mikro uygulamalara tam erişiminiz mevcuttur.
          </div>
          <div class="flex justify-center gap-3">
            <a href="/app" class="px-5 py-2.5 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white font-medium text-sm transition shadow-sm">
              Vitrine Git &rarr;
            </a>
            <button type="button" onclick="logout()" class="px-4 py-2.5 rounded-md bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink font-medium text-sm transition cursor-pointer">
              Çıkış Yap
            </button>
          </div>
        </div>
      `;
    }
  }

  function renderGuestNav() {
    const currentNav = document.getElementById('auth-nav');
    if (currentNav) {
      currentNav.innerHTML = `
        <a id="btn-login-sso" href="/app/auth" class="text-xs sm:text-sm px-4 py-2 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white font-medium transition shadow-sm">
          Giriş Yap (SSO)
        </a>
      `;
    }
  }

  // A. URL Hash / Query Token Yakalama (OAuth Callback)
  let rawHash = window.location.hash || '';
  let rawSearch = window.location.search || '';
  let tokenStr = '';
  let refreshTokenStr = '';

  if (rawHash.includes('access_token=')) {
    const params = new URLSearchParams(rawHash.replace(/^#/, ''));
    tokenStr = params.get('access_token');
    refreshTokenStr = params.get('refresh_token');
  } else if (rawSearch.includes('access_token=')) {
    const params = new URLSearchParams(rawSearch.replace(/^\?/, ''));
    tokenStr = params.get('access_token');
    refreshTokenStr = params.get('refresh_token');
  }

  if (tokenStr) {
    // Hash ve arama parametrelerini DERHAL URL'den temizle (token açıkta kalmasın)
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, null, window.location.pathname);
    }

    localStorage.setItem('vibe_token', tokenStr);
    if (refreshTokenStr) {
      localStorage.setItem('vibe_refresh_token', refreshTokenStr);
    }

    const pld = parseJwtPayload(tokenStr);
    if (pld) {
      const um = pld.user_metadata || {};
      const prof = {
        id: pld.sub || '',
        name: um.full_name || um.name || um.user_name || pld.email || 'Kullanıcı',
        avatar: um.avatar_url || '',
        email: pld.email || ''
      };
      localStorage.setItem('vibe_user', JSON.stringify(prof));
      syncAuthCookies(prof, tokenStr);
      window.__vibe_user = prof;
      renderUserNav(prof);
      window.notifyAuthChange(true, prof);
    }

    if (window.location.pathname.includes('/auth')) {
      window.location.replace('/app');
      return;
    }
  }

  // B. Mevcut Yerel Profil Senkronizasyonu
  const cachedProfile = window.getAuthUser();
  if (cachedProfile) {
    window.__vibe_user = cachedProfile;
    renderUserNav(cachedProfile);
  } else {
    renderGuestNav();
  }

  // C. Token Yenileme Fonksiyonu
  async function refreshSession() {
    const refreshToken = localStorage.getItem('vibe_refresh_token');
    if (!refreshToken) {
      return null;
    }

    try {
      const res = await fetch('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('vibe_token', data.access_token);
          if (data.refresh_token) {
            localStorage.setItem('vibe_refresh_token', data.refresh_token);
          }

          let prof = window.getAuthUser();
          if (data.user) {
            const um = data.user.user_metadata || {};
            prof = {
              id: data.user.id || (prof ? prof.id : ''),
              name: um.full_name || um.name || um.user_name || data.user.email || (prof ? prof.name : 'Kullanıcı'),
              avatar: um.avatar_url || (prof ? prof.avatar : ''),
              email: data.user.email || (prof ? prof.email : '')
            };
            localStorage.setItem('vibe_user', JSON.stringify(prof));
          } else {
            const pld = parseJwtPayload(data.access_token);
            if (pld) {
              const um = pld.user_metadata || {};
              prof = {
                id: pld.sub || (prof ? prof.id : ''),
                name: um.full_name || um.name || um.user_name || pld.email || (prof ? prof.name : 'Kullanıcı'),
                avatar: um.avatar_url || (prof ? prof.avatar : ''),
                email: pld.email || (prof ? prof.email : '')
              };
              localStorage.setItem('vibe_user', JSON.stringify(prof));
            }
          }

          syncAuthCookies(prof, data.access_token);
          if (prof) {
            window.__vibe_user = prof;
            renderUserNav(prof);
            window.notifyAuthChange(true, prof);
          }
          return data.access_token;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        // Sadece oturum kesinlikle sunucu tarafından iptal edilmişse temizle
        if (errData.error_code === 'refresh_token_not_found' || errData.error_code === 'invalid_grant') {
          localStorage.removeItem('vibe_token');
          localStorage.removeItem('vibe_refresh_token');
          localStorage.removeItem('vibe_user');
          clearAuthCookies();
          window.__vibe_user = null;
          renderGuestNav();
          window.notifyAuthChange(false, null);
        }
      }
    } catch (networkErr) {
      // Ağ hatasında oturumu KAPATMA! Kullanıcı oturumu açık kalmalı.
      console.warn('[VibeAuth] Oturum yenileme ağı bekleniyor:', networkErr);
    }
    return null;
  }

  // D. Arka Planda Oturum Doğrulama
  const activeToken = localStorage.getItem('vibe_token');
  if (activeToken) {
    const pld = parseJwtPayload(activeToken);
    const nowSec = Math.floor(Date.now() / 1000);
    const isExpired = pld && pld.exp && (nowSec > pld.exp - 60);

    if (isExpired) {
      refreshSession();
    } else {
      fetch('/auth/v1/user', {
        headers: { 'Authorization': 'Bearer ' + activeToken }
      })
      .then(r => {
        if (r.status === 401 || r.status === 403) {
          return refreshSession();
        }
        return r.ok ? r.json() : null;
      })
      .then(user => {
        if (user && user.id) {
          const um = user.user_metadata || {};
          const prof = {
            id: user.id,
            name: um.full_name || um.name || um.user_name || user.email || 'Kullanıcı',
            avatar: um.avatar_url || '',
            email: user.email || ''
          };
          localStorage.setItem('vibe_user', JSON.stringify(prof));
          syncAuthCookies(prof, activeToken);
          window.__vibe_user = prof;
          renderUserNav(prof);
          window.notifyAuthChange(true, prof);
        }
      })
      .catch(() => {
        // Ağ hatası veya geçici kesintide oturumu koru
      });
    }
  }

  // E. Periyodik Oturum Tazeleme (Her 25 dakikada bir)
  setInterval(() => {
    if (localStorage.getItem('vibe_refresh_token')) {
      refreshSession();
    }
  }, 25 * 60 * 1000);

  // F. Sekme Tekrar Açıldığında / Aktif Olduğunda Kontrol
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && localStorage.getItem('vibe_token')) {
      const pld = parseJwtPayload(localStorage.getItem('vibe_token'));
      const nowSec = Math.floor(Date.now() / 1000);
      if (pld && pld.exp && (nowSec > pld.exp - 180)) {
        refreshSession();
      }
    }
  });
})();

// 5. Global Güvenli Çıkış (Logout)
window.logout = async function() {
  const token = localStorage.getItem('vibe_token');
  try {
    if (token) {
      await fetch('/auth/v1/logout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
    }
  } catch (e) {}

  localStorage.removeItem('vibe_token');
  localStorage.removeItem('vibe_refresh_token');
  localStorage.removeItem('vibe_user');
  clearAuthCookies();
  window.__vibe_user = null;

  // Favoriler ve kullanıcıya ait yerel önbellekleri tamamen temizle
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('vibe_favs') || k === 'vibe_favorite_apps' || k.startsWith('vibe_app_data_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch(e) {}

  const authNav = document.getElementById('auth-nav');
  if (authNav) {
    authNav.innerHTML = `
      <a id="btn-login-sso" href="/app/auth" class="text-xs sm:text-sm px-4 py-2 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white font-medium transition shadow-sm">
        Giriş Yap (SSO)
      </a>
    `;
  }

  window.notifyAuthChange(false, null);

  if (window.location.pathname.includes('/auth')) {
    window.location.reload();
  } else {
    window.location.href = '/';
  }
};

// 6. Kullanıcı Veritabanı Senkronizasyon Motoru (user_app_data)
// Uygulama açıldığında yalnızca o uygulamanın veritabanı kayıtlarını çeker ve localStorage ile eşitler.
window.syncAppUserData = async function(appId) {
  const token = localStorage.getItem('vibe_token');
  if (!token || !appId) return null;

  try {
    const res = await fetch('/api/user-data/' + encodeURIComponent(appId), {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        Object.keys(result.data).forEach(k => {
          try {
            const v = result.data[k];
            localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
          } catch(e) {}
        });
        window.dispatchEvent(new CustomEvent('vibe_user_data_synced', {
          detail: { appId: appId, data: result.data }
        }));
        return result.data;
      }
    }
  } catch (err) {
    console.warn('[UserDataSync] Senkronizasyon hatası:', err.message);
  }
  return null;
};

window.saveAppUserData = async function(appId, key, value) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch(e) {}

  const token = localStorage.getItem('vibe_token');
  if (!token || !appId) return;

  try {
    await fetch('/api/user-data/' + encodeURIComponent(appId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ key: key, value: value })
    });
  } catch (err) {
    console.warn('[UserDataSave] Veritabanına kaydetme hatası:', err.message);
  }
};

// Sayfa Yüklendiğinde Otomatik Uygulama Verisi Çekme
document.addEventListener('DOMContentLoaded', () => {
  try {
    const path = window.location.pathname;
    if (path !== '/' && !path.includes('/auth') && path !== '/app') {
      const segments = path.replace(/^\//, '').split('/');
      const appId = segments[0] === 'app' ? segments[1] : segments[0];
      if (appId && window.isLoggedIn()) {
        window.syncAppUserData(appId);
      }
    }
  } catch(e) {}
});
