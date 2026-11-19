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
    s2Id: '',
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
    })),
    sources: ['openalex']
  };
}

function normalizeS2Work(p) {
  const ext = p.externalIds || {};
  const doiRaw = ext.DOI ? String(ext.DOI).trim() : '';
  const arxivId = ext.ArXiv ? String(ext.ArXiv).trim() : '';
  const pmid = ext.PubMed ? String(ext.PubMed).trim() : '';
  const oaPdf = p.openAccessPdf && p.openAccessPdf.url ? p.openAccessPdf.url : '';
  const indexed = [];
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
    pmid,
    authors: (p.authors || []).slice(0, 8).map(a => a && a.name).filter(Boolean),
    institutions: [],
    concepts: Array.isArray(p.fieldsOfStudy) ? p.fieldsOfStudy.slice(0, 5) : [],
    abstract: p.abstract ? String(p.abstract).slice(0, 1200) : '',
    counts_by_year: [],
    sources: ['semanticscholar']
  };
}

function normalizeCrossrefWork(item) {
  const doiRaw = item.DOI ? String(item.DOI).trim() : '';
  const title = Array.isArray(item.title) && item.title[0] ? String(item.title[0]) : 'Başlıksız Akademik Yayın';
  const issued = (item.issued && item.issued['date-parts'] && item.issued['date-parts'][0]) || [];
  const pubYear = issued[0] ? Number(issued[0]) : null;
  const authors = (item.author || []).slice(0, 8).map(a => [a.given, a.family].filter(Boolean).join(' ').trim()).filter(Boolean);
  const instSet = new Set();
  (item.author || []).forEach(a => {
    (a.affiliation || []).forEach(af => {
      if (af && af.name) instSet.add(af.name);
    });
  });
  const venue = (Array.isArray(item['container-title']) && item['container-title'][0]) || item.publisher || 'Crossref DOI Kaydı';
  const issn = (Array.isArray(item.ISSN) && item.ISSN[0]) || '';
  const links = Array.isArray(item.link) ? item.link : [];
  const pdfLink = links.find(l => l && /pdf/i.test(l['content-type'] || '')) || links[0];
  const abstractRaw = item.abstract ? String(item.abstract).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1200) : '';
  return {
    id: doiRaw ? 'CR:' + doiRaw : 'CR-WORK',
    s2Id: '',
    doi: doiRaw,
    title,
    publication_year: pubYear,
    cited_by_count: Number(item['is-referenced-by-count'] || 0),
    is_oa: Boolean(pdfLink && pdfLink.URL),
    oa_url: (pdfLink && pdfLink.URL) || item.URL || (doiRaw ? 'https://doi.org/' + doiRaw : ''),
    venue,
    publisher: item.publisher || 'Crossref',
    type: item.type || 'article',
    source_type: 'journal',
    issn,
    is_core: false,
    is_in_doaj: false,
    indexed_in: ['crossref'],
    pmid: '',
    authors,
    institutions: Array.from(instSet).slice(0, 4),
    concepts: Array.isArray(item.subject) ? item.subject.slice(0, 5) : [],
    abstract: abstractRaw,
    counts_by_year: [],
    sources: ['crossref']
  };
}

function mergeWorksLists(oaList, s2List, crList, sort) {
  const byKey = new Map();
  let duplicatesMerged = 0;

  function makeKey(w) {
    if (w.doi) return 'doi:' + w.doi.toLowerCase().trim();
    const normTitle = String(w.title || '').toLowerCase().replace(/[^a-z0-9çğıöşü]+/gi, '').slice(0, 80);
    return 't:' + normTitle;
  }

  function addOrMerge(w) {
    const key = makeKey(w);
    if (!key || key === 't:') return;
    if (!byKey.has(key)) {
      byKey.set(key, Object.assign({}, w, { sources: Array.from(new Set(w.sources || [])) }));
      return;
    }
    duplicatesMerged += 1;
    const existing = byKey.get(key);
    const mergedSources = Array.from(new Set([...(existing.sources || []), ...(w.sources || [])]));
    existing.sources = mergedSources;
    if (!existing.s2Id && w.s2Id) existing.s2Id = w.s2Id;
    if (!existing.doi && w.doi) existing.doi = w.doi;
    if ((!existing.id || existing.id.startsWith('S2:') || existing.id.startsWith('CR:')) && w.id && /^W\d+$/i.test(w.id)) {
      existing.id = w.id;
    }
    if (Number(w.cited_by_count || 0) > Number(existing.cited_by_count || 0)) {
      existing.cited_by_count = w.cited_by_count;
    }
    if (!existing.abstract && w.abstract) existing.abstract = w.abstract;
    if (!existing.is_oa && w.is_oa) {
      existing.is_oa = true;
      if (w.oa_url) existing.oa_url = w.oa_url;
    }
    if (!existing.issn && w.issn) existing.issn = w.issn;
    if (!existing.is_core && w.is_core) existing.is_core = true;
    if (!existing.is_in_doaj && w.is_in_doaj) existing.is_in_doaj = true;
    existing.indexed_in = Array.from(new Set([...(existing.indexed_in || []), ...(w.indexed_in || [])]));
    if ((!existing.authors || !existing.authors.length) && w.authors && w.authors.length) existing.authors = w.authors;
    if ((!existing.institutions || !existing.institutions.length) && w.institutions && w.institutions.length) existing.institutions = w.institutions;
    if ((!existing.concepts || !existing.concepts.length) && w.concepts && w.concepts.length) existing.concepts = w.concepts;
  }

  (oaList || []).forEach(addOrMerge);
  (s2List || []).forEach(addOrMerge);
  (crList || []).forEach(addOrMerge);

  const merged = Array.from(byKey.values());
  if (sort === 'publication_year:desc') {
    merged.sort((a, b) => (Number(b.publication_year || 0) - Number(a.publication_year || 0)) || (Number(b.cited_by_count || 0) - Number(a.cited_by_count || 0)));
  } else if (sort === 'cited_by_count:desc') {
    merged.sort((a, b) => Number(b.cited_by_count || 0) - Number(a.cited_by_count || 0));
  }
  return { merged, duplicatesMerged };
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

  const cacheKey = `akademik_multi_v4_${title}_${author}_${institution}_${venue}_${doi}_${sort}_${oaOnly}_${indexFilter}_${yearFrom}_${yearTo}_p${page}_${perPage}`;

  try {
    const data = await getCachedJson(cacheKey, async () => {
      // 1) OpenAlex promise
      const runOpenAlex = async () => {
        const t0 = Date.now();
        try {
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
          const validSort = ['cited_by_count:desc', 'publication_year:desc', 'relevance_score:desc'].includes(sort) ? sort : 'cited_by_count:desc';
          if (validSort !== 'relevance_score:desc' || searchParts.length) queryParams.push(`sort=${encodeURIComponent(validSort)}`);
          const url = `https://api.openalex.org/works?${queryParams.join('&')}`;
          const resp = await fetch(url, {
            headers: { 'User-Agent': 'VibeCodedApps-AkademikRadar/1.0 (https://app.melihkarasu.com)' },
            signal: AbortSignal.timeout(7500)
          });
          const ms = Date.now() - t0;
          if (!resp.ok) {
            return { provider: 'OpenAlex', key: 'openalex', ok: false, status: resp.status, ms, count: 0, total: 0, note: `HTTP ${resp.status} hatası döndü`, items: [] };
          }
          const json = await resp.json();
          const items = Array.isArray(json.results) ? json.results.map(normalizeOpenAlexWork) : [];
          const total = (json.meta && json.meta.count) || items.length;
          return { provider: 'OpenAlex', key: 'openalex', ok: true, status: 200, ms, count: items.length, total, note: `${items.length} kayıt alındı (Toplam ${Number(total).toLocaleString('tr-TR')})`, items };
        } catch (e) {
          return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: e.message || 'Zaman aşımı / Ağ hatası', items: [] };
        }
      };

      // 2) Semantic Scholar promise (API key'siz)
      const runS2 = async () => {
        const t0 = Date.now();
        try {
          const fields = 'paperId,externalIds,title,year,citationCount,isOpenAccess,openAccessPdf,venue,publicationVenue,journal,publicationTypes,fieldsOfStudy,abstract,authors,url';
          let url;
          if (doi) {
            url = `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(doi)}?fields=${fields}`;
          } else {
            const qText = [title, author, institution, venue].filter(Boolean).join(' ').trim() || 'machine learning';
            const offset = (page - 1) * perPage;
            const yearParam = (yearFrom || yearTo) ? `&year=${yearFrom || 1900}-${yearTo || 2030}` : '';
            const oaParam = oaOnly ? '&openAccessPdf' : '';
            url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(qText)}&limit=${Math.min(perPage, 50)}&offset=${offset}${yearParam}${oaParam}&fields=${fields}`;
          }
          const resp = await fetch(url, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'VibeCodedApps-AkademikRadar/1.0' },
            signal: AbortSignal.timeout(7500)
          });
          const ms = Date.now() - t0;
          if (!resp.ok) {
            const note = resp.status === 429
              ? 'HTTP 429 (API Key olmadan ortak hız sınırı aşıldı)'
              : (resp.status === 404 ? 'DOI Semantic Scholar dizininde bulunamadı' : `HTTP ${resp.status} hatası`);
            return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: resp.status, ms, count: 0, total: 0, note, items: [] };
          }
          const json = await resp.json();
          const rawList = doi ? (json && json.paperId ? [json] : []) : (Array.isArray(json.data) ? json.data : []);
          const items = rawList.map(normalizeS2Work);
          const total = doi ? items.length : Number(json.total || items.length);
          return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: true, status: 200, ms, count: items.length, total, note: `${items.length} kayıt alındı (Key'siz erişim)`, items };
        } catch (e) {
          return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: e.message || 'Zaman aşımı / Ağ hatası', items: [] };
        }
      };

      // 3) Crossref promise
      const runCrossref = async () => {
        const t0 = Date.now();
        try {
          let url;
          if (doi) {
            url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
          } else {
            const qp = [`rows=${Math.min(perPage, 40)}`, `offset=${(page - 1) * perPage}`];
            if (title) qp.push(`query.title=${encodeURIComponent(title)}`);
            if (author) qp.push(`query.author=${encodeURIComponent(author)}`);
            if (institution) qp.push(`query.affiliation=${encodeURIComponent(institution)}`);
            if (venue) qp.push(`query.container-title=${encodeURIComponent(venue)}`);
            if (!title && !author && !institution && !venue) qp.push('query.bibliographic=machine+learning');
            const crFilters = [];
            if (yearFrom >= 1900 && yearFrom <= 2030) crFilters.push(`from-pub-date:${yearFrom}-01-01`);
            if (yearTo >= 1900 && yearTo <= 2030) crFilters.push(`until-pub-date:${yearTo}-12-31`);
            if (crFilters.length) qp.push(`filter=${encodeURIComponent(crFilters.join(','))}`);
            if (sort === 'cited_by_count:desc') qp.push('sort=is-referenced-by-count&order=desc');
            else if (sort === 'publication_year:desc') qp.push('sort=published&order=desc');
            url = `https://api.crossref.org/works?${qp.join('&')}`;
          }
          const resp = await fetch(url, {
            headers: { 'User-Agent': 'VibeCodedApps-AkademikRadar/1.0 (mailto:info@melihkarasu.com)' },
            signal: AbortSignal.timeout(7500)
          });
          const ms = Date.now() - t0;
          if (!resp.ok) {
            return { provider: 'Crossref', key: 'crossref', ok: false, status: resp.status, ms, count: 0, total: 0, note: `HTTP ${resp.status} hatası`, items: [] };
          }
          const json = await resp.json();
          const msg = json.message || {};
          const rawList = doi ? (msg.DOI ? [msg] : []) : (Array.isArray(msg.items) ? msg.items : []);
          const items = rawList.map(normalizeCrossrefWork);
          const total = doi ? items.length : Number(msg['total-results'] || items.length);
          return { provider: 'Crossref', key: 'crossref', ok: true, status: 200, ms, count: items.length, total, note: `${items.length} resmi DOI kaydı alındı`, items };
        } catch (e) {
          return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: e.message || 'Zaman aşımı / Ağ hatası', items: [] };
        }
      };

      const [oaRes, s2Res, crRes] = await Promise.all([runOpenAlex(), runS2(), runCrossref()]);
      const { merged, duplicatesMerged } = mergeWorksLists(oaRes.items, s2Res.items, crRes.items, sort);

      let results = merged;
      if (oaOnly) {
        const oaFiltered = results.filter(r => r.is_oa);
        if (oaFiltered.length) results = oaFiltered;
      }
      if (venue) {
        const vLow = venue.toLowerCase();
        const vFiltered = results.filter(r => (r.venue || '').toLowerCase().includes(vLow) || (r.publisher || '').toLowerCase().includes(vLow));
        if (vFiltered.length) results = vFiltered;
      }

      const providers = [oaRes, s2Res, crRes].map(({ items, ...meta }) => meta);
      const maxTotal = Math.max(oaRes.total || 0, crRes.total || 0, s2Res.total || 0, results.length);
      const anyOk = providers.some(p => p.ok);

      return {
        meta: {
          count: maxTotal,
          duplicatesMerged,
          source: providers.filter(p => p.ok).map(p => p.provider).join(' + ') || 'Yedek Veri Seti'
        },
        providers,
        results: anyOk && results.length ? results : FALLBACK_WORKS
      };
    }, 900);

    res.json(data);
  } catch (err) {
    res.json({
      meta: { count: FALLBACK_WORKS.length, duplicatesMerged: 0, source: 'Yerleşik Akademik Arşiv (Yedek)' },
      providers: [
        { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'Sunucu hatası' },
        { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'Sunucu hatası' },
        { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'Sunucu hatası' }
      ],
      results: FALLBACK_WORKS
    });
  }
});

router.get('/akademik/citations', async (req, res) => {
  const rawId = String(req.query.workId || '').trim().replace(/^https?:\/\/openalex\.org\//i, '');
  const doi = String(req.query.doi || '').trim().replace(/^https?:\/\/doi\.org\//i, '');
  const s2Id = String(req.query.s2Id || '').trim();
  const workId = /^W\d+$/i.test(rawId) ? rawId.toUpperCase() : '';
  const page = Math.max(1, Math.min(500, parseInt(req.query.page, 10) || 1));
  const perPage = Math.max(10, Math.min(200, parseInt(req.query.perPage, 10) || 25));
  const indexFilter = String(req.query.indexFilter || 'all').trim();
  const idxClause = resolveIndexFilterClause(indexFilter);
  const cacheKey = `akademik_cites_multi_v3_${workId}_${doi}_${s2Id}_${indexFilter}_p${page}_${perPage}`;

  try {
    const data = await getCachedJson(cacheKey, async () => {
      const runOpenAlexCites = async () => {
        const t0 = Date.now();
        if (!workId) return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'OpenAlex Work ID yok', items: [] };
        try {
          const filterStr = `cites:${workId}` + (idxClause ? `,${idxClause}` : '');
          const url = `https://api.openalex.org/works?filter=${encodeURIComponent(filterStr)}&sort=cited_by_count:desc&per-page=${perPage}&page=${page}`;
          const resp = await fetch(url, {
            headers: { 'User-Agent': 'VibeCodedApps-AkademikRadar/1.0 (https://app.melihkarasu.com)' },
            signal: AbortSignal.timeout(7500)
          });
          const ms = Date.now() - t0;
          if (!resp.ok) return { provider: 'OpenAlex', key: 'openalex', ok: false, status: resp.status, ms, count: 0, total: 0, note: `HTTP ${resp.status}`, items: [] };
          const json = await resp.json();
          const items = Array.isArray(json.results) ? json.results.map(normalizeOpenAlexWork) : [];
          const total = (json.meta && json.meta.count) || items.length;
          return { provider: 'OpenAlex', key: 'openalex', ok: true, status: 200, ms, count: items.length, total, note: `${items.length} atıf alındı`, items };
        } catch (e) {
          return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: e.message || 'Hata', items: [] };
        }
      };

      const runS2Cites = async () => {
        const t0 = Date.now();
        const paperRef = s2Id || (doi ? `DOI:${doi}` : '');
        if (!paperRef) return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'DOI/S2 ID bulunamadı', items: [] };
        try {
          const fields = 'paperId,externalIds,title,year,citationCount,isOpenAccess,openAccessPdf,venue,publicationVenue,authors,url';
          const offset = (page - 1) * perPage;
          const url = `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(paperRef)}/citations?offset=${offset}&limit=${Math.min(perPage, 100)}&fields=${fields}`;
          const resp = await fetch(url, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'VibeCodedApps-AkademikRadar/1.0' },
            signal: AbortSignal.timeout(7500)
          });
          const ms = Date.now() - t0;
          if (!resp.ok) {
            const note = resp.status === 429 ? 'HTTP 429 (Key\'siz hız sınırı)' : `HTTP ${resp.status}`;
            return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: resp.status, ms, count: 0, total: 0, note, items: [] };
          }
          const json = await resp.json();
          const rawList = Array.isArray(json.data) ? json.data.map(x => x.citingPaper).filter(Boolean) : [];
          const items = rawList.map(normalizeS2Work);
          return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: true, status: 200, ms, count: items.length, total: items.length, note: `${items.length} atıf alındı`, items };
        } catch (e) {
          return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: e.message || 'Hata', items: [] };
        }
      };

      const runCrossrefMeta = async () => {
        const t0 = Date.now();
        if (!doi) return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'DOI yok', items: [] };
        try {
          const resp = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
            headers: { 'User-Agent': 'VibeCodedApps-AkademikRadar/1.0 (mailto:info@melihkarasu.com)' },
            signal: AbortSignal.timeout(6000)
          });
          const ms = Date.now() - t0;
          if (!resp.ok) return { provider: 'Crossref', key: 'crossref', ok: false, status: resp.status, ms, count: 0, total: 0, note: `HTTP ${resp.status}`, items: [] };
          const json = await resp.json();
          const totalCites = Number((json.message && json.message['is-referenced-by-count']) || 0);
          return { provider: 'Crossref', key: 'crossref', ok: true, status: 200, ms, count: 0, total: totalCites, note: `Toplam ${totalCites.toLocaleString('tr-TR')} atıf sayacı doğrulandı (açık liste döndürmez)`, items: [] };
        } catch (e) {
          return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: e.message || 'Hata', items: [] };
        }
      };

      const [oaRes, s2Res, crRes] = await Promise.all([runOpenAlexCites(), runS2Cites(), runCrossrefMeta()]);
      const { merged, duplicatesMerged } = mergeWorksLists(oaRes.items, s2Res.items, [], 'cited_by_count:desc');
      const providers = [oaRes, s2Res, crRes].map(({ items, ...meta }) => meta);

      return {
        meta: {
          count: Math.max(oaRes.total || 0, s2Res.total || 0, merged.length),
          duplicatesMerged,
          workId
        },
        providers,
        results: merged
      };
    }, 900);

    res.json(data);
  } catch (err) {
    res.json({
      meta: { count: 0, duplicatesMerged: 0, workId },
      providers: [],
      results: []
    });
  }
});

module.exports = router;
