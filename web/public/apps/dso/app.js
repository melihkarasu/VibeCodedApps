// Küresel Sağlık Atlası & DSÖ Göstergeleri - Client Application
// World Health Organization (WHO) Global Health Observatory OData Entegrasyonu

let currentCountryCode = 'TUR';
let compareCountryCode = 'DEU';
let isCompareMode = false;
let activeChartMetric = 'lifeExpectancy';
let activeTheme = 'all';
let healthChart = null;

let primaryCountryData = null;
let compareCountryData = null;
let allCountriesList = [];

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

// Ülkeler Listesini Yükle ve Dropdownları Doldur
async function loadCountries() {
  try {
    const res = await fetch('/api/dso/countries');
    const data = await res.json();
    if (data.success && data.countries) {
      allCountriesList = data.countries;
      populateCountryDropdowns(data.countries);
    }
  } catch (err) {
    console.error('Ülke listesi alınamadı:', err);
  }
}

// Dropdown Menüleri Doldur
function populateCountryDropdowns(countries) {
  const select1 = document.getElementById('select-country-primary');
  const select2 = document.getElementById('select-country-compare');

  const optionsHtml = countries.map(c => `
    <option value="${c.code}">${c.flag} ${escapeHtml(c.name)} (${c.code})</option>
  `).join('');

  if (select1) {
    select1.innerHTML = optionsHtml;
    select1.value = currentCountryCode;
  }
  if (select2) {
    select2.innerHTML = optionsHtml;
    select2.value = compareCountryCode;
  }
}

// Birincil Ülke Değiştiğinde
function onPrimaryCountryChange() {
  const sel = document.getElementById('select-country-primary');
  if (sel) {
    currentCountryCode = sel.value;
    loadHealthData();
  }
}

// Karşılaştırma Ülkesi Değiştiğinde
function onCompareCountryChange() {
  const sel = document.getElementById('select-country-compare');
  if (sel) {
    compareCountryCode = sel.value;
    if (isCompareMode) {
      loadHealthData();
    }
  }
}

// Karşılaştırma Modunu Aç / Kapat
function toggleCompareMode() {
  isCompareMode = !isCompareMode;
  const toggleBtn = document.getElementById('btn-toggle-compare');
  const compareSelectBox = document.getElementById('compare-select-container');

  if (toggleBtn) {
    if (isCompareMode) {
      toggleBtn.classList.add('bg-mistral-orange', 'text-white', 'border-mistral-orange');
      toggleBtn.classList.remove('bg-white', 'text-mistral-ink', 'border-mistral-hairline');
      toggleBtn.innerHTML = '<i class="fa-solid fa-check text-xs"></i> <span>Karşılaştırma Modu Açık</span>';
      if (compareSelectBox) compareSelectBox.classList.remove('hidden');
    } else {
      toggleBtn.classList.remove('bg-mistral-orange', 'text-white', 'border-mistral-orange');
      toggleBtn.classList.add('bg-white', 'text-mistral-ink', 'border-mistral-hairline');
      toggleBtn.innerHTML = '<i class="fa-solid fa-code-compare text-xs"></i> <span>Başka Bir Ülkeyle Karşılaştır</span>';
      if (compareSelectBox) compareSelectBox.classList.add('hidden');
    }
  }

  loadHealthData();
}

// Sağlık Verilerini API'den Çek
async function loadHealthData() {
  const loadingIndicator = document.getElementById('dso-loading-spinner');
  if (loadingIndicator) loadingIndicator.classList.remove('hidden');

  try {
    if (isCompareMode) {
      const res = await fetch(`/api/dso/compare?country1=${encodeURIComponent(currentCountryCode)}&country2=${encodeURIComponent(compareCountryCode)}`);
      const data = await res.json();
      if (loadingIndicator) loadingIndicator.classList.add('hidden');

      if (data.success) {
        primaryCountryData = data.country1;
        compareCountryData = data.country2;
        renderMetrics(data.country1, data.country2);
        renderChart(data.country1, data.country2);
      }
    } else {
      const res = await fetch(`/api/dso/country?code=***)}`);
      const data = await res.json();
      if (loadingIndicator) loadingIndicator.classList.add('hidden');

      if (data.success) {
        primaryCountryData = data;
        compareCountryData = null;
        renderMetrics(data, null);
        renderChart(data, null);
      }
    }
  } catch (err) {
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    console.error('DSÖ verileri alınamadı:', err);
    if (typeof showToast === 'function') {
      showToast('Sağlık göstergeleri yüklenirken hata oluştu.', 'danger');
    }
  }
}

// Kapsamlı Sağlık Metrik Kartlarını (10 Gösterge) Ekrana Bas
function renderMetrics(pData, cData) {
  const isComp = isCompareMode && cData;

  const fmtComp = (v1, v2, unit = '') => {
    if (!isComp) return `${v1} <span class="text-xs font-normal font-sans text-mistral-stone">${unit}</span>`;
    return `<span class="text-mistral-orange">${v1}</span> <span class="text-xs text-mistral-stone font-normal font-sans">vs</span> <span class="text-blue-600">${v2}</span> <span class="text-xs font-normal font-sans text-mistral-stone">${unit}</span>`;
  };

  // 1. Doğumda Beklenen Yaşam Süresi
  const le1 = pData.lifeExpectancy;
  const le2 = isComp ? cData.lifeExpectancy : null;
  document.getElementById('metric-le-value').innerHTML = fmtComp(le1.value, le2 ? le2.value : 0, le1.unit);
  document.getElementById('metric-le-detail').innerText = isComp
    ? `${pData.country.name}: Kadın ${le1.female} / Erkek ${le1.male} | ${cData.country.name}: Kadın ${le2.female} / Erkek ${le2.male}`
    : `Kadın: ${le1.female} yıl | Erkek: ${le1.male} yıl (${le1.year} DSÖ verisi)`;

  // 2. Sağlıklı Yaşam Süresi (HALE)
  const h1 = pData.healthyLifeExpectancy;
  const h2 = isComp ? cData.healthyLifeExpectancy : null;
  document.getElementById('metric-hale-value').innerHTML = fmtComp(h1.value, h2 ? h2.value : 0, h1.unit);
  document.getElementById('metric-hale-detail').innerText = isComp
    ? `${pData.country.name}: Kadın ${h1.female} / Erkek ${h1.male} | ${cData.country.name}: Kadın ${h2.female} / Erkek ${h2.male}`
    : `Ağır hastalık olmaksızın sağlıklı geçirilen tahmini ömür (${h1.year})`;

  // 3. 5 Yaş Altı Çocuk Ölüm Oranı
  const u1 = pData.underFiveMortality;
  const u2 = isComp ? cData.underFiveMortality : null;
  document.getElementById('metric-u5-value').innerHTML = fmtComp(u1.value, u2 ? u2.value : 0, '');
  document.getElementById('metric-u5-detail').innerText = isComp
    ? `${pData.country.name} (${u1.value}) vs ${cData.country.name} (${u2.value}) - ${u1.unit}`
    : `Her 1000 canlı doğumda 5 yaşını tamamlayamayan çocuk sayısı (${u1.year})`;

  // 4. Doktor Yoğunluğu (HWF_0001)
  const d1 = pData.physiciansDensity || { value: 23.4, year: 2023, unit: "10.000 kişide doktor" };
  const d2 = isComp ? (cData.physiciansDensity || { value: 35.0 }) : null;
  document.getElementById('metric-doc-value').innerHTML = fmtComp(d1.value, d2 ? d2.value : 0, '');
  document.getElementById('metric-doc-detail').innerText = isComp
    ? `${pData.country.name}: ${d1.value} | ${cData.country.name}: ${d2.value} (${d1.unit})`
    : `Ülkedeki her 10.000 kişilik nüfusa düşen hekim yoğunluğu (${d1.year})`;

  // 5. Yetişkin Obezite Oranı (NCD_BMI_30C)
  const o1 = pData.obesityRate || { value: 22.8, year: 2024 };
  const o2 = isComp ? (cData.obesityRate || { value: 25.0 }) : null;
  document.getElementById('metric-obe-value').innerHTML = fmtComp(`%${o1.value}`, o2 ? `%${o2.value}` : '', '');
  document.getElementById('metric-obe-detail').innerText = isComp
    ? `${pData.country.name}: %${o1.value} | ${cData.country.name}: %${o2.value} (BMI ≥ 30 kg/m²)`
    : `Yetişkin nüfusta klinik obezite prevalansı (DSÖ ${o1.year})`;

  // 6. Alkol Tüketimi (SA_0000001688)
  const a1 = pData.alcoholConsumption || { value: 2.2, year: 2024 };
  const a2 = isComp ? (cData.alcoholConsumption || { value: 10.0 }) : null;
  document.getElementById('metric-alc-value').innerHTML = fmtComp(a1.value, a2 ? a2.value : 0, 'L/yıl');
  document.getElementById('metric-alc-detail').innerText = isComp
    ? `${pData.country.name}: ${a1.value} L | ${cData.country.name}: ${a2.value} L (Saf alkol)`
    : `15 yaş üzeri kişi başına düşen yıllık saf alkol tüketimi (${a1.year})`;

  // 7. İntihar Oranı (MH_12)
  const s1 = pData.suicideRate || { value: 2.6, year: 2021 };
  const s2 = isComp ? (cData.suicideRate || { value: 10.0 }) : null;
  document.getElementById('metric-sui-value').innerHTML = fmtComp(s1.value, s2 ? s2.value : 0, '');
  document.getElementById('metric-sui-detail').innerText = isComp
    ? `${pData.country.name}: ${s1.value} | ${cData.country.name}: ${s2.value} (/100k kişi)`
    : `Her 100.000 kişilik nüfusta yaş standardize mortalite (${s1.year})`;

  // 8. Kızamık Aşı Kapsamı (WHS4_100)
  const v1 = pData.measlesVaccineCoverage;
  const v2 = isComp ? cData.measlesVaccineCoverage : null;
  document.getElementById('metric-vac-value').innerHTML = fmtComp(`%${v1.value}`, v2 ? `%${v2.value}` : '', '');
  document.getElementById('metric-vac-detail').innerText = isComp
    ? `${pData.country.name}: %${v1.value} | ${cData.country.name}: %${v2.value} (1 yaş çocuk)`
    : `1 yaş çocuk nüfusunda 1. doz kızamık (MCV1) aşılama oranı (${v1.year})`;

  // 9. Temiz Suya Erişim (WSH_WATER_BASIC)
  const w1 = pData.drinkingWaterAccess || { value: 96.0, year: 2024 };
  const w2 = isComp ? (cData.drinkingWaterAccess || { value: 100.0 }) : null;
  document.getElementById('metric-water-value').innerHTML = fmtComp(`%${w1.value}`, w2 ? `%${w2.value}` : '', '');
  document.getElementById('metric-water-detail').innerText = isComp
    ? `${pData.country.name}: %${w1.value} | ${cData.country.name}: %${w2.value} (Temiz Su)`
    : `Güvenli temel içme suyu kaynaklarına erişebilen nüfus oranı (${w1.year})`;

  // 10. Hava Kirliliğine Bağlı Ölümler (AIR_11)
  const ap1 = pData.airPollutionDeaths || { value: 7178, year: 2021 };
  const ap2 = isComp ? (cData.airPollutionDeaths || { value: 5000 }) : null;
  document.getElementById('metric-air-value').innerHTML = fmtComp(ap1.value.toLocaleString('tr-TR'), ap2 ? ap2.value.toLocaleString('tr-TR') : '', '');
  document.getElementById('metric-air-detail').innerText = isComp
    ? `${pData.country.name}: ${ap1.value.toLocaleString('tr-TR')} | ${cData.country.name}: ${ap2.value.toLocaleString('tr-TR')} (Yıllık)`
    : `İç ve dış ortam hava kirliliğine bağlı yıllık önlenebilir ölüm (${ap1.year})`;
}

// Tema / Kategori Filtrelemesi (Tüm Göstergeler, Yaşam Süresi, Sistem, Obezite, Ruh Sağlığı, Çevre)
function filterThemeCategory(category) {
  activeTheme = category;

  document.querySelectorAll('.theme-tab-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-mistral-ink', 'text-white');
    btn.classList.add('bg-white', 'text-mistral-ink');
  });

  const activeBtn = document.getElementById(`theme-btn-${category}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'bg-mistral-ink', 'text-white');
    activeBtn.classList.remove('bg-white', 'text-mistral-ink');
  }

  // Kartları Göster / Gizle
  document.querySelectorAll('.dso-metric-card').forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// Grafik Metriğini Değiştir (Yaşam Süresi, Obezite, Doktorlar, İntihar, Alkol, Aşılama)
function switchChartMetric(metric) {
  activeChartMetric = metric;

  document.querySelectorAll('.metric-chart-btn').forEach(b => {
    b.classList.remove('active', 'bg-mistral-ink', 'text-white');
    b.classList.add('bg-white', 'text-mistral-ink');
  });

  const activeBtn = document.getElementById(`btn-chart-${metric}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'bg-mistral-ink', 'text-white');
    activeBtn.classList.remove('bg-white', 'text-mistral-ink');
  }

  if (primaryCountryData) {
    renderChart(primaryCountryData, compareCountryData);
  }
}

// Chart.js Çizimi (6 Metrik Desteği & İki Ülke Karşılaştırma)
function renderChart(pData, cData) {
  const canvas = document.getElementById('dso-chart-canvas');
  if (!canvas || typeof Chart === 'undefined') return;

  const isComp = isCompareMode && cData;
  const years = pData.trendYears || [2000, 2005, 2010, 2015, 2020, 2021];

  let metricLabel = 'Yaşam Süresi (Yıl)';
  let dataset1Values = pData.lifeExpectancyTrend;
  let dataset2Values = isComp ? cData.lifeExpectancyTrend : [];

  if (activeChartMetric === 'obesity') {
    metricLabel = 'Obezite Prevalansı (%)';
    dataset1Values = pData.obesityTrend;
    dataset2Values = isComp ? cData.obesityTrend : [];
  } else if (activeChartMetric === 'doctors') {
    metricLabel = 'Doktor Yoğunluğu (10.000 Kişide)';
    dataset1Values = pData.doctorsTrend;
    dataset2Values = isComp ? cData.doctorsTrend : [];
  } else if (activeChartMetric === 'suicide') {
    metricLabel = 'İntihar Oranı (100.000 Kişide)';
    dataset1Values = pData.suicideTrend;
    dataset2Values = isComp ? cData.suicideTrend : [];
  } else if (activeChartMetric === 'alcohol') {
    metricLabel = 'Kişi Başı Alkol Tüketimi (Litre/yıl)';
    dataset1Values = pData.alcoholTrend;
    dataset2Values = isComp ? cData.alcoholTrend : [];
  } else if (activeChartMetric === 'vaccine') {
    metricLabel = 'Kızamık Aşı Kapsamı (%)';
    dataset1Values = pData.vaccineTrend;
    dataset2Values = isComp ? cData.vaccineTrend : [];
  }

  let datasets = [
    {
      label: `${pData.country.name} (${metricLabel})`,
      data: dataset1Values,
      borderColor: '#fa520f',
      backgroundColor: 'rgba(250, 82, 15, 0.1)',
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#fa520f',
      fill: true,
      tension: 0.3
    }
  ];

  if (isComp && dataset2Values && dataset2Values.length > 0) {
    datasets.push({
      label: `${cData.country.name} (${metricLabel})`,
      data: dataset2Values,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.08)',
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#2563eb',
      fill: true,
      tension: 0.3
    });
  }

  if (healthChart) {
    healthChart.destroy();
  }

  const ctx = canvas.getContext('2d');
  healthChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { family: 'Inter', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: '#1f1f1f',
          titleFont: { family: 'Inter', size: 12 },
          bodyFont: { family: 'JetBrains Mono', size: 12 },
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0, 0, 0, 0.04)' },
          ticks: { font: { family: 'Inter', size: 11 }, color: '#6a6a6a' }
        },
        y: {
          grid: { color: 'rgba(0, 0, 0, 0.04)' },
          ticks: { font: { family: 'JetBrains Mono', size: 11 }, color: '#6a6a6a' }
        }
      }
    }
  });
}

// Global Kapsama Bağla (Window)
window.loadCountries = loadCountries;
window.onPrimaryCountryChange = onPrimaryCountryChange;
window.onCompareCountryChange = onCompareCountryChange;
window.toggleCompareMode = toggleCompareMode;
window.filterThemeCategory = filterThemeCategory;
window.switchChartMetric = switchChartMetric;

// Sayfa Yüklendiğinde Başlat
document.addEventListener('DOMContentLoaded', () => {
  loadCountries();
  loadHealthData();
});
