(function () {
  'use strict';

  var esc = function (str) {
    if (typeof window.vibeEscapeHTML === 'function') return window.vibeEscapeHTML(String(str == null ? '' : str));
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  var setHTML = function (el, html) {
    if (!el) return;
    if (typeof window.vibeSetHTML === 'function') {
      window.vibeSetHTML(el, html);
    } else {
      el.innerHTML = html;
    }
  };

  var notify = function (msg) {
    if (typeof window.showToast === 'function') window.showToast(msg);
  };

  var SVG_UNLOCK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>';
  var SVG_LOCK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  var SVG_BUILDING = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>';
  var SVG_CHART = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>';
  var SVG_EXT = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';

  var TYPE_LABELS = {
    'article': 'Makale',
    'review': 'Derleme',
    'preprint': 'Ön Baskı',
    'book-chapter': 'Kitap Bölümü',
    'book': 'Kitap',
    'dataset': 'Veri Seti',
    'dissertation': 'Tez'
  };

  var candidateAuthors = [];
  var selectedAuthor = null;
  var authorWorks = [];
  var authorWorkMap = {}; // workId -> { title, year, doi }
  var worksPage = 1;
  var worksPerPage = 50;
  var worksTotalCount = 0;

  var allCitesList = [];
  var allCitesPage = 1;
  var allCitesPerPage = 50;
  var allCitesTotalCount = 0;

  function cleanVal(v) {
    return String(v || '').replace(/[,:|]/g, ' ').trim();
  }

  function resolveIndexFilterClause(indexFilter) {
    switch (String(indexFilter || '').trim()) {
      case 'journal_core':
        return 'primary_location.source.is_core:true,primary_location.source.type:journal';
      case 'core':
        return 'primary_location.source.is_core:true';
      case 'crossref':
        return 'indexed_in:crossref';
      case 'pubmed':
        return 'indexed_in:pubmed';
      case 'doaj':
        return 'primary_location.source.is_in_doaj:true';
      case 'arxiv':
        return 'indexed_in:arxiv';
      default:
        return '';
    }
  }

  function renderIndexBadges(w) {
    if (!w) return '';
    var badges = [];
    var idxList = Array.isArray(w.indexed_in) ? w.indexed_in : [];
    if (w.is_core) {
      badges.push('<span class="akademik-idx-badge akademik-idx-badge--core">SCOPUS / CORE DERGİ</span>');
    }
    if (idxList.indexOf('crossref') !== -1 || w.doi) {
      badges.push('<span class="akademik-idx-badge akademik-idx-badge--crossref">CROSSREF</span>');
    }
    if (idxList.indexOf('pubmed') !== -1 || w.pmid) {
      badges.push('<span class="akademik-idx-badge akademik-idx-badge--pubmed">PUBMED</span>');
    }
    if (w.is_in_doaj || idxList.indexOf('doaj') !== -1) {
      badges.push('<span class="akademik-idx-badge akademik-idx-badge--doaj">DOAJ</span>');
    }
    if (idxList.indexOf('arxiv') !== -1 || /arxiv/i.test(w.venue || '') || /arxiv/i.test(w.doi || '')) {
      badges.push('<span class="akademik-idx-badge akademik-idx-badge--arxiv">ARXIV</span>');
    }
    if (w.issn) {
      badges.push('<span class="akademik-idx-badge akademik-idx-badge--issn">ISSN: ' + esc(w.issn) + '</span>');
    }
    if (!badges.length) return '';
    return '<div class="akademik-idx-wrap">' + badges.join('') + '</div>';
  }

  function normalizeAuthor(a) {
    var id = String(a.id || '').replace(/^https?:\/\/openalex\.org\//i, '');
    var orcid = a.orcid ? String(a.orcid).replace(/^https?:\/\/orcid\.org\//i, '') : '';
    var rawInsts = a.last_known_institutions || (a.last_known_institution ? [a.last_known_institution] : []) || [];
    var insts = rawInsts.map(function (i) {
      return i && (i.display_name + (i.country_code ? ' (' + i.country_code + ')' : ''));
    }).filter(Boolean);
    var stats = a.summary_stats || {};
    return {
      id: id,
      orcid: orcid,
      display_name: a.display_name || 'İsimsiz Akademisyen',
      works_count: Number(a.works_count || 0),
      cited_by_count: Number(a.cited_by_count || 0),
      h_index: Number(stats.h_index != null ? stats.h_index : (a.h_index || 0)),
      i10_index: Number(stats.i10_index != null ? stats.i10_index : (a.i10_index || 0)),
      mean_2yr: Number(stats['2yr_mean_citedness'] != null ? stats['2yr_mean_citedness'] : (a.mean_2yr || 0)).toFixed(2),
      institutions: insts.length ? insts : (Array.isArray(a.institutions) ? a.institutions : []),
      counts_by_year: (a.counts_by_year || []).slice(0, 15).map(function (c) {
        return {
          year: c.year,
          works_count: Number(c.works_count || 0),
          cited_by_count: Number(c.cited_by_count || 0)
        };
      })
    };
  }

  function normalizeWork(w) {
    var doiRaw = w.doi ? String(w.doi).replace(/^https?:\/\/doi\.org\//i, '') : '';
    var authors = Array.isArray(w.authors)
      ? w.authors
      : (w.authorships || []).slice(0, 8).map(function (a) { return a.author && a.author.display_name; }).filter(Boolean);
    var instMap = {};
    (w.authorships || []).forEach(function (a) {
      (a.institutions || []).forEach(function (inst) {
        if (inst && inst.display_name) instMap[inst.display_name] = true;
      });
    });
    var loc = w.primary_location || {};
    var src = loc.source || {};
    var oa = w.open_access || {};
    var refIds = (w.referenced_works || []).map(function (r) {
      return String(r).replace(/^https?:\/\/openalex\.org\//i, '');
    });
    return {
      id: String(w.id || '').replace(/^https?:\/\/openalex\.org\//i, '') || doiRaw || 'W-OA',
      doi: doiRaw,
      title: w.display_name || w.title || 'Başlıksız Akademik Yayın',
      publication_year: w.publication_year || null,
      cited_by_count: Number(w.cited_by_count || 0),
      is_oa: Boolean(w.is_oa != null ? w.is_oa : oa.is_oa),
      oa_url: w.oa_url || oa.oa_url || loc.pdf_url || loc.landing_page_url || (doiRaw ? 'https://doi.org/' + doiRaw : ''),
      venue: w.venue || src.display_name || 'Belirtilmemiş Yayın Yeri',
      publisher: w.publisher || src.host_organization_name || 'OpenAlex',
      type: w.type || 'article',
      source_type: w.source_type || src.type || 'journal',
      issn: w.issn || src.issn_l || (Array.isArray(src.issn) && src.issn[0]) || '',
      is_core: Boolean(w.is_core != null ? w.is_core : src.is_core),
      is_in_doaj: Boolean(w.is_in_doaj != null ? w.is_in_doaj : src.is_in_doaj),
      indexed_in: Array.isArray(w.indexed_in) ? w.indexed_in : [],
      pmid: w.pmid || ((w.ids && w.ids.pmid) ? String(w.ids.pmid).replace(/^https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//i, '').replace(/\/$/, '') : ''),
      authors: authors,
      institutions: Array.isArray(w.institutions) ? w.institutions : Object.keys(instMap).slice(0, 4),
      referenced_works: refIds
    };
  }

  async function searchAuthors() {
    var fName = document.getElementById('yazar-name');
    var fInst = document.getElementById('yazar-inst');
    var fOrcid = document.getElementById('yazar-orcid');
    var fSort = document.getElementById('yazar-sort');

    var name = cleanVal(fName && fName.value);
    var inst = cleanVal(fInst && fInst.value);
    var orcid = String((fOrcid && fOrcid.value) || '').trim().replace(/^https?:\/\/orcid\.org\//i, '');
    var sort = (fSort && fSort.value) || 'cited_by_count:desc';

    if (!name && !inst && !orcid) {
      notify('Lütfen aramak için Yazar Adı, Kurum veya ORCID alanlarından en az birini doldurun.');
      if (fName) fName.focus();
      return;
    }

    var initial = document.getElementById('yazar-initial-state');
    var loading = document.getElementById('yazar-loading');
    var loadingTxt = document.getElementById('yazar-loading-text');
    var candSection = document.getElementById('yazar-candidates-section');
    var profSection = document.getElementById('yazar-profile-section');
    var statusBar = document.getElementById('yazar-status-bar');

    if (initial) initial.classList.add('hidden');
    if (candSection) candSection.classList.add('hidden');
    if (profSection) profSection.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');
    if (loadingTxt) loadingTxt.textContent = 'OpenAlex üzerinde akademisyen profilleri sorgulanıyor...';

    try {
      var filters = [];
      if (name) filters.push('default.search:' + name);
      if (inst) filters.push('affiliations.institution.display_name.search:' + inst);
      if (orcid) filters.push('orcid:' + orcid);
      var qParts = ['per-page=15'];
      if (filters.length) qParts.push('filter=' + encodeURIComponent(filters.join(',')));
      qParts.push('sort=' + encodeURIComponent(sort));

      var url = 'https://api.openalex.org/authors?' + qParts.join('&');
      var resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      candidateAuthors = Array.isArray(data.results) ? data.results.map(normalizeAuthor) : [];
      renderCandidateAuthors(candidateAuthors, (data.meta && data.meta.count) || candidateAuthors.length);
      if (statusBar) statusBar.textContent = candidateAuthors.length + ' akademisyen profili listelendi.';
      if (candidateAuthors.length === 1) {
        selectAuthor(0);
      }
    } catch (_) {
      try {
        var qs = new URLSearchParams({ name: name, institution: inst, orcid: orcid, sort: sort });
        var r2 = await fetch('/api/yazar/search?' + qs.toString());
        var d2 = await r2.json();
        candidateAuthors = (d2.results || []).map(normalizeAuthor);
        renderCandidateAuthors(candidateAuthors, (d2.meta && d2.meta.count) || candidateAuthors.length);
        if (candidateAuthors.length === 1) selectAuthor(0);
      } catch (_e2) {
        if (loading) loading.classList.add('hidden');
        notify('Yazar sorgulama sırasında bağlantı hatası oluştu.');
      }
    }
  }

  function renderCandidateAuthors(list, totalCount) {
    var loading = document.getElementById('yazar-loading');
    var candSection = document.getElementById('yazar-candidates-section');
    var candCount = document.getElementById('yazar-candidates-count');
    var tbody = document.getElementById('yazar-candidates-tbody');

    if (loading) loading.classList.add('hidden');
    if (!candSection || !tbody) return;
    candSection.classList.remove('hidden');
    if (candCount) candCount.textContent = 'Toplam ' + Number(totalCount || list.length).toLocaleString('tr-TR') + ' eşleşme';

    if (!list.length) {
      setHTML(tbody, '<tr><td colspan="6" class="text-center py-8 text-mistral-slate text-sm">Arama kriterlerinize uygun akademisyen bulunamadı.</td></tr>');
      return;
    }

    var rows = list.map(function (a, idx) {
      var instText = (a.institutions && a.institutions.length) ? a.institutions.slice(0, 2).join(' • ') : 'Kurum bilgisi belirtilmemiş';
      var orcidHtml = a.orcid
        ? '<a href="https://orcid.org/' + esc(a.orcid) + '" target="_blank" rel="noopener noreferrer" class="akademik-doi-link"><span>ORCID: ' + esc(a.orcid) + '</span>' + SVG_EXT + '</a>'
        : '<span class="text-[11px] text-mistral-stone font-mono">OpenAlex ID: ' + esc(a.id) + '</span>';

      return [
        '<tr>',
        '  <td><div class="akademik-work-title">' + esc(a.display_name) + '</div><div>' + orcidHtml + '</div></td>',
        '  <td><div class="akademik-inst-row">' + SVG_BUILDING + '<span>' + esc(instText) + '</span></div></td>',
        '  <td><span class="akademik-year-badge">' + Number(a.works_count || 0).toLocaleString('tr-TR') + ' yayın</span></td>',
        '  <td><span class="akademik-cite-badge">' + SVG_CHART + '<span>' + Number(a.cited_by_count || 0).toLocaleString('tr-TR') + ' atıf</span></span></td>',
        '  <td><span class="akademik-concept-chip font-mono">H: ' + esc(a.h_index) + ' | i10: ' + esc(a.i10_index) + '</span></td>',
        '  <td><button type="button" data-select-author="' + idx + '" class="akademik-btn-inspect">Yayınları & Atıfları İncele</button></td>',
        '</tr>'
      ].join('');
    }).join('');

    setHTML(tbody, rows);
  }

  async function selectAuthor(idx) {
    var a = candidateAuthors[idx];
    if (!a) return;
    selectedAuthor = a;
    worksPage = 1;
    allCitesPage = 1;

    var profSection = document.getElementById('yazar-profile-section');
    if (profSection) profSection.classList.remove('hidden');

    var pName = document.getElementById('prof-name');
    var pOrcid = document.getElementById('prof-orcid-badge');
    var pInst = document.getElementById('prof-inst');
    var sWorks = document.getElementById('prof-stat-works');
    var sCites = document.getElementById('prof-stat-citations');
    var sH = document.getElementById('prof-stat-hindex');
    var sMean = document.getElementById('prof-stat-mean');

    if (pName) pName.textContent = a.display_name;
    if (pOrcid) pOrcid.textContent = a.orcid ? ('ORCID: ' + a.orcid) : ('ID: ' + a.id);
    if (pInst) pInst.textContent = (a.institutions && a.institutions.length) ? a.institutions.join(' • ') : 'Kurum bilgisi belirtilmemiş';
    if (sWorks) sWorks.textContent = Number(a.works_count || 0).toLocaleString('tr-TR');
    if (sCites) sCites.textContent = Number(a.cited_by_count || 0).toLocaleString('tr-TR');
    if (sH) sH.textContent = a.h_index + ' / ' + a.i10_index;
    if (sMean) sMean.textContent = String(a.mean_2yr || '0.00');

    renderAuthorYearlyTable(a);
    await loadAuthorWorks(1);
    await loadAuthorCombinedCitations(1);
    if (profSection && typeof profSection.scrollIntoView === 'function') {
      profSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderAuthorYearlyTable(a) {
    var tbody = document.getElementById('yazar-yearly-tbody');
    if (!tbody) return;
    var counts = (a.counts_by_year || []).slice().sort(function (x, y) { return y.year - x.year; });
    if (!counts.length) {
      setHTML(tbody, '<tr><td colspan="4" class="text-center py-6 text-mistral-stone">Yıllık dağılım verisi bulunmuyor.</td></tr>');
      return;
    }
    var totalCit = Math.max(1, Number(a.cited_by_count || 1));
    var html = counts.map(function (c) {
      var pct = ((Number(c.cited_by_count || 0) / totalCit) * 100).toFixed(1);
      return [
        '<tr>',
        '  <td><span class="akademik-year-badge">' + esc(c.year) + '</span></td>',
        '  <td class="font-mono font-semibold">' + Number(c.works_count || 0).toLocaleString('tr-TR') + ' yayın</td>',
        '  <td><span class="akademik-cite-badge">' + SVG_CHART + '<span>' + Number(c.cited_by_count || 0).toLocaleString('tr-TR') + ' atıf</span></span></td>',
        '  <td class="font-mono">%' + esc(pct) + '</td>',
        '</tr>'
      ].join('');
    }).join('');
    setHTML(tbody, html);
  }

  async function loadAuthorWorks(page) {
    if (!selectedAuthor) return;
    worksPage = Math.max(1, parseInt(page, 10) || 1);
    var ppSel = document.getElementById('works-per-page');
    var idxSel = document.getElementById('works-index-filter');
    worksPerPage = parseInt((ppSel && ppSel.value) || '50', 10) || 50;
    var idxVal = (idxSel && idxSel.value) || 'all';
    var idxClause = resolveIndexFilterClause(idxVal);

    var tbody = document.getElementById('yazar-works-tbody');
    var sumEl = document.getElementById('works-filter-summary');
    if (tbody) {
      setHTML(tbody, '<tr><td colspan="6" class="text-center py-8 text-mistral-stone">Yazarın yayınları ve atıf sayıları yükleniyor (Sayfa ' + worksPage + ')...</td></tr>');
    }

    try {
      var fStr = 'author.id:' + selectedAuthor.id + (idxClause ? ',' + idxClause : '');
      var url = 'https://api.openalex.org/works?filter=' + encodeURIComponent(fStr) + '&sort=cited_by_count:desc&per-page=' + worksPerPage + '&page=' + worksPage;
      var resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      authorWorks = Array.isArray(data.results) ? data.results.map(normalizeWork) : [];
      worksTotalCount = (data.meta && data.meta.count) || authorWorks.length;
    } catch (_) {
      var r2 = await fetch('/api/yazar/works?authorId=' + encodeURIComponent(selectedAuthor.id) + '&page=' + worksPage + '&perPage=' + worksPerPage + '&indexFilter=' + encodeURIComponent(idxVal));
      var d2 = await r2.json();
      authorWorks = (d2.results || []).map(normalizeWork);
      worksTotalCount = (d2.meta && d2.meta.count) || authorWorks.length;
    }

    for (var i = 0; i < authorWorks.length; i++) {
      var w = authorWorks[i];
      if (w.id) authorWorkMap[w.id] = { title: w.title, year: w.publication_year, doi: w.doi };
    }

    if (sumEl) {
      sumEl.textContent = selectedAuthor.display_name + ' — Toplam ' + Number(worksTotalCount).toLocaleString('tr-TR') + ' yayın (Atıf sayısına göre sıralı)';
    }
    renderAuthorWorksTable(authorWorks);
    var totalPages = Math.max(1, Math.ceil((worksTotalCount || 1) / worksPerPage));
    var infoEl = document.getElementById('works-page-info');
    var prevBtn = document.getElementById('works-prev-btn');
    var nextBtn = document.getElementById('works-next-btn');
    if (infoEl) infoEl.textContent = 'Sayfa ' + worksPage + ' / ' + totalPages.toLocaleString('tr-TR') + ' (' + Number(worksTotalCount).toLocaleString('tr-TR') + ' yayın)';
    if (prevBtn) prevBtn.disabled = worksPage <= 1;
    if (nextBtn) nextBtn.disabled = worksPage >= totalPages || authorWorks.length < worksPerPage;
  }

  function renderAuthorWorksTable(list) {
    var tbody = document.getElementById('yazar-works-tbody');
    if (!tbody) return;
    if (!list.length) {
      setHTML(tbody, '<tr><td colspan="6" class="text-center py-8 text-mistral-stone">Seçilen filtreye uygun yayın bulunamadı.</td></tr>');
      return;
    }
    var html = list.map(function (w, idx) {
      var typeLabel = TYPE_LABELS[w.type] || w.type || 'Makale';
      var oaBadge = w.is_oa
        ? '<span class="akademik-oa-badge akademik-oa-badge--open">' + SVG_UNLOCK + '<span>Açık Erişim</span></span>'
        : '<span class="akademik-oa-badge akademik-oa-badge--closed">' + SVG_LOCK + '<span>Kapalı</span></span>';
      var auths = (w.authors && w.authors.length) ? w.authors.slice(0, 3).join(', ') + (w.authors.length > 3 ? ' (+' + (w.authors.length - 3) + ')' : '') : '—';
      var doiHtml = w.doi
        ? '<a href="https://doi.org/' + esc(w.doi) + '" target="_blank" rel="noopener noreferrer" class="akademik-doi-link"><span>DOI: ' + esc(w.doi) + '</span>' + SVG_EXT + '</a>'
        : '';
      return [
        '<tr>',
        '  <td><span class="akademik-year-badge">' + esc(w.publication_year || '—') + '</span><span class="akademik-type-sub">' + esc(typeLabel) + '</span></td>',
        '  <td><div class="akademik-work-title">' + esc(w.title) + '</div>' + (doiHtml ? '<div>' + doiHtml + '</div>' : '') + '</td>',
        '  <td><div class="akademik-author-list">' + esc(auths) + '</div></td>',
        '  <td><div class="akademik-venue-name">' + esc(w.venue) + '</div>' + renderIndexBadges(w) + '</td>',
        '  <td><span class="akademik-cite-badge">' + SVG_CHART + '<span>' + Number(w.cited_by_count || 0).toLocaleString('tr-TR') + '</span></span></td>',
        '  <td><div class="akademik-actions-col">' + oaBadge + '<button type="button" data-open-work-cites="' + idx + '" class="akademik-btn-inspect">Atıf Listesi (' + Number(w.cited_by_count || 0).toLocaleString('tr-TR') + ')</button></div></td>',
        '</tr>'
      ].join('');
    }).join('');
    setHTML(tbody, html);
  }

  function getTopAuthorWorkIds(limit) {
    var ids = [];
    for (var i = 0; i < authorWorks.length && ids.length < (limit || 25); i++) {
      var wid = authorWorks[i].id;
      if (/^W\d+$/i.test(wid)) ids.push(wid);
    }
    return ids;
  }

  function findCitedAuthorWorkTitle(citingWork) {
    var refs = citingWork.referenced_works || [];
    for (var i = 0; i < refs.length; i++) {
      var hit = authorWorkMap[refs[i]];
      if (hit) {
        return (hit.year ? '[' + hit.year + '] ' : '') + hit.title;
      }
    }
    return authorWorks.length ? ('[' + (authorWorks[0].publication_year || '—') + '] ' + authorWorks[0].title) : (selectedAuthor ? selectedAuthor.display_name + ' yayını' : '—');
  }

  async function loadAuthorCombinedCitations(page) {
    var tbody = document.getElementById('yazar-all-cites-tbody');
    var sumEl = document.getElementById('all-cites-summary');
    if (!tbody || !selectedAuthor) return;

    allCitesPage = Math.max(1, parseInt(page, 10) || 1);
    var ppSel = document.getElementById('all-cites-per-page');
    var idxSel = document.getElementById('all-cites-index-filter');
    allCitesPerPage = parseInt((ppSel && ppSel.value) || '50', 10) || 50;
    var idxVal = (idxSel && idxSel.value) || 'all';
    var idxClause = resolveIndexFilterClause(idxVal);

    var topIds = getTopAuthorWorkIds(25);
    if (!topIds.length) {
      setHTML(tbody, '<tr><td colspan="6" class="text-center py-8 text-mistral-stone">Yazarın atıf alan yayını bulunamadı.</td></tr>');
      return;
    }

    setHTML(tbody, '<tr><td colspan="6" class="text-center py-8 text-mistral-stone">Yazarın yayınlarına gelen birleşik atıf listesi yükleniyor (Sayfa ' + allCitesPage + ')...</td></tr>');

    try {
      var fStr = 'cites:' + topIds.join('|') + (idxClause ? ',' + idxClause : '');
      var url = 'https://api.openalex.org/works?filter=' + encodeURIComponent(fStr) + '&sort=publication_year:desc,cited_by_count:desc&per-page=' + allCitesPerPage + '&page=' + allCitesPage;
      var resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var data = await resp.json();
      allCitesList = Array.isArray(data.results) ? data.results.map(normalizeWork) : [];
      allCitesTotalCount = (data.meta && data.meta.count) || allCitesList.length;

      if (sumEl) {
        sumEl.textContent = 'Toplam ' + Number(allCitesTotalCount).toLocaleString('tr-TR') + ' atıf yapan yayın (Sayfa ' + allCitesPage + ')';
      }
      renderCombinedCitationsTable(allCitesList);

      var totalPages = Math.max(1, Math.ceil((allCitesTotalCount || 1) / allCitesPerPage));
      var infoEl = document.getElementById('all-cites-page-info');
      var prevBtn = document.getElementById('all-cites-prev-btn');
      var nextBtn = document.getElementById('all-cites-next-btn');
      if (infoEl) infoEl.textContent = 'Sayfa ' + allCitesPage + ' / ' + totalPages.toLocaleString('tr-TR') + ' (Toplam ' + Number(allCitesTotalCount).toLocaleString('tr-TR') + ' atıf kaydı)';
      if (prevBtn) prevBtn.disabled = allCitesPage <= 1;
      if (nextBtn) nextBtn.disabled = allCitesPage >= totalPages || allCitesList.length < allCitesPerPage;
    } catch (_) {
      setHTML(tbody, '<tr><td colspan="6" class="text-center py-8 text-mistral-stone">Birleşik atıf listesi alınırken ağ hatası oluştu.</td></tr>');
    }
  }

  function renderCombinedCitationsTable(list) {
    var tbody = document.getElementById('yazar-all-cites-tbody');
    if (!tbody) return;
    if (!list.length) {
      setHTML(tbody, '<tr><td colspan="6" class="text-center py-8 text-mistral-stone">Seçilen indeks filtresine uygun atıf kaydı bulunamadı.</td></tr>');
      return;
    }
    var html = list.map(function (cw) {
      var auths = (cw.authors && cw.authors.length) ? cw.authors.slice(0, 3).join(', ') + (cw.authors.length > 3 ? ' (+' + (cw.authors.length - 3) + ')' : '') : 'Belirtilmemiş';
      var inst = (cw.institutions && cw.institutions.length) ? cw.institutions[0] : '';
      var doiHtml = cw.doi
        ? '<a href="https://doi.org/' + esc(cw.doi) + '" target="_blank" rel="noopener noreferrer" class="akademik-doi-link"><span>DOI: ' + esc(cw.doi) + '</span>' + SVG_EXT + '</a>'
        : '';
      var targetWorkTitle = findCitedAuthorWorkTitle(cw);
      return [
        '<tr>',
        '  <td><span class="akademik-year-badge">' + esc(cw.publication_year || '—') + '</span></td>',
        '  <td><div class="akademik-work-title">' + esc(cw.title) + '</div>' + (doiHtml ? '<div>' + doiHtml + '</div>' : '') + '</td>',
        '  <td><div class="akademik-author-list">' + esc(auths) + '</div>' + (inst ? '<div class="akademik-inst-row">' + SVG_BUILDING + '<span>' + esc(inst) + '</span></div>' : '') + '</td>',
        '  <td><div class="akademik-venue-name">' + esc(cw.venue) + '</div>' + renderIndexBadges(cw) + '</td>',
        '  <td><div class="text-xs font-semibold text-mistral-ink bg-orange-50/70 border border-orange-200/80 rounded-lg p-2">' + esc(targetWorkTitle) + '</div></td>',
        '  <td><span class="akademik-cite-badge">' + SVG_CHART + '<span>' + Number(cw.cited_by_count || 0).toLocaleString('tr-TR') + '</span></span></td>',
        '</tr>'
      ].join('');
    }).join('');
    setHTML(tbody, html);
  }

  async function openSingleWorkCitesModal(idx) {
    var w = authorWorks[idx];
    if (!w) return;
    var dlg = document.getElementById('yazar-work-dialog');
    var titleEl = document.getElementById('dlg-work-title');
    var subEl = document.getElementById('dlg-work-sub');
    var tbody = document.getElementById('dlg-work-cites-tbody');
    if (!dlg || !tbody) return;

    if (titleEl) titleEl.textContent = w.title;
    if (subEl) subEl.textContent = (w.publication_year || '') + ' • ' + w.venue + ' • Toplam ' + Number(w.cited_by_count || 0).toLocaleString('tr-TR') + ' Atıf';
    setHTML(tbody, '<tr><td colspan="5" class="text-center py-6 text-mistral-stone">Bu yayına gelen atıflar yükleniyor...</td></tr>');

    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', 'open');

    try {
      var url = 'https://api.openalex.org/works?filter=cites:' + encodeURIComponent(w.id) + '&sort=cited_by_count:desc&per-page=50';
      var resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
      var data = await resp.json();
      var list = Array.isArray(data.results) ? data.results.map(normalizeWork) : [];
      if (!list.length) {
        setHTML(tbody, '<tr><td colspan="5" class="text-center py-6 text-mistral-stone">Atıf kaydı bulunamadı.</td></tr>');
        return;
      }
      var rows = list.map(function (cw) {
        var auths = (cw.authors && cw.authors.length) ? cw.authors.slice(0, 3).join(', ') : '—';
        var doiLink = cw.doi ? '<a href="https://doi.org/' + esc(cw.doi) + '" target="_blank" rel="noopener noreferrer" class="akademik-doi-link"><span>DOI: ' + esc(cw.doi) + '</span>' + SVG_EXT + '</a>' : '';
        return [
          '<tr>',
          '  <td><span class="akademik-year-badge">' + esc(cw.publication_year || '—') + '</span></td>',
          '  <td><div class="font-bold text-mistral-ink">' + esc(cw.title) + '</div>' + doiLink + '</td>',
          '  <td>' + esc(auths) + '</td>',
          '  <td><div class="font-semibold text-mistral-ink">' + esc(cw.venue) + '</div>' + renderIndexBadges(cw) + '</td>',
          '  <td><span class="akademik-cite-badge">' + SVG_CHART + '<span>' + Number(cw.cited_by_count || 0).toLocaleString('tr-TR') + '</span></span></td>',
          '</tr>'
        ].join('');
      }).join('');
      setHTML(tbody, rows);
    } catch (_) {
      setHTML(tbody, '<tr><td colspan="5" class="text-center py-6 text-mistral-stone">Atıflar yüklenemedi.</td></tr>');
    }
  }

  async function exportAuthorWorksCsv() {
    if (!selectedAuthor) return;
    var btn = document.getElementById('prof-export-works-csv');
    var lbl = document.getElementById('prof-export-works-lbl');
    if (btn) btn.disabled = true;

    var all = [];
    var cursor = '*';
    try {
      while (cursor && all.length < 1000) {
        if (lbl) lbl.textContent = 'Yayınlar İndiriliyor (' + all.length + ')...';
        var url = 'https://api.openalex.org/works?filter=author.id:' + encodeURIComponent(selectedAuthor.id) + '&sort=cited_by_count:desc&per-page=200&cursor=' + encodeURIComponent(cursor);
        var resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!resp.ok) break;
        var data = await resp.json();
        var batch = Array.isArray(data.results) ? data.results.map(normalizeWork) : [];
        if (!batch.length) break;
        all = all.concat(batch);
        cursor = (data.meta && data.meta.next_cursor) || null;
        if (batch.length < 200) break;
      }
      var csvEsc = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
      var rows = [['Yıl', 'Tür', 'Yayın Başlığı', 'Yazarlar', 'Dergi/Konferans', 'İndeks Kaynakları', 'Scopus/Core Dergi', 'ISSN', 'Gelen Atıf Sayısı', 'Açık Erişim', 'DOI'].map(csvEsc).join(',')];
      all.forEach(function (w) {
        rows.push([
          w.publication_year || '',
          TYPE_LABELS[w.type] || w.type || '',
          w.title || '',
          (w.authors || []).join('; '),
          w.venue || '',
          (w.indexed_in || []).join('; ').toUpperCase(),
          w.is_core ? 'Evet (Scopus/Core)' : 'Hayır',
          w.issn || '',
          w.cited_by_count || 0,
          w.is_oa ? 'Evet' : 'Hayır',
          w.doi || ''
        ].map(csvEsc).join(','));
      });
      var blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
      var u = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = u;
      a.download = selectedAuthor.id + '-tum-yayinlar-' + all.length + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(u);
      notify(all.length + ' yayın ve atıf sayıları CSV olarak indirildi.');
    } catch (_) {
      notify('İndirme sırasında hata oluştu.');
    } finally {
      if (btn) btn.disabled = false;
      if (lbl) lbl.textContent = 'Yazarın Tüm Yayınlarını İndir (CSV)';
    }
  }

  async function exportAuthorAllCitations(fmt) {
    if (!selectedAuthor) return;
    var topIds = getTopAuthorWorkIds(25);
    if (!topIds.length) {
      notify('Atıf indirilecek yayın bulunamadı.');
      return;
    }
    var csvBtn = document.getElementById('prof-export-all-cites-csv');
    var bibBtn = document.getElementById('prof-export-all-cites-bib');
    var csvLbl = document.getElementById('prof-export-cites-lbl');
    var bibLbl = document.getElementById('prof-export-bib-lbl');
    if (csvBtn) csvBtn.disabled = true;
    if (bibBtn) bibBtn.disabled = true;

    var idxSel = document.getElementById('all-cites-index-filter');
    var idxClause = resolveIndexFilterClause((idxSel && idxSel.value) || 'all');
    var fStr = 'cites:' + topIds.join('|') + (idxClause ? ',' + idxClause : '');

    var all = [];
    var cursor = '*';
    try {
      while (cursor && all.length < 1000) {
        var msg = 'Atıflar İndiriliyor (' + all.length + ')...';
        if (fmt === 'csv' && csvLbl) csvLbl.textContent = msg;
        if (fmt === 'bib' && bibLbl) bibLbl.textContent = msg;
        var url = 'https://api.openalex.org/works?filter=' + encodeURIComponent(fStr) + '&sort=publication_year:desc,cited_by_count:desc&per-page=200&cursor=' + encodeURIComponent(cursor);
        var resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!resp.ok) break;
        var data = await resp.json();
        var batch = Array.isArray(data.results) ? data.results.map(normalizeWork) : [];
        if (!batch.length) break;
        all = all.concat(batch);
        cursor = (data.meta && data.meta.next_cursor) || null;
        if (batch.length < 200) break;
      }

      if (fmt === 'bib') {
        var bibText = all.map(function (cw) {
          var slug = ((cw.authors && cw.authors[0]) || 'cite').split(/\s+/).pop().toLowerCase().replace(/[^a-z0-9]/g, '') + (cw.publication_year || '');
          return '@article{' + slug + ',\n  author = {' + (cw.authors || []).join(' and ') + '},\n  title = {' + (cw.title || '') + '},\n  journal = {' + (cw.venue || '') + '},\n  year = {' + (cw.publication_year || '') + '}' + (cw.doi ? ',\n  doi = {' + cw.doi + '}' : '') + '\n}';
        }).join('\n\n');
        var bBlob = new Blob([bibText], { type: 'application/x-bibtex;charset=utf-8' });
        var bUrl = URL.createObjectURL(bBlob);
        var aB = document.createElement('a');
        aB.href = bUrl;
        aB.download = selectedAuthor.id + '-tum-atiflar-' + all.length + '.bib';
        document.body.appendChild(aB);
        aB.click();
        document.body.removeChild(aB);
        URL.revokeObjectURL(bUrl);
        notify(all.length + ' birleşik atıf BibTeX olarak indirildi.');
      } else {
        var csvEsc = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
        var rows = [['Atıf Yılı', 'Atıf Yapılan Yazar Eseri', 'Atıf Yapan Makale Başlığı', 'Atıf Yapan Yazarlar', 'Atıf Yapan Kurumlar', 'Atıf Yapan Dergi/Konferans', 'İndeks Kaynakları', 'Scopus/Core Dergi', 'ISSN', 'Atıf Yapanın Aldığı Atıf', 'DOI'].map(csvEsc).join(',')];
        all.forEach(function (cw) {
          rows.push([
            cw.publication_year || '',
            findCitedAuthorWorkTitle(cw),
            cw.title || '',
            (cw.authors || []).join('; '),
            (cw.institutions || []).join('; '),
            cw.venue || '',
            (cw.indexed_in || []).join('; ').toUpperCase(),
            cw.is_core ? 'Evet (Scopus/Core)' : 'Hayır',
            cw.issn || '',
            cw.cited_by_count || 0,
            cw.doi || ''
          ].map(csvEsc).join(','));
        });
        var cBlob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
        var cUrl = URL.createObjectURL(cBlob);
        var aC = document.createElement('a');
        aC.href = cUrl;
        aC.download = selectedAuthor.id + '-birlesik-atif-listesi-' + all.length + '.csv';
        document.body.appendChild(aC);
        aC.click();
        document.body.removeChild(aC);
        URL.revokeObjectURL(cUrl);
        notify(all.length + ' birleşik atıf kaydı CSV olarak indirildi.');
      }
    } catch (_) {
      notify('Atıf listesi indirilirken hata oluştu.');
    } finally {
      if (csvBtn) csvBtn.disabled = false;
      if (bibBtn) bibBtn.disabled = false;
      if (csvLbl) csvLbl.textContent = 'Tüm Yayınlarına Gelen Atıfları İndir (CSV)';
      if (bibLbl) bibLbl.textContent = 'Tüm Atıfları İndir (.bib)';
    }
  }

  function switchTab(tabName) {
    ['works', 'citations', 'yearly'].forEach(function (t) {
      var panel = document.getElementById('tab-panel-' + t);
      if (panel) panel.classList.toggle('hidden', t !== tabName);
    });
    document.querySelectorAll('[data-yazar-tab]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-yazar-tab') === tabName);
    });
  }

  function init() {
    var form = document.getElementById('yazar-search-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        searchAuthors();
      });
    }

    var resetBtn = document.getElementById('yazar-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        ['yazar-name', 'yazar-inst', 'yazar-orcid'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.value = '';
        });
        document.getElementById('yazar-candidates-section').classList.add('hidden');
        document.getElementById('yazar-profile-section').classList.add('hidden');
        document.getElementById('yazar-initial-state').classList.remove('hidden');
      });
    }

    document.querySelectorAll('.yazar-preset-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var nameEl = document.getElementById('yazar-name');
        if (nameEl) {
          nameEl.value = btn.getAttribute('data-preset-author') || '';
          searchAuthors();
        }
      });
    });

    var candTbody = document.getElementById('yazar-candidates-tbody');
    if (candTbody) {
      candTbody.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-select-author]');
        if (btn) {
          var idx = parseInt(btn.getAttribute('data-select-author'), 10);
          if (!isNaN(idx)) selectAuthor(idx);
        }
      });
    }

    document.querySelectorAll('[data-yazar-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchTab(btn.getAttribute('data-yazar-tab') || 'works');
      });
    });

    var worksTbody = document.getElementById('yazar-works-tbody');
    if (worksTbody) {
      worksTbody.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-open-work-cites]');
        if (btn) {
          var idx = parseInt(btn.getAttribute('data-open-work-cites'), 10);
          if (!isNaN(idx)) openSingleWorkCitesModal(idx);
        }
      });
    }

    var dlgClose = document.getElementById('dlg-close-btn');
    var dlg = document.getElementById('yazar-work-dialog');
    if (dlgClose && dlg) {
      dlgClose.addEventListener('click', function () {
        if (typeof dlg.close === 'function') dlg.close();
        else dlg.removeAttribute('open');
      });
    }

    var wPrev = document.getElementById('works-prev-btn');
    var wNext = document.getElementById('works-next-btn');
    var wIdx = document.getElementById('works-index-filter');
    var wPp = document.getElementById('works-per-page');
    if (wPrev) wPrev.addEventListener('click', function () { if (worksPage > 1) loadAuthorWorks(worksPage - 1); });
    if (wNext) wNext.addEventListener('click', function () { loadAuthorWorks(worksPage + 1); });
    if (wIdx) wIdx.addEventListener('change', function () { loadAuthorWorks(1); });
    if (wPp) wPp.addEventListener('change', function () { loadAuthorWorks(1); });

    var cPrev = document.getElementById('all-cites-prev-btn');
    var cNext = document.getElementById('all-cites-next-btn');
    var cIdx = document.getElementById('all-cites-index-filter');
    var cPp = document.getElementById('all-cites-per-page');
    if (cPrev) cPrev.addEventListener('click', function () { if (allCitesPage > 1) loadAuthorCombinedCitations(allCitesPage - 1); });
    if (cNext) cNext.addEventListener('click', function () { loadAuthorCombinedCitations(allCitesPage + 1); });
    if (cIdx) cIdx.addEventListener('change', function () { loadAuthorCombinedCitations(1); });
    if (cPp) cPp.addEventListener('change', function () { loadAuthorCombinedCitations(1); });

    var expWorksBtn = document.getElementById('prof-export-works-csv');
    var expCitesCsvBtn = document.getElementById('prof-export-all-cites-csv');
    var expCitesBibBtn = document.getElementById('prof-export-all-cites-bib');
    if (expWorksBtn) expWorksBtn.addEventListener('click', exportAuthorWorksCsv);
    if (expCitesCsvBtn) expCitesCsvBtn.addEventListener('click', function () { exportAuthorAllCitations('csv'); });
    if (expCitesBibBtn) expCitesBibBtn.addEventListener('click', function () { exportAuthorAllCitations('bib'); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
