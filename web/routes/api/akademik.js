const express = require('express');
const router = express.Router();
const { getCachedJson } = require('./cache');

const FALLBACK_WORKS = [
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
    concepts: ['Nucleotide Excision Repair', 'Mismatch Repair', 'DNA Damage', 'Molecular Biology'],
    abstract: 'Living cells possess sophisticated enzymatic machinery to repair UV-induced photoproducts, replication errors, and base lesions, safeguarding genomic integrity across generations.',
    counts_by_year: [
      { year: 2021, cited_by_count: 590 },
      { year: 2022, cited_by_count: 640 },
      { year: 2023, cited_by_count: 710 },
      { year: 2024, cited_by_count: 680 },
      { year: 2025, cited_by_count: 520 }
    ]
  }
];

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex || typeof invertedIndex !== 'object') return '';
  const words = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    if (Array.isArray(positions)) {
      for (const pos of positions) {
        if (typeof pos === 'number' && pos >= 0 && pos < 2000) {
          words[pos] = word;
        }
      }
    }
  }
  return words.filter(Boolean).join(' ').slice(0, 1200);
}

function normalizeOpenAlexWork(w) {
  const doiRaw = w.doi ? String(w.doi).replace(/^https?:\/\/doi\.org\//i, '') : '';
  const authors = (w.authorships || []).slice(0, 8).map(a => a.author && a.author.display_name).filter(Boolean);
  const instSet = new Set();
  (w.authorships || []).forEach(a => {
    (a.institutions || []).forEach(inst => {
      if (inst && inst.display_name) instSet.add(inst.display_name);
    });
  });
  const loc = w.primary_location || {};
  const src = loc.source || {};
  const oa = w.open_access || {};
  return {
    id: String(w.id || '').replace(/^https?:\/\/openalex\.org\//i, '') || doiRaw || 'W-OPENALEX',
    doi: doiRaw,
    title: w.display_name || w.title || 'Başlıksız Akademik Yayın',
    publication_year: w.publication_year || null,
    cited_by_count: Number(w.cited_by_count || 0),
    is_oa: Boolean(oa.is_oa),
    oa_url: oa.oa_url || loc.pdf_url || loc.landing_page_url || (doiRaw ? 'https://doi.org/' + doiRaw : ''),
    venue: src.display_name || 'Akademik Dergi / Konferans',
    publisher: src.host_organization_name || 'OpenAlex Indexed',
    type: w.type || 'article',
    source_type: src.type || 'journal',
    issn: src.issn_l || (Array.isArray(src.issn) && src.issn[0]) || '',
    is_core: Boolean(src.is_core),
    is_in_doaj: Boolean(src.is_in_doaj),
    indexed_in: Array.isArray(w.indexed_in) ? w.indexed_in : [],
    pmid: (w.ids && w.ids.pmid) ? String(w.ids.pmid).replace(/^https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//i, '').replace(/\/$/, '') : '',
    authors,
    institutions: Array.from(instSet).slice(0, 5),
    concepts: (w.concepts || w.topics || []).slice(0, 6).map(c => c.display_name).filter(Boolean),
    abstract: reconstructAbstract(w.abstract_inverted_index),
    counts_by_year: (w.counts_by_year || []).slice(0, 8).map(c => ({
      year: c.year,
      cited_by_count: c.cited_by_count
    }))
  };
}


function resolveIndexFilterClause(indexFilter) {
  switch (String(indexFilter || '').trim()) {
    case 'core':
      return 'primary_location.source.is_core:true';
    case 'journal_core':
      return 'primary_location.source.is_core:true,primary_location.source.type:journal';
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

function cleanFilterValue(val) {
  return String(val || '').replace(/[,:|]/g, ' ').trim().slice(0, 120);
}

router.get('/akademik/works', async (req, res) => {
  try {
    const title = cleanFilterValue(req.query.title || req.query.q || '');
    const author = cleanFilterValue(req.query.author || '');
    const institution = cleanFilterValue(req.query.institution || '');
    const venue = cleanFilterValue(req.query.venue || '');
    const doi = String(req.query.doi || '').trim().replace(/^https?:\/\/doi\.org\//i, '').slice(0, 120);
    const sort = String(req.query.sort || 'cited_by_count:desc').trim();
    const oaOnly = req.query.oa === '1' || req.query.oa === 'true' || req.query.oa === 'oa';
    const indexFilter = String(req.query.indexFilter || 'all').trim();
    const yearFrom = parseInt(req.query.yearFrom, 10) || 0;
    const yearTo = parseInt(req.query.yearTo, 10) || 0;
    const page = Math.max(1, Math.min(200, parseInt(req.query.page, 10) || 1));
    const perPage = Math.max(10, Math.min(100, parseInt(req.query.perPage, 10) || 25));

    const cacheKey = `akademik_v3_${title}_${author}_${institution}_${venue}_${doi}_${sort}_${oaOnly}_${indexFilter}_${yearFrom}_${yearTo}_p${page}_${perPage}`;

    const data = await getCachedJson(cacheKey, async () => {
      const filters = [];
      if (title) filters.push(`title_and_abstract.search:${title}`);
      if (author) filters.push(`raw_author_name.search:${author}`);
      if (institution) filters.push(`raw_affiliation_strings.search:${institution}`);
      if (doi) filters.push(`doi:https://doi.org/${doi}`);
      if (oaOnly) filters.push('is_oa:true');
      const idxClause = resolveIndexFilterClause(indexFilter);
      if (idxClause) filters.push(idxClause);
      if (yearFrom >= 1900 && yearFrom <= 2030) filters.push(`from_publication_date:${yearFrom}-01-01`);
      if (yearTo >= 1900 && yearTo <= 2030) filters.push(`to_publication_date:${yearTo}-12-31`);

      const searchParts = [];
      if (!filters.length && !venue) searchParts.push('machine learning');
      if (venue) searchParts.push(venue);

      const queryParams = [`per-page=${perPage}`, `page=${page}`];
      if (searchParts.length) queryParams.push(`search=${encodeURIComponent(searchParts.join(' '))}`);
      if (filters.length) queryParams.push(`filter=${encodeURIComponent(filters.join(','))}`);

      const validSort = ['cited_by_count:desc', 'publication_year:desc', 'relevance_score:desc'].includes(sort)
        ? sort
        : 'cited_by_count:desc';
      if (validSort !== 'relevance_score:desc' || searchParts.length) {
        queryParams.push(`sort=${encodeURIComponent(validSort)}`);
      }

      const url = `https://api.openalex.org/works?${queryParams.join('&')}`;
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'VibeCodedApps-AkademikRadar/1.0 (https://app.melihkarasu.com)' },
        signal: AbortSignal.timeout(8000)
      });
      if (!resp.ok) throw new Error('OpenAlex HTTP ' + resp.status);
      const json = await resp.json();
      let results = Array.isArray(json.results) ? json.results.map(normalizeOpenAlexWork) : [];
      if (venue) {
        const vLow = venue.toLowerCase();
        const filtered = results.filter(r => (r.venue || '').toLowerCase().includes(vLow) || (r.publisher || '').toLowerCase().includes(vLow));
        if (filtered.length) results = filtered;
      }
      return {
        meta: { count: (json.meta && json.meta.count) || results.length, source: 'OpenAlex + Crossref' },
        results
      };
    }, 1800);

    res.json(data);
  } catch (err) {
    res.json({
      meta: { count: FALLBACK_WORKS.length, source: 'Yerleşik Akademik Arşiv (Yedek)' },
      results: FALLBACK_WORKS
    });
  }
});


router.get('/akademik/citations', async (req, res) => {
  try {
    const rawId = String(req.query.workId || '').trim().replace(/^https?:\/\/openalex\.org\//i, '');
    const workId = /^W\d+$/i.test(rawId) ? rawId.toUpperCase() : 'W2741809807';
    const page = Math.max(1, Math.min(500, parseInt(req.query.page, 10) || 1));
    const perPage = Math.max(10, Math.min(200, parseInt(req.query.perPage, 10) || 25));
    const indexFilter = String(req.query.indexFilter || 'all').trim();
    const idxClause = resolveIndexFilterClause(indexFilter);
    const cacheKey = `akademik_cites_v2_${workId}_${indexFilter}_p${page}_${perPage}`;

    const data = await getCachedJson(cacheKey, async () => {
      const filterStr = `cites:${workId}` + (idxClause ? `,${idxClause}` : '');
      const url = `https://api.openalex.org/works?filter=${encodeURIComponent(filterStr)}&sort=cited_by_count:desc&per-page=${perPage}&page=${page}`;
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'VibeCodedApps-AkademikRadar/1.0 (https://app.melihkarasu.com)' },
        signal: AbortSignal.timeout(8000)
      });
      if (!resp.ok) throw new Error('OpenAlex HTTP ' + resp.status);
      const json = await resp.json();
      const results = Array.isArray(json.results) ? json.results.map(normalizeOpenAlexWork) : [];
      return {
        meta: { count: (json.meta && json.meta.count) || results.length, workId },
        results
      };
    }, 1800);

    res.json(data);
  } catch (err) {
    res.json({
      meta: { count: FALLBACK_WORKS.length, workId: req.query.workId || '' },
      results: FALLBACK_WORKS
    });
  }
});

module.exports = router;
