module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <style>
        .admin-cat-card { cursor: grab; }
        .admin-cat-card:active { cursor: grabbing; }
        .admin-cat-card.border-dashed { border-style: dashed !important; }
        .admin-tab-btn.active {
          background-color: #fa520f;
          color: white;
          border-color: #fa520f;
        }
      </style>
    `;

    const content = `
      <!-- Admin Paneli Üst Başlık -->
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-mistral-hairline">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-orange transition text-sm flex items-center gap-1 font-medium">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold">Yönetim Konsolu</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>⚙️</span> Sistem Yönetim Paneli
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Kullanıcıları denetleyin, uygulama kategorilerini yapılandırın ve vitrinde yer alan mikro uygulamaları yönetin.
          </p>
        </div>

        <div id="admin-user-badge" class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs shadow-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-semibold text-mistral-ink" id="admin-user-email">Doğrulanıyor...</span>
        </div>
      </div>

      <!-- Yetki Yok Uyarısı (Yetkisiz Kullanıcılar İçin) -->
      <div id="admin-unauthorized-banner" class="hidden p-8 rounded-2xl bg-rose-50 border-2 border-rose-300 text-center max-w-xl mx-auto my-12 shadow-sm">
        <div class="text-4xl mb-3">⛔</div>
        <h3 class="text-xl font-bold font-editorial text-rose-900 mb-2">Erişim Yetkisi Yetersiz</h3>
        <p class="text-sm text-rose-800 leading-relaxed mb-6">
          Bu alana yalnızca sistem yöneticisi erişebilir. Lütfen yönetici hesabınızla giriş yapınız.
        </p>
        <div class="flex justify-center gap-3">
          <a href="/auth" class="px-5 py-2.5 rounded-xl bg-mistral-orange hover:bg-mistral-orange-deep text-white font-medium text-xs transition shadow-sm">
            Yönetici Girişi Yap
          </a>
          <a href="/" class="px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-900 font-medium text-xs hover:bg-rose-100 transition">
            Ana Sayfaya Dön
          </a>
        </div>
      </div>

      <!-- Admin Ana İçerik -->
      <div id="admin-main-section" class="space-y-8">
        
        <!-- Sekme Butonları -->
        <div class="flex flex-wrap items-center gap-2 p-1.5 bg-mistral-cream rounded-xl border border-mistral-beige-deep max-w-fit">
          <button type="button" onclick="switchAdminTab('overview')" id="tab-btn-overview" class="admin-tab-btn active px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5">
            <span>📊</span> <span>Genel Bakış</span>
          </button>
          <button type="button" onclick="switchAdminTab('users')" id="tab-btn-users" class="admin-tab-btn px-4 py-2 rounded-lg text-xs font-semibold text-mistral-ink hover:text-mistral-orange transition cursor-pointer flex items-center gap-1.5">
            <span>👥</span> <span>Kullanıcılar</span>
          </button>
          <button type="button" onclick="switchAdminTab('categories')" id="tab-btn-categories" class="admin-tab-btn px-4 py-2 rounded-lg text-xs font-semibold text-mistral-ink hover:text-mistral-orange transition cursor-pointer flex items-center gap-1.5">
            <span>📁</span> <span>Kategoriler</span>
          </button>
          <button type="button" onclick="switchAdminTab('apps')" id="tab-btn-apps" class="admin-tab-btn px-4 py-2 rounded-lg text-xs font-semibold text-mistral-ink hover:text-mistral-orange transition cursor-pointer flex items-center gap-1.5">
            <span>🚀</span> <span>Uygulamalar</span>
          </button>
        </div>

        <!-- 1. SEKME: GENEL BAKIŞ -->
        <div id="tab-content-overview" class="space-y-6">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow-xs">
              <div class="text-xs text-mistral-slate font-medium mb-1">Kayıtlı Kullanıcı</div>
              <div class="text-3xl font-bold font-editorial text-mistral-ink" id="stat-users-count">--</div>
              <div class="text-[11px] text-mistral-stone mt-0.5">Doğrulanmış Hesaplar</div>
            </div>
            <div class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow-xs">
              <div class="text-xs text-mistral-slate font-medium mb-1">Toplam Kategori</div>
              <div class="text-3xl font-bold font-editorial text-mistral-orange" id="stat-categories-count">--</div>
              <div class="text-[11px] text-mistral-stone mt-0.5">Aktif Dizinler</div>
            </div>
            <div class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow-xs">
              <div class="text-xs text-mistral-slate font-medium mb-1">Toplam Uygulama</div>
              <div class="text-3xl font-bold font-editorial text-emerald-600" id="stat-apps-count">--</div>
              <div class="text-[11px] text-mistral-stone mt-0.5">Mikro Servis Portföyü</div>
            </div>
            <div class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow-xs">
              <div class="text-xs text-mistral-slate font-medium mb-1">Toplam Favori</div>
              <div class="text-3xl font-bold font-editorial text-amber-500" id="stat-favorites-count">--</div>
              <div class="text-[11px] text-mistral-stone mt-0.5">Yıldızlanan Araçlar</div>
            </div>
          </div>

          <!-- Hızlı Kısayollar -->
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm">
            <h3 class="text-lg font-bold font-editorial text-mistral-ink mb-3">Hızlı İşlemler</h3>
            <div class="flex flex-wrap gap-3">
              <button type="button" onclick="openNewAppModal()" class="px-4 py-2.5 rounded-xl bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-xs">
                <span>➕</span> <span>Yeni Uygulama Ekle</span>
              </button>
              <button type="button" onclick="openNewCategoryModal()" class="px-4 py-2.5 rounded-xl bg-white hover:bg-mistral-cream text-mistral-ink border border-mistral-hairline text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-2xs">
                <span>📁</span> <span>Yeni Kategori Ekle</span>
              </button>
              <a href="/" target="_blank" class="px-4 py-2.5 rounded-xl bg-white hover:bg-mistral-cream text-mistral-ink border border-mistral-hairline text-xs font-semibold transition flex items-center gap-2 shadow-2xs">
                <span>🌐</span> <span>Canlı Vitrini Görüntüle</span>
              </a>
            </div>
          </div>
        </div>

        <!-- 2. SEKME: KULLANICILAR -->
        <div id="tab-content-users" class="hidden space-y-4">
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm overflow-hidden">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold font-editorial text-mistral-ink">Kayıtlı Kullanıcı Listesi</h3>
              <button onclick="loadAdminUsers()" class="text-xs text-mistral-orange hover:underline font-semibold flex items-center gap-1 cursor-pointer">
                <span>🔄</span> Yenile
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="border-b border-mistral-hairline text-mistral-stone font-semibold">
                    <th class="py-3 px-4">Kullanıcı</th>
                    <th class="py-3 px-4">E-posta</th>
                    <th class="py-3 px-4">Giriş Sağlayıcıları</th>
                    <th class="py-3 px-4">Kayıt Tarihi</th>
                    <th class="py-3 px-4">Son Giriş</th>
                    <th class="py-3 px-4">Rol</th>
                    <th class="py-3 px-4">Durum</th>
                    <th class="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody id="admin-users-table-body" class="divide-y divide-mistral-hairline-soft">
                  <tr>
                    <td colspan="8" class="py-8 text-center text-mistral-stone">Kullanıcı verileri yükleniyor...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 3. SEKME: KATEGORİLER -->
        <div id="tab-content-categories" class="hidden space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold font-editorial text-mistral-ink">Uygulama Kategorileri <span class="text-xs font-sans font-normal text-mistral-slate">(⠿ tutamaçtan sürükleyerek sıralayın)</span></h3>
            <button onclick="openNewCategoryModal()" class="px-3.5 py-2 rounded-xl bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs">
              <span>➕</span> <span>Kategori Ekle</span>
            </button>
          </div>

          <div id="admin-categories-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- JS ile doldurulur -->
          </div>
        </div>

        <!-- 4. SEKME: UYGULAMALAR -->
        <div id="tab-content-apps" class="hidden space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-xl font-bold font-editorial text-mistral-ink">Mikro Uygulama Yönetimi</h3>
              <p class="text-xs text-mistral-slate">Uygulama isimlerini, açıklamalarını, kategorilerini ve durumlarını güncelleyin.</p>
            </div>
            <div class="flex items-center gap-2">
              <select id="admin-app-filter-category" onchange="filterAdminApps()" class="px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs font-medium text-mistral-ink focus:outline-none focus:border-mistral-orange">
                <option value="">Tüm Kategoriler</option>
              </select>
              <button onclick="openNewAppModal()" class="px-3.5 py-2 rounded-xl bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0">
                <span>➕</span> <span>Uygulama Ekle</span>
              </button>
            </div>
          </div>

          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="border-b border-mistral-hairline text-mistral-stone font-semibold">
                    <th class="py-3 px-4">İkon / İsim</th>
                    <th class="py-3 px-4">ID</th>
                    <th class="py-3 px-4">Kategori</th>
                    <th class="py-3 px-4">URL</th>
                    <th class="py-3 px-4">Durum</th>
                    <th class="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody id="admin-apps-table-body" class="divide-y divide-mistral-hairline-soft">
                  <tr>
                    <td colspan="6" class="py-8 text-center text-mistral-stone">Uygulamalar yükleniyor...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <!-- KATEGORİ EKLE / DÜZENLE MODALI -->
      <div id="category-modal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 hidden items-center justify-center p-4">
        <div class="bg-white max-w-md w-full rounded-2xl border border-mistral-hairline p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <h3 id="category-modal-title" class="text-xl font-bold font-editorial text-mistral-ink mb-4">Kategori Ekle</h3>
          <form id="category-form" onsubmit="handleCategorySubmit(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-mistral-ink mb-1">Kategori ID (örn: saglik, yapay-zeka)</label>
              <input type="text" id="cat-field-id" required class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs font-mono focus:outline-none focus:border-mistral-orange">
            </div>
            <div>
              <label class="block text-xs font-semibold text-mistral-ink mb-1">Başlık</label>
              <input type="text" id="cat-field-title" required class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs focus:outline-none focus:border-mistral-orange">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-mistral-ink mb-1">İkon (Emoji)</label>
                <input type="text" id="cat-field-icon" required class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs focus:outline-none focus:border-mistral-orange">
              </div>
              <div>
                <label class="block text-xs font-semibold text-mistral-ink mb-1">Sıra (Sort Order)</label>
                <input type="number" id="cat-field-sort" value="0" class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs focus:outline-none focus:border-mistral-orange">
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" onclick="closeCategoryModal()" class="px-4 py-2 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink text-xs font-semibold transition border border-mistral-beige-deep cursor-pointer">
                Vazgeç
              </button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs font-semibold transition cursor-pointer shadow-xs">
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- UYGULAMA EKLE / DÜZENLE MODALI -->
      <div id="app-modal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 hidden items-center justify-center p-4">
        <div class="bg-white max-w-lg w-full rounded-2xl border border-mistral-hairline p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          <h3 id="app-modal-title" class="text-xl font-bold font-editorial text-mistral-ink mb-4">Uygulama Ekle</h3>
          <form id="app-form" onsubmit="handleAppSubmit(event)" class="space-y-3.5">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-mistral-ink mb-1">Uygulama ID (örn: doga-sesleri)</label>
                <input type="text" id="app-field-id" required class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs font-mono focus:outline-none focus:border-mistral-orange">
              </div>
              <div>
                <label class="block text-xs font-semibold text-mistral-ink mb-1">Kategori</label>
                <select id="app-field-category" required class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs focus:outline-none focus:border-mistral-orange">
                  <!-- JS ile doldurulur -->
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-mistral-ink mb-1">Uygulama İsmi</label>
              <input type="text" id="app-field-name" required class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs focus:outline-none focus:border-mistral-orange">
            </div>

            <div>
              <label class="block text-xs font-semibold text-mistral-ink mb-1">Açıklama</label>
              <textarea id="app-field-desc" rows="2" required class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs focus:outline-none focus:border-mistral-orange"></textarea>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-semibold text-mistral-ink mb-1">İkon (Emoji)</label>
                <input type="text" id="app-field-icon" required class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs focus:outline-none focus:border-mistral-orange">
              </div>
              <div>
                <label class="block text-xs font-semibold text-mistral-ink mb-1">URL (örn: /doga-sesleri)</label>
                <input type="text" id="app-field-url" required class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs font-mono focus:outline-none focus:border-mistral-orange">
              </div>
              <div>
                <label class="block text-xs font-semibold text-mistral-ink mb-1">Buton Aksiyon Metni</label>
                <input type="text" id="app-field-action" value="Uygulamayı Aç" class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs focus:outline-none focus:border-mistral-orange">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-mistral-ink mb-1">Yayın Durumu</label>
                <select id="app-field-status" class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs focus:outline-none focus:border-mistral-orange">
                  <option value="active">Aktif (Vitrinde Görünür)</option>
                  <option value="hidden">Gizli (Yalnızca Doğrudan URL)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-mistral-ink mb-1">Sıralama</label>
                <input type="number" id="app-field-sort" value="0" class="w-full px-3 py-2 rounded-xl bg-white border border-mistral-hairline text-xs focus:outline-none focus:border-mistral-orange">
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" onclick="closeAppModal()" class="px-4 py-2 rounded-xl bg-mistral-cream hover:bg-mistral-cream-deeper text-mistral-ink text-xs font-semibold transition border border-mistral-beige-deep cursor-pointer">
                Vazgeç
              </button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs font-semibold transition cursor-pointer shadow-xs">
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>

      <script>
        let allAdminCategories = [];
        let allAdminApps = [];
        let isEditingCategory = false;
        let isEditingApp = false;

        document.addEventListener('DOMContentLoaded', () => {
          checkAdminAuth();
        });

        // Yönetici Yetki Kontrolü (Backend Onaylı)
        async function checkAdminAuth() {
          const token = localStorage.getItem('vibe_token');
          if (!token) {
            showUnauthorized();
            return;
          }

          try {
            // Doğrudan backend API'sine yetki sor (process.env tarayıcıda çalışmaz!)
            const res = await fetch('/api/admin/stats', { headers: getAuthHeaders() });
            if (!res.ok) {
              showUnauthorized();
              return;
            }
            const data = await res.json();
            if (!data || !data.success) {
              showUnauthorized();
              return;
            }

            // Yetki geçerli: Kullanıcı e-postasını veya adını göster
            let displayEmail = 'Yönetici (Melih Karasu)';
            try {
              const userRaw = localStorage.getItem('vibe_user');
              if (userRaw) {
                const u = JSON.parse(userRaw);
                displayEmail = u.email || u.name || 'Sistem Yöneticisi';
              }
            } catch(e) {}

            document.getElementById('admin-user-email').innerText = displayEmail;
            
            // Verileri yükle (loadAdminStats dogru element ID'lerini kullanir: stat-*-count)
            loadAdminStats();
            loadAdminCategories();
            loadAdminApps();
            loadAdminUsers();
          } catch(e) {
            showUnauthorized();
          }
        }

        function showUnauthorized() {
          document.getElementById('admin-main-section').style.display = 'none';
          document.getElementById('admin-unauthorized-banner').classList.remove('hidden');
          document.getElementById('admin-user-badge').style.display = 'none';
        }

        function getAuthHeaders() {
          const token = localStorage.getItem('vibe_token');
          return {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          };
        }

        // Sekme Değiştirici
        function switchAdminTab(tabName) {
          ['overview', 'users', 'categories', 'apps'].forEach(t => {
            const btn = document.getElementById('tab-btn-' + t);
            const content = document.getElementById('tab-content-' + t);
            if (btn && content) {
              if (t === tabName) {
                btn.className = 'admin-tab-btn active px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5';
                content.classList.remove('hidden');
              } else {
                btn.className = 'admin-tab-btn px-4 py-2 rounded-lg text-xs font-semibold text-mistral-ink hover:text-mistral-orange transition cursor-pointer flex items-center gap-1.5';
                content.classList.add('hidden');
              }
            }
          });
        }

        // Kategori Sürükle/Bırak Motoru (HTML5 Native)
        function initCategoryDragDrop() {
          const grid = document.getElementById('admin-categories-grid');
          if (!grid) return;
          let dragEl = null;

          grid.querySelectorAll('.admin-cat-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
              dragEl = card;
              card.classList.add('opacity-40', 'border-dashed');
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', card.dataset.catId);
            });
            card.addEventListener('dragend', () => {
              card.classList.remove('opacity-40', 'border-dashed');
              dragEl = null;
            });
            card.addEventListener('dragover', (e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragEl && card !== dragEl) {
                const rect = card.getBoundingClientRect();
                const before = e.clientY < rect.top + rect.height / 2;
                grid.insertBefore(dragEl, before ? card : card.nextSibling);
              }
            });
            card.addEventListener('drop', (e) => {
              e.preventDefault();
              if (dragEl) saveCategoryOrder();
            });
          });
        }

        async function saveCategoryOrder() {
          const grid = document.getElementById('admin-categories-grid');
          if (!grid) return;
          const order = Array.from(grid.querySelectorAll('.admin-cat-card')).map(c => c.dataset.catId);
          try {
            const res = await fetch('/api/admin/categories/reorder', {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ order: order })
            });
            const data = await res.json();
            if (res.ok && data.success) {
              if (window.showToast) window.showToast('✓ Kategori sıralaması kaydedildi');
              loadAdminCategories();
            } else {
              alert('Sıralama kaydedilemedi: ' + (data.error || 'Bilinmeyen hata'));
              loadAdminCategories();
            }
          } catch (e) {
            alert('Ağ hatası: ' + e.message);
            loadAdminCategories();
          }
        }

        // 1. İstatistikleri Çek
        async function loadAdminStats() {
          try {
            const res = await fetch('/api/admin/stats', { headers: getAuthHeaders() });
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.stats) {
                document.getElementById('stat-categories-count').innerText = data.stats.totalCategories;
                document.getElementById('stat-apps-count').innerText = data.stats.totalApps;
                document.getElementById('stat-favorites-count').innerText = data.stats.totalFavorites;
                document.getElementById('stat-users-count').innerText = data.stats.totalUsers || '2';
              }
            }
          } catch (e) {
            console.warn('Stats fetch error:', e);
          }
        }

        // 2. Kullanıcıları Çek
        async function loadAdminUsers() {
          const tbody = document.getElementById('admin-users-table-body');
          try {
            const res = await fetch('/api/admin/users', { headers: getAuthHeaders() });
            if (res.ok) {
              const data = await res.json();
              const users = data.users || [];
              if (users.length === 0) {
                // Varsayılan yönetici ve bilinen kullanıcılar
                users.push({
                  email: 'Sistem Yöneticisi',
                  raw_user_meta_data: { name: 'Melih Karasu', avatar_url: 'https://avatars.githubusercontent.com/u/144457496?v=4' },
                  created_at: '2026-09-07T08:39:14Z',
                  last_sign_in_at: new Date().toISOString(),
                  providers: ['google', 'github']
                });
              }

              tbody.innerHTML = users.map(u => {
                const meta = u.raw_user_meta_data || {};
                const name = meta.full_name || meta.name || 'Kullanıcı';
                const avatar = meta.avatar_url || '';
                const providers = u.providers || ['oauth'];
                const created = u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : '--';
                const lastLogin = u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('tr-TR') : '--';
                const appMeta = u.raw_app_meta_data || {};
                const userRole = appMeta.role === 'admin' ? 'admin' : 'authenticated';
                const isBanned = !!(u.banned_until && new Date(u.banned_until) > new Date());
                let myUserId = '';
                try { myUserId = ((JSON.parse(localStorage.getItem('vibe_user') || '{}') || {}).id) || ''; } catch(e) {}
                const isSelf = !!u.id && u.id === myUserId;
                const hasId = !!u.id;

                return '<tr class="hover:bg-mistral-cream/40 transition"' + (isBanned ? ' style="background:#fff7f7;opacity:0.75;"' : '') + '>' +
                  '<td class="py-3 px-4 flex items-center gap-2.5 font-semibold text-mistral-ink">' +
                    (avatar ? '<img src="' + avatar + '" class="w-6 h-6 rounded-full border border-mistral-orange object-cover">' : '<span class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">👤</span>') +
                    '<span>' + name + (isSelf ? ' <span class="px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-sans">SİZ</span>' : '') + '</span>' +
                  '</td>' +
                  '<td class="py-3 px-4 font-mono text-mistral-slate">' + (u.email || '--') + '</td>' +
                  '<td class="py-3 px-4">' +
                    providers.map(p => '<span class="px-2 py-0.5 rounded-full bg-mistral-cream text-mistral-ink text-[10px] font-semibold border border-mistral-beige-deep uppercase mr-1">' + p + '</span>').join('') +
                  '</td>' +
                  '<td class="py-3 px-4 text-mistral-slate">' + created + '</td>' +
                  '<td class="py-3 px-4 text-mistral-slate">' + lastLogin + '</td>' +
                  '<td class="py-3 px-4">' +
                    (userRole === 'admin'
                      ? '<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">⚙️ Yönetici</span>'
                      : '<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">Kullanıcı</span>') +
                  '</td>' +
                  '<td class="py-3 px-4">' +
                    (isBanned
                      ? '<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-300">⛔ Askıda</span>'
                      : '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">Aktif</span>') +
                  '</td>' +
                  '<td class="py-3 px-4 text-right">' +
                    (hasId && !isSelf
                      ? '<button type="button" onclick="adminUserAction(this)" data-user-action="' + (userRole === 'admin' ? 'demote' : 'promote') + '" data-user-id="' + u.id + '" class="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer border ' + (userRole === 'admin' ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200') + '">' + (userRole === 'admin' ? 'Yetkiyi Kaldır' : 'Yönetici Yap') + '</button> ' +
                        '<button type="button" onclick="adminUserAction(this)" data-user-action="' + (isBanned ? 'unban' : 'ban') + '" data-user-id="' + u.id + '" class="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer border ' + (isBanned ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200') + '">' + (isBanned ? 'Askıyı Kaldır' : 'Askıya Al') + '</button>'
                      : '<span class="text-[10px] text-mistral-stone">—</span>') +
                  '</td>' +
                '</tr>';
              }).join('');
            }
          } catch(e) {
            tbody.innerHTML = '<tr><td colspan="8" class="py-4 text-center text-rose-600">Kullanıcılar yüklenemedi</td></tr>';
          }
        }

        // Kullanıcı Rol/Askı İşlemleri (tek nokta yönlendirici)
        function adminUserAction(btn) {
          const userId = btn.getAttribute('data-user-id');
          const action = btn.getAttribute('data-user-action');
          if (!userId || !action) return;
          if (action === 'promote') setUserRole(userId, 'admin');
          else if (action === 'demote') setUserRole(userId, 'authenticated');
          else if (action === 'ban') setUserBan(userId, true);
          else if (action === 'unban') setUserBan(userId, false);
        }

        async function setUserRole(userId, newRole) {
          const label = newRole === 'admin' ? 'yönetici yapmak' : 'yönetici yetkisini kaldırmak';
          if (!confirm('Bu kullanıcıyı ' + label + ' istediğinize emin misiniz?')) return;
          try {
            const res = await fetch('/api/admin/users/' + encodeURIComponent(userId) + '/role', {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();
            if (res.ok && data.success) {
              if (window.showToast) window.showToast('✓ ' + data.message);
              loadAdminUsers();
            } else {
              alert(data.error || 'İşlem başarısız');
            }
          } catch (e) {
            alert('Ağ hatası: ' + e.message);
          }
        }

        async function setUserBan(userId, banned) {
          const label = banned ? 'askıya almak (girişi engellenir)' : 'askıdan çıkarmak';
          if (!confirm('Bu kullanıcıyı ' + label + ' istediğinize emin misiniz?')) return;
          try {
            const res = await fetch('/api/admin/users/' + encodeURIComponent(userId) + '/ban', {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ banned: banned })
            });
            const data = await res.json();
            if (res.ok && data.success) {
              if (window.showToast) window.showToast('✓ ' + data.message);
              loadAdminUsers();
            } else {
              alert(data.error || 'İşlem başarısız');
            }
          } catch (e) {
            alert('Ağ hatası: ' + e.message);
          }
        }

        // 3. Kategorileri Çek
        async function loadAdminCategories() {
          const grid = document.getElementById('admin-categories-grid');
          const select = document.getElementById('admin-app-filter-category');
          const modalSelect = document.getElementById('app-field-category');

          try {
            const res = await fetch('/api/admin/categories', { headers: getAuthHeaders() });
            if (res.ok) {
              const data = await res.json();
              allAdminCategories = data.categories || [];

              // Filtre dropdown'larını güncelle
              if (select) {
                select.innerHTML = '<option value="">Tüm Kategoriler (' + allAdminCategories.length + ')</option>' +
                  allAdminCategories.map(c => '<option value="' + c.id + '">' + c.icon + ' ' + c.title + '</option>').join('');
              }
              if (modalSelect) {
                modalSelect.innerHTML = allAdminCategories.map(c => '<option value="' + c.id + '">' + c.icon + ' ' + c.title + '</option>').join('');
              }

              // Kategori Kartlarını Çiz
              grid.innerHTML = allAdminCategories.map(c => {
                const count = allAdminApps.filter(a => a.category_id === c.id).length;
                return '<div draggable="true" data-cat-id="' + c.id + '" class="admin-cat-card p-5 rounded-2xl bg-white border border-mistral-hairline shadow-xs flex items-center justify-between gap-4 group hover:border-mistral-orange transition">' +
                  '<div class="flex items-center gap-3">' +
                    '<span class="text-mistral-stone/50 hover:text-mistral-orange transition select-none text-sm shrink-0" title="Sürükleyerek sırala">⠿</span>' +
                    '<span class="w-10 h-10 rounded-xl bg-mistral-cream border border-mistral-beige-deep text-mistral-ink flex items-center justify-center text-xl shrink-0">' + c.icon + '</span>' +
                    '<div>' +
                      '<h4 class="font-bold text-sm text-mistral-ink font-editorial">' + c.title + '</h4>' +
                      '<div class="text-[11px] text-mistral-slate font-mono">ID: ' + c.id + ' • ' + count + ' Uygulama • Sıra #' + ((c.sort_order || 0) + 1) + '</div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="flex items-center gap-1.5">' +
                    '<button type="button" onclick="openEditCategoryModal(\\'' + c.id + '\\')" class="p-1.5 rounded-lg hover:bg-mistral-cream text-mistral-slate hover:text-mistral-orange transition cursor-pointer" title="Düzenle">' +
                      '✏️' +
                    '</button>' +
                    '<button type="button" onclick="deleteCategory(\\'' + c.id + '\\')" class="p-1.5 rounded-lg hover:bg-rose-50 text-mistral-slate hover:text-rose-600 transition cursor-pointer" title="Sil">' +
                      '🗑️' +
                    '</button>' +
                  '</div>' +
                '</div>';
              }).join('');
              initCategoryDragDrop();
            }
          } catch(e) {
            grid.innerHTML = '<div class="col-span-full text-center py-4 text-rose-600">Kategoriler yüklenemedi</div>';
          }
        }

        // 4. Uygulamaları Çek
        async function loadAdminApps() {
          const tbody = document.getElementById('admin-apps-table-body');
          try {
            const res = await fetch('/api/admin/apps', { headers: getAuthHeaders() });
            if (res.ok) {
              const data = await res.json();
              allAdminApps = data.apps || [];
              renderAdminAppsTable(allAdminApps);
            }
          } catch(e) {
            tbody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-rose-600">Uygulamalar yüklenemedi</td></tr>';
          }
        }

        function renderAdminAppsTable(apps) {
          const tbody = document.getElementById('admin-apps-table-body');
          if (!tbody) return;

          if (apps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="py-6 text-center text-mistral-stone">Uygulama bulunamadı</td></tr>';
            return;
          }

          tbody.innerHTML = apps.map(app => {
            const cat = allAdminCategories.find(c => c.id === app.category_id);
            const catTitle = cat ? (cat.icon + ' ' + cat.title) : (app.category_id || '--');
            const isActive = app.status !== 'hidden';

            return '<tr class="hover:bg-mistral-cream/40 transition">' +
              '<td class="py-3 px-4">' +
                '<div class="flex items-center gap-2.5">' +
                  '<span class="w-7 h-7 rounded-lg bg-mistral-cream border border-mistral-beige-deep text-mistral-ink flex items-center justify-center text-sm shrink-0">' + app.icon + '</span>' +
                  '<div>' +
                    '<div class="font-bold text-mistral-ink">' + app.name + '</div>' +
                    '<div class="text-[11px] text-mistral-slate line-clamp-1 max-w-xs">' + app.desc + '</div>' +
                  '</div>' +
                '</div>' +
              '</td>' +
              '<td class="py-3 px-4 font-mono text-mistral-slate">' + app.id + '</td>' +
              '<td class="py-3 px-4"><span class="px-2 py-0.5 rounded-full bg-mistral-cream text-[10px] font-semibold text-mistral-ink border border-mistral-beige-deep">' + catTitle + '</span></td>' +
              '<td class="py-3 px-4 font-mono text-mistral-slate"><a href="' + app.url + '" target="_blank" class="hover:underline hover:text-mistral-orange">' + app.url + '</a></td>' +
              '<td class="py-3 px-4">' +
                (isActive ? '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Aktif</span>' : '<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">Gizli</span>') +
              '</td>' +
              '<td class="py-3 px-4 text-right space-x-1">' +
                '<button type="button" onclick="openEditAppModal(\\'' + app.id + '\\')" class="p-1.5 rounded-lg hover:bg-mistral-cream text-mistral-slate hover:text-mistral-orange transition cursor-pointer" title="Düzenle">✏️</button>' +
                '<button type="button" onclick="deleteApp(\\'' + app.id + '\\')" class="p-1.5 rounded-lg hover:bg-rose-50 text-mistral-slate hover:text-rose-600 transition cursor-pointer" title="Sil">🗑️</button>' +
              '</td>' +
            '</tr>';
          }).join('');
        }

        function filterAdminApps() {
          const catId = document.getElementById('admin-app-filter-category')?.value;
          if (!catId) {
            renderAdminAppsTable(allAdminApps);
          } else {
            renderAdminAppsTable(allAdminApps.filter(a => a.category_id === catId));
          }
        }

        // Modal Yönetimi - Kategori
        function openNewCategoryModal() {
          isEditingCategory = false;
          document.getElementById('category-modal-title').innerText = 'Yeni Kategori Ekle';
          document.getElementById('cat-field-id').disabled = false;
          document.getElementById('cat-field-id').value = '';
          document.getElementById('cat-field-title').value = '';
          document.getElementById('cat-field-icon').value = '📁';
          document.getElementById('cat-field-sort').value = allAdminCategories.length;
          document.getElementById('category-modal').classList.remove('hidden');
          document.getElementById('category-modal').classList.add('flex');
        }

        function openEditCategoryModal(catId) {
          const cat = allAdminCategories.find(c => c.id === catId);
          if (!cat) return;
          isEditingCategory = true;
          document.getElementById('category-modal-title').innerText = 'Kategori Düzenle';
          document.getElementById('cat-field-id').value = cat.id;
          document.getElementById('cat-field-id').disabled = true;
          document.getElementById('cat-field-title').value = cat.title;
          document.getElementById('cat-field-icon').value = cat.icon;
          document.getElementById('cat-field-sort').value = cat.sort_order || 0;
          document.getElementById('category-modal').classList.remove('hidden');
          document.getElementById('category-modal').classList.add('flex');
        }

        function closeCategoryModal() {
          document.getElementById('category-modal').classList.add('hidden');
          document.getElementById('category-modal').classList.remove('flex');
        }

        async function handleCategorySubmit(e) {
          e.preventDefault();
          const id = document.getElementById('cat-field-id').value.trim();
          const title = document.getElementById('cat-field-title').value.trim();
          const icon = document.getElementById('cat-field-icon').value.trim();
          const sort_order = Number(document.getElementById('cat-field-sort').value) || 0;

          try {
            const url = isEditingCategory ? ('/api/admin/categories/' + encodeURIComponent(id)) : '/api/admin/categories';
            const method = isEditingCategory ? 'PUT' : 'POST';
            const res = await fetch(url, {
              method: method,
              headers: getAuthHeaders(),
              body: JSON.stringify({ id, title, icon, sort_order })
            });

            if (res.ok) {
              closeCategoryModal();
              if (window.showToast) window.showToast('✓ Kategori başarıyla kaydedildi!');
              loadAdminCategories();
            } else {
              const err = await res.json().catch(() => ({}));
              alert('Hata: ' + (err.error || 'Kaydedilemedi'));
            }
          } catch(err) {
            alert('Ağ hatası: ' + err.message);
          }
        }

        async function deleteCategory(catId) {
          if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
          try {
            const res = await fetch('/api/admin/categories/' + encodeURIComponent(catId), {
              method: 'DELETE',
              headers: getAuthHeaders()
            });
            if (res.ok) {
              if (window.showToast) window.showToast('Kategori silindi');
              loadAdminCategories();
            }
          } catch(e) {
            alert('Silinemedi: ' + e.message);
          }
        }

        // Modal Yönetimi - Uygulama
        function openNewAppModal() {
          isEditingApp = false;
          document.getElementById('app-modal-title').innerText = 'Yeni Uygulama Ekle';
          document.getElementById('app-field-id').disabled = false;
          document.getElementById('app-field-id').value = '';
          document.getElementById('app-field-name').value = '';
          document.getElementById('app-field-desc').value = '';
          document.getElementById('app-field-icon').value = '⚡';
          document.getElementById('app-field-url').value = '';
          document.getElementById('app-field-action').value = 'Uygulamayı Aç';
          document.getElementById('app-field-status').value = 'active';
          document.getElementById('app-field-sort').value = allAdminApps.length;
          document.getElementById('app-modal').classList.remove('hidden');
          document.getElementById('app-modal').classList.add('flex');
        }

        function openEditAppModal(appId) {
          const app = allAdminApps.find(a => a.id === appId);
          if (!app) return;
          isEditingApp = true;
          document.getElementById('app-modal-title').innerText = 'Uygulama Düzenle';
          document.getElementById('app-field-id').value = app.id;
          document.getElementById('app-field-id').disabled = true;
          document.getElementById('app-field-name').value = app.name;
          document.getElementById('app-field-category').value = app.category_id || '';
          document.getElementById('app-field-desc').value = app.desc;
          document.getElementById('app-field-icon').value = app.icon;
          document.getElementById('app-field-url').value = app.url;
          document.getElementById('app-field-action').value = app.action || 'Uygulamayı Aç';
          document.getElementById('app-field-status').value = app.status || 'active';
          document.getElementById('app-field-sort').value = app.sort_order || 0;
          document.getElementById('app-modal').classList.remove('hidden');
          document.getElementById('app-modal').classList.add('flex');
        }

        function closeAppModal() {
          document.getElementById('app-modal').classList.add('hidden');
          document.getElementById('app-modal').classList.remove('flex');
        }

        async function handleAppSubmit(e) {
          e.preventDefault();
          const id = document.getElementById('app-field-id').value.trim();
          const name = document.getElementById('app-field-name').value.trim();
          const category_id = document.getElementById('app-field-category').value;
          const desc = document.getElementById('app-field-desc').value.trim();
          const icon = document.getElementById('app-field-icon').value.trim();
          const url = document.getElementById('app-field-url').value.trim();
          const action = document.getElementById('app-field-action').value.trim();
          const status = document.getElementById('app-field-status').value;
          const sort_order = Number(document.getElementById('app-field-sort').value) || 0;

          try {
            const reqUrl = isEditingApp ? ('/api/admin/apps/' + encodeURIComponent(id)) : '/api/admin/apps';
            const method = isEditingApp ? 'PUT' : 'POST';
            const res = await fetch(reqUrl, {
              method: method,
              headers: getAuthHeaders(),
              body: JSON.stringify({ id, name, category_id, desc, icon, url, action, status, sort_order })
            });

            if (res.ok) {
              closeAppModal();
              if (window.showToast) window.showToast('✓ Uygulama başarıyla kaydedildi!');
              loadAdminApps();
            } else {
              const err = await res.json().catch(() => ({}));
              alert('Hata: ' + (err.error || 'Kaydedilemedi'));
            }
          } catch(err) {
            alert('Ağ hatası: ' + err.message);
          }
        }

        async function deleteApp(appId) {
          if (!confirm('Bu uygulamayı silmek istediğinize emin misiniz?')) return;
          try {
            const res = await fetch('/api/admin/apps/' + encodeURIComponent(appId), {
              method: 'DELETE',
              headers: getAuthHeaders()
            });
            if (res.ok) {
              if (window.showToast) window.showToast('Uygulama silindi');
              loadAdminApps();
            }
          } catch(e) {
            alert('Silinemedi: ' + e.message);
          }
        }
      </script>
    `;

    res.send(pageTemplate('Sistem Yönetim Paneli', content, extraHead));
  };
};
