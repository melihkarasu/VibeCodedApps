let aqiChartInstance = null;

        function getAqiCategory(aqi) {
          if (aqi <= 20) {
            return {
              label: 'Çok İyi (Temiz Hava)',
              bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
              advice: 'Hava kalitesi mükemmel. Açık havada yürüyüş, koşu ve spor aktiviteleri için harika bir gün. Pencereleri açıp evi havalandırabilirsiniz.'
            };
          } else if (aqi <= 40) {
            return {
              label: 'İyi (Kabul Edilebilir)',
              bg: 'bg-teal-100 text-teal-800 border-teal-300',
              advice: 'Hava kalitesi genel nüfus için tatmin edici. Ancak olağandışı hassasiyete sahip kişiler hafif rahatsızlık hissedebilir.'
            };
          } else if (aqi <= 60) {
            return {
              label: 'Orta Düzey Kirlilik',
              bg: 'bg-amber-100 text-amber-800 border-amber-300',
              advice: 'Hassas gruplar (astım, KOAH, yaşlılar ve çocuklar) uzun süreli yoğun açık hava eforlarını sınırlandırmalıdır.'
            };
          } else if (aqi <= 80) {
            return {
              label: 'Hassas Gruplar İçin Kötü',
              bg: 'bg-orange-100 text-orange-800 border-orange-300',
              advice: 'Hassas bünyeler açık hava aktivitelerini azaltmalı, gerekirse dışarı çıkarken maske takmalıdır. Genel halk hafif boğaz kuruluğu yaşayabilir.'
            };
          } else {
            return {
              label: 'Çok Kötü / Tehlikeli',
              bg: 'bg-rose-100 text-rose-800 border-rose-300',
              advice: 'Acil durum uyarısı: Dışarıda efor sarf etmekten kaçının. Pencereleri kapalı tutun ve hava temizleyici kullanın.'
            };
          }
        }

        async function loadCity(city) {
          try {
            document.getElementById('lbl-city-name').innerText = city.toUpperCase() + ' YÜKLENİYOR...';
            const res = await fetch(`/api/openaq/latest?city=${encodeURIComponent(city)}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            document.getElementById('lbl-city-name').innerText = data.city.toUpperCase();
            document.getElementById('val-aqi').innerText = data.aqi;
            document.getElementById('val-pm25').innerText = data.pm25 + ' µg/m³';
            document.getElementById('val-pm10').innerText = data.pm10 + ' µg/m³';
            document.getElementById('val-no2').innerText = data.no2 + ' µg/m³';
            document.getElementById('val-o3').innerText = data.o3 + ' µg/m³';

            const cat = getAqiCategory(data.aqi);
            const badge = document.getElementById('box-status-badge');
            badge.className = 'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 border shadow-2xs ' + cat.bg;
            document.getElementById('txt-status-level').innerText = cat.label;
            document.getElementById('txt-health-advice').innerText = cat.advice;

            renderAqiChart(data.hourly);
          } catch(err) {
            alert('Hava kalitesi ölçümü alınamadı: ' + err.message);
          }
        }

        function searchCity() {
          const val = document.getElementById('city-search').value.trim();
          if (val) loadCity(val);
        }

        function renderAqiChart(hourly) {
          const times = (hourly.time || []).slice(0, 24).map(t => t.split('T')[1] || t);
          const pm25Data = (hourly.pm2_5 || []).slice(0, 24);
          const pm10Data = (hourly.pm10 || []).slice(0, 24);

          const ctx = document.getElementById('chart-aqi').getContext('2d');
          if (aqiChartInstance) aqiChartInstance.destroy();

          aqiChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
              labels: times,
              datasets: [
                {
                  label: 'PM2.5',
                  data: pm25Data,
                  borderColor: '#fa520f',
                  backgroundColor: 'rgba(250, 82, 15, 0.1)',
                  fill: true,
                  tension: 0.3,
                  pointRadius: 2
                },
                {
                  label: 'PM10',
                  data: pm10Data,
                  borderColor: '#ffd06a',
                  backgroundColor: 'transparent',
                  tension: 0.3,
                  pointRadius: 2
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top', labels: { font: { family: 'Inter', size: 11 } } }
              },
              scales: {
                x: { grid: { display: false } },
                y: { grid: { color: '#f0f2f5' } }
              }
            }
          });
        }

        document.addEventListener('DOMContentLoaded', () => {
          loadCity('Istanbul');
        });
