const express = require('express');
const router = express.Router();
const { isPrivateAddress } = require('./utils');

// =============================================================
// İnteraktif Kas Anatomisi & Egzersiz Rehberi API
// (Snouzy/workout-cool & Wger Anatomy Entegrasyonu)
// =============================================================

const exerciseCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Anatomik Kas Grupları Kataloğu (Ön ve Arka Vücut Haritası)
const MUSCLE_GROUPS = [
  { id: "chest", name: "Göğüs (Pektoral)", nameEn: "Chest", view: "front", icon: "🛡️", desc: "Üst gövde itiş kasları, duruş düzeltme ve solunum kapasitesi." },
  { id: "shoulders", name: "Omuzlar (Deltoid)", nameEn: "Shoulders", view: "both", icon: "💪", desc: "Kol hareket kabiliyeti, omuz başları ve rotator manşet sağlığı." },
  { id: "biceps", name: "Pazı (Biceps)", nameEn: "Biceps", view: "front", icon: "🦾", desc: "Ön kol çekiş kasları, dirsek fleksörleri ve kavrama gücü." },
  { id: "triceps", name: "Arka Kol (Triceps)", nameEn: "Triceps", view: "back", icon: "⚡", desc: "Kolun 2/3'ünü oluşturan ekstansör kaslar ve itiş gücü." },
  { id: "back", name: "Sırt & Kanat (Lats/Traps)", nameEn: "Back", view: "back", icon: "🦅", desc: "Omurga stabilitesi, dik duruş ve bel ağrılarının önlenmesi." },
  { id: "abs", name: "Karın & Merkez (Core)", nameEn: "Abs", view: "front", icon: "🧱", desc: "Karın duvarı, pelvik denge ve omurga koruma kalkanı." },
  { id: "quadriceps", name: "Ön Bacak (Quadriceps)", nameEn: "Quadriceps", view: "front", icon: "🦵", desc: "Diz eklemi stabilitesi, merdiven çıkma ve çömelme gücü." },
  { id: "hamstrings", name: "Arka Bacak (Hamstrings)", nameEn: "Hamstrings", view: "back", icon: "🏃", desc: "Diz fleksiyonu, kalça itişi ve koşu biyomekaniği." },
  { id: "glutes", name: "Kalça (Gluteus)", nameEn: "Glutes", view: "back", icon: "🍑", desc: "Vücudun en büyük kas grubu; pelvis hizalama ve bel koruyucu." },
  { id: "calves", name: "Kalf & Baldır (Calves)", nameEn: "Calves", view: "back", icon: "👣", desc: "Ayak bileği stabilitesi, yürüme ve sıçrama amortisörü." },
  { id: "lower_back", name: "Bel (Lumbar / Erector)", nameEn: "Lower Back", view: "back", icon: "🧘", desc: "Lomber omurga koruması, fıtık önleme ve duruş dengesi." }
];

// workout-cool ve Wger İlhamlı Zengin Egzersiz Veritabanı
const EXERCISES_DATABASE = [
  // 1. GÖĞÜS (CHEST)
  {
    id: "barbell-bench-press",
    name: "Barbell Bench Press (Yatarak Halter İtiş)",
    nameEn: "Barbell Bench Press",
    primaryMuscle: "chest",
    secondaryMuscles: ["shoulders", "triceps"],
    equipment: "barbell",
    difficulty: "Orta",
    type: "Kuvvet / Hipertrofi",
    mechanics: "Bileşik (Compound)",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/rT7DgCr-3pg",
    instructions: [
      "Düz sehpaya sırt üstü yatın, gözleriniz doğrudan halter barının hizasında olmalıdır.",
      "Barı omuz genişliğinden biraz daha geniş bir tutuşla kavrayın ve kürek kemiklerinizi sehpaya sıkıca kenetleyin.",
      "Barı kontrollü şekilde göğsünüzün ortasına (meme ucu hizası) doğru indirin, nefes alın.",
      "Göğse hafifçe temas ettikten sonra patlayıcı güçle yukarı doğru itin ve tepe noktada nefes verin."
    ],
    therapyTip: "Omuz sıkışması yaşamamak için dirseklerinizi gövdenize 45-75 derece açıyla tutun, 90 derece açarak omuz kapsülüne aşırı yük bindirmeyin."
  },
  {
    id: "push-up",
    name: "Şınav (Push-Up)",
    nameEn: "Standard Push-Up",
    primaryMuscle: "chest",
    secondaryMuscles: ["triceps", "abs", "shoulders"],
    equipment: "bodyweight",
    difficulty: "Başlangıç",
    type: "Kuvvet & Denge",
    mechanics: "Bileşik (Compound)",
    imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/IODxDxX7oi4",
    instructions: [
      "Ellerinizi omuz genişliğinde yere koyun, ayak parmak uçlarınız üzerinde plank pozisyonu alın.",
      "Vücudunuzu baştan topuğa kadar düz bir tahta gibi gergin tutun (karın ve kalçayı sıkın).",
      "Göğsünüz yere bir yumruk mesafesi kalana kadar dirseklerinizi bükerek alçalın.",
      "Yeri iterek başlangıç pozisyonuna dönün, boynunuzu nötr tutun."
    ],
    therapyTip: "Belinde çökme olanlar hareketi dizler yerde (Knee Push-Up) veya yüksek bir basamakta yaparak omurga yükünü azaltabilir."
  },
  {
    id: "dumbbell-fly",
    name: "Dumbbell Fly (Dambıl Göğüs Açış)",
    nameEn: "Dumbbell Chest Fly",
    primaryMuscle: "chest",
    secondaryMuscles: ["shoulders"],
    equipment: "dumbbell",
    difficulty: "Orta",
    type: "Esneme & İzolasyon",
    mechanics: "İzole (Isolation)",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/eozdVDA78K0",
    instructions: [
      "Düz bir sehpaya uzanın, dambılları göğsünüzün üzerinde avuç içleri birbirine bakacak şekilde tutun.",
      "Dirseklerinizde hafif bir bükülme açısını koruyarak kolları yana doğru geniş bir yay şeklinde açın.",
      "Göğüs kaslarınızda derin bir esneme hissedene kadar indirin.",
      "Bir ağaca sarılır gibi dambılları tepe noktada yeniden birleştirin."
    ],
    therapyTip: "Masa başı çalışanlarda kısalan göğüs kaslarını açmak ve kamburluk eğilimini gidermek için ideal bir restoratif esneme egzersizidir."
  },

  // 2. SIRT & KANAT (BACK)
  {
    id: "pull-up",
    name: "Barfiks (Pull-Up / Chin-Up)",
    nameEn: "Pull-Up",
    primaryMuscle: "back",
    secondaryMuscles: ["biceps", "shoulders", "abs"],
    equipment: "bodyweight",
    difficulty: "İleri",
    type: "Kuvvet & Omurga Traksiyonu",
    mechanics: "Bileşik (Compound)",
    imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/eGo4IYlbE5g",
    instructions: [
      "Barfiks barını avuç içleri karşıya bakacak şekilde (pull-up) omuzlardan geniş kavrayın.",
      "Omuzlarınızı aşağı ve geriye çekerek kürek kemiklerinizi aktif hale getirin.",
      "Göğsünüzü bara doğru çekin, çeneniz barın üzerine çıkana kadar yükselin.",
      "Yavaş ve kontrollü bir şekilde başlangıç pozisyonuna inerek omurganızı uzatın."
    ],
    therapyTip: "Yerçekimine karşı omurları birbirinden ayıran mükemmel bir dekompresyon (omurga rahatlatma) etkisine sahiptir."
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown (Geniş Tutuş Makara Çekiş)",
    nameEn: "Lat Pulldown",
    primaryMuscle: "back",
    secondaryMuscles: ["biceps", "shoulders"],
    equipment: "cable",
    difficulty: "Başlangıç",
    type: "Hipertrofi & Duruş",
    mechanics: "Bileşik (Compound)",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/CAwf7n6Luuc",
    instructions: [
      "Makineye oturun ve diz pedlerini uyluklarınızın üzerine sıkıca ayarlayın.",
      "Barı geniş bir açıyla kavrayın, göğsünüzü hafifçe yukarı doğru açın.",
      "Barı köprücük kemiğinize doğru çekin, kürek kemiklerinizi birbirine doğru sıkıştırın.",
      "Barın kollarınızı yukarı çekmesine izin verirken ağırlığı kontrollü şekilde bırakın."
    ],
    therapyTip: "Barı kesinlikle ensenize çekmeyin (boyun omurlarına baskı yapmamak için daima göğsün üst kısmına çekin)."
  },

  // 3. OMUZ (SHOULDERS)
  {
    id: "face-pulls",
    name: "Facepulls (Makarada Yüze Çekiş)",
    nameEn: "Cable Facepulls",
    primaryMuscle: "shoulders",
    secondaryMuscles: ["back", "forearms"],
    equipment: "cable",
    difficulty: "Başlangıç",
    type: "Postür & Fizik Tedavi",
    mechanics: "İzole (Isolation)",
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/3ZViIERC1QQ",
    instructions: [
      "Halat eklentisini göğüs/yüz hizasındaki kablo makarasına takın.",
      "Halatı başparmaklar arkaya bakacak şekilde tutun ve birkaç adım geri çekilin.",
      "Dirseklerinizi dışarı ve yukarı doğru açarak halatı alnınıza/göz hizanıza doğru çekin.",
      "Tepe noktada omuzlarınızı dışa rotasyon yaptırarak 1 saniye sıkıştırın ve yavaşça bırakın."
    ],
    therapyTip: "Yuvarlak omuz (Forward Shoulder) ve kamburluk postür bozukluğunu tedavi etmek için spor hekimlerinin en çok reçete ettiği altın egzersizdir."
  },
  {
    id: "dumbbell-lateral-raise",
    name: "Lateral Raise (Yana Dambıl Açış)",
    nameEn: "Dumbbell Lateral Raise",
    primaryMuscle: "shoulders",
    secondaryMuscles: ["back"],
    equipment: "dumbbell",
    difficulty: "Başlangıç",
    type: "İzolasyon & Genişlik",
    mechanics: "İzole (Isolation)",
    imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/3VcKaXpzqRo",
    instructions: [
      "Ayakta dik durun, yanlarınızda iki hafif dambıl tutun.",
      "Dirseklerinizde çok hafif bir bükülme ile kolları omuz hizasına kadar yana doğru kaldırın.",
      "Kolları omuz hizasını aşmayacak noktada durdurun, serçe parmağın başparmaktan bir tık yüksekte olmasına özen gösterin.",
      "Ağırlığı yerçekimine bırakmadan yavaşça indirin."
    ],
    therapyTip: "Ağır kilo yerine hafif kiloyla kusursuz form uygulamak supraspinatus tendonunu korur."
  },

  // 4. BACAK & KALÇA (LEGS & GLUTES)
  {
    id: "bodyweight-squat",
    name: "Squat (Çömelme Egzersizi)",
    nameEn: "Bodyweight Squat",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings", "calves", "abs"],
    equipment: "bodyweight",
    difficulty: "Başlangıç",
    type: "Temel Güç & Mobilite",
    mechanics: "Bileşik (Compound)",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/aclHkVaku9U",
    instructions: [
      "Ayaklarınızı omuz genişliğinde açın, ayak parmak uçlarını hafifçe (15-30 derece) dışarı yöneltin.",
      "Göğsünüzü dik tutarak kalçanızı geriye, sanki arkadaki görünmez bir sandalyeye oturuyormuş gibi indirin.",
      "Uyluklarınız yere paralel olana kadar alçalın, dizlerin içe çökmemesine dikkat edin.",
      "Topuklarınızdan güç alarak başlangıç pozisyonuna yükselin."
    ],
    therapyTip: "Diz kireçlenmesi ve menisküs yükünü azaltmak için dizlerin ayak parmak uçlarını aşırı geçmemesine ve kalça mobilizasyonuna odaklanılmalıdır."
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift (RDL / Kalça-Hamstring)",
    nameEn: "Dumbbell Romanian Deadlift",
    primaryMuscle: "hamstrings",
    secondaryMuscles: ["glutes", "lower_back"],
    equipment: "dumbbell",
    difficulty: "Orta",
    type: "Arka Zincir & Hamstring",
    mechanics: "Bileşik (Compound)",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/JCXUYuzwNrM",
    instructions: [
      "Dambılları uyluklarınızın önünde tutun, dizlerinizi çok hafif bükülü ve sabit tutun.",
      "Sırtınızı tamamen düz tutarak kalçanızı arkadaki duvara değdirmek ister gibi geriye itin.",
      "Dambılları kaval kemiğiniz boyunca diz altına kadar indirin; arka bacakta derin esneme hissedin.",
      "Kalça kaslarınızı sıkarak dik pozisyona dönün."
    ],
    therapyTip: "Bel fıtığı ve siyatik ağrılarının en yaygın nedeni zayıf arka bacak ve kalça kaslarıdır; bu egzersiz bel omurlarını güçlendirir."
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge (Köprü Egzersizi)",
    nameEn: "Glute Bridge",
    primaryMuscle: "glutes",
    secondaryMuscles: ["hamstrings", "abs", "lower_back"],
    equipment: "bodyweight",
    difficulty: "Başlangıç",
    type: "Rehabilitasyon & Pelvik Taban",
    mechanics: "İzole (Isolation)",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/wPM8icPu6H8",
    instructions: [
      "Sırt üstü yere yatın, dizlerinizi bükün ve ayak tabanlarınızı kalça genişliğinde yere basın.",
      "Topuklarınızdan güç alarak kalçanızı tavana doğru kaldırın.",
      "Vücudunuz dizlerinizden omuzlarınıza kadar düz bir hat oluşturduğunda kalçanızı 2 saniye sıkın.",
      "Omurları tek tek yere bırakarak yavaşça başlangıç pozisyonuna dönün."
    ],
    therapyTip: "Masa başında uzun saatler oturanlarda gelişen 'Gluteal Amnezi' (uyuyan kalça sendromu) için en etkili fizik tedavi hareketidir."
  },

  // 5. KARIN & MERKEZ (ABS & CORE)
  {
    id: "plank",
    name: "Plank (İzometrik Merkez Dayanıklılığı)",
    nameEn: "Forearm Plank",
    primaryMuscle: "abs",
    secondaryMuscles: ["shoulders", "glutes", "lower_back"],
    equipment: "bodyweight",
    difficulty: "Başlangıç",
    type: "İzometrik Çekirdek Gücü",
    mechanics: "Statik (Static)",
    imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/ASdvN_XEl_c",
    instructions: [
      "Ön kollarınız ve ayak parmaklarınız üzerinde şınav benzeri pozisyon alın.",
      "Dirsekler doğrudan omuzların altında, kollar birbirine paralel olmalıdır.",
      "Göbek deliğinizi omurganıza doğru çekin, kalçanızı ne yukarı kaldırın ne de aşağı düşürün.",
      "Doğal nefes alıp vererek bu pozisyonu 30-60 saniye boyunca koruyun."
    ],
    therapyTip: "Mekik gibi omurları büküp disklere baskı yapmaz; aksine omurgayı sabitleyerek bel fıtığı oluşumunu engeller."
  },
  {
    id: "dead-bug",
    name: "Dead Bug (Ölü Böcek Egzersizi)",
    nameEn: "Dead Bug Exercise",
    primaryMuscle: "abs",
    secondaryMuscles: ["lower_back"],
    equipment: "bodyweight",
    difficulty: "Başlangıç",
    type: "Fizik Tedavi & Omurga Stabilizasyonu",
    mechanics: "İzole (Isolation)",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/g_BYB0R-4Ws",
    instructions: [
      "Sırt üstü uzanın, kollarınızı tavana doğru uzatın, bacaklarınızı dizlerden 90 derece bükerek havada tutun.",
      "Bel boşluğunuzu yere doğru bastırın, yer ile bel arasında boşluk kalmamalıdır.",
      "Sağ kolunuzu başınızın gerisine indirirken aynı anda sol bacağınızı ileri doğru düzleştirin.",
      "Kontrollüce başlangıç pozisyonuna dönün ve ters taraf (sol kol, sağ bacak) ile tekrarlayın."
    ],
    therapyTip: "Kronik bel ağrısı olan hastalar için nöromusküler koordinasyonu ve derin karın kaslarını (transversus abdominis) yeniden eğitir."
  },

  // 6. KOL (ARMS: BICEPS & TRICEPS)
  {
    id: "dumbbell-bicep-curl",
    name: "Dumbbell Bicep Curl (Dambıl Ön Kol Bükme)",
    nameEn: "Dumbbell Bicep Curl",
    primaryMuscle: "biceps",
    secondaryMuscles: ["forearms"],
    equipment: "dumbbell",
    difficulty: "Başlangıç",
    type: "Hipertrofi & Kavrama",
    mechanics: "İzole (Isolation)",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    instructions: [
      "Ayakta veya otururken iki elinizde dambıllarla başlayın, dirsekleri gövdenize sabitleyin.",
      "Dirseklerinizi oynatmadan dambılları yukarı doğru bükün, tepe noktada avuç içlerini omza doğru çevirin.",
      "Pazı kasınızı 1 saniye sıkın ve ağırlığı kontrollü bir şekilde başlangıç noktasına indirin."
    ],
    therapyTip: "Ağırlığı kaldırırken belden ivme almayın (sallanmayın); bu hareket form bozukluğu olduğunda bele gereksiz yük bindirebilir."
  },
  {
    id: "tricep-rope-pushdown",
    name: "Tricep Pushdown (Kablo Halat İtiş)",
    nameEn: "Tricep Rope Pushdown",
    primaryMuscle: "triceps",
    secondaryMuscles: ["forearms"],
    equipment: "cable",
    difficulty: "Başlangıç",
    type: "İzolasyon & Kol Gücü",
    mechanics: "İzole (Isolation)",
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/vB5OHsJ3EME",
    instructions: [
      "Üst makaraya halat takın, dirseklerinizi gövdenizin yanlarına kilitleyin.",
      "Kolları aşağıya doğru bastırarak dirsekleri tamamen düzleştirin.",
      "Alt noktada halatın uçlarını dışa doğru hafifçe açarak triceps kasınızı sıkın.",
      "Dirsek pozisyonunu bozmadan ön kolların göğüs hizasına çıkmasına izin verin."
    ],
    therapyTip: "Dirsek tendonlarında ağrı (tenisçi veya golfçü dirseği) olanlar için düşük dirençte yüksek tekrarlı rehabilitasyon sağlar."
  },

  // 7. BEL & REHABİLİTASYON (LOWER BACK)
  {
    id: "bird-dog",
    name: "Bird Dog (Kuş Köpek Egzersizi)",
    nameEn: "Bird Dog Core Exercise",
    primaryMuscle: "lower_back",
    secondaryMuscles: ["abs", "glutes", "shoulders"],
    equipment: "bodyweight",
    difficulty: "Başlangıç",
    type: "Fizik Tedavi & Omurga Desteği",
    mechanics: "Bileşik (Compound)",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80",
    videoEmbedUrl: "https://www.youtube.com/embed/wiFNA3sqjCA",
    instructions: [
      "Dört ayak pozisyonuna geçin (eller omuz altında, dizler kalça altında).",
      "Omurganızı nötr tutun ve boynunuzu kasmadan yere bakın.",
      "Sağ kolunuzu ileri, sol bacağınızı geriye doğru aynı anda uzatın.",
      "Vücudunuz düz bir hat oluşturduğunda 2 saniye bekleyin, başlangıç pozisyonuna dönüp ters tarafı yapın."
    ],
    therapyTip: "Dünyaca ünlü omurga biyomekaniği uzmanı Dr. Stuart McGill'in bel fıtığı ve bel ağrısı için önerdiği 'Büyük 3'lü' egzersizden biridir."
  }
];

// 1. Kas Grupları Listesi Uç Noktası (/api/egzersiz/muscles)
router.get('/egzersiz/muscles', (req, res) => {
  const muscleStats = MUSCLE_GROUPS.map(m => {
    const count = EXERCISES_DATABASE.filter(e => e.primaryMuscle === m.id || e.secondaryMuscles.includes(m.id)).length;
    return { ...m, exerciseCount: count };
  });

  res.json({ success: true, count: muscleStats.length, muscles: muscleStats });
});

// 2. Filtrelenmiş Egzersiz Listesi (/api/egzersiz/list?muscle=...&equipment=...&difficulty=...)
router.get('/egzersiz/list', (req, res) => {
  const muscleFilter = (req.query.muscle || '').trim().toLowerCase();
  const equipFilter = (req.query.equipment || '').trim().toLowerCase();
  const searchFilter = (req.query.search || '').trim().toLowerCase();

  let filtered = EXERCISES_DATABASE;

  if (muscleFilter && muscleFilter !== 'all') {
    filtered = filtered.filter(e => e.primaryMuscle === muscleFilter || e.secondaryMuscles.includes(muscleFilter));
  }

  if (equipFilter && equipFilter !== 'all') {
    filtered = filtered.filter(e => e.equipment.toLowerCase() === equipFilter);
  }

  if (searchFilter) {
    filtered = filtered.filter(e => 
      e.name.toLowerCase().includes(searchFilter) || 
      e.nameEn.toLowerCase().includes(searchFilter) ||
      e.type.toLowerCase().includes(searchFilter)
    );
  }

  res.json({
    success: true,
    total: filtered.length,
    activeMuscle: muscleFilter || 'all',
    exercises: filtered
  });
});

// 3. Tek Egzersiz Detay Uç Noktası (/api/egzersiz/detail?id=...)
router.get('/egzersiz/detail', (req, res) => {
  const id = (req.query.id || '').trim();
  const exercise = EXERCISES_DATABASE.find(e => e.id === id);

  if (!exercise) {
    return res.status(404).json({ success: false, error: 'Egzersiz bulunamadı.' });
  }

  res.json({ success: true, exercise });
});

module.exports = router;
