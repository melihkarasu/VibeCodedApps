/**
 * Dijital Kütüphane & E-Kitap Okuyucu (app.js)
 * Project Gutenberg arşivi, isimle kitap/yazar arama, Web Speech API sesli okuyucu ve yerel kitaplık yönetimi.
 */

const SHELF_STORAGE_KEY = '***';

// 12 Seçkin Başyapıt Veritabanı
const CLASSIC_BOOKS = [
  {
    id: 1342,
    title: "Pride and Prejudice",
    titleTr: "Gurur ve Önyargı",
    author: "Jane Austen",
    category: "roman",
    cover: "https://covers.openlibrary.org/b/id/10522165-M.jpg",
    year: 1813,
    words: "~120.000",
    desc: "19. yüzyıl İngiltere'sinde sınıf çatışması, aşk ve toplumsal önyargıların klasik başyapıtı."
  },
  {
    id: 84,
    title: "Frankenstein",
    titleTr: "Frankenstein",
    author: "Mary Shelley",
    category: "macera",
    cover: "https://covers.openlibrary.org/b/id/8315182-M.jpg",
    year: 1818,
    words: "~75.000",
    desc: "Bilimin sınırları, insan yaratımı ve yalnızlık temasını işleyen ilk gotik bilimkurgu romanı."
  },
  {
    id: 1661,
    title: "The Adventures of Sherlock Holmes",
    titleTr: "Sherlock Holmes Maceraları",
    author: "Arthur Conan Doyle",
    category: "macera",
    cover: "https://covers.openlibrary.org/b/id/8235114-M.jpg",
    year: 1892,
    words: "~105.000",
    desc: "Baker Sokağı 221B'den dahi dedektif Sherlock Holmes ve Dr. Watson'ın en ünlü 12 vakası."
  },
  {
    id: 5200,
    title: "Metamorphosis",
    titleTr: "Dönüşüm",
    author: "Franz Kafka",
    category: "roman",
    cover: "https://covers.openlibrary.org/b/id/8750849-M.jpg",
    year: 1915,
    words: "~22.000",
    desc: "Bir sabah bunaltıcı düşlerden uyanan Gregor Samsa'nın devasa bir böceğe dönüşme hikayesi."
  },
  {
    id: 11,
    title: "Alice's Adventures in Wonderland",
    titleTr: "Alice Harikalar Diyarında",
    author: "Lewis Carroll",
    category: "roman",
    cover: "https://covers.openlibrary.org/b/id/8314115-M.jpg",
    year: 1865,
    words: "~27.000",
    desc: "Tavşan deliğinden düşerek absürt, rüya gibi bir dünyaya adım atan Alice'in unutulmaz serüveni."
  },
  {
    id: 132,
    title: "The Art of War",
    titleTr: "Savaş Sanatı",
    author: "Sun Tzu",
    category: "felsefe",
    cover: "https://covers.openlibrary.org/b/id/8231856-M.jpg",
    year: -500,
    words: "~11.000",
    desc: "2500 yıllık antik Çin askeri strateji, taktik ve liderlik klasiği."
  },
  {
    id: 345,
    title: "Dracula",
    titleTr: "Drakula",
    author: "Bram Stoker",
    category: "macera",
    cover: "https://covers.openlibrary.org/b/id/8231990-M.jpg",
    year: 1897,
    words: "~160.000",
    desc: "Transilvanya şatolarından Londra sokaklarına uzanan gotik vampir edebiyatının kurucu eseri."
  },
  {
    id: 98,
    title: "A Tale of Two Cities",
    titleTr: "İki Şehrin Hikayesi",
    author: "Charles Dickens",
    category: "roman",
    cover: "https://covers.openlibrary.org/b/id/8235281-M.jpg",
    year: 1859,
    words: "~135.000",
    desc: "Fransız İhtilali gölgesinde Londra ve Paris arasında geçen fedakarlık ve yeniden doğuş destanı."
  },
  {
    id: 174,
    title: "The Picture of Dorian Gray",
    titleTr: "Dorian Gray'in Portresi",
    author: "Oscar Wilde",
    category: "roman",
    cover: "https://covers.openlibrary.org/b/id/8235290-M.jpg",
    year: 1890,
    words: "~80.000",
    desc: "Ruhu karşılığında ebedi gençlik ve güzellik dileyen bir adamın ahlaki çöküşü."
  },
  {
    id: 2701,
    title: "Moby Dick",
    titleTr: "Moby Dick",
    author: "Herman Melville",
    category: "macera",
    cover: "https://covers.openlibrary.org/b/id/8235300-M.jpg",
    year: 1851,
    words: "~205.000",
    desc: "Kaptan Ahab'ın dev beyaz balinaya karşı takıntılı, felsefi ve ölümcül intikam arayışı."
  },
  {
    id: 1232,
    title: "The Prince",
    titleTr: "Prens / Hükümdar",
    author: "Niccolò Machiavelli",
    category: "felsefe",
    cover: "https://covers.openlibrary.org/b/id/8231860-M.jpg",
    year: 1532,
    words: "~35.000",
    desc: "Rönesans İtalyasında güç, iktidar ve devlet yönetimi üzerine pragmatik başucu eseri."
  },
  {
    id: 1400,
    title: "Great Expectations",
    titleTr: "Büyük Umutlar",
    author: "Charles Dickens",
    category: "roman",
    cover: "https://covers.openlibrary.org/b/id/8235272-M.jpg",
    year: 1861,
    words: "~186.000",
    desc: "Yetim Pip'in gizemli bir servetle beyefendi olma yolculuğu ve sınıf çatışması."
  }
];

let activeBook = null;
let readerTheme = 'dark';
let isSerif = true;
let fontSize = 18;

// 1. Kitap Kartlarını Çizme & Filtreleme
function renderBooks(list) {
  const grid = document.getElementById('books-grid');
  if (!grid) return;
  grid.innerHTML = list.map(b => `
    <div class="book-card p-3 rounded-2xl bg-white border border-mistral-hairline hover:border-emerald-500/50 transition-all duration-300 shadow-lg flex flex-col justify-between group cursor-pointer" onclick="openBookReader(${b.id})">
      <div>
        <div class="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-2.5 bg-mistral-canvas shadow">
          <img src="${b.cover}" alt="${b.title}" class="book-cover-img w-full h-full object-cover transition-transform duration-500">
          <div class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-emerald-400 font-mono font-bold">
            ${b.year > 0 ? b.year : 'M.Ö.' + Math.abs(b.year)}
          </div>
        </div>

        <h4 class="font-bold text-xs text-mistral-ink group-hover:text-emerald-400 transition truncate">${b.titleTr || b.title}</h4>
        <p class="text-[11px] text-mistral-slate truncate mt-0.5">${b.author}</p>
      </div>

      <div class="pt-2 border-t border-mistral-hairline flex items-center justify-between mt-2.5 text-[10px]">
        <span class="text-mistral-stone font-mono">${b.words}</span>
        <span class="text-emerald-400 font-bold group-hover:underline">Oku &rarr;</span>
      </div>
    </div>
  `).join('');
}

function filterBooks(cat) {
  document.querySelectorAll('.filter-tag-btn').forEach(btn => {
    btn.className = 'filter-tag-btn px-3 py-1.5 rounded-xl bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition';
  });
  const activeBtn = document.getElementById('f-' + cat);
  if (activeBtn) {
    activeBtn.className = 'filter-tag-btn px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold transition shadow';
  }

  if (cat === 'all') {
    renderBooks(CLASSIC_BOOKS);
  } else {
    renderBooks(CLASSIC_BOOKS.filter(b => b.category === cat));
  }
}

// 2. Tam Metin Okuyucuyu Başlat (Reader Modal)
async function openBookReader(bookId, optTitle = null, optAuthor = null, optCover = null, optTrTitle = null) {
  if (window.showToast) window.showToast('📖 Kitap metni Project Gutenberg arşivinden yükleniyor...');

  let bookInfo = CLASSIC_BOOKS.find(b => b.id === bookId);
  if (!bookInfo) {
    const finalTitle = optTrTitle || optTitle || ('Kitap #' + bookId);
    const finalAuthor = (optAuthor && !optAuthor.includes('Project Gutenberg')) ? optAuthor : 'Klasik Edebiyat Yazarı';
    bookInfo = {
      id: bookId,
      title: optTitle || finalTitle,
      titleTr: finalTitle,
      author: finalAuthor,
      cover: optCover || ('https://www.gutenberg.org/cache/epub/' + bookId + '/pg' + bookId + '.cover.medium.jpg')
    };
  }

  activeBook = bookInfo;

  document.getElementById('reader-book-title').innerText = bookInfo.titleTr || bookInfo.title;
  document.getElementById('reader-book-author').innerText = bookInfo.author;

  const textContainer = document.getElementById('reader-text-content');
  textContainer.innerHTML = '<div class="py-20 text-center text-mistral-slate"><div class="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-3"></div>Metin yükleniyor...</div>';
  document.getElementById('reader-modal').classList.remove('hidden');

  try {
    const res = await fetch(`/api/kutuphane/read?id=${bookId}`);
    const data = await res.json();

    if (!data.success || !data.content) {
      throw new Error('Metin alınamadı');
    }

    // Metni paragraflara böl ve ekrana bas (Sesli okuma için indeksli)
    currentBookParagraphs = data.content
      .split(/\r?\n\r?\n/)
      .filter(p => p.trim().length > 0)
      .map(p => p.replace(/\r?\n/g, ' ').trim());

    textContainer.innerHTML = currentBookParagraphs.map((p, idx) => `
      <p class="leading-relaxed selectable-paragraph" id="book-p-${idx}" data-idx="${idx}" onclick="startSpeechAt(${idx})" title="Bu paragrafı sesli dinlemek için tıklayın">${p}</p>
    `).join('');

    document.getElementById('reader-stats-wordcount').innerText = `${data.wordCount.toLocaleString('tr-TR')} Kelime`;

    // Backend'den gerçek başlık/yazar geldiyse ve varsayılansa güncelle
    if (data.title && (!bookInfo.title || bookInfo.title.includes('Kitap #'))) {
      bookInfo.title = data.title;
      bookInfo.titleTr = data.title;
      if (data.author) bookInfo.author = data.author;
      document.getElementById('reader-book-title').innerText = bookInfo.titleTr || bookInfo.title;
      document.getElementById('reader-book-author').innerText = bookInfo.author;
    }

    // Daha önce kayıtlı bir yer imi var mı kontrol et
    restoreBookmark(bookId);

    // Kitaplığa ekle (Her zaman gerçek başlık ve yazarla!)
    addToShelf(bookInfo);
  } catch(err) {
    textContainer.innerHTML = '<div class="py-20 text-center text-rose-400">Kitap metnine ulaşılamadı. Gutenberg sunucusu yanıt vermiyor veya kitap metin formatında değil.</div>';
  }
}

function loadCustomGutenbergBook() {
  const val = parseInt(document.getElementById('input-gutenberg-id').value);
  if (!val || val <= 0) {
    if (window.showToast) window.showToast('Lütfen geçerli bir sayısal Gutenberg ID girin.');
    return;
  }
  openBookReader(val);
}

function closeReader() {
  stopSpeech();
  saveBookmark();
  document.getElementById('reader-modal').classList.add('hidden');
  activeBook = null;
}

// 3. Okuma Ayarları (Tema, Font, Boyut)
function setReaderTheme(theme) {
  readerTheme = theme;
  const vp = document.getElementById('reader-viewport');
  if (!vp) return;
  vp.className = 'flex-1 overflow-y-auto p-6 sm:p-12 book-theme-' + theme + ' book-theme-' + (theme === 'sepya' ? 'sepia' : theme) + ' ' + (isSerif ? 'font-serif-reader' : 'font-sans-reader') + ' transition-colors duration-300';

  ['dark', 'sepya', 'light'].forEach(t => {
    const btn = document.getElementById('theme-btn-' + t);
    if (!btn) return;
    if (t === theme) {
      btn.className = 'px-2.5 py-1 rounded-lg text-emerald-400 font-bold bg-slate-900 border border-emerald-500 shadow-sm transition ring-2 ring-emerald-400/40';
    } else {
      btn.className = 'px-2.5 py-1 rounded-lg text-mistral-slate font-bold hover:bg-mistral-cream transition';
    }
  });
}

function toggleFontFamily() {
  isSerif = !isSerif;
  const btn = document.getElementById('btn-font-family');
  if (btn) btn.innerText = isSerif ? 'Serif' : 'Sans';
  setReaderTheme(readerTheme);
}

function changeFontSize(delta) {
  fontSize = Math.min(28, Math.max(14, fontSize + delta));
  document.getElementById('label-font-size').innerText = fontSize + 'px';
  document.getElementById('reader-text-content').style.fontSize = fontSize + 'px';
}

function handleScroll() {
  const vp = document.getElementById('reader-viewport');
  if (!vp) return;
  const maxScroll = vp.scrollHeight - vp.clientHeight;
  if (maxScroll <= 0) return;

  const pct = Math.min(100, Math.round((vp.scrollTop / maxScroll) * 100));
  document.getElementById('reader-progress-pct').innerText = `%${pct} Okundu`;
  document.getElementById('reader-progress-bar').style.width = pct + '%';
}

// 4. Yer İmi & Kitaplık (Storage & Bookmarks)
function saveBookmark() {
  if (!activeBook) return;
  const vp = document.getElementById('reader-viewport');
  if (!vp) return;
  const maxScroll = vp.scrollHeight - vp.clientHeight;
  const pct = maxScroll > 0 ? Math.min(100, Math.round((vp.scrollTop / maxScroll) * 100)) : 0;

  let shelf = getShelf();
  const item = shelf.find(b => b.id === activeBook.id);
  if (item) {
    item.scrollPos = vp.scrollTop;
    item.progressPct = pct;
    item.lastRead = new Date().toLocaleDateString('tr-TR');
  } else {
    shelf.unshift({
      id: activeBook.id,
      title: activeBook.titleTr || activeBook.title,
      author: activeBook.author,
      cover: activeBook.cover,
      scrollPos: vp.scrollTop,
      progressPct: pct,
      lastRead: new Date().toLocaleDateString('tr-TR')
    });
  }

  localStorage.setItem(SHELF_STORAGE_KEY, JSON.stringify(shelf));
  renderShelf();
  if (window.showToast) window.showToast(`✓ Yer imi kaydedildi (%${pct})`);
}

function restoreBookmark(bookId) {
  const shelf = getShelf();
  const item = shelf.find(b => b.id === bookId);
  if (item && item.scrollPos > 0) {
    setTimeout(() => {
      const vp = document.getElementById('reader-viewport');
      if (vp) {
        vp.scrollTop = item.scrollPos;
        if (window.showToast) window.showToast(`✓ Kaldığınız yerden devam ediliyor (%${item.progressPct})`);
      }
    }, 300);
  }
}

function getShelf() {
  try {
    return JSON.parse(localStorage.getItem(SHELF_STORAGE_KEY) || '[]');
  } catch(e) {
    return [];
  }
}

function addToShelf(book) {
  let shelf = getShelf();
  if (!shelf.some(b => b.id === book.id)) {
    shelf.unshift({
      id: book.id,
      title: book.titleTr || book.title,
      author: book.author,
      cover: book.cover,
      scrollPos: 0,
      progressPct: 0,
      lastRead: new Date().toLocaleDateString('tr-TR')
    });
    localStorage.setItem(SHELF_STORAGE_KEY, JSON.stringify(shelf));
    renderShelf();
  }
}

function renderShelf() {
  const grid = document.getElementById('shelf-grid');
  const empty = document.getElementById('shelf-empty');
  if (!grid || !empty) return;
  const list = getShelf();

  if (list.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  grid.innerHTML = list.map(item => `
    <div class="p-3 rounded-2xl bg-white border border-mistral-hairline hover:border-emerald-500/40 transition flex items-center gap-3">
      <img src="${item.cover}" class="w-12 h-16 rounded-xl object-cover shrink-0 cursor-pointer shadow" onclick="openBookReader(${item.id})">
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-xs text-mistral-ink truncate cursor-pointer hover:text-emerald-400" onclick="openBookReader(${item.id})">${item.title}</h4>
        <p class="text-[10px] text-mistral-slate truncate">${item.author}</p>
        <div class="flex items-center gap-2 mt-1">
          <div class="w-16 h-1 rounded-full bg-white overflow-hidden">
            <div class="h-full bg-emerald-500" style="width: ${item.progressPct || 0}%;"></div>
          </div>
          <span class="text-[9px] text-emerald-400 font-mono font-bold">%${item.progressPct || 0}</span>
        </div>
      </div>
      <button onclick="removeFromShelf(${item.id})" class="text-xs text-mistral-stone hover:text-rose-400 p-1 transition cursor-pointer" title="Kaldır">
        ✕
      </button>
    </div>
  `).join('');
}

function removeFromShelf(id) {
  let shelf = getShelf();
  shelf = shelf.filter(b => b.id !== id);
  localStorage.setItem(SHELF_STORAGE_KEY, JSON.stringify(shelf));
  renderShelf();
}

function clearShelf() {
  if (!confirm('Tüm kitaplık kayıtlarınızı silmek istediğinize emin misiniz?')) return;
  localStorage.removeItem(SHELF_STORAGE_KEY);
  renderShelf();
}

// 5. Web Speech API Sesli Kitap Oynatıcı (Text-to-Speech)
let currentBookParagraphs = [];
let currentParagraphIndex = 0;
let isPlayingSpeech = false;
let isPausedSpeech = false;
let speechRate = 1.0;
let speechLang = 'en-US';
let ttsUtterance = null;
let speechSessionId = 0;

function toggleTtsBar() {
  const bar = document.getElementById('tts-player-bar');
  if (!bar) return;
  if (bar.classList.contains('hidden')) {
    bar.classList.remove('hidden');
    if (window.showToast) window.showToast("🎧 Sesli kitap çubuğu açıldı. Oynat butonuna basın veya bir paragrafa tıklayın.");
  } else {
    bar.classList.add('hidden');
    stopSpeech();
  }
}

function changeSpeechLanguage(lang) {
  speechLang = lang;
  if (window.showToast) window.showToast('Seslendirme dili: ' + lang);
  if (isPlayingSpeech && !isPausedSpeech) {
    startSpeechAt(currentParagraphIndex);
  }
}

function togglePlayPauseSpeech() {
  if (!('speechSynthesis' in window)) {
    if (window.showToast) window.showToast('Tarayıcınız sesli okuma özelliğini (SpeechSynthesis) desteklemiyor.');
    return;
  }

  if (isPlayingSpeech && !isPausedSpeech) {
    window.speechSynthesis.pause();
    isPausedSpeech = true;
    document.getElementById('btn-tts-play').innerText = '▶';
    document.getElementById('tts-status-text').innerText = 'Duraklatıldı';
  } else if (isPausedSpeech) {
    window.speechSynthesis.resume();
    isPausedSpeech = false;
    document.getElementById('btn-tts-play').innerText = '⏸';
    document.getElementById('tts-status-text').innerText = 'Okunuyor (' + (currentParagraphIndex + 1) + '/' + currentBookParagraphs.length + ')';
  } else {
    startSpeechAt(currentParagraphIndex || 0);
  }
}

function startSpeechAt(idx) {
  if (!('speechSynthesis' in window)) {
    if (window.showToast) window.showToast('Tarayıcınız Web Speech API desteklemiyor.');
    return;
  }

  if (!currentBookParagraphs || currentBookParagraphs.length === 0) return;
  if (idx < 0 || idx >= currentBookParagraphs.length) {
    stopSpeech();
    return;
  }

  // Önceki utterance dinleyicilerini temizle ki cancel edildiğinde zincirleme bir sonrakini tetiklemesin!
  if (ttsUtterance) {
    ttsUtterance.onend = null;
    ttsUtterance.onerror = null;
  }
  window.speechSynthesis.cancel();

  // Yeni oynatma oturum ID'si (Race condition kalkanı)
  speechSessionId++;
  const thisSessionId = speechSessionId;

  currentParagraphIndex = idx;
  isPlayingSpeech = true;
  isPausedSpeech = false;

  document.getElementById('tts-player-bar').classList.remove('hidden');
  document.getElementById('btn-tts-play').innerText = '⏸';
  document.getElementById('tts-status-text').innerText = 'Okunuyor (' + (idx + 1) + '/' + currentBookParagraphs.length + ')';

  // Önceki aktif paragraf vurgularını temizle
  document.querySelectorAll('.reading-active-paragraph').forEach(el => {
    el.classList.remove('reading-active-paragraph');
  });

  // Yeni paragrafı vurgula ve ekranı oraya kaydır
  const pEl = document.getElementById('book-p-' + idx);
  if (pEl) {
    pEl.classList.add('reading-active-paragraph');
    pEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const text = currentBookParagraphs[idx];
  ttsUtterance = new SpeechSynthesisUtterance(text);
  ttsUtterance.rate = speechRate;

  // Dil ve Gerçek Ses Motoru Belirleme
  const langSelector = document.getElementById('select-tts-lang');
  if (langSelector && langSelector.value) {
    speechLang = langSelector.value;
  }
  ttsUtterance.lang = speechLang;

  // Tarayıcının yerel ses motorlarından seçilen dile ait gerçek sesi bulup ata
  const voices = window.speechSynthesis.getVoices() || [];
  const matchedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === speechLang.toLowerCase()) ||
                       voices.find(v => v.lang.toLowerCase().startsWith(speechLang.slice(0, 2).toLowerCase()));
  if (matchedVoice) {
    ttsUtterance.voice = matchedVoice;
  }

  ttsUtterance.onend = () => {
    // Eğer kullanıcı araya girip başka bir paragrafa tıkladıysa bu oturumu sonlandır
    if (thisSessionId !== speechSessionId) return;

    if (isPlayingSpeech && !isPausedSpeech) {
      if (idx + 1 < currentBookParagraphs.length) {
        startSpeechAt(idx + 1);
      } else {
        stopSpeech();
        if (window.showToast) window.showToast('✓ Sesli okuma tamamlandı.');
      }
    }
  };

  ttsUtterance.onerror = (e) => {
    // İptal edilen konuşmalarda ASLA sonraki paragrafa geçme!
    if (e.error === 'canceled' || e.error === 'interrupted') return;
    if (thisSessionId !== speechSessionId) return;

    console.warn('TTS Hatası:', e);
    if (isPlayingSpeech && !isPausedSpeech && idx + 1 < currentBookParagraphs.length) {
      startSpeechAt(idx + 1);
    }
  };

  window.speechSynthesis.speak(ttsUtterance);
}

function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  isPlayingSpeech = false;
  isPausedSpeech = false;
  const playBtn = document.getElementById('btn-tts-play');
  if (playBtn) playBtn.innerText = '▶';
  const statusText = document.getElementById('tts-status-text');
  if (statusText) statusText.innerText = 'Sesli okuma durduruldu';

  document.querySelectorAll('.reading-active-paragraph').forEach(el => {
    el.classList.remove('reading-active-paragraph');
  });
}

function setSpeechRate(rate) {
  speechRate = rate;
  ['08', '10', '125', '15'].forEach(r => {
    const btn = document.getElementById('rate-btn-' + r);
    if (btn) {
      btn.className = 'px-2 py-0.5 rounded text-mistral-slate hover:text-mistral-ink';
    }
  });
  const key = rate === 0.8 ? '08' : (rate === 1.0 ? '10' : (rate === 1.25 ? '125' : '15'));
  const activeBtn = document.getElementById('rate-btn-' + key);
  if (activeBtn) {
    activeBtn.className = 'px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold';
  }

  if (isPlayingSpeech && !isPausedSpeech) {
    startSpeechAt(currentParagraphIndex);
  }
}

// 6. İsimle / Yazarla Kitap Arama Fonksiyonları
async function searchBooks(customQuery = null) {
  const input = document.getElementById('input-book-search');
  const query = (customQuery !== null ? customQuery : input.value).trim();
  if (!query) {
    if (window.showToast) window.showToast('Lütfen aramak istediğiniz kitap veya yazar adını girin.');
    return;
  }

  if (customQuery !== null) {
    input.value = customQuery;
  }

  const btnSearch = document.getElementById('btn-search-book');
  const spinner = document.getElementById('search-spinner');
  const clearBtn = document.getElementById('btn-clear-search');
  const sec = document.getElementById('search-results-section');
  const grid = document.getElementById('search-results-grid');
  const header = document.getElementById('search-results-header');

  btnSearch.disabled = true;
  if (spinner) spinner.classList.remove('hidden');
  if (clearBtn) clearBtn.classList.remove('hidden');

  sec.classList.remove('hidden');
  grid.innerHTML = '<div class="col-span-full py-12 text-center text-mistral-slate"><div class="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-3"></div>Project Gutenberg ve açık kütüphane arşivi taranıyor...</div>';
  header.innerHTML = '<span>📚</span> "' + query + '" İçin Arama Sonuçları';

  try {
    const res = await fetch(`/api/kutuphane/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!data.success || !data.books || data.books.length === 0) {
      grid.innerHTML = '<div class="col-span-full py-10 text-center text-xs text-mistral-stone bg-mistral-cream-light rounded-2xl border border-mistral-beige-deep p-6">"' + query + '" ile eşleşen bir eser bulunamadı. Lütfen yazarın veya eserin farklı bir yazımını deneyin (Örn: Dostoyevski, Tolstoy, Kafka, Frankenstein).</div>';
      return;
    }

    renderSearchResults(data.books, query);
  } catch(err) {
    grid.innerHTML = '<div class="col-span-full py-10 text-center text-xs text-rose-500">Arama servisine erişilemedi: ' + err.message + '</div>';
  } finally {
    btnSearch.disabled = false;
    if (spinner) spinner.classList.add('hidden');
  }
}

let currentSearchResults = [];

function handleImgError(img) {
  img.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80';
}

function renderSearchResults(books, query) {
  currentSearchResults = books || [];
  const grid = document.getElementById('search-results-grid');
  const header = document.getElementById('search-results-header');
  header.innerHTML = '<span>📚</span> "' + query + '" İçin Bulunan Eserler (' + books.length + ' Sonuç)';

  grid.innerHTML = books.map(function(b, idx) {
    const displayTitle = b.trTitle ? (b.trTitle + ' (' + b.title + ')') : b.title;
    const hasId = b.id && !isNaN(b.id);
    const yearText = b.year ? b.year : 'Klasik';

    let btnHtml = '';
    if (hasId) {
      btnHtml = '<button onclick="handleSearchResultClick(' + idx + ')" class="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow flex items-center justify-center gap-1 cursor-pointer"><span>📖</span> Hemen Oku</button>';
    } else {
      btnHtml = '<button onclick="notifyArchive()" class="w-full py-1.5 rounded-lg bg-mistral-cream-light text-mistral-ink border border-mistral-beige-deep font-semibold text-[11px] transition cursor-pointer">Katalog Kaydı</button>';
    }

    return '<div class="book-card p-3 rounded-2xl bg-white border border-mistral-hairline hover:border-emerald-500/50 transition-all duration-300 shadow flex flex-col justify-between group">' +
      '<div>' +
        '<div class="relative w-full aspect-[2/3] rounded-xl overflow-hidden mb-2.5 bg-mistral-canvas shadow-inner">' +
          '<img src="' + b.cover + '" alt="' + b.title + '" class="book-cover-img w-full h-full object-cover transition-transform duration-500" onerror="handleImgError(this)">' +
          '<div class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-emerald-400 font-mono font-bold">' + yearText + '</div>' +
        '</div>' +
        '<h4 class="font-bold text-xs text-mistral-ink group-hover:text-emerald-500 transition line-clamp-2 leading-tight" title="' + displayTitle + '">' + (b.trTitle || b.title) + '</h4>' +
        '<p class="text-[11px] text-mistral-slate truncate mt-1">' + b.author + '</p>' +
      '</div>' +
      '<div class="pt-2 border-t border-mistral-hairline flex flex-col gap-1.5 mt-2.5">' + btnHtml + '</div>' +
    '</div>';
  }).join('');
}

function notifyArchive() {
  if (window.showToast) window.showToast("Bu eser için dijital arşiv linki taranıyor...");
}

function handleSearchResultClick(idx) {
  const b = currentSearchResults[idx];
  if (!b) return;
  openBookReader(b.id, b.title, b.author, b.cover, b.trTitle);
}

function clearSearchInput() {
  const input = document.getElementById('input-book-search');
  input.value = '';
  document.getElementById('btn-clear-search').classList.add('hidden');
  closeSearchResults();
}

function closeSearchResults() {
  document.getElementById('search-results-section').classList.add('hidden');
}

// 7. Sayfa Yüklendiğinde Başlat
document.addEventListener('DOMContentLoaded', () => {
  renderBooks(CLASSIC_BOOKS);
  renderShelf();
});
