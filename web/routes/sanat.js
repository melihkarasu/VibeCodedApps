module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/sanat/app.css?v=20261017a">
      <script src="/static/apps/sanat/app.js?v=20261017a" defer></script>
    `;

    const content = `
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Sanat & Edebiyat</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Global Sanat Galerisi</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5">
            The Metropolitan Museum of Art (The Met) dijital arşivi ile yüksek çözünürlüklü küratörlük ve fırça detayları.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-slate">
          <span>The Met Digital Archive • Public Domain</span>
        </div>
      </div>

      <!-- 1. GÜNÜN BAŞYAPITI (FEATURED MASTERPIECE HERO) -->
      <div id="hero-masterpiece" class="relative rounded-3xl overflow-hidden bg-white border border-mistral-hairline shadow-2xl mb-10 group">
        <div class="grid grid-cols-1 lg:grid-cols-12 items-center">
          <!-- Görsel -->
          <div class="lg:col-span-7 h-72 sm:h-96 relative overflow-hidden bg-mistral-canvas">
            <img id="hero-img" src="https://images.metmuseum.org/CRDImages/ep/web-large/DP-42549-001.jpg" alt="Günün Eseri" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
            <div class="absolute inset-0 bg-white  via-transparent to-transparent lg:hidden"></div>
          </div>

          <!-- Bilgi Paneli -->
          <div class="lg:col-span-5 p-6 sm:p-8 space-y-4">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                Günün Başyapıtı
              </span>
              <span id="hero-date" class="text-xs text-mistral-slate font-mono">1889</span>
            </div>

            <div>
              <h2 id="hero-title" class="text-2xl sm:text-3xl font-black text-mistral-ink leading-tight">
                Wheat Field with Cypresses
              </h2>
              <p id="hero-artist" class="text-sm font-semibold text-purple-400 mt-1">
                Vincent van Gogh (Hollandalı, 1853–1890)
              </p>
            </div>

            <p id="hero-desc" class="text-xs text-mistral-slate leading-relaxed line-clamp-3">
              Van Gogh'un Saint-Rémy akıl hastanesindeyken resmettiği en ikonik manzaralarından biri. Selvi ağaçlarının ritmik kıvrımları ve gökyüzünün fırça dokusu sanatçının yoğun iç dünyasını yansıtır.
            </p>

            <div class="pt-2 flex flex-wrap items-center gap-3">
              <button onclick="openDeepZoomModal(436535)" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-500/20 flex items-center gap-2">
                <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span> Fırça Detaylarını İncele
              </button>
              <button onclick="quickSaveArt(436535, 'Wheat Field with Cypresses', 'Vincent van Gogh', 'https://images.metmuseum.org/CRDImages/ep/web-large/DP-42549-001.jpg', '1889')" class="px-4 py-2.5 rounded-xl bg-white hover:bg-mistral-cream border border-mistral-hairline text-xs font-semibold text-mistral-ink transition">
                Koleksiyonuma Ekle
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. KÜRATÖR SEÇKİLERİ VE SANATÇI FİLTRELERİ -->
      <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-5">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate mb-2">Usta Sanatçılar ve Akımlar</label>
          <div class="flex flex-wrap gap-2" id="artist-filter-buttons">
            <button onclick="fetchArtworks('Van Gogh', 'artist')" class="filter-btn active px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 text-white transition flex items-center gap-1.5 shadow">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></span> Van Gogh
            </button>
            <button onclick="fetchArtworks('Claude Monet', 'artist')" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-mistral-hairline text-mistral-slate hover:text-white transition flex items-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></span> Claude Monet
            </button>
            <button onclick="fetchArtworks('Rembrandt', 'artist')" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-mistral-hairline text-mistral-slate hover:text-white transition flex items-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></span> Rembrandt
            </button>
            <button onclick="fetchArtworks('Hokusai', 'artist')" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-mistral-hairline text-mistral-slate hover:text-white transition flex items-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg></span> Hokusai
            </button>
            <button onclick="fetchArtworks('Edgar Degas', 'artist')" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-mistral-hairline text-mistral-slate hover:text-white transition flex items-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></span> Edgar Degas
            </button>
            <button onclick="fetchArtworks('Cezanne', 'artist')" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-mistral-hairline text-mistral-slate hover:text-white transition flex items-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg></span> Cézanne
            </button>
            <button onclick="fetchArtworks('Vermeer', 'artist')" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-mistral-hairline text-mistral-slate hover:text-white transition flex items-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg></span> Vermeer
            </button>
            <button onclick="fetchArtworks('Renaissance', 'keyword')" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-mistral-hairline text-mistral-slate hover:text-white transition flex items-center gap-1.5">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span> Rönesans
            </button>
          </div>
        </div>

        <!-- Arama Çubuğu -->
        <div class="pt-3 border-t border-mistral-hairline flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <input type="text" id="input-art-search" placeholder="Sanatçı, tablo veya tema arayın (Örn: Portrait, Landscape, Sunflowers)..." onkeyup="if(event.key==='Enter') searchArt()" class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder-slate-500 focus:border-purple-400 focus:outline-none">
            <span class="absolute left-3.5 top-3 text-mistral-stone text-sm"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          </div>
          <button onclick="searchArt()" class="px-5 py-2.5 rounded-xl text-mistral-ink font-boldbg-mistral-cream-light hover:bg-mistral-cream-deeper text-mistral-ink font-bold font-semibold text-xs transition">
            Eser Ara
          </button>
        </div>
      </div>

      <!-- 3. ESERLER LİSTESİ BAŞLIĞI -->
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-bold text-mistral-ink flex items-center gap-2">
          <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg></span> <span id="gallery-topic-title">Van Gogh Koleksiyonu</span>
        </h2>
        <span id="results-count" class="text-xs text-mistral-slate font-mono">Eserler listeleniyor...</span>
      </div>

      <!-- 4. ESER KARTLARI GRİDİ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="artworks-grid">
        <!-- JS ile doldurulur -->
      </div>

      <div id="loading-spinner" class="py-16 text-center text-mistral-slate text-sm flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
        <span>The Met Müzesi arşivinden yüksek çözünürlüklü tablolar çekiliyor...</span>
      </div>

      <div id="empty-state" class="hidden py-16 text-center text-mistral-slate text-sm">
        <div class="text-4xl mb-2"><svg class="w-6 h-6 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></div>
        <span>Bu arama kriterine uygun görsel bulunamadı. Lütfen başka bir sanatçı veya akım seçin.</span>
      </div>

      <!-- 5. KİŞİSEL SANAT KOLEKSİYONUM (MY GALLERY) -->
      <div class="mt-14 pt-8 border-t border-mistral-hairline">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-bold text-mistral-ink flex items-center gap-2">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg></span> Kişisel Sanat Koleksiyonum
            </h2>
            <p class="text-mistral-slate text-xs mt-1">
              Beğendiğiniz tabloları sanal sergi salonunuza kaydedin, fırça detaylarını istediğiniz zaman inceleyin.
            </p>
          </div>
          <button onclick="clearAllSavedArt()" class="text-xs text-rose-400 hover:underline px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition">
            Koleksiyonu Temizle
          </button>
        </div>

        <div id="saved-art-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <!-- JS ile kayıtlı eserler -->
        </div>
        <div id="saved-art-empty" class="p-8 text-center rounded-2xl bg-white border border-mistral-hairline text-mistral-stone text-xs">
          Henüz koleksiyonunuza bir eser eklemediniz. Eser kartlarındaki simgesine tıklayarak serginizi oluşturabilirsiniz.
        </div>
      </div>

      <!-- 6. DERİN YAKINLAŞTIRMA (DEEP ZOOM & DETAIL MODAL) -->
      <div id="zoom-modal" class="hidden fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        <div class="relative w-full max-w-5xl h-[92vh] bg-white border border-mistral-hairline rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          
          <!-- Modal Üst Çubuk -->
          <div class="p-4 bg-white border-b border-mistral-hairline flex items-center justify-between gap-4 shrink-0">
            <div class="min-w-0">
              <h3 id="modal-art-title" class="font-bold text-sm text-mistral-ink truncate">Eser Adı</h3>
              <p id="modal-art-artist" class="text-xs text-purple-400 truncate">Sanatçı</p>
            </div>

            <!-- Yakınlaştırma Araçları & Kapat -->
            <div class="flex items-center gap-2">
              <div class="flex items-center bg-white rounded-xl border border-mistral-hairline p-0.5">
                <button onclick="changeZoom(-0.25)" class="w-8 h-8 rounded-lg hover:bg-mistral-cream-light text-mistral-ink font-bold font-mono text-base flex items-center justify-center transition" title="Uzaklaş">
                  -
                </button>
                <span id="zoom-level-text" class="px-2 text-xs font-mono text-mistral-slate">100%</span>
                <button onclick="changeZoom(0.25)" class="w-8 h-8 rounded-lg hover:bg-mistral-cream-light text-mistral-ink font-bold font-mono text-base flex items-center justify-center transition" title="Yakınlaş">
                  +
                </button>
                <button onclick="resetZoom()" class="px-2.5 h-8 rounded-lg hover:bg-mistral-cream-light text-[11px] text-mistral-slate hover:text-mistral-ink font-bold transition" title="Sıfırla">
                  Sıfırla
                </button>
              </div>

              <button onclick="toggleModalSaved()" id="btn-modal-art-save" class="px-3 py-1.5 rounded-xl bg-white hover:bg-mistral-cream border border-mistral-hairline text-xs font-semibold text-mistral-ink transition flex items-center gap-1.5">
                <span id="modal-art-save-icon"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg></span> <span id="modal-art-save-text">Koleksiyona Ekle</span>
              </button>

              <button onclick="closeZoomModal()" class="w-9 h-9 rounded-full bg-white hover:bg-mistral-cream-light text-mistral-slate hover:text-mistral-ink font-bold flex items-center justify-center transition border border-mistral-hairline text-sm">
                
              </button>
            </div>
          </div>

          <!-- Görsel Alanı (Pan & Zoom Tuvali) -->
          <div class="relative flex-1 zoom-container bg-black flex items-center justify-center" id="pan-container" onmousedown="startPan(event)" onmousemove="doPan(event)" onmouseup="endPan()" onmouseleave="endPan()" onwheel="handleWheel(event)">
            <img id="modal-zoom-img" src="" class="zoom-img max-w-full max-h-full object-contain pointer-events-none select-none">
            <div class="absolute bottom-4 left-4 pointer-events-none bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-mistral-slate">
              İpucu: Fare tekerleğiyle yakınlaşabilir, tıklayıp sürükleyerek fırça darbelerini inceleyebilirsiniz.
            </div>
          </div>

          <!-- Eser Acıklaması (yalnızca modalda; kaynak: Met notu / Vikipedi, otomatik TR) -->
          <div id="modal-desc-box" class="hidden p-4 bg-mistral-cream-light border-t border-mistral-hairline shrink-0 max-h-[28%] overflow-y-auto">
            <p id="modal-art-desc" class="text-xs text-mistral-slate leading-relaxed"></p>
            <span id="modal-art-desc-source" class="block text-[10px] text-mistral-stone mt-2"></span>
          </div>

          <!-- Modal Alt Künye Çubuğu -->
          <div class="p-4 bg-white border-t border-mistral-hairline flex flex-wrap items-center justify-between text-xs text-mistral-slate gap-3 shrink-0">
            <div class="flex flex-wrap items-center gap-3">
              <span id="modal-art-date" class="font-mono text-mistral-slate"></span>
              <span>•</span>
              <span id="modal-art-medium" class="text-mistral-slate truncate max-w-xs"></span>
              <span>•</span>
              <span id="modal-art-dims" class="font-mono"></span>
            </div>
            <a id="modal-art-met-link" href="#" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:underline flex items-center gap-1">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></span> The Met Kataloğunda Gör &rarr;
            </a>
          </div>

        </div>
      </div>

      <!-- Toast Bildirimi -->
      <div id="sanat-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı -->
    `;

    res.send(pageTemplate('Global Sanat Galerisi', content, extraHead));
  };
};
