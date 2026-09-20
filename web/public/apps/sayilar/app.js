async function fetchNumberFact(num) {
          try {
            const res = await fetch(`/api/numbers/fact?number=${encodeURIComponent(num)}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            document.getElementById('input-number').value = data.number;
            document.getElementById('res-big-number').innerText = data.number;
            document.getElementById('res-fact-text').innerText = data.fact;
            document.getElementById('res-parity').innerText = data.isEven ? 'Çift Sayı' : 'Tek Sayı';
            
            const pEl = document.getElementById('res-prime');
            if (data.isPrime) {
              pEl.innerText = '✓ Asal Sayı';
              pEl.className = 'text-base font-editorial mt-1 block text-emerald-600 font-bold';
            } else {
              pEl.innerText = 'Bileşik Sayı';
              pEl.className = 'text-base font-editorial mt-1 block text-mistral-slate';
            }

            const fibEl = document.getElementById('res-fib');
            if (data.isFibonacci) {
              fibEl.innerText = '✓ Fibonacci Üyesi';
              fibEl.className = 'text-base font-editorial mt-1 block text-amber-600 font-bold';
            } else {
              fibEl.innerText = 'Dizi Dışı';
              fibEl.className = 'text-base font-editorial mt-1 block text-mistral-stone';
            }

            document.getElementById('res-sqrt').innerText = data.isSquare ? `${data.squareRoot} (Tam Kare)` : data.squareRoot;
            document.getElementById('res-bin').innerText = data.binary;
            document.getElementById('res-hex').innerText = data.hex;
            document.getElementById('res-roman').innerText = data.roman;

            const factorsText = (data.primeFactors && data.primeFactors.length > 0) 
              ? data.primeFactors.join(' × ') + (data.primeFactors.length > 1 ? ` = ${data.number}` : '') 
              : 'Asal çarpan bulunmuyor (0 veya 1)';
            document.getElementById('res-factors').innerText = factorsText;

          } catch(err) {
            alert('Sayı analizi yapılamadı: ' + err.message);
          }
        }

        function analyzeNumber() {
          const val = document.getElementById('input-number').value.trim();
          if (val !== '') fetchNumberFact(val);
        }

        function randomFact() {
          fetchNumberFact('random');
        }

        function setQuickNumber(n) {
          document.getElementById('input-number').value = n;
          fetchNumberFact(n);
        }

        document.addEventListener('DOMContentLoaded', () => {
          fetchNumberFact(42);
        });
