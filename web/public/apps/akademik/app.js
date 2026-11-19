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

  var FALLBACK_WORKS = [
    {
      id: 'W2741809807',
      s2Id: '',
      doi: '10.48550/arXiv.1706.03762',
      title: 'Attention Is All You Need',
      publication_year: 2017,
      cited_by_count: 142850,
      is_oa: true,
      oa_url: 'https://arxiv.org/pdf/1706.03762.pdf',
      venue: 'Advances in Neural Information Processing Systems (NeurIPS)',
      publisher: 'Curran Associates / arXiv',
      type: 'article',
      source_type: 'conference',
      issn: '',
      is_core: false,
      is_in_doaj: false,
      indexed_in: ['arxiv'],
      pmid: '',
      authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
      institutions: ['Google Brain', 'Google Research', 'University of Toronto'],
      concepts: ['Transformer', 'Self-Attention', 'Deep Learning', 'Natural Language Processing'],
      abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
      counts_by_year: [],
      sources: ['fallback']
    }
  ];

  var currentWorks = [];
  var activeWork = null;
  var activeCitationFormat = 'apa';
  var mainPage = 1;
  var mainPerPage = 25;
  var mainTotalCount = 0;
  var citingPage = 1;
  var citingPerPage = 25;
  var citingTotalCount = 0;
  var queryCache = {};
  var breakdownCache = {};
  var CACHE_TTL_MS = 10 * 60 * 1000;

  function getCached(key) {
    var entry = queryCache[key];
    if (entry && (Date.now() - entry.ts) < CACHE_TTL_MS) return entry.data;
    return null;
  }
  function setCached(key, data) {
    queryCache[key] = { ts: Date.now(), data: data };
  }

  function reconstructAbstract(invertedIndex) {
    if (!invertedIndex || typeof invertedIndex !== 'object') return '';
    var words = [];
    var keys = Object.keys(invertedIndex);
    for (var i = 0; i < keys.length; i++) {
      var word = keys[i];
      var positions = invertedIndex[word];
      if (Array.isArray(positions)) {
        for (var j = 0; j < positions.length; j++) {
          var pos = positions[j];
          if (typeof pos === 'number' && pos >= 0 && pos < 2000) {
            words[pos] = word;
          }
        }
      }
    }
    return words.filter(Boolean).join(' ').slice(0, 1200);
  }

  function normalizeOpenAlexWork(w) {
    var doiRaw = w.doi ? String(w.doi).replace(/^https?:\/\/doi\.org\//i, '') : '';
    var authors = (w.authorships || []).slice(0, 8).map(function (a) {
      return a.author && a.author.display_name;
    }).filter(Boolean);
    var instMap = {};
    (w.authorships || []).forEach(function (a) {
      (a.institutions || []).forEach(function (inst) {
        if (inst && inst.display_name) instMap[inst.display_name] = true;
      });
    });
    var loc = w.primary_location || {};
    var src = loc.source || {};
    var oa = w.open_access || {};
    return {
      id: String(w.id || '').replace(/^https?:\/\/openalex\.org\//i, '') || doiRaw || 'W-OA',
      s2Id: '',
      doi: doiRaw,
      title: w.display_name || w.title || 'Başlıksız Akademik Yayın',
      publication_year: w.publication_year || null,
      cited_by_count: Number(w.cited_by_count || 0),
      is_oa: Boolean(oa.is_oa),
      oa_url: oa.oa_url || loc.pdf_url || loc.landing_page_url || (doiRaw ? 'https://doi.org/' + doiRaw : ''),
      venue: src.display_name || 'Belirtilmemiş Yayın Yeri',
      publisher: src.host_organization_name || 'OpenAlex Dizin Kaydı',
      type: w.type || 'article',
      source_type: src.type || 'journal',
      issn: src.issn_l || (Array.isArray(src.issn) && src.issn[0]) || '',
      is_core: Boolean(src.is_core),
      is_in_doaj: Boolean(src.is_in_doaj),
      indexed_in: Array.isArray(w.indexed_in) ? w.indexed_in : [],
      pmid: (w.ids && w.ids.pmid) ? String(w.ids.pmid).replace(/^https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//i, '').replace(/\/$/, '') : '',
      authors: authors,
      institutions: Object.keys(instMap).slice(0, 5),
      concepts: (w.concepts || w.topics || []).slice(0, 5).map(function (c) { return c.display_name; }).filter(Boolean),
      abstract: reconstructAbstract(w.abstract_inverted_index),
      counts_by_year: (w.counts_by_year || []).slice(0, 8).map(function (c) {
        return { year: c.year, cited_by_count: c.cited_by_count };
      }),
      sources: ['openalex']
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
      type: Array.isArray(p.publicationTypes) && p.publicationTypes.length ? String(p.publicationTypes[0]).toLowerCase() : 'article',
      source_type: 'journal',
      issn: (p.publicationVenue && p.publicationVenue.issn) || '',
      is_core: false,
      is_in_doaj: false,
      indexed_in: indexed,
      pmid: pmid,
      authors: (p.authors || []).slice(0, 8).map(function (a) { return a && a.name; }).filter(Boolean),
      institutions: [],
      concepts: Array.isArray(p.fieldsOfStudy) ? p.fieldsOfStudy.slice(0, 5) : [],
      abstract: p.abstract ? String(p.abstract).slice(0, 1200) : '',
      counts_by_year: [],
      sources: ['semanticscholar']
    };
  }

  function normalizeCrossrefWork(item) {
    var doiRaw = item.DOI ? String(item.DOI).trim() : '';
    var title = Array.isArray(item.title) && item.title[0] ? String(item.title[0]) : 'Başlıksız Akademik Yayın';
    var issued = (item.issued && item.issued['date-parts'] && item.issued['date-parts'][0]) || [];
    var pubYear = issued[0] ? Number(issued[0]) : null;
    var authors = (item.author || []).slice(0, 8).map(function (a) {
      return [a.given, a.family].filter(Boolean).join(' ').trim();
    }).filter(Boolean);
    var instSet = {};
    (item.author || []).forEach(function (a) {
      (a.affiliation || []).forEach(function (af) {
        if (af && af.name) instSet[af.name] = true;
      });
    });
    var venue = (Array.isArray(item['container-title']) && item['container-title'][0]) || item.publisher || 'Crossref DOI Kaydı';
    var issn = (Array.isArray(item.ISSN) && item.ISSN[0]) || '';
    var links = Array.isArray(item.link) ? item.link : [];
    var pdfLink = links.find(function (l) { return l && /pdf/i.test(l['content-type'] || ''); }) || links[0];
    var abstractRaw = item.abstract ? String(item.abstract).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1200) : '';
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
      concepts: Array.isArray(item.subject) ? item.subject.slice(0, 5) : [],
      abstract: abstractRaw,
      counts_by_year: [],
      sources: ['crossref']
    };
  }

  function mergeWorksLists(oaList, s2List, crList, sort) {
    var byKey = {};
    var order = [];
    var duplicatesMerged = 0;

    function makeKey(w) {
      if (w.doi) return 'doi:' + w.doi.toLowerCase().trim();
      var normTitle = String(w.title || '').toLowerCase().replace(/[^a-z0-9çğıöşü]+/gi, '').slice(0, 80);
      return 't:' + normTitle;
    }

    function addOrMerge(w) {
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
      var srcMap = {};
      (ex.sources || []).concat(w.sources || []).forEach(function (s) { srcMap[s] = true; });
      ex.sources = Object.keys(srcMap);
      if (!ex.s2Id && w.s2Id) ex.s2Id = w.s2Id;
      if (!ex.doi && w.doi) ex.doi = w.doi;
      if ((!ex.id || ex.id.indexOf('S2:') === 0 || ex.id.indexOf('CR:') === 0) && w.id && /^W\d+$/i.test(w.id)) {
        ex.id = w.id;
      }
      if (Number(w.cited_by_count || 0) > Number(ex.cited_by_count || 0)) ex.cited_by_count = w.cited_by_count;
      if (!ex.abstract && w.abstract) ex.abstract = w.abstract;
      if (!ex.is_oa && w.is_oa) {
        ex.is_oa = true;
        if (w.oa_url) ex.oa_url = w.oa_url;
      }
      if (!ex.issn && w.issn) ex.issn = w.issn;
      if (!ex.is_core && w.is_core) ex.is_core = true;
      if (!ex.is_in_doaj && w.is_in_doaj) ex.is_in_doaj = true;
      var idxMap = {};
      (ex.indexed_in || []).concat(w.indexed_in || []).forEach(function (i) { idxMap[i] = true; });
      ex.indexed_in = Object.keys(idxMap);
      if ((!ex.authors || !ex.authors.length) && w.authors && w.authors.length) ex.authors = w.authors;
      if ((!ex.institutions || !ex.institutions.length) && w.institutions && w.institutions.length) ex.institutions = w.institutions;
      if ((!ex.concepts || !ex.concepts.length) && w.concepts && w.concepts.length) ex.concepts = w.concepts;
    }

    (oaList || []).forEach(addOrMerge);
    (s2List || []).forEach(addOrMerge);
    (crList || []).forEach(addOrMerge);

    if (sort === 'publication_year:desc') {
      order.sort(function (a, b) {
        return (Number(b.publication_year || 0) - Number(a.publication_year || 0)) || (Number(b.cited_by_count || 0) - Number(a.cited_by_count || 0));
      });
    } else if (sort === 'cited_by_count:desc') {
      order.sort(function (a, b) { return Number(b.cited_by_count || 0) - Number(a.cited_by_count || 0); });
    }
    return { merged: order, duplicatesMerged: duplicatesMerged };
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
        (duplicatesMerged > 0 ? (' • ' + duplicatesMerged + ' mükerrer DOI/başlık birleştirildi') : '');
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
      badges.push('<span class="akademik-idx-badge akademik-idx-badge--core" title="CWTS Leiden Core Journal (Scopus / Web of Science Eşdeğeri Çekirdek Hakemli Dergi)">SCOPUS / CORE DERGİ</span>');
    }
    if (idxList.indexOf('crossref') !== -1 || w.doi) {
      badges.push('<span class="akademik-idx-badge akademik-idx-badge--crossref" title="Crossref Resmi DOI Kaydı">CROSSREF</span>');
    }
    if (idxList.indexOf('pubmed') !== -1 || w.pmid) {
      if (w.pmid) {
        badges.push('<a href="https://pubmed.ncbi.nlm.nih.gov/' + esc(w.pmid) + '/" target="_blank" rel="noopener noreferrer" class="akademik-idx-badge akademik-idx-badge--pubmed" title="PubMed / MEDLINE Kaydını Aç (PMID: ' + esc(w.pmid) + ')">PUBMED</a>');
      } else {
        badges.push('<span class="akademik-idx-badge akademik-idx-badge--pubmed" title="PubMed / MEDLINE İndeksli">PUBMED</span>');
      }
    }
    if (w.is_in_doaj || idxList.indexOf('doaj') !== -1) {
      badges.push('<span class="akademik-idx-badge akademik-idx-badge--doaj" title="DOAJ (Directory of Open Access Journals) Hakemli Açık Erişim Dergi">DOAJ</span>');
    }
    if (idxList.indexOf('arxiv') !== -1 || /arxiv/i.test(w.venue || '') || /arxiv/i.test(w.doi || '')) {
      badges.push('<span class="akademik-idx-badge akademik-idx-badge--arxiv" title="arXiv Ön Baskı (Preprint) Arşivi">ARXIV</span>');
    }
    if (w.issn) {
      badges.push('<span class="akademik-idx-badge akademik-idx-badge--issn" title="Uluslararası Standart Süreli Yayın Numarası (ISSN)">ISSN: ' + esc(w.issn) + '</span>');
    }
    if (!badges.length) return '';
    return '<div class="akademik-idx-wrap">' + badges.join('') + '</div>';
  }

  function formatCitation(w, fmt) {
    if (!w) return '';
    var authors = (w.authors && w.authors.length) ? w.authors : ['Anonim Yazar'];
    var year = w.publication_year || 't.y.';
    var title = w.title || 'Başlıksız Yayın';
    var venue = w.venue || 'Akademik Yayın';
    var doiPart = w.doi ? 'https://doi.org/' + w.doi : (w.oa_url || '');

    if (fmt === 'ieee') {
      return authors.join(', ') + ', "' + title + '," ' + venue + ', ' + year + (w.doi ? ', doi: ' + w.doi + '.' : '.');
    }
    if (fmt === 'mla') {
      var firstAuthor = authors[0] + (authors.length > 1 ? ', et al.' : '');
      return firstAuthor + '. "' + title + '." ' + venue + ', ' + year + (doiPart ? ', ' + doiPart + '.' : '.');
    }
    if (fmt === 'bibtex') {
      var slug = (authors[0] || 'author').split(/\s+/).pop().toLowerCase().replace(/[^a-z0-9]/g, '') + year;
      return [
        '@article{' + slug + ',',
        '  author = {' + authors.join(' and ') + '},',
        '  title = {' + title + '},',
        '  journal = {' + venue + '},',
        '  year = {' + year + '}' + (w.doi ? ',' : ''),
        w.doi ? '  doi = {' + w.doi + '}' : null,
        '}'
      ].filter(Boolean).join('\n');
    }
    var apaAuthors = authors.slice(0, 6).join(', ') + (authors.length > 6 ? ' ... ' + authors[authors.length - 1] : '');
    return apaAuthors + ' (' + year + '). ' + title + '. ' + venue + '.' + (doiPart ? ' ' + doiPart : '');
  }

  function updateSummaryStats(works, totalCount) {
    var metricsSection = document.getElementById('akademik-metrics-section');
    var totalEl = document.getElementById('stat-total-works');
    var citEl = document.getElementById('stat-total-citations');
    var oaEl = document.getElementById('stat-oa-ratio');
    var yearEl = document.getElementById('stat-median-year');

    if (metricsSection) metricsSection.classList.remove('hidden');

    if (!works || !works.length) {
      if (totalEl) totalEl.textContent = '0';
      if (citEl) citEl.textContent = '0';
      if (oaEl) oaEl.textContent = '%0';
      if (yearEl) yearEl.textContent = '—';
      return;
    }

    var totalCit = 0;
    var oaCount = 0;
    var years = [];
    for (var i = 0; i < works.length; i++) {
      totalCit += Number(works[i].cited_by_count || 0);
      if (works[i].is_oa) oaCount++;
      if (works[i].publication_year) years.push(Number(works[i].publication_year));
    }
    years.sort(function (a, b) { return a - b; });
    var medianYear = years.length ? years[Math.floor(years.length / 2)] : '—';
    var oaPct = Math.round((oaCount / works.length) * 100);

    if (totalEl) totalEl.textContent = Number(totalCount || works.length).toLocaleString('tr-TR');
    if (citEl) citEl.textContent = totalCit.toLocaleString('tr-TR');
    if (oaEl) oaEl.textContent = '%' + oaPct;
    if (yearEl) yearEl.textContent = String(medianYear);
  }

  function renderTable(works) {
    var resultsSection = document.getElementById('akademik-results-section');
    var tbody = document.getElementById('akademik-table-body');
    var loading = document.getElementById('akademik-loading');
    var initial = document.getElementById('akademik-initial-state');

    if (loading) loading.classList.add('hidden');
    if (initial) initial.classList.add('hidden');
    if (!resultsSection || !tbody) return;
    resultsSection.classList.remove('hidden');

    if (!works || !works.length) {
      setHTML(tbody, '<tr><td colspan="6" class="text-center py-10 text-mistral-slate text-sm">Girilen arama kriterleriyle eşleşen bilimsel yayın bulunamadı.</td></tr>');
      return;
    }

    var rowsHtml = works.map(function (w, idx) {
      var typeLabel = TYPE_LABELS[w.type] || w.type || 'Makale';
      var oaBadge = w.is_oa
        ? '<span class="akademik-oa-badge akademik-oa-badge--open">' + SVG_UNLOCK + '<span>Açık Erişim PDF</span></span>'
        : '<span class="akademik-oa-badge akademik-oa-badge--closed">' + SVG_LOCK + '<span>Kapalı Erişim</span></span>';

      var authorsText = (w.authors && w.authors.length)
        ? w.authors.slice(0, 3).join(', ') + (w.authors.length > 3 ? ' (+' + (w.authors.length - 3) + ')' : '')
        : 'Yazar bilgisi belirtilmemiş';

      var instText = (w.institutions && w.institutions.length)
        ? w.institutions.slice(0, 2).join(' • ')
        : '';

      var conceptsHtml = (w.concepts || []).slice(0, 4).map(function (c) {
        return '<span class="akademik-concept-chip">' + esc(c) + '</span>';
      }).join('');

      var doiHtml = w.doi
        ? '<a href="https://doi.org/' + esc(w.doi) + '" target="_blank" rel="noopener noreferrer" class="akademik-doi-link"><span>DOI: ' + esc(w.doi) + '</span>' + SVG_EXT + '</a>'
        : '';

      return [
        '<tr>',
        '  <td>',
        '    <span class="akademik-year-badge">' + esc(w.publication_year || '—') + '</span>',
        '    <span class="akademik-type-sub">' + esc(typeLabel) + '</span>',
        '  </td>',
        '  <td>',
        '    <div class="akademik-work-title">' + esc(w.title) + '</div>',
        doiHtml ? '    <div>' + doiHtml + '</div>' : '',
        conceptsHtml ? '    <div class="akademik-concepts-wrap">' + conceptsHtml + '</div>' : '',
        renderSourcePills(w.sources),
        '  </td>',
        '  <td>',
        '    <div class="akademik-author-list">' + esc(authorsText) + '</div>',
        instText ? '    <div class="akademik-inst-row">' + SVG_BUILDING + '<span>' + esc(instText) + '</span></div>' : '',
        '  </td>',
        '  <td>',
        '    <div class="akademik-venue-name">' + esc(w.venue) + '</div>',
        w.publisher ? '    <div class="akademik-publisher-sub">' + esc(w.publisher) + '</div>' : '',
        '    ' + renderIndexBadges(w),
        '  </td>',
        '  <td>',
        '    <span class="akademik-cite-badge">',
        '      ' + SVG_CHART,
        '      <span>' + Number(w.cited_by_count || 0).toLocaleString('tr-TR') + '</span>',
        '    </span>',
        '  </td>',
        '  <td>',
        '    <div class="akademik-actions-col">',
        '      ' + oaBadge,
        '      <div class="akademik-actions-btns">',
        '        <button type="button" data-open-work="' + idx + '" class="akademik-btn-inspect">İncele & Kaynakça</button>',
        w.oa_url ? '        <a href="' + esc(w.oa_url) + '" target="_blank" rel="noopener noreferrer" title="Kaynağı / PDF Aç" class="akademik-btn-ext">' + SVG_EXT + '</a>' : '',
        '      </div>',
        '    </div>',
        '  </td>',
        '</tr>'
      ].join('\n');
    }).join('\n');

    setHTML(tbody, rowsHtml);
  }

  function openWorkDialog(idx) {
    var w = currentWorks[idx];
    if (!w) return;
    activeWork = w;
    var dlg = document.getElementById('akademik-detail-dialog');
    if (!dlg) return;

    var titleEl = document.getElementById('dialog-work-title');
    var authorsEl = document.getElementById('dialog-work-authors');
    var instEl = document.getElementById('dialog-work-institutions');
    var absEl = document.getElementById('dialog-work-abstract');
    var badgesEl = document.getElementById('dialog-work-badges');
    var yearlyTbody = document.getElementById('dialog-yearly-citations-tbody');
    var citingTbody = document.getElementById('dialog-citing-works-tbody');
    var citeOut = document.getElementById('dialog-citation-output');
    var doiLink = document.getElementById('dialog-doi-link');
    var oaLink = document.getElementById('dialog-oa-link');

    if (titleEl) titleEl.textContent = w.title || '';
    if (authorsEl) authorsEl.textContent = (w.authors && w.authors.length) ? w.authors.join(', ') : 'Yazar bilgisi belirtilmemiş';
    if (instEl) instEl.textContent = ((w.institutions && w.institutions.length) ? w.institutions.join(' • ') + ' — ' : '') + (w.venue || '');
    if (absEl) absEl.textContent = w.abstract || 'Bu yayın için tam özet metni yayımcı tarafından kısıtlanmış veya dizinde yer almıyor.';

    if (badgesEl) {
      setHTML(
        badgesEl,
        '<span class="akademik-year-badge">' + esc(w.publication_year || '—') + '</span>' +
        '<span class="akademik-cite-badge">' + SVG_CHART + '<span>' + Number(w.cited_by_count || 0).toLocaleString('tr-TR') + ' Atıf</span></span>' +
        (w.doi ? '<span class="akademik-concept-chip font-mono">DOI: ' + esc(w.doi) + '</span>' : '')
      );
    }

    if (yearlyTbody) {
      var counts = (w.counts_by_year || []).slice().sort(function (a, b) { return b.year - a.year; });
      if (!counts.length) {
        setHTML(yearlyTbody, '<tr><td colspan="4" class="text-center py-4 text-mistral-stone">Yıllık atıf dağılım verisi yalnızca OpenAlex kaydında mevcuttur.</td></tr>');
      } else {
        var totalAll = Number(w.cited_by_count || 0) || counts.reduce(function (s, x) { return s + (x.cited_by_count || 0); }, 0) || 1;
        var ascCounts = counts.slice().sort(function (a, b) { return a.year - b.year; });
        var prevMap = {};
        for (var k = 0; k < ascCounts.length; k++) {
          prevMap[ascCounts[k].year] = k > 0 ? (ascCounts[k - 1].cited_by_count || 0) : null;
        }
        var yRows = counts.map(function (c) {
          var cVal = Number(c.cited_by_count || 0);
          var sharePct = ((cVal / totalAll) * 100).toFixed(1);
          var prevVal = prevMap[c.year];
          var diffHtml = '—';
          if (prevVal !== null && prevVal > 0) {
            var diff = cVal - prevVal;
            var diffPct = Math.round((diff / prevVal) * 100);
            diffHtml = (diff >= 0 ? '+' : '') + diff.toLocaleString('tr-TR') + ' (' + (diffPct >= 0 ? '+' : '') + diffPct + '%)';
          }
          return [
            '<tr>',
            '  <td><span class="akademik-year-badge">' + esc(c.year) + '</span></td>',
            '  <td class="font-mono font-bold">' + cVal.toLocaleString('tr-TR') + '</td>',
            '  <td class="font-mono">%' + esc(sharePct) + '</td>',
            '  <td class="font-mono text-mistral-slate">' + esc(diffHtml) + '</td>',
            '</tr>'
          ].join('');
        }).join('');
        setHTML(yearlyTbody, yRows);
      }
    }

    if (citingTbody) {
      citingPage = 1;
      var perPageSel = document.getElementById('citing-per-page');
      citingPerPage = parseInt((perPageSel && perPageSel.value) || '25', 10) || 25;
      var cIdxReset = document.getElementById('citing-index-filter');
      if (cIdxReset) cIdxReset.value = 'all';
      document.querySelectorAll('.akademik-breakdown-card').forEach(function (c) { c.classList.remove('active'); });
      loadCitingWorksForDialog(w, citingPage, citingPerPage).then(function () {
        loadCitingBreakdownCounts(w);
      });
    }

    if (citeOut) citeOut.textContent = formatCitation(w, activeCitationFormat);
    if (doiLink) {
      doiLink.href = w.doi ? 'https://doi.org/' + encodeURIComponent(w.doi).replace(/%2F/gi, '/') : (w.oa_url || '#');
    }
    if (oaLink) {
      oaLink.href = w.oa_url || (w.doi ? 'https://doi.org/' + w.doi : '#');
    }

    if (typeof dlg.showModal === 'function') {
      dlg.showModal();
    } else {
      dlg.setAttribute('open', 'open');
    }
  }

  function updateMainPagination() {
    var infoEl = document.getElementById('main-page-info');
    var prevBtn = document.getElementById('main-prev-btn');
    var nextBtn = document.getElementById('main-next-btn');
    var totalPages = Math.max(1, Math.ceil((mainTotalCount || currentWorks.length || 1) / mainPerPage));
    if (infoEl) {
      infoEl.textContent = 'Sayfa ' + mainPage + ' / ' + totalPages.toLocaleString('tr-TR') + ' (Toplam ' + Number(mainTotalCount || currentWorks.length).toLocaleString('tr-TR') + ' yayın)';
    }
    if (prevBtn) prevBtn.disabled = mainPage <= 1;
    if (nextBtn) nextBtn.disabled = mainPage >= totalPages;
  }

  function updateCitingPagination(shownLen) {
    var infoEl = document.getElementById('citing-page-info');
    var prevBtn = document.getElementById('citing-prev-btn');
    var nextBtn = document.getElementById('citing-next-btn');
    var totalPages = Math.max(1, Math.ceil((citingTotalCount || shownLen || 1) / citingPerPage));
    if (infoEl) {
      infoEl.textContent = 'Sayfa ' + citingPage + ' / ' + totalPages.toLocaleString('tr-TR') + ' (Toplam ' + Number(citingTotalCount || shownLen).toLocaleString('tr-TR') + ' atıf yapan yayın)';
    }
    if (prevBtn) prevBtn.disabled = citingPage <= 1;
    if (nextBtn) nextBtn.disabled = citingPage >= totalPages || shownLen < citingPerPage;
  }

  async function loadCitingBreakdownCounts(w) {
    var elCore = document.getElementById('bd-count-core');
    var elCr = document.getElementById('bd-count-crossref');
    var elPm = document.getElementById('bd-count-pubmed');
    var elAx = document.getElementById('bd-count-arxiv');

    var workId = String((w && w.id) || '').replace(/^https?:\/\/openalex\.org\//i, '').trim();
    if (!/^W\d+$/i.test(workId)) {
      if (elCore) elCore.textContent = '—';
      if (elCr) elCr.textContent = '—';
      if (elPm) elPm.textContent = '—';
      if (elAx) elAx.textContent = '—';
      return;
    }

    if (breakdownCache[workId]) {
      var cached = breakdownCache[workId];
      if (elCore) elCore.textContent = cached.core;
      if (elCr) elCr.textContent = cached.cr;
      if (elPm) elPm.textContent = cached.pm;
      if (elAx) elAx.textContent = cached.ax;
      return;
    }

    if (elCore) elCore.textContent = '...';
    if (elCr) elCr.textContent = '...';
    if (elPm) elPm.textContent = '...';
    if (elAx) elAx.textContent = '...';

    var totalAll = Math.max(1, Number(w.cited_by_count || 0));
    var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    var fetchCount = async function (clause) {
      try {
        var u = 'https://api.openalex.org/works?filter=' + encodeURIComponent('cites:' + workId + ',' + clause) + '&per-page=1';
        var r = await fetch(u, { headers: { 'Accept': 'application/json' } });
        if (!r.ok) return null;
        var d = await r.json();
        return (d && d.meta && typeof d.meta.count === 'number') ? d.meta.count : 0;
      } catch (_) {
        return null;
      }
    };

    // Hız sınırına (rate limit) takılmamak için istekleri ardışık ve aralıklı gönder
    var cCore = await fetchCount('primary_location.source.is_core:true,primary_location.source.type:journal');
    await sleep(220);
    var cCr = await fetchCount('indexed_in:crossref');
    await sleep(220);
    var cPm = await fetchCount('indexed_in:pubmed');
    await sleep(220);
    var cAx = await fetchCount('indexed_in:arxiv');

    var coreStr = cCore !== null ? (cCore.toLocaleString('tr-TR') + ' (%' + Math.min(100, Math.round((cCore / totalAll) * 100)) + ')') : '—';
    var crStr = cCr !== null ? cCr.toLocaleString('tr-TR') : '—';
    var pmStr = cPm !== null ? cPm.toLocaleString('tr-TR') : '—';
    var axStr = cAx !== null ? cAx.toLocaleString('tr-TR') : '—';

    if (cCore !== null || cCr !== null) {
      breakdownCache[workId] = { core: coreStr, cr: crStr, pm: pmStr, ax: axStr };
    }
    if (elCore) elCore.textContent = coreStr;
    if (elCr) elCr.textContent = crStr;
    if (elPm) elPm.textContent = pmStr;
    if (elAx) elAx.textContent = axStr;
  }

  async function query3ApisCitingDirect(w, p, pp, cIdxVal) {
    var workId = String((w && w.id) || '').replace(/^https?:\/\/openalex\.org\//i, '').trim();
    var doi = (w && w.doi) ? String(w.doi).trim() : '';
    var s2Id = (w && w.s2Id) ? String(w.s2Id).trim() : '';
    var cIdxClause = resolveIndexFilterClause(cIdxVal);

    var runOa = async function () {
      var t0 = Date.now();
      if (!/^W\d+$/i.test(workId)) {
        return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'OpenAlex Work ID yok', items: [] };
      }
      try {
        var citeFilterStr = 'cites:' + workId + (cIdxClause ? ',' + cIdxClause : '');
        var url = 'https://api.openalex.org/works?filter=' + encodeURIComponent(citeFilterStr) + '&sort=cited_by_count:desc&per-page=' + pp + '&page=' + p;
        var resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        var ms = Date.now() - t0;
        if (!resp.ok) return { provider: 'OpenAlex', key: 'openalex', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: 'HTTP ' + resp.status, items: [] };
        var json = await resp.json();
        var items = Array.isArray(json.results) ? json.results.map(normalizeOpenAlexWork) : [];
        var total = (json.meta && json.meta.count) || items.length;
        return { provider: 'OpenAlex', key: 'openalex', ok: true, status: 200, ms: ms, count: items.length, total: total, note: items.length + ' atıf alındı', items: items };
      } catch (e) {
        return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Ağ hatası', items: [] };
      }
    };

    var runS2 = async function () {
      var t0 = Date.now();
      var ref = s2Id || (doi ? 'DOI:' + doi : '');
      if (!ref) return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'DOI/S2 ID yok', items: [] };
      try {
        var fields = 'paperId,externalIds,title,year,citationCount,isOpenAccess,openAccessPdf,venue,publicationVenue,authors,url';
        var offset = (p - 1) * pp;
        var url = 'https://api.semanticscholar.org/graph/v1/paper/' + encodeURIComponent(ref) + '/citations?offset=' + offset + '&limit=' + Math.min(pp, 100) + '&fields=' + fields;
        var resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        var ms = Date.now() - t0;
        if (!resp.ok) {
          var note = resp.status === 429 ? 'HTTP 429 (Key\'siz hız sınırı)' : 'HTTP ' + resp.status;
          return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: note, items: [] };
        }
        var json = await resp.json();
        var rawList = Array.isArray(json.data) ? json.data.map(function (x) { return x.citingPaper; }).filter(Boolean) : [];
        var items = rawList.map(normalizeS2Work);
        return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: true, status: 200, ms: ms, count: items.length, total: items.length, note: items.length + ' atıf alındı', items: items };
      } catch (e) {
        return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Rate limit / CORS hatası', items: [] };
      }
    };

    var runCr = async function () {
      var t0 = Date.now();
      if (!doi) return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'DOI yok', items: [] };
      try {
        var resp = await fetch('https://api.crossref.org/works/' + encodeURIComponent(doi));
        var ms = Date.now() - t0;
        if (!resp.ok) return { provider: 'Crossref', key: 'crossref', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: 'HTTP ' + resp.status, items: [] };
        var json = await resp.json();
        var tot = Number((json.message && json.message['is-referenced-by-count']) || 0);
        return { provider: 'Crossref', key: 'crossref', ok: true, status: 200, ms: ms, count: 0, total: tot, note: 'Toplam ' + tot.toLocaleString('tr-TR') + ' atıf sayacı doğrulandı (açık liste vermez)', items: [] };
      } catch (_) {
        return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Ağ hatası', items: [] };
      }
    };

    var res = await Promise.all([runOa(), runS2(), runCr()]);
    var mergedObj = mergeWorksLists(res[0].items, res[1].items, [], 'cited_by_count:desc');
    var providers = res.map(function (r) {
      return { provider: r.provider, key: r.key, ok: r.ok, status: r.status, ms: r.ms, count: r.count, total: r.total, note: r.note };
    });
    return {
      meta: { count: Math.max(res[0].total || 0, res[1].total || 0, mergedObj.merged.length), duplicatesMerged: mergedObj.duplicatesMerged },
      providers: providers,
      results: mergedObj.merged
    };
  }

  async function loadCitingWorksForDialog(w, page, perPage) {
    var tbody = document.getElementById('dialog-citing-works-tbody');
    var countEl = document.getElementById('dialog-citing-works-count');
    if (!tbody) return;

    var p = Math.max(1, parseInt(page, 10) || 1);
    var pp = Math.max(10, Math.min(200, parseInt(perPage, 10) || 25));
    citingPage = p;
    citingPerPage = pp;

    var cIdxSel = document.getElementById('citing-index-filter');
    var cIdxVal = (cIdxSel && cIdxSel.value) || 'all';
    var workId = String((w && w.id) || '').replace(/^https?:\/\/openalex\.org\//i, '').trim();
    var doi = (w && w.doi) ? String(w.doi).trim() : '';
    var s2Id = (w && w.s2Id) ? String(w.s2Id).trim() : '';

    var cacheKey = 'cites_' + workId + '_' + doi + '_' + cIdxVal + '_' + p + '_' + pp;
    var cached = getCached(cacheKey);
    if (cached) {
      citingTotalCount = (cached.meta && cached.meta.count) || cached.results.length;
      if (countEl) countEl.textContent = 'Toplam ' + Number(citingTotalCount).toLocaleString('tr-TR') + ' atıf yapan yayın (Önbellek)';
      renderCitingWorksRows(cached.results, tbody);
      renderTransparencyPanel('dialog-citing-transparency', 'dialog-citing-provider-grid', 'dialog-citing-transparency-summary', cached.providers, cached.meta.duplicatesMerged || 0);
      updateCitingPagination(cached.results.length);
      return;
    }

    setHTML(tbody, '<tr><td colspan="5" class="text-center py-4 text-mistral-stone">OpenAlex, Semantic Scholar ve Crossref paralel sorgulanıyor (Sayfa ' + p + ')...</td></tr>');

    var payload = null;
    if (!window.__VIBE_STANDALONE__) {
      try {
        var qs = new URLSearchParams({
          workId: workId, doi: doi, s2Id: s2Id, page: String(p), perPage: String(pp), indexFilter: cIdxVal
        });
        var resp = await fetch('/api/akademik/citations?' + qs.toString());
        if (resp.ok) payload = await resp.json();
      } catch (_) {}
    }
    if (!payload) {
      payload = await query3ApisCitingDirect(w, p, pp, cIdxVal);
    }

    setCached(cacheKey, payload);
    var list = payload.results || [];
    citingTotalCount = (payload.meta && payload.meta.count) || list.length;
    if (countEl) {
      countEl.textContent = 'Toplam ' + Number(citingTotalCount).toLocaleString('tr-TR') + ' atıf yapan yayın — Sayfa ' + p + ' (' + list.length + ' birleştirilmiş kayıt)';
    }
    renderCitingWorksRows(list, tbody);
    renderTransparencyPanel('dialog-citing-transparency', 'dialog-citing-provider-grid', 'dialog-citing-transparency-summary', payload.providers, (payload.meta && payload.meta.duplicatesMerged) || 0);
    updateCitingPagination(list.length);
  }

  function renderCitingWorksRows(list, tbody) {
    if (!list || !list.length) {
      setHTML(tbody, '<tr><td colspan="5" class="text-center py-4 text-mistral-stone">Bu makaleye atıf yapan açık dizin yayını bulunamadı.</td></tr>');
      return;
    }
    var html = list.map(function (cw) {
      var auths = (cw.authors && cw.authors.length) ? cw.authors.slice(0, 3).join(', ') + (cw.authors.length > 3 ? ' (+' + (cw.authors.length - 3) + ')' : '') : 'Belirtilmemiş';
      var inst = (cw.institutions && cw.institutions.length) ? cw.institutions[0] : '';
      var doiLink = cw.doi
        ? '<a href="https://doi.org/' + esc(cw.doi) + '" target="_blank" rel="noopener noreferrer" class="akademik-doi-link"><span>DOI: ' + esc(cw.doi) + '</span>' + SVG_EXT + '</a>'
        : (cw.oa_url ? '<a href="' + esc(cw.oa_url) + '" target="_blank" rel="noopener noreferrer" class="akademik-doi-link"><span>Kaynağı Aç</span>' + SVG_EXT + '</a>' : '');
      return [
        '<tr>',
        '  <td><span class="akademik-year-badge">' + esc(cw.publication_year || '—') + '</span></td>',
        '  <td><div class="font-bold text-mistral-ink">' + esc(cw.title) + '</div>' + doiLink + renderSourcePills(cw.sources) + '</td>',
        '  <td><div class="font-semibold text-mistral-ink">' + esc(auths) + '</div>' + (inst ? '<div class="text-mistral-slate text-[11px] mt-0.5">' + esc(inst) + '</div>' : '') + '</td>',
        '  <td><div class="font-semibold text-mistral-ink">' + esc(cw.venue || '—') + '</div>' + renderIndexBadges(cw) + '</td>',
        '  <td><span class="akademik-cite-badge">' + SVG_CHART + '<span>' + Number(cw.cited_by_count || 0).toLocaleString('tr-TR') + '</span></span></td>',
        '</tr>'
      ].join('');
    }).join('');
    setHTML(tbody, html);
  }

  async function exportAllCitingWorks(format) {
    if (!activeWork) return;
    var workId = String(activeWork.id || '').replace(/^https?:\/\/openalex\.org\//i, '').trim();
    if (!/^W\d+$/i.test(workId)) {
      notify('Toplu cursor indirme için OpenAlex Work ID gereklidir.');
      return;
    }

    var csvBtn = document.getElementById('citing-export-csv-btn');
    var bibBtn = document.getElementById('citing-export-bib-btn');
    var csvLbl = document.getElementById('citing-export-csv-label');
    var bibLbl = document.getElementById('citing-export-bib-label');

    if (csvBtn) csvBtn.disabled = true;
    if (bibBtn) bibBtn.disabled = true;

    var allCiting = [];
    var cursor = '*';
    var maxRecords = 1000;
    var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

    try {
      while (cursor && allCiting.length < maxRecords) {
        var lblText = 'İndiriliyor (' + allCiting.length + (citingTotalCount ? '/' + Math.min(citingTotalCount, maxRecords) : '') + ')...';
        if (format === 'csv' && csvLbl) csvLbl.textContent = lblText;
        if (format === 'bib' && bibLbl) bibLbl.textContent = lblText;

        var expIdxSel = document.getElementById('citing-index-filter');
        var expIdxClause = resolveIndexFilterClause((expIdxSel && expIdxSel.value) || 'all');
        var expFilterStr = 'cites:' + workId + (expIdxClause ? ',' + expIdxClause : '');
        var url = 'https://api.openalex.org/works?filter=' + encodeURIComponent(expFilterStr) + '&sort=cited_by_count:desc&per-page=200&cursor=' + encodeURIComponent(cursor);
        var resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!resp.ok) break;
        var data = await resp.json();
        var batch = Array.isArray(data.results) ? data.results.map(normalizeOpenAlexWork) : [];
        if (!batch.length) break;
        allCiting = allCiting.concat(batch);
        cursor = (data.meta && data.meta.next_cursor) || null;
        if (batch.length < 200) break;
        await sleep(300);
      }

      if (!allCiting.length) {
        notify('İndirilecek atıf kaydı bulunamadı.');
        return;
      }

      if (format === 'bib') {
        var bibContent = allCiting.map(function (cw) { return formatCitation(cw, 'bibtex'); }).join('\n\n');
        var bibBlob = new Blob([bibContent], { type: 'application/x-bibtex;charset=utf-8' });
        var bibUrl = URL.createObjectURL(bibBlob);
        var aBib = document.createElement('a');
        aBib.href = bibUrl;
        aBib.download = workId + '-citing-works-' + allCiting.length + '.bib';
        document.body.appendChild(aBib);
        aBib.click();
        document.body.removeChild(aBib);
        URL.revokeObjectURL(bibUrl);
        notify(allCiting.length + ' atıf yapan yayın BibTeX (.bib) olarak indirildi.');
      } else {
        var csvEscape = function (v) {
          var s = String(v == null ? '' : v).replace(/"/g, '""');
          return '"' + s + '"';
        };
        var headers = ['Yıl', 'Başlık', 'Yazarlar', 'Kurumlar', 'Dergi/Konferans', 'İndeks Kaynakları', 'Çekirdek Dergi (Core)', 'ISSN', 'Atıf Sayısı', 'Açık Erişim', 'DOI', 'PubMed ID', 'URL'];
        var rows = [headers.map(csvEscape).join(',')];
        for (var i = 0; i < allCiting.length; i++) {
          var r = allCiting[i];
          rows.push([
            r.publication_year || '',
            r.title || '',
            (r.authors || []).join('; '),
            (r.institutions || []).join('; '),
            r.venue || '',
            (r.indexed_in || []).join('; ').toUpperCase(),
            r.is_core ? 'Evet (Core)' : 'Hayır',
            r.issn || '',
            r.cited_by_count || 0,
            r.is_oa ? 'Evet' : 'Hayır',
            r.doi || '',
            r.pmid || '',
            r.oa_url || (r.doi ? 'https://doi.org/' + r.doi : '')
          ].map(csvEscape).join(','));
        }
        var csvContent = '\uFEFF' + rows.join('\r\n');
        var csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        var csvUrl = URL.createObjectURL(csvBlob);
        var aCsv = document.createElement('a');
        aCsv.href = csvUrl;
        aCsv.download = workId + '-atif-listesi-' + allCiting.length + '.csv';
        document.body.appendChild(aCsv);
        aCsv.click();
        document.body.removeChild(aCsv);
        URL.revokeObjectURL(csvUrl);
        notify(allCiting.length + ' atıf yapan yayın CSV olarak indirildi.');
      }
    } catch (_e) {
      notify('Toplu indirme sırasında ağ hatası oluştu.');
    } finally {
      if (csvBtn) csvBtn.disabled = false;
      if (bibBtn) bibBtn.disabled = false;
      if (csvLbl) csvLbl.textContent = 'Tüm Atıf Listesini İndir (CSV)';
      if (bibLbl) bibLbl.textContent = 'Tümünü İndir (.bib)';
    }
  }

  function cleanFilterToken(str) {
    return String(str || '').replace(/[,:|]/g, ' ').trim();
  }

  async function query3ApisWorksDirect(params) {
    var title = params.title, author = params.author, institution = params.institution, venue = params.venue, doi = params.doi;
    var yearFrom = params.yearFrom, yearTo = params.yearTo, sort = params.sort, oaOnly = params.oaOnly, indexFilter = params.indexFilter;
    var page = params.page, perPage = params.perPage;

    var runOa = async function () {
      var t0 = Date.now();
      try {
        var filters = [];
        if (title) filters.push('title_and_abstract.search:' + title);
        if (author) filters.push('raw_author_name.search:' + author);
        if (institution) filters.push('raw_affiliation_strings.search:' + institution);
        if (doi) filters.push('doi:https://doi.org/' + doi);
        if (oaOnly) filters.push('is_oa:true');
        var idxClause = resolveIndexFilterClause(indexFilter);
        if (idxClause) filters.push(idxClause);
        if (yearFrom >= 1900 && yearFrom <= 2030) filters.push('from_publication_date:' + yearFrom + '-01-01');
        if (yearTo >= 1900 && yearTo <= 2030) filters.push('to_publication_date:' + yearTo + '-12-31');

        var queryParts = ['per-page=' + perPage, 'page=' + page];
        if (venue) queryParts.push('search=' + encodeURIComponent(venue));
        if (filters.length) queryParts.push('filter=' + encodeURIComponent(filters.join(',')));
        if (sort !== 'relevance_score:desc' || venue) queryParts.push('sort=' + encodeURIComponent(sort));

        var resp = await fetch('https://api.openalex.org/works?' + queryParts.join('&'), { headers: { 'Accept': 'application/json' } });
        var ms = Date.now() - t0;
        if (!resp.ok) return { provider: 'OpenAlex', key: 'openalex', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: 'HTTP ' + resp.status + ' hatası', items: [] };
        var data = await resp.json();
        var items = Array.isArray(data.results) ? data.results.map(normalizeOpenAlexWork) : [];
        var total = (data.meta && data.meta.count) || items.length;
        return { provider: 'OpenAlex', key: 'openalex', ok: true, status: 200, ms: ms, count: items.length, total: total, note: items.length + ' kayıt alındı (Toplam ' + Number(total).toLocaleString('tr-TR') + ')', items: items };
      } catch (e) {
        return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Zaman aşımı / Ağ hatası', items: [] };
      }
    };

    var runS2 = async function () {
      var t0 = Date.now();
      try {
        var fields = 'paperId,externalIds,title,year,citationCount,isOpenAccess,openAccessPdf,venue,publicationVenue,journal,publicationTypes,fieldsOfStudy,abstract,authors,url';
        var url;
        if (doi) {
          url = 'https://api.semanticscholar.org/graph/v1/paper/DOI:' + encodeURIComponent(doi) + '?fields=' + fields;
        } else {
          var qText = [title, author, institution, venue].filter(Boolean).join(' ').trim() || 'machine learning';
          var offset = (page - 1) * perPage;
          var yearParam = (yearFrom || yearTo) ? '&year=' + (yearFrom || 1900) + '-' + (yearTo || 2030) : '';
          var oaParam = oaOnly ? '&openAccessPdf' : '';
          url = 'https://api.semanticscholar.org/graph/v1/paper/search?query=' + encodeURIComponent(qText) + '&limit=' + Math.min(perPage, 50) + '&offset=' + offset + yearParam + oaParam + '&fields=' + fields;
        }
        var resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        var ms = Date.now() - t0;
        if (!resp.ok) {
          var note = resp.status === 429 ? 'HTTP 429 (API Key olmadan ortak hız sınırı aşıldı)' : (resp.status === 404 ? 'DOI Semantic Scholar dizininde bulunamadı' : 'HTTP ' + resp.status + ' hatası');
          return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: note, items: [] };
        }
        var json = await resp.json();
        var rawList = doi ? (json && json.paperId ? [json] : []) : (Array.isArray(json.data) ? json.data : []);
        var items = rawList.map(normalizeS2Work);
        var total = doi ? items.length : Number(json.total || items.length);
        return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: true, status: 200, ms: ms, count: items.length, total: total, note: items.length + ' kayıt alındı (Key\'siz erişim)', items: items };
      } catch (e) {
        return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Hız sınırı / Tarayıcı CORS engeli', items: [] };
      }
    };

    var runCr = async function () {
      var t0 = Date.now();
      try {
        var url;
        if (doi) {
          url = 'https://api.crossref.org/works/' + encodeURIComponent(doi);
        } else {
          var qp = ['rows=' + Math.min(perPage, 40), 'offset=' + ((page - 1) * perPage)];
          if (title) qp.push('query.title=' + encodeURIComponent(title));
          if (author) qp.push('query.author=' + encodeURIComponent(author));
          if (institution) qp.push('query.affiliation=' + encodeURIComponent(institution));
          if (venue) qp.push('query.container-title=' + encodeURIComponent(venue));
          if (!title && !author && !institution && !venue) qp.push('query.bibliographic=machine+learning');
          var crFilters = [];
          if (yearFrom >= 1900 && yearFrom <= 2030) crFilters.push('from-pub-date:' + yearFrom + '-01-01');
          if (yearTo >= 1900 && yearTo <= 2030) crFilters.push('until-pub-date:' + yearTo + '-12-31');
          if (crFilters.length) qp.push('filter=' + encodeURIComponent(crFilters.join(',')));
          if (sort === 'cited_by_count:desc') qp.push('sort=is-referenced-by-count&order=desc');
          else if (sort === 'publication_year:desc') qp.push('sort=published&order=desc');
          url = 'https://api.crossref.org/works?' + qp.join('&');
        }
        var resp = await fetch(url);
        var ms = Date.now() - t0;
        if (!resp.ok) return { provider: 'Crossref', key: 'crossref', ok: false, status: resp.status, ms: ms, count: 0, total: 0, note: 'HTTP ' + resp.status + ' hatası', items: [] };
        var json = await resp.json();
        var msg = json.message || {};
        var rawList = doi ? (msg.DOI ? [msg] : []) : (Array.isArray(msg.items) ? msg.items : []);
        var items = rawList.map(normalizeCrossrefWork);
        var total = doi ? items.length : Number(msg['total-results'] || items.length);
        return { provider: 'Crossref', key: 'crossref', ok: true, status: 200, ms: ms, count: items.length, total: total, note: items.length + ' resmi DOI kaydı alındı', items: items };
      } catch (e) {
        return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: 'Zaman aşımı / Ağ hatası', items: [] };
      }
    };

    var res = await Promise.all([runOa(), runS2(), runCr()]);
    var mergedObj = mergeWorksLists(res[0].items, res[1].items, res[2].items, sort);
    var results = mergedObj.merged;

    if (oaOnly) {
      var oaF = results.filter(function (r) { return r.is_oa; });
      if (oaF.length) results = oaF;
    }
    if (venue) {
      var vLow = venue.toLowerCase();
      var vF = results.filter(function (r) { return (r.venue || '').toLowerCase().indexOf(vLow) !== -1 || (r.publisher || '').toLowerCase().indexOf(vLow) !== -1; });
      if (vF.length) results = vF;
    }

    var providers = res.map(function (r) {
      return { provider: r.provider, key: r.key, ok: r.ok, status: r.status, ms: r.ms, count: r.count, total: r.total, note: r.note };
    });
    var anyOk = providers.some(function (p) { return p.ok; });
    return {
      meta: {
        count: Math.max(res[0].total || 0, res[2].total || 0, res[1].total || 0, results.length),
        duplicatesMerged: mergedObj.duplicatesMerged,
        source: providers.filter(function (p) { return p.ok; }).map(function (p) { return p.provider; }).join(' + ') || 'Yedek Veri Seti'
      },
      providers: providers,
      results: anyOk && results.length ? results : FALLBACK_WORKS
    };
  }

  async function searchWorks(targetPage) {
    mainPage = (typeof targetPage === 'number' && targetPage >= 1) ? targetPage : 1;
    var fTitle = document.getElementById('field-title');
    var fAuthor = document.getElementById('field-author');
    var fInst = document.getElementById('field-institution');
    var fVenue = document.getElementById('field-venue');
    var fDoi = document.getElementById('field-doi');
    var fYearFrom = document.getElementById('field-year-from');
    var fYearTo = document.getElementById('field-year-to');
    var fSort = document.getElementById('field-sort');
    var fOa = document.getElementById('field-oa');
    var fIdx = document.getElementById('field-index-filter');

    var statsBar = document.getElementById('akademik-stats-bar');
    var badgeEl = document.getElementById('akademik-source-badge');
    var loading = document.getElementById('akademik-loading');
    var initial = document.getElementById('akademik-initial-state');
    var resultsSection = document.getElementById('akademik-results-section');

    var title = cleanFilterToken(fTitle && fTitle.value);
    var author = cleanFilterToken(fAuthor && fAuthor.value);
    var institution = cleanFilterToken(fInst && fInst.value);
    var venue = cleanFilterToken(fVenue && fVenue.value);
    var doi = String((fDoi && fDoi.value) || '').trim().replace(/^https?:\/\/doi\.org\//i, '');
    var yearFrom = parseInt((fYearFrom && fYearFrom.value) || '0', 10) || 0;
    var yearTo = parseInt((fYearTo && fYearTo.value) || '0', 10) || 0;
    var sort = (fSort && fSort.value) || 'cited_by_count:desc';
    var oaOnly = (fOa && fOa.value) === 'oa';
    var indexFilter = (fIdx && fIdx.value) || 'all';

    if (!title && !author && !institution && !venue && !doi && !yearFrom && !yearTo && indexFilter === 'all') {
      notify('Lütfen arama yapmak için en az bir alanı (Başlık, Yazar, Kurum, Dergi veya DOI) doldurun.');
      if (fTitle) fTitle.focus();
      return;
    }

    var cacheKey = ['works', title, author, institution, venue, doi, yearFrom, yearTo, sort, oaOnly, indexFilter, mainPage, mainPerPage].join('|');
    var cached = getCached(cacheKey);
    if (cached) {
      currentWorks = cached.results || FALLBACK_WORKS;
      mainTotalCount = (cached.meta && cached.meta.count) || currentWorks.length;
      updateSummaryStats(currentWorks, mainTotalCount);
      renderTable(currentWorks);
      renderTransparencyPanel('akademik-transparency-panel', 'akademik-provider-grid', 'akademik-transparency-summary', cached.providers, (cached.meta && cached.meta.duplicatesMerged) || 0);
      updateMainPagination();
      if (badgeEl) badgeEl.textContent = (cached.meta && cached.meta.source) || 'Önbellek';
      if (statsBar) statsBar.textContent = 'Toplam ' + Number(mainTotalCount).toLocaleString('tr-TR') + ' eşleşmeden ' + currentWorks.length + ' birleştirilmiş yayın (Önbellekten).';
      return;
    }

    if (initial) initial.classList.add('hidden');
    if (resultsSection) resultsSection.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');
    if (statsBar) statsBar.textContent = 'OpenAlex, Semantic Scholar ve Crossref paralel sorgulanıyor...';

    var payload = null;
    if (!window.__VIBE_STANDALONE__) {
      try {
        var qs = new URLSearchParams({
          title: title, author: author, institution: institution, venue: venue, doi: doi,
          yearFrom: String(yearFrom || ''), yearTo: String(yearTo || ''), sort: sort,
          oa: oaOnly ? '1' : '0', indexFilter: indexFilter, page: String(mainPage), perPage: String(mainPerPage)
        });
        var apiResp = await fetch('/api/akademik/works?' + qs.toString());
        if (apiResp.ok) payload = await apiResp.json();
      } catch (_) {}
    }

    if (!payload) {
      payload = await query3ApisWorksDirect({
        title: title, author: author, institution: institution, venue: venue, doi: doi,
        yearFrom: yearFrom, yearTo: yearTo, sort: sort, oaOnly: oaOnly, indexFilter: indexFilter,
        page: mainPage, perPage: mainPerPage
      });
    }

    setCached(cacheKey, payload);
    currentWorks = payload.results || FALLBACK_WORKS;
    mainTotalCount = (payload.meta && payload.meta.count) || currentWorks.length;
    updateSummaryStats(currentWorks, mainTotalCount);
    renderTable(currentWorks);
    renderTransparencyPanel('akademik-transparency-panel', 'akademik-provider-grid', 'akademik-transparency-summary', payload.providers, (payload.meta && payload.meta.duplicatesMerged) || 0);
    updateMainPagination();
    if (badgeEl) badgeEl.textContent = (payload.meta && payload.meta.source) || 'Çoklu API';
    if (statsBar) {
      statsBar.textContent = 'Toplam ' + Number(mainTotalCount).toLocaleString('tr-TR') + ' eşleşmeden ' + currentWorks.length + ' birleştirilmiş yayın tabloda listeleniyor.';
    }
  }

  function resetForm() {
    ['field-title', 'field-author', 'field-institution', 'field-venue', 'field-doi', 'field-year-from', 'field-year-to'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    var fSort = document.getElementById('field-sort');
    if (fSort) fSort.value = 'cited_by_count:desc';
    var fOa = document.getElementById('field-oa');
    if (fOa) fOa.value = 'all';
    var fIdx = document.getElementById('field-index-filter');
    if (fIdx) fIdx.value = 'all';

    var initial = document.getElementById('akademik-initial-state');
    var resultsSection = document.getElementById('akademik-results-section');
    var metricsSection = document.getElementById('akademik-metrics-section');
    var statsBar = document.getElementById('akademik-stats-bar');

    if (resultsSection) resultsSection.classList.add('hidden');
    if (metricsSection) metricsSection.classList.add('hidden');
    if (initial) initial.classList.remove('hidden');
    if (statsBar) statsBar.textContent = 'Sorgulama için yukarıdaki alanlardan en az birini doldurun.';
  }

  function init() {
    var form = document.getElementById('akademik-search-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        searchWorks();
      });
    }

    var mainPrevBtn = document.getElementById('main-prev-btn');
    var mainNextBtn = document.getElementById('main-next-btn');
    if (mainPrevBtn) {
      mainPrevBtn.addEventListener('click', function () {
        if (mainPage > 1) searchWorks(mainPage - 1);
      });
    }
    if (mainNextBtn) {
      mainNextBtn.addEventListener('click', function () {
        searchWorks(mainPage + 1);
      });
    }

    var citingPrevBtn = document.getElementById('citing-prev-btn');
    var citingNextBtn = document.getElementById('citing-next-btn');
    var citingPerPageSel = document.getElementById('citing-per-page');
    if (citingPrevBtn) {
      citingPrevBtn.addEventListener('click', function () {
        if (activeWork && citingPage > 1) loadCitingWorksForDialog(activeWork, citingPage - 1, citingPerPage);
      });
    }
    if (citingNextBtn) {
      citingNextBtn.addEventListener('click', function () {
        if (activeWork) loadCitingWorksForDialog(activeWork, citingPage + 1, citingPerPage);
      });
    }
    document.querySelectorAll('.akademik-breakdown-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var fVal = card.getAttribute('data-breakdown-filter') || 'all';
        var cIdxSel = document.getElementById('citing-index-filter');
        if (cIdxSel) {
          var nextVal = (cIdxSel.value === fVal) ? 'all' : fVal;
          cIdxSel.value = nextVal;
          document.querySelectorAll('.akademik-breakdown-card').forEach(function (c) {
            c.classList.toggle('active', c.getAttribute('data-breakdown-filter') === nextVal);
          });
          if (activeWork) loadCitingWorksForDialog(activeWork, 1, citingPerPage);
        }
      });
    });

    var citingIdxSel = document.getElementById('citing-index-filter');
    if (citingIdxSel) {
      citingIdxSel.addEventListener('change', function () {
        if (activeWork) loadCitingWorksForDialog(activeWork, 1, citingPerPage);
      });
    }
    if (citingPerPageSel) {
      citingPerPageSel.addEventListener('change', function () {
        citingPerPage = parseInt(citingPerPageSel.value || '25', 10) || 25;
        if (activeWork) loadCitingWorksForDialog(activeWork, 1, citingPerPage);
      });
    }

    var exportCsvBtn = document.getElementById('citing-export-csv-btn');
    var exportBibBtn = document.getElementById('citing-export-bib-btn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', function () { exportAllCitingWorks('csv'); });
    }
    if (exportBibBtn) {
      exportBibBtn.addEventListener('click', function () { exportAllCitingWorks('bib'); });
    }

    var resetBtn = document.getElementById('akademik-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetForm);
    }

    document.querySelectorAll('.akademik-preset-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        resetForm();
        var t = btn.getAttribute('data-preset-title') || '';
        var a = btn.getAttribute('data-preset-author') || '';
        var d = btn.getAttribute('data-preset-doi') || '';
        if (t && document.getElementById('field-title')) document.getElementById('field-title').value = t;
        if (a && document.getElementById('field-author')) document.getElementById('field-author').value = a;
        if (d && document.getElementById('field-doi')) document.getElementById('field-doi').value = d;
        searchWorks();
      });
    });

    var tbody = document.getElementById('akademik-table-body');
    if (tbody) {
      tbody.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-open-work]');
        if (btn) {
          var idx = parseInt(btn.getAttribute('data-open-work'), 10);
          if (!isNaN(idx)) openWorkDialog(idx);
        }
      });
    }

    var closeBtn = document.getElementById('dialog-close-btn');
    var dlg = document.getElementById('akademik-detail-dialog');
    if (closeBtn && dlg) {
      closeBtn.addEventListener('click', function () {
        if (typeof dlg.close === 'function') dlg.close();
        else dlg.removeAttribute('open');
      });
    }

    document.querySelectorAll('.cite-fmt-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeCitationFormat = btn.getAttribute('data-cite-fmt') || 'apa';
        document.querySelectorAll('.cite-fmt-btn').forEach(function (b) {
          b.className = 'cite-fmt-btn px-3 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-mistral-slate cursor-pointer';
        });
        btn.className = 'cite-fmt-btn px-3 py-1 rounded-lg text-xs font-semibold bg-mistral-ink text-white cursor-pointer';
        var citeOut = document.getElementById('dialog-citation-output');
        if (citeOut && activeWork) {
          citeOut.textContent = formatCitation(activeWork, activeCitationFormat);
        }
      });
    });

    var copyBtn = document.getElementById('dialog-copy-citation');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var citeOut = document.getElementById('dialog-citation-output');
        if (citeOut && citeOut.textContent) {
          navigator.clipboard.writeText(citeOut.textContent).then(function () {
            notify('Kaynakça panoya kopyalandı.');
          });
        }
      });
    }

    var dlBibBtn = document.getElementById('dialog-download-bib');
    if (dlBibBtn) {
      dlBibBtn.addEventListener('click', function () {
        if (!activeWork) return;
        var bib = formatCitation(activeWork, 'bibtex');
        var blob = new Blob([bib], { type: 'application/x-bibtex;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = (activeWork.id || 'citation') + '.bib';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        notify('BibTeX (.bib) dosyası indirildi.');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
