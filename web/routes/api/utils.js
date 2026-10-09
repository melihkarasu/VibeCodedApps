const dns = require("dns").promises;
const net = require("net");

// Web Security Scanner Gelişmiş SSRF ve DNS Rebinding Koruması (CWE-918)
async function isPrivateAddress(hostnameOrIp) {
  if (!hostnameOrIp) return true;
  const clean = hostnameOrIp.trim().toLowerCase();

  // 1. Bilinen yerel isimler ve dahili servisler
  if (
    clean === "localhost" ||
    clean.endsWith(".local") ||
    clean.endsWith(".internal") ||
    clean === "0.0.0.0" ||
    clean === "::1" ||
    clean.includes("vibe-") ||
    clean.includes("supabase")
  ) {
    return true;
  }

  // 2. IP Çözümlemesi (DNS Rebinding Önleme)
  let ips = [];
  if (net.isIP(clean)) {
    ips = [clean];
  } else {
    try {
      const records = await dns.lookup(clean, { all: true });
      ips = records.map(r => r.address);
    } catch(err) {
      return true; // Çözümlenemeyen alan adları güvenlik gereği engellenir
    }
  }

  for (const ip of ips) {
    if (net.isIPv4(ip)) {
      const parts = ip.split(".").map(Number);
      if (parts[0] === 0) return true; // 0.0.0.0/8
      if (parts[0] === 127) return true; // 127.0.0.0/8 (Loopback)
      if (parts[0] === 10) return true; // 10.0.0.0/8 (Özel Ağ)
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12 (Docker / Özel Ağ)
      if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16 (Özel Ağ)
      if (parts[0] === 169 && parts[1] === 254) return true; // 169.254.0.0/16 (Cloud Metadata / Link-Local)
      if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true; // 100.64.0.0/10 (CGNAT)
      if (parts[0] >= 224) return true; // Multicast & Ayrılmış
    } else if (net.isIPv6(ip)) {
      const lower = ip.toLowerCase();
      if (lower === "::1" || lower === "::") return true;
      if (lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) return true;
    }
  }

  return false;
}

// Web Security Scanner Redirect-Guvenli Fetch (CWE-918: "public -> 302 -> ic ag" zincirini kapatir)
// Her yonlendirme adiminda hostname yeniden cozumlenir ve dogrulanir.
async function safeFetch(rawUrl, options = {}) {
  const MAX_HOPS = 5;
  let currentUrl = rawUrl;
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    const parsed = new URL(currentUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Sadece http/https protokolleri desteklenir');
    }
    if (await isPrivateAddress(parsed.hostname)) {
      throw new Error('SSRF Korumasi: ic ag adresi engellendi');
    }
    const res = await fetch(currentUrl, { ...options, redirect: 'manual' });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      currentUrl = new URL(res.headers.get('location'), currentUrl).href;
      continue;
    }
    return res;
  }
  throw new Error('Cok fazla yonlendirme (redirect limiti asildi)');
}

module.exports = {
  isPrivateAddress,
  safeFetch
};
