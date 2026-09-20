const express = require('express');
const router = express.Router();
const https = require('https');
const crypto = require('crypto');
const { isPrivateAddress } = require('./utils');
const { getCachedJson } = require('./cache');

// =============================================================
// 24. Sayılar & Matematik Atlası (Numbers & Math Engine)
// =============================================================
const NUM_FACTS_MAP = {
  0: "Sıfır sayısı hem bir tam sayı hem de çift bir sayıdır. Matematikte toplama işlemine göre etkisiz elemandır.",
  1: "Bir (1), ne asal ne de bileşik olan tek pozitif tam sayıdır. Çarpma işleminin etkisiz elemanıdır.",
  2: "İki (2), hem tek çift asal sayı hem de en küçük asal sayıdır.",
  3: "Üç (3), ilk tek asal sayıdır ve bir üçgenin köşe sayısıdır.",
  4: "Dört (4), en küçük bileşik (asal olmayan) pozitif tam sayıdır.",
  7: "Yedi (7), haftanın gün sayısı, gökkuşağının renk sayısı ve antik dünyanın 7 harikasını simgeler.",
  12: "On iki (12), bir yıldaki ay sayısı, saat kadranındaki saat dilimi ve düzine birimidir.",
  13: "On üç (13), Fibonacci dizisinin altıncı sayısıdır ve birçok kültürde şans/uğur metaforu taşır.",
  42: "Kırk iki (42), Douglas Adams'ın 'Otostopçunun Galaksi Rehberi'ne göre 'Hayatın, Evrenin ve Her Şeyin Nihai Cevabı'dır.",
  64: "Altmış dört (64), satranç tahtasındaki toplam kare sayısıdır (8x8) ve hem bir tamkare hem de bir tamküptür (8² = 4³).",
  73: "Yetmiş üç (73), Sheldon Cooper'ın favori sayısıdır: 21. asal sayıdır, tersi 37 ise 12. asal sayıdır.",
  100: "Yüz (100), suyun standart atmosfer basıncında kaynama sıcaklığıdır (°C) ve 10'un karesidir.",
  365: "Üç yüz altmış beş (365), artık olmayan bir takvim yılındaki gün sayısıdır.",
  1729: "Hardy-Ramanujan taksi sayısı: İki küpün toplamı olarak iki farklı şekilde yazılabilen en küçük sayıdır (1³ + 12³ = 9³ + 10³ = 1729)."
};

function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function getPrimeFactors(n) {
  const factors = [];
  let d = 2;
  while (n >= 2) {
    if (n % d === 0) {
      factors.push(d);
      n /= d;
    } else {
      d++;
      if (d * d > n) {
        if (n > 1) factors.push(n);
        break;
      }
    }
  }
  return factors;
}

function isFibonacci(n) {
  const isPerfectSquare = x => {
    const s = Math.round(Math.sqrt(x));
    return s * s === x;
  };
  return isPerfectSquare(5 * n * n + 4) || isPerfectSquare(5 * n * n - 4);
}

function toRoman(num) {
  if (num <= 0 || num > 3999) return 'N/A';
  const val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syb = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let roman = "";
  for (let i = 0; i < val.length; i++) {
    while (num >= val[i]) {
      roman += syb[i];
      num -= val[i];
    }
  }
  return roman;
}

router.get('/numbers/fact', (req, res) => {
  let raw = (req.query.number || '42').trim();
  let num = parseInt(raw, 10);

  if (raw === 'random' || isNaN(num)) {
    const pool = [7, 12, 13, 24, 42, 64, 73, 100, 365, 1729, Math.floor(Math.random() * 500) + 1];
    num = pool[Math.floor(Math.random() * pool.length)];
  }

  // Güvenlik sınırları
  if (num < 0 || num > 10000000) {
    num = 42;
  }

  const prime = isPrime(num);
  const fib = num <= 1000000 ? isFibonacci(num) : false;
  const factors = (num > 1 && num <= 100000) ? getPrimeFactors(num) : [];
  const squareRoot = Math.sqrt(num);
  const isSquare = Number.isInteger(squareRoot);
  const isEven = num % 2 === 0;

  const fact = NUM_FACTS_MAP[num] || `${num} sayısı, ${isEven ? 'çift' : 'tek'} bir tam sayıdır. ${prime ? 'Bir asal sayıdır ve yalnızca 1 ile kendisine tam bölünür.' : 'Bileşik bir sayıdır.'} ${fib ? 'Aynı zamanda ünlü Fibonacci dizisinin bir elemanıdır.' : ''}`;

  res.json({
    success: true,
    number: num,
    isEven,
    isPrime: prime,
    isFibonacci: fib,
    isSquare,
    squareRoot: isSquare ? squareRoot : Math.round(squareRoot * 100) / 100,
    binary: num.toString(2),
    hex: '0x' + num.toString(16).toUpperCase(),
    roman: toRoman(num),
    primeFactors: factors.slice(0, 15),
    fact
  });
});

module.exports = router;
