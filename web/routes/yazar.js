module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/yazar/app.css?v=20261118b" />
      <script src="/static/apps/yazar/app.js?v=20261118b" defer></script>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">Akademik Yazar & Tüm Yayın Atıf Röntgeni</h1>
          </div>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            Bir araştırmacının tüm bilimsel yayınlarını, yayın başına atıf sayılarını, yıllık atıf tablosunu ve tüm yayınlarına gelen atıfların birleşik listesini (Scopus/Core, Crossref, PubMed ayrımıyla) inceleyin ve topluca CSV/BibTeX olarak indirin.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs self-start md:self-auto shrink-0">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span id="yazar-source-badge" class="font-semibold">OpenAlex + S2 + Crossref Hazır</span>
        </div>
      </div>

      <!-- Çok Alanlı Yazar Arama Paneli -->
      <section class="w-full p-5 sm:p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm mb-6">
        <form id="yazar-search-form" class="space-y-4">
          <div class="yazar-search-grid">
            <div>
              <label for="yazar-name" class="akademik-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Yazar Adı Soyadı</span>
              </label>
              <input id="yazar-name" type="text" placeholder="Örn: Aziz Sancar, Gökhan Hotamışlıgil..." class="akademik-input" />
            </div>

            <div>
              <label for="yazar-inst" class="akademik-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>
                <span>Kurum / Üniversite</span>
              </label>
              <input id="yazar-inst" type="text" placeholder="Örn: İTÜ, ODTÜ, Hacettepe, Harvard..." class="akademik-input" />
            </div>

            <div>
              <label for="yazar-orcid" class="akademik-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="12" y2="16"/></svg>
                <span>ORCID Numarası</span>
              </label>
              <input id="yazar-orcid" type="text" placeholder="0000-0001-2345-6789" class="akademik-input font-mono" />
            </div>

            <div>
              <label for="yazar-sort" class="akademik-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
                <span>Yazar Sıralama Ölçütü</span>
              </label>
              <select id="yazar-sort" class="akademik-input">
                <option value="cited_by_count:desc">Toplam Atıf Sayısı (Yüksekten Düşüğe)</option>
                <option value="summary_stats.h_index:desc">H-İndeksi (Yüksekten Düşüğe)</option>
                <option value="works_count:desc">Yayın Sayısı (Yüksekten Düşüğe)</option>
              </select>
            </div>

            <div class="flex items-center gap-2">
              <button type="submit" id="yazar-submit-btn" class="flex-1 py-2.5 px-4 rounded-xl bg-mistral-orange hover:bg-mistral-orange-deep text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>Yazar Ara</span>
              </button>
              <button type="button" id="yazar-reset-btn" class="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-mistral-slate hover:text-mistral-ink text-xs font-semibold transition cursor-pointer">
                Temizle
              </button>
            </div>
          </div>

          <div class="pt-3 border-t border-mistral-hairline flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-1.5 text-xs">
              <span class="font-semibold text-mistral-stone mr-1 inline-flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>Örnek Akademisyenler:</span>
              </span>
              <button type="button" data-preset-author="Aziz Sancar" class="yazar-preset-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium transition cursor-pointer">Aziz Sancar</button>
              <button type="button" data-preset-author="Gökhan S. Hotamisligil" class="yazar-preset-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium transition cursor-pointer">Gökhan Hotamışlıgil</button>
              <button type="button" data-preset-author="Uğur Şahin" class="yazar-preset-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium transition cursor-pointer">Uğur Şahin</button>
              <button type="button" data-preset-author="Metin Sitti" class="yazar-preset-btn px-2.5 py-1 rounded-md bg-stone-100 hover:bg-mistral-cream text-mistral-ink font-medium transition cursor-pointer">Metin Sitti</button>
            </div>
            <div id="yazar-status-bar" class="text-xs text-mistral-stone font-medium">
              Sorgulama için yazar adı, kurum veya ORCID numarası girin.
            </div>
          </div>
        </form>
      </section>

      <!-- Başlangıç Boş Durumu (Sayfa açılışında otomatik API isteği ATILMAZ) -->
      <section id="yazar-initial-state" class="bg-white rounded-2xl border border-mistral-hairline p-10 sm:p-14 text-center shadow-xs mb-12">
        <div class="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-mistral-orange flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <h2 class="text-lg font-bold text-mistral-ink font-editorial">Yazar Bazlı Yayın ve Birleşik Atıf Analizi</h2>
        <p class="text-xs sm:text-sm text-mistral-slate max-w-xl mx-auto mt-1.5 leading-relaxed">
          Bir akademisyeni arayıp seçtiğinizde; yazarın <b>tüm yayınlarını ve her yayına gelen atıf sayılarını</b>, <b>yıllara göre atıf dağılım tablosunu</b> ve <b>tüm yayınlarına gelen atıfların birleşik listesini</b> (Scopus/Core, Crossref, PubMed ayrımıyla) tek ekranda görüntüleyebilir ve CSV/BibTeX olarak indirebilirsiniz.
        </p>
      </section>

      <!-- Yükleniyor Durumu -->
      <section id="yazar-loading" class="hidden py-12 text-center">
        <div class="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-mistral-hairline shadow-xs">
          <span class="w-4 h-4 rounded-full border-2 border-mistral-orange border-t-transparent animate-spin"></span>
          <span id="yazar-loading-text" class="text-sm font-medium text-mistral-slate">Akademisyen profilleri sorgulanıyor...</span>
        </div>
      </section>

      <!-- 1. Aşama: Eşleşen Yazarlar Tablosu -->
      <section id="yazar-candidates-section" class="hidden mb-8">
        <div class="flex items-center justify-between gap-2 mb-2.5">
          <h2 class="text-base font-bold text-mistral-ink font-editorial">Eşleşen Akademisyen Profilleri (İncelemek İçin Seçin)</h2>
          <span id="yazar-candidates-count" class="text-xs font-mono text-mistral-stone"></span>
        </div>
        <div id="yazar-candidates-transparency" class="akademik-transparency-panel hidden">
          <div class="akademik-transparency-header">
            <div class="akademik-transparency-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span>Yazar Sorgusu — Çoklu API Şeffaflık Raporu</span>
            </div>
            <span id="yazar-candidates-transparency-summary" class="text-xs font-mono text-mistral-slate"></span>
          </div>
          <div id="yazar-candidates-provider-grid" class="akademik-provider-grid"></div>
        </div>
        <div class="akademik-table-container">
          <table class="akademik-table">
            <thead>
              <tr>
                <th>Akademisyen Adı & ORCID</th>
                <th>Kurum / Üniversite</th>
                <th>Toplam Yayın</th>
                <th>Toplam Atıf</th>
                <th>H-İndeksi / i10</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody id="yazar-candidates-tbody">
            </tbody>
          </table>
        </div>
      </section>

      <!-- 2. Aşama: Seçilen Yazarın Tüm Yayınları ve Birleşik Atıf Röntgeni Paneli -->
      <section id="yazar-profile-section" class="hidden mb-14 space-y-6">
        <!-- Seçili Yazar Başlık & Özet Metrik Kartları -->
        <div class="bg-white rounded-2xl border border-mistral-hairline p-5 sm:p-6 shadow-xs">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-mistral-hairline">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h2 id="prof-name" class="text-xl sm:text-2xl font-bold text-mistral-ink font-editorial">—</h2>
                <span id="prof-orcid-badge" class="akademik-concept-chip font-mono"></span>
              </div>
              <p id="prof-inst" class="text-xs sm:text-sm text-mistral-slate mt-1">—</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" id="prof-export-works-csv" class="akademik-export-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span id="prof-export-works-lbl">Yazarın Tüm Yayınlarını İndir (CSV)</span>
              </button>
              <button type="button" id="prof-export-all-cites-csv" class="akademik-export-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span id="prof-export-cites-lbl">Tüm Yayınlarına Gelen Atıfları İndir (CSV)</span>
              </button>
              <button type="button" id="prof-export-all-cites-bib" class="akademik-export-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span id="prof-export-bib-lbl">Tüm Atıfları İndir (.bib)</span>
              </button>
            </div>
          </div>

          <div class="akademik-metrics-grid mt-4">
            <div class="bg-stone-50 rounded-xl border border-mistral-hairline p-3.5">
              <div class="text-xs text-mistral-stone font-semibold uppercase tracking-wider">Toplam Yayın Sayısı</div>
              <div id="prof-stat-works" class="text-2xl font-bold text-mistral-ink font-mono mt-0.5">—</div>
            </div>
            <div class="bg-stone-50 rounded-xl border border-mistral-hairline p-3.5">
              <div class="text-xs text-mistral-stone font-semibold uppercase tracking-wider">Toplam Atıf Sayısı</div>
              <div id="prof-stat-citations" class="text-2xl font-bold text-mistral-orange font-mono mt-0.5">—</div>
            </div>
            <div class="bg-stone-50 rounded-xl border border-mistral-hairline p-3.5">
              <div class="text-xs text-mistral-stone font-semibold uppercase tracking-wider">H-İndeksi / i10-İndeksi</div>
              <div id="prof-stat-hindex" class="text-2xl font-bold text-emerald-700 font-mono mt-0.5">—</div>
            </div>
            <div class="bg-stone-50 rounded-xl border border-mistral-hairline p-3.5">
              <div class="text-xs text-mistral-stone font-semibold uppercase tracking-wider">2 Yıllık Ort. Atıf Etkisi</div>
              <div id="prof-stat-mean" class="text-2xl font-bold text-mistral-ink font-mono mt-0.5">—</div>
            </div>
          </div>
        </div>

        <!-- Görünür İndeks & Scopus / Kaynak Doğrulama Açıklama Rehberi -->
        <div class="akademik-legend-box">
          <div class="akademik-legend-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>Yazar Yayın ve Atıf İndeks Rozetleri Rehberi (Scopus / Core / Crossref / PubMed / DOAJ)</span>
          </div>
          <div class="akademik-legend-grid">
            <div><span class="akademik-idx-badge akademik-idx-badge--core">SCOPUS / CORE DERGİ</span> — ISSN kayıtlı, uluslararası çekirdek hakemli dergi (CWTS Core &amp; Scopus/WoS eşdeğeri).</div>
            <div><span class="akademik-idx-badge akademik-idx-badge--crossref">CROSSREF</span> — Resmi DOI ve yayıncı referans listesi tescilli yayın.</div>
            <div><span class="akademik-idx-badge akademik-idx-badge--pubmed">PUBMED</span> — NIH / MEDLINE biyomedikal dizin kaydı.</div>
            <div><span class="akademik-idx-badge akademik-idx-badge--doaj">DOAJ</span> — Hakemli açık erişim dergi dizini.</div>
          </div>
        </div>

        <!-- 3 Sekmeli Görünüm: 1) Tüm Yayınları ve Atıf Sayıları | 2) Tüm Yayınlarına Gelen Birleşik Atıf Listesi | 3) Yıllara Göre Yayın & Atıf Tablosu -->
        <div class="yazar-tabs-bar">
          <button type="button" data-yazar-tab="works" class="yazar-tab-btn active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            <span>1. Yazarın Tüm Yayınları & Yayın Başına Atıf Sayıları</span>
          </button>
          <button type="button" data-yazar-tab="citations" class="yazar-tab-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
            <span>2. Tüm Yayınlarına Gelen Birleşik Atıf Listesi (Atıf Yapan Eserler)</span>
          </button>
          <button type="button" data-yazar-tab="yearly" class="yazar-tab-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>3. Yıllara Göre Yayın ve Atıf Dağılım Tablosu</span>
          </button>
        </div>

        <!-- SEKME 1: Yazarın Tüm Yayınları Tablosu -->
        <div id="tab-panel-works">
          <div id="yazar-works-transparency" class="akademik-transparency-panel hidden">
            <div class="akademik-transparency-header">
              <div class="akademik-transparency-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <span>Yayınlar Sorgusu — Çoklu API Şeffaflık Raporu</span>
              </div>
              <span id="yazar-works-transparency-summary" class="text-xs font-mono text-mistral-slate"></span>
            </div>
            <div id="yazar-works-provider-grid" class="akademik-provider-grid"></div>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span id="works-filter-summary" class="text-xs font-semibold text-mistral-slate">Yazarın yayın portföyü</span>
            <div class="flex flex-wrap items-center gap-2">
              <select id="works-index-filter" class="akademik-page-btn">
                <option value="all">Tüm İndeksler</option>
                <option value="journal_core">Scopus / Core Hakemli Dergiler</option>
                <option value="crossref">Crossref (DOI)</option>
                <option value="pubmed">PubMed</option>
                <option value="doaj">DOAJ</option>
                <option value="arxiv">arXiv (Ön Baskı)</option>
              </select>
              <select id="works-per-page" class="akademik-page-btn font-mono">
                <option value="25">25 / sayfa</option>
                <option value="50" selected>50 / sayfa</option>
                <option value="100">100 / sayfa</option>
              </select>
            </div>
          </div>

          <div class="akademik-table-container">
            <table class="akademik-table">
              <thead>
                <tr>
                  <th style="width: 85px;">Yıl & Tür</th>
                  <th style="width: 36%;">Yayın Başlığı & DOI</th>
                  <th style="width: 20%;">Ortak Yazarlar</th>
                  <th style="width: 20%;">Dergi & İndeks Kaynağı</th>
                  <th style="width: 95px;">Gelen Atıf</th>
                  <th style="width: 145px;">Erişim & Atıflar</th>
                </tr>
              </thead>
              <tbody id="yazar-works-tbody">
              </tbody>
            </table>
            <div class="akademik-pagination-bar">
              <div id="works-page-info" class="font-mono text-xs">Sayfa 1</div>
              <div class="akademik-page-controls">
                <button type="button" id="works-prev-btn" class="akademik-page-btn" disabled>Önceki Sayfa</button>
                <button type="button" id="works-next-btn" class="akademik-page-btn" disabled>Sonraki Sayfa</button>
              </div>
            </div>
          </div>
        </div>

        <!-- SEKME 2: Yazarın Tüm Yayınlarına Gelen Birleşik Atıf Listesi Tablosu -->
        <div id="tab-panel-citations" class="hidden">
          <div id="yazar-cites-transparency" class="akademik-transparency-panel hidden">
            <div class="akademik-transparency-header">
              <div class="akademik-transparency-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <span>Birleşik Atıf Sorgusu — Çoklu API Şeffaflık Raporu</span>
              </div>
              <span id="yazar-cites-transparency-summary" class="text-xs font-mono text-mistral-slate"></span>
            </div>
            <div id="yazar-cites-provider-grid" class="akademik-provider-grid"></div>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <span class="text-xs font-bold text-mistral-ink block">Yazarın Yayınlarına Atıf Yapan Tüm Makaleler (Birleşik Liste)</span>
              <span id="all-cites-summary" class="text-xs font-mono text-mistral-orange"></span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <select id="all-cites-index-filter" class="akademik-page-btn">
                <option value="all">Tüm Atıf İndeksleri</option>
                <option value="journal_core">Yalnızca Scopus / Core Hakemli Dergi Atıfları</option>
                <option value="crossref">Crossref (DOI) Atıfları</option>
                <option value="pubmed">PubMed Atıfları</option>
                <option value="doaj">DOAJ Atıfları</option>
                <option value="arxiv">arXiv Ön Baskı Atıfları</option>
              </select>
              <select id="all-cites-per-page" class="akademik-page-btn font-mono">
                <option value="25">25 / sayfa</option>
                <option value="50" selected>50 / sayfa</option>
                <option value="100">100 / sayfa</option>
              </select>
            </div>
          </div>

          <div class="akademik-table-container">
            <table class="akademik-table">
              <thead>
                <tr>
                  <th style="width: 75px;">Atıf Yılı</th>
                  <th style="width: 30%;">Atıf Yapan Yayın Başlığı & DOI</th>
                  <th style="width: 18%;">Atıf Yapan Yazarlar & Kurum</th>
                  <th style="width: 18%;">Atıf Yapan Dergi & İndeks</th>
                  <th style="width: 24%;">Yazarın Hangi Yayınına Atıf Yapıldı?</th>
                  <th style="width: 80px;">Atıf</th>
                </tr>
              </thead>
              <tbody id="yazar-all-cites-tbody">
              </tbody>
            </table>
            <div class="akademik-pagination-bar">
              <div id="all-cites-page-info" class="font-mono text-xs">Sayfa 1</div>
              <div class="akademik-page-controls">
                <button type="button" id="all-cites-prev-btn" class="akademik-page-btn" disabled>Önceki Sayfa</button>
                <button type="button" id="all-cites-next-btn" class="akademik-page-btn" disabled>Sonraki Sayfa</button>
              </div>
            </div>
          </div>
        </div>

        <!-- SEKME 3: Yazarın Yıllara Göre Yayın ve Atıf Dağılım Tablosu -->
        <div id="tab-panel-yearly" class="hidden">
          <div class="akademik-table-container">
            <table class="akademik-table">
              <thead>
                <tr>
                  <th>Yıl</th>
                  <th>O Yıldaki Yayın Sayısı</th>
                  <th>O Yılda Gelen Toplam Atıf Sayısı</th>
                  <th>Toplam Atıf İçindeki Payı (%)</th>
                </tr>
              </thead>
              <tbody id="yazar-yearly-tbody">
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Native <dialog closedby="any"> Tekil Makale Atıf Listesi Modalı -->
      <dialog id="yazar-work-dialog" closedby="any" class="w-full max-w-3xl rounded-2xl border border-mistral-hairline bg-white p-0 shadow-2xl backdrop:bg-black/50">
        <div class="p-5 sm:p-6 border-b border-mistral-hairline flex items-start justify-between gap-4">
          <div>
            <h3 id="dlg-work-title" class="text-lg font-bold text-mistral-ink font-editorial leading-snug">Yayın Atıf Detayı</h3>
            <p id="dlg-work-sub" class="text-xs font-mono text-mistral-orange mt-1"></p>
          </div>
          <button type="button" id="dlg-close-btn" class="w-8 h-8 rounded-lg border border-mistral-hairline flex items-center justify-center text-mistral-slate hover:text-mistral-ink cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="p-5 sm:p-6 space-y-4 max-h-[76vh] overflow-y-auto">
          <div class="akademik-subtable-wrap">
            <table class="akademik-subtable">
              <thead>
                <tr>
                  <th style="width: 65px;">Yıl</th>
                  <th>Bu Yayına Atıf Yapan Makale & DOI</th>
                  <th>Yazarlar & Kurum</th>
                  <th>Dergi & İndeks Kaynağı</th>
                  <th style="width: 80px;">Atıf</th>
                </tr>
              </thead>
              <tbody id="dlg-work-cites-tbody">
              </tbody>
            </table>
          </div>
        </div>
      </dialog>
    `;

    res.send(pageTemplate('Akademik Yazar & Tüm Yayın Atıf Röntgeni', content, extraHead));
  };
};
