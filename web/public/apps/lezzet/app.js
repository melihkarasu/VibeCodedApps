let currentMode = 'kitchen'; // 'kitchen' | 'bar'
        let currentKitchenSource = 'all'; // 'all' | 'forkify' | 'themealdb'
        let currentModalRecipe = null;
        let activeIngredients = [];

        // Türkçe - İngilizce Malzeme Sözlüğü (TheMealDB & TheCocktailDB ile tam uyum için)
        const INGREDIENT_TR_MAP = {
          'tavuk': 'chicken',
          'tavuk göğsü': 'chicken_breast',
          'tavuk budu': 'chicken',
          'kıyma': 'beef',
          'dana': 'beef',
          'dana eti': 'beef',
          'kuzu': 'lamb',
          'et': 'beef',
          'biftek': 'beef',
          'köfte': 'meatballs',
          'yumurta': 'egg',
          'patates': 'potato',
          'domates': 'tomato',
          'salça': 'tomato_paste',
          'peynir': 'cheese',
          'kaşar': 'cheese',
          'beyaz peynir': 'feta',
          'mozzarella': 'mozzarella',
          'cheddar': 'cheddar',
          'parmesan': 'parmesan',
          'sarımsak': 'garlic',
          'soğan': 'onion',
          'yeşil soğan': 'spring_onions',
          'pırasa': 'leek',
          'zeytinyağı': 'olive_oil',
          'zeytin': 'olive',
          'tereyağı': 'butter',
          'mantar': 'mushroom',
          'pirinç': 'rice',
          'makarna': 'pasta',
          'şehriye': 'vermicelli',
          'balık': 'fish',
          'somon': 'salmon',
          'ton balığı': 'tuna',
          'karides': 'prawns',
          'kalamar': 'squid',
          'ıspanak': 'spinach',
          'havuç': 'carrot',
          'patlıcan': 'eggplant',
          'kabak': 'zucchini',
          'biber': 'pepper',
          'kırmızı biber': 'red_chilli',
          'yeşil biber': 'green_chilli',
          'fasulye': 'beans',
          'kuru fasulye': 'kidney_beans',
          'nohut': 'chickpeas',
          'mercimek': 'lentils',
          'kırmızı mercimek': 'lentils',
          'un': 'flour',
          'şeker': 'sugar',
          'esmer şeker': 'brown_sugar',
          'tuz': 'salt',
          'karabiber': 'black_pepper',
          'pul biber': 'chilli_flakes',
          'kekik': 'thyme',
          'nane': 'mint',
          'fesleğen': 'basil',
          'biberiye': 'rosemary',
          'maydanoz': 'parsley',
          'dereotu': 'dill',
          'kişniş': 'coriander',
          'tarçın': 'cinnamon',
          'kimyon': 'cumin',
          'zerdeçal': 'turmeric',
          'zencefil': 'ginger',
          'süt': 'milk',
          'yoğurt': 'yogurt',
          'krema': 'cream',
          'ekşi krema': 'sour_cream',
          'limon': 'lemon',
          'misket limon': 'lime',
          'lime': 'lime',
          'portakal': 'orange',
          'elma': 'apple',
          'muz': 'banana',
          'çilek': 'strawberries',
          'avokado': 'avocado',
          'bal': 'honey',
          'çikolata': 'chocolate',
          'kakao': 'cocoa',
          'vanilya': 'vanilla',
          'ceviz': 'walnuts',
          'fındık': 'hazelnuts',
          'badem': 'almonds',
          'fıstık': 'peanuts',
          'susam': 'sesame_seeds',
          'tahin': 'tahini',
          'hardal': 'mustard',
          'mayonez': 'mayonnaise',
          'ketçap': 'ketchup',
          'sirke': 'vinegar',
          'elma sirkesi': 'cider_vinegar',
          'balsamik': 'balsamic_vinegar',
          'soya sosu': 'soy_sauce',
          // Bar Malzemeleri
          'votka': 'vodka',
          'cin': 'gin',
          'rom': 'rum',
          'beyaz rom': 'light_rum',
          'koyu rom': 'dark_rum',
          'tekila': 'tequila',
          'viski': 'whiskey',
          'bourbon': 'bourbon',
          'bira': 'beer',
          'şarap': 'wine',
          'kırmızı şarap': 'red_wine',
          'beyaz şarap': 'white_wine',
          'şampanya': 'champagne',
          'prosecco': 'prosecco',
          'kahve': 'coffee',
          'espresso': 'espresso',
          'kola': 'coca-cola',
          'soda': 'soda_water',
          'maden suyu': 'soda_water',
          'tonik': 'tonic_water',
          'portakal suyu': 'orange_juice',
          'elma suyu': 'apple_juice',
          'ananas': 'pineapple',
          'ananas suyu': 'pineapple_juice',
          'nar': 'pomegranate',
          'kızılcık': 'cranberry_juice'
        };

        function resolveIngredient(rawInput) {
          const clean = rawInput.trim().toLowerCase();
          if (INGREDIENT_TR_MAP[clean]) {
            return { raw: rawInput.trim(), query: INGREDIENT_TR_MAP[clean] };
          }
          return { raw: rawInput.trim(), query: clean.replace(/\s+/g, '_') };
        }

        function addCustomIngredient(forcedText) {
          const inputEl = document.getElementById('input-ingredient');
          const val = forcedText || (inputEl ? inputEl.value.trim() : '');
          if (!val) return;

          const resolved = resolveIngredient(val);
          if (!activeIngredients.some(i => i.query.toLowerCase() === resolved.query.toLowerCase())) {
            activeIngredients.push(resolved);
          }
          if (!forcedText && inputEl) inputEl.value = '';
          renderActiveIngredientTags();
          fetchByIngredient(resolved.query, resolved.raw);
        }

        function removeActiveIngredient(idx) {
          activeIngredients.splice(idx, 1);
          renderActiveIngredientTags();
          if (activeIngredients.length > 0) {
            const last = activeIngredients[activeIngredients.length - 1];
            fetchByIngredient(last.query, last.raw);
          } else {
            if (currentMode === 'kitchen') fetchByArea('Turkish');
            else fetchCocktailsByAlcoholic('Non_Alcoholic');
          }
        }

        function clearSelectedIngredients() {
          activeIngredients = [];
          renderActiveIngredientTags();
          if (currentMode === 'kitchen') fetchByArea('Turkish');
          else fetchCocktailsByAlcoholic('Non_Alcoholic');
        }

        function renderActiveIngredientTags() {
          const wrapper = document.getElementById('selected-ingredients-wrapper');
          const container = document.getElementById('selected-ingredients-container');
          if (!wrapper || !container) return;
          if (!activeIngredients.length) {
            wrapper.classList.add('hidden');
            container.innerHTML = '';
            return;
          }
          wrapper.classList.remove('hidden');
          container.innerHTML = activeIngredients.map((item, idx) => `
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium">
              <span>${item.raw}</span>
              <button onclick="removeActiveIngredient(${idx})" class="hover:text-white text-rose-400 font-bold ml-0.5 text-xs" title="Kaldır">✕</button>
            </span>
          `).join('');
        }

        // Malzeme Önerileri
        const PANTRY_ITEMS = {
          kitchen: [
            { name: 'Tavuk', query: 'chicken' },
            { name: 'Kıyma / Et', query: 'beef' },
            { name: 'Yumurta', query: 'egg' },
            { name: 'Patates', query: 'potato' },
            { name: 'Domates', query: 'tomato' },
            { name: 'Peynir', query: 'cheese' },
            { name: 'Pirinç', query: 'rice' },
            { name: 'Mantar', query: 'mushroom' },
            { name: 'Sarımsak', query: 'garlic' },
            { name: 'Balık / Karides', query: 'salmon' }
          ],
          bar: [
            { name: 'Votka', query: 'vodka' },
            { name: 'Cin', query: 'gin' },
            { name: 'Rom', query: 'rum' },
            { name: 'Tekila', query: 'tequila' },
            { name: 'Viski', query: 'whiskey' },
            { name: 'Limon / Misket', query: 'lemon' },
            { name: 'Taze Nane', query: 'mint' },
            { name: 'Kahve', query: 'coffee' },
            { name: 'Süt', query: 'milk' },
            { name: 'Portakal Suyu', query: 'orange' }
          ]
        };

        // Filtre Butonları
        const FILTERS = {
          kitchen: [
            { label: '🇹🇷 Türk Mutfağı', type: 'area', val: 'Turkish' },
            { label: '🇮🇹 İtalyan', type: 'area', val: 'Italian' },
            { label: '🇲🇽 Meksika', type: 'area', val: 'Mexican' },
            { label: '🇯🇵 Japon', type: 'area', val: 'Japanese' },
            { label: '🍰 Tatlılar', type: 'category', val: 'Dessert' },
            { label: '🐟 Deniz Ürünleri', type: 'category', val: 'Seafood' },
            { label: '🥗 Vejetaryen', type: 'category', val: 'Vegetarian' },
            { label: '🍝 Makarna', type: 'category', val: 'Pasta' }
          ],
          bar: [
            { label: '🍸 Popüler Kokteyller', type: 'search', val: 'margarita' },
            { label: '🍹 Klasik Mojito', type: 'search', val: 'mojito' },
            { label: '🥤 Alkolsüz (Mocktail)', type: 'alcoholic', val: 'Non_Alcoholic' },
            { label: '🍾 Alkollü Karışımlar', type: 'alcoholic', val: 'Alcoholic' },
            { label: '☕ Espresso & Kahveli', type: 'ingredient', val: 'coffee' },
            { label: '🍊 Meyveli & Tropikal', type: 'ingredient', val: 'orange' }
          ]
        };

        function setRecipeSource(src) {
          currentKitchenSource = src;
          const btnAll = document.getElementById('btn-src-all');
          const btnF = document.getElementById('btn-src-forkify');
          const btnM = document.getElementById('btn-src-themealdb');
          if (btnAll && btnF && btnM) {
            btnAll.className = src === 'all' ? 'px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white transition' : 'px-3 py-1.5 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition';
            btnF.className = src === 'forkify' ? 'px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white transition' : 'px-3 py-1.5 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition';
            btnM.className = src === 'themealdb' ? 'px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white transition' : 'px-3 py-1.5 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition';
          }
          if (activeIngredients.length > 0) {
            const last = activeIngredients[activeIngredients.length - 1];
            fetchByIngredient(last.query, last.raw);
          } else {
            const searchVal = document.getElementById('input-search') ? document.getElementById('input-search').value.trim() : '';
            if (searchVal) executeSearch();
            else fetchByArea('Turkish');
          }
        }

        // 1. Mod Değişimi (Mutfak vs Bar)
        function switchMode(mode) {
          currentMode = mode;
          activeIngredients = [];
          renderActiveIngredientTags();

          const btnK = document.getElementById('btn-mode-kitchen');
          const btnB = document.getElementById('btn-mode-bar');
          const srcSelector = document.getElementById('kitchen-source-selector');
          const pTitle = document.getElementById('pantry-title');
          const pDesc = document.getElementById('pantry-desc');
          const rLabel = document.getElementById('btn-random-label');
          const sInput = document.getElementById('input-search');
          const iInput = document.getElementById('input-ingredient');

          if (mode === 'kitchen') {
            if (srcSelector) srcSelector.classList.remove('hidden');
            btnK.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white transition flex items-center gap-2 shadow';
            btnB.className = 'px-4 py-2 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-2';
            pTitle.innerText = '🧺 Dolapta Ne Var? (Evdeki Malzemelerle Pişir)';
            pDesc.innerText = 'Elinizdeki malzemeleri metin kutusuna yazarak ekleyin veya hazır etiketlere tıklayın:';
            rLabel.innerText = 'Ne Yesem? (Rastgele Sürpriz)';
            sInput.placeholder = 'Yemek veya tarif adı arayın (Örn: Pasta, Kebab, Soup)...';
            if (iInput) iInput.placeholder = 'Malzeme yazın (Örn: patates, tavuk, sarımsak, soğan, cheese)...';
          } else {
            if (srcSelector) srcSelector.classList.add('hidden');
            btnB.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white transition flex items-center gap-2 shadow';
            btnK.className = 'px-4 py-2 rounded-xl text-xs font-bold text-mistral-slate hover:text-white transition flex items-center gap-2';
            pTitle.innerText = '🍸 Barda Ne Var? (Evdeki İçeceklerle Karıştır)';
            pDesc.innerText = 'Elinizdeki içecek veya garnitür malzemesini yazın veya seçin:';
            rLabel.innerText = 'Ne İçsem? (Rastgele Kokteyl)';
            sInput.placeholder = 'Kokteyl veya içecek adı arayın (Örn: Mojito, Martini, Sour)...';
            if (iInput) iInput.placeholder = 'Bardaki malzemeyi yazın (Örn: limon, nane, votka, kahve, portakal)...';
          }

          renderPantryTags();
          renderFilterButtons();
          // Varsayılan açılış yüklemesi
          if (mode === 'kitchen') {
            fetchByArea('Turkish');
          } else {
            fetchCocktailsByAlcoholic('Non_Alcoholic');
          }
        }

        // 2. Malzeme Etiketlerini ve Filtre Butonlarını Çiz
        function renderPantryTags() {
          const container = document.getElementById('pantry-tags-container');
          const items = PANTRY_ITEMS[currentMode];
          container.innerHTML = items.map(item => `
            <button onclick="addCustomIngredient('${item.name}')" class="px-3 py-1.5 rounded-xl bg-white border border-mistral-hairline hover:border-rose-400 text-xs text-mistral-slate hover:text-white transition flex items-center gap-1.5">
              <span>+</span> ${item.name}
            </button>
          `).join('');
        }

        function renderFilterButtons() {
          const container = document.getElementById('filter-buttons-container');
          const filters = FILTERS[currentMode];
          container.innerHTML = filters.map(f => `
            <button onclick="handleFilterClick('${f.type}', '${f.val}')" class="px-3 py-1.5 rounded-xl bg-white hover:bg-mistral-cream-light border border-mistral-hairline text-xs font-semibold text-mistral-slate hover:text-mistral-ink font-bold transition">
              ${f.label}
            </button>
          `).join('');
        }

        function handleFilterClick(type, val) {
          if (currentMode === 'kitchen') {
            if (type === 'area') fetchByArea(val);
            else if (type === 'category') fetchByCategory(val);
          } else {
            if (type === 'alcoholic') fetchCocktailsByAlcoholic(val);
            else if (type === 'search') fetchCocktailsSearch(val);
            else if (type === 'ingredient') fetchByIngredient(val);
          }
        }

        // 3. API Veri Çekme Fonksiyonları
        function showLoading(show) {
          document.getElementById('loading-spinner').className = show ? 'py-16 text-center text-mistral-slate text-sm flex flex-col items-center gap-3' : 'hidden';
          if (show) {
            document.getElementById('recipes-grid').innerHTML = '';
            document.getElementById('empty-state').classList.add('hidden');
          }
        }

        async function fetchByArea(area) {
          showLoading(true);
          try {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
            const data = await res.json();
            renderRecipeList(data.meals, `${area} Mutfağı`);
          } catch(e) {
            showLoading(false);
          }
        }

        async function fetchByCategory(cat) {
          showLoading(true);
          try {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${cat}`);
            const data = await res.json();
            renderRecipeList(data.meals, `${cat} Kategorisi`);
          } catch(e) {
            showLoading(false);
          }
        }

        async function fetchByIngredient(ing, label) {
          showLoading(true);
          const displayLabel = label || ing;
          try {
            if (currentMode === 'kitchen') {
              let combined = [];

              if (currentKitchenSource === 'all') {
                const [mealDbRes, forkifyRes] = await Promise.allSettled([
                  fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ing)}`).then(r => r.json()),
                  fetch(`https://forkify-api.herokuapp.com/api/v2/recipes?search=${encodeURIComponent(ing)}`).then(r => r.json())
                ]);

                if (mealDbRes.status === 'fulfilled' && mealDbRes.value && mealDbRes.value.meals) {
                  combined.push(...mealDbRes.value.meals.map(m => ({ ...m, _source: 'themealdb' })));
                }
                if (forkifyRes.status === 'fulfilled' && forkifyRes.value && forkifyRes.value.data && forkifyRes.value.data.recipes) {
                  combined.push(...forkifyRes.value.data.recipes.map(r => ({
                    idMeal: r.id,
                    strMeal: r.title,
                    strMealThumb: r.image_url,
                    _source: 'forkify',
                    _publisher: r.publisher
                  })));
                }
              } else if (currentKitchenSource === 'forkify') {
                const res = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes?search=${encodeURIComponent(ing)}`);
                const data = await res.json();
                if (data.data && data.data.recipes) {
                  combined = data.data.recipes.map(r => ({
                    idMeal: r.id,
                    strMeal: r.title,
                    strMealThumb: r.image_url,
                    _source: 'forkify',
                    _publisher: r.publisher
                  }));
                }
              } else {
                const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ing)}`);
                const data = await res.json();
                if (data.meals) {
                  combined = data.meals.map(m => ({ ...m, _source: 'themealdb' }));
                }
              }

              renderRecipeList(combined, `"${displayLabel}" içeren yemekler`);
            } else {
              const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ing)}`);
              const data = await res.json();
              const drinks = (data.drinks || []).map(d => ({ ...d, _source: 'cocktaildb' }));
              renderRecipeList(drinks, `"${displayLabel}" içeren kokteyller`);
            }
          } catch(e) {
            showLoading(false);
          }
        }

        async function executeSearch() {
          const q = document.getElementById('input-search').value.trim();
          if (!q) return;
          showLoading(true);
          try {
            if (currentMode === 'kitchen') {
              let combined = [];

              if (currentKitchenSource === 'all') {
                const [mealDbRes, forkifyRes] = await Promise.allSettled([
                  fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`).then(r => r.json()),
                  fetch(`https://forkify-api.herokuapp.com/api/v2/recipes?search=${encodeURIComponent(q)}`).then(r => r.json())
                ]);

                if (mealDbRes.status === 'fulfilled' && mealDbRes.value && mealDbRes.value.meals) {
                  combined.push(...mealDbRes.value.meals.map(m => ({ ...m, _source: 'themealdb' })));
                }
                if (forkifyRes.status === 'fulfilled' && forkifyRes.value && forkifyRes.value.data && forkifyRes.value.data.recipes) {
                  combined.push(...forkifyRes.value.data.recipes.map(r => ({
                    idMeal: r.id,
                    strMeal: r.title,
                    strMealThumb: r.image_url,
                    _source: 'forkify',
                    _publisher: r.publisher
                  })));
                }
              } else if (currentKitchenSource === 'forkify') {
                const res = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes?search=${encodeURIComponent(q)}`);
                const data = await res.json();
                if (data.data && data.data.recipes) {
                  combined = data.data.recipes.map(r => ({
                    idMeal: r.id,
                    strMeal: r.title,
                    strMealThumb: r.image_url,
                    _source: 'forkify',
                    _publisher: r.publisher
                  }));
                }
              } else {
                const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`);
                const data = await res.json();
                if (data.meals) {
                  combined = data.meals.map(m => ({ ...m, _source: 'themealdb' }));
                }
              }

              renderRecipeList(combined, `"${q}" Arama Sonuçları`);
            } else {
              const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`);
              const data = await res.json();
              const drinks = (data.drinks || []).map(d => ({ ...d, _source: 'cocktaildb' }));
              renderRecipeList(drinks, `"${q}" Arama Sonuçları`);
            }
          } catch(e) {
            showLoading(false);
          }
        }

        async function fetchCocktailsByAlcoholic(alch) {
          showLoading(true);
          try {
            const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=${alch}`);
            const data = await res.json();
            const drinks = (data.drinks || []).map(d => ({ ...d, _source: 'cocktaildb' }));
            renderRecipeList(drinks, alch === 'Non_Alcoholic' ? 'Alkolsüz Kokteyller (Mocktail)' : 'Alkollü Kokteyller');
          } catch(e) {
            showLoading(false);
          }
        }

        async function fetchCocktailsSearch(term) {
          showLoading(true);
          try {
            const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${term}`);
            const data = await res.json();
            const drinks = (data.drinks || []).map(d => ({ ...d, _source: 'cocktaildb' }));
            renderRecipeList(drinks, `"${term}" Kokteylleri`);
          } catch(e) {
            showLoading(false);
          }
        }

        // 4. Rastgele Sürpriz Tarif (Şans Çarkı)
        async function fetchRandomRecipe() {
          showToast('🎲 Sürpriz tarif hazırlanıyor...');
          try {
            if (currentMode === 'kitchen') {
              const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
              const data = await res.json();
              if (data.meals && data.meals[0]) {
                openRecipeModal(data.meals[0].idMeal, 'meal', 'themealdb');
              }
            } else {
              const res = await fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php');
              const data = await res.json();
              if (data.drinks && data.drinks[0]) {
                openRecipeModal(data.drinks[0].idDrink, 'drink', 'cocktaildb');
              }
            }
          } catch(e) {
            showToast('Rastgele tarif getirilemedi.');
          }
        }

        // 5. Kart Listesini Ekrana Çiz
        function renderRecipeList(items, contextTitle) {
          showLoading(false);
          const grid = document.getElementById('recipes-grid');
          const countEl = document.getElementById('results-count');
          const emptyEl = document.getElementById('empty-state');

          if (!items || items.length === 0) {
            grid.innerHTML = '';
            countEl.innerText = '0 tarif bulundu';
            emptyEl.classList.remove('hidden');
            return;
          }

          emptyEl.classList.add('hidden');
          countEl.innerText = `${items.length} tarif listelendi (${contextTitle})`;

          grid.innerHTML = items.map(item => {
            const id = item.idMeal || item.idDrink;
            const name = item.strMeal || item.strDrink;
            const thumb = item.strMealThumb || item.strDrinkThumb;
            const type = item.idMeal ? 'meal' : 'drink';
            const source = item._source || (item.idMeal ? 'themealdb' : 'cocktaildb');

            const sourceBadge = source === 'forkify'
              ? `<span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">Forkify (${item._publisher || '1M+'})</span>`
              : source === 'themealdb'
                ? `<span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">TheMealDB</span>`
                : `<span class="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-semibold">TheCocktailDB</span>`;

            return `
              <div class="recipe-card p-4 rounded-2xl bg-white border border-mistral-hairline hover:border-rose-500/50 transition-all duration-300 shadow-lg flex flex-col justify-between group">
                <div class="cursor-pointer" onclick="openRecipeModal('${id}', '${type}', '${source}')">
                  <div class="w-full h-48 rounded-xl overflow-hidden mb-3 bg-white relative">
                    <img src="${thumb}" alt="${name}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500" onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80'">
                    <div class="absolute inset-0 bg-white from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                    <div class="absolute top-2 left-2">
                      ${sourceBadge}
                    </div>
                  </div>
                  <h3 class="font-bold text-sm text-mistral-ink group-hover:text-rose-400 transition line-clamp-1 mb-1">${name}</h3>
                </div>
                <div class="pt-3 border-t border-mistral-hairline flex items-center justify-between">
                  <button onclick="openRecipeModal('${id}', '${type}', '${source}')" class="text-xs text-rose-400 hover:text-rose-300 font-semibold transition">
                    Tarifi İncele &rarr;
                  </button>
                  <button onclick="quickSaveRecipe('${id}', '${name.replace(/'/g, '\'')}', '${thumb}', '${type}', '${source}')" class="text-xs text-mistral-slate hover:text-amber-400 transition p-1" title="Deftere Kaydet">
                    🔖
                  </button>
                </div>
              </div>
            `;
          }).join('');
        }

        // 6. Detay Modalı (Full Recipe Detail)
        async function openRecipeModal(id, type, source) {
          showToast('Tarif detayları yükleniyor...');
          const resolvedSource = source || (type === 'meal' ? (id.length > 10 ? 'forkify' : 'themealdb') : 'cocktaildb');
          try {
            const badges = document.getElementById('modal-badges');
            const videoBox = document.getElementById('modal-video-box');
            const ingDiv = document.getElementById('modal-ingredients');
            const instEl = document.getElementById('modal-instructions');
            badges.innerHTML = '';
            videoBox.innerHTML = '';
            ingDiv.innerHTML = '';

            if (resolvedSource === 'forkify') {
              const res = await fetch(`https://forkify-api.herokuapp.com/api/v2/recipes/${id}`);
              const data = await res.json();
              const recipe = data.data ? data.data.recipe : null;
              if (!recipe) return;

              currentModalRecipe = {
                id: id,
                type: 'meal',
                source: 'forkify',
                title: recipe.title,
                thumb: recipe.image_url
              };

              document.getElementById('modal-img').src = recipe.image_url;
              document.getElementById('modal-title').innerText = recipe.title;

              badges.innerHTML += `<span class="px-2.5 py-0.5 rounded-full bg-amber-500/80 text-white text-[10px] font-bold">📚 Forkify (1M+ Global)</span>`;
              if (recipe.publisher) badges.innerHTML += `<span class="px-2.5 py-0.5 rounded-full bg-indigo-500/80 text-white text-[10px] font-bold">🏢 ${recipe.publisher}</span>`;
              if (recipe.cooking_time) badges.innerHTML += `<span class="px-2.5 py-0.5 rounded-full bg-teal-500/80 text-white text-[10px] font-bold">⏱️ ${recipe.cooking_time} dk</span>`;
              if (recipe.servings) badges.innerHTML += `<span class="px-2.5 py-0.5 rounded-full bg-rose-500/80 text-white text-[10px] font-bold">👥 ${recipe.servings} Kişilik</span>`;

              if (recipe.source_url) {
                videoBox.innerHTML = `
                  <a href="${recipe.source_url}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-1.5 rounded-xl bg-white from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow">
                    <span>📖</span> Orijinal Tarifi Aç (${recipe.publisher}) &rarr;
                  </a>
                `;
              }

              if (recipe.ingredients && recipe.ingredients.length) {
                ingDiv.innerHTML = recipe.ingredients.map(ing => `
                  <div class="p-2.5 rounded-xl bg-white border border-mistral-hairline flex items-center justify-between">
                    <span class="font-medium text-mistral-ink truncate">${ing.description || ''}</span>
                    <span class="text-amber-400 font-semibold ml-2 shrink-0">${ing.quantity ? ing.quantity + ' ' : ''}${ing.unit || ''}</span>
                  </div>
                `).join('');
              }

              instEl.innerText = `Bu tarif ${recipe.publisher ? '\"' + recipe.publisher + '\"' : 'global şefler'} tarafından hazırlanmıştır.\\n\\nMalzemeleri hazırladıktan sonra orijinal yapılış adımlarını, şef ipuçlarını ve pişirme aşamalarını görmek için yukarıdaki \"Orijinal Tarifi Aç\" butonuna tıklayabilirsiniz.`;

            } else {
              let item = null;
              if (type === 'meal') {
                const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
                const data = await res.json();
                item = data.meals ? data.meals[0] : null;
              } else {
                const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
                const data = await res.json();
                item = data.drinks ? data.drinks[0] : null;
              }

              if (!item) return;

              currentModalRecipe = {
                id: id,
                type: type,
                source: type === 'meal' ? 'themealdb' : 'cocktaildb',
                title: item.strMeal || item.strDrink,
                thumb: item.strMealThumb || item.strDrinkThumb
              };

              document.getElementById('modal-img').src = item.strMealThumb || item.strDrinkThumb;
              document.getElementById('modal-title').innerText = item.strMeal || item.strDrink;

              if (type === 'meal') badges.innerHTML += `<span class="px-2.5 py-0.5 rounded-full bg-rose-500/80 text-white text-[10px] font-bold">🌟 TheMealDB</span>`;
              if (item.strCategory) badges.innerHTML += `<span class="px-2.5 py-0.5 rounded-full bg-rose-500/80 text-white text-[10px] font-bold">${item.strCategory}</span>`;
              if (item.strArea) badges.innerHTML += `<span class="px-2.5 py-0.5 rounded-full bg-teal-500/80 text-white text-[10px] font-bold">${item.strArea} Mutfağı</span>`;
              if (item.strAlcoholic) badges.innerHTML += `<span class="px-2.5 py-0.5 rounded-full bg-amber-500/80 text-white text-[10px] font-bold">${item.strAlcoholic}</span>`;
              if (item.strGlass) badges.innerHTML += `<span class="px-2.5 py-0.5 rounded-full bg-indigo-500/80 text-white text-[10px] font-bold">${item.strGlass}</span>`;

              if (item.strYoutube) {
                videoBox.innerHTML = `
                  <a href="${item.strYoutube}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow">
                    <span>▶</span> YouTube Video
                  </a>
                `;
              }

              for (let i = 1; i <= 20; i++) {
                const ing = item['strIngredient' + i];
                const measure = item['strMeasure' + i];
                if (ing && ing.trim()) {
                  ingDiv.innerHTML += `
                    <div class="p-2.5 rounded-xl bg-white border border-mistral-hairline flex items-center justify-between">
                      <span class="font-medium text-mistral-ink truncate">${ing.trim()}</span>
                      <span class="text-rose-400 font-semibold ml-2 shrink-0">${measure ? measure.trim() : ''}</span>
                    </div>
                  `;
                }
              }

              instEl.innerText = item.strInstructions || 'Hazırlanış talimatı bulunamadı.';
            }

            updateModalSaveButtonState();
            document.getElementById('recipe-modal').classList.remove('hidden');
          } catch(e) {
            console.error(e);
          }
        }

        function closeModal() {
          document.getElementById('recipe-modal').classList.add('hidden');
          currentModalRecipe = null;
        }

        // 7. Tarif Defterim (Koleksiyon & Storage)
        const RECIPE_STORAGE_KEY = 'vibe_saved_recipes';

        function getSavedRecipes() {
          try {
            return JSON.parse(localStorage.getItem(RECIPE_STORAGE_KEY) || '[]');
          } catch(e) {
            return [];
          }
        }

        function toggleSaveCurrentModalRecipe() {
          if (!currentModalRecipe) return;
          let list = getSavedRecipes();
          const exists = list.some(r => r.id === currentModalRecipe.id);

          if (exists) {
            list = list.filter(r => r.id !== currentModalRecipe.id);
            showToast('Tarif defterinden çıkarıldı.');
          } else {
            list.unshift({
              id: currentModalRecipe.id,
              type: currentModalRecipe.type,
              source: currentModalRecipe.source || 'themealdb',
              title: currentModalRecipe.title,
              thumb: currentModalRecipe.thumb,
              date: new Date().toLocaleDateString('tr-TR')
            });
            showToast('✓ Tarif defterinize kaydedildi!');
          }

          saveRecipesToStorage(list);
          updateModalSaveButtonState();
          renderSavedRecipes();
        }

        function updateModalSaveButtonState() {
          if (!currentModalRecipe) return;
          const list = getSavedRecipes();
          const exists = list.some(r => r.id === currentModalRecipe.id);
          const icon = document.getElementById('modal-save-icon');
          const txt = document.getElementById('modal-save-text');
          const btn = document.getElementById('btn-modal-save');

          if (exists) {
            icon.innerText = '✅';
            txt.innerText = 'Deftere Kaydedildi';
            btn.className = 'px-4 py-2 rounded-xl bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 text-xs font-semibold transition flex items-center gap-1.5';
          } else {
            icon.innerText = '🔖';
            txt.innerText = 'Tarif Defterime Kaydet';
            btn.className = 'px-4 py-2 rounded-xl bg-white hover:bg-mistral-cream text-xs font-semibold text-mistral-ink transition flex items-center gap-1.5 border border-mistral-hairline';
          }
        }

        function quickSaveRecipe(id, title, thumb, type, source) {
          const list = getSavedRecipes();
          const exists = list.some(item => item.id === id);
          if (exists) {
            showToast('Bu tarif zaten defterinizde kayıtlı.');
            return;
          }
          const resolvedSource = source || (type === 'meal' ? (id.length > 10 ? 'forkify' : 'themealdb') : 'cocktaildb');
          list.push({ id, title, thumb, type, source: resolvedSource, date: new Date().toLocaleDateString('tr-TR') });
          saveRecipesToStorage(list);
          renderSavedRecipes();
          showToast('✅ Tarif defterinize eklendi!');
        }

        function removeSavedRecipe(id) {
          let list = getSavedRecipes();
          list = list.filter(r => r.id !== id);
          saveRecipesToStorage(list);
          renderSavedRecipes();
          showToast('Tarif silindi.');
        }

        function clearAllSavedRecipes() {
          if (!confirm('Tarif defterinizdeki tüm kayıtları silmek istediğinize emin misiniz?')) return;
          localStorage.removeItem(RECIPE_STORAGE_KEY);
          renderSavedRecipes();
          showToast('Tarif defteri temizlendi.');
        }

        function saveRecipesToStorage(list) {
          localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(list));
        }

        function renderSavedRecipes() {
          const list = getSavedRecipes();
          const grid = document.getElementById('saved-recipes-grid');
          const empty = document.getElementById('saved-recipes-empty');

          if (!list || list.length === 0) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
            return;
          }

          empty.classList.add('hidden');
          grid.innerHTML = list.map(item => `
            <div class="p-3.5 rounded-2xl bg-white border border-mistral-hairline hover:border-rose-500/50 transition flex flex-col justify-between shadow">
              <div class="cursor-pointer" onclick="openRecipeModal('${item.id}', '${item.type}', '${item.source || ''}')">
                <div class="w-full h-32 rounded-xl overflow-hidden mb-2.5 bg-white">
                  <img src="${item.thumb}" alt="${item.title}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80'">
                </div>
                <h4 class="font-bold text-xs text-mistral-ink line-clamp-1 mb-1">${item.title}</h4>
                <div class="flex items-center gap-1.5 text-[10px] text-mistral-slate">
                  <span>${item.type === 'meal' ? (item.source === 'forkify' ? '📚 Forkify' : '🍲 MealDB') : '🍸 İçecek'}</span>
                  <span>&bull;</span>
                  <span>${item.date || ''}</span>
                </div>
              </div>
              <div class="pt-2 mt-2 border-t border-mistral-hairline flex items-center justify-between">
                <button onclick="openRecipeModal('${item.id}', '${item.type}', '${item.source || ''}')" class="text-[11px] text-rose-400 hover:underline">
                  Görüntüle
                </button>
                <button onclick="removeSavedRecipe('${item.id}')" class="text-[11px] text-mistral-slate hover:text-red-400 transition" title="Sil">
                  🗑️
                </button>
              </div>
            </div>
          `).join('');
        }

        // 8. Yardımcı Bildirim (Toast)
        function showToast(msg) {
          const t = document.getElementById('lezzet-toast');
          t.innerText = msg;
          t.classList.remove('hidden');
          setTimeout(() => t.classList.add('hidden'), 2500);
        }

        // Başlangıç yüklemesi
        renderPantryTags();
        renderFilterButtons();
        fetchByArea('Turkish');
        renderSavedRecipes();
