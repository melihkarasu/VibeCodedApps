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
      venue: src.display_name || 'Akademik Dergi / Konferans',
      publisher: src.host_organization_name || 'OpenAlex',
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
    // Default APA 7
    var apaAuthors = authors.slice(0, 6).join(', ') + (authors.length > 6 ? ' ... ' + authors[authors.length - 1] : '');
    return apaAuthors + ' (' + year + '). ' + title + '. ' + venue + '.' + (doiPart ? ' ' + doiPart : '');
  }

  function updateSummaryStats(works, totalCount) {
    var totalEl = document.getElementById('stat-total-works');
    var citEl = document.getElementById('stat-total-citations');
    var oaEl = document.getElementById('stat-oa-ratio');
    var yearEl = document.getElementById('stat-median-year');

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

  function renderGrid(works) {
    var grid = document.getElementById('akademik-grid');
    var loading = document.getElementById('akademik-loading');
    if (loading) loading.classList.add('hidden');
    if (!grid) return;
    grid.classList.remove('hidden');

    if (!works || !works.length) {
      setHTML(grid, '<div class="col-span-full bg-white rounded-2xl border border-mistral-border p-10 text-center text-mistral-slate text-sm">Arama kriterlerinize uygun akademik yayın bulunamadı.</div>');
      return;
    }

    var cardsHtml = works.map(function (w, idx) {
      var oaBadge = w.is_oa
        ? '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">🔓 Açık Erişim PDF</span>'
        : '<span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-mistral-stone">Kapalı Erişim</span>';
      var authorsText = (w.authors && w.authors.length) ? w.authors.slice(0, 4).join(', ') + (w.authors.length > 4 ? ' +' + (w.authors.length - 4) : '') : 'Yazar bilgisi yok';
      var instText = (w.institutions && w.institutions.length) ? w.institutions.slice(0, 2).join(' • ') : w.publisher || '';
      var conceptsHtml = (w.concepts || []).slice(0, 4).map(function (c) {
        return '<span class="px-2 py-0.5 rounded-md bg-stone-100 text-mistral-slate text-[11px] font-medium">' + esc(c) + '</span>';
      }).join('');
      var abstractPreview = w.abstract
        ? esc(w.abstract.slice(0, 200)) + (w.abstract.length > 200 ? '…' : '')
        : 'Bu yayın için OpenAlex/Crossref dizininde açık özet metni bulunmuyor; tam metin ve kaynakça detayları için inceleyin.';

      return [
        '<article class="bg-white rounded-2xl border border-mistral-border p-5 shadow-xs hover:border-amber-500/50 transition flex flex-col justify-between gap-4">',
        '  <div>',
        '    <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">',
        '      <div class="flex flex-wrap items-center gap-1.5">',
        '        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">' + esc(w.publication_year || '—') + '</span>',
        '        ' + oaBadge,
        '      </div>',
        '      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-mistral-ink text-xs font-bold" title="Toplam Atıf Sayısı">',
        '        📚 ' + Number(w.cited_by_count || 0).toLocaleString('tr-TR') + ' atıf',
        '      </span>',
        '    </div>',
        '    <h3 class="text-base font-bold text-mistral-ink leading-snug mb-1.5">' + esc(w.title) + '</h3>',
        '    <p class="text-xs font-medium text-mistral-slate mb-1">' + esc(authorsText) + '</p>',
        instText ? '    <p class="text-[11px] text-mistral-stone mb-2.5">🏛️ ' + esc(instText) + ' • <span class="font-medium">' + esc(w.venue) + '</span></p>' : '',
        '    <p class="text-xs text-mistral-slate leading-relaxed mb-3 line-clamp-3">' + abstractPreview + '</p>',
        conceptsHtml ? '    <div class="flex flex-wrap gap-1.5 mb-2">' + conceptsHtml + '</div>' : '',
        '  </div>',
        '  <div class="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">',
        '    <button type="button" data-open-work="' + idx + '" class="px-3.5 py-1.5 rounded-xl bg-mistral-ink hover:bg-amber-600 text-white text-xs font-semibold transition cursor-pointer">Atıf Ağı & Kaynakça (APA/BibTeX)</button>',
        w.oa_url ? '    <a href="' + esc(w.oa_url) + '" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-emerald-700 hover:underline">PDF / Kaynak ↗</a>' : '',
        '  </div>',
        '</article>'
      ].join('\n');
    }).join('\n');

    setHTML(grid, cardsHtml);
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
        '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700">' + esc(w.publication_year || '—') + '</span>' +
        '<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-mistral-ink">📚 ' + Number(w.cited_by_count || 0).toLocaleString('tr-TR') + ' Atıf</span>' +
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
            '  <span class="text-[10px] font-bold text-mistral-ink">' + Number(c.cited_by_count || 0).toLocaleString('tr-TR') + '</span>',
            '  <div class="w-full max-w-[32px] rounded-t-md bg-amber-500/80" style="height:' + hPct + 'px"></div>',
            '  <span class="text-[10px] font-medium text-mistral-stone">' + esc(c.year) + '</span>',
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

  async function searchWorks() {
    var qInput = document.getElementById('akademik-query');
    var sortSel = document.getElementById('akademik-sort');
    var yearSel = document.getElementById('akademik-year');
    var oaCheck = document.getElementById('akademik-oa-only');
    var statsBar = document.getElementById('akademik-stats-bar');
    var loading = document.getElementById('akademik-loading');
    var grid = document.getElementById('akademik-grid');

    var q = (qInput && qInput.value ? qInput.value.trim() : '') || 'Large Language Models Transformer';
    var sort = (sortSel && sortSel.value) || 'cited_by_count:desc';
    var yearFrom = parseInt(yearSel && yearSel.value ? yearSel.value : '0', 10) || 0;
    var oaOnly = Boolean(oaCheck && oaCheck.checked);

    if (loading) loading.classList.remove('hidden');
    if (grid) grid.classList.add('hidden');
    if (statsBar) statsBar.textContent = '"' + q + '" için OpenAlex & Crossref taranıyor...';

    try {
      // 1) Doğrudan CORS-açık OpenAlex API çağrısı (hem monorepo hem GitHub Pages standalone uyumlu)
      var filters = [];
      if (oaOnly) filters.push('is_oa:true');
      if (yearFrom >= 1900) filters.push('from_publication_date:' + yearFrom + '-01-01');
      var filterStr = filters.length ? '&filter=' + encodeURIComponent(filters.join(',')) : '';
      var oaUrl = 'https://api.openalex.org/works?search=' + encodeURIComponent(q) + '&sort=' + encodeURIComponent(sort) + '&per-page=18' + filterStr;

      var resp = await fetch(oaUrl, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) throw new Error('OpenAlex HTTP ' + resp.status);
      var data = await resp.json();
      var works = Array.isArray(data.results) ? data.results.map(normalizeOpenAlexWork) : [];
      var totalCount = (data.meta && data.meta.count) || works.length;

      currentWorks = works;
      updateSummaryStats(works, totalCount);
      renderGrid(works);
      if (statsBar) {
        statsBar.textContent = 'Toplam ' + Number(totalCount).toLocaleString('tr-TR') + ' yayından ilk ' + works.length + ' sonuç gösteriliyor (OpenAlex Canlı)';
      }
    } catch (_) {
      try {
        var apiResp = await fetch('/api/akademik/works?q=' + encodeURIComponent(q) + '&sort=' + encodeURIComponent(sort) + '&yearFrom=' + yearFrom + '&oa=' + (oaOnly ? '1' : '0'));
        var apiData = await apiResp.json();
        currentWorks = apiData.results || FALLBACK_WORKS;
        updateSummaryStats(currentWorks, (apiData.meta && apiData.meta.count) || currentWorks.length);
        renderGrid(currentWorks);
        if (statsBar) statsBar.textContent = 'Akademik arşiv sonuçları listelendi (' + currentWorks.length + ' yayın)';
      } catch (_err2) {
        currentWorks = FALLBACK_WORKS;
        updateSummaryStats(currentWorks, currentWorks.length);
        renderGrid(currentWorks);
        if (statsBar) statsBar.textContent = 'Çevrimdışı örnek veri seti gösteriliyor (' + currentWorks.length + ' yayın)';
      }
    }
  }

  function init() {
    var form = document.getElementById('akademik-search-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        searchWorks();
      });
    }

    var oaCheck = document.getElementById('akademik-oa-only');
    if (oaCheck) oaCheck.addEventListener('change', searchWorks);

    var sortSel = document.getElementById('akademik-sort');
    if (sortSel) sortSel.addEventListener('change', searchWorks);

    var yearSel = document.getElementById('akademik-year');
    if (yearSel) yearSel.addEventListener('change', searchWorks);

    document.querySelectorAll('.akademik-topic-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var qInput = document.getElementById('akademik-query');
        if (qInput) {
          qInput.value = btn.getAttribute('data-quick-query') || '';
          searchWorks();
        }
      });
    });

    var grid = document.getElementById('akademik-grid');
    if (grid) {
      grid.addEventListener('click', function (e) {
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
            notify('Kaynakça panoya kopyalandı!');
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

    searchWorks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
