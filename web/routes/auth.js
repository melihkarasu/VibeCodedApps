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

          <!-- Google SSO Giriş -->
          <a id="btn-google-login" href="/auth/v1/authorize?provider=google&redirect_to=%2Fapp" class="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium transition border border-mistral-hairline shadow-sm cursor-pointer">
            <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            <span>Google ile Giriş Yap</span>
          </a>
        </div>

        <div class="mt-8 pt-6 border-t border-mistral-hairline text-xs text-mistral-stone text-center">
          Kimlik doğrulama istekleri izole Supabase GoTrue servisiyle güvenli şekilde yönetilmektedir. Oturumunuz siz çıkış yapmadığınız sürece açık kalır.
        </div>
      </div>
    `;
    res.send(pageTemplate('Giriş Yap', content));
  };
};
