const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 5. Dijital Kütüphane: Gutenberg Tam Metin Çekme & Arama API
// =============================================================
const bookTextCache = new Map();
const bookSearchCache = new Map();

// Zenginleştirilmiş Öne Çıkan Klasikler Kataloğu (Hızlı Arama & Gutenberg ID Eşleştirmesi)
const CLASSIC_CATALOG = [
  { id: 84, title: 'Frankenstein; Or, The Modern Prometheus', trTitle: 'Frankenstein', author: 'Mary Wollstonecraft Shelley', year: 1818, category: 'bilim', cover: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg' },
  { id: 2554, title: 'Crime and Punishment', trTitle: 'Suç ve Ceza', author: 'Fyodor Dostoyevsky', year: 1866, category: 'roman', cover: 'https://www.gutenberg.org/cache/epub/2554/pg2554.cover.medium.jpg' },
  { id: 1342, title: 'Pride and Prejudice', trTitle: 'Gurur ve Önyargı', author: 'Jane Austen', year: 1813, category: 'roman', cover: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg' },
  { id: 28054, title: 'The Brothers Karamazov', trTitle: 'Karamazov Kardeşler', author: 'Fyodor Dostoyevsky', year: 1880, category: 'roman', cover: 'https://www.gutenberg.org/cache/epub/28054/pg28054.cover.medium.jpg' },
  { id: 2600, title: 'War and Peace', trTitle: 'Savaş ve Barış', author: 'Leo Tolstoy', year: 1869, category: 'roman', cover: 'https://www.gutenberg.org/cache/epub/2600/pg2600.cover.medium.jpg' },
  { id: 1399, title: 'Anna Karenina', trTitle: 'Anna Karenina', author: 'Leo Tolstoy', year: 1877, category: 'roman', cover: 'https://www.gutenberg.org/cache/epub/1399/pg1399.cover.medium.jpg' },
  { id: 5200, title: 'The Metamorphosis', trTitle: 'Dönüşüm', author: 'Franz Kafka', year: 1915, category: 'roman', cover: 'https://www.gutenberg.org/cache/epub/5200/pg5200.cover.medium.jpg' },
  { id: 345, title: 'Dracula', trTitle: 'Dracula', author: 'Bram Stoker', year: 1897, category: 'macera', cover: 'https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg' },
  { id: 1661, title: 'The Adventures of Sherlock Holmes', trTitle: 'Sherlock Holmes Maceraları', author: 'Arthur Conan Doyle', year: 1892, category: 'macera', cover: 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg' },
  { id: 174, title: 'The Picture of Dorian Gray', trTitle: 'Dorian Gray\'in Portresi', author: 'Oscar Wilde', year: 1890, category: 'roman', cover: 'https://www.gutenberg.org/cache/epub/174/pg174.cover.medium.jpg' },
  { id: 1260, title: 'Jane Eyre: An Autobiography', trTitle: 'Jane Eyre', author: 'Charlotte Brontë', year: 1847, category: 'roman', cover: 'https://www.gutenberg.org/cache/epub/1260/pg1260.cover.medium.jpg' },
  { id: 2701, title: 'Moby Dick; Or, The Whale', trTitle: 'Moby Dick', author: 'Herman Melville', year: 1851, category: 'macera', cover: 'https://www.gutenberg.org/cache/epub/2701/pg2701.cover.medium.jpg' },
  { id: 11, title: 'Alice\'s Adventures in Wonderland', trTitle: 'Alice Harikalar Diyarında', author: 'Lewis Carroll', year: 1865, category: 'macera', cover: 'https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg' },
  { id: 16328, title: 'The Art of War', trTitle: 'Savaş Sanatı', author: 'Sun Tzu', year: -500, category: 'felsefe', cover: 'https://www.gutenberg.org/cache/epub/16328/pg16328.cover.medium.jpg' },
  { id: 1232, title: 'The Prince', trTitle: 'Prens / Hükümdar', author: 'Niccolò Machiavelli', year: 1532, category: 'felsefe', cover: 'https://www.gutenberg.org/cache/epub/1232/pg1232.cover.medium.jpg' },
  { id: 1497, title: 'The Republic', trTitle: 'Devlet', author: 'Plato (Platon)', year: -375, category: 'felsefe', cover: 'https://www.gutenberg.org/cache/epub/1497/pg1497.cover.medium.jpg' },
  { id: 4300, title: 'Ulysses', trTitle: 'Ulysses', author: 'James Joyce', year: 1922, category: 'roman', cover: 'https://www.gutenberg.org/cache/epub/4300/pg4300.cover.medium.jpg' },
  { id: 76, title: 'Adventures of Huckleberry Finn', trTitle: 'Huckleberry Finn\'in Maceraları', author: 'Mark Twain', year: 1884, category: 'macera', cover: 'https://www.gutenberg.org/cache/epub/76/pg76.cover.medium.jpg' },
  { id: 98, title: 'A Tale of Two Cities', trTitle: 'İki Şehrin Hikayesi', author: 'Charles Dickens', year: 1859, category: 'roman', cover: 'https://www.gutenberg.org/cache/epub/98/pg98.cover.medium.jpg' },
  { id: 100, title: 'The Complete Works of William Shakespeare', trTitle: 'Shakespeare Tüm Eserleri', author: 'William Shakespeare', year: 1623, category: 'roman', cover: 'https://www.gutenberg.org/cache/epub/100/pg100.cover.medium.jpg' },
  { id: 8800, title: 'The Divine Comedy', trTitle: 'İlahi Komedya', author: 'Dante Alighieri', year: 1320, category: 'felsefe', cover: 'https://www.gutenberg.org/cache/epub/8800/pg8800.cover.medium.jpg' },
  { id: 2852, title: 'The Hound of the Baskervilles', trTitle: 'Baskerville\'lerin Köpeği', author: 'Arthur Conan Doyle', year: 1902, category: 'macera', cover: 'https://www.gutenberg.org/cache/epub/2852/pg2852.cover.medium.jpg' },
  { id: 36, title: 'The War of the Worlds', trTitle: 'Dünyalar Savaşı', author: 'H. G. Wells', year: 1898, category: 'bilim', cover: 'https://www.gutenberg.org/cache/epub/36/pg36.cover.medium.jpg' },
  { id: 35, title: 'The Time Machine', trTitle: 'Zaman Makinesi', author: 'H. G. Wells', year: 1895, category: 'bilim', cover: 'https://www.gutenberg.org/cache/epub/35/pg35.cover.medium.jpg' },
  { id: 1400, title: 'Great Expectations', trTitle: 'Büyük Umutlar', author: 'Charles Dickens', year: 1861, category: 'roman', cover: 'https://www.gutenberg.org/cache/epub/1400/pg1400.cover.medium.jpg' }
];

// İsimle / Yazarla Kitap Arama Endpoint'i: GET /api/kutuphane/search?q=...
router.get('/kutuphane/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  if (!query) {
    return res.status(400).json({ success: false, error: 'Arama terimi girilmedi' });
  }

  const cacheKey = query.toLowerCase();
  if (bookSearchCache.has(cacheKey)) {
    return res.json(bookSearchCache.get(cacheKey));
  }

  try {
    function normalizeTr(s) {
      return (s || '')
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/dostoyevski/g, 'dostoyevsky')
        .replace(/tolstoy/g, 'tolstoy')
        .replace(/sefiller/g, 'les miserables')
        .replace(/donusum/g, 'metamorphosis');
    }

    const qLower = query.toLowerCase();
    const qNorm = normalizeTr(query);

    // 1. Adım: Yerel Gutenberg Kataloğunda Eşleşenleri Bul (Akıllı Türkçe/İngilizce Normalizasyon)
    const localMatches = CLASSIC_CATALOG.filter(b => {
      const bTitleNorm = normalizeTr(b.title);
      const bTrNorm = normalizeTr(b.trTitle || '');
      const bAuthorNorm = normalizeTr(b.author);
      const bCatNorm = normalizeTr(b.category || '');

      return bTitleNorm.includes(qNorm) ||
             bTrNorm.includes(qNorm) ||
             bAuthorNorm.includes(qNorm) ||
             bCatNorm.includes(qNorm) ||
             b.title.toLowerCase().includes(qLower) ||
             b.author.toLowerCase().includes(qLower);
    });

    // 2. Adım: Open Library Canlı Arama Servisinden Tamamlayıcı Sonuçlar
    let externalMatches = [];
    try {
      const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12`;
      const olRes = await fetch(olUrl, {
        headers: { 'User-Agent': 'VibeCodedApps/1.0 (dev@vibecodedapps.local)' },
        signal: AbortSignal.timeout(5000)
      });

      if (olRes.ok) {
        const olData = await olRes.json();
        const docs = olData.docs || [];

        docs.forEach(doc => {
          const title = doc.title || 'İsimsiz Eser';
          const author = (doc.author_name && doc.author_name[0]) ? doc.author_name[0] : 'Bilinmeyen Yazar';
          
          let gutenbergId = null;
          if (doc.id_project_gutenberg && doc.id_project_gutenberg.length > 0) {
            gutenbergId = parseInt(doc.id_project_gutenberg[0], 10);
          }

          let coverUrl = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80';
          if (doc.cover_i) {
            coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
          } else if (gutenbergId) {
            coverUrl = `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.cover.medium.jpg`;
          }

          externalMatches.push({
            id: gutenbergId || (doc.key ? doc.key.replace('/works/', '') : null),
            gutenbergId: gutenbergId,
            title: title,
            author: author,
            year: doc.first_publish_year || doc.publish_year?.[0] || 'Klasik',
            cover: coverUrl,
            hasFullText: !!gutenbergId,
            isExternal: true
          });
        });
      }
    } catch(olErr) {
      // Harici arama gecikirse yerel sonuçlar yeterli
    }

    // Birleştir ve Tekilleştir (Local matches öncelikli)
    const combined = [...localMatches];
    const seenTitles = new Set(localMatches.map(m => m.title.toLowerCase()));

    externalMatches.forEach(item => {
      const tLower = item.title.toLowerCase();
      if (!seenTitles.has(tLower)) {
        seenTitles.add(tLower);
        combined.push(item);
      }
    });

    const result = {
      success: true,
      query: query,
      total: combined.length,
      books: combined.slice(0, 24)
    };

    bookSearchCache.set(cacheKey, result);
    res.json(result);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Kitap arama hatası: ' + err.message });
  }
});

router.get('/kutuphane/read', async (req, res) => {
  const bookId = parseInt(req.query.id);
  if (!bookId || isNaN(bookId) || bookId <= 0) {
    return res.status(400).json({ success: false, error: 'Geçersiz kitap ID' });
  }

  if (bookTextCache.has(bookId)) {
    return res.json(bookTextCache.get(bookId));
  }

  try {
    const url = `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'VibeCodedApps/1.0' },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return res.status(404).json({ success: false, error: 'Kitap metnine ulaşılamadı' });
    }

    const fullText = await response.text();

    let cleanText = fullText;
    const startMarkers = [
      '*** START OF THE PROJECT GUTENBERG',
      '*** START OF THIS PROJECT GUTENBERG',
      '*END*THE SMALL PRINT'
    ];
    for (const marker of startMarkers) {
      const idx = cleanText.indexOf(marker);
      if (idx !== -1) {
        const nextLine = cleanText.indexOf('\n', idx);
        if (nextLine !== -1) cleanText = cleanText.substring(nextLine + 1);
        break;
      }
    }

    const endMarkers = [
      '*** END OF THE PROJECT GUTENBERG',
      '*** END OF THIS PROJECT GUTENBERG',
      'End of the Project Gutenberg'
    ];
    for (const marker of endMarkers) {
      const idx = cleanText.indexOf(marker);
      if (idx !== -1) {
        cleanText = cleanText.substring(0, idx);
        break;
      }
    }

    cleanText = cleanText.trim();
    const wordCount = cleanText.split(/\s+/).length;

    // Başlık ve yazar bilgisini metin başlığından çek
    let metaTitle = null;
    let metaAuthor = null;
    const titleMatch = fullText.slice(0, 3000).match(/Title:\s*([^\r\n]+)/i);
    if (titleMatch) metaTitle = titleMatch[1].trim();
    const authorMatch = fullText.slice(0, 3000).match(/Author:\s*([^\r\n]+)/i);
    if (authorMatch) metaAuthor = authorMatch[1].trim();

    const result = {
      success: true,
      id: bookId,
      title: metaTitle,
      author: metaAuthor,
      wordCount: wordCount,
      content: cleanText
    };

    bookTextCache.set(bookId, result);
    res.json(result);
  } catch(err) {
    res.status(500).json({ success: false, error: 'Metin çekme hatası: ' + err.message });
  }
});

module.exports = router;
