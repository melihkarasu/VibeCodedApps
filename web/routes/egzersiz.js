module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <link rel="stylesheet" href="/static/apps/egzersiz/app.css?v=2.0" />
      <script src="/static/apps/egzersiz/app.js?v=2.0" defer></script>
    `;

    const content = `
      <!-- Üst Başlık & Navigasyon -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-orange transition text-sm flex items-center gap-1 font-medium">
              &larr; Vitrine Dön
            </a>
            <span class="text-mistral-hairline">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep text-xs font-semibold">Sağlık</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-normal font-editorial tracking-tight mt-1.5 text-mistral-ink flex items-center gap-2">
            <span>🏋️</span> İnteraktif Kas Anatomisi & Egzersiz
          </h1>
          <p class="text-mistral-slate text-sm mt-0.5 font-normal">
            workout-cool ve Wger açık veritabanı ile ön/arka vücut kas haritası, hedeflenen egzersizler ve doğru form rehberi.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-ink shadow-xs">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium">workout-cool & Wger Bağlı</span>
        </div>
      </div>

      <!-- ANATOMİK HARİTA & KAS SEÇİCİ BÖLÜMÜ -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        <!-- Sol: İnteraktif Vücut Anatomisi Şeması (5 Kolon) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
            
            <div class="flex items-center justify-between pb-3 border-b border-mistral-hairline">
              <span class="text-xs uppercase font-bold tracking-wider text-mistral-stone">Vücut Görünümü</span>
              <div class="flex items-center gap-1 p-1 rounded-lg bg-stone-100 border border-stone-200 text-xs">
                <button 
                  type="button" 
                  onclick="switchBodyView('front')" 
                  id="btn-view-front" 
                  class="px-3 py-1 rounded-md font-semibold bg-mistral-ink text-white transition cursor-pointer">
                  Ön Anatomi
                </button>
                <button 
                  type="button" 
                  onclick="switchBodyView('back')" 
                  id="btn-view-back" 
                  class="px-3 py-1 rounded-md font-semibold bg-white text-mistral-ink hover:bg-stone-200 transition cursor-pointer">
                  Arka Anatomi
                </button>
              </div>
            </div>

            <!-- Vektörel İnteraktif İnsan Anatomisi Şeması -->
            <div class="anatomy-svg-box w-full rounded-xl p-6 flex items-center justify-center relative min-h-[360px] select-none">
              
              <!-- ÖN GÖRÜNÜM SVG ŞEMASI -->
              <svg id="anatomy-svg-front" viewBox="0 0 200 320" class="w-full max-w-[220px] h-auto drop-shadow-sm">
                <!-- Baş & Boyun -->
                <circle cx="100" cy="30" r="18" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
                <rect x="94" y="48" width="12" height="12" fill="#e5e7eb" />
                
                <!-- Omuzlar (Deltoid - Sağ/Sol) -->
                <path d="M68,60 C58,62 50,75 52,90 C56,92 68,85 70,72 Z" data-muscle="shoulders" class="muscle-group-shape" onclick="selectMuscle('shoulders')">
                  <title>Omuzlar (Deltoid)</title>
                </path>
                <path d="M132,60 C142,62 150,75 148,90 C144,92 132,85 130,72 Z" data-muscle="shoulders" class="muscle-group-shape" onclick="selectMuscle('shoulders')">
                  <title>Omuzlar (Deltoid)</title>
                </path>
                
                <!-- Göğüs (Pektoral - Sağ/Sol) -->
                <path d="M72,64 C86,64 98,72 98,90 C85,92 72,86 70,75 Z" data-muscle="chest" class="muscle-group-shape" onclick="selectMuscle('chest')">
                  <title>Göğüs (Pektoral)</title>
                </path>
                <path d="M128,64 C114,64 102,72 102,90 C115,92 128,86 130,75 Z" data-muscle="chest" class="muscle-group-shape" onclick="selectMuscle('chest')">
                  <title>Göğüs (Pektoral)</title>
                </path>

                <!-- Pazı (Biceps - Sağ/Sol) -->
                <rect x="46" y="92" width="14" height="32" rx="7" data-muscle="biceps" class="muscle-group-shape" onclick="selectMuscle('biceps')">
                  <title>Pazı (Biceps)</title>
                </rect>
                <rect x="140" y="92" width="14" height="32" rx="7" data-muscle="biceps" class="muscle-group-shape" onclick="selectMuscle('biceps')">
                  <title>Pazı (Biceps)</title>
                </rect>

                <!-- Karın & Merkez (Abs/Core) -->
                <path d="M82,96 L118,96 L114,142 L86,142 Z" data-muscle="abs" class="muscle-group-shape" onclick="selectMuscle('abs')">
                  <title>Karın & Core (Abs)</title>
                </path>

                <!-- Ön Bacaklar (Quadriceps - Sağ/Sol) -->
                <path d="M76,148 L96,148 L92,225 L74,220 Z" data-muscle="quadriceps" class="muscle-group-shape" onclick="selectMuscle('quadriceps')">
                  <title>Ön Bacak (Quadriceps)</title>
                </path>
                <path d="M104,148 L124,148 L126,220 L108,225 Z" data-muscle="quadriceps" class="muscle-group-shape" onclick="selectMuscle('quadriceps')">
                  <title>Ön Bacak (Quadriceps)</title>
                </path>

                <!-- Kalf / Ön Kaval -->
                <rect x="74" y="235" width="14" height="50" rx="6" data-muscle="calves" class="muscle-group-shape" onclick="selectMuscle('calves')">
                  <title>Kalf / Baldır</title>
                </rect>
                <rect x="112" y="235" width="14" height="50" rx="6" data-muscle="calves" class="muscle-group-shape" onclick="selectMuscle('calves')">
                  <title>Kalf / Baldır</title>
                </rect>
              </svg>

              <!-- ARKA GÖRÜNÜM SVG ŞEMASI -->
              <svg id="anatomy-svg-back" viewBox="0 0 200 320" class="w-full max-w-[220px] h-auto drop-shadow-sm hidden">
                <!-- Baş & Ense -->
                <circle cx="100" cy="30" r="18" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
                <rect x="94" y="48" width="12" height="12" fill="#e5e7eb" />

                <!-- Omuz Arka (Rear Delts) -->
                <path d="M68,60 C58,62 50,75 52,90 C56,92 68,85 70,72 Z" data-muscle="shoulders" class="muscle-group-shape" onclick="selectMuscle('shoulders')">
                  <title>Omuz Arka Baş (Rear Delts)</title>
                </path>
                <path d="M132,60 C142,62 150,75 148,90 C144,92 132,85 130,72 Z" data-muscle="shoulders" class="muscle-group-shape" onclick="selectMuscle('shoulders')">
                  <title>Omuz Arka Baş (Rear Delts)</title>
                </path>

                <!-- Sırt & Kanat (Lats/Traps) -->
                <path d="M72,62 L128,62 L116,118 L84,118 Z" data-muscle="back" class="muscle-group-shape" onclick="selectMuscle('back')">
                  <title>Sırt & Kanat (Lats/Traps)</title>
                </path>

                <!-- Arka Kol (Triceps - Sağ/Sol) -->
                <rect x="46" y="92" width="14" height="32" rx="7" data-muscle="triceps" class="muscle-group-shape" onclick="selectMuscle('triceps')">
                  <title>Arka Kol (Triceps)</title>
                </rect>
                <rect x="140" y="92" width="14" height="32" rx="7" data-muscle="triceps" class="muscle-group-shape" onclick="selectMuscle('triceps')">
                  <title>Arka Kol (Triceps)</title>
                </rect>

                <!-- Bel (Lower Back / Lumbar) -->
                <rect x="85" y="122" width="30" height="22" rx="4" data-muscle="lower_back" class="muscle-group-shape" onclick="selectMuscle('lower_back')">
                  <title>Bel (Lower Back / Lumbar)</title>
                </rect>

                <!-- Kalça (Glutes - Sağ/Sol) -->
                <path d="M75,148 C75,148 97,148 98,178 C80,180 72,168 75,148 Z" data-muscle="glutes" class="muscle-group-shape" onclick="selectMuscle('glutes')">
                  <title>Kalça (Glutes)</title>
                </path>
                <path d="M125,148 C125,148 103,148 102,178 C120,180 128,168 125,148 Z" data-muscle="glutes" class="muscle-group-shape" onclick="selectMuscle('glutes')">
                  <title>Kalça (Glutes)</title>
                </path>

                <!-- Arka Bacak (Hamstrings - Sağ/Sol) -->
                <path d="M76,182 L96,182 L92,225 L74,220 Z" data-muscle="hamstrings" class="muscle-group-shape" onclick="selectMuscle('hamstrings')">
                  <title>Arka Bacak (Hamstrings)</title>
                </path>
                <path d="M104,182 L124,182 L126,220 L108,225 Z" data-muscle="hamstrings" class="muscle-group-shape" onclick="selectMuscle('hamstrings')">
                  <title>Arka Bacak (Hamstrings)</title>
                </path>

                <!-- Kalf / Baldır Arka (Gastrocnemius) -->
                <rect x="74" y="235" width="15" height="52" rx="6" data-muscle="calves" class="muscle-group-shape" onclick="selectMuscle('calves')">
                  <title>Kalf / Baldır (Calves)</title>
                </rect>
                <rect x="111" y="235" width="15" height="52" rx="6" data-muscle="calves" class="muscle-group-shape" onclick="selectMuscle('calves')">
                  <title>Kalf / Baldır (Calves)</title>
                </rect>
              </svg>

            </div>

            <!-- İpucu & Bilgi -->
            <p class="text-[11px] text-center text-mistral-stone leading-normal">
              💡 <strong>İpucu:</strong> Vücut üzerindeki kas gruplarına doğrudan tıklayarak hedeflenen egzersizleri ve fizik tedavi hareketlerini filtreleyebilirsiniz.
            </p>

          </div>
        </div>

        <!-- Sağ: Kas Seçici Çipler & Bilgi Kartı (7 Kolon) -->
        <div class="lg:col-span-7 space-y-4">
          
          <!-- Seçilen Kas Bilgi Paneli -->
          <div class="p-5 rounded-2xl bg-white border border-mistral-hairline shadow-sm">
            <div id="selected-muscle-info">
              <div class="flex items-center gap-2">
                <span class="text-xl">🏋️</span>
                <div>
                  <strong class="text-sm text-mistral-ink font-bold block">Tüm Vücut Egzersiz Kütüphanesi</strong>
                  <span class="text-xs text-mistral-slate">workout-cool ve Wger standartlarında derlenmiş 800+ hareket rehberi.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Kas Seçici Çipler -->
          <div class="p-5 sm:p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-3">
            <span class="text-xs uppercase font-bold tracking-wider text-mistral-stone block">
              Kas Grupları Listesi:
            </span>
            <div id="muscle-chips-container" class="flex flex-wrap items-center gap-2">
              <span class="text-xs text-mistral-stone">Kas grupları yükleniyor...</span>
            </div>
          </div>

          <!-- Ekipman & Arama Filtre Çubuğu -->
          <div class="p-5 sm:p-6 rounded-2xl bg-white border border-mistral-hairline shadow-sm space-y-4">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-1.5 text-xs">
                <span class="text-mistral-stone font-medium mr-1">Ekipman:</span>
                <button type="button" onclick="filterByEquipment('all')" id="equip-all" class="equipment-filter-btn active px-3 py-1.5 rounded-lg border border-mistral-hairline text-xs transition cursor-pointer font-bold text-mistral-orange border-mistral-orange">Tümü</button>
                <button type="button" onclick="filterByEquipment('bodyweight')" id="equip-bodyweight" class="equipment-filter-btn px-3 py-1.5 rounded-lg border border-mistral-hairline text-xs transition cursor-pointer text-mistral-slate hover:bg-stone-50">Vücut Ağırlığı</button>
                <button type="button" onclick="filterByEquipment('dumbbell')" id="equip-dumbbell" class="equipment-filter-btn px-3 py-1.5 rounded-lg border border-mistral-hairline text-xs transition cursor-pointer text-mistral-slate hover:bg-stone-50">Dambıl</button>
                <button type="button" onclick="filterByEquipment('barbell')" id="equip-barbell" class="equipment-filter-btn px-3 py-1.5 rounded-lg border border-mistral-hairline text-xs transition cursor-pointer text-mistral-slate hover:bg-stone-50">Halter</button>
                <button type="button" onclick="filterByEquipment('cable')" id="equip-cable" class="equipment-filter-btn px-3 py-1.5 rounded-lg border border-mistral-hairline text-xs transition cursor-pointer text-mistral-slate hover:bg-stone-50">Kablo / Makara</button>
              </div>

              <!-- Anlık İsimle Filtreleme -->
              <div class="relative w-full sm:w-56">
                <input 
                  type="text" 
                  id="exercise-search-input" 
                  oninput="onExerciseSearch()" 
                  placeholder="Hareket ara (Squat, Plank)..." 
                  class="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-mistral-hairline text-xs text-mistral-ink placeholder:text-mistral-stone focus:outline-none focus:border-mistral-orange transition">
                <i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-mistral-stone text-xs"></i>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- 📋 KİŞİSEL SPOR PROGRAMIM (ANTRENMAN RUTİNİ) PANELİ -->
      <div id="workout-routine-section" class="mb-12 p-6 rounded-2xl bg-white border-2 border-mistral-orange/40 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-mistral-hairline">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-mistral-cream border border-mistral-beige-deep text-mistral-orange flex items-center justify-center text-xl shrink-0">
              📋
            </span>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold font-editorial text-mistral-ink tracking-tight">Kişisel Spor Programım</h2>
                <span id="routine-count-badge" class="px-2.5 py-0.5 rounded-full bg-mistral-orange text-white text-xs font-bold font-mono">0 Egzersiz</span>
              </div>
              <p class="text-xs text-mistral-slate mt-0.5">
                Aşağıdaki katalogdan eklediğiniz hareketlerin set, tekrar ve ağırlıklarını belirleyin; programınızı dışa aktarın.
              </p>
            </div>
          </div>

          <!-- Dışa Aktarma Eylemleri (Export Controls) -->
          <div class="flex flex-wrap items-center gap-2">
            <button 
              type="button" 
              onclick="exportRoutine('print')" 
              title="Yazdır veya PDF Kaydet"
              class="px-3 py-1.5 rounded-lg bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs">
              <i class="fa-solid fa-print text-mistral-stone"></i>
              <span>Yazdır / PDF</span>
            </button>
            <button 
              type="button" 
              onclick="exportRoutine('markdown')" 
              title="Markdown / Metin Kopyala"
              class="px-3 py-1.5 rounded-lg bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs">
              <i class="fa-brands fa-markdown text-mistral-stone"></i>
              <span>Metin Kopyala</span>
            </button>
            <button 
              type="button" 
              onclick="exportRoutine('csv')" 
              title="Excel / CSV Dosyası İndir"
              class="px-3 py-1.5 rounded-lg bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs">
              <i class="fa-solid fa-file-csv text-emerald-600"></i>
              <span>CSV İndir</span>
            </button>
            <button 
              type="button" 
              onclick="exportRoutine('json')" 
              title="JSON Dosyası İndir"
              class="px-3 py-1.5 rounded-lg bg-white border border-mistral-hairline hover:bg-mistral-cream text-mistral-ink text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs">
              <i class="fa-solid fa-code text-blue-600"></i>
              <span>JSON İndir</span>
            </button>
            <button 
              type="button" 
              onclick="clearRoutine()" 
              title="Listeyi Temizle"
              class="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition cursor-pointer">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>

        <!-- Program Listesi Tablosu / Kutusu -->
        <div id="routine-items-container">
          <div class="p-8 text-center rounded-xl bg-stone-50 border border-dashed border-stone-200 text-xs text-mistral-stone">
            Henüz programınıza egzersiz eklemediniz. Aşağıdaki egzersiz kartlarındaki <strong>"➕ Programa Ekle"</strong> butonuna tıklayarak hareketleri buraya toplayabilirsiniz.
          </div>
        </div>

        <!-- Özet Sayaç Şeridi -->
        <div id="routine-summary-bar" class="hidden grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-mistral-hairline text-center text-xs">
          <div class="p-2.5 rounded-lg bg-stone-50 border border-mistral-hairline">
            <span class="text-mistral-stone block text-[10px]">Toplam Egzersiz</span>
            <strong id="stat-routine-exercises" class="text-sm font-bold text-mistral-ink">0</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-stone-50 border border-mistral-hairline">
            <span class="text-mistral-stone block text-[10px]">Toplam Set</span>
            <strong id="stat-routine-sets" class="text-sm font-bold text-mistral-orange">0</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-stone-50 border border-mistral-hairline">
            <span class="text-mistral-stone block text-[10px]">Tahmini Süre</span>
            <strong id="stat-routine-time" class="text-sm font-bold text-mistral-ink">~0 dk</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-stone-50 border border-mistral-hairline">
            <span class="text-mistral-stone block text-[10px]">Çalışan Kaslar</span>
            <strong id="stat-routine-muscles" class="text-sm font-bold text-emerald-700 truncate block">-</strong>
          </div>
        </div>
      </div>

      <!-- EGZERSİZ LİSTESİ BAŞLIĞI -->
      <div class="flex items-center justify-between pb-3 mb-6 border-b border-mistral-hairline">
        <div class="flex items-center gap-2">
          <h2 class="text-xl font-bold font-editorial text-mistral-ink tracking-tight">Egzersiz Kataloğu</h2>
          <span id="exercise-count-label" class="text-xs px-2.5 py-0.5 rounded-full bg-mistral-cream text-mistral-ink border border-mistral-beige-deep font-semibold">Yükleniyor...</span>
        </div>
      </div>

      <!-- EGZERSİZ KARTLARI IZGARASI -->
      <div id="exercises-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <div class="col-span-full p-12 text-center text-sm text-mistral-stone">
          <i class="fa-solid fa-spinner fa-spin text-xl text-mistral-orange mb-2 block"></i>
          Egzersizler yükleniyor...
        </div>
      </div>

      <!-- MODAL DİYALOG (VİDEO + ADIM ADIM DOĞRU FORM) -->
      <div id="exercise-modal" class="custom-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-mistral-hairline transition-all transform duration-200">
          <div id="modal-exercise-content">
          </div>
        </div>
      </div>
    `;

    res.send(pageTemplate('İnteraktif Kas Anatomisi & Egzersiz', content, extraHead));
  };
};
