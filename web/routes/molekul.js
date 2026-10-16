module.exports = function(pageTemplate) {
  return function(req, res) {
    const extraHead = `
      <script src="https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.4.2/3Dmol-min.js"></script>
      <link rel="stylesheet" href="/static/apps/molekul/app.css?v=20261017a">
      <script src="/static/apps/molekul/app.js?v=20261017a" defer></script>
    `;

    const content = `
      <div class="vibe-page-header mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <a href="/" class="text-mistral-slate hover:text-mistral-ink transition text-xs inline-flex items-center gap-1 font-semibold"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Vitrine Dön</span></a>
            <span class="text-mistral-stone">|</span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-mistral-orange text-[11px] font-mono font-bold">Uzay & Bilim</span>
          </div>
          <div class="flex items-center gap-3.5 mt-2"><span class="vibe-header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="m14.5 9.5 3-3"/><path d="m6.5 17.5 3-3"/><path d="m9.5 9.5-3-3"/><path d="m14.5 14.5 3 3"/></svg></span><h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-mistral-ink font-editorial">3D Kimyasal Molekül Stüdyosu</h1></div>
          <p class="text-mistral-slate text-sm mt-0.5">
            PubChem 3D Conformer & 3Dmol.js WebGL motoru ile kimyasalların, ilaç etken maddelerinin 3 boyutlu atomik modellemesi.
          </p>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline text-xs text-mistral-slate">
          <span>PubChem 3D Conformer & WebGL</span>
        </div>
      </div>

      <!-- 1. 3D WEBGL MOLEKÜL SAHNESİ VE KONTROL MERKEZİ -->
      <div class="p-6 sm:p-8 rounded-3xl bg-white border border-mistral-hairline shadow-2xl mb-8 space-y-6">
        
        <!-- Üst: Aktif Molekül Bilgisi ve Araç Çubuğu -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span id="mol-badge-formula" class="px-2.5 py-0.5 rounded-lg bg-teal-500/20 text-teal-300 font-mono font-bold text-xs">C8H10N4O2</span>
              <span id="mol-badge-weight" class="text-xs text-mistral-slate font-mono">194.19 g/mol</span>
            </div>
            <h2 id="mol-display-name" class="text-2xl sm:text-3xl font-black text-mistral-ink">Kafein (Caffeine)</h2>
            <p id="mol-display-iupac" class="text-xs text-teal-400 font-mono truncate max-w-md sm:max-w-xl mt-0.5">1,3,7-trimethylpurine-2,6-dione</p>
          </div>

          <!-- 3D Render Stili Seçici & Döndürme -->
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <div class="flex p-1 rounded-xl bg-white border border-mistral-hairline text-xs">
              <button onclick="setRenderStyle('ballAndStick')" id="btn-st-ballAndStick" class="style-btn px-3 py-1 rounded-lg font-bold bg-teal-500 text-slate-950 transition shadow">Top & Çubuk</button>
              <button onclick="setRenderStyle('sphere')" id="btn-st-sphere" class="style-btn px-3 py-1 rounded-lg font-bold text-mistral-slate hover:text-white transition">Hacim Küresi</button>
              <button onclick="setRenderStyle('stick')" id="btn-st-stick" class="style-btn px-3 py-1 rounded-lg font-bold text-mistral-slate hover:text-white transition">Çubuklar</button>
              <button onclick="setRenderStyle('wireframe')" id="btn-st-wireframe" class="style-btn px-3 py-1 rounded-lg font-bold text-mistral-slate hover:text-white transition">Tel Kafes</button>
            </div>

            <button onclick="toggleSpin()" id="btn-spin" class="px-3 py-1.5 rounded-xl bg-white hover:bg-mistral-cream border border-mistral-hairline text-xs font-bold text-teal-300 transition flex items-center gap-1.5 shadow">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></span> <span id="label-spin">Döndür: Açık</span>
            </button>
            <button onclick="resetCamera()" class="px-3 py-1.5 rounded-xl bg-white hover:bg-mistral-cream border border-mistral-hairline text-xs font-bold text-mistral-slate transition" title="Kamerayı Sıfırla">
              Merkeze Al
            </button>
          </div>
        </div>

        <!-- 3D WebGL Tuvali (Canvas) -->
        <div class="relative mol-canvas-container border border-mistral-hairline shadow-inner flex items-center justify-center">
          <div id="g3d-viewport" class="w-full h-full"></div>

          <!-- Yükleniyor Göstergesi -->
          <div id="mol-loading" class="hidden absolute inset-0 bg-mistral-canvas backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-mistral-slate text-xs z-20">
            <div class="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin"></div>
            <span id="mol-loading-msg">3D Moleküler koordinatlar yükleniyor...</span>
          </div>

          <!-- Sol Alt Kontrol İpucu -->
          <div class="absolute bottom-4 left-4 pointer-events-none bg-mistral-canvas backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-mistral-slate border border-mistral-hairline">
            Sol Tık: Döndür • Tekerlek: Yakınlaş • Sağ Tık: Kaydır
          </div>

          <!-- Sağ Üst Favorileme Butonu -->
          <button onclick="toggleSaveMolecule()" id="btn-save-mol" class="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-white hover:bg-white border border-mistral-hairline text-xs font-bold text-mistral-ink transition flex items-center gap-1.5 backdrop-blur-md shadow">
            <span id="star-icon"><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg></span> <span id="label-save-mol">Laboratuvarıma Kaydet</span>
          </button>
        </div>

        <!-- Molekül Özellikleri Tablosu -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
          <div class="p-3.5 rounded-2xl bg-white border border-mistral-hairline text-center">
            <span class="text-[10px] text-mistral-slate uppercase font-semibold">Moleküler Formül</span>
            <div id="stat-formula" class="text-base font-black text-teal-400 font-mono mt-0.5">C8H10N4O2</div>
          </div>
          <div class="p-3.5 rounded-2xl bg-white border border-mistral-hairline text-center">
            <span class="text-[10px] text-mistral-slate uppercase font-semibold">Molekül Ağırlığı</span>
            <div id="stat-weight" class="text-base font-black text-white font-mono mt-0.5">194.19 g/mol</div>
          </div>
          <div class="p-3.5 rounded-2xl bg-white border border-mistral-hairline text-center">
            <span class="text-[10px] text-mistral-slate uppercase font-semibold">Toplam Atom Sayısı</span>
            <div id="stat-atoms" class="text-base font-black text-blue-400 font-mono mt-0.5">24 Atom</div>
          </div>
          <div class="p-3.5 rounded-2xl bg-white border border-mistral-hairline text-center">
            <span class="text-[10px] text-mistral-slate uppercase font-semibold">PubChem CID</span>
            <div id="stat-cid" class="text-base font-black text-purple-400 font-mono mt-0.5">2519</div>
          </div>
        </div>

      </div>

      <!-- 2. ARAMA VE POPÜLER MOLEKÜLLER -->
      <div class="p-6 rounded-3xl bg-white border border-mistral-hairline shadow-xl mb-8 space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-mistral-slate mb-1.5">
            Bileşik, İlaç Etken Maddesi veya Molekül Arayın
          </label>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <input type="text" id="input-mol-search" placeholder="Örn: Aspirin, Ibuprofen, Paracetamol, Dopamine, Serotonin, Nicotine, Glucose..." onkeyup="if(event.key==='Enter') searchMolecule()" class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-mistral-hairline text-sm text-mistral-ink placeholder-slate-500 focus:border-teal-400 focus:outline-none font-mono">
              <span class="absolute left-3.5 top-3 text-mistral-stone text-sm"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            </div>
            <button onclick="searchMolecule()" class="px-6 py-2.5 rounded-xl text-mistral-ink font-boldbg-mistral-cream-light hover:bg-mistral-cream-deeper text-mistral-ink font-bold font-bold text-xs transition shrink-0">
              Molekülü Getir
            </button>
          </div>
        </div>

        <!-- Hızlı Popüler Moleküller -->
        <div class="flex flex-wrap items-center gap-1.5 text-xs pt-1">
          <span class="text-mistral-stone text-[11px] mr-1">Seçkin Moleküller:</span>
          <button onclick="loadPresetMolecule('caffeine', 'Kafein', 'C8H10N4O2')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Kafein</button>
          <button onclick="loadPresetMolecule('aspirin', 'Aspirin', 'C9H8O4')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Aspirin</button>
          <button onclick="loadPresetMolecule('acetaminophen', 'Parasetamol', 'C8H9NO2')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Parasetamol</button>
          <button onclick="loadPresetMolecule('dopamine', 'Dopamin', 'C8H11NO2')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Dopamin</button>
          <button onclick="loadPresetMolecule('serotonin', 'Serotonin', 'C10H12N2O')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Serotonin</button>
          <button onclick="loadPresetMolecule('epinephrine', 'Adrenalin', 'C9H13NO3')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Adrenalin</button>
          <button onclick="loadPresetMolecule('penicillin', 'Penisilin', 'C16H18N2O4S')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Penisilin</button>
          <button onclick="loadPresetMolecule('water', 'Su', 'H2O')" class="px-2.5 py-1 rounded-lg bg-white hover:bg-mistral-cream border border-mistral-hairline text-mistral-slate transition">Su</button>
        </div>
      </div>

      <!-- 3. KİŞİSEL MOLEKÜL LABORATUVARIM (MY LAB SHELF) -->
      <div class="mt-14 pt-8 border-t border-mistral-hairline space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-mistral-ink flex items-center gap-2">
              <span><svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg></span> Kişisel Molekül Laboratuvarım
            </h3>
            <p class="text-mistral-slate text-xs">Kaydettiğiniz kimyasal bileşikler ve 3D modelleri.</p>
          </div>
          <button onclick="clearSavedMolecules()" class="text-xs text-rose-400 hover:underline">Laboratuvarı Temizle</button>
        </div>

        <div id="mol-shelf-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <!-- JS ile doldurulur -->
        </div>
        <div id="mol-shelf-empty" class="p-8 text-center rounded-2xl bg-white border border-mistral-hairline text-mistral-stone text-xs">
          Henüz laboratuvarınıza bir molekül kaydetmediniz. Yukarıdaki simgesine tıklayarak favorilerinizi buraya ekleyebilirsiniz.
        </div>
      </div>

      <!-- Toast Bildirimi -->
      <div id="mol-toast" class="hidden fixed bottom-6 right-6 py-2.5 px-4 rounded-xl bg-teal-500 text-slate-950 font-black text-xs shadow-2xl transition z-50"></div>

      <!-- İstemci Mantığı & 3Dmol.js WebGL Motoru -->
    `;

    res.send(pageTemplate('3D Kimyasal Molekül Stüdyosu', content, extraHead));
  };
};
