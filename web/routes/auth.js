module.exports = function(pageTemplate) {
  return function(req, res) {
    const content = `
      <div id="auth-card" class="max-w-md mx-auto p-8 rounded-2xl bg-white border border-mistral-hairline shadow-sm relative">
        <h2 class="text-2xl font-bold font-editorial text-mistral-ink text-center mb-2">Tekil Giriş (SSO)</h2>
        <p class="text-mistral-slate text-sm text-center mb-8">
          Supabase Auth altyapısı ile tek hesap üzerinden tüm mikro uygulamalara erişin ve favorilerinizi yönetin.
        </p>

        <div class="space-y-4">
          <!-- GitHub SSO Giriş -->
          <a id="btn-github-login" href="/auth/v1/authorize?provider=github&redirect_to=%2Fapp" class="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-medium transition shadow-sm cursor-pointer">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            <span>GitHub ile Giriş Yap</span>
          </a>

          <!-- Google SSO Giriş (Aktif) -->
          <a id="btn-google-login" href="/auth/v1/authorize?provider=google&redirect_to=%2Fapp" class="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium transition border border-mistral-hairline shadow-sm cursor-pointer">
            <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            <span>Google ile Giriş Yap</span>
          </a>

          <!-- Kayıtlı Profil ile Hızlı Oturum Açma Bölümü -->
          <div id="quick-login-section">
            <div id="quick-login-divider" class="relative py-2 flex items-center justify-center">
              <div class="w-full border-t border-mistral-hairline"></div>
              <span class="absolute bg-white px-3 text-xs text-mistral-stone font-medium">veya</span>
            </div>

            <div id="quick-login-container" class="flex items-center gap-2">
              <button id="btn-quick-login" type="button" onclick="handleQuickLogin()" class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink font-semibold text-sm transition border border-mistral-beige-deep shadow-xs cursor-pointer">
                <span>⚡</span>
                <span>Kayıtlı Profil ile Oturum Aç (Melih Karasu)</span>
              </button>
              <button id="btn-clear-saved-profile" type="button" onclick="openDeleteModal()" title="Bu hesabın kayıtlı oturum bilgilerini tamamen kaldır" class="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-white hover:bg-rose-50 text-mistral-stone hover:text-rose-600 border border-mistral-hairline hover:border-rose-200 transition shadow-xs cursor-pointer group">
                <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
          <!-- Kalıcı silinme kontrolü (Yenilemede tekrar açılmasını engeller) -->
          <script>
            (function() {
              try {
                if (localStorage.getItem('vibe_quick_profile_removed') === 'true') {
                  var sec = document.getElementById('quick-login-section');
                  if (sec) sec.style.display = 'none';
                }
              } catch(e) {}
            })();
          </script>
        </div>

        <div class="mt-8 pt-6 border-t border-mistral-hairline text-xs text-mistral-stone text-center">
          Kimlik doğrulama istekleri izole Supabase GoTrue servisiyle güvenli şekilde yönetilmektedir. Oturumunuz siz çıkış yapmadığınız sürece açık kalır.
        </div>
      </div>

      <!-- Sayfa İçi Özel Modal Bildirimi (Silme Onayı & Bilgilendirme) -->
      <div id="delete-confirm-modal" class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 hidden items-center justify-center p-4">
        <div class="bg-white max-w-md w-full rounded-2xl border border-mistral-hairline p-6 shadow-2xl transform transition-all duration-200 animate-in fade-in zoom-in-95">
          <!-- İkon -->
          <div class="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-xl mb-4 mx-auto shadow-2xs">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </div>

          <h3 id="modal-title" class="text-xl font-bold font-editorial text-mistral-ink text-center mb-2">
            Kayıtlı Profili Kaldır
          </h3>

          <p id="modal-desc" class="text-mistral-slate text-sm text-center leading-relaxed mb-6">
            Bu hesaba (<strong>Melih Karasu</strong>) ait kayıtlı oturum açma bilgileri bu tarayıcıdan tamamen kaldırılsın mı? Tekrar giriş yapmak için GitHub veya Google butonlarını kullanabilirsiniz.
          </p>

          <div id="modal-actions" class="flex items-center justify-end gap-3">
            <button type="button" onclick="closeDeleteModal()" class="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-mistral-cream text-mistral-ink text-sm font-semibold border border-mistral-hairline transition cursor-pointer">
              Vazgeç
            </button>
            <button type="button" onclick="executeDeleteSavedProfile()" class="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-xs transition cursor-pointer">
              Evet, Kaldır
            </button>
          </div>

          <!-- Başarılı Silme Durumu Görünümü (Dinamik) -->
          <div id="modal-success-state" class="hidden text-center py-2">
            <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3">
              ✓
            </div>
            <p class="text-sm font-semibold text-mistral-ink">Kayıtlı oturum bilgileri başarıyla kaldırıldı.</p>
            <p class="text-xs text-mistral-stone mt-1">Bu buton artık sayfayı yenileseniz dahi görünmeyecektir.</p>
            <button type="button" onclick="closeDeleteModal()" class="mt-5 w-full py-2.5 px-4 rounded-xl bg-mistral-orange hover:bg-mistral-orange-deep text-white text-sm font-semibold shadow-xs transition cursor-pointer">
              Tamam
            </button>
          </div>
        </div>
      </div>

      <script>
        // Yönlendirme URL'lerini mevcut host ve domaine göre ayarla
        document.addEventListener('DOMContentLoaded', function() {
          var targetOrigin = window.location.origin + '/app';
          var gh = document.getElementById('btn-github-login');
          if (gh) gh.href = '/auth/v1/authorize?provider=github&redirect_to=' + encodeURIComponent(targetOrigin);
          var gg = document.getElementById('btn-google-login');
          if (gg) gg.href = '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(targetOrigin);

          // Kalıcı silinme kontrolü
          if (localStorage.getItem('vibe_quick_profile_removed') === 'true') {
            var sec = document.getElementById('quick-login-section');
            if (sec) sec.style.display = 'none';
          }
        });

        // Modal Yönetimi
        function openDeleteModal() {
          var modal = document.getElementById('delete-confirm-modal');
          var actions = document.getElementById('modal-actions');
          var successState = document.getElementById('modal-success-state');
          var desc = document.getElementById('modal-desc');
          var title = document.getElementById('modal-title');

          if (actions) actions.classList.remove('hidden');
          if (desc) desc.classList.remove('hidden');
          if (title) title.innerText = 'Kayıtlı Profili Kaldır';
          if (successState) successState.classList.add('hidden');

          if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
          }
        }

        function closeDeleteModal() {
          var modal = document.getElementById('delete-confirm-modal');
          if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
          }
        }

        // Sayfa İçi Onay ile Kalıcı Silme İşlemi
        function executeDeleteSavedProfile() {
          // 1. Oturum verilerini localStorage ve çerezlerden tamamen temizle
          localStorage.removeItem('vibe_token');
          localStorage.removeItem('vibe_refresh_token');
          localStorage.removeItem('vibe_user');
          document.cookie = 'vibe_user=; path=/; max-age=0; SameSite=Lax';
          document.cookie = 'vibe_token=; path=/; max-age=0; SameSite=Lax';
          window.__vibe_user = null;

          // 2. Sayfa yenilendiğinde tekrar GELMEMESİ için kalıcı bayrak ayarla
          localStorage.setItem('vibe_quick_profile_removed', 'true');

          // 3. Bölümü DOM'dan hemen kaldır
          var sec = document.getElementById('quick-login-section');
          if (sec) {
            sec.style.display = 'none';
          }

          // 4. Navbar durumunu misafir durumuna çek
          var authNav = document.getElementById('auth-nav');
          if (authNav) {
            authNav.innerHTML = '<a id="btn-login-sso" href="/app/auth" class="text-xs sm:text-sm px-4 py-2 rounded-md bg-mistral-orange hover:bg-mistral-orange-deep text-white font-medium transition shadow-sm">Giriş Yap (SSO)</a>';
          }

          if (window.notifyAuthChange) window.notifyAuthChange(false, null);

          // 5. Modal içinde başarılı sonucunu göster
          var actions = document.getElementById('modal-actions');
          var desc = document.getElementById('modal-desc');
          var title = document.getElementById('modal-title');
          var successState = document.getElementById('modal-success-state');

          if (actions) actions.classList.add('hidden');
          if (desc) desc.classList.add('hidden');
          if (title) title.innerText = 'İşlem Başarılı';
          if (successState) successState.classList.remove('hidden');
        }

        // Hızlı Giriş İşleyicisi
        async function handleQuickLogin() {
          var btn = document.getElementById('btn-quick-login');
          if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-spin">⏳</span> <span>Giriş yapılıyor...</span>';
          }

          try {
            var res = await fetch('/api/auth/quick-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
              var data = await res.json();
              if (data.success && data.access_token) {
                // Kalıcı silinme bayrağını temizle (kullanıcı bilinçli olarak tekrar bu butona bastıysa)
                localStorage.removeItem('vibe_quick_profile_removed');

                localStorage.setItem('vibe_token', data.access_token);
                if (data.refresh_token) {
                  localStorage.setItem('vibe_refresh_token', data.refresh_token);
                }
                var um = data.user.user_metadata || {};
                var prof = {
                  id: data.user.id || '',
                  name: um.full_name || um.name || 'Melih Karasu',
                  avatar: um.avatar_url || '',
                  email: data.user.email || 'REDACTED'
                };
                localStorage.setItem('vibe_user', JSON.stringify(prof));
                document.cookie = 'vibe_user=' + encodeURIComponent(JSON.stringify(prof)) + '; path=/; max-age=31536000; SameSite=Lax';
                document.cookie = 'vibe_token=' + encodeURIComponent(data.access_token) + '; path=/; max-age=31536000; SameSite=Lax';

                if (window.showToast) window.showToast('✓ Hoş geldiniz, ' + prof.name + '!');
                if (window.notifyAuthChange) window.notifyAuthChange(true, prof);

                setTimeout(function() {
                  window.location.replace('/app');
                }, 800);
                return;
              }
            }
            throw new Error('Giriş başarısız oldu');
          } catch (err) {
            if (window.showToast) window.showToast('Giriş hatası: ' + err.message);
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = '<span>⚡</span> <span>Kayıtlı Profil ile Oturum Aç (Melih Karasu)</span>';
            }
          }
        }
      </script>
    `;
    res.send(pageTemplate('Giriş Yap', content));
  };
};
