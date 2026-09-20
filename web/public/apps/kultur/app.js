function safeCopyToClipboard(text, msg) {
  if (window.copyToClipboard) {
    window.copyToClipboard(text, msg);
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (window.showToast) window.showToast('✓ ' + (msg || 'Panoya kopyalandı!'));
    }).catch(() => fallbackExecCopy(text, msg));
  } else {
    fallbackExecCopy(text, msg);
  }
}
function fallbackExecCopy(text, msg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    if (window.showToast) window.showToast('✓ ' + (msg || 'Panoya kopyalandı!'));
  } catch(e) {
    if (window.showToast) window.showToast('Kopyalama başarısız');
  }
  document.body.removeChild(ta);
}

// Soru Bankası (Türkçe + Dünya Kültürü)
        const TRIVIA_BANK = [
          // Coğrafya
          { q: "Dünyanın en yüksek şelalesi olan Angel Şelalesi hangi ülkededir?", a: ["Venezuela", "Brezilya", "Kanada", "Güney Afrika"], c: 0, cat: "cografya", diff: "medium" },
          { q: "Türkiye'nin yüzölçümü bakımından en büyük gölü hangisidir?", a: ["Tuz Gölü", "Van Gölü", "Beyşehir Gölü", "İznik Gölü"], c: 1, cat: "cografya", diff: "easy" },
          { q: "Afrika kıtasının en yüksek noktası olan Kilimanjaro Dağı hangi ülkededir?", a: ["Kenya", "Tanzanya", "Etiyopya", "Uganda"], c: 1, cat: "cografya", diff: "medium" },
          { q: "Başkenti Ulan Batur olan Asya ülkesi hangisidir?", a: ["Kazakistan", "Moğolistan", "Özbekistan", "Kırgızistan"], c: 1, cat: "cografya", diff: "easy" },
          { q: "Dünyada toprakları iki kıtaya yayılan ve boğazlara sahip iki şehirden biri İstanbul iken, diğeri hangi ülkededir?", a: ["Mısır (Süveyş)", "Rusya (Magnitogorsk)", "Panama", "Cebelitarık"], c: 1, cat: "cografya", diff: "hard" },
          
          // Tarih
          { q: "Tarihte bilinen ilk yazılı barış antlaşması hangisidir?", a: ["Kadeş Antlaşması", "Vestfalya Antlaşması", "Amiens Antlaşması", "Lozan Antlaşması"], c: 0, cat: "tarih", diff: "easy" },
          { q: "Osmanlı Devleti'nin ilk başkenti neresidir?", a: ["Bursa", "Söğüt", "Edirne", "İznik"], c: 1, cat: "tarih", diff: "easy" },
          { q: "Magna Carta (Büyük Sözleşme) hangi yıl imzalanmıştır?", a: ["1066", "1215", "1453", "1789"], c: 1, cat: "tarih", diff: "medium" },
          { q: "Antik Mısır'da inşa edilen Keops Piramidi dünyanın yedi harikasından hangisinin listesinde yer alır?", a: ["Klasik Yedi Harika", "Modern Yedi Harika", "Doğal Yedi Harika", "Hiçbiri"], c: 0, cat: "tarih", diff: "easy" },
          { q: "Rönesans hareketinin doğduğu kabul edilen İtalyan kenti hangisidir?", a: ["Roma", "Venedik", "Floransa", "Milano"], c: 2, cat: "tarih", diff: "medium" },

          // Bilim & Doğa
          { q: "Periyodik tabloda 'Au' simgesi ile gösterilen kimyasal element hangisidir?", a: ["Gümüş", "Altın", "Bakır", "Alüminyum"], c: 1, cat: "bilim", diff: "easy" },
          { q: "Güneş Sistemi'ndeki en büyük gezegen hangisidir?", a: ["Satürn", "Neptün", "Jüpiter", "Uranüs"], c: 2, cat: "bilim", diff: "easy" },
          { q: "İnsan vücudundaki en sert doku hangisidir?", a: ["Femur kemiği", "Diş minesi", "Kafatası kemiği", "Kıkırdak"], c: 1, cat: "bilim", diff: "medium" },
          { q: "Işığın boşluktaki hızı yaklaşık olarak saniyede kaç kilometredir?", a: ["150.000 km", "300.000 km", "500.000 km", "1.000.000 km"], c: 1, cat: "bilim", diff: "easy" },
          { q: "DNA'nın çift sarmal yapısını 1953 yılında keşfeden bilim insanları kimlerdir?", a: ["Watson & Crick", "Newton & Leibniz", "Pasteur & Koch", "Curie & Rutherford"], c: 0, cat: "bilim", diff: "medium" },
          { q: "2015 yılında DNA onarım mekanizmaları üzerine yaptığı çığır açan keşiflerle Nobel Kimya Ödülü'nü kazanan Türk bilim insanı kimdir?", a: ["Cahit Arf", "Aziz Sancar", "Gazi Yaşargil", "Oktay Sinanoğlu"], c: 1, cat: "bilim", diff: "easy" },
          { q: "Hem Fizik (1903) hem de Kimya (1911) alanında iki farklı bilim dalında Nobel kazanan ilk ve tek kadın bilim insanı kimdir?", a: ["Rosalind Franklin", "Marie Curie", "Lise Meitner", "Ada Lovelace"], c: 1, cat: "bilim", diff: "easy" },
          { q: "Albert Einstein 1921 Nobel Fizik Ödülü'nü özellikle hangi teorik çalışması ve keşfi nedeniyle almıştır?", a: ["Genel Görelilik", "Fotoelektrik Etki Yasası", "Brown Hareketi", "Kütle-Enerji Eşdeğerliği (E=mc²)"], c: 1, cat: "bilim", diff: "medium" },

          // Sanat & Sinema
          { q: "Ünlü 'Yıldızlı Gece' (The Starry Night) tablosu hangi ressama aittir?", a: ["Pablo Picasso", "Vincent van Gogh", "Claude Monet", "Salvador Dalí"], c: 1, cat: "sanat", diff: "easy" },
          { q: "Sinema tarihinde 'Baba' (The Godfather) üçlemesinin yönetmeni kimdir?", a: ["Martin Scorsese", "Francis Ford Coppola", "Steven Spielberg", "Stanley Kubrick"], c: 1, cat: "sanat", diff: "easy" },
          { q: "İstiklal Marşı'mızın bestecisi kimdir?", a: ["Mehmet Âkif Ersoy", "Osman Zeki Üngör", "İsmail Dede Efendi", "Münir Nurettin Selçuk"], c: 1, cat: "sanat", diff: "medium" },
          { q: "'Suç ve Ceza' romanının yazarı kimdir?", a: ["Lev Tolstoy", "Fyodor Dostoyevski", "Anton Çehov", "Maksim Gorki"], c: 1, cat: "sanat", diff: "easy" },
          { q: "2006 yılında Nobel Edebiyat Ödülü'nü kazanarak Türkiye'ye edebiyat alanında ilk Nobel'i getiren yazarımız kimdir?", a: ["Yaşar Kemal", "Orhan Pamuk", "Ahmet Hamdi Tanpınar", "Oğuz Atay"], c: 1, cat: "sanat", diff: "easy" }
        ];

        // Başarımlar Tanımı
        const ACHIEVEMENTS_DEF = [
          { id: 'first_win', name: '🎯 İlk Zafer', desc: 'İlk solo yarışmanı tamamla', xp: 50 },
          { id: 'quick_reflex', name: '⚡ Şimşek Refleks', desc: 'Bir soruyu 3 saniyeden kısa sürede doğru bil', xp: 100 },
          { id: 'duel_master', name: '🏆 Arena Şampiyonu', desc: 'İlk 1v1 çok oyunculu düellonu kazan', xp: 150 },
          { id: 'perfect_streak', name: '🔥 Kusursuz Seri', desc: 'Tek oyunda 5 soruyu peş peşe doğru bil', xp: 100 },
          { id: 'sage_master', name: '👑 Büyük Bilge', desc: 'Toplam 1.000 XP puanına ulaş', xp: 200 },
          { id: 'explorer', name: '🌍 Kültür Elçisi', desc: 'En az 5 farklı oyun oyna', xp: 100 }
        ];

        // Kullanıcı Durumu
        let playerStats = {
          xp: 0,
          totalGames: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          duelWins: 0,
          duelLosses: 0,
          bestScore: 0,
          achievements: [],
          matchHistory: []
        };

        // Oyun Durumu
        let currentQuestions = [];
        let currentQuestionIdx = 0;
        let currentScore = 0;
        let currentStreak = 0;
        let timerInterval = null;
        let timeLeft = 15;
        let questionStartTime = 0;
        let isAnsweringBlocked = false;
        let isDuelMode = false;
        let currentRoomCode = null;

        // 1. Sekme Değiştirme
        function switchArenaTab(tab) {
          document.querySelectorAll('.tab-arena-btn').forEach(btn => {
            btn.className = 'tab-arena-btn px-4 py-2 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-2';
          });
          document.querySelectorAll('.arena-tab-content').forEach(c => c.classList.add('hidden'));

          const activeBtn = document.getElementById('tab-btn-' + tab);
          if (activeBtn) {
            activeBtn.className = 'tab-arena-btn px-4 py-2 rounded-xl text-xs font-bold bg-yellow-500 text-slate-950 transition flex items-center gap-2 shadow';
          }
          const activeContent = document.getElementById('tab-content-' + tab);
          if (activeContent) activeContent.classList.remove('hidden');

          if (tab === 'stats') renderStatsAndAchievements();
          if (tab === 'history') renderMatchHistory();
          if (tab === 'leaderboard') renderLeaderboard();
        }

        // 2. Ses Efektleri (Web Audio API)
        function playTone(freq, type, duration) {
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.value = freq;
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
            osc.start();
            osc.stop(ctx.currentTime + duration);
          } catch(e) {}
        }

        function playCorrectSound() {
          playTone(523.25, 'sine', 0.15); // C5
          setTimeout(() => playTone(659.25, 'sine', 0.25), 100); // E5
        }

        function playWrongSound() {
          playTone(220, 'sawtooth', 0.3); // A3
        }

        // 3. Solo Oyun Akışı
        function startSoloGame(customQuestions = null) {
          isDuelMode = !!customQuestions;
          const cat = document.getElementById('solo-category').value;
          const diff = document.getElementById('solo-difficulty').value;

          if (customQuestions) {
            currentQuestions = customQuestions;
          } else {
            // Soruları filtrele ve karıştır
            let pool = TRIVIA_BANK.filter(q => (cat === 'all' || q.cat === cat));
            if (pool.length < 5) pool = TRIVIA_BANK;
            currentQuestions = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
          }

          currentQuestionIdx = 0;
          currentScore = 0;
          currentStreak = 0;

          document.getElementById('solo-lobby').classList.add('hidden');
          document.getElementById('solo-results').classList.add('hidden');
          document.getElementById('solo-gameplay').classList.remove('hidden');

          renderQuestion();
        }

        function renderQuestion() {
          if (currentQuestionIdx >= currentQuestions.length) {
            finishGame();
            return;
          }

          const q = currentQuestions[currentQuestionIdx];
          isAnsweringBlocked = false;
          questionStartTime = Date.now();

          document.getElementById('game-cat-badge').innerText = q.cat.toUpperCase();
          document.getElementById('game-q-counter').innerText = `Soru ${currentQuestionIdx + 1}/${currentQuestions.length}`;
          document.getElementById('game-score-display').innerText = currentScore;
          document.getElementById('game-streak-display').innerText = `🔥 ${currentStreak}`;
          document.getElementById('game-question-text').innerText = q.q;

          // Seçenekleri oluştur
          const container = document.getElementById('game-options-container');
          container.innerHTML = q.a.map((opt, idx) => `
            <button onclick="handleAnswer(${idx})" id="opt-btn-${idx}" class="p-4 rounded-2xl bg-white border border-mistral-hairline hover:border-yellow-400 hover:bg-white text-mistral-ink text-sm font-semibold transition text-left flex items-center gap-3">
              <span class="w-7 h-7 rounded-lg bg-white text-mistral-slate flex items-center justify-center font-mono text-xs font-bold shrink-0">${['A','B','C','D'][idx]}</span>
              <span>${opt}</span>
            </button>
          `).join('');

          // Zamanlayıcıyı başlat (15 sn)
          startTimer();
        }

        function startTimer() {
          clearInterval(timerInterval);
          timeLeft = 15;
          const bar = document.getElementById('game-timer-bar');
          bar.style.width = '100%';

          timerInterval = setInterval(() => {
            timeLeft--;
            const pct = (timeLeft / 15) * 100;
            bar.style.width = pct + '%';

            if (timeLeft <= 0) {
              clearInterval(timerInterval);
              handleTimeOut();
            }
          }, 1000);
        }

        function handleAnswer(selectedIdx) {
          if (isAnsweringBlocked) return;
          isAnsweringBlocked = true;
          clearInterval(timerInterval);

          const q = currentQuestions[currentQuestionIdx];
          const isCorrect = (selectedIdx === q.c);
          const elapsedSec = (Date.now() - questionStartTime) / 1000;

          const chosenBtn = document.getElementById('opt-btn-' + selectedIdx);
          const correctBtn = document.getElementById('opt-btn-' + q.c);

          if (isCorrect) {
            playCorrectSound();
            if (chosenBtn) chosenBtn.className += ' correct-opt';
            
            // Puan hesaplama: 100 baz + kalan süre x 10
            const bonus = Math.round(timeLeft * 10);
            const streakBonus = currentStreak * 15;
            currentScore += (100 + bonus + streakBonus);
            currentStreak++;
            playerStats.correctAnswers++;

            // Hızlı Refleks Başarımı
            if (elapsedSec < 3) unlockAchievement('quick_reflex');
            if (currentStreak >= 5) unlockAchievement('perfect_streak');
          } else {
            playWrongSound();
            if (chosenBtn) chosenBtn.className += ' wrong-opt';
            if (correctBtn) correctBtn.className += ' correct-opt';
            currentStreak = 0;
            playerStats.wrongAnswers++;
          }

          document.getElementById('game-score-display').innerText = currentScore;
          document.getElementById('game-streak-display').innerText = `🔥 ${currentStreak}`;

          setTimeout(() => {
            currentQuestionIdx++;
            renderQuestion();
          }, 1400);
        }

        function handleTimeOut() {
          if (isAnsweringBlocked) return;
          isAnsweringBlocked = true;
          playWrongSound();

          const q = currentQuestions[currentQuestionIdx];
          const correctBtn = document.getElementById('opt-btn-' + q.c);
          if (correctBtn) correctBtn.className += ' correct-opt';

          currentStreak = 0;
          playerStats.wrongAnswers++;

          setTimeout(() => {
            currentQuestionIdx++;
            renderQuestion();
          }, 1400);
        }

        function finishGame() {
          clearInterval(timerInterval);
          document.getElementById('solo-gameplay').classList.add('hidden');
          document.getElementById('solo-results').classList.remove('hidden');

          const xpEarned = Math.round(currentScore / 2);
          playerStats.xp += xpEarned;
          playerStats.totalGames++;
          if (currentScore > playerStats.bestScore) playerStats.bestScore = currentScore;

          // Başarımlar
          unlockAchievement('first_win');
          if (playerStats.totalGames >= 5) unlockAchievement('explorer');
          if (playerStats.xp >= 1000) unlockAchievement('sage_master');

          document.getElementById('res-score').innerText = currentScore;
          document.getElementById('res-correct-count').innerText = `${playerStats.correctAnswers}/${currentQuestions.length}`;
          document.getElementById('res-xp-earned').innerText = `+${xpEarned} XP`;

          savePlayerStats();
          updateProfileBadge();

          // Eğer düello ise sonucu odaya gönder
          if (isDuelMode && currentRoomCode) {
            submitDuelScore(currentRoomCode, currentScore);
          }
        }

        // 4. Düello (1v1 Çok Oyunculu) Motoru
        async function createDuelRoom() {
          const cat = document.getElementById('duel-cat-select').value;
          const diff = document.getElementById('duel-diff-select').value;

          let pool = TRIVIA_BANK.filter(q => (cat === 'all' || q.cat === cat));
          if (pool.length < 5) pool = TRIVIA_BANK;
          const questions = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);

          try {
            const res = await fetch('/api/arena/rooms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                category: cat,
                difficulty: diff,
                questions: questions,
                creator: {
                  name: getPlayerName(),
                  avatar: getPlayerAvatar()
                }
              })
            });
            const data = await res.json();
            if (data.success) {
              currentRoomCode = data.room.code;
              document.getElementById('display-room-code').innerText = data.room.code;
              document.getElementById('created-room-info').classList.remove('hidden');
              showToast('✓ Düello odası oluşturuldu! Kodu arkadaşınla paylaş.');
              
              // Düello modunda başlat
              switchArenaTab('solo');
              startSoloGame(questions);
            }
          } catch(e) {
            showToast('Oda oluşturulamadı.');
          }
        }

        async function joinDuelRoom() {
          const code = document.getElementById('input-join-code').value.trim().toUpperCase();
          if (!code) return;

          try {
            const res = await fetch(`/api/arena/rooms/${code}`);
            const data = await res.json();
            if (data.success && data.room) {
              currentRoomCode = code;
              showToast(`✓ ${code} odasına bağlanıldı! Karşılaşma başlıyor...`);
              switchArenaTab('solo');
              startSoloGame(data.room.questions);
            } else {
              showToast('Oda bulunamadı veya süre aşımına uğradı.');
            }
          } catch(e) {
            showToast('Odaya bağlanılamadı.');
          }
        }

        async function submitDuelScore(code, score) {
          try {
            const res = await fetch(`/api/arena/rooms/${code}/submit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                player: {
                  name: getPlayerName(),
                  avatar: getPlayerAvatar(),
                  score: score
                }
              })
            });
            const data = await res.json();
            if (data.success) {
              showDuelComparison(data.room);
            }
          } catch(e) {}
        }

        function showDuelComparison(room) {
          const card = document.getElementById('duel-comparison-card');
          card.classList.remove('hidden');
          switchArenaTab('duel');

          const p1 = room.creator;
          const p2 = room.opponent;

          document.getElementById('duel-p1-name').innerText = p1.name;
          document.getElementById('duel-p1-score').innerText = (p1.score !== undefined ? p1.score : '-') + ' Puan';
          
          if (p2) {
            document.getElementById('duel-p2-name').innerText = p2.name;
            document.getElementById('duel-p2-score').innerText = (p2.score !== undefined ? p2.score : '-') + ' Puan';

            // Kazanan tespiti
            if (p1.score !== undefined && p2.score !== undefined) {
              const myName = getPlayerName();
              let result = 'draw';
              if (p1.score > p2.score) result = (myName === p1.name) ? 'win' : 'loss';
              else if (p2.score > p1.score) result = (myName === p2.name) ? 'win' : 'loss';

              if (result === 'win') {
                playerStats.duelWins++;
                unlockAchievement('duel_master');
                document.getElementById('duel-verdict-title').innerText = '🎉 KAZANDIN!';
                document.getElementById('duel-verdict-icon').innerText = '🏆';
              } else if (result === 'loss') {
                playerStats.duelLosses++;
                document.getElementById('duel-verdict-title').innerText = 'KAYBETTİN';
                document.getElementById('duel-verdict-icon').innerText = '💔';
              } else {
                document.getElementById('duel-verdict-title').innerText = 'BERABERE!';
                document.getElementById('duel-verdict-icon').innerText = '🤝';
              }

              // Maç geçmişine kaydet
              playerStats.matchHistory.unshift({
                roomCode: room.code,
                opponent: (myName === p1.name ? p2.name : p1.name),
                myScore: (myName === p1.name ? p1.score : p2.score),
                oppScore: (myName === p1.name ? p2.score : p1.score),
                result: result,
                date: new Date().toLocaleDateString('tr-TR')
              });
              savePlayerStats();
            }
          }
        }

        function copyRoomLink() {
          const code = document.getElementById('display-room-code').innerText;
          const url = window.location.origin + '/app/kultur-arena?room=' + code;
          navigator.clipboard.writeText(url).then(() => {
            showToast('✓ Düello bağlantısı panoya kopyalandı!');
          });
        }

        // 5. İstatistikler & Başarımlar Render
        function renderStatsAndAchievements() {
          document.getElementById('stat-total-games').innerText = playerStats.totalGames;
          
          const totalAns = playerStats.correctAnswers + playerStats.wrongAnswers;
          const acc = totalAns > 0 ? Math.round((playerStats.correctAnswers / totalAns) * 100) : 0;
          document.getElementById('stat-accuracy').innerText = '%' + acc;
          document.getElementById('stat-win-loss').innerText = `${playerStats.duelWins}G / ${playerStats.duelLosses}M`;
          document.getElementById('stat-best-score').innerText = playerStats.bestScore;

          // Rozetleri çiz
          const container = document.getElementById('achievements-container');
          container.innerHTML = ACHIEVEMENTS_DEF.map(ach => {
            const isUnlocked = playerStats.achievements.includes(ach.id);
            return `
              <div class="p-4 rounded-2xl border ${isUnlocked ? 'bg-white border-yellow-500/50' : 'bg-white border-mistral-hairline opacity-60'} flex items-center gap-3.5 transition">
                <div class="text-2xl ${isUnlocked ? '' : 'grayscale'}">${ach.name.split(' ')[0]}</div>
                <div>
                  <h4 class="font-bold text-xs text-mistral-ink">${ach.name.split(' ').slice(1).join(' ')}</h4>
                  <p class="text-[11px] text-mistral-slate mt-0.5">${ach.desc}</p>
                  <span class="text-[10px] font-mono text-yellow-400 mt-1 block">+${ach.xp} XP</span>
                </div>
              </div>
            `;
          }).join('');
        }

        function unlockAchievement(id) {
          if (!playerStats.achievements.includes(id)) {
            playerStats.achievements.push(id);
            const def = ACHIEVEMENTS_DEF.find(a => a.id === id);
            if (def) {
              playerStats.xp += def.xp;
              showToast(`🏅 Başarım Açıldı: ${def.name} (+${def.xp} XP)`);
            }
          }
        }

        // 6. Maç Geçmişi Render
        function renderMatchHistory() {
          const container = document.getElementById('history-container');
          const empty = document.getElementById('history-empty');

          if (!playerStats.matchHistory || playerStats.matchHistory.length === 0) {
            container.innerHTML = '';
            empty.classList.remove('hidden');
            return;
          }

          empty.classList.add('hidden');
          container.innerHTML = playerStats.matchHistory.map(m => {
            const isWin = (m.result === 'win');
            const isDraw = (m.result === 'draw');
            const badgeClass = isWin ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : (isDraw ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30');
            const badgeText = isWin ? 'GALİBİYET' : (isDraw ? 'BERABERE' : 'MAĞLUBİYET');

            return `
              <div class="p-4 rounded-2xl bg-white border border-mistral-hairline flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">${isWin ? '🏆' : (isDraw ? '🤝' : '⚔️')}</span>
                  <div>
                    <h4 class="font-bold text-sm text-mistral-ink">vs ${m.opponent}</h4>
                    <span class="text-[11px] text-mistral-slate font-mono">Oda: ${m.roomCode} • ${m.date}</span>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-right font-mono font-bold text-base text-white">
                    ${m.myScore} - ${m.oppScore}
                  </div>
                  <span class="px-2.5 py-1 rounded-lg border text-xs font-bold ${badgeClass}">
                    ${badgeText}
                  </span>
                </div>
              </div>
            `;
          }).join('');
        }

        function clearMatchHistory() {
          if (!confirm('Tüm düello geçmişinizi silmek istediğinize emin misiniz?')) return;
          playerStats.matchHistory = [];
          savePlayerStats();
          renderMatchHistory();
        }

        // 7. Liderlik Tablosu Render
        async function renderLeaderboard() {
          const tbody = document.getElementById('leaderboard-tbody');
          try {
            const res = await fetch('/api/arena/leaderboard');
            const list = await res.json();
            
            tbody.innerHTML = list.map((user, idx) => `
              <tr class="hover:bg-mistral-cream transition">
                <td class="py-3 pl-2 font-mono font-bold ${idx === 0 ? 'text-yellow-400' : (idx === 1 ? 'text-mistral-slate' : (idx === 2 ? 'text-amber-600' : 'text-mistral-stone'))}">
                  #${idx + 1}
                </td>
                <td class="py-3 flex items-center gap-2">
                  <img src="${user.avatar}" class="w-6 h-6 rounded-full border border-mistral-hairline">
                  <span class="font-bold text-mistral-ink">${user.name}</span>
                </td>
                <td class="py-3 text-center">
                  <span class="px-2 py-0.5 rounded bg-white text-yellow-300 font-bold text-[10px]">Lvl ${user.level}</span>
                </td>
                <td class="py-3 text-right font-mono text-mistral-slate">${user.games}</td>
                <td class="py-3 text-right pr-2 font-mono font-bold text-yellow-400">${user.xp.toLocaleString('tr-TR')} XP</td>
              </tr>
            `).join('');
          } catch(e) {}
        }

        // 8. Profil & Storage Yönetimi
        const STORAGE_KEY = 'vibe_arena_stats';

        function loadPlayerStats() {
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) playerStats = Object.assign(playerStats, JSON.parse(saved));
          } catch(e) {}
        }

        function savePlayerStats() {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(playerStats));
          } catch(e) {}
        }

        function getPlayerName() {
          if (window.__vibe_user) {
            const m = window.__vibe_user.user_metadata || {};
            return m.full_name || m.name || m.user_name || window.__vibe_user.email || 'Oyuncu';
          }
          return 'Melih Karasu';
        }

        function getPlayerAvatar() {
          if (window.__vibe_user && window.__vibe_user.user_metadata) {
            return window.__vibe_user.user_metadata.avatar_url || '';
          }
          return 'https://avatars.githubusercontent.com/u/144457496?v=4';
        }

        function updateProfileBadge() {
          const name = getPlayerName();
          const avatar = getPlayerAvatar();
          
          document.getElementById('player-name').innerText = name;
          if (avatar) {
            const img = document.getElementById('player-avatar');
            img.src = avatar;
            img.classList.remove('hidden');
            document.getElementById('player-avatar-fallback').classList.add('hidden');
          }

          // Seviye & XP hesabı (her 500 XP = 1 seviye)
          const level = Math.floor(playerStats.xp / 500) + 1;
          const currentLevelXp = playerStats.xp % 500;
          const pct = Math.round((currentLevelXp / 500) * 100);

          document.getElementById('player-level-badge').innerText = 'Seviye ' + level;
          document.getElementById('player-xp-bar').style.width = pct + '%';
          document.getElementById('player-xp-text').innerText = playerStats.xp + ' XP';
        }

        function showToast(msg) {
          const toast = document.getElementById('arena-toast');
          toast.innerText = msg;
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 3500);
        }

        // Başlangıç
        document.addEventListener('DOMContentLoaded', () => {
          loadPlayerStats();
          updateProfileBadge();

          // URL'de oda parametresi var mı kontrol et (Örn: ?room=ARENA-1234)
          const params = new URLSearchParams(window.location.search);
          const roomParam = params.get('room');
          if (roomParam) {
            switchArenaTab('duel');
            document.getElementById('input-join-code').value = roomParam;
            joinDuelRoom();
          }
        });
