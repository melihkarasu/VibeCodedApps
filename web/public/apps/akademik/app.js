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

  var SVG_UNLOCK = '<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>';
  var SVG_LOCK = '<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  var SVG_BUILDING = '<svg class="w-3.5 h-3.5 shrink-0 text-mistral-stone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>';
  var SVG_CHART = '<svg class="w-3.5 h-3.5 shrink-0 text-mistral-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>';
  var SVG_EXT = '<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';

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
      doi: '10.48550/arXiv.1706.03762',
      title: 'Attention Is All You Need',
      publication_year: 2017,
      cited_by_count: 142850,
      is_oa: true,
      oa_url: 'https://arxiv.org/pdf/1706.03762.pdf',
      venue: 'Advances in Neural Information Processing Systems (NeurIPS)',
      publisher: 'Curran Associates / arXiv',
      type: 'article',
      authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
      institutions: ['Google Brain', 'Google Research', 'University of Toronto'],
      concepts: ['Transformer', 'Self-Attention', 'Deep Learning', 'Natural Language Processing'],
      abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
      counts_by_year: [
        { year: 2021, cited_by_count: 19400 },
        { year: 2022, cited_by_count: 26800 },
        { year: 2023, cited_by_count: 34200 },
        { year: 2024, cited_by_count: 38900 },
        { year: 2025, cited_by_count: 23550 }
      ]
    },
    {
      id: 'W2153579005',
      doi: '10.1126/science.aab3750',
      title: 'DNA repair mechanisms and cellular genome stability',
      publication_year: 2015,
      cited_by_count: 4820,
      is_oa: true,
      oa_url: 'https://doi.org/10.1126/science.aab3750',
      venue: 'Science',
      publisher: 'American Association for the Advancement of Science',
      type: 'review',
      authors: ['Aziz Sancar', 'Paul Modrich', 'Tomas Lindahl'],
      institutions: ['University of North Carolina at Chapel Hill', 'Duke University', 'Francis Crick Institute'],
      concepts: ['Nucleotide Excision Repair', 'DNA Damage', 'Molecular Biology', 'Biochemistry'],
      abstract: 'Living cells possess sophisticated enzymatic machinery to repair UV-induced photoproducts, replication errors, and base lesions, safeguarding genomic integrity across generations.',
      counts_by_year: [
        { year: 2021, cited_by_count: 590 },
        { year: 2022, cited_by_count: 640 },
        { year: 2023, cited_by_count: 710 },
        { year: 2024, cited_by_count: 680 },
        { year: 2025, cited_by_count: 520 }
      ]
    },
    {
      id: 'W3177828901',
      doi: '10.1038/s41586-021-03819-2',
      title: 'Highly accurate protein structure prediction with AlphaFold',
      publication_year: 2021,
      cited_by_count: 31400,
      is_oa: true,
      oa_url: 'https://www.nature.com/articles/s41586-021-03819-2.pdf',
      venue: 'Nature',
      publisher: 'Springer Nature',
      type: 'article',
      authors: ['John Jumper', 'Richard Evans', 'Alexander Pritzel', 'Tim Green', 'Michael Figurnov', 'Demis Hassabis'],
      institutions: ['DeepMind', 'EMBL-EBI'],
      concepts: ['Protein Structure Prediction', 'Computational Biology', 'Deep Learning', 'Bioinformatics'],
      abstract: 'Proteins are essential to life, and understanding their structure can facilitate a mechanistic understanding of their function. Here we provide the first computational method that can regularly predict protein structures with atomic accuracy.',
      counts_by_year: [
        { year: 2021, cited_by_count: 2100 },
        { year: 2022, cited_by_count: 7400 },
        { year: 2023, cited_by_count: 8900 },
        { year: 2024, cited_by_count: 8200 },
        { year: 2025, cited_by_count: 4800 }
      ]
    }
  ];

  var currentWorks = [];
  var activeWork = null;
  var activeCitationFormat = 'apa';

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
      doi: doiRaw,
      title: w.display_name || w.title || 'Başlıksız Akademik Yayın',
      publication_year: w.publication_year || null,
      cited_by_count: Number(w.cited_by_count || 0),
      is_oa: Boolean(oa.is_oa),
      oa_url: oa.oa_url || loc.pdf_url || loc.landing_page_url || (doiRaw ? 'https://doi.org/' + doiRaw : ''),
      venue: src.display_name || 'Belirtilmemiş Yayın Yeri',
      publisher: src.host_organization_name || 'OpenAlex Dizin Kaydı',
      type: w.type || 'article',
      authors: authors,
      institutions: Object.keys(instMap).slice(0, 5),
      concepts: (w.concepts || w.topics || []).slice(0, 5).map(function (c) { return c.display_name; }).filter(Boolean),
      abstract: reconstructAbstract(w.abstract_inverted_index),
      counts_by_year: (w.counts_by_year || []).slice(0, 8).map(function (c) {
        return { year: c.year, cited_by_count: c.cited_by_count };
      })
    };
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
        ? '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">' + SVG_UNLOCK + '<span>Açık Erişim PDF</span></span>'
        : '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-mistral-stone border border-stone-200">' + SVG_LOCK + '<span>Kapalı Erişim</span></span>';

      var authorsText = (w.authors && w.authors.length)
        ? w.authors.slice(0, 3).join(', ') + (w.authors.length > 3 ? ' (+' + (w.authors.length - 3) + ')' : '')
        : 'Yazar bilgisi belirtilmemiş';

      var instText = (w.institutions && w.institutions.length)
        ? w.institutions.slice(0, 2).join(' • ')
        : '';

      var conceptsHtml = (w.concepts || []).slice(0, 4).map(function (c) {
        return '<span class="px-2 py-0.5 rounded bg-stone-100 text-mistral-slate text-[11px] font-medium">' + esc(c) + '</span>';
      }).join('');

      var doiHtml = w.doi
        ? '<a href="https://doi.org/' + esc(w.doi) + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-mono text-mistral-orange hover:underline mt-1"><span>DOI: ' + esc(w.doi) + '</span>' + SVG_EXT + '</a>'
        : '';

      return [
        '<tr class="group">',
        '  <td class="whitespace-nowrap">',
        '    <div class="font-mono font-bold text-sm text-mistral-ink">' + esc(w.publication_year || '—') + '</div>',
        '    <div class="text-[11px] text-mistral-stone font-medium mt-0.5">' + esc(typeLabel) + '</div>',
        '  </td>',
        '  <td>',
        '    <div class="font-bold text-mistral-ink leading-snug">' + esc(w.title) + '</div>',
        doiHtml ? '    <div>' + doiHtml + '</div>' : '',
        conceptsHtml ? '    <div class="flex flex-wrap gap-1 mt-2">' + conceptsHtml + '</div>' : '',
        '  </td>',
        '  <td>',
        '    <div class="text-xs font-semibold text-mistral-ink leading-snug">' + esc(authorsText) + '</div>',
        instText ? '    <div class="inline-flex items-start gap-1 text-[11px] text-mistral-slate mt-1.5">' + SVG_BUILDING + '<span>' + esc(instText) + '</span></div>' : '',
        '  </td>',
        '  <td>',
        '    <div class="text-xs font-semibold text-mistral-ink leading-snug">' + esc(w.venue) + '</div>',
        w.publisher ? '    <div class="text-[11px] text-mistral-stone mt-0.5">' + esc(w.publisher) + '</div>' : '',
        '  </td>',
        '  <td class="whitespace-nowrap">',
        '    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-mistral-ink font-mono text-xs font-bold">',
        '      ' + SVG_CHART,
        '      <span>' + Number(w.cited_by_count || 0).toLocaleString('tr-TR') + '</span>',
        '    </span>',
        '  </td>',
        '  <td class="whitespace-nowrap">',
        '    <div class="flex flex-col items-start gap-2">',
        '      ' + oaBadge,
        '      <div class="flex items-center gap-2">',
        '        <button type="button" data-open-work="' + idx + '" class="px-3 py-1.5 rounded-lg bg-mistral-ink hover:bg-mistral-orange text-white text-xs font-semibold transition cursor-pointer">İncele & Kaynakça</button>',
        w.oa_url ? '        <a href="' + esc(w.oa_url) + '" target="_blank" rel="noopener noreferrer" title="Kaynağı / PDF Aç" class="p-1.5 rounded-lg border border-mistral-hairline text-mistral-slate hover:text-mistral-ink hover:bg-stone-100 transition">' + SVG_EXT + '</a>' : '',
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
    var chartEl = document.getElementById('dialog-citation-chart');
    var citeOut = document.getElementById('dialog-citation-output');
    var doiLink = document.getElementById('dialog-doi-link');
    var oaLink = document.getElementById('dialog-oa-link');

    if (titleEl) titleEl.textContent = w.title || '';
    if (authorsEl) authorsEl.textContent = (w.authors && w.authors.length) ? w.authors.join(', ') : 'Yazar bilgisi belirtilmemiş';
    if (instEl) instEl.textContent = ((w.institutions && w.institutions.length) ? w.institutions.join(' • ') + ' — ' : '') + (w.venue || '');
    if (absEl) absEl.textContent = w.abstract || 'Bu yayın için tam özet metni yayımcı tarafından kısıtlanmış veya OpenAlex dizininde yer almıyor.';

    if (badgesEl) {
      setHTML(
        badgesEl,
        '<span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-50 border border-orange-200 text-mistral-orange">' + esc(w.publication_year || '—') + '</span>' +
        '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-stone-100 text-mistral-ink">' + SVG_CHART + '<span>' + Number(w.cited_by_count || 0).toLocaleString('tr-TR') + ' Atıf</span></span>' +
        (w.doi ? '<span class="px-2.5 py-0.5 rounded-full text-xs font-mono bg-stone-100 text-mistral-slate">DOI: ' + esc(w.doi) + '</span>' : '')
      );
    }

    if (chartEl) {
      var counts = (w.counts_by_year || []).slice().sort(function (a, b) { return a.year - b.year; });
      if (!counts.length) {
        setHTML(chartEl, '<div class="col-span-full text-xs text-mistral-stone text-center py-4">Yıllık atıf dağılım verisi bulunmuyor.</div>');
      } else {
        var maxC = Math.max.apply(null, counts.map(function (c) { return c.cited_by_count || 1; })) || 1;
        var bars = counts.map(function (c) {
          var hPct = Math.max(12, Math.round(((c.cited_by_count || 0) / maxC) * 72));
          return [
            '<div class="flex flex-col items-center justify-end gap-1">',
            '  <span class="text-[10px] font-mono font-bold text-mistral-ink">' + Number(c.cited_by_count || 0).toLocaleString('tr-TR') + '</span>',
            '  <div class="w-full max-w-[32px] rounded-t-md bg-mistral-orange" style="height:' + hPct + 'px"></div>',
            '  <span class="text-[10px] font-mono font-medium text-mistral-stone">' + esc(c.year) + '</span>',
            '</div>'
          ].join('');
        }).join('');
        setHTML(chartEl, bars);
      }
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

  function cleanFilterToken(str) {
    return String(str || '').replace(/[,:|]/g, ' ').trim();
  }

  async function searchWorks() {
    var fTitle = document.getElementById('field-title');
    var fAuthor = document.getElementById('field-author');
    var fInst = document.getElementById('field-institution');
    var fVenue = document.getElementById('field-venue');
    var fDoi = document.getElementById('field-doi');
    var fYearFrom = document.getElementById('field-year-from');
    var fYearTo = document.getElementById('field-year-to');
    var fSort = document.getElementById('field-sort');
    var fOa = document.getElementById('field-oa');

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

    if (!title && !author && !institution && !venue && !doi && !yearFrom && !yearTo) {
      notify('Lütfen arama yapmak için en az bir alanı (Başlık, Yazar, Kurum, Dergi veya DOI) doldurun.');
      if (fTitle) fTitle.focus();
      return;
    }

    if (initial) initial.classList.add('hidden');
    if (resultsSection) resultsSection.classList.add('hidden');
    if (loading) loading.classList.remove('hidden');
    if (statsBar) statsBar.textContent = 'OpenAlex & Crossref veritabanı sorgulanıyor...';

    try {
      var filters = [];
      if (title) filters.push('title_and_abstract.search:' + title);
      if (author) filters.push('raw_author_name.search:' + author);
      if (institution) filters.push('raw_affiliation_strings.search:' + institution);
      if (doi) filters.push('doi:https://doi.org/' + doi);
      if (oaOnly) filters.push('is_oa:true');
      if (yearFrom >= 1900 && yearFrom <= 2030) filters.push('from_publication_date:' + yearFrom + '-01-01');
      if (yearTo >= 1900 && yearTo <= 2030) filters.push('to_publication_date:' + yearTo + '-12-31');

      var queryParts = ['per-page=25'];
      if (venue) {
        queryParts.push('search=' + encodeURIComponent(venue));
      }
      if (filters.length) {
        queryParts.push('filter=' + encodeURIComponent(filters.join(',')));
      }
      if (sort !== 'relevance_score:desc' || venue) {
        queryParts.push('sort=' + encodeURIComponent(sort));
      }

      var oaUrl = 'https://api.openalex.org/works?' + queryParts.join('&');
      var resp = await fetch(oaUrl, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) throw new Error('OpenAlex HTTP ' + resp.status);
      var data = await resp.json();
      var works = Array.isArray(data.results) ? data.results.map(normalizeOpenAlexWork) : [];

      if (venue) {
        var vLow = venue.toLowerCase();
        var vFiltered = works.filter(function (w) {
          return (w.venue || '').toLowerCase().includes(vLow) || (w.publisher || '').toLowerCase().includes(vLow);
        });
        if (vFiltered.length) works = vFiltered;
      }

      var totalCount = (data.meta && data.meta.count) || works.length;
      currentWorks = works;
      updateSummaryStats(works, totalCount);
      renderTable(works);
      if (badgeEl) badgeEl.textContent = 'OpenAlex + Crossref Canlı';
      if (statsBar) {
        statsBar.textContent = 'Toplam ' + Number(totalCount).toLocaleString('tr-TR') + ' eşleşmeden ' + works.length + ' yayın tabloda listeleniyor.';
      }
    } catch (_) {
      try {
        var qs = new URLSearchParams({
          title: title,
          author: author,
          institution: institution,
          venue: venue,
          doi: doi,
          yearFrom: String(yearFrom || ''),
          yearTo: String(yearTo || ''),
          sort: sort,
          oa: oaOnly ? '1' : '0'
        });
        var apiResp = await fetch('/api/akademik/works?' + qs.toString());
        var apiData = await apiResp.json();
        currentWorks = apiData.results || FALLBACK_WORKS;
        updateSummaryStats(currentWorks, (apiData.meta && apiData.meta.count) || currentWorks.length);
        renderTable(currentWorks);
        if (statsBar) statsBar.textContent = 'Akademik arşiv sonuçları tabloya aktarıldı (' + currentWorks.length + ' yayın).';
      } catch (_err2) {
        currentWorks = FALLBACK_WORKS;
        updateSummaryStats(currentWorks, currentWorks.length);
        renderTable(currentWorks);
        if (statsBar) statsBar.textContent = 'Çevrimdışı örnek veri seti gösteriliyor (' + currentWorks.length + ' yayın).';
      }
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
    // Sayfa yüklenirken otomatik API isteği ATILMAZ.
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
