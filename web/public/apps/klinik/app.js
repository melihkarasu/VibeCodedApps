// Klinik Araştırmalar Radarı - Client Application
// U.S. NIH ClinicalTrials.gov API v2 Entegrasyonu & Canlı Çalışma Takibi

let currentCondition = 'kanser';
let currentPhase = 'ALL';
let currentStatus = 'ALL';
let isTurkeyOnly = false;
let allStudies = [];
let followedStudies = []; // Kullanıcının Takip Ettiği Çalışmalar (Favlananlar)

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

// Klinik Çalışmaları API'den Çek
async function searchStudies(customQuery) {
  const inputEl = document.getElementById('study-search-input');
  if (customQuery && inputEl) {
    inputEl.value = customQuery;
  }
  const q = (customQuery || (inputEl ? inputEl.value : '') || currentCondition).trim();

  const container = document.getElementById('studies-grid');
  const countLabel = document.getElementById('study-count-label');
  const loadingIndicator = document.getElementById('search-loading');

  if (loadingIndicator) loadingIndicator.classList.remove('hidden');

  let apiUrl = `/api/klinik/studies?query=${encodeURIComponent(q)}&phase=${encodeURIComponent(currentPhase)}&status=${encodeURIComponent(currentStatus)}`;
  if (isTurkeyOnly) {
    apiUrl += `&country=Turkey`;
  }

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (loadingIndicator) loadingIndicator.classList.add('hidden');

    if (!data.success || !data.studies || data.studies.length === 0) {
      if (container) {
        container.innerHTML = `
          <div class="col-span-full p-12 text-center rounded-2xl bg-white border border-dashed border-stone-300 text-mistral-slate">
            <span class="text-3xl block mb-2">🔍</span>
            <strong class="text-mistral-ink block mb-1">"${escapeHtml(q)}" İçin Eşleşen Klinik Çalışma Bulunamadı</strong>
            <p class="text-xs text-mistral-stone">Filtreleri gevşetebilir veya farklı bir hastalık/tedavi terimi aratabilirsiniz.</p>
          </div>
        `;
      }
      if (countLabel) countLabel.innerText = '0 Çalışma';
      return;
    }

    allStudies = data.studies;
    if (countLabel) countLabel.innerText = `${data.count} Klinik Çalışma`;

    renderStudyCards(data.studies);
  } catch (err) {
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    console.error('Klinik çalışma arama hatası:', err);
    if (container) {
      container.innerHTML = '<div class="col-span-full p-8 text-center text-rose-600 text-sm">Veriler yüklenirken bağlantı hatası oluştu.</div>';
    }
  }
}

// Yardımcı: Faz Rozeti Sınıfı ve Başlığı
function getPhaseBadgeInfo(phases) {
  const phaseStr = (phases && phases[0]) ? phases[0].toUpperCase() : 'BELİRTİLMEMİŞ';
  let badgeClass = 'phase-badge-DEFAULT';
  let label = phaseStr;

  if (phaseStr.includes('PHASE1')) { badgeClass = 'phase-badge-PHASE1'; label = 'Faz I'; }
  else if (phaseStr.includes('PHASE2')) { badgeClass = 'phase-badge-PHASE2'; label = 'Faz II'; }
  else if (phaseStr.includes('PHASE3')) { badgeClass = 'phase-badge-PHASE3'; label = 'Faz III'; }
  else if (phaseStr.includes('PHASE4')) { badgeClass = 'phase-badge-PHASE4'; label = 'Faz IV'; }

  return { badgeClass, label };
}

// Yardımcı: Durum Rozeti Sınıfı ve Başlığı
function getStatusPillInfo(statusStr) {
  const s = statusStr || 'ACTIVE';
  let badgeClass = 'status-pill-ACTIVE';
  let label = 'Aktif';

  if (s === 'RECRUITING') {
    badgeClass = 'status-pill-RECRUITING';
    label = '● Hasta Kabul Ediyor';
  } else if (s === 'COMPLETED') {
    badgeClass = 'status-pill-COMPLETED';
    label = 'Tamamlandı';
  } else if (s === 'ACTIVE_NOT_RECRUITING') {
    badgeClass = 'status-pill-ACTIVE_NOT_RECRUITING';
    label = 'Tedavi Sürüyor';
  } else if (s === 'TERMINATED') {
    badgeClass = 'bg-rose-50 text-rose-700 border border-rose-200';
    label = 'Durduruldu';
  } else if (s === 'WITHDRAWN') {
    badgeClass = 'bg-stone-100 text-stone-600 border border-stone-200';
    label = 'Geri Çekildi';
  }

  return { badgeClass, label };
}

// Çalışma Kartlarını Ekrana Çiz
function renderStudyCards(studies) {
  const container = document.getElementById('studies-grid');
  if (!container) return;

  container.innerHTML = studies.map(st => {
    const { badgeClass: phaseBadgeClass, label: phaseLabel } = getPhaseBadgeInfo(st.phases);
    const { badgeClass: statusBadgeClass, label: statusLabel } = getStatusPillInfo(st.overallStatus);

    const isFollowed = followedStudies.some(item => item.nctId === st.nctId);
    const hasTurkey = st.locations && st.locations.some(l => l.country && l.country.toLowerCase() === 'turkey');
    const locationCities = (st.locations || []).slice(0, 3).map(l => l.city).filter(Boolean).join(', ') || 'Çok Merkezli';

    return `
      <div class="study-card p-6 rounded-2xl bg-white border border-mistral-hairline shadow-xs flex flex-col justify-between group">
        <div>
          <!-- Üst Etiketler (Faz, Durum & Takip Yıldızı) -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${phaseBadgeClass}">
              ${escapeHtml(phaseLabel)}
            </span>
            <div class="flex items-center gap-1.5">
              ${hasTurkey ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">🇹🇷 Türkiye</span>' : ''}
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusBadgeClass}">
                ${escapeHtml(statusLabel)}
              </span>
            </div>
          </div>

          <!-- Protokol No & Başlık -->
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[11px] font-mono text-mistral-stone font-semibold">
              ${escapeHtml(st.nctId)}
            </span>
            <button 
              type="button" 
              onclick="toggleFollowStudy('${escapeHtml(st.nctId)}')" 
              title="${isFollowed ? 'Takibi Bırak' : 'Bu Klinik Çalışmayı Takip Et / Favla'}"
              class="w-7 h-7 rounded-lg ${isFollowed ? 'bg-amber-100 text-amber-600 border border-amber-300' : 'bg-stone-50 text-stone-400 hover:text-amber-500 hover:bg-amber-50 border border-stone-200'} flex items-center justify-center transition cursor-pointer shrink-0">
              <i class="fa-${isFollowed ? 'solid' : 'regular'} fa-star text-xs"></i>
            </button>
          </div>

          <h3 class="font-bold text-base sm:text-lg text-mistral-ink group-hover:text-mistral-orange transition-colors tracking-tight line-clamp-2 mb-2">
            ${escapeHtml(st.briefTitle)}
          </h3>

          <!-- Hastalık / Endikasyon Rozetleri -->
          <div class="flex flex-wrap items-center gap-1 mb-3 text-[11px]">
            ${(st.conditions || []).slice(0, 2).map(c => `
              <span class="px-2 py-0.5 rounded-md bg-mistral-cream text-mistral-ink border border-mistral-beige-deep font-medium">
                ${escapeHtml(c)}
              </span>
            `).join('')}
          </div>

          <!-- Özet Metin -->
          <p class="text-xs text-mistral-slate leading-relaxed line-clamp-3 mb-4">
            ${escapeHtml(st.briefSummary)}
          </p>

          <!-- Sponsor & Lokasyon Bilgisi -->
          <div class="pt-3 border-t border-mistral-hairline text-[11px] text-mistral-stone space-y-1">
            <div class="truncate">
              <strong class="text-mistral-ink">Sponsor:</strong> ${escapeHtml(st.leadSponsor)}
            </div>
            <div class="truncate">
              <strong class="text-mistral-ink">Merkezler:</strong> 📍 ${escapeHtml(locationCities)}
            </div>
          </div>
        </div>

        <!-- Alt Aksiyon Butonları -->
        <div class="flex items-center gap-2 pt-4">
          <button 
            type="button" 
            onclick="openStudyModal('${escapeHtml(st.nctId)}')" 
            class="flex-1 py-2.5 px-3 rounded-xl bg-mistral-cream hover:bg-mistral-orange hover:text-white text-mistral-ink font-semibold text-xs transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer border border-mistral-beige-deep shadow-2xs">
            <span>Kriterler & Protokol Detayı</span>
            <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// =============================================================
// TAKİP & FAVORİ SİSTEMİ (FOLLOW & LIVE STATUS MONITOR)
// =============================================================

// Yerel Depolamadan Takip Listesini Oku
function loadFollowedFromStorage() {
  try {
    const raw = localStorage.getItem('vibe_followed_studies');
    if (raw) {
      followedStudies = JSON.parse(raw);
    }
  } catch (e) {
    followedStudies = [];
  }
  renderFollowedStudies();
}

// Yerel Depolamaya Kaydet
function saveFollowedToStorage() {
  try {
    localStorage.setItem('vibe_followed_studies', JSON.stringify(followedStudies));
  } catch (e) {}
  renderFollowedStudies();
}

// Çalışmayı Takip Et / Takibi Bırak (Toggle)
function toggleFollowStudy(nctId) {
  const existingIdx = followedStudies.findIndex(item => item.nctId === nctId);

  if (existingIdx !== -1) {
    // Takibi Bırak
    followedStudies.splice(existingIdx, 1);
    saveFollowedToStorage();
    renderStudyCards(allStudies);
    if (typeof showToast === 'function') {
      showToast(`${nctId} takip listenizden çıkarıldı.`, 'info');
    }
  } else {
    // Takibe Ekle
    const st = allStudies.find(s => s.nctId === nctId);
    if (!st) return;

    followedStudies.unshift({
      nctId: st.nctId,
      briefTitle: st.briefTitle,
      overallStatus: st.overallStatus,
      phases: st.phases,
      conditions: st.conditions,
      leadSponsor: st.leadSponsor,
      lastChecked: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      statusChanged: false
    });

    saveFollowedToStorage();
    renderStudyCards(allStudies);
    if (typeof showToast === 'function') {
      showToast(`⭐ ${nctId} takip listenize eklendi!`, 'success');
    }
  }
}

// Tek Bir Çalışmayı Takip Listesinden Çıkar
function removeFromFollowed(nctId) {
  const idx = followedStudies.findIndex(item => item.nctId === nctId);
  if (idx !== -1) {
    followedStudies.splice(idx, 1);
    saveFollowedToStorage();
    renderStudyCards(allStudies);
    if (typeof showToast === 'function') {
      showToast(`${nctId} takip listenizden çıkarıldı.`, 'info');
    }
  }
}

// Takip Edilen Çalışmalar Panelini Çiz
function renderFollowedStudies() {
  const container = document.getElementById('followed-items-container');
  const countBadge = document.getElementById('followed-count-badge');

  if (countBadge) {
    countBadge.innerText = `${followedStudies.length} Çalışma`;
  }

  if (!container) return;

  if (followedStudies.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center rounded-xl bg-amber-50/40 border border-dashed border-amber-200 text-xs text-mistral-stone">
        Henüz takip ettiğiniz bir klinik çalışma yok. Aşağıdaki katalogda yer alan araştırmaların üzerindeki <strong>"☆ Takip Et"</strong> butonuna tıklayarak çalışmaları buraya sabitleyebilir, canlı faz ve kabul durumlarını izleyebilirsiniz.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="space-y-3">
      ${followedStudies.map((item, idx) => {
        const { badgeClass: phaseBadgeClass, label: phaseLabel } = getPhaseBadgeInfo(item.phases);
        const { badgeClass: statusBadgeClass, label: statusLabel } = getStatusPillInfo(item.overallStatus);

        return `
          <div class="p-4 rounded-xl bg-white border ${item.statusChanged ? 'border-amber-400 bg-amber-50/30 ring-1 ring-amber-300' : 'border-mistral-hairline'} shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <!-- Sol: NCT, Başlık & Sponsor -->
            <div class="space-y-1 max-w-xl">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-mistral-cream text-mistral-orange border border-mistral-beige-deep font-mono">
                  ${escapeHtml(item.nctId)}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${phaseBadgeClass}">
                  ${escapeHtml(phaseLabel)}
                </span>
                ${item.statusChanged ? '<span class="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] animate-pulse">Durum Güncellendi!</span>' : ''}
              </div>
              <h4 class="font-bold text-sm text-mistral-ink line-clamp-1 hover:text-mistral-orange transition cursor-pointer" onclick="openStudyModal('${escapeHtml(item.nctId)}')">
                ${escapeHtml(item.briefTitle)}
              </h4>
              <div class="text-[11px] text-mistral-stone flex items-center gap-3">
                <span><strong>Sponsor:</strong> ${escapeHtml(item.leadSponsor || 'NIH Kayıtlı')}</span>
                <span>&bull;</span>
                <span>🕒 Son Kontrol: <strong class="text-mistral-slate">${escapeHtml(item.lastChecked || 'Bugün')}</strong></span>
              </div>
            </div>

            <!-- Sağ: Canlı Durum Rozeti & Aksiyonlar -->
            <div class="flex items-center gap-3 shrink-0 self-end md:self-center">
              <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass}">
                ${escapeHtml(statusLabel)}
              </span>

              <button 
                type="button" 
                onclick="openStudyModal('${escapeHtml(item.nctId)}')" 
                title="Detaylı Protokolü İncele"
                class="px-3 py-1.5 rounded-lg bg-mistral-cream hover:bg-mistral-orange hover:text-white text-mistral-ink text-xs font-semibold border border-mistral-beige-deep transition cursor-pointer flex items-center gap-1">
                <span>İncele</span>
                <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </button>

              <button 
                type="button" 
                onclick="removeFromFollowed('${escapeHtml(item.nctId)}')" 
                title="Takibi Bırak"
                class="w-7 h-7 rounded-lg hover:bg-rose-100 text-rose-600 border border-stone-200 transition cursor-pointer flex items-center justify-center">
                <i class="fa-solid fa-trash-can text-xs"></i>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Canlı Durumları ClinicalTrials.gov Üzerinden Yeniden Sorgula
async function refreshFollowedStudiesLive() {
  if (followedStudies.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Güncellemek için önce bir klinik çalışma takip etmelisiniz.', 'warning');
    }
    return;
  }

  const spinnerIcon = document.getElementById('refresh-spinner-icon');
  if (spinnerIcon) spinnerIcon.classList.add('fa-spin');

  let updatedCount = 0;

  try {
    await Promise.all(followedStudies.map(async (item) => {
      try {
        const res = await fetch(`/api/klinik/detail?id=${encodeURIComponent(item.nctId)}`);
        const data = await res.json();
        if (data.success && data.study) {
          const fresh = data.study;
          if (fresh.overallStatus && fresh.overallStatus !== item.overallStatus) {
            item.overallStatus = fresh.overallStatus;
            item.statusChanged = true;
            updatedCount++;
          }
          if (fresh.phases) {
            item.phases = fresh.phases;
          }
          item.lastChecked = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        }
      } catch (e) {
        console.warn(`${item.nctId} güncellenemedi:`, e);
      }
    }));

    saveFollowedToStorage();
    renderStudyCards(allStudies);

    if (typeof showToast === 'function') {
      if (updatedCount > 0) {
        showToast(`${updatedCount} çalışmanın canlı kabul/faz durumunda değişiklik tespit edildi!`, 'success');
      } else {
        showToast(`Takip ettiğiniz ${followedStudies.length} çalışmanın tüm durumları günceldir.`, 'info');
      }
    }
  } catch (err) {
    console.error('Canlı takip güncelleme hatası:', err);
  } finally {
    if (spinnerIcon) spinnerIcon.classList.remove('fa-spin');
  }
}

// Takip Edilen Çalışmaları Markdown Olarak Kopyala
function exportFollowedStudies() {
  if (followedStudies.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Kopyalamak için takip listenizde çalışma bulunmalıdır.', 'warning');
    }
    return;
  }

  const dateStr = new Date().toLocaleDateString('tr-TR');
  let md = `# 🔬 Takip Ettiğim Klinik Araştırmalar - ${dateStr}\n\n`;
  md += `> Toplam: ${followedStudies.length} Klinik Çalışma | Kaynak: NIH ClinicalTrials.gov\n\n`;

  followedStudies.forEach((item, idx) => {
    md += `### ${idx + 1}. [${item.nctId}](https://clinicaltrials.gov/study/${item.nctId}) - ${item.briefTitle}\n`;
    md += `- **Durum:** ${item.overallStatus}\n`;
    md += `- **Faz:** ${(item.phases && item.phases[0]) || 'Belirtilmemiş'}\n`;
    md += `- **Sponsor:** ${item.leadSponsor || 'Kayıtlı Sponsor'}\n\n`;
  });

  if (typeof safeCopyToClipboard === 'function') {
    safeCopyToClipboard(md, 'Takip listeniz Markdown olarak panoya kopyalandı!');
  } else {
    navigator.clipboard.writeText(md).then(() => {
      if (typeof showToast === 'function') showToast('Liste panoya kopyalandı!', 'success');
    });
  }
}

// Tüm Takip Listesini Temizle
function clearFollowedStudies() {
  if (followedStudies.length === 0) return;
  if (confirm('Tüm takip listenizi temizlemek istediğinize emin misiniz?')) {
    followedStudies = [];
    saveFollowedToStorage();
    renderStudyCards(allStudies);
    if (typeof showToast === 'function') {
      showToast('Takip listeniz temizlendi.', 'info');
    }
  }
}

// =============================================================
// MODAL DİYALOG VE DETAY GÖRÜNÜMÜ
// =============================================================

function openStudyModal(nctId) {
  const st = allStudies.find(s => s.nctId === nctId) || followedStudies.find(s => s.nctId === nctId);
  if (!st) return;

  const modal = document.getElementById('study-modal');
  const modalContent = document.getElementById('modal-study-content');

  if (!modal || !modalContent) return;

  const officialLink = `https://clinicaltrials.gov/study/${encodeURIComponent(st.nctId)}`;
  const isFollowed = followedStudies.some(item => item.nctId === st.nctId);

  modalContent.innerHTML = `
    <!-- Modal Başlık -->
    <div class="p-6 border-b border-mistral-hairline flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-mistral-cream text-mistral-orange border border-mistral-beige-deep font-mono">
            ${escapeHtml(st.nctId)}
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-mistral-slate border border-stone-200">
            ${escapeHtml((st.phases && st.phases[0]) || 'Faz Bilgisi')}
          </span>
        </div>
        <h2 class="text-xl sm:text-2xl font-bold font-editorial text-mistral-ink tracking-tight">
          ${escapeHtml(st.briefTitle)}
        </h2>
        <div class="text-xs text-mistral-stone mt-1">
          <strong>Sponsor:</strong> ${escapeHtml(st.leadSponsor)} &bull; <strong>Başlangıç:</strong> ${escapeHtml(st.startDate || 'Belirtilmemiş')}
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button 
          type="button" 
          onclick="toggleFollowStudy('${escapeHtml(st.nctId)}'); openStudyModal('${escapeHtml(st.nctId)}');" 
          title="${isFollowed ? 'Takibi Bırak' : 'Takip Et / Favla'}"
          class="px-3 py-1.5 rounded-lg ${isFollowed ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-stone-100 hover:bg-amber-50 text-mistral-ink border border-stone-200'} text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
          <i class="fa-${isFollowed ? 'solid' : 'regular'} fa-star text-amber-500"></i>
          <span>${isFollowed ? 'Takip Ediliyor' : 'Takip Et'}</span>
        </button>
        <button 
          type="button" 
          onclick="closeStudyModal()" 
          class="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-mistral-slate flex items-center justify-center text-sm cursor-pointer transition">
          ✕
        </button>
      </div>
    </div>

    <!-- Modal Gövde -->
    <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-mistral-slate leading-relaxed">
      
      <!-- Ayrıntılı Özet -->
      <div class="p-4 rounded-xl bg-mistral-cream/60 border border-mistral-beige-deep space-y-1.5">
        <strong class="text-sm font-bold text-mistral-ink block flex items-center gap-1.5">
          <span>🔬</span> Araştırma Hipotezi & Bilimsel Özet
        </strong>
        <p>${escapeHtml(st.briefSummary)}</p>
      </div>

      <!-- Uygunluk / Katılım Kriterleri -->
      <div>
        <strong class="text-sm font-bold text-mistral-ink block mb-2 flex items-center gap-1.5">
          <span>📋</span> Hasta Katılım & Uygunluk Kriterleri (Eligibility)
        </strong>
        <div class="p-4 rounded-xl bg-stone-50 border border-mistral-hairline whitespace-pre-line font-mono text-[11px] leading-normal text-mistral-slate">
          ${escapeHtml(st.eligibility || 'Kriter detayları için resmi protokol sayfasına başvurunuz.')}
        </div>
      </div>

      <!-- Araştırma Merkezleri / Hastaneler -->
      <div>
        <strong class="text-sm font-bold text-mistral-ink block mb-2 flex items-center gap-1.5">
          <span>🏥</span> Araştırma Merkezleri & Hastaneler
        </strong>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${(st.locations && st.locations.length > 0) ? st.locations.map(loc => `
            <div class="p-3 rounded-lg bg-white border border-mistral-hairline flex items-center gap-2">
              <span class="text-base text-mistral-orange">📍</span>
              <div class="truncate">
                <strong class="text-mistral-ink block truncate">${escapeHtml(loc.city)}, ${escapeHtml(loc.country)}</strong>
                <span class="text-[10px] text-mistral-stone truncate block">${escapeHtml(loc.facility)}</span>
              </div>
            </div>
          `).join('') : '<p class="text-stone-400">Merkez listesi için resmi kütüğe bakınız.</p>'}
        </div>
      </div>

      <!-- Resmi Protokol Bağlantısı -->
      <div class="pt-2 flex items-center justify-between border-t border-mistral-hairline">
        <span class="text-[11px] text-mistral-stone">NIH U.S. National Library of Medicine</span>
        <a 
          href="${officialLink}" 
          target="_blank" 
          rel="noopener" 
          class="px-4 py-2 rounded-lg bg-mistral-orange hover:bg-mistral-orange-deep text-white font-semibold text-xs transition flex items-center gap-1.5">
          <span>ClinicalTrials.gov Sayfasında Aç</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </a>
      </div>

    </div>
  `;

  modal.classList.remove('hidden');
}

// Modal Kapat
function closeStudyModal() {
  const modal = document.getElementById('study-modal');
  const modalContent = document.getElementById('modal-study-content');
  if (modalContent) modalContent.innerHTML = '';
  if (modal) modal.classList.add('hidden');
}

// Hazır Hastalık / Konu Seçimi
function selectPresetCondition(cond) {
  currentCondition = cond;
  const inputEl = document.getElementById('study-search-input');
  if (inputEl) inputEl.value = cond;

  document.querySelectorAll('.preset-cond-btn').forEach(b => {
    b.classList.remove('active', 'bg-stone-900', 'text-white');
    b.classList.add('bg-stone-100', 'text-mistral-ink');
  });

  const activeBtn = document.getElementById(`cond-${cond}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'bg-stone-900', 'text-white');
    activeBtn.classList.remove('bg-stone-100', 'text-mistral-ink');
  }

  searchStudies(cond);
}

// Faz Filtrelemesi
function filterByPhase(phase) {
  currentPhase = phase;
  document.querySelectorAll('.phase-filter-btn').forEach(b => {
    b.classList.remove('active', 'border-mistral-orange', 'text-mistral-orange', 'font-bold');
    b.classList.add('text-mistral-slate');
  });

  const activeBtn = document.getElementById(`phase-${phase}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'border-mistral-orange', 'text-mistral-orange', 'font-bold');
    activeBtn.classList.remove('text-mistral-slate');
  }

  searchStudies();
}

// Türkiye Konum Filtresi Değiştirici
function toggleTurkeyOnly() {
  isTurkeyOnly = !isTurkeyOnly;
  const btn = document.getElementById('btn-toggle-turkey');
  if (btn) {
    if (isTurkeyOnly) {
      btn.classList.add('bg-rose-600', 'text-white', 'border-rose-600');
      btn.classList.remove('bg-white', 'text-mistral-ink', 'border-mistral-hairline');
      btn.innerHTML = '<span>🇹🇷 Yalnızca Türkiye</span>';
    } else {
      btn.classList.remove('bg-rose-600', 'text-white', 'border-rose-600');
      btn.classList.add('bg-white', 'text-mistral-ink', 'border-mistral-hairline');
      btn.innerHTML = '<span>🌍 Küresel / Tüm Ülkeler</span>';
    }
  }
  searchStudies();
}

// Global Kapsama Bağla (Window)
window.searchStudies = searchStudies;
window.selectPresetCondition = selectPresetCondition;
window.filterByPhase = filterByPhase;
window.toggleTurkeyOnly = toggleTurkeyOnly;
window.openStudyModal = openStudyModal;
window.closeStudyModal = closeStudyModal;
window.toggleFollowStudy = toggleFollowStudy;
window.removeFromFollowed = removeFromFollowed;
window.refreshFollowedStudiesLive = refreshFollowedStudiesLive;
window.exportFollowedStudies = exportFollowedStudies;
window.clearFollowedStudies = clearFollowedStudies;

// Sayfa Yüklendiğinde Başlat
document.addEventListener('DOMContentLoaded', () => {
  loadFollowedFromStorage();
  searchStudies('kanser');

  // Escape tuşuna basıldığında modalı kapat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeStudyModal();
    }
  });

  // Modal dışına tıklandığında kapat
  const modal = document.getElementById('study-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeStudyModal();
      }
    });
  }
});
