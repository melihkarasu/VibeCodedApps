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
    }))
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
    referenced_works: refIds
  };
}

router.get('/yazar/search', async (req, res) => {
  try {
    const name = cleanVal(req.query.name || '');
    const inst = cleanVal(req.query.institution || '');
    const orcid = String(req.query.orcid || '').trim().replace(/^https?:\/\/orcid\.org\//i, '').slice(0, 40);
    const sort = String(req.query.sort || 'cited_by_count:desc').trim();
    const cacheKey = `yazar_search_${name}_${inst}_${orcid}_${sort}`;

    const data = await getCachedJson(cacheKey, async () => {
      const filters = [];
      if (name) filters.push(`default.search:${name}`);
      if (inst) filters.push(`affiliations.institution.display_name.search:${inst}`);
      if (orcid) filters.push(`orcid:${orcid}`);
      const qParts = ['per-page=20'];
      if (filters.length) qParts.push(`filter=${encodeURIComponent(filters.join(','))}`);
      if (['cited_by_count:desc', 'works_count:desc', 'summary_stats.h_index:desc'].includes(sort)) {
        qParts.push(`sort=${encodeURIComponent(sort)}`);
      }
      const url = `https://api.openalex.org/authors?${qParts.join('&')}`;
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'VibeCodedApps-YazarAtif/1.0 (https://app.melihkarasu.com)' },
        signal: AbortSignal.timeout(8000)
      });
      if (!resp.ok) throw new Error('OpenAlex HTTP ' + resp.status);
      const json = await resp.json();
      const results = Array.isArray(json.results) ? json.results.map(normalizeAuthor) : [];
      return { meta: { count: (json.meta && json.meta.count) || results.length }, results };
    }, 1800);

    res.json(data);
  } catch (err) {
    res.json({ meta: { count: 0 }, results: [] });
  }
});

router.get('/yazar/works', async (req, res) => {
  try {
    const authorId = String(req.query.authorId || '').trim().replace(/^https?:\/\/openalex\.org\//i, '');
    const page = Math.max(1, Math.min(200, parseInt(req.query.page, 10) || 1));
    const perPage = Math.max(10, Math.min(200, parseInt(req.query.perPage, 10) || 50));
    const sort = String(req.query.sort || 'cited_by_count:desc').trim();
    const indexFilter = String(req.query.indexFilter || 'all').trim();
    const idxClause = resolveIndexFilterClause(indexFilter);
    const cacheKey = `yazar_works_${authorId}_${sort}_${indexFilter}_p${page}_${perPage}`;

    const data = await getCachedJson(cacheKey, async () => {
      const fStr = `author.id:${authorId}` + (idxClause ? `,${idxClause}` : '');
      const url = `https://api.openalex.org/works?filter=${encodeURIComponent(fStr)}&sort=${encodeURIComponent(sort)}&per-page=${perPage}&page=${page}`;
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'VibeCodedApps-YazarAtif/1.0 (https://app.melihkarasu.com)' },
        signal: AbortSignal.timeout(8000)
      });
      if (!resp.ok) throw new Error('OpenAlex HTTP ' + resp.status);
      const json = await resp.json();
      const results = Array.isArray(json.results) ? json.results.map(normalizeWork) : [];
      return { meta: { count: (json.meta && json.meta.count) || results.length }, results };
    }, 1800);

    res.json(data);
  } catch (err) {
    res.json({ meta: { count: 0 }, results: [] });
  }
});

module.exports = router;
