let geoMap = null;
        let geoMarker = null;

        function initGeoMap() {
          geoMap = L.map('geo-map', {
            center: [39, 35],
            zoom: 5
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(geoMap);
        }

        async function fetchIpInfo(queryIp = '') {
          const errBox = document.getElementById('ip-error-box');
          errBox.classList.add('hidden');

          try {
            const url = queryIp ? `/api/ip/lookup?ip=${encodeURIComponent(queryIp)}` : '/api/ip/lookup';
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
              throw new Error(data.error || 'Konum bilgisi alınamadı');
            }

            document.getElementById('res-ip').innerText = data.ip;
            document.getElementById('res-country').innerText = `${data.country} (${data.countryCode})`;
            document.getElementById('res-city').innerText = `${data.city}, ${data.regionName}`;
            document.getElementById('res-isp').innerText = data.isp;
            document.getElementById('res-as').innerText = data.as || '-';
            document.getElementById('res-tz').innerText = data.timezone;
            document.getElementById('res-zip').innerText = data.zip || '-';

            // Haritada Göster
            if (geoMap && data.lat && data.lon) {
              const pos = [data.lat, data.lon];
              geoMap.setView(pos, 11, { animate: true });

              if (geoMarker) geoMarker.remove();

              const customIcon = L.divIcon({
                html: '<div style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); transform: translate(-14px, -14px);"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>',
                className: 'custom-geo-icon',
                iconSize: [28, 28]
              });

              geoMarker = L.marker(pos, { icon: customIcon })
                .addTo(geoMap)
                .bindPopup(`<strong>${data.city}, ${data.country}</strong><br>${data.ip}<br>${data.isp}`)
                .openPopup();
            }
          } catch(err) {
            errBox.innerText = '' + err.message;
            errBox.classList.remove('hidden');
          }
        }

        function lookupIp() {
          const val = document.getElementById('input-ip').value.trim();
          fetchIpInfo(val);
        }

        function lookupSelfIp() {
          document.getElementById('input-ip').value = '';
          fetchIpInfo('');
        }

        document.addEventListener('DOMContentLoaded', () => {
          initGeoMap();
          fetchIpInfo('');
        });
