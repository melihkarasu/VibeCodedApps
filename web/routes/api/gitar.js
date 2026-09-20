const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');

// =============================================================
// 31. Gitar Akor & Tab Kütüphanesi (Chord Engine)
// =============================================================
const CHORD_DIAGRAMS = {
  'C': { fingers: ['x', '3', '2', '0', '1', '0'], bar: null, title: 'Do Majör (C)' },
  'D': { fingers: ['x', 'x', '0', '2', '3', '2'], bar: null, title: 'Re Majör (D)' },
  'E': { fingers: ['0', '2', '2', '1', '0', '0'], bar: null, title: 'Mi Majör (E)' },
  'F': { fingers: ['1', '3', '3', '2', '1', '1'], bar: 1, title: 'Fa Majör (F)' },
  'G': { fingers: ['3', '2', '0', '0', '0', '3'], bar: null, title: 'Sol Majör (G)' },
  'A': { fingers: ['x', '0', '2', '2', '2', '0'], bar: null, title: 'La Majör (A)' },
  'B': { fingers: ['x', '2', '4', '4', '4', '2'], bar: 2, title: 'Si Majör (B)' },
  'Am': { fingers: ['x', '0', '2', '2', '1', '0'], bar: null, title: 'La Minör (Am)' },
  'Em': { fingers: ['0', '2', '2', '0', '0', '0'], bar: null, title: 'Mi Minör (Em)' },
  'Dm': { fingers: ['x', 'x', '0', '2', '3', '1'], bar: null, title: 'Re Minör (Dm)' },
  'B7': { fingers: ['x', '2', '1', '2', '0', '2'], bar: null, title: 'Si Yedili (B7)' }
};

const POPULAR_SONGS = [
  {
    id: 'sng_akdeniz',
    title: 'Akdeniz Akşamları',
    artist: 'Haluk Levent',
    key: 'Am',
    chords: ['Am', 'Dm', 'E', 'Am'],
    lyrics: `[Am] Akdeniz akşamları bir [Dm] başka oluyor
[E] Hele bir de aylardan [Am] temmuz ise bir başka
[Am] Sahilde oturmuş bir [Dm] şarkı söylüyor
[E] Dalgalar bana eşlik [Am] ediyor`
  },
  {
    id: 'sng_hotel',
    title: 'Hotel California',
    artist: 'Eagles',
    key: 'Bm',
    chords: ['Am', 'E', 'G', 'D', 'F', 'C', 'Dm'],
    lyrics: `[Am] On a dark desert highway, [E] cool wind in my hair
[G] Warm smell of colitas, [D] rising up through the air
[F] Up ahead in the distance, [C] I saw a shimmering light
[Dm] My head grew heavy and my sight grew dim, [E] I had to stop for the night`
  },
  {
    id: 'sng_unutamadim',
    title: 'Unutamadım',
    artist: 'Barış Manço',
    key: 'Em',
    chords: ['Em', 'Am', 'D', 'G', 'C', 'B7'],
    lyrics: `[Em] Dün yine yapayalnız dolaştım [Am] yollarda
[D] Yağmurlarda ıslanan bomboş [G] sokaklarda
[C] Gözlerimde yaşlarla yürüdüm [Am] ağlayarak
[B7] Seni andım bu gece yine [Em] unutamadım`
  }
];

router.get('/chords/library', (req, res) => {
  res.json({
    success: true,
    diagrams: CHORD_DIAGRAMS,
    songs: POPULAR_SONGS
  });
});

module.exports = router;
