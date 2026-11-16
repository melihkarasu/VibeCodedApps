module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="/static/apps/akademik/app.js?v=20261116a" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-medium">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Vitrine Dön
            </a>
            <span class="text-stone-300 text-xs">•</span>
            <span class="text-xs text-mistral-stone uppercase tracking-wider font-semibold">Akademik & Bilimsel Araştırma</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold text-mistral-ink tracking-tight mt-1 flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </span>
            <span>Akademik Makale & Atıf Ağı Kaşifi</span>
          </h1>
          <p class="text-mistral-slate text-sm mt-1">OpenAlex ve Crossref üzerinden 250M+ bilimsel yayını konu, yazar, kurum veya DOI ile tarayın; açık erişim PDF ve APA/IEEE/MLA/BibTeX kaynakça üretin.</p>
        </div>

        <div class="flex items-center gap-2 self-start md:self-auto">
          <span id="akademik-source-badge" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            OpenAlex + Crossref Canlı
          </span>
        </div>
      </div>

      <!-- Hızlı Konu Etiketleri -->
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold text-mistral-stone uppercase tracking-wider mr-1">Popüler Araştırma Alanları:</span>
        <button type="button" data-quick-query="Large Language Models Transformer" class="akademik-topic-chip px-3 py-1 rounded-full text-xs font-medium bg-white border border-mistral-border text-mistral-ink hover:border-amber-500 hover:text-amber-600 transition">🧠 Büyük Dil Modelleri (LLM)</button>
        <button type="button" data-quick-query="CRISPR Gene Editing" class="akademik-topic-chip px-3 py-1 rounded-full text-xs font-medium bg-white border border-mistral-border text-mistral-ink hover:border-amber-500 hover:text-amber-600 transition">🧬 CRISPR & Gen Düzenleme</button>
        <button type="button" data-quick-query="Quantum Error Correction" class="akademik-topic-chip px-3 py-1 rounded-full text-xs font-medium bg-white border border-mistral-border text-mistral-ink hover:border-amber-500 hover:text-amber-600 transition">⚛️ Kuantum Hesaplama</button>
        <button type="button" data-quick-query="Solid State Battery" class="akademik-topic-chip px-3 py-1 rounded-full text-xs font-medium bg-white border border-mistral-border text-mistral-ink hover:border-amber-500 hover:text-amber-600 transition">🔋 Katı Hal Bataryaları</button>
        <button type="button" data-quick-query="Climate Change Mitigation" class="akademik-topic-chip px-3 py-1 rounded-full text-xs font-medium bg-white border border-mistral-border text-mistral-ink hover:border-amber-500 hover:text-amber-600 transition">🌍 İklim & Karbon Yakalama</button>
        <button type="button" data-quick-query="Zero Trust Cybersecurity" class="akademik-topic-chip px-3 py-1 rounded-full text-xs font-medium bg-white border border-mistral-border text-mistral-ink hover:border-amber-500 hover:text-amber-600 transition">🛡️ Zero-Trust Siber Güvenlik</button>
      </div>

      <!-- Arama & Filtre Paneli -->
      <div class="bg-white rounded-2xl border border-mistral-border p-4 sm:p-5 shadow-xs mb-6">
        <form id="akademik-search-form" class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div class="md:col-span-5">
            <label for="akademik-query" class="block text-xs font-semibold text-mistral-slate mb-1.5">Konu, Başlık, Yazar veya DOI (ör: 10.1038/...)</label>
            <div class="relative">
              <input id="akademik-query" type="search" value="Large Language Models Transformer" placeholder="Makale adı, yazar, üniversite veya DOI girin..." required class="w-full pl-9 pr-3 py-2.5 rounded-xl border border-mistral-border bg-stone-50/60 text-sm text-mistral-ink focus:outline-none focus:border-amber-500 transition" />
              <span class="absolute left-3 top-3 text-mistral-stone">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
            </div>
          </div>

          <div class="md:col-span-3">
            <label for="akademik-sort" class="block text-xs font-semibold text-mistral-slate mb-1.5">Sıralama Ölçütü</label>
            <select id="akademik-sort" class="w-full px-3 py-2.5 rounded-xl border border-mistral-border bg-stone-50/60 text-sm text-mistral-ink focus:outline-none focus:border-amber-500">
              <option value="cited_by_count:desc">En Çok Atıf Alanlar (Atıf ↓)</option>
              <option value="publication_year:desc">En Güncel Yayınlar (Yıl ↓)</option>
              <option value="relevance_score:desc">Arama Alaka Düzeyi</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label for="akademik-year" class="block text-xs font-semibold text-mistral-slate mb-1.5">Başlangıç Yılı</label>
            <select id="akademik-year" class="w-full px-3 py-2.5 rounded-xl border border-mistral-border bg-stone-50/60 text-sm text-mistral-ink focus:outline-none focus:border-amber-500">
              <option value="0">Tüm Yıllar</option>
              <option value="2024">2024 ve sonrası</option>
              <option value="2022">2022 ve sonrası</option>
              <option value="2018">2018 ve sonrası</option>
              <option value="2010">2010 ve sonrası</option>
            </select>
          </div>

          <div class="md:col-span-2 flex gap-2">
            <button type="submit" id="akademik-submit-btn" class="w-full py-2.5 px-4 rounded-xl bg-mistral-ink hover:bg-amber-600 text-white text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer">
              <span>Araştır</span>
            </button>
          </div>
        </form>

        <div class="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <label class="inline-flex items-center gap-2 text-xs font-medium text-mistral-slate cursor-pointer select-none">
            <input id="akademik-oa-only" type="checkbox" class="rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
            <span>Yalnızca <b>Açık Erişim (Open Access PDF)</b> makaleleri göster</span>
          </label>
          <div id="akademik-stats-bar" class="text-xs text-mistral-stone font-medium">
            Veriler yükleniyor...
          </div>
        </div>
      </div>

      <!-- Özet Metrik Kartları -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="bg-white rounded-xl border border-mistral-border p-3.5">
          <div class="text-xs text-mistral-stone font-medium">Eşleşen Toplam Yayın</div>
          <div id="stat-total-works" class="text-xl font-bold text-mistral-ink mt-0.5">—</div>
        </div>
        <div class="bg-white rounded-xl border border-mistral-border p-3.5">
          <div class="text-xs text-mistral-stone font-medium">Listelenen Toplam Atıf</div>
          <div id="stat-total-citations" class="text-xl font-bold text-amber-600 mt-0.5">—</div>
        </div>
        <div class="bg-white rounded-xl border border-mistral-border p-3.5">
          <div class="text-xs text-mistral-stone font-medium">Açık Erişim (OA) Oranı</div>
          <div id="stat-oa-ratio" class="text-xl font-bold text-emerald-600 mt-0.5">—</div>
        </div>
        <div class="bg-white rounded-xl border border-mistral-border p-3.5">
          <div class="text-xs text-mistral-stone font-medium">Medyan Yayın Yılı</div>
          <div id="stat-median-year" class="text-xl font-bold text-mistral-ink mt-0.5">—</div>
        </div>
      </div>

      <!-- Yükleniyor Durumu -->
      <div id="akademik-loading" class="py-16 text-center">
        <div class="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-mistral-border shadow-xs">
          <span class="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></span>
          <span class="text-sm font-medium text-mistral-slate">OpenAlex & Crossref akademik dizini taranıyor...</span>
        </div>
      </div>

      <!-- Makale Kartları Grid -->
      <div id="akademik-grid" class="hidden grid grid-cols-1 md:grid-cols-2 gap-4 mb-12" style="content-visibility: auto;">
      </div>

      <!-- Native <dialog closedby="any"> Makale Detay, Atıf Grafiği & Kaynakça Üretici Modalı -->
      <dialog id="akademik-detail-dialog" closedby="any" class="w-full max-w-3xl rounded-2xl border border-mistral-border bg-white p-0 shadow-2xl backdrop:bg-black/50">
        <div class="p-5 sm:p-6 border-b border-mistral-border flex items-start justify-between gap-4">
          <div>
            <div id="dialog-work-badges" class="flex flex-wrap items-center gap-2 mb-2"></div>
            <h2 id="dialog-work-title" class="text-lg sm:text-xl font-bold text-mistral-ink leading-snug">Makale Detayı</h2>
          </div>
          <button type="button" id="dialog-close-btn" aria-label="Kapat" class="w-8 h-8 rounded-lg border border-mistral-border flex items-center justify-center text-mistral-slate hover:text-mistral-ink hover:bg-stone-100 transition shrink-0 cursor-pointer">
            ✕
          </button>
        </div>

        <div class="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          <div>
            <div class="text-xs font-semibold uppercase tracking-wider text-mistral-stone mb-1">Yazarlar & Kurumlar</div>
            <p id="dialog-work-authors" class="text-sm text-mistral-ink font-medium"></p>
            <p id="dialog-work-institutions" class="text-xs text-mistral-slate mt-1"></p>
          </div>

          <div>
            <div class="text-xs font-semibold uppercase tracking-wider text-mistral-stone mb-1">Özet (Abstract)</div>
            <p id="dialog-work-abstract" class="text-sm text-mistral-slate leading-relaxed bg-stone-50 rounded-xl p-3.5 border border-stone-200/70"></p>
          </div>

          <div>
            <div class="text-xs font-semibold uppercase tracking-wider text-mistral-stone mb-2">Yıllara Göre Atıf Dağılımı</div>
            <div id="dialog-citation-chart" class="grid grid-cols-4 sm:grid-cols-8 gap-2 items-end bg-stone-50 rounded-xl p-3.5 border border-stone-200/70 min-h-[110px]"></div>
          </div>

          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-mistral-stone">Otomatik Kaynakça Üretici (APA 7 / IEEE / MLA 9 / BibTeX)</span>
              <div class="flex items-center gap-1.5">
                <button type="button" id="dialog-copy-citation" class="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-xs font-semibold transition cursor-pointer">Kopyala</button>
                <button type="button" id="dialog-download-bib" class="px-2.5 py-1 rounded-lg bg-stone-100 text-mistral-ink hover:bg-stone-200 text-xs font-semibold transition cursor-pointer">.bib İndir</button>
              </div>
            </div>
            <div class="flex gap-1.5 mb-2">
              <button type="button" data-cite-fmt="apa" class="cite-fmt-btn px-3 py-1 rounded-lg text-xs font-semibold bg-mistral-ink text-white cursor-pointer">APA 7</button>
              <button type="button" data-cite-fmt="ieee" class="cite-fmt-btn px-3 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-mistral-slate cursor-pointer">IEEE</button>
              <button type="button" data-cite-fmt="mla" class="cite-fmt-btn px-3 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-mistral-slate cursor-pointer">MLA 9</button>
              <button type="button" data-cite-fmt="bibtex" class="cite-fmt-btn px-3 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-mistral-slate cursor-pointer">BibTeX</button>
            </div>
            <pre id="dialog-citation-output" class="text-xs bg-stone-900 text-stone-100 rounded-xl p-3.5 overflow-x-auto whitespace-pre-wrap font-mono"></pre>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200">
            <a id="dialog-doi-link" href="#" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-amber-600 hover:underline">DOI Bağlantısını Aç ↗</a>
            <a id="dialog-oa-link" href="#" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition">Tam Metin PDF / Kaynağı Aç ↗</a>
          </div>
        </div>
      </dialog>
    `;

    res.send(pageTemplate('Akademik Makale & Atıf Ağı Kaşifi', content, extraHead));
  };
};
