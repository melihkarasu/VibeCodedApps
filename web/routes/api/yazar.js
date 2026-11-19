const express = require('express');
const router = express.Router();
const { getCachedJson } = require('./cache');

function cleanVal(v) {
  return String(v || '').replace(/[,:|]/g, ' ').trim().slice(0, 120);
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

function normalizeAuthor(a) {
  const id = String(a.id || '').replace(/^https?:\/\/openalex\.org\//i, '');
  const orcid = a.orcid ? String(a.orcid).replace(/^https?:\/\/orcid\.org\//i, '') : '';
  const insts = (a.last_known_institutions || (a.last_known_institution ? [a.last_known_institution] : []) || [])
    .map(i => i && (i.display_name + (i.country_code ? ' (' + i.country_code + ')' : '')))
    .filter(Boolean);
  const stats = a.summary_stats || {};
  return {
    id,
    s2AuthorId: '',
    orcid,
    display_name: a.display_name || 'İsimsiz Akademisyen',
    works_count: Number(a.works_count || 0),
    cited_by_count: Number(a.cited_by_count || 0),
    h_index: Number(stats.h_index || 0),
    i10_index: Number(stats.i10_index || 0),
    mean_2yr: Number(stats['2yr_mean_citedness'] || 0).toFixed(2),
    institutions: insts,
    counts_by_year: (a.counts_by_year || []).slice(0, 15).map(c => ({
      year: c.year,
      works_count: Number(c.works_count || 0),
      cited_by_count: Number(c.cited_by_count || 0)
    })),
    sources: ['openalex']
  };
}

function normalizeS2Author(a) {
  const ext = a.externalIds || {};
  const orcidRaw = Array.isArray(ext.ORCID) ? ext.ORCID[0] : (ext.ORCID || '');
  const orcid = String(orcidRaw || '').replace(/^https?:\/\/orcid\.org\//i, '').trim();
  const insts = Array.isArray(a.affiliations) ? a.affiliations.filter(Boolean) : [];
  return {
    id: a.authorId ? ('S2A:' + a.authorId) : ('S2A:' + (a.name || 'author')),
    s2AuthorId: a.authorId || '',
    orcid,
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
  const refIds = (w.referenced_works || []).map(r => String(r).replace(/^https?:\/\/openalex\.org\//i, ''));
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
    publisher: src.host_organization_name || 'OpenAlex',
    type: w.type || 'article',
    source_type: src.type || 'journal',
    issn: src.issn_l || (Array.isArray(src.issn) && src.issn[0]) || '',
    is_core: Boolean(src.is_core),
    is_in_doaj: Boolean(src.is_in_doaj),
    indexed_in: Array.isArray(w.indexed_in) ? w.indexed_in : [],
    pmid: (w.ids && w.ids.pmid) ? String(w.ids.pmid).replace(/^https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//i, '').replace(/\/$/, '') : '',
    authors,
    institutions: Array.from(instSet).slice(0, 4),
    referenced_works: refIds,
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
    type: 'article',
    source_type: 'journal',
    issn: (p.publicationVenue && p.publicationVenue.issn) || '',
    is_core: false,
    is_in_doaj: false,
    indexed_in: indexed,
    pmid,
    authors: (p.authors || []).slice(0, 8).map(a => a && a.name).filter(Boolean),
    institutions: [],
    referenced_works: [],
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
    referenced_works: [],
    sources: ['crossref']
  };
}

function mergeAuthorsLists(oaAuthors, s2Authors, sort) {
  const byKey = new Map();
  let duplicatesMerged = 0;

  function makeKey(a) {
    if (a.orcid) return 'orcid:' + a.orcid.toLowerCase().trim();
    return 'n:' + String(a.display_name || '').toLowerCase().replace(/[^a-z0-9çğıöşü]+/gi, '');
  }

  function add(a) {
    const key = makeKey(a);
    if (!key || key === 'n:') return;
    if (!byKey.has(key)) {
      byKey.set(key, Object.assign({}, a, { sources: Array.from(new Set(a.sources || [])) }));
      return;
    }
    duplicatesMerged += 1;
    const ex = byKey.get(key);
    ex.sources = Array.from(new Set([...(ex.sources || []), ...(a.sources || [])]));
    if (!ex.s2AuthorId && a.s2AuthorId) ex.s2AuthorId = a.s2AuthorId;
    if (!ex.orcid && a.orcid) ex.orcid = a.orcid;
    if (Number(a.cited_by_count || 0) > Number(ex.cited_by_count || 0)) ex.cited_by_count = a.cited_by_count;
    if (Number(a.works_count || 0) > Number(ex.works_count || 0)) ex.works_count = a.works_count;
    if (Number(a.h_index || 0) > Number(ex.h_index || 0)) ex.h_index = a.h_index;
    if ((!ex.institutions || !ex.institutions.length) && a.institutions && a.institutions.length) ex.institutions = a.institutions;
  }

  (oaAuthors || []).forEach(add);
  (s2Authors || []).forEach(add);

  const merged = Array.from(byKey.values());
  if (sort === 'works_count:desc') merged.sort((a, b) => Number(b.works_count || 0) - Number(a.works_count || 0));
  else if (sort === 'summary_stats.h_index:desc') merged.sort((a, b) => Number(b.h_index || 0) - Number(a.h_index || 0));
  else merged.sort((a, b) => Number(b.cited_by_count || 0) - Number(a.cited_by_count || 0));
  return { merged, duplicatesMerged };
}

function mergeWorksLists(oaList, s2List, crList, sort) {
  const byKey = new Map();
  let duplicatesMerged = 0;

  function makeKey(w) {
    if (w.doi) return 'doi:' + w.doi.toLowerCase().trim();
    return 't:' + String(w.title || '').toLowerCase().replace(/[^a-z0-9çğıöşü]+/gi, '').slice(0, 80);
  }

  function add(w) {
    const key = makeKey(w);
    if (!key || key === 't:') return;
    if (!byKey.has(key)) {
      byKey.set(key, Object.assign({}, w, { sources: Array.from(new Set(w.sources || [])) }));
      return;
    }
    duplicatesMerged += 1;
    const ex = byKey.get(key);
    ex.sources = Array.from(new Set([...(ex.sources || []), ...(w.sources || [])]));
    if (!ex.s2Id && w.s2Id) ex.s2Id = w.s2Id;
    if (!ex.doi && w.doi) ex.doi = w.doi;
    if (Number(w.cited_by_count || 0) > Number(ex.cited_by_count || 0)) ex.cited_by_count = w.cited_by_count;
    if (!ex.is_oa && w.is_oa) { ex.is_oa = true; if (w.oa_url) ex.oa_url = w.oa_url; }
    if (!ex.issn && w.issn) ex.issn = w.issn;
    if (!ex.is_core && w.is_core) ex.is_core = true;
    if (!ex.is_in_doaj && w.is_in_doaj) ex.is_in_doaj = true;
    ex.indexed_in = Array.from(new Set([...(ex.indexed_in || []), ...(w.indexed_in || [])]));
    if ((!ex.referenced_works || !ex.referenced_works.length) && w.referenced_works && w.referenced_works.length) ex.referenced_works = w.referenced_works;
  }

  (oaList || []).forEach(add);
  (s2List || []).forEach(add);
  (crList || []).forEach(add);

  const merged = Array.from(byKey.values());
  if (sort === 'publication_year:desc,cited_by_count:desc') {
    merged.sort((a, b) => (Number(b.publication_year || 0) - Number(a.publication_year || 0)) || (Number(b.cited_by_count || 0) - Number(a.cited_by_count || 0)));
  } else {
    merged.sort((a, b) => Number(b.cited_by_count || 0) - Number(a.cited_by_count || 0));
  }
  return { merged, duplicatesMerged };
}

router.get('/yazar/search', async (req, res) => {
  const name = cleanVal(req.query.name || '');
  const inst = cleanVal(req.query.institution || '');
  const orcid = String(req.query.orcid || '').trim().replace(/^https?:\/\/orcid\.org\//i, '').slice(0, 40);
  const sort = String(req.query.sort || 'cited_by_count:desc').trim();
  const cacheKey = `yazar_search_multi_v2_${name}_${inst}_${orcid}_${sort}`;

  try {
    const data = await getCachedJson(cacheKey, async () => {
      const runOa = async () => {
        const t0 = Date.now();
        try {
          const filters = [];
          if (name) filters.push(`default.search:${name}`);
          if (inst) filters.push(`affiliations.institution.display_name.search:${inst}`);
          if (orcid) filters.push(`orcid:${orcid}`);
          const qParts = ['per-page=15'];
          if (filters.length) qParts.push(`filter=${encodeURIComponent(filters.join(','))}`);
          if (['cited_by_count:desc', 'works_count:desc', 'summary_stats.h_index:desc'].includes(sort)) qParts.push(`sort=${encodeURIComponent(sort)}`);
          const resp = await fetch(`https://api.openalex.org/authors?${qParts.join('&')}`, {
            headers: { 'User-Agent': 'VibeCodedApps-YazarAtif/1.0 (https://app.melihkarasu.com)' },
            signal: AbortSignal.timeout(7500)
          });
          const ms = Date.now() - t0;
          if (!resp.ok) return { provider: 'OpenAlex', key: 'openalex', ok: false, status: resp.status, ms, count: 0, total: 0, note: `HTTP ${resp.status}`, items: [] };
          const json = await resp.json();
          const items = Array.isArray(json.results) ? json.results.map(normalizeAuthor) : [];
          const total = (json.meta && json.meta.count) || items.length;
          return { provider: 'OpenAlex', key: 'openalex', ok: true, status: 200, ms, count: items.length, total, note: `${items.length} yazar profili alındı`, items };
        } catch (e) {
          return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: e.message || 'Zaman aşımı', items: [] };
        }
      };

      const runS2 = async () => {
        const t0 = Date.now();
        const qText = [name, inst, orcid].filter(Boolean).join(' ').trim();
        if (!qText) return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'Sorgu boş', items: [] };
        try {
          const fields = 'authorId,name,affiliations,paperCount,citationCount,hIndex,externalIds';
          const resp = await fetch(`https://api.semanticscholar.org/graph/v1/author/search?query=${encodeURIComponent(qText)}&limit=10&fields=${fields}`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'VibeCodedApps-YazarAtif/1.0' },
            signal: AbortSignal.timeout(7500)
          });
          const ms = Date.now() - t0;
          if (!resp.ok) {
            const note = resp.status === 429 ? 'HTTP 429 (Key\'siz hız sınırı)' : `HTTP ${resp.status}`;
            return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: resp.status, ms, count: 0, total: 0, note, items: [] };
          }
          const json = await resp.json();
          const items = Array.isArray(json.data) ? json.data.map(normalizeS2Author) : [];
          return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: true, status: 200, ms, count: items.length, total: Number(json.total || items.length), note: `${items.length} yazar profili alındı`, items };
        } catch (e) {
          return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: e.message || 'Hata', items: [] };
        }
      };

      const runCrCheck = async () => {
        const t0 = Date.now();
        try {
          const qp = ['rows=5'];
          if (name) qp.push(`query.author=${encodeURIComponent(name)}`);
          if (inst) qp.push(`query.affiliation=${encodeURIComponent(inst)}`);
          if (orcid) qp.push(`filter=orcid:${encodeURIComponent(orcid)}`);
          if (!name && !inst && !orcid) qp.push('rows=1');
          const resp = await fetch(`https://api.crossref.org/works?${qp.join('&')}`, {
            headers: { 'User-Agent': 'VibeCodedApps-YazarAtif/1.0 (mailto:info@melihkarasu.com)' },
            signal: AbortSignal.timeout(6500)
          });
          const ms = Date.now() - t0;
          if (!resp.ok) return { provider: 'Crossref', key: 'crossref', ok: false, status: resp.status, ms, count: 0, total: 0, note: `HTTP ${resp.status}`, items: [] };
          const json = await resp.json();
          const tot = Number((json.message && json.message['total-results']) || 0);
          return { provider: 'Crossref', key: 'crossref', ok: true, status: 200, ms, count: tot, total: tot, note: `${tot.toLocaleString('tr-TR')} eşleşen DOI yayını doğrulandı (yazar profili API'si yok)`, items: [] };
        } catch (e) {
          return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: e.message || 'Hata', items: [] };
        }
      };

      const [oaRes, s2Res, crRes] = await Promise.all([runOa(), runS2(), runCrCheck()]);
      const { merged, duplicatesMerged } = mergeAuthorsLists(oaRes.items, s2Res.items, sort);
      const providers = [oaRes, s2Res, crRes].map(({ items, ...meta }) => meta);
      return {
        meta: { count: Math.max(oaRes.total || 0, s2Res.total || 0, merged.length), duplicatesMerged },
        providers,
        results: merged
      };
    }, 900);

    res.json(data);
  } catch (err) {
    res.json({ meta: { count: 0, duplicatesMerged: 0 }, providers: [], results: [] });
  }
});

router.get('/yazar/works', async (req, res) => {
  const authorId = String(req.query.authorId || '').trim().replace(/^https?:\/\/openalex\.org\//i, '');
  const s2AuthorId = String(req.query.s2AuthorId || '').trim();
  const authorName = cleanVal(req.query.authorName || '');
  const page = Math.max(1, Math.min(200, parseInt(req.query.page, 10) || 1));
  const perPage = Math.max(10, Math.min(200, parseInt(req.query.perPage, 10) || 50));
  const sort = String(req.query.sort || 'cited_by_count:desc').trim();
  const indexFilter = String(req.query.indexFilter || 'all').trim();
  const idxClause = resolveIndexFilterClause(indexFilter);
  const cacheKey = `yazar_works_multi_v2_${authorId}_${s2AuthorId}_${authorName}_${sort}_${indexFilter}_p${page}_${perPage}`;

  try {
    const data = await getCachedJson(cacheKey, async () => {
      const runOa = async () => {
        const t0 = Date.now();
        if (!/^A\d+$/i.test(authorId)) return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'OpenAlex Author ID yok', items: [] };
        try {
          const fStr = `author.id:${authorId}` + (idxClause ? `,${idxClause}` : '');
          const url = `https://api.openalex.org/works?filter=${encodeURIComponent(fStr)}&sort=${encodeURIComponent(sort)}&per-page=${perPage}&page=${page}`;
          const resp = await fetch(url, {
            headers: { 'User-Agent': 'VibeCodedApps-YazarAtif/1.0 (https://app.melihkarasu.com)' },
            signal: AbortSignal.timeout(7500)
          });
          const ms = Date.now() - t0;
          if (!resp.ok) return { provider: 'OpenAlex', key: 'openalex', ok: false, status: resp.status, ms, count: 0, total: 0, note: `HTTP ${resp.status}`, items: [] };
          const json = await resp.json();
          const items = Array.isArray(json.results) ? json.results.map(normalizeWork) : [];
          const total = (json.meta && json.meta.count) || items.length;
          return { provider: 'OpenAlex', key: 'openalex', ok: true, status: 200, ms, count: items.length, total, note: `${items.length} yayın alındı`, items };
        } catch (e) {
          return { provider: 'OpenAlex', key: 'openalex', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: e.message || 'Hata', items: [] };
        }
      };

      const runS2 = async () => {
        const t0 = Date.now();
        const s2Id = s2AuthorId || (authorId.startsWith('S2A:') ? authorId.slice(4) : '');
        if (!s2Id) return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'S2 Yazar ID eşleşmedi', items: [] };
        try {
          const fields = 'paperId,externalIds,title,year,citationCount,isOpenAccess,openAccessPdf,venue,publicationVenue,journal,authors,url';
          const offset = (page - 1) * perPage;
          const resp = await fetch(`https://api.semanticscholar.org/graph/v1/author/${encodeURIComponent(s2Id)}/papers?offset=${offset}&limit=${Math.min(perPage, 100)}&fields=${fields}`, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'VibeCodedApps-YazarAtif/1.0' },
            signal: AbortSignal.timeout(7500)
          });
          const ms = Date.now() - t0;
          if (!resp.ok) {
            const note = resp.status === 429 ? 'HTTP 429 (Key\'siz hız sınırı)' : `HTTP ${resp.status}`;
            return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: resp.status, ms, count: 0, total: 0, note, items: [] };
          }
          const json = await resp.json();
          const items = Array.isArray(json.data) ? json.data.map(normalizeS2Work) : [];
          return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: true, status: 200, ms, count: items.length, total: items.length, note: `${items.length} yayın alındı`, items };
        } catch (e) {
          return { provider: 'Semantic Scholar', key: 'semanticscholar', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: e.message || 'Hata', items: [] };
        }
      };

      const runCr = async () => {
        const t0 = Date.now();
        if (!authorName) return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: 0, count: 0, total: 0, note: 'Yazar adı yok', items: [] };
        try {
          const url = `https://api.crossref.org/works?query.author=${encodeURIComponent(authorName)}&sort=is-referenced-by-count&order=desc&rows=${Math.min(perPage, 30)}&offset=${(page - 1) * perPage}`;
          const resp = await fetch(url, {
            headers: { 'User-Agent': 'VibeCodedApps-YazarAtif/1.0 (mailto:info@melihkarasu.com)' },
            signal: AbortSignal.timeout(7500)
          });
          const ms = Date.now() - t0;
          if (!resp.ok) return { provider: 'Crossref', key: 'crossref', ok: false, status: resp.status, ms, count: 0, total: 0, note: `HTTP ${resp.status}`, items: [] };
          const json = await resp.json();
          const msg = json.message || {};
          const items = Array.isArray(msg.items) ? msg.items.map(normalizeCrossrefWork) : [];
          const total = Number(msg['total-results'] || items.length);
          return { provider: 'Crossref', key: 'crossref', ok: true, status: 200, ms, count: items.length, total, note: `${items.length} DOI kaydı alındı`, items };
        } catch (e) {
          return { provider: 'Crossref', key: 'crossref', ok: false, status: 0, ms: Date.now() - t0, count: 0, total: 0, note: e.message || 'Hata', items: [] };
        }
      };

      const [oaRes, s2Res, crRes] = await Promise.all([runOa(), runS2(), runCr()]);
      const { merged, duplicatesMerged } = mergeWorksLists(oaRes.items, s2Res.items, crRes.items, sort);
      const providers = [oaRes, s2Res, crRes].map(({ items, ...meta }) => meta);
      return {
        meta: { count: Math.max(oaRes.total || 0, s2Res.total || 0, merged.length), duplicatesMerged },
        providers,
        results: merged
      };
    }, 900);

    res.json(data);
  } catch (err) {
    res.json({ meta: { count: 0, duplicatesMerged: 0 }, providers: [], results: [] });
  }
});

module.exports = router;
