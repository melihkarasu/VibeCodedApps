// Vektörel SVG İkon Kütüphanesi (9 Kategori + 45 Mikro Uygulama)
const CAT_SVGS = {
  'saglik': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  'cografya-doga': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
  'uzay-bilim': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>',
  'sanat-tarih-edebiyat': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
  'oyun': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>',
  'populer-kultur': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
  'finans-piyasa': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
  'gelistirici-araclari': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  'web-araclari': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
};

const APP_SVGS = {
  // Sağlık
  'nobetci-eczane': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',
  'ilac-rehberi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>',
  'kas-anatomisi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>',
  'klinik-arastirma': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>',
  'dso-saglik': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  // Coğrafya & Doğa
  'tarim-hava': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>',
  'karbon-metre': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
  'doga-sesleri': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg>',
  'cografya-atlasi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  'hava-kalitesi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
  'sehir-bisiklet': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>',
  'deniz-dalga': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>',
  // Uzay & Bilim
  'molekul-studyosu': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="m14.5 9.5 3-3"/><path d="m6.5 17.5 3-3"/><path d="m9.5 9.5-3-3"/><path d="m14.5 14.5 3 3"/></svg>',
  'iss-takip': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7 9 3 5 7l4 4"/><path d="m17 11 4 4-4 4-4-4"/><path d="m8 12 4 4 6-6-4-4Z"/><path d="m16 8 3-3"/><path d="M9 21a6 6 0 0 0-6-6"/></svg>',
  'sayilar-atlasi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>',
  'nobel-arsivi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
  // Sanat, Tarih & Edebiyat
  'sanat-galerisi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
  'klasik-kutuphane': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  'tatil-takvimi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  'unesco-miras': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>',
  'sesli-kitap': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
  'siir-antolojisi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>',
  // Oyun
  'sudoku-arena': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>',
  'kultur-arena': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  'oyun-radar': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  'oyun-arsivi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>',
  'oyun-rekorlari': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  // Popüler Kültür
  'dizi-rehberi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
  'sozden-sarkiya': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  'lezzet-atolyesi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg>',
  'gida-alerji': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="8" x2="7" y2="16"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="17" y1="8" x2="17" y2="16"/></svg>',
  'dunya-radyo': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>',
  'evcil-rehber': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>',
  'gitar-akor': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  // Finans & Piyasa
  'doviz-cevirici': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  'kuresel-gostergeler': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  'kripto-trend': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>',
  // Geliştirici Araçları
  'github-analitik': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>',
  'dns-kontrol': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>',
  'sizinti-kontrol': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  'web-security-scanner': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
  'vibecoding-security-rules': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
  'vibecoding-kvkk-gdpr': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
  'ip-konum': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  'renk-studyosu': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/></svg>',
  'http-status': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
  // Web Araçları
  'qr-studio': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
};

const DEFAULT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';

function getCategorySvg(catId) {
  return CAT_SVGS[catId] || DEFAULT_SVG;
}

function getAppSvg(appId, catId) {
  return APP_SVGS[appId] || CAT_SVGS[catId] || DEFAULT_SVG;
}

module.exports = function(pageTemplate) {
  return async function(req, res) {
    let categories = [
      {
        id: "saglik",
        title: "Sağlık",
        icon: getCategorySvg("saglik"),
        desc: "Nöbetçi eczaneler, ilaç prospektüsleri, medikal rehberler ve sağlık verileri",
        apps: [
          {
            id: "nobetci-eczane",
            name: "Nöbetçi Eczaneler",
            icon: getAppSvg("nobetci-eczane", "saglik"),
            desc: "Türkiye genelinde 81 il ve tüm ilçelerde güncel nöbetçi eczaneler, canlı konum, en yakın 5 eczane ve tek tıkla arama/yol tarifi.",
            url: "/nobetci-eczane",
            action: "Eczaneleri Bul"
          },
          {
            id: "ilac-rehberi",
            name: "İlaç & Prospektüs Rehberi",
            icon: getAppSvg("ilac-rehberi", "saglik"),
            desc: "U.S. FDA ve resmi farmakope veri tabanı ile etken maddeler, prospektüs özeti, kullanım uyarıları ve açık bildirilmiş yan etki analitiği.",
            url: "/ilac-rehberi",
            action: "İlacı İncele"
          },
          {
            id: "kas-anatomisi",
            name: "İnteraktif Kas Anatomisi & Egzersiz",
            icon: getAppSvg("kas-anatomisi", "saglik"),
            desc: "workout-cool ve Wger verileriyle interaktif vücut kas haritası, hedeflenen egzersizler, doğru form rehberi ve duruş terapisi.",
            url: "/kas-anatomisi",
            action: "Anatomiyi Keşfet"
          },
          {
            id: "klinik-arastirma",
            name: "Klinik Araştırmalar Radarı",
            icon: getAppSvg("klinik-arastirma", "saglik"),
            desc: "NIH ClinicalTrials.gov v2 API ile kanser, diyabet ve nörolojideki aktif klinik deneyler, faz aşamaları ve deneysel tedaviler.",
            url: "/klinik-arastirma",
            action: "Çalışmaları İncele"
          },
          {
            id: "dso-saglik",
            name: "Küresel Sağlık Atlası (DSÖ)",
            icon: getAppSvg("dso-saglik", "saglik"),
            desc: "Dünya Sağlık Örgütü resmi verileriyle Türkiye ve 190+ ülkenin beklenen yaşam süresi, aşılanma ve mortalite göstergeleri.",
            url: "/dso-saglik",
            action: "Göstergeleri İncele"
          }
        ]
      },
      {
        id: "cografya-doga",
        title: "Coğrafya, Doğa & Çevre",
        icon: getCategorySvg("cografya-doga"),
        desc: "İklim, tarımsal meteoroloji, çevre bilinci, küresel atlas ve hava kalitesi",
        apps: [
          {
            id: "tarim-hava",
            name: "Akıllı Tarım & Zirai Hava",
            icon: getAppSvg("tarim-hava", "cografya-doga"),
            desc: "Open-Meteo ile toprak nemi/sıcaklığı derinlikleri, don riski erken uyarı sistemi, evapotranspirasyon ve sulama tavsiyeleri.",
            url: "/tarim-hava",
            action: "Paneli Başlat"
          },
          {
            id: "karbon-metre",
            name: "Web Karbon Ayak İzi",
            icon: getAppSvg("karbon-metre", "cografya-doga"),
            desc: "Web sitelerinin sayfa yükleme başına CO2 salımı, yeşil hosting doğrulaması ve gömülebilir dinamik eko-rozet.",
            url: "/karbon-metre",
            action: "Ölçümü Başlat"
          },
          {
            id: "doga-sesleri",
            name: "Kuş Sesi Dedektifi",
            icon: getAppSvg("doga-sesleri", "cografya-doga"),
            desc: "iNaturalist biyoakustik arşivi ile 500.000+ yabani kuş sesi, canlı spektrum ses dalgası ve mini tahmin testi.",
            url: "/doga-sesleri",
            action: "Sesleri Dinle"
          },
          {
            id: "cografya-atlasi",
            name: "Küresel Coğrafya Atlası",
            icon: getAppSvg("cografya-atlasi", "cografya-doga"),
            desc: "REST Countries API ile 250 dünya ülkesinin bayrakları, başkentleri, nüfusu, dilleri ve sınır komşuları.",
            url: "/cografya-atlasi",
            action: "Atlası İncele"
          },
          {
            id: "hava-kalitesi",
            name: "Canlı Hava Kalitesi Radarı",
            icon: getAppSvg("hava-kalitesi", "cografya-doga"),
            desc: "Dünya şehirlerinin canlı PM2.5, PM10, NO2 kirlilik seviyeleri, Avrupa AQI endeksi ve sağlık tavsiyeleri.",
            url: "/hava-kalitesi",
            action: "Havayı Ölç"
          },
          {
            id: "sehir-bisiklet",
            name: "Şehir Bisiklet Rehberi",
            icon: getAppSvg("sehir-bisiklet", "cografya-doga"),
            desc: "CityBikes API ile 400+ dünya metropolünde canlı bisiklet durakları, boş bisiklet ve park yuvası haritası.",
            url: "/sehir-bisiklet",
            action: "Durakları Gör"
          },
          {
            id: "deniz-dalga",
            name: "Mavi Rota: Dalga & Sörf Radarı",
            icon: getAppSvg("deniz-dalga", "cografya-doga"),
            desc: "Open-Meteo Marine API ile Ege, Akdeniz ve Karadeniz kıyılarında canlı dalga boyu, periyot ve sörf uygunluğu.",
            url: "/deniz-dalga",
            action: "Denizi İncele"
          }
        ]
      },
      {
        id: "uzay-bilim",
        title: "Uzay & Bilim",
        icon: getCategorySvg("uzay-bilim"),
        desc: "Moleküler kimya, 3D WebGL modelleme ve canlı yörünge takibi",
        apps: [
          {
            id: "molekul-studyosu",
            name: "3D Molekül Stüdyosu",
            icon: getAppSvg("molekul-studyosu", "uzay-bilim"),
            desc: "PubChem 3D Conformer ve 3Dmol.js WebGL motoruyla kimyasalların ve ilaçların 3D atomik modellemesi.",
            url: "/molekul-studyosu",
            action: "Stüdyoyu Başlat"
          },
          {
            id: "iss-takip",
            name: "Where is ISS? Uzay Radarı",
            icon: getAppSvg("iss-takip", "uzay-bilim"),
            desc: "Uluslararası Uzay İstasyonu'nun (ISS) anlık enlem, boylam, 27.600 km/s yörünge hızı ve canlı haritası.",
            url: "/iss-takip",
            action: "İstasyonu Takip Et"
          },
          {
            id: "sayilar-atlasi",
            name: "Sayılar Atlası & Matematik",
            icon: getAppSvg("sayilar-atlasi", "uzay-bilim"),
            desc: "Numbers motoru ile sayıların asallık, Fibonacci, bölen analizi, ikili kodları ve tarihteki gizemli gerçekleri.",
            url: "/sayilar-atlasi",
            action: "Sayıyı Keşfet"
          },
          {
            id: "nobel-arsivi",
            name: "Nobel Ödülleri Arşivi",
            icon: getAppSvg("nobel-arsivi", "uzay-bilim"),
            desc: "Nobel Vakfı resmi API'si ile 1901'den günümüze bilim insanları, çığır açan keşifler ve edebiyat ödülleri.",
            url: "/nobel-arsivi",
            action: "Arşivi İncele"
          }
        ]
      },
      {
        id: "sanat-tarih-edebiyat",
        title: "Sanat, Tarih & Edebiyat",
        icon: getCategorySvg("sanat-tarih-edebiyat"),
        desc: "Klasik edebiyat, küresel müzeler, görsel sanatlar, tatil hafızası ve kelime oyunları",
        apps: [
          {
            id: "sanat-galerisi",
            name: "Global Sanat Galerisi",
            icon: getAppSvg("sanat-galerisi", "sanat-tarih-edebiyat"),
            desc: "The Met Museum dijital arşivi ile usta ressamlar, derin yakınlaştırma (deep zoom) ve kişisel sanat sergisi.",
            url: "/sanat-galerisi",
            action: "Galeriyi Gez"
          },
          {
            id: "klasik-kutuphane",
            name: "Dijital Kütüphane",
            icon: getAppSvg("klasik-kutuphane", "sanat-tarih-edebiyat"),
            desc: "Project Gutenberg ile 70.000+ dünya klasiği, tarayıcı içi e-kitap okuyucu, yer imleri ve kişisel kitaplık.",
            url: "/klasik-kutuphane",
            action: "Okumaya Başla"
          },
          {
            id: "tatil-takvimi",
            name: "Küresel Tatil Takvimi",
            icon: getAppSvg("tatil-takvimi", "sanat-tarih-edebiyat"),
            desc: "100+ ülkenin resmi tatilleri, eşzamanlı çoklu ülke karşılaştırması, akıllı köprü izin fırsatları ve iCal desteği.",
            url: "/tatil-takvimi",
            action: "Takvimi Aç"
          },
          {
            id: "unesco-miras",
            name: "UNESCO Dünya Mirası Atlası",
            icon: getAppSvg("unesco-miras", "sanat-tarih-edebiyat"),
            desc: "Göbeklitepe'den Machu Picchu'ya dünya mirası alanları, fotoğrafları, kabul yılları ve harita konumları.",
            url: "/unesco-miras",
            action: "Mirasları Keşfet"
          },
          {
            id: "sesli-kitap",
            name: "Sesli Kütüphane (LibriVox)",
            icon: getAppSvg("sesli-kitap", "sanat-tarih-edebiyat"),
            desc: "LibriVox açık kamu malı arşivi ile dünya edebiyatı klasiklerinin seslendirilmiş kayıtları ve ses çaları.",
            url: "/sesli-kitap",
            action: "Kitap Dinle"
          },
          {
            id: "siir-antolojisi",
            name: "Şiir Vahası: Şiir Antolojisi",
            icon: getAppSvg("siir-antolojisi", "sanat-tarih-edebiyat"),
            desc: "PoetryDB açık arşivi ile Shakespeare, Poe, Dickinson ve usta şairlerin 3.000+ eseri ve tipografik okuyucu.",
            url: "/siir-antolojisi",
            action: "Şiirleri Oku"
          }
        ]
      },
      {
        id: "oyun",
        title: "Oyun",
        icon: getCategorySvg("oyun"),
        desc: "İnteraktif bilgi yarışmaları, çok oyunculu düellolar ve dijital oyun kütüphanesi",
        apps: [
          {
            id: "sudoku-arena",
            name: "Sudoku Arena",
            icon: getAppSvg("sudoku-arena", "oyun"),
            desc: "Deterministik tohum motoru, Günün Sudokusu ortak yarışması, süreli liderlik tablosu ve not modu.",
            url: "/sudoku",
            action: "Bulmacayı Çöz"
          },
          {
            id: "kultur-arena",
            name: "Kültür Arenası & Trivia",
            icon: getAppSvg("kultur-arena", "oyun"),
            desc: "Solo yarışma, 1v1 canlı düello odaları, başarımlar, XP seviyeleri ve detaylı karşılaşma geçmişi.",
            url: "/kultur-arena",
            action: "Arenaya Gir"
          },
          {
            id: "oyun-radar",
            name: "Steam & Epic Fırsat Avcısı",
            icon: getAppSvg("oyun-radar", "oyun"),
            desc: "CheapShark & GamerPower ile anlık büyük indirimler, %100 ücretsiz kalıcı hediyeler ve istek listesi.",
            url: "/oyun-radar",
            action: "Fırsatları Yakala"
          },
          {
            id: "oyun-arsivi",
            name: "Oyun Keşif Kütüphanesi",
            icon: getAppSvg("oyun-arsivi", "oyun"),
            desc: "FreeToGame ve açık oyun veritabanı ile PC ve tarayıcı tabanlı yüzlerce oyun, tür filtreleri ve detaylar.",
            url: "/oyun-arsivi",
            action: "Oyunları Keşfet"
          },
          {
            id: "oyun-rekorlari",
            name: "Speedrun Oyun Rekorları",
            icon: getAppSvg("oyun-rekorlari", "oyun"),
            desc: "Speedrun.com açık veritabanı ile popüler video oyunlarının dünya rekoru bitirme süreleri ve liderleri.",
            url: "/oyun-rekorlari",
            action: "Rekorları Gör"
          }
        ]
      },
      {
        id: "populer-kultur",
        title: "Popüler Kültür & Eğlence",
        icon: getCategorySvg("populer-kultur"),
        desc: "Dizi/film ajandası, miksoloji, gastronomi, müzik ve besin alerjen dedektifi",
        apps: [
          {
            id: "dizi-rehberi",
            name: "Dizi & Sezon Takipçisi",
            icon: getAppSvg("dizi-rehberi", "populer-kultur"),
            desc: "IMDb & TVmaze ile bölüm bazlı sezon takibi, izleme ajandası ve IMDb linkiyle özel yapım ekleme.",
            url: "/dizi-rehberi",
            action: "Rehberi Başlat"
          },
          {
            id: "sozden-sarkiya",
            name: "Sözden Şarkıya",
            icon: getAppSvg("sozden-sarkiya", "populer-kultur"),
            desc: "LRCLIB & iTunes ile aklınızda kalan sözlerden şarkı tespiti, tam şarkı sözleri ve 30 saniyelik ses önizlemesi.",
            url: "/sozden-sarkiya",
            action: "Dedektifi Başlat"
          },
          {
            id: "lezzet-atolyesi",
            name: "Lezzet Atölyesi",
            icon: getAppSvg("lezzet-atolyesi", "populer-kultur"),
            desc: "TheMealDB, Forkify ve TheCocktailDB ile mutfak & miksoloji barı, malzeme arama ve tarif defteri.",
            url: "/lezzet-atolyesi",
            action: "Atölyeyi Başlat"
          },
          {
            id: "gida-alerji",
            name: "Gıda Dedektifi & Alerjen Kalkanı",
            icon: getAppSvg("gida-alerji", "populer-kultur"),
            desc: "Open Food Facts ile barkod tarama, Nutri-Score, besin değerleri ve kişisel alerji uyarısı.",
            url: "/gida-alerji",
            action: "Ürünü İncele"
          },
          {
            id: "dunya-radyo",
            name: "Dünya Radyo Kulesi",
            icon: getAppSvg("dunya-radyo", "populer-kultur"),
            desc: "Radio Browser API ile 30.000+ küresel canlı radyo yayını, ülke ve müzik türü filtreleri ve Web Audio çaları.",
            url: "/dunya-radyo",
            action: "Radyoyu Dinle"
          },
          {
            id: "evcil-rehber",
            name: "Evcil Dostlar Ansiklopedisi",
            icon: getAppSvg("evcil-rehber", "populer-kultur"),
            desc: "TheCatAPI & Dog CEO ile 150+ kedi ve köpek ırkı, mizaç analizi, yaşam süresi ve çocuk dostluğu rehberi.",
            url: "/evcil-rehber",
            action: "Irkları Keşfet"
          },
          {
            id: "gitar-akor",
            name: "Akustik: Gitar Akor & Tab",
            icon: getAppSvg("gitar-akor", "populer-kultur"),
            desc: "Gitar akor şemaları, parmak basış rehberi, canlı transpoze (ton değiştirici) ve otomatik sayfa kaydırma.",
            url: "/gitar-akor",
            action: "Stüdyoyu Başlat"
          }
        ]
      },
      {
        id: "finans-piyasa",
        title: "Finans & Piyasa",
        icon: getCategorySvg("finans-piyasa"),
        desc: "Canlı döviz kurları, merkez bankaları verileri, makroekonomi ve kripto paralar",
        apps: [
          {
            id: "doviz-cevirici",
            name: "Anlık Döviz Çevirici",
            icon: getAppSvg("doviz-cevirici", "finans-piyasa"),
            desc: "Frankfurter & ECB resmi kurları ile 30+ para birimi, anlık çapraz kur çevirisi, Chart.js trend grafikleri ve getiri analizi.",
            url: "/doviz-cevirici",
            action: "Çeviriciyi Başlat"
          },
          {
            id: "kuresel-gostergeler",
            name: "Küresel Refah Göstergesi",
            icon: getAppSvg("kuresel-gostergeler", "finans-piyasa"),
            desc: "World Bank resmi verileriyle son 30 yıllık GSYİH, ömür, enflasyon, enerji ve refah endeksi analizi.",
            url: "/kuresel-gostergeler",
            action: "Göstergeleri İncele"
          },
          {
            id: "kripto-trend",
            name: "Kripto Trend & Piyasa Radarı",
            icon: getAppSvg("kripto-trend", "finans-piyasa"),
            desc: "CoinGecko API ile anlık kripto para fiyatları, 24 saatlik değişimler, trend tokenlar ve dönüştürücü.",
            url: "/kripto-trend",
            action: "Piyasayı İzle"
          }
        ]
      },
      {
        id: "gelistirici-araclari",
        title: "Geliştirici Araçları",
        icon: getCategorySvg("gelistirici-araclari"),
        badge: "Geliştirici Araçları",
        desc: "Ağ teşhisi, DNS yayılımı, parola güvenlik testleri, IP lokasyonu ve GitHub profil analitiği",
        apps: [
          {
            id: "github-analitik",
            name: "GitHub Profil Analitiği",
            icon: getAppSvg("github-analitik", "gelistirici-araclari"),
            desc: "Repo yıldızları, dil dağılımı, geliştirici kıdemi ve profillere gömülebilir dinamik SVG kartı üretimi.",
            url: "/github-analitik",
            action: "Profili İncele"
          },
          {
            id: "dns-kontrol",
            name: "DNS Kontrol & Ağ Teşhisi",
            icon: getAppSvg("dns-kontrol", "gelistirici-araclari"),
            desc: "Cloudflare & Google DoH ile anlık A, MX, TXT, NS kayıtları, küresel yayılım, SPF/DMARC ve gecikme testi.",
            url: "/dns-kontrol",
            action: "Kayıtları Çözümle"
          },
          {
            id: "sizinti-kontrol",
            name: "Sızıntı Kontrolü & Güvenlik",
            icon: getAppSvg("sizinti-kontrol", "gelistirici-araclari"),
            desc: "HaveIBeenPwned k-Anonymity (SHA-1) protokolü ile sıfır bilgi garantili şifre sızıntı denetimi ve entropi analizi.",
            url: "/sizinti-kontrol",
            action: "Güvenliği Test Et"
          },
          {
            id: "web-security-scanner",
            name: "Web Security Scanner",
            icon: getAppSvg("web-security-scanner", "gelistirici-araclari"),
            desc: "Pasif HTTP güvenlik başlıkları (CSP, HSTS, X-Frame), DoH DNS, SAST ve aktif zafiyet denetimi.",
            url: "https://github.com/melihkarasu/web-security-scanner",
            action: "GitHub Reposunu Aç"
          },
          {
            id: "vibecoding-security-rules",
            name: "VibeCoding Security Rules",
            icon: getAppSvg("vibecoding-security-rules", "gelistirici-araclari"),
            desc: "AI kodlama ajanları (Codex, Cursor, Claude Code, OpenClaw) için 146 SAST kuralı, 16 DAST modülü ve 2026 CVE savunma yönergesi.",
            url: "https://github.com/melihkarasu/vibecoding-security-rules",
            action: "GitHub Reposunu Aç"
          },
          {
            id: "vibecoding-kvkk-gdpr",
            name: "VibeCoding KVKK & GDPR Rules",
            icon: getAppSvg("vibecoding-kvkk-gdpr", "gelistirici-araclari"),
            desc: "AI ajanları için 6698 KVKK, AB GDPR, 6563 ETK (İYS) ve 6502 TKHK uyumlu Privacy-by-Design kodlama ve denetim yeteneği.",
            url: "https://github.com/melihkarasu/vibecoding-kvkk-gdpr",
            action: "GitHub Reposunu Aç"
          },
          {
            id: "ip-konum",
            name: "IP Coğrafi Konum & İstihbarat",
            icon: getAppSvg("ip-konum", "gelistirici-araclari"),
            desc: "ip-api ve SSRF korumalı altyapıyla IP lokasyonu, İnternet Servis Sağlayıcı (ISP), ASN ve harita koordinatları.",
            url: "/ip-konum",
            action: "Konumu Bul"
          },
          {
            id: "renk-studyosu",
            name: "Harmoni: Renk & Kontrast Stüdyosu",
            icon: getAppSvg("renk-studyosu", "gelistirici-araclari"),
            desc: "The Color API ile analog, komplementer renk şemaları, WCAG erişilebilirlik kontrast analizi ve CSS dışa aktarımı.",
            url: "/renk-studyosu",
            action: "Palet Üret"
          },
          {
            id: "http-status",
            name: "HTTP Sözlüğü & Cihaz Taraması",
            icon: getAppSvg("http-status", "gelistirici-araclari"),
            desc: "1xx-5xx HTTP durum kodları referansı, çözüm rehberi, cURL örnekleri ve canlı donanım/GPU parmak izi analizi.",
            url: "/http-status",
            action: "Teşhisi Aç"
          }
        ]
      },
      {
        id: "web-araclari",
        title: "Web Araçları",
        icon: getCategorySvg("web-araclari"),
        desc: "Gündelik dijital ihtiyaçlar ve pratik web yardımcıları",
        apps: [
          {
            id: "qr-studio",
            name: "QR Studio",
            icon: getAppSvg("qr-studio", "web-araclari"),
            desc: "Vektörel, logolu, gradyan renkli ve çok formatlı (URL, Wi-Fi, vCard) profesyonel QR üretici.",
            url: "/qr-studio",
            action: "Stüdyoyu Başlat"
          }
        ]
      }
    ];

    // ===== Veritabanı Destekli Sıralama (Admin Sürükle/Bırak) =====
    // Sabit dizi yedek (fallback); DB erişilemezse vitrin asla kırılmaz.
    let devRecommendedIds = [];
    try {
      const dbBase = (process.env.INTERNAL_SUPABASE_URL || process.env.SUPABASE_URL || 'http://vibe-supabase-kong:8000').replace(/\/app$/, '');
      let dbKey = process.env.SERVICE_ROLE_KEY;
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        const h64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
        const p64 = Buffer.from(JSON.stringify({ role: 'service_role', iss: 'supabase', iat: 1700000000, exp: 2100000000 })).toString('base64url');
        const s64 = require('crypto').createHmac('sha256', jwtSecret).update(h64 + '.' + p64).digest('base64url');
        dbKey = h64 + '.' + p64 + '.' + s64;
      }
      if (dbKey) {
        const dbHeaders = {};
        dbHeaders['api' + 'key'] = dbKey;
        dbHeaders['Authorization'] = 'Bearer ' + dbKey;
        const [catsRes, appsRes] = await Promise.all([
          fetch(dbBase + '/rest/v1/categories?select=*&order=sort_order.asc,created_at.asc', { headers: dbHeaders, signal: AbortSignal.timeout(3500) }),
          fetch(dbBase + '/rest/v1/apps?select=*&order=sort_order.asc,created_at.asc', { headers: dbHeaders, signal: AbortSignal.timeout(3500) })
        ]);
        if (catsRes.ok && appsRes.ok) {
          const dbCats = await catsRes.json();
          const dbApps = await appsRes.json();
          if (Array.isArray(dbApps)) {
            devRecommendedIds = dbApps
              .filter(a => a.developer_recommended === true && a.status !== 'hidden')
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .map(a => a.id);
          }
          if (Array.isArray(dbCats) && dbCats.length > 0 && Array.isArray(dbApps)) {
            const descMap = {};
            const appExtra = {};
            categories.forEach(c => {
              descMap[c.id] = c.desc;
              c.apps.forEach(a => { appExtra[a.id] = a; });
            });
            const merged = [];
            const seenCats = new Set();
            for (const dc of dbCats) {
              seenCats.add(dc.id);
              const catApps = dbApps
                .filter(a => a.category_id === dc.id && a.status !== 'hidden')
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || String(a.created_at || '').localeCompare(String(b.created_at || '')))
                .map(a => ({
                  id: a.id,
                  name: a.name,
                  icon: getAppSvg(a.id, dc.id),
                  desc: a.desc || (appExtra[a.id] ? appExtra[a.id].desc : ''),
                  url: a.id === 'web-security-scanner' ? 'https://github.com/melihkarasu/web-security-scanner' : (a.id === 'vibecoding-security-rules' ? 'https://github.com/melihkarasu/vibecoding-security-rules' : (a.id === 'vibecoding-kvkk-gdpr' ? 'https://github.com/melihkarasu/vibecoding-kvkk-gdpr' : a.url)),
                  action: (a.id === 'web-security-scanner' || a.id === 'vibecoding-security-rules' || a.id === 'vibecoding-kvkk-gdpr') ? 'GitHub Reposunu Aç' : (a.action || (appExtra[a.id] ? appExtra[a.id].action : 'Uygulamayı Aç'))
                }));
              const staticCat = categories.find(c => c.id === dc.id);
              if (staticCat && Array.isArray(staticCat.apps)) {
                const seenAppIds = new Set(catApps.map(x => x.id));
                staticCat.apps.forEach(sa => {
                  if (!seenAppIds.has(sa.id)) catApps.push(sa);
                });
              }
              merged.push({
                id: dc.id,
                title: dc.title,
                icon: getCategorySvg(dc.id),
                desc: descMap[dc.id] || (dc.title + ' uygulamaları'),
                apps: catApps
              });
            }
            categories.forEach(c => { if (!seenCats.has(c.id)) merged.push(c); });
            categories = merged.filter(c => c.apps.length > 0);
          }
        }
      }
    } catch (dbErr) {
      console.warn('[Vitrin] DB sıralaması alınamadı, sabit sıralama kullanılıyor:', dbErr.message);
    }

    const totalApps = categories.reduce((sum, c) => sum + c.apps.length, 0);

    // Tüm uygulamaların haritası (Favori render için)
    const appsMap = {};
    categories.forEach(c => {
      c.apps.forEach(a => {
        appsMap[a.id] = a;
      });
    });

    const starOutlineSvg = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    const arrowRightSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

    // Kategori Hızlı Filtre Hapları
    const categoryPillsHtml = categories.map(c => `
      <button type="button" onclick="filterByCategory('${c.id}')" id="cat-pill-${c.id}" class="vibe-cat-pill">
        ${c.icon}
        <span>${c.title}</span>
        <span class="text-[10px] font-mono opacity-75">(${c.apps.length})</span>
      </button>
    `).join('');

    // Accordion Sections (Modern Bento + Vector SVG Style)
    const accordionHtml = categories.map((c) => {
      return `
        <div id="cat-section-${c.id}" data-cat-id="${c.id}" class="accordion-item vibe-accordion-card mb-5">
          <!-- Accordion Header / Trigger -->
          <button 
            type="button" 
            onclick="toggleAccordion('${c.id}')"
            aria-expanded="true"
            id="acc-btn-${c.id}"
            class="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left bg-white hover:bg-stone-50/80 transition group cursor-pointer select-none">
            
            <div class="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <span class="vibe-cat-badge group-hover:scale-105">
                ${c.icon}
              </span>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-lg sm:text-2xl font-bold font-editorial text-mistral-ink tracking-tight group-hover:text-mistral-orange transition-colors">
                    ${c.title}
                  </h2>
                  <span class="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-orange-50 text-mistral-orange border border-orange-200 font-bold">
                    ${c.apps.length} Uygulama
                  </span>
                </div>
                <p class="text-xs text-mistral-slate mt-0.5 font-normal line-clamp-1 sm:line-clamp-none">
                  ${c.desc}
                </p>
              </div>
            </div>

            <!-- Chevron Icon -->
            <div class="ml-3 shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 group-hover:border-orange-200 group-hover:bg-orange-50 transition">
              <svg id="chevron-${c.id}" class="w-4 h-4 text-mistral-slate transform transition-transform duration-300 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </button>

          <!-- Accordion Body / App Cards Grid -->
          <div id="acc-body-${c.id}" class="accordion-content px-4 sm:px-6 pb-5 sm:pb-6 pt-4 border-t border-stone-200/70 bg-[#F8FAFC] block">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              ${c.apps.map(app => `
                <div data-app-id="${app.id}" data-search="${(app.name + ' ' + app.desc + ' ' + c.title).toLowerCase().replace(/"/g, '')}" class="vibe-app-card group">
                  <div>
                    <!-- Üst Satır: Vektörel İkon + İsim + Favori Butonu -->
                    <div class="flex items-start justify-between gap-3 mb-3">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="vibe-app-icon">
                          ${app.icon}
                        </div>
                        <h3 class="text-base font-bold font-editorial text-mistral-ink tracking-tight leading-snug line-clamp-2 min-w-0" title="${app.name}">
                          ${app.name}
                        </h3>
                      </div>
                      <button 
                        type="button"
                        onclick="toggleFav(event, '${app.id}')"
                        id="star-btn-${app.id}"
                        title="Favorilere Ekle / Çıkar"
                        class="vibe-fav-btn">
                        <span id="star-icon-${app.id}" class="inline-flex items-center justify-center">${starOutlineSvg}</span>
                      </button>
                    </div>

                    <p class="text-mistral-slate text-xs sm:text-sm leading-relaxed">
                      ${app.desc}
                    </p>
                  </div>

                  <a href="${app.url}" ${app.url.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} class="vibe-card-cta">
                    <span>${app.action}</span>
                    ${arrowRightSvg}
                  </a>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const content = `
      <!-- Modern Vitrin Hero & Omni-Search Komuta Merkezi -->
      <section class="vibe-hero-card p-5 sm:p-8 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div class="max-w-2xl">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold mb-3">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              <span>AÇIK KAYNAK MİKRO UYGULAMA VİTRİNİ</span>
            </div>
            <h1 class="text-3xl sm:text-5xl font-extrabold font-editorial tracking-tight text-mistral-ink leading-tight mb-3">
              Yenilikçi Mikro Uygulamalar, <span class="italic text-mistral-orange">Tamamen Ücretsiz.</span>
            </h1>
            <p class="text-mistral-slate text-xs sm:text-base leading-relaxed">
              Uzay ve moleküler bilimden siber güvenliğe, coğrafya ve sağlıktan finans ve çok oyunculu bilgi düellolarına kadar bağımsız çalışan modern web araçları.
            </p>
          </div>

          <!-- Bento Stat Callout Grid -->
          <div class="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div class="p-3 sm:p-4 rounded-xl bg-stone-50/90 border border-stone-200/90 text-center">
              <div class="text-xl sm:text-3xl font-extrabold font-mono text-mistral-orange">${totalApps}</div>
              <div class="text-[10px] sm:text-xs text-mistral-slate font-semibold mt-0.5">Uygulama</div>
            </div>
            <div class="p-3 sm:p-4 rounded-xl bg-stone-50/90 border border-stone-200/90 text-center">
              <div class="text-xl sm:text-3xl font-extrabold font-mono text-mistral-ink">${categories.length}</div>
              <div class="text-[10px] sm:text-xs text-mistral-slate font-semibold mt-0.5">Kategori</div>
            </div>
            <div class="p-3 sm:p-4 rounded-xl bg-orange-50/80 border border-orange-200 text-center">
              <div class="text-xl sm:text-3xl font-extrabold font-mono text-mistral-orange">%100</div>
              <div class="text-[10px] sm:text-xs text-orange-900 font-semibold mt-0.5">Açık &amp; Ücretsiz</div>
            </div>
          </div>
        </div>

        <!-- Canlı Omni-Search & Kategori Filtre Barı -->
        <div class="vibe-omni-dock space-y-3">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div class="relative flex-1 flex items-center">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input
                type="text"
                id="vitrin-search-input"
                oninput="filterVitrinApps()"
                placeholder="${totalApps} mikro uygulama içinde ara (örn: eczane, güvenlik, sudoku, döviz, radyo, dns...)"
                class="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-mistral-ink placeholder-stone-400 transition-all"
              />
              <button
                type="button"
                id="vitrin-search-clear"
                onclick="clearVitrinSearch()"
                class="hidden absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-mistral-ink cursor-pointer"
                title="Aramayı Temizle"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="flex items-center gap-1.5 shrink-0 justify-end">
              <button type="button" onclick="expandAllAccordions()" class="vibe-btn vibe-btn-sm vibe-btn-dark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                <span>Tümünü Aç</span>
              </button>
              <button type="button" onclick="collapseAllAccordions()" class="vibe-btn vibe-btn-sm vibe-btn-secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
                <span>Daralt</span>
              </button>
            </div>
          </div>

          <!-- Yatay Kaydırılabilir Hızlı Kategori Filtresi -->
          <div class="vibe-cat-pills" role="navigation" aria-label="Kategori Filtreleri">
            <button type="button" onclick="filterByCategory('all')" id="cat-pill-all" class="vibe-cat-pill is-active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span>Tümü (${totalApps})</span>
            </button>