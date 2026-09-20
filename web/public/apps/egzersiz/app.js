// İnteraktif Kas Anatomisi & Egzersiz Rehberi - Client Application
// Snouzy/workout-cool & Wger Anatomy Entegrasyonu

let currentMuscle = 'all';
let currentEquipment = 'all';
let currentView = 'front';
let allExercises = [];
let allMuscles = [];
let userRoutine = []; // Kişisel Spor Programı

// Güvenli HTML Kaçış Yardımcısı (XSS Savunması)
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Kas Gruplarını API'den Çek ve Filtre Çiplerini Doldur
async function loadMuscles() {
  try {
    const res = await fetch('/api/egzersiz/muscles');
    const data = await res.json();
    if (data.success && data.muscles) {
      allMuscles = data.muscles;
      renderMuscleChips(data.muscles);
    }
  } catch (err) {
    console.error('Kas grupları alınamadı:', err);
  }
}

// Kas Filtreleme Butonlarını Çiz
function renderMuscleChips(muscles) {
  const container = document.getElementById('muscle-chips-container');
  if (!container) return;

  const chipsHtml = `
    <button 
      type="button" 
      onclick="selectMuscle('all')" 
      id="chip-all" 
      class="muscle-chip-btn active px-3.5 py-1.5 rounded-lg border border-mistral-hairline text-xs font-semibold cursor-pointer">
      🌟 Tüm Vücut
    </button>
  ` + muscles.map(m => `
    <button 
      type="button" 
      onclick="selectMuscle('${m.id}')" 
      id="chip-${m.id}" 
      class="muscle-chip-btn px-3 py-1.5 rounded-lg border border-mistral-hairline bg-white hover:bg-mistral-cream text-mistral-ink text-xs font-medium cursor-pointer flex items-center gap-1.5">
      <span>${m.icon}</span>
      <span>${escapeHtml(m.name.split('(')[0].trim())}</span>
      <span class="text-[10px] text-mistral-stone font-mono">(${m.exerciseCount})</span>
    </button>
  `).join('');

  container.innerHTML = chipsHtml;
}

// Kas Seçimi (Hem Vücut Şemasından Hem Butonlardan Tetiklenir)
function selectMuscle(muscleId) {
  currentMuscle = muscleId;

  // Buton aktiflik sınıflarını güncelle
  document.querySelectorAll('.muscle-chip-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-stone-900', 'text-white');
    btn.classList.add('bg-white', 'text-mistral-ink');
  });

  const activeChip = document.getElementById(`chip-${muscleId}`);
  if (activeChip) {
    activeChip.classList.add('active', 'bg-stone-900', 'text-white');
    activeChip.classList.remove('bg-white', 'text-mistral-ink');
  }

  // SVG Anatomi Şekillerini Vurgula
  document.querySelectorAll('.muscle-group-shape').forEach(shape => {
    if (shape.dataset.muscle === muscleId) {
      shape.classList.add('active');
    } else {
      shape.classList.remove('active');
    }
  });

  // Seçilen kas bilgi kartını güncelle
  const activeMuscleData = allMuscles.find(m => m.id === muscleId);
  const infoEl = document.getElementById('selected-muscle-info');
  if (infoEl) {
    if (activeMuscleData) {
      infoEl.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-xl">${activeMuscleData.icon}</span>
          <div>
            <strong class="text-sm text-mistral-ink font-bold block">${escapeHtml(activeMuscleData.name)}</strong>
            <span class="text-xs text-mistral-slate">${escapeHtml(activeMuscleData.desc)}</span>
          </div>
        </div>
      `;
    } else {
      infoEl.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-xl">🏋️</span>
          <div>
            <strong class="text-sm text-mistral-ink font-bold block">Tüm Vücut Egzersiz Kütüphanesi</strong>
            <span class="text-xs text-mistral-slate">workout-cool ve Wger standartlarında derlenmiş 800+ hareket rehberi.</span>
          </div>
        </div>
      `;
    }
  }

  loadExercises();
}

// Vücut Görünümünü Değiştir (Ön / Arka Görünüm)
function switchBodyView(view) {
  currentView = view;
  const frontBtn = document.getElementById('btn-view-front');
  const backBtn = document.getElementById('btn-view-back');
  const frontSvg = document.getElementById('anatomy-svg-front');
  const backSvg = document.getElementById('anatomy-svg-back');

  if (view === 'front') {
    if (frontBtn) { frontBtn.classList.add('bg-mistral-ink', 'text-white'); frontBtn.classList.remove('bg-white', 'text-mistral-ink'); }
    if (backBtn) { backBtn.classList.remove('bg-mistral-ink', 'text-white'); backBtn.classList.add('bg-white', 'text-mistral-ink'); }
    if (frontSvg) frontSvg.classList.remove('hidden');
    if (backSvg) backSvg.classList.add('hidden');
  } else {
    if (backBtn) { backBtn.classList.add('bg-mistral-ink', 'text-white'); backBtn.classList.remove('bg-white', 'text-mistral-ink'); }
    if (frontBtn) { frontBtn.classList.remove('bg-mistral-ink', 'text-white'); frontBtn.classList.add('bg-white', 'text-mistral-ink'); }
    if (backSvg) backSvg.classList.remove('hidden');
    if (frontSvg) frontSvg.classList.add('hidden');
  }
}

// Ekipman Filtresi Değiştiğinde
function filterByEquipment(equip) {
  currentEquipment = equip;

  document.querySelectorAll('.equipment-filter-btn').forEach(btn => {
    btn.classList.remove('active', 'border-mistral-orange', 'text-mistral-orange', 'font-bold');
    btn.classList.add('text-mistral-slate');
  });

  const activeBtn = document.getElementById(`equip-${equip}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'border-mistral-orange', 'text-mistral-orange', 'font-bold');
    activeBtn.classList.remove('text-mistral-slate');
  }

  loadExercises();
}

// Arama Girişi
function onExerciseSearch() {
  loadExercises();
}

// Egzersizleri API'den Çek ve Kartları Çiz
async function loadExercises() {
  const container = document.getElementById('exercises-grid');
  const countEl = document.getElementById('exercise-count-label');
  const searchInput = document.getElementById('exercise-search-input');
  const searchVal = (searchInput ? searchInput.value : '').trim();

  const url = `/api/egzersiz/list?muscle=${encodeURIComponent(currentMuscle)}&equipment=${encodeURIComponent(currentEquipment)}&search=${encodeURIComponent(searchVal)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.success || !data.exercises) {
      if (container) container.innerHTML = '<div class="col-span-full p-8 text-center text-sm text-mistral-stone">Egzersiz bulunamadı.</div>';
      return;
    }

    allExercises = data.exercises;
    if (countEl) countEl.innerText = `${data.total} Egzersiz`;

    renderExerciseCards(data.exercises);
  } catch (err) {
    console.error('Egzersiz listeleme hatası:', err);
    if (container) {
      container.innerHTML = '<div class="col-span-full p-8 text-center text-rose-600 text-sm">Egzersizler yüklenirken hata oluştu.</div>';
    }
  }
}

// Egzersiz Kartlarını Ekrana Bas
function renderExerciseCards(exercises) {
  const container = document.getElementById('exercises-grid');
  if (!container) return;

  if (exercises.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-12 text-center rounded-2xl bg-white border border-dashed border-stone-300 text-mistral-slate">
        <span class="text-3xl block mb-2">🔍</span>
        <strong class="text-mistral-ink block mb-1">Seçilen Kriterlere Uygun Egzersiz Bulunamadı</strong>
        <p class="text-xs text-mistral-stone">Farklı bir ekipman filtresi deneyebilir veya kas seçimini "Tüm Vücut" yapabilirsiniz.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = exercises.map(ex => {
    const diffBadge = ex.difficulty === 'Başlangıç' 
      ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Başlangıç</span>'
      : ex.difficulty === 'Orta'
      ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Orta Seviye</span>'
      : '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">İleri Seviye</span>';

    const isInRoutine = userRoutine.some(item => item.exerciseId === ex.id);

    return `
      <div class="exercise-card p-5 rounded-2xl bg-white border border-mistral-hairline shadow-xs flex flex-col justify-between group">
        <div>
          <!-- Resim / Görsel Başlık -->
          <div class="relative w-full h-44 rounded-xl overflow-hidden bg-stone-100 mb-4 border border-stone-200/80">
            <img 
              src="${escapeHtml(ex.imageUrl)}" 
              alt="${escapeHtml(ex.name)}" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy">
            <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              ${diffBadge}
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/90 backdrop-blur text-mistral-ink border border-stone-200">
                ${escapeHtml(ex.mechanics)}
              </span>
            </div>
          </div>

          <!-- Başlık & İsim -->
          <h3 class="font-bold text-base sm:text-lg text-mistral-ink group-hover:text-mistral-orange transition-colors tracking-tight mb-1">
            ${escapeHtml(ex.name)}
          </h3>
          <div class="text-xs text-mistral-stone font-mono mb-3">
            ${escapeHtml(ex.nameEn)}
          </div>

          <!-- Hedef Kaslar & Ekipman Etiketleri -->
          <div class="flex flex-wrap items-center gap-1.5 mb-4 text-[11px]">
            <span class="px-2.5 py-1 rounded-md bg-mistral-cream text-mistral-ink border border-mistral-beige-deep font-semibold">
              🎯 ${escapeHtml(ex.primaryMuscle.toUpperCase())}
            </span>
            <span class="px-2.5 py-1 rounded-md bg-stone-100 text-mistral-slate border border-stone-200">
              ⚙️ ${escapeHtml(ex.equipment.toUpperCase())}
            </span>
            <span class="px-2.5 py-1 rounded-md bg-stone-50 text-mistral-slate border border-stone-200">
              🏷️ ${escapeHtml(ex.type)}
            </span>
          </div>

          <!-- Fizik Tedavi / Postür İpucu -->
          ${ex.therapyTip ? `
            <div class="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 mb-4 leading-relaxed">
              <strong class="font-semibold text-amber-800 flex items-center gap-1 mb-0.5">
                <span>🧘</span> Postür & Fizik Tedavi Notu:
              </strong>
              ${escapeHtml(ex.therapyTip)}
            </div>
          ` : ''}
        </div>

        <!-- Aksiyon Butonları -->
        <div class="flex items-center gap-2 pt-2">
          <button 
            type="button" 
            onclick="addToRoutine('${ex.id}')" 
            class="flex-1 py-2.5 px-3 rounded-xl ${isInRoutine ? 'bg-emerald-600 text-white' : 'bg-stone-900 hover:bg-stone-800 text-white'} font-semibold text-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs">
            <i class="fa-solid ${isInRoutine ? 'fa-check' : 'fa-plus'} text-xs"></i>
            <span>${isInRoutine ? 'Programda Ekli' : 'Programa Ekle'}</span>
          </button>
          
          <button 
            type="button" 
            onclick="openExerciseModal('${ex.id}')" 
            title="Adım Adım Form & Video İzle"
            class="py-2.5 px-3 rounded-xl bg-mistral-cream hover:bg-mistral-orange hover:text-white text-mistral-ink font-semibold text-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer border border-mistral-beige-deep shrink-0">
            <i class="fa-solid fa-play text-xs"></i>
            <span class="hidden sm:inline">Form & Video</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// =============================================================
// SPOR PROGRAMI YÖNETİMİ (ROUTINE BUILDER)
// =============================================================

// Yerel Depolamadan Rutini Yükle
function loadRoutineFromStorage() {
  try {
    const raw = localStorage.getItem('vibe_workout_routine');
    if (raw) {
      userRoutine = JSON.parse(raw);
    }
  } catch (e) {
    userRoutine = [];
  }
  renderRoutine();
}

// Yerel Depolamaya Kaydet
function saveRoutineToStorage() {
  try {
    localStorage.setItem('vibe_workout_routine', JSON.stringify(userRoutine));
  } catch (e) {}
  renderRoutine();
}

// Egzersizi Programa Ekle
function addToRoutine(exerciseId) {
  const ex = allExercises.find(e => e.id === exerciseId);
  if (!ex) return;

  const existing = userRoutine.find(item => item.exerciseId === exerciseId);
  if (existing) {
    existing.sets += 1;
    if (typeof showToast === 'function') {
      showToast(`"${ex.name}" için set sayısı artırıldı (${existing.sets} set).`, 'info');
    }
  } else {
    userRoutine.push({
      exerciseId: ex.id,
      name: ex.name,
      nameEn: ex.nameEn,
      primaryMuscle: ex.primaryMuscle,
      equipment: ex.equipment,
      sets: 3,
      reps: 10,
      weight: ex.equipment === 'bodyweight' ? 0 : 20,
      restSeconds: 60
    });
    if (typeof showToast === 'function') {
      showToast(`"${ex.name}" spor programınıza eklendi!`, 'success');
    }
  }

  saveRoutineToStorage();
  renderExerciseCards(allExercises); // Kartlardaki "Programda Ekli" durumunu güncelle
}

// Programdaki Egzersizi Güncelle (Set, Tekrar, Ağırlık, Dinlenme)
function updateRoutineItem(idx, field, value) {
  if (!userRoutine[idx]) return;
  const numVal = parseInt(value, 10);
  userRoutine[idx][field] = isNaN(numVal) ? value : numVal;
  saveRoutineToStorage();
}

// Egzersiz Sırasını Değiştir (Yukarı / Aşağı)
function moveRoutineItem(idx, direction) {
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= userRoutine.length) return;
  const temp = userRoutine[idx];
  userRoutine[idx] = userRoutine[targetIdx];
  userRoutine[targetIdx] = temp;
  saveRoutineToStorage();
}

// Egzersizi Programdan Çıkar
function removeFromRoutine(idx) {
  if (!userRoutine[idx]) return;
  const removedName = userRoutine[idx].name;
  userRoutine.splice(idx, 1);
  saveRoutineToStorage();
  renderExerciseCards(allExercises);
  if (typeof showToast === 'function') {
    showToast(`"${removedName}" programdan çıkarıldı.`, 'info');
  }
}

// Programı Tamamen Temizle
function clearRoutine() {
  if (userRoutine.length === 0) return;
  if (confirm('Tüm spor programını temizlemek istediğinize emin misiniz?')) {
    userRoutine = [];
    saveRoutineToStorage();
    renderExerciseCards(allExercises);
    if (typeof showToast === 'function') {
      showToast('Spor programınız temizlendi.', 'info');
    }
  }
}

// Program Paneli Arayüzünü Çiz
function renderRoutine() {
  const container = document.getElementById('routine-items-container');
  const countBadge = document.getElementById('routine-count-badge');
  const summaryBar = document.getElementById('routine-summary-bar');

  if (countBadge) {
    countBadge.innerText = `${userRoutine.length} Egzersiz`;
  }

  if (!container) return;

  if (userRoutine.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center rounded-xl bg-stone-50 border border-dashed border-stone-200 text-xs text-mistral-stone">
        Henüz programınıza egzersiz eklemediniz. Aşağıdaki egzersiz kartlarındaki <strong>"➕ Programa Ekle"</strong> butonuna tıklayarak hareketleri buraya toplayabilirsiniz.
      </div>
    `;
    if (summaryBar) summaryBar.classList.add('hidden');
    return;
  }

  if (summaryBar) summaryBar.classList.remove('hidden');

  // Özet İstatistikleri Hesapla
  const totalSets = userRoutine.reduce((sum, item) => sum + (parseInt(item.sets, 10) || 0), 0);
  const totalSeconds = userRoutine.reduce((sum, item) => sum + ((parseInt(item.sets, 10) || 0) * (parseInt(item.restSeconds, 10) || 60) + 45), 0);
  const estMinutes = Math.max(10, Math.round(totalSeconds / 60));
  const uniqueMuscles = [...new Set(userRoutine.map(i => i.primaryMuscle.toUpperCase()))].join(', ');

  document.getElementById('stat-routine-exercises').innerText = userRoutine.length;
  document.getElementById('stat-routine-sets').innerText = totalSets;
  document.getElementById('stat-routine-time').innerText = `~${estMinutes} dk`;
  document.getElementById('stat-routine-muscles').innerText = uniqueMuscles;

  // Tablo / Liste Çizimi
  container.innerHTML = `
    <div class="space-y-3">
      ${userRoutine.map((item, idx) => `
        <div class="p-4 rounded-xl bg-stone-50 border border-mistral-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Sol: İsim & Sıralama -->
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-mistral-cream text-mistral-orange border border-mistral-beige-deep text-xs font-bold flex items-center justify-center shrink-0">
              ${idx + 1}
            </span>
            <div>
              <div class="font-bold text-sm text-mistral-ink">${escapeHtml(item.name)}</div>
              <div class="text-[11px] text-mistral-stone font-mono">
                ${escapeHtml(item.primaryMuscle.toUpperCase())} &bull; ${escapeHtml(item.equipment.toUpperCase())}
              </div>
            </div>
          </div>

          <!-- Orta: Parametre Düzenleyicileri (Set, Tekrar, Ağırlık, Dinlenme) -->
          <div class="flex flex-wrap items-center gap-3 text-xs">
            <div class="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-mistral-hairline">
              <span class="text-mistral-stone font-medium">Set:</span>
              <input 
                type="number" 
                min="1" 
                max="12" 
                value="${item.sets}" 
                onchange="updateRoutineItem(${idx}, 'sets', this.value)" 
                class="w-12 text-center font-bold text-mistral-ink focus:outline-none focus:text-mistral-orange">
            </div>

            <div class="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-mistral-hairline">
              <span class="text-mistral-stone font-medium">Tekrar:</span>
              <input 
                type="number" 
                min="1" 
                max="100" 
                value="${item.reps}" 
                onchange="updateRoutineItem(${idx}, 'reps', this.value)" 
                class="w-12 text-center font-bold text-mistral-ink focus:outline-none focus:text-mistral-orange">
            </div>

            <div class="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-mistral-hairline">
              <span class="text-mistral-stone font-medium">Ağırlık:</span>
              <input 
                type="number" 
                min="0" 
                max="500" 
                step="2.5" 
                value="${item.weight}" 
                onchange="updateRoutineItem(${idx}, 'weight', this.value)" 
                class="w-14 text-center font-bold text-mistral-ink focus:outline-none focus:text-mistral-orange">
              <span class="text-mistral-stone text-[11px]">kg</span>
            </div>

            <div class="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-mistral-hairline">
              <span class="text-mistral-stone font-medium">Mola:</span>
              <input 
                type="number" 
                min="15" 
                max="300" 
                step="15" 
                value="${item.restSeconds}" 
                onchange="updateRoutineItem(${idx}, 'restSeconds', this.value)" 
                class="w-12 text-center font-bold text-mistral-ink focus:outline-none focus:text-mistral-orange">
              <span class="text-mistral-stone text-[11px]">sn</span>
            </div>
          </div>

          <!-- Sağ: Yukarı / Aşağı / Sil Butonları -->
          <div class="flex items-center gap-1 self-end md:self-center">
            <button 
              type="button" 
              onclick="moveRoutineItem(${idx}, -1)" 
              ${idx === 0 ? 'disabled class="w-7 h-7 rounded text-stone-300 cursor-not-allowed"' : 'class="w-7 h-7 rounded hover:bg-stone-200 text-mistral-slate cursor-pointer"'} 
              title="Yukarı Taşı">
              <i class="fa-solid fa-chevron-up text-xs"></i>
            </button>
            <button 
              type="button" 
              onclick="moveRoutineItem(${idx}, 1)" 
              ${idx === userRoutine.length - 1 ? 'disabled class="w-7 h-7 rounded text-stone-300 cursor-not-allowed"' : 'class="w-7 h-7 rounded hover:bg-stone-200 text-mistral-slate cursor-pointer"'} 
              title="Aşağı Taşı">
              <i class="fa-solid fa-chevron-down text-xs"></i>
            </button>
            <button 
              type="button" 
              onclick="removeFromRoutine(${idx})" 
              class="w-7 h-7 rounded hover:bg-rose-100 text-rose-600 transition cursor-pointer flex items-center justify-center ml-1" 
              title="Programdan Çıkar">
              <i class="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// =============================================================
// PROGRAMI FARKLI FORMATLARDA DIŞA AKTARMA (EXPORT ENGINE)
// =============================================================

function exportRoutine(format) {
  if (userRoutine.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Dışa aktarmak için önce programınıza egzersiz ekleyin.', 'warning');
    }
    return;
  }

  const dateStr = new Date().toLocaleDateString('tr-TR');

  if (format === 'markdown') {
    // 1. Markdown / Düz Metin Formatı (Panoya Kopyalama)
    let md = `# 🏋️ Antrenman Programım - ${dateStr}\n\n`;
    md += `> Toplam: ${userRoutine.length} Egzersiz | Tahmini Süre: ~${Math.round(userRoutine.length * 7)} dk\n\n`;
    userRoutine.forEach((item, idx) => {
      md += `### ${idx + 1}. ${item.name} (${item.primaryMuscle.toUpperCase()})\n`;
      md += `- **Ekipman:** ${item.equipment.toUpperCase()}\n`;
      md += `- **Hedef:** ${item.sets} Set x ${item.reps} Tekrar @ ${item.weight} kg (Dinlenme: ${item.restSeconds} sn)\n`;
      for (let s = 1; s <= item.sets; s++) {
        md += `  - [ ] Set ${s}: [   ] tekrar @ [   ] kg\n`;
      }
      md += `\n`;
    });

    if (typeof safeCopyToClipboard === 'function') {
      safeCopyToClipboard(md, 'Antrenman programı Markdown olarak panoya kopyalandı!');
    } else {
      navigator.clipboard.writeText(md).then(() => {
        if (typeof showToast === 'function') showToast('Program panoya kopyalandı!', 'success');
      });
    }
  } else if (format === 'csv') {
    // 2. CSV / Excel Formatı İndir
    let csv = `Sıra,Egzersiz Adı,Kas Grubu,Ekipman,Set Sayısı,Tekrar,Ağırlık (kg),Dinlenme (sn)\n`;
    userRoutine.forEach((item, idx) => {
      csv += `"${idx + 1}","${item.name}","${item.primaryMuscle}","${item.equipment}","${item.sets}","${item.reps}","${item.weight}","${item.restSeconds}"\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `antrenman-programim-${dateStr.replace(/\./g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('CSV dosyası başarıyla indirildi.', 'success');
  } else if (format === 'json') {
    // 3. JSON Formatı İndir
    const exportData = {
      title: "Kişisel Antrenman Programı",
      date: dateStr,
      exerciseCount: userRoutine.length,
      routine: userRoutine
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `antrenman-programim-${dateStr.replace(/\./g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('JSON dosyası başarıyla indirildi.', 'success');
  } else if (format === 'print') {
    // 4. Yazdır / PDF Formatı
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <title>Antrenman Programım - ${dateStr}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #111; }
          h1 { font-size: 20px; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
          .meta { font-size: 12px; color: #555; margin-bottom: 20px; }
          .item { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 12px; page-break-inside: avoid; }
          .item-title { font-weight: bold; font-size: 15px; margin-bottom: 4px; }
          .item-sub { font-size: 12px; color: #666; margin-bottom: 8px; }
          .set-boxes { display: flex; gap: 8px; font-size: 12px; }
          .set-box { border: 1px solid #999; padding: 6px 10px; border-radius: 4px; min-width: 80px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h1>🏋️ Kişisel Antrenman Takip Formu</h1>
          <button onclick="window.print()" style="padding: 6px 14px; font-size: 12px; font-weight: bold; cursor: pointer;">Yazdır / PDF</button>
        </div>
        <div class="meta">
          <strong>Tarih:</strong> ${dateStr} &bull; <strong>Toplam Egzersiz:</strong> ${userRoutine.length} &bull; <strong>Hedef:</strong> Güç & Postür Gelişimi
        </div>
        <div>
          ${userRoutine.map((item, idx) => `
            <div class="item">
              <div class="item-title">${idx + 1}. ${escapeHtml(item.name)}</div>
              <div class="item-sub">Kas Grubu: ${escapeHtml(item.primaryMuscle.toUpperCase())} &bull; Ekipman: ${escapeHtml(item.equipment.toUpperCase())} &bull; Hedef: ${item.sets} Set x ${item.reps} Tekrar @ ${item.weight} kg &bull; Dinlenme: ${item.restSeconds} sn</div>
              <div class="set-boxes">
                ${Array.from({ length: item.sets }).map((_, s) => `
                  <div class="set-box">
                    <strong>Set ${s + 1}</strong> [ &nbsp; ]<br>
                    <span style="font-size: 10px; color: #777;">__ kg &times; __ tk</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
  }
}

// =============================================================
// MODAL DİYALOG VE VİDEO YÖNETİMİ (KAPATINCA VİDEOYU DURDURUR)
// =============================================================

function openExerciseModal(exerciseId) {
  const ex = allExercises.find(e => e.id === exerciseId);
  if (!ex) return;

  const modal = document.getElementById('exercise-modal');
  const modalContent = document.getElementById('modal-exercise-content');

  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <!-- Modal Başlık -->
    <div class="p-6 border-b border-mistral-hairline flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-mistral-cream text-mistral-orange border border-mistral-beige-deep uppercase">
            ${escapeHtml(ex.primaryMuscle)}
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-mistral-ink border border-stone-200">
            ${escapeHtml(ex.equipment)}
          </span>
        </div>
        <h2 class="text-xl sm:text-2xl font-bold font-editorial text-mistral-ink tracking-tight">
          ${escapeHtml(ex.name)}
        </h2>
        <div class="text-xs text-mistral-stone font-mono mt-0.5">${escapeHtml(ex.nameEn)}</div>
      </div>
      <button 
        type="button" 
        onclick="closeExerciseModal()" 
        class="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-mistral-slate flex items-center justify-center text-sm cursor-pointer transition">
        ✕
      </button>
    </div>

    <!-- Modal Gövde (Video + Talimatlar) -->
    <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
      
      <!-- YouTube Video / Animasyon İskeleti -->
      ${ex.videoEmbedUrl ? `
        <div class="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-md border border-stone-200">
          <iframe 
            src="${escapeHtml(ex.videoEmbedUrl)}" 
            title="${escapeHtml(ex.name)}" 
            class="w-full h-full border-0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      ` : ''}

      <!-- Adım Adım Doğru Form Talimatları -->
      <div>
        <h4 class="font-bold text-sm text-mistral-ink mb-3 flex items-center gap-2">
          <span>📋</span> Doğru Form & Hareketi Uygulama Adımları
        </h4>
        <div class="space-y-2.5">
          ${ex.instructions.map((step, idx) => `
            <div class="p-3.5 rounded-xl bg-stone-50 border border-mistral-hairline flex items-start gap-3 text-xs leading-relaxed text-mistral-slate">
              <span class="w-5 h-5 rounded-full bg-mistral-orange text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                ${idx + 1}
              </span>
              <span>${escapeHtml(step)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Fizik Tedavi & Yaralanma Önleme İpuçları -->
      ${ex.therapyTip ? `
        <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1.5 leading-relaxed">
          <strong class="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
            <span>🛡️</span> Sakatlık Önleme & Postür Terapisi
          </strong>
          <p>${escapeHtml(ex.therapyTip)}</p>
        </div>
      ` : ''}

      <!-- Hedef Kas Anatomisi Özeti -->
      <div class="p-4 rounded-xl bg-mistral-cream border border-mistral-beige-deep text-xs text-mistral-slate">
        <strong class="text-mistral-ink block font-bold mb-1">Anatomik Katılım:</strong>
        <div>Birincil Hedef: <strong class="text-mistral-orange">${escapeHtml(ex.primaryMuscle.toUpperCase())}</strong></div>
        <div>İkincil Destekleyici: <span class="text-mistral-slate">${ex.secondaryMuscles.map(m => m.toUpperCase()).join(', ')}</span></div>
      </div>

    </div>
  `;

  modal.classList.remove('hidden');
}

// Modal Kapatıldığında İçeriği Boşaltarak Videoyu ve Sesi Anında Durdurur
function closeExerciseModal() {
  const modal = document.getElementById('exercise-modal');
  const modalContent = document.getElementById('modal-exercise-content');
  if (modalContent) {
    modalContent.innerHTML = ''; // İframe tamamen yok edilir, video/ses kesin olarak durur
  }
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Global Kapsama Bağla (Window)
window.selectMuscle = selectMuscle;
window.switchBodyView = switchBodyView;
window.filterByEquipment = filterByEquipment;
window.onExerciseSearch = onExerciseSearch;
window.openExerciseModal = openExerciseModal;
window.closeExerciseModal = closeExerciseModal;
window.addToRoutine = addToRoutine;
window.updateRoutineItem = updateRoutineItem;
window.moveRoutineItem = moveRoutineItem;
window.removeFromRoutine = removeFromRoutine;
window.clearRoutine = clearRoutine;
window.exportRoutine = exportRoutine;

// Sayfa Yüklendiğinde Başlat
document.addEventListener('DOMContentLoaded', () => {
  loadMuscles();
  loadExercises();
  loadRoutineFromStorage();

  // Escape tuşuna basıldığında modalı kapatıp videoyu durdur
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeExerciseModal();
    }
  });

  // Modal arka planına tıklandığında kapatıp videoyu durdur
  const modal = document.getElementById('exercise-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeExerciseModal();
      }
    });
  }
});
