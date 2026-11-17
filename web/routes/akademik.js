module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/akademik/app.css?v=20261117d" />
      <script src="/static/apps/akademik/app.js?v=20261117d" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="vibe-page-header mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold">
              <svg width="14" height="14" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              <span>Vitrine Dön</span>
            </a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Akademik</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2">
            <span class="vibe-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </span>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Akademik Makale & Atıf Ağı Kaşifi</h1>
          </div>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            OpenAlex ve Crossref açık akademik dizini üzerinden 250 milyondan fazla bilimsel yayını başlık, yazar, kurum, dergi veya DOI bazında sorgulayın; kaynakça ve atıf metriklerini tablo halinde inceleyin.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs self-start md:self-auto shrink-0">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span id="akademik-source-badge" class="font-semibold">OpenAlex & Crossref Hazır</span>
        </div>
      </div>

      <!-- Çok Alanlı Tam Genişlikli Akademik Arama & Filtre Paneli -->
      <section class="w-full p-5 sm:p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-6">
        <form id="akademik-search-form" class="space-y-4">
          <!-- 1. Satır: Veri Türlerine Göre Ayrı Metin Kutuları -->
          <div class="akademik-form-row-top">
            <div>
              <label for="field-title" class="akademik-label">
                <svg width="14" height="14" class="w-3.5 h-3.5 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                <span>Makale Başlığı / Konu</span>
              </label>
              <input id="field-title" type="text" placeholder="Örn: Attention mechanism, CRISPR, solid state..." class="akademik-input" />
            </div>

            <div>
              <label for="field-author" class="akademik-label">
                <svg width="14" height="14" class="w-3.5 h-3.5 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Yazar Adı Soyadı</span>
              </label>
              <input id="field-author" type="text" placeholder="Örn: Aziz Sancar,Geoffrey Hinton..." class="akademik-input" />
            </div>

            <div>
              <label for="field-institution" class="akademik-label">
                <svg width="14" height="14" class="w-3.5 h-3.5 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>
                <span>Kurum / Üniversite</span>
              </label>
              <input id="field-institution" type="text" placeholder="Örn: MIT, Stanford, Boğaziçi, İTÜ..." class="akademik-input" />
            </div>

            <div>
              <label for="field-venue" class="akademik-label">
                <svg width="14" height="14" class="w-3.5 h-3.5 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                <span>Dergi / Konferans</span>
              </label>
              <input id="field-venue" type="text" placeholder="Örn: Nature, Science, NeurIPS, IEEE..." class="akademik-input" />
            </div>
          </div>

          <!-- 2. Satır: DOI, Yıl Aralığı, Sıralama, Açık Erişim ve Aksiyon Butonları -->
          <div class="akademik-form-row-bottom">
            <div>
              <label for="field-doi" class="akademik-label">
                <svg width="14" height="14" class="w-3.5 h-3.5 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                <span>DOI Numarası</span>
              </label>
              <input id="field-doi" type="text" placeholder="Örn: 10.1038/s41586-021-03819-2" class="akademik-input font-mono" />
            </div>

            <div>
              <label for="field-year-from" class="akademik-label">
                <svg width="14" height="14" class="w-3.5 h-3.5 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>Başlangıç Yılı</span>
              </label>
              <input id="field-year-from" type="number" min="1900" max="2030" placeholder="Örn: 2018" class="akademik-input font-mono" />
            </div>

            <div>
              <label for="field-year-to" class="akademik-label">
                <svg width="14" height="14" class="w-3.5 h-3.5 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>Bitiş Yılı</span>
              </label>
              <input id="field-year-to" type="number" min="1900" max="2030" placeholder="Örn: 2026" class="akademik-input font-mono" />
            </div>

            <div>
              <label for="field-index-filter" class="akademik-label">
                <svg width="14" height="14" class="w-3.5 h-3.5 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                <span>İndeks & Dergi Niteliği</span>
              </label>
              <select id="field-index-filter" class="akademik-input">
                <option value="all">Tüm İndeksler</option>
                <option value="journal_core">Çekirdek Hakemli Dergi (Core / Scopus-WoS)</option>
                <option value="core">Tüm Çekirdek Yayınlar (CWTS Core)</option>
                <option value="crossref">Crossref (DOI Kayıtlı)</option>
                <option value="pubmed">PubMed / MEDLINE</option>
                <option value="doaj">DOAJ (Açık Erişim Dergi)</option>
                <option value="arxiv">arXiv (Ön Baskı / Preprint)</option>
              </select>
            </div>

            <div>
              <label for="field-sort" class="akademik-label">
                <svg width="14" height="14" class="w-3.5 h-3.5 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
                <span>Sıralama Ölçütü</span>
              </label>
              <select id="field-sort" class="akademik-input">
                <option value="cited_by_count:desc">Atıf Sayısı (Yüksekten Düşüğe)</option>
                <option value="publication_year:desc">Yayın Yılı (En Yeniden Eskiye)</option>
                <option value="relevance_score:desc">Arama Alaka Düzeyi</option>
              </select>
            </div>

            <div>
              <label for="field-oa" class="akademik-label">
                <svg width="14" height="14" class="w-3.5 h-3.5 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                <span>Erişim Filtresi</span>
              </label>
              <select id="field-oa" class="akademik-input">
                <option value="all">Tüm Yayınlar</option>
                <option value="oa">Yalnızca Açık Erişim (PDF)</option>
              </select>
            </div>

            <div class="flex items-center gap-2">
              <button type="submit" id="akademik-submit-btn" class="flex-1 py-2.5 px-4 rounded-xl bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-2">
                <svg width="16" height="16" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>Sorgula</span>
              </button>
              <button type="button" id="akademik-reset-btn" title="Alanları Temizle" class="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-mistral-slate hover:text-mistral-ink text-xs font-semibold transition cursor-pointer">
                Temizle
              </button>
            </div>
          </div>

          <!-- Alt Satır: Örnek Sorgu Şablonları & Durum Bilgisi -->
          <div class="pt-3 border-t border-mistral-hairline flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-1.5 text-xs">
              <span class="font-semibold text-mistral-stone mr-1 inline-flex items-center gap-1">
                <svg width="14" height="14" class="w-3.5 h-3.5 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>Hazır Sorgu Şablonları:</span>
              </span>
              <button type="button" data-preset-title="Transformer Attention Mechanism" class="akademik-preset-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium transition cursor-pointer">Transformer & LLM</button>
              <button type="button" data-preset-author="Aziz Sancar" class="akademik-preset-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium transition cursor-pointer">Yazar: Aziz Sancar</button>
              <button type="button" data-preset-title="CRISPR-Cas9 Genome Editing" class="akademik-preset-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium transition cursor-pointer">CRISPR Gen Düzenleme</button>
              <button type="button" data-preset-title="Quantum Error Correction" class="akademik-preset-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium transition cursor-pointer">Kuantum Hata Düzeltme</button>
              <button type="button" data-preset-doi="10.1038/s41586-021-03819-2" class="akademik-preset-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium font-mono transition cursor-pointer">DOI: AlphaFold</button>
            </div>
            <div id="akademik-stats-bar" class="text-xs text-mistral-stone font-medium">
              Sorgulama için yukarıdaki alanlardan en az birini doldurun.
            </div>
          </div>
        </form>
      </section>

      <!-- Özet Metrik Kartları (Arama yapıldığında görünür) -->
      <section id="akademik-metrics-section" class="hidden akademik-metrics-grid mb-6">
        <div class="bg-white rounded-xl border border-mistral-hairline p-4 shadow-xs">
          <div class="text-xs text-mistral-stone font-semibold uppercase tracking-wider">Eşleşen Toplam Yayın</div>
          <div id="stat-total-works" class="text-2xl font-bold text-mistral-ink font-mono mt-1">—</div>
        </div>
        <div class="bg-white rounded-xl border border-mistral-hairline p-4 shadow-xs">
          <div class="text-xs text-mistral-stone font-semibold uppercase tracking-wider">Tablodaki Toplam Atıf</div>
          <div id="stat-total-citations" class="text-2xl font-bold text-mistral-orange font-mono mt-1">—</div>
        </div>
        <div class="bg-white rounded-xl border border-mistral-hairline p-4 shadow-xs">
          <div class="text-xs text-mistral-stone font-semibold uppercase tracking-wider">Açık Erişim (OA) Oranı</div>
          <div id="stat-oa-ratio" class="text-2xl font-bold text-emerald-700 font-mono mt-1">—</div>
        </div>
        <div class="bg-white rounded-xl border border-mistral-hairline p-4 shadow-xs">
          <div class="text-xs text-mistral-stone font-semibold uppercase tracking-wider">Medyan Yayın Yılı</div>
          <div id="stat-median-year" class="text-2xl font-bold text-mistral-ink font-mono mt-1">—</div>
        </div>
      </section>

      <!-- Başlangıç Boş Durumu (Sayfa ilk açıldığında API isteği atılmaz) -->
      <section id="akademik-initial-state" class="bg-white rounded-2xl border border-mistral-hairline p-10 sm:p-14 text-center shadow-xs mb-12">
        <div class="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-mistral-orange flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h2 class="text-lg font-bold text-mistral-ink font-editorial">Akademik Literatür Sorgulamaya Hazır</h2>
        <p class="text-xs sm:text-sm text-mistral-slate max-w-xl mx-auto mt-1.5 leading-relaxed">
          Sayfa açılışında gereksiz ağ trafiği oluşturmamak için otomatik sorgu çalıştırılmaz. Makale başlığı, yazar adı, üniversite/kurum, dergi veya doğrudan DOI numarası girerek <b>Sorgula</b> butonuna basın.
        </p>
      </section>

      <!-- Yükleniyor Durumu -->
      <section id="akademik-loading" class="hidden py-14 text-center">
        <div class="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-mistral-hairline shadow-xs">
          <span class="w-4 h-4 rounded-full border-2 border-mistral-orange border-t-transparent animate-spin"></span>
          <span class="text-sm font-medium text-mistral-slate">OpenAlex ve Crossref akademik veritabanı sorgulanıyor...</span>
        </div>
      </section>

      <!-- Sonuç Tablosu (Arama yapıldığında görünür) -->
      <section id="akademik-results-section" class="hidden mb-14">
        <div class="akademik-table-container">
          <table class="akademik-table">
            <thead>
              <tr>
                <th style="width: 90px;">Yıl & Tür</th>
                <th style="width: 34%;">Makale Başlığı & Alanlar</th>
                <th style="width: 24%;">Yazarlar & Kurum</th>
                <th style="width: 18%;">Dergi & İndeks Kaynağı</th>
                <th style="width: 100px;">Atıf Sayısı</th>
                <th style="width: 150px;">Erişim & İşlem</th>
              </tr>
            </thead>
            <tbody id="akademik-table-body">
            </tbody>
          </table>
          <div id="akademik-main-pagination" class="akademik-pagination-bar">
            <div id="main-page-info" class="font-mono text-xs">Sayfa 1</div>
            <div class="akademik-page-controls">
              <button type="button" id="main-prev-btn" class="akademik-page-btn" disabled>Önceki Sayfa</button>
              <button type="button" id="main-next-btn" class="akademik-page-btn" disabled>Sonraki Sayfa</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Native <dialog closedby="any"> Makale Detay, Atıf Grafiği & Kaynakça Üretici Modalı -->
      <dialog id="akademik-detail-dialog" closedby="any" class="w-full max-w-3xl rounded-2xl border border-mistral-hairline bg-white p-0 shadow-2xl backdrop:bg-black/50">
        <div class="p-5 sm:p-6 border-b border-mistral-hairline flex items-start justify-between gap-4">
          <div>
            <div id="dialog-work-badges" class="flex flex-wrap items-center gap-2 mb-2"></div>
            <h2 id="dialog-work-title" class="text-lg sm:text-xl font-bold text-mistral-ink font-editorial leading-snug">Makale Detayı</h2>
          </div>
          <button type="button" id="dialog-close-btn" aria-label="Kapat" class="w-8 h-8 rounded-lg border border-mistral-hairline flex items-center justify-center text-mistral-slate hover:text-mistral-ink hover:bg-stone-100 transition shrink-0 cursor-pointer">
            <svg width="16" height="16" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
            <p id="dialog-work-abstract" class="text-sm text-mistral-slate leading-relaxed bg-stone-50 rounded-xl p-3.5 border border-mistral-hairline"></p>
          </div>

          <div>
            <div class="text-xs font-semibold uppercase tracking-wider text-mistral-stone mb-2">Yıllara Göre Atıf Sayıları Tablosu</div>
            <div class="akademik-subtable-wrap">
              <table class="akademik-subtable">
                <thead>
                  <tr>
                    <th>Yıl</th>
                    <th>Yıllık Atıf Sayısı</th>
                    <th>Toplam Atıf İçindeki Payı</th>
                    <th>Önceki Yıla Göre Değişim</th>
                  </tr>
                </thead>
                <tbody id="dialog-yearly-citations-tbody">
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-mistral-stone block">Bu Makaleye Atıf Yapan Yayınlar (OpenAlex Citing Works)</span>
                <span id="dialog-citing-works-count" class="text-xs font-mono font-semibold text-mistral-orange"></span>
              </div>
              <div class="flex flex-wrap items-center gap-1.5">
                <select id="citing-index-filter" class="akademik-page-btn" title="Atıf yapan yayınları indeks ve dergi niteliğine göre filtrele">
                  <option value="all">Tüm İndeksler</option>
                  <option value="journal_core">Çekirdek Hakemli Dergiler (Core / Scopus-WoS)</option>
                  <option value="core">CWTS Core Yayınlar</option>
                  <option value="crossref">Crossref (DOI)</option>
                  <option value="pubmed">PubMed</option>
                  <option value="doaj">DOAJ</option>
                  <option value="arxiv">arXiv (Ön Baskı)</option>
                </select>
                <select id="citing-per-page" class="akademik-page-btn font-mono" title="Sayfa başına kayıt sayısı">
                  <option value="25">25 / sayfa</option>
                  <option value="50">50 / sayfa</option>
                  <option value="100">100 / sayfa</option>
                </select>
                <button type="button" id="citing-export-csv-btn" class="akademik-export-btn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span id="citing-export-csv-label">Tüm Atıf Listesini İndir (CSV)</span>
                </button>
                <button type="button" id="citing-export-bib-btn" class="akademik-export-btn">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span id="citing-export-bib-label">Tümünü İndir (.bib)</span>
                </button>
              </div>
            </div>
            <div class="akademik-subtable-wrap">
              <table class="akademik-subtable">
                <thead>
                  <tr>
                    <th style="width: 65px;">Yıl</th>
                    <th>Atıf Yapan Yayın Başlığı & DOI</th>
                    <th>Yazarlar & Kurum</th>
                    <th>Dergi & İndeks Kaynağı</th>
                    <th style="width: 85px;">Atıf</th>
                  </tr>
                </thead>
                <tbody id="dialog-citing-works-tbody">
                </tbody>
              </table>
              <div class="akademik-pagination-bar">
                <div id="citing-page-info" class="font-mono text-xs">Sayfa 1</div>
                <div class="akademik-page-controls">
                  <button type="button" id="citing-prev-btn" class="akademik-page-btn" disabled>Önceki</button>
                  <button type="button" id="citing-next-btn" class="akademik-page-btn" disabled>Sonraki</button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-mistral-stone">Otomatik Kaynakça Üretici (APA 7 / IEEE / MLA 9 / BibTeX)</span>
              <div class="flex items-center gap-1.5">
                <button type="button" id="dialog-copy-citation" class="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-mistral-orange hover:bg-orange-100 text-xs font-semibold transition cursor-pointer">Kopyala</button>
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

          <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-mistral-hairline">
            <a id="dialog-doi-link" href="#" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-mistral-orange hover:underline inline-flex items-center gap-1">
              <span>DOI Kaydını Aç</span>
              <svg width="14" height="14" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </a>
            <a id="dialog-oa-link" href="#" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-mistral-ink hover:bg-mistral-orange text-white text-xs font-semibold transition inline-flex items-center gap-1.5">
              <span>Tam Metin PDF / Kaynağı Aç</span>
              <svg width="14" height="14" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            </a>
          </div>
        </div>
      </dialog>
    `;

    res.send(pageTemplate('Akademik Makale & Atıf Ağı Kaşifi', content, extraHead));
  };
};
