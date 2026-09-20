const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 3. Dizi Rehberi: IMDb Arama & Bilgi Çekme API Endpoint
// =============================================================
router.get('/dizi/imdb', async (req, res) => {
  const rawId = (req.query.id || '').trim();
  const match = rawId.match(/tt\d{7,8}/i);
  if (!match) {
    return res.status(400).json({ success: false, error: 'Geçersiz IMDb ID veya linki' });
  }

  const imdbId = match[0].toLowerCase();

  try {
    let meta = null;
    let type = 'series';

    try {
      const sRes = await fetch(`https://v3-cinemeta.strem.io/meta/series/${imdbId}.json`);
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData && sData.meta && sData.meta.name) {
          meta = sData.meta;
          type = 'series';
        }
      }
    } catch(e) {}

    if (!meta) {
      try {
        const mRes = await fetch(`https://v3-cinemeta.strem.io/meta/movie/${imdbId}.json`);
        if (mRes.ok) {
          const mData = await mRes.json();
          if (mData && mData.meta && mData.meta.name) {
            meta = mData.meta;
            type = 'movie';
          }
        }
      } catch(e) {}
    }

    let tvmEpisodes = null;
    try {
      const tvmRes = await fetch(`https://api.tvmaze.com/lookup/shows?imdb=${imdbId}`);
      if (tvmRes.ok) {
        const tvmShow = await tvmRes.json();
        if (tvmShow && tvmShow.id) {
          if (!meta) {
            meta = {
              name: tvmShow.name,
              imdbRating: tvmShow.rating?.average?.toString() || '8.0',
              releaseInfo: tvmShow.premiered ? tvmShow.premiered.substring(0, 4) : '',
              poster: tvmShow.image?.original || tvmShow.image?.medium,
              genre: tvmShow.genres || [],
              description: tvmShow.summary ? tvmShow.summary.replace(/<[^>]*>?/gm, '') : ''
            };
          }

          const epRes = await fetch(`https://api.tvmaze.com/shows/${tvmShow.id}/episodes`);
          if (epRes.ok) {
            const epData = await epRes.json();
            if (Array.isArray(epData)) {
              tvmEpisodes = epData.map(e => ({
                season: e.season,
                number: e.number,
                title: e.name,
                released: e.airdate || ''
              }));
            }
          }
        }
      }
    } catch(e) {}

    if (!meta) {
      return res.status(404).json({ success: false, error: 'IMDb kaydı bulunamadı' });
    }

    let episodes = [];
    if (tvmEpisodes && tvmEpisodes.length > 0) {
      episodes = tvmEpisodes;
    } else if (meta.videos && meta.videos.length > 0) {
      episodes = meta.videos.map(v => ({
        season: v.season,
        number: v.number || v.episode,
        title: v.title || v.name || ('Bölüm ' + (v.number || v.episode)),
        released: v.released ? v.released.substring(0, 10) : ''
      }));
    }

    res.json({
      success: true,
      imdbId: imdbId,
      title: meta.name,
      type: type,
      imdbRating: meta.imdbRating || '8.0',
      year: meta.releaseInfo || meta.year || '',
      poster: meta.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80',
      genres: meta.genre || [],
      cast: meta.cast || [],
      description: meta.description || '',
      episodes: episodes
    });
  } catch(err) {
    res.status(500).json({ success: false, error: 'Sunucu hatası: ' + err.message });
  }
});

module.exports = router;
