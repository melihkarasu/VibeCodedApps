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
  var authorWorkMap = {};
  var worksPage = 1;
  var worksPerPage = 50;
  var worksTotalCount = 0;

  var allCitesList = [];
  var allCitesPage = 1;
  var allCitesPerPage = 50;
  var allCitesTotalCount = 0;
  var citationsLoadedForAuthorId = '';

  var queryCache = {};
  var CACHE_TTL_MS = 10 * 60 * 1000;
  function getCached(key) {
    var e = queryCache[key];
    if (e && (Date.now() - e.ts) < CACHE_TTL_MS) return e.data;
    return null;
  }
  function setCached(key, data) {
    queryCache[key] = { ts: Date.now(), data: data };
  }

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

  function renderSourcePills(sources) {
    var list = Array.isArray(sources) && sources.length ? sources : ['openalex'];
    var pills = list.map(function (s) {
      if (s === 'openalex') return '<span class="akademik-src-pill akademik-src-pill--oa">OPENALEX</span>';
      if (s === 'semanticscholar') return '<span class="akademik-src-pill akademik-src-pill--s2">SEMANTIC SCHOLAR</span>';
      if (s === 'crossref') return '<span class="akademik-src-pill akademik-src-pill--cr">CROSSREF</span>';
      return '<span class="akademik-src-pill akademik-src-pill--cr">' + esc(String(s).toUpperCase()) + '</span>';
    }).join('');
    return '<div class="akademik-src-badges">' + pills + '</div>';
  }

  function renderTransparencyPanel(panelId, gridId, summaryId, providers, duplicatesMerged) {
    var panel = document.getElementById(panelId);
    var grid = document.getElementById(gridId);
    var sumEl = document.getElementById(summaryId);
    if (!panel || !grid) return;

    if (!providers || !providers.length) {
      panel.classList.add('hidden');
      return;
    }

    panel.classList.remove('hidden');
    var okNames = providers.filter(function (p) { return p.ok; }).map(function (p) { return p.provider; });
    if (sumEl) {
      sumEl.textContent = (okNames.length ? ('Yanıt alınan kaynaklar: ' + okNames.join(', ')) : 'Hiçbir API yanıt vermedi') +
        (duplicatesMerged > 0 ? (' • ' + duplicatesMerged + ' mükerrer kayıt birleştirildi') : '');
    }

    var cardsHtml = providers.map(function (p) {
      var cardCls = p.ok ? 'akademik-provider-card akademik-provider-card--ok' : (p.status === 429 || p.status === 503 ? 'akademik-provider-card akademik-provider-card--warn' : 'akademik-provider-card akademik-provider-card--err');
      var badgeCls = p.ok ? 'akademik-provider-status akademik-provider-status--ok' : (p.status === 429 || p.status === 503 ? 'akademik-provider-status akademik-provider-status--warn' : 'akademik-provider-status akademik-provider-status--err');
      var statusLabel = p.ok ? ('HTTP 200 • ' + p.ms + ' ms') : (p.status ? ('HTTP ' + p.status + ' • ' + p.ms + ' ms') : 'Ağ / CORS Hatası');
      return [
        '<div class="' + cardCls + '">',
        '  <div class="akademik-provider-top">',
        '    <span class="akademik-provider-name">' + esc(p.provider) + '</span>',
        '    <span class="' + badgeCls + '">' + esc(statusLabel) + '</span>',
        '  </div>',
        '  <div class="akademik-provider-meta">' + esc(p.note || '') + '</div>',
        '</div>'
      ].join('');
    }).join('');
    setHTML(grid, cardsHtml);
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
      s2AuthorId: a.s2AuthorId || '',
      orcid: orcid,
      display_name: a.display_name || 'İsimsiz Akademisyen',
      works_count: Number(a.works_count || 0),
      cited_by_count: Number(a.cited_by_count || 0),
      h_index: Number(stats.h_index != null ? stats.h_index : (a.h_index || 0)),
      i10_index: Number(stats.i10_index != null ? stats.i10_index : (a.i10_index || 0)),
      mean_2yr: Number(stats['2yr_mean_citedness'] != null ? stats['2yr_mean_citedness'] : (a.mean_2yr || 0)).toFixed(2),
      institutions: insts.length ? insts : (Array.isArray(a.institutions) ? a.institutions : []),
      counts_by_year: (a.counts_by_year || []).slice(0, 15).map(function (c) {
        return { year: c.year, works_count: Number(c.works_count || 0), cited_by_count: Number(c.cited_by_count || 0) };
      }),
      sources: Array.isArray(a.sources) ? a.sources : ['openalex']
    };
  }

  function normalizeS2Author(a) {
    var ext = a.externalIds || {};
    var orcidRaw = Array.isArray(ext.ORCID) ? ext.ORCID[0] : (ext.ORCID || '');
    var orcid = String(orcidRaw || '').replace(/^https?:\/\/orcid\.org\//i, '').trim();
    var insts = Array.isArray(a.affiliations) ? a.affiliations.filter(Boolean) : [];
    return {
      id: a.authorId ? ('S2A:' + a.authorId) : ('S2A:' + (a.name || 'author')),
      s2AuthorId: a.authorId || '',
      orcid: orcid,
      display_name: a.name || 'İsimsiz Akademisyen',
      works_count: Number(a.paperCount || 0),
      cited_by_count: Number(a.citationCount || 0),
      h_index: Number(a.hIndex || 0),
      i10_index: 0,
      mean_2yr: '0.00',
      institutions: insts,
      counts_by_year: [],
      sources: ['semanticscholar']
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
      s2Id: w.s2Id || '',
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
      referenced_works: refIds,
      sources: Array.isArray(w.sources) ? w.sources : ['openalex']
    };
  }

  function normalizeS2Work(p) {
    var ext = p.externalIds || {};
    var doiRaw = ext.DOI ? String(ext.DOI).trim() : '';
    var arxivId = ext.ArXiv ? String(ext.ArXiv).trim() : '';
    var pmid = ext.PubMed ? String(ext.PubMed).trim() : '';
    var oaPdf = p.openAccessPdf && p.openAccessPdf.url ? p.openAccessPdf.url : '';
    var indexed = [];
    if (doiRaw) indexed.push('crossref');
    if (pmid) indexed.push('pubmed');
    if (arxivId) indexed.push('arxiv');
    return {
      id: p.paperId ? 'S2:' + p.paperId : (doiRaw || 'S2-WORK'),
      s2Id: p.paperId || '',
      doi: doiRaw,
      title: p.title || 'Başlıksız Akademik Yayın',
      publication_year: p.year || null,
      cited_by_count: Number(p.citationCount || 0),
      is_oa: Boolean(p.isOpenAccess || oaPdf),
      oa_url: oaPdf || (doiRaw ? 'https://doi.org/' + doiRaw : (p.url || '')),
      venue: (p.publicationVenue && p.publicationVenue.name) || p.venue || 'Semantic Scholar Kaydı',
      publisher: (p.journal && p.journal.name) || 'Semantic Scholar',
      type: 'article',
      source_type: 'journal',
      issn: (p.publicationVenue && p.publicationVenue.issn) || '',
      is_core: false,
      is_in_doaj: false,
      indexed_in: indexed,
      pmid: pmid,
      authors: (p.authors || []).slice(0, 8).map(function (a) { return a && a.name; }).filter(Boolean),
      institutions: [],
      referenced_works: [],
      sources: ['semanticscholar']
    };
  }

  function normalizeCrossrefWork(item) {
    var doiRaw = item.DOI ? String(item.DOI).trim() : '';
    var title = Array.isArray(item.title) && item.title[0] ? String(item.title[0]) : 'Başlıksız Akademik Yayın';
    var issued = (item.issued && item.issued['date-parts'] && item.issued['date-parts'][0]) || [];
    var pubYear = issued[0] ? Number(issued[0]) : null;
    var authors = (item.author || []).slice(0, 8).map(function (a) { return [a.given, a.family].filter(Boolean).join(' ').trim(); }).filter(Boolean);
    var instSet = {};
    (item.author || []).forEach(function (a) {
      (a.affiliation || []).forEach(function (af) { if (af && af.name) instSet[af.name] = true; });
    });
    var venue = (Array.isArray(item['container-title']) && item['container-title'][0]) || item.publisher || 'Crossref DOI Kaydı';
    var issn = (Array.isArray(item.ISSN) && item.ISSN[0]) || '';
    var links = Array.isArray(item.link) ? item.link : [];
    var pdfLink = links.find(function (l) { return l && /pdf/i.test(l['content-type'] || ''); }) || links[0];
    return {
      id: doiRaw ? 'CR:' + doiRaw : 'CR-WORK',
      s2Id: '',
      doi: doiRaw,
      title: title,
      publication_year: pubYear,
      cited_by_count: Number(item['is-referenced-by-count'] || 0),
      is_oa: Boolean(pdfLink && pdfLink.URL),
      oa_url: (pdfLink && pdfLink.URL) || item.URL || (doiRaw ? 'https://doi.org/' + doiRaw : ''),
      venue: venue,
      publisher: item.publisher || 'Crossref',
      type: item.type || 'article',
      source_type: 'journal',
      issn: issn,
      is_core: false,
      is_in_doaj: false,
      indexed_in: ['crossref'],
      pmid: '',
      authors: authors,
      institutions: Object.keys(instSet).slice(0, 4),
      referenced_works: [],
      sources: ['crossref']
    };
  }

  function mergeAuthorsLists(oaAuthors, s2Authors, sort) {
    var byKey = {};
    var order = [];
    var duplicatesMerged = 0;

    function makeKey(a) {
      if (a.orcid) return 'orcid:' + a.orcid.toLowerCase().trim();
      return 'n:' + String(a.display_name || '').toLowerCase().replace(/[^a-z0-9çğıöşü]+/gi, '');
    }

    function add(a) {
      var key = makeKey(a);
      if (!key || key === 'n:') return;
      if (!byKey[key]) {
        var copy = Object.assign({}, a, { sources: (a.sources || []).slice() });
        byKey[key] = copy;
        order.push(copy);
        return;
      }
      duplicatesMerged += 1;
      var ex = byKey[key];
      var sMap = {};
      (ex.sources || []).concat(a.sources || []).forEach(function (s) { sMap[s] = true; });
      ex.sources = Object.keys(sMap);
      if (!ex.s2AuthorId && a.s2AuthorId) ex.s2AuthorId = a.s2AuthorId;
      if (!ex.orcid && a.orcid) ex.orcid = a.orcid;
      if (Number(a.cited_by_count || 0) > Number(ex.cited_by_count || 0)) ex.cited_by_count = a.cited_by_count;
      if (Number(a.works_count || 0) > Number(ex.works_count || 0)) ex.works_count = a.works_count;
      if (Number(a.h_index || 0) > Number(ex.h_index || 0)) ex.h_index = a.h_index;
      if ((!ex.institutions || !ex.institutions.length) && a.institutions && a.institutions.length) ex.institutions = a.institutions;
    }

    (oaAuthors || []).forEach(add);
    (s2Authors || []).forEach(add);

    if (sort === 'works_count:desc') order.sort(function (a, b) { return Number(b.works_count || 0) - Number(a.works_count || 0); });
    else if (sort === 'summary_stats.h_index:desc') order.sort(function (a, b) { return Number(b.h_index || 0) - Number(a.h_index || 0); });
    else order.sort(function (a, b) { return Number(b.cited_by_count || 0) - Number(a.cited_by_count || 0); });
    return { merged: order, duplicatesMerged: duplicatesMerged };
  }

  function mergeWorksLists(oaList, s2List, crList, sort) {
    var byKey = {};
    var order = [];
    var duplicatesMerged = 0;

    function makeKey(w) {
      if (w.doi) return 'doi:' + w.doi.toLowerCase().trim();
      return 't:' + String(w.title || '').toLowerCase().replace(/[^a-z0-9çğıöşü]+/gi, '').slice(0, 80);
    }

    function add(w) {
      var key = makeKey(w);
      if (!key || key === 't:') return;
      if (!byKey[key]) {
        var copy = Object.assign({}, w, { sources: (w.sources || []).slice() });
        byKey[key] = copy;
        order.push(copy);
        return;
      }
      duplicatesMerged += 1;
      var ex = byKey[key];
      var sMap = {};
      (ex.sources || []).concat(w.sources || []).forEach(function (s) { sMap[s] = true; });
      ex.sources = Object.keys(sMap);
      if (!ex.s2Id && w.s2Id) ex.s2Id = w.s2Id;
      if (!ex.doi && w.doi) ex.doi = w.doi;
      if (Number(w.cited_by_count || 0) > Number(ex.cited_by_count || 0)) ex.cited_by_count = w.cited_by_count;
      if (!ex.is_oa && w.is_oa) { ex.is_oa = true; if (w.oa_url) ex.oa_url = w.oa_url; }
      if (!ex.issn && w.issn) ex.issn = w.issn;
      if (!ex.is_core && w.is_core) ex.is_core = true;
      if (!ex.is_in_doaj && w.is_in_doaj) ex.is_in_doaj = true;
      var iMap = {};
      (ex.indexed_in || []).concat(w.indexed_in || []).forEach(function (i) { iMap[i] = true; });
      ex.indexed_in = Object.keys(iMap);
      if ((!ex.referenced_works || !ex.referenced_works.length) && w.referenced_works && w.referenced_works.length) ex.referenced_works = w.referenced_works;
    }

    (oaList || []).forEach(add);
    (s2List || []).forEach(add);
    (crList || []).forEach(add);

    if (sort === 'publication_year:desc,cited_by_count:desc') {
      order.sort(function (a, b) {
        return (Number(b.publication_year || 0) - Number(a.publication_year || 0)) || (Number(b.cited_by_count || 0) - Number(a.cited_by_count || 0));
      });
    } else {
      order.sort(function (a, b) { return Number(b.cited_by_count || 0) - Number(a.cited_by_count || 0); });
    }
    return { merged: order, duplicatesMerged: duplicatesMerged };
  }

  async function query3ApisAuthorsDirect(name, inst, orcid, sort) {
    var runOa = async function () {
      var t0 = Date.now();
      try {
        var filters = [];
        if (name) filters.push('default.search:' + name);
        if (inst) filters.push('affiliations.institution.display_name.search:' + inst);
        if (orcid) filters.push('orcid:' + orcid);
        var qParts = ['per-page=15'];
        if (filters.length) qParts.push('filter=' + encodeURIComponent(filters.join(',')));
        qParts.push('sort=' + encodeURIComponent(sort));
        var resp = await fetch('https://api.openalex.org/authors?' + qParts.join('&'), { headers: { 'Accept': 'application/json' } });
        var ms = Date.now() - t0;
        if (!resp.ok) return { provider: 'OpenAlex', key: 'openalex', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: 'HTTP ' + resp.status, items: [] };
        var data = await resp.json();
        var items = Array.isArray(data.results) ? data.results.map(normalizeAuthor) : [];
        var total = (data.meta && data.meta.count) || items.length;
        return { provider: 'OpenAlex', key: 'openalex', ok: true, status: 200, ms: ms, count: items.length, total: total, note: items.length + ' yazar profili alındı', items: items };
      } catch (_) {
        return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Ağ / zaman aşımı hatası', items: [] };
      }
    };

    var runS2 = async function () {
      var t0 = Date.now();
      var qText = [name, inst, orcid].filter(Boolean).join(' ').trim();
      if (!qText) return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'Sorgu boş', items: [] };
      try {
        var fields = 'authorId,name,affiliations,paperCount,citationCount,hIndex,externalIds';
        var resp = await fetch('https://api.semanticscholar.org/graph/v1/author/search?query=' + encodeURIComponent(qText) + '&limit=10&fields=' + fields, { headers: { 'Accept': 'application/json' } });
        var ms = Date.now() - t0;
        if (!resp.ok) {
          var note = resp.status === 429 ? 'HTTP 429 (Key\'siz hız sınırı)' : 'HTTP ' + resp.status;
          return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: note, items: [] };
        }
        var json = await resp.json();
        var items = Array.isArray(json.data) ? json.data.map(normalizeS2Author) : [];
        return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: true, status: 200, ms: ms, count: items.length, total: Number(json.total || items.length), note: items.length + ' yazar profili alındı', items: items };
      } catch (_) {
        return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Hız sınırı / CORS engeli', items: [] };
      }
    };

    var runCr = async function () {
      var t0 = Date.now();
      try {
        var qp = ['rows=5'];
        if (name) qp.push('query.author=' + encodeURIComponent(name));
        if (inst) qp.push('query.affiliation=' + encodeURIComponent(inst));
        if (orcid) qp.push('filter=orcid:' + encodeURIComponent(orcid));
        var resp = await fetch('https://api.crossref.org/works?' + qp.join('&'));
        var ms = Date.now() - t0;
        if (!resp.ok) return { provider: 'Crossref', key: 'crossref', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: 'HTTP ' + resp.status, items: [] };
        var json = await resp.json();
        var tot = Number((json.message && json.message['total-results']) || 0);
        return { provider: 'Crossref', key: 'crossref', ok: true, status: 200, ms: ms, count: tot, total: tot, note: tot.toLocaleString('tr-TR') + ' eşleşen DOI yayını doğrulandı (yazar profili API\'si yok)', items: [] };
      } catch (_) {
        return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Ağ hatası', items: [] };
      }
    };

    var res = await Promise.all([runOa(), runS2(), runCr()]);
    var mergedObj = mergeAuthorsLists(res[0].items, res[1].items, sort);
    var providers = res.map(function (r) {
      return { provider: r.provider, key: r.key, ok: r.ok, status: r.status, ms: r.ms, count: r.count, total: r.total, note: r.note };
    });
    return {
      meta: { count: Math.max(res[0].total || 0, res[1].total || 0, mergedObj.merged.length), duplicatesMerged: mergedObj.duplicatesMerged },
      providers: providers,
      results: mergedObj.merged
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

    var cacheKey = ['authors', name, inst, orcid, sort].join('|');
    var initial = document.getElementById('yazar-initial-state');
    var loading = document.getElementById('yazar-loading');
    var loadingTxt = document.getElementById('yazar-loading-text');
    var candSection = document.getElementById('yazar-candidates-section');
    var profSection = document.getElementById('yazar-profile-section');
    var statusBar = document.getElementById('yazar-status-bar');

    var cached = getCached(cacheKey);
    if (cached) {
      if (initial) initial.classList.add('hidden');
      if (profSection) profSection.classList.add('hidden');
      candidateAuthors = (cached.results || []).map(normalizeAuthor);
      renderCandidateAuthors(candidateAuthors, (cached.meta && cached.meta.count) || candidateAuthors.length);
      renderTransparencyPanel('yazar-candidates-transparency', 'yazar-candidates-provider-grid', 'yazar-candidates-transparency-summary', cached.providers, (cached.meta && cached.meta.duplicatesMerged) || 0);
      if (statusBar) statusBar.textContent = candidateAuthors.length + ' akademisyen profili (Önbellekten).';
      if (candidateAuthors.length === 1) selectAuthor(0);
      return;
    }

    if (initial) initial.classList.add('hidden');
    if (candSection) candSection.classList.add('hidden');
    if (profSection) profSection.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');
    if (loadingTxt) loadingTxt.textContent = 'OpenAlex, Semantic Scholar ve Crossref paralel sorgulanıyor...';

    var payload = null;
    if (!window.__VIBE_STANDALONE__) {
      try {
        var qs = new URLSearchParams({ name: name, institution: inst, orcid: orcid, sort: sort });
        var r2 = await fetch('/api/yazar/search?' + qs.toString());
        if (r2.ok) payload = await r2.json();
      } catch (_) {}
    }
    if (!payload) {
      payload = await query3ApisAuthorsDirect(name, inst, orcid, sort);
    }

    setCached(cacheKey, payload);
    candidateAuthors = (payload.results || []).map(normalizeAuthor);
    renderCandidateAuthors(candidateAuthors, (payload.meta && payload.meta.count) || candidateAuthors.length);
    renderTransparencyPanel('yazar-candidates-transparency', 'yazar-candidates-provider-grid', 'yazar-candidates-transparency-summary', payload.providers, (payload.meta && payload.meta.duplicatesMerged) || 0);
    if (statusBar) statusBar.textContent = candidateAuthors.length + ' akademisyen profili listelendi.';
    if (candidateAuthors.length === 1) {
      selectAuthor(0);
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
        : '<span class="text-[11px] text-mistral-stone font-mono">ID: ' + esc(a.id) + '</span>';

      return [
        '<tr>',
        '  <td><div class="akademik-work-title">' + esc(a.display_name) + '</div><div>' + orcidHtml + '</div>' + renderSourcePills(a.sources) + '</td>',
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
    citationsLoadedForAuthorId = '';

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
    switchTab('works');
    await loadAuthorWorks(1);
    if (profSection && typeof profSection.scrollIntoView === 'function') {
      profSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderAuthorYearlyTable(a) {
    var tbody = document.getElementById('yazar-yearly-tbody');
    if (!tbody) return;
    var counts = (a.counts_by_year || []).slice().sort(function (x, y) { return y.year - x.year; });
    if (!counts.length) {
      setHTML(tbody, '<tr><td colspan="4" class="text-center py-6 text-mistral-stone">Yıllık dağılım verisi yalnızca OpenAlex profilinde mevcuttur.</td></tr>');
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

  async function query3ApisAuthorWorksDirect(a, page, perPage, idxVal) {
    var idxClause = resolveIndexFilterClause(idxVal);
    var runOa = async function () {
      var t0 = Date.now();
      if (!/^A\d+$/i.test(a.id)) return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'OpenAlex Author ID yok', items: [] };
      try {
        var fStr = 'author.id:' + a.id + (idxClause ? ',' + idxClause : '');
        var url = 'https://api.openalex.org/works?filter=' + encodeURIComponent(fStr) + '&sort=cited_by_count:desc&per-page=' + perPage + '&page=' + page;
        var resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        var ms = Date.now() - t0;
        if (!resp.ok) return { provider: 'OpenAlex', key: 'openalex', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: 'HTTP ' + resp.status, items: [] };
        var json = await resp.json();
        var items = Array.isArray(json.results) ? json.results.map(normalizeWork) : [];
        var total = (json.meta && json.meta.count) || items.length;
        return { provider: 'OpenAlex', key: 'openalex', ok: true, status: 200, ms: ms, count: items.length, total: total, note: items.length + ' yayın alındı', items: items };
      } catch (_) {
        return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Ağ hatası', items: [] };
      }
    };

    var runS2 = async function () {
      var t0 = Date.now();
      var s2Id = a.s2AuthorId || (a.id.indexOf('S2A:') === 0 ? a.id.slice(4) : '');
      if (!s2Id) return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'S2 Yazar ID eşleşmedi', items: [] };
      try {
        var fields = 'paperId,externalIds,title,year,citationCount,isOpenAccess,openAccessPdf,venue,publicationVenue,journal,authors,url';
        var offset = (page - 1) * perPage;
        var resp = await fetch('https://api.semanticscholar.org/graph/v1/author/' + encodeURIComponent(s2Id) + '/papers?offset=' + offset + '&limit=' + Math.min(perPage, 100) + '&fields=' + fields, { headers: { 'Accept': 'application/json' } });
        var ms = Date.now() - t0;
        if (!resp.ok) {
          var note = resp.status === 429 ? 'HTTP 429 (Key\'siz hız sınırı)' : 'HTTP ' + resp.status;
          return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: note, items: [] };
        }
        var json = await resp.json();
        var items = Array.isArray(json.data) ? json.data.map(normalizeS2Work) : [];
        return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: true, status: 200, ms: ms, count: items.length, total: items.length, note: items.length + ' yayın alındı', items: items };
      } catch (_) {
        return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Hız sınırı / CORS', items: [] };
      }
    };

    var runCr = async function () {
      var t0 = Date.now();
      if (!a.display_name) return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'Yazar adı yok', items: [] };
      try {
        var url = 'https://api.crossref.org/works?query.author=' + encodeURIComponent(a.display_name) + '&sort=is-referenced-by-count&order=desc&rows=' + Math.min(perPage, 30) + '&offset=' + ((page - 1) * perPage);
        var resp = await fetch(url);
        var ms = Date.now() - t0;
        if (!resp.ok) return { provider: 'Crossref', key: 'crossref', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: 'HTTP ' + resp.status, items: [] };
        var json = await resp.json();
        var msg = json.message || {};
        var items = Array.isArray(msg.items) ? msg.items.map(normalizeCrossrefWork) : [];
        var total = Number(msg['total-results'] || items.length);
        return { provider: 'Crossref', key: 'crossref', ok: true, status: 200, ms: ms, count: items.length, total: total, note: items.length + ' DOI kaydı alındı', items: items };
      } catch (_) {
        return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Ağ hatası', items: [] };
      }
    };

    var res = await Promise.all([runOa(), runS2(), runCr()]);
    var mergedObj = mergeWorksLists(res[0].items, res[1].items, res[2].items, 'cited_by_count:desc');
    var providers = res.map(function (r) {
      return { provider: r.provider, key: r.key, ok: r.ok, status: r.status, ms: r.ms, count: r.count, total: r.total, note: r.note };
    });
    return {
      meta: { count: Math.max(res[0].total || 0, res[1].total || 0, mergedObj.merged.length), duplicatesMerged: mergedObj.duplicatesMerged },
      providers: providers,
      results: mergedObj.merged
    };
  }

  async function loadAuthorWorks(page) {
    if (!selectedAuthor) return;
    worksPage = Math.max(1, parseInt(page, 10) || 1);
    var ppSel = document.getElementById('works-per-page');
    var idxSel = document.getElementById('works-index-filter');
    worksPerPage = parseInt((ppSel && ppSel.value) || '50', 10) || 50;
    var idxVal = (idxSel && idxSel.value) || 'all';

    var cacheKey = ['aworks', selectedAuthor.id, selectedAuthor.s2AuthorId, worksPage, worksPerPage, idxVal].join('|');
    var tbody = document.getElementById('yazar-works-tbody');
    var sumEl = document.getElementById('works-filter-summary');

    var cached = getCached(cacheKey);
    var payload = null;
    if (cached) {
      payload = cached;
    } else {
      if (tbody) {
        setHTML(tbody, '<tr><td colspan="6" class="text-center py-8 text-mistral-stone">Yazarın yayınları OpenAlex, Semantic Scholar ve Crossref üzerinden paralel sorgulanıyor (Sayfa ' + worksPage + ')...</td></tr>');
      }
      if (!window.__VIBE_STANDALONE__) {
        try {
          var qs = new URLSearchParams({
            authorId: selectedAuthor.id,
            s2AuthorId: selectedAuthor.s2AuthorId || '',
            authorName: selectedAuthor.display_name || '',
            page: String(worksPage),
            perPage: String(worksPerPage),
            indexFilter: idxVal
          });
          var r2 = await fetch('/api/yazar/works?' + qs.toString());
          if (r2.ok) payload = await r2.json();
        } catch (_) {}
      }
      if (!payload) {
        payload = await query3ApisAuthorWorksDirect(selectedAuthor, worksPage, worksPerPage, idxVal);
      }
      setCached(cacheKey, payload);
    }

    authorWorks = (payload.results || []).map(normalizeWork);
    worksTotalCount = (payload.meta && payload.meta.count) || authorWorks.length;

    for (var i = 0; i < authorWorks.length; i++) {
      var w = authorWorks[i];
      if (w.id) authorWorkMap[w.id] = { title: w.title, year: w.publication_year, doi: w.doi };
    }

    if (sumEl) {
      sumEl.textContent = selectedAuthor.display_name + ' — Toplam ' + Number(worksTotalCount).toLocaleString('tr-TR') + ' yayın (Atıf sayısına göre sıralı)';
    }
    renderTransparencyPanel('yazar-works-transparency', 'yazar-works-provider-grid', 'yazar-works-transparency-summary', payload.providers, (payload.meta && payload.meta.duplicatesMerged) || 0);
    renderAuthorWorksTable(authorWorks);

    var totalPages = Math.max(1, Math.ceil((worksTotalCount || 1) / worksPerPage));
    var infoEl = document.getElementById('works-page-info');
    var prevBtn = document.getElementById('works-prev-btn');
    var nextBtn = document.getElementById('works-next-btn');
    if (infoEl) infoEl.textContent = 'Sayfa ' + worksPage + ' / ' + totalPages.toLocaleString('tr-TR') + ' (' + Number(worksTotalCount).toLocaleString('tr-TR') + ' yayın)';
    if (prevBtn) prevBtn.disabled = worksPage <= 1;
    if (nextBtn) nextBtn.disabled = worksPage >= totalPages;
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
        '  <td><div class="akademik-work-title">' + esc(w.title) + '</div>' + (doiHtml ? '<div>' + doiHtml + '</div>' : '') + renderSourcePills(w.sources) + '</td>',
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
    var topWork = authorWorks[0];
    var cacheKey = ['acites', selectedAuthor.id, topIds.slice(0, 5).join(','), allCitesPage, allCitesPerPage, idxVal].join('|');

    var cached = getCached(cacheKey);
    if (cached) {
      allCitesList = cached.results || [];
      allCitesTotalCount = (cached.meta && cached.meta.count) || allCitesList.length;
      if (sumEl) sumEl.textContent = 'Toplam ' + Number(allCitesTotalCount).toLocaleString('tr-TR') + ' atıf yapan yayın (Önbellekten)';
      renderTransparencyPanel('yazar-cites-transparency', 'yazar-cites-provider-grid', 'yazar-cites-transparency-summary', cached.providers, (cached.meta && cached.meta.duplicatesMerged) || 0);
      renderCombinedCitationsTable(allCitesList);
      return;
    }

    setHTML(tbody, '<tr><td colspan="6" class="text-center py-8 text-mistral-stone">Yazarın yayınlarına gelen birleşik atıf listesi 3 API üzerinden sorgulanıyor (Sayfa ' + allCitesPage + ')...</td></tr>');

    var runOaCites = async function () {
      var t0 = Date.now();
      if (!topIds.length) return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'OpenAlex Work ID listesi yok', items: [] };
      try {
        var fStr = 'cites:' + topIds.join('|') + (idxClause ? ',' + idxClause : '');
        var url = 'https://api.openalex.org/works?filter=' + encodeURIComponent(fStr) + '&sort=publication_year:desc,cited_by_count:desc&per-page=' + allCitesPerPage + '&page=' + allCitesPage;
        var resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        var ms = Date.now() - t0;
        if (!resp.ok) return { provider: 'OpenAlex', key: 'openalex', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: 'HTTP ' + resp.status, items: [] };
        var data = await resp.json();
        var items = Array.isArray(data.results) ? data.results.map(normalizeWork) : [];
        var total = (data.meta && data.meta.count) || items.length;
        return { provider: 'OpenAlex', key: 'openalex', ok: true, status: 200, ms: ms, count: items.length, total: total, note: items.length + ' atıf kaydı alındı', items: items };
      } catch (_) {
        return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Ağ hatası', items: [] };
      }
    };

    // Rate-limit koruması: S2'ye sadece en çok atıf alan ilk eser için tek bir paralel sorgu atılır
    var runS2TopCites = async function () {
      var t0 = Date.now();
      var ref = topWork && (topWork.s2Id || (topWork.doi ? 'DOI:' + topWork.doi : ''));
      if (!ref) return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'DOI/S2 ID eşleşmedi', items: [] };
      try {
        var fields = 'paperId,externalIds,title,year,citationCount,isOpenAccess,openAccessPdf,venue,publicationVenue,authors,url';
        var offset = (allCitesPage - 1) * Math.min(allCitesPerPage, 50);
        var url = 'https://api.semanticscholar.org/graph/v1/paper/' + encodeURIComponent(ref) + '/citations?offset=' + offset + '&limit=' + Math.min(allCitesPerPage, 50) + '&fields=' + fields;
        var resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        var ms = Date.now() - t0;
        if (!resp.ok) {
          var note = resp.status === 429 ? 'HTTP 429 (Key\'siz hız sınırı)' : 'HTTP ' + resp.status;
          return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: note, items: [] };
        }
        var json = await resp.json();
        var raw = Array.isArray(json.data) ? json.data.map(function (x) { return x.citingPaper; }).filter(Boolean) : [];
        var items = raw.map(normalizeS2Work);
        return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: true, status: 200, ms: ms, count: items.length, total: items.length, note: items.length + ' atıf kaydı (en yüksek atıflı eser)', items: items };
      } catch (_) {
        return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Hız sınırı / CORS', items: [] };
      }
    };

    var runCrMeta = async function () {
      var t0 = Date.now();
      var doi = topWork && topWork.doi;
      if (!doi) return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'DOI yok', items: [] };
      try {
        var resp = await fetch('https://api.crossref.org/works/' + encodeURIComponent(doi));
        var ms = Date.now() - t0;
        if (!resp.ok) return { provider: 'Crossref', key: 'crossref', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: 'HTTP ' + resp.status, items: [] };
        var json = await resp.json();
        var tot = Number((json.message && json.message['is-referenced-by-count']) || 0);
        return { provider: 'Crossref', key: 'crossref', ok: true, status: 200, ms: ms, count: 0, total: tot, note: 'En üst eser için ' + tot.toLocaleString('tr-TR') + ' DOI atıf sayacı doğrulandı', items: [] };
      } catch (_) {
        return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Ağ hatası', items: [] };
      }
    };

    var res = await Promise.all([runOaCites(), runS2TopCites(), runCrMeta()]);
    var mergedObj = mergeWorksLists(res[0].items, res[1].items, [], 'publication_year:desc,cited_by_count:desc');
    var providers = res.map(function (r) {
      return { provider: r.provider, key: r.key, ok: r.ok, status: r.status, ms: r.ms, count: r.count, total: r.total, note: r.note };
    });

    allCitesList = mergedObj.merged;
    allCitesTotalCount = Math.max(res[0].total || 0, res[1].total || 0, allCitesList.length);
    setCached(cacheKey, { meta: { count: allCitesTotalCount, duplicatesMerged: mergedObj.duplicatesMerged }, providers: providers, results: allCitesList });

    if (sumEl) {
      sumEl.textContent = 'Toplam ' + Number(allCitesTotalCount).toLocaleString('tr-TR') + ' atıf yapan yayın (Sayfa ' + allCitesPage + ')';
    }
    renderTransparencyPanel('yazar-cites-transparency', 'yazar-cites-provider-grid', 'yazar-cites-transparency-summary', providers, mergedObj.duplicatesMerged);
    renderCombinedCitationsTable(allCitesList);

    var totalPages = Math.max(1, Math.ceil((allCitesTotalCount || 1) / allCitesPerPage));
    var infoEl = document.getElementById('all-cites-page-info');
    var prevBtn = document.getElementById('all-cites-prev-btn');
    var nextBtn = document.getElementById('all-cites-next-btn');
    if (infoEl) infoEl.textContent = 'Sayfa ' + allCitesPage + ' / ' + totalPages.toLocaleString('tr-TR') + ' (Toplam ' + Number(allCitesTotalCount).toLocaleString('tr-TR') + ' atıf kaydı)';
    if (prevBtn) prevBtn.disabled = allCitesPage <= 1;
    if (nextBtn) nextBtn.disabled = allCitesPage >= totalPages || allCitesList.length < allCitesPerPage;
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
        '  <td><div class="akademik-work-title">' + esc(cw.title) + '</div>' + (doiHtml ? '<div>' + doiHtml + '</div>' : '') + renderSourcePills(cw.sources) + '</td>',
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
      var payload = null;
      if (!window.__VIBE_STANDALONE__) {
        var qs = new URLSearchParams({ workId: w.id || '', doi: w.doi || '', s2Id: w.s2Id || '', perPage: '50' });
        var r = await fetch('/api/akademik/citations?' + qs.toString());
        if (r.ok) payload = await r.json();
      }
      var list = (payload && payload.results) ? payload.results : [];
      if (!list.length && /^W\d+$/i.test(w.id || '')) {
        var resp = await fetch('https://api.openalex.org/works?filter=cites:' + encodeURIComponent(w.id) + '&sort=cited_by_count:desc&per-page=50', { headers: { 'Accept': 'application/json' } });
        var data = await resp.json();
        list = Array.isArray(data.results) ? data.results.map(normalizeWork) : [];
      }
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
          '  <td><div class="font-bold text-mistral-ink">' + esc(cw.title) + '</div>' + doiLink + renderSourcePills(cw.sources) + '</td>',
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
    var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
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
        await sleep(300);
      }
      if (!all.length && authorWorks.length) all = authorWorks.slice();
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
    var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
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
        await sleep(300);
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
    // Rate-limit dostu tembel yükleme: Birleşik Atıf Listesi yalnızca 2. sekmeye tıklandığında sorgulanır
    if (tabName === 'citations' && selectedAuthor && citationsLoadedForAuthorId !== selectedAuthor.id) {
      citationsLoadedForAuthorId = selectedAuthor.id;
      loadAuthorCombinedCitations(1);
    }
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
