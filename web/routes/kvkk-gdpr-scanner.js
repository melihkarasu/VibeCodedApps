const express = require('express');
const crypto = require('crypto');
const dns = require('dns').promises;
const net = require('net');
const fs = require('fs');
const path = require('path');

const _vertexTokenCache = new Map();

async function getVertexAccessToken(rawSa) {
  let info;
  try {
    info = typeof rawSa === 'object' && rawSa ? rawSa : JSON.parse(String(rawSa || '').trim());
  } catch (err) {
    throw new Error('Geçersiz Vertex Service Account JSON formatı.');
  }
  if (!info.client_email || !info.private_key) {
    throw new Error('Service Account JSON içinde client_email veya private_key eksik.');
  }

  const cacheKey = info.client_email;
  const now = Math.floor(Date.now() / 1000);
  const cached = _vertexTokenCache.get(cacheKey);
  if (cached && cached.exp > now + 60) {
    return { token: cached.token, projectId: info.project_id || '' };
  }

  const headerB64 = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claimB64 = Buffer.from(JSON.stringify({
    iss: info.client_email,
    sub: info.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    iat: now,
    exp: now + 3600
  })).toString('base64url');

  const signingInput = `${headerB64}.${claimB64}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  const normalizedPem = String(info.private_key).replace(/\\n/g, '\n');
  const signatureB64 = signer.sign(normalizedPem).toString('base64url');
  const assertion = `${signingInput}.${signatureB64}`;

  const bodyParams = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion
  });

  const tokRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: bodyParams.toString(),
    signal: AbortSignal.timeout(15000)
  });
  const tokData = await tokRes.json();
  if (!tokRes.ok || !tokData.access_token) {
    throw new Error((tokData && (tokData.error_description || tokData.error)) || `Vertex OAuth token hatası (HTTP ${tokRes.status})`);
  }

  _vertexTokenCache.set(cacheKey, {
    token: tokData.access_token,
    exp: now + Number(tokData.expires_in || 3600)
  });
  return { token: tokData.access_token, projectId: info.project_id || '' };
}

function isPrivateIP(ip) {
  if (!ip) return true;
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 0) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
  }
  if (net.isIPv6(ip)) {
    const norm = ip.toLowerCase();
    if (norm === '::1' || norm === '::' || norm.startsWith('fc') || norm.startsWith('fd') || norm.startsWith('fe80')) return true;
  }
  return false;
}

async function assertSafePublicUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (err) {
    throw new Error('Geçersiz URL formatı.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Yalnızca HTTP ve HTTPS protokolleri desteklenir.');
  }
  const hostname = parsed.hostname;
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new Error('Yerel ve iç ağ adresleri güvenlik (SSRF koruması) nedeniyle taranamaz.');
  }
  if (net.isIP(hostname)) {
    if (isPrivateIP(hostname)) throw new Error('Özel/iç IP adresleri (SSRF koruması) engellendi.');
    return parsed.toString();
  }
  const records = await dns.lookup(hostname, { all: true });
  if (!records || records.length === 0) {
    throw new Error('Alan adı DNS kaydı çözümlenemedi.');
  }
  for (const rec of records) {
    if (isPrivateIP(rec.address)) {
      throw new Error('Alan adı özel/iç ağ IP adresine çözümlendiği için engellendi.');
    }
  }
  return parsed.toString();
}

module.exports = function(pageTemplate) {
  const router = express.Router();

  // 1. Canlı URL KVKK & GDPR Ön Yüz / Çerez / Font / Form Taraması Proxy Uç Noktası
  router.post('/api/scan-url', express.json({ limit: '1mb' }), async (req, res) => {
    try {
      let targetUrl = String((req.body && req.body.url) || '').trim();
      if (!targetUrl) return res.status(400).json({ success: false, error: 'Taranacak URL gerekli.' });
      if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl;

      const safeUrl = await assertSafePublicUrl(targetUrl);
      const response = await fetch(safeUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'KVKK-GDPR-Scanner/1.0 (+https://github.com/melihkarasu/kvkk-gdpr-scanner)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(12000)
      });

      const headersObj = {};
      response.headers.forEach((v, k) => {
        headersObj[k.toLowerCase()] = v;
      });
      const setCookies = typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : (headersObj['set-cookie'] ? [headersObj['set-cookie']] : []);

      const html = (await response.text()).slice(0, 350000);
      return res.json({
        success: true,
        url: safeUrl,
        status: response.status,
        headers: headersObj,
        setCookies,
        html
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err && err.message ? err.message : 'Hedef URL taranırken hata oluştu.'
      });
    }
  });

  // 2. LLM API Proxy (Gemini, Vertex AI, OpenAI, Anthropic, OpenRouter, Groq, Ollama)
  router.post('/api/ai-analyze', express.json({ limit: '2mb' }), async (req, res) => {
    try {
      const { ai_config, system_prompt, user_prompt } = req.body || {};
      if (!ai_config || !user_prompt) {
        return res.status(400).json({ success: false, error: 'AI yapılandırması ve analiz istemi (prompt) zorunludur.' });
      }
      const provider = String(ai_config.provider || 'gemini').toLowerCase();
      const authObj = (ai_config.auth && typeof ai_config.auth === 'object') ? ai_config.auth : {};
      const authType = String(ai_config.auth_type || authObj.type || 'service_account').toLowerCase();
      const rawAuthValue = String(authObj.value || ai_config.service_account_json || ai_config.api_key || ai_config.apiKey || '').trim();
      const apiKey = String(ai_config.api_key || ai_config.apiKey || rawAuthValue || '').trim();
      const model = String(ai_config.model || 'gemini-3.8-flash').trim();
      const temperature = typeof ai_config.temperature === 'number' ? ai_config.temperature : 0.2;

      if (provider !== 'ollama' && provider !== 'custom' && !rawAuthValue && !apiKey) {
        return res.status(400).json({
          success: false,
          error: 'Kimlik bilgisi bulunamadı. Lütfen sağ üstteki "AI Ayarları" panelinden API anahtarınızı veya Vertex Service Account bilginizi kaydedin.'
        });
      }

      let replyText = '';

      if (provider === 'vertex' || provider === 'google-vertex') {
        let projectId = String(ai_config.project_id || '').trim();
        const region = String(ai_config.region || 'global').trim().toLowerCase() || 'global';
        const vertexModel = model === 'gemini-3.1-pro' ? 'gemini-3.1-pro-preview' : model;
        const hostPrefix = region === 'global' ? 'https://aiplatform.googleapis.com' : `https://${encodeURIComponent(region)}-aiplatform.googleapis.com`;

        const vHeaders = { 'Content-Type': 'application/json' };
        let querySuffix = '';

        if (authType === 'api_key' && !rawAuthValue.startsWith('{')) {
          if (!projectId) {
            throw new Error('Vertex API Key kullanımında Google Cloud Project ID alanı zorunludur.');
          }
          querySuffix = `?key=${encodeURIComponent(apiKey)}`;
        } else {
          const saResult = await getVertexAccessToken(rawAuthValue);
          if (!projectId && saResult.projectId) {
            projectId = saResult.projectId;
          }
          if (!projectId) {
            throw new Error('Google Cloud Project ID bulunamadı. Lütfen Project ID girin veya geçerli bir Service Account JSON yapıştırın.');
          }
          vHeaders['Authorization'] = `Bearer ${saResult.token}`;
        }

        const vertexUrl = `${hostPrefix}/v1/projects/${encodeURIComponent(projectId)}/locations/${encodeURIComponent(region)}/publishers/google/models/${encodeURIComponent(vertexModel)}:generateContent${querySuffix}`;
        const vRes = await fetch(vertexUrl, {
          method: 'POST',
          headers: vHeaders,
          body: JSON.stringify({
            ...(system_prompt ? { systemInstruction: { parts: [{ text: system_prompt }] } } : {}),
            contents: [{ role: 'user', parts: [{ text: user_prompt }] }],
            generationConfig: { temperature }
          }),
          signal: AbortSignal.timeout(90000)
        });
        const vData = await vRes.json();
        if (!vRes.ok) {
          throw new Error((vData.error && vData.error.message) || `Vertex AI hatası: HTTP ${vRes.status}`);
        }
        replyText = vData?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
      } else if (provider === 'gemini' || provider === 'google') {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const gRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: system_prompt ? { parts: [{ text: system_prompt }] } : undefined,
            contents: [{ role: 'user', parts: [{ text: user_prompt }] }],
            generationConfig: { temperature }
          }),
          signal: AbortSignal.timeout(90000)
        });
        const gData = await gRes.json();
        if (!gRes.ok) {
          throw new Error((gData.error && gData.error.message) || `Gemini API hatası: HTTP ${gRes.status}`);
        }
        replyText = gData?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
      } else if (provider === 'anthropic' || provider === 'claude') {
        const aRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model,
            max_tokens: 4096,
            temperature,
            system: system_prompt || undefined,
            messages: [{ role: 'user', content: user_prompt }]
          }),
          signal: AbortSignal.timeout(90000)
        });
        const aData = await aRes.json();
        if (!aRes.ok) {
          throw new Error((aData.error && aData.error.message) || `Anthropic API hatası: HTTP ${aRes.status}`);
        }
        replyText = aData?.content?.map(c => c.text || '').join('') || '';
      } else {
        // OpenAI / OpenRouter / Groq / Custom OpenAI-Compatible
        let endpoint = 'https://api.openai.com/v1/chat/completions';
        if (provider === 'openrouter') {
          endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        } else if (provider === 'groq') {
          endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        } else if (ai_config.base_url || ai_config.baseUrl) {
          const customBase = String(ai_config.base_url || ai_config.baseUrl).trim().replace(/\/+$/, '');
          await assertSafePublicUrl(customBase);
          endpoint = customBase.endsWith('/chat/completions') ? customBase : `${customBase}/chat/completions`;
        }

        const headers = { 'Content-Type': 'application/json' };
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
        if (provider === 'openrouter') {
          headers['HTTP-Referer'] = 'https://app.melihkarasu.com/kvkk-gdpr-scanner';
          headers['X-Title'] = 'KVKK & GDPR Scanner';
        }

        const oRes = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model,
            temperature,
            messages: [
              ...(system_prompt ? [{ role: 'system', content: system_prompt }] : []),
              { role: 'user', content: user_prompt }
            ]
          }),
          signal: AbortSignal.timeout(90000)
        });
        const oData = await oRes.json();
        if (!oRes.ok) {
          throw new Error((oData.error && oData.error.message) || `LLM API hatası: HTTP ${oRes.status}`);
        }
        replyText = oData?.choices?.[0]?.message?.content || '';
      }

      return res.json({ success: true, reply: replyText });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err && err.message ? err.message : 'LLM analizi sırasında hata oluştu.'
      });
    }
  });

  // 3. Ana Uygulama Arayüzü
  router.get('/', (req, res) => {
    const extraHead = '<link rel="stylesheet" href="/static/apps/kvkk-gdpr-scanner/app.css?v=20261111b">';
    const content = `
    <div class="kvkk-shell max-w-6xl mx-auto py-4 sm:py-6 px-4 space-y-6">

      <!-- Üst Başlık & Durum Çubuğu -->
      <header class="kvkk-topbar flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-mistral-hairline pb-5">
        <div class="flex items-start sm:items-center gap-3.5">
          <div class="kvkk-brand-icon" aria-hidden="true">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
              <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
              <path d="M7 21h10"/>
              <path d="M12 3v18"/>
              <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
            </svg>
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-xl sm:text-2xl font-serif font-medium text-mistral-text tracking-tight">KVKK &amp; GDPR Scanner</h1>
              <span class="kvkk-pill kvkk-pill-accent">2026 Ceza Matrisi</span>
              <span class="kvkk-pill">36 SAST &amp; Web Kuralı</span>
            </div>
            <p class="text-xs text-mistral-muted mt-0.5">
              6698 KVKK · AB GDPR · 6563 ETK (İYS) · 6502 TKHK · 5651 Loglama — Kaynak Kod, GitHub Repo ve Canlı Web Sitesi Hukuki Uyum &amp; Privacy-by-Design Denetçisi
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button type="button" onclick="loadSampleVulnerableProject()" class="kvkk-btn kvkk-btn-ghost text-xs" title="İhlal içeren örnek projeyi yükle ve test et">
            <span>🧪 Örnek İhlalli Proje Yükle</span>
          </button>
          <button type="button" onclick="openAIConfigModal()" class="kvkk-btn kvkk-btn-outline text-xs flex items-center gap-1.5" id="ai-status-btn">
            <span id="ai-status-dot" class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span id="ai-status-label">AI Ayarları</span>
          </button>
          <a href="https://github.com/melihkarasu/vibecoding-kvkk-gdpr" target="_blank" rel="noopener noreferrer" class="kvkk-btn kvkk-btn-ghost text-xs">
            <span>📚 Kural Seti (Skill)</span>
          </a>
        </div>
      </header>

      <!-- Tarama Modu Seçici Sekmeler -->
      <section class="kvkk-card p-4 sm:p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-mistral-hairline pb-3">
          <div class="flex flex-wrap gap-1.5" role="tablist">
            <button type="button" onclick="switchScanTab('folder')" id="tab-btn-folder" class="kvkk-tab active">
              📂 Proje Klasörü / Dosya Seç
            </button>
            <button type="button" onclick="switchScanTab('github')" id="tab-btn-github" class="kvkk-tab">
              🐙 GitHub Repo Tarayıcı
            </button>
            <button type="button" onclick="switchScanTab('code')" id="tab-btn-code" class="kvkk-tab">
              💻 Kod / SQL / Form Yapıştır
            </button>
            <button type="button" onclick="switchScanTab('url')" id="tab-btn-url" class="kvkk-tab">
              🌐 Canlı Web Sitesi (URL) Denetimi
            </button>
          </div>
          <div class="text-[11px] font-mono text-mistral-muted">
            🔒 PII Maskeleme Aktif · Sıfır Veri Saklama
          </div>
        </div>

        <!-- 1. Klasör / Dosya Yükleme Modu -->
        <div id="scan-panel-folder" class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label class="kvkk-dropzone cursor-pointer flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-mistral-border hover:border-mistral-orange transition-colors text-center">
              <input type="file" id="folder-input" webkitdirectory directory multiple class="hidden" onchange="handleFolderSelect(event)">
              <div class="text-2xl mb-1">📁</div>
              <div class="text-sm font-semibold text-mistral-text">Proje Klasörünü Seçin (%100 Tarayıcı İçi Analiz)</div>
              <div class="text-xs text-mistral-muted mt-1">
                <code>.sql</code>, <code>.ts</code>, <code>.tsx</code>, <code>.js</code>, <code>.py</code>, <code>.php</code>, <code>.html</code>, <code>.env</code> ve <code>docs/</code> dosyalarını sunucuya yüklemeden tarar.
              </div>
            </label>
            <label class="kvkk-dropzone cursor-pointer flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-mistral-border hover:border-mistral-orange transition-colors text-center">
              <input type="file" id="files-input" multiple class="hidden" onchange="handleFilesSelect(event)">
              <div class="text-2xl mb-1">📄</div>
              <div class="text-sm font-semibold text-mistral-text">Tekil Dosyalar Seçin</div>
              <div class="text-xs text-mistral-muted mt-1">
                Migration (<code>.sql</code>), Kayıt/Ödeme Formu (<code>.tsx</code>), Layout veya E-posta gönderim dosyalarını seçin.
              </div>
            </label>
          </div>
          <div id="selected-files-summary" class="hidden kvkk-summary-bar bg-mistral-tint px-3.5 py-2.5 rounded-lg text-xs">
            <span id="selected-files-text" class="font-mono text-mistral-text">0 dosya yüklendi</span>
            <button type="button" onclick="runProjectAudit()" class="kvkk-btn kvkk-btn-primary text-xs">
              ⚖️ KVKK &amp; GDPR Uyum Denetimini Başlat
            </button>
          </div>
        </div>

        <!-- 2. GitHub Repo Tarama Modu -->
        <div id="scan-panel-github" class="hidden space-y-3">
          <div class="flex flex-col sm:flex-row gap-2.5">
            <input type="text" id="github-repo-input" placeholder="https://github.com/kullanici/proje-adi veya kullanici/proje-adi"
              class="flex-1 px-3.5 py-2.5 text-sm font-mono rounded-lg border border-mistral-border bg-white text-mistral-text focus:outline-none focus:border-mistral-orange">
            <input type="password" id="github-token-input" placeholder="Opsiyonel GitHub Token (Özel repo / Rate-limit)"
              class="sm:w-64 px-3.5 py-2.5 text-xs font-mono rounded-lg border border-mistral-border bg-white text-mistral-text focus:outline-none focus:border-mistral-orange">
            <button type="button" onclick="scanGithubRepository()" id="btn-scan-github" class="kvkk-btn kvkk-btn-primary whitespace-nowrap">
              🐙 Repoyu Analiz Et
            </button>
          </div>
          <p class="text-[11px] text-mistral-muted">
            GitHub API üzerinden projenin veritabanı şemalarını (RLS), formlarını, e-posta/ödeme akışlarını, Google Fonts/CDN kullanımlarını ve <code>docs/veri-ihlali-mudahale-plani.md</code> varlığını otomatik denetler.
          </p>
        </div>

        <!-- 3. Kod / SQL / Form Yapıştır Modu -->
        <div id="scan-panel-code" class="hidden space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <label for="code-filename-input" class="text-xs font-medium text-mistral-muted">Dosya Adı / Türü:</label>
              <input type="text" id="code-filename-input" value="src/app/register/page.tsx"
                class="px-2.5 py-1 text-xs font-mono rounded border border-mistral-border bg-white text-mistral-text">
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button type="button" onclick="loadSampleSnippet('rls')" class="kvkk-chip">Örnek: RLS Kapalı Tablo &amp; Service Key</button>
              <button type="button" onclick="loadSampleSnippet('form')" class="kvkk-chip">Örnek: Hatalı Rıza &amp; Kayıt Formu</button>
              <button type="button" onclick="loadSampleSnippet('email')" class="kvkk-chip">Örnek: İYS &amp; Çıkış Linki Eksik Mail</button>
              <button type="button" onclick="loadSampleSnippet('fonts_llm')" class="kvkk-chip">Örnek: Google Fonts &amp; LLM PII Sızıntısı</button>
            </div>
          </div>
          <textarea id="code-paste-input" rows="10" placeholder="Denetlemek istediğiniz SQL şemasını, React/Next.js bileşenini, HTML sayfasını veya backend kodunu buraya yapıştırın..."
            class="w-full p-3.5 text-xs font-mono rounded-lg border border-mistral-border bg-white text-mistral-text focus:outline-none focus:border-mistral-orange"></textarea>
          <div class="flex justify-end gap-2">
            <button type="button" onclick="scanPastedCode()" class="kvkk-btn kvkk-btn-primary">
              🔍 Kodu KVKK &amp; GDPR Kurallarıyla Denetle
            </button>
          </div>
        </div>

        <!-- 4. Canlı Web Sitesi (URL) Denetimi Modu -->
        <div id="scan-panel-url" class="hidden space-y-3">
          <div class="flex flex-col sm:flex-row gap-2.5">
            <input type="text" id="live-url-input" placeholder="https://ornek-uygulama.com"
              class="flex-1 px-3.5 py-2.5 text-sm font-mono rounded-lg border border-mistral-border bg-white text-mistral-text focus:outline-none focus:border-mistral-orange">
            <button type="button" onclick="scanLiveWebsite()" id="btn-scan-url" class="kvkk-btn kvkk-btn-primary whitespace-nowrap">
              🌐 Canlı Siteyi Denetle
            </button>
          </div>
          <p class="text-[11px] text-mistral-muted">
            Canlı URL üzerindeki Google Fonts / harici CDN IP sızıntılarını, rızasız çalışan Google Analytics / Meta Pixel / Hotjar izleyicilerini, Aydınlatma Metni linklerini, form onay kutularını ve <code>Set-Cookie</code> güvenlik bayraklarını kontrol eder.
          </p>
        </div>
      </section>

      <!-- Özet Metrikler, Uyum Skoru & 2026 Ceza Riski Kartları -->
      <section id="audit-summary-section" class="hidden space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <!-- Uyum Notu -->
          <div class="kvkk-card p-4 flex items-center gap-4">
            <div id="compliance-grade-badge" class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold font-mono bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
              A
            </div>
            <div>
              <div class="text-[11px] uppercase tracking-wider font-mono text-mistral-muted">Uyum Skoru</div>
              <div class="text-2xl font-bold font-mono text-mistral-text" id="compliance-score-val">100 / 100</div>
              <div class="text-xs text-mistral-muted" id="compliance-verdict-text">Denetim Tamamlandı</div>
            </div>
          </div>

          <!-- Bulgular Dağılımı -->
          <div class="kvkk-card p-4 space-y-1.5">
            <div class="text-[11px] uppercase tracking-wider font-mono text-mistral-muted">Tespit Edilen İhlaller</div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold font-mono text-mistral-text" id="total-findings-count">0</span>
              <span class="text-xs text-mistral-muted" id="scanned-files-count">0 dosyada</span>
            </div>
            <div class="flex flex-wrap gap-1.5 text-[11px] font-mono pt-1">
              <span class="px-1.5 py-0.5 rounded bg-red-500/15 text-red-600" id="crit-count-badge">0 Kritik</span>
              <span class="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600" id="high-count-badge">0 Yüksek</span>
              <span class="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600" id="med-count-badge">0 Orta</span>
            </div>
          </div>

          <!-- 2026 KVKK / ETK / TKHK İdari Ceza Riski -->
          <div class="kvkk-card p-4 space-y-1">
            <div class="text-[11px] uppercase tracking-wider font-mono text-mistral-muted">2026 TR İdari Ceza Riski</div>
            <div class="text-base sm:text-lg font-bold font-mono text-red-600" id="tr-penalty-exposure">0 TL</div>
            <div class="text-[11px] text-mistral-muted" id="tr-penalty-subtext">KVKK m.18 · 6563 ETK · 6502 TKHK</div>
          </div>

          <!-- GDPR / AB Yaptırım Riski & AI Aksiyonu -->
          <div class="kvkk-card p-4 flex flex-col justify-between gap-2">
            <div>
              <div class="text-[11px] uppercase tracking-wider font-mono text-mistral-muted">AB GDPR Kapsamı &amp; AI Analiz</div>
              <div class="text-xs font-semibold text-mistral-text mt-0.5" id="gdpr-exposure-text">GDPR Art. 83 / Schrems II</div>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button type="button" onclick="runAILegalAudit()" id="btn-run-ai-audit" class="kvkk-btn kvkk-btn-primary text-xs w-full justify-center">
                🤖 AI Hukukçu &amp; Kod Yaması Üret
              </button>
            </div>
          </div>
        </div>

        <!-- 6 Ana Denetim Alanı Durum Özeti (CodeBaseHub #6977 + 12 Altın Kural Matrisi) -->
        <div class="kvkk-card p-4 sm:p-5 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-sm font-semibold text-mistral-text flex items-center gap-2">
              <span>📋 10 Maddelik KVKK &amp; GDPR Uyum Kontrol Matrisi</span>
            </h2>
            <div class="flex flex-wrap gap-1.5">
              <button type="button" onclick="exportComplianceMarkdown()" class="kvkk-btn kvkk-btn-ghost text-xs">
                📥 Markdown Rapor İndir (.md)
              </button>
              <button type="button" onclick="exportBreachPlanTemplate()" class="kvkk-btn kvkk-btn-ghost text-xs">
                🚨 docs/veri-ihlali.md Taslağı İndir
              </button>
              <button type="button" onclick="exportComplianceJSON()" class="kvkk-btn kvkk-btn-ghost text-xs">
                { } JSON İndir
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-mistral-hairline text-mistral-muted font-mono text-[11px]">
                  <th class="py-2 pr-3">Denetim Alanı</th>
                  <th class="py-2 px-3">Mevzuat Dayanağı</th>
                  <th class="py-2 px-3">Durum</th>
                  <th class="py-2 px-3">2026 Ceza Karşılığı</th>
                  <th class="py-2 pl-3">Özet Bulgu</th>
                </tr>
              </thead>
              <tbody id="domain-matrix-tbody" class="divide-y divide-mistral-hairline"></tbody>
            </table>
          </div>
        </div>

        <!-- AI Hukukçu & Privacy Mühendisi Raporu ve Sohbet Paneli -->
        <div id="ai-audit-panel" class="hidden kvkk-card p-5 space-y-4 border-2 border-mistral-orange/40">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-mistral-hairline pb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">⚖️</span>
              <div>
                <h3 class="text-sm font-bold text-mistral-text">AI Hukukçu &amp; Privacy-by-Design Mühendislik Raporu</h3>
                <p class="text-[11px] text-mistral-muted" id="ai-report-meta">Seçili LLM yapılandırması ile üretildi (PII Maskeli)</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" onclick="generateAIDocument('aydinlatma')" class="kvkk-chip">📄 Katmanlı Aydınlatma Metni Üret</button>
              <button type="button" onclick="generateAIDocument('ihlali')" class="kvkk-chip">🚨 72 Saat İhlal Planı Üret</button>
              <button type="button" onclick="copyAIReport()" class="kvkk-btn kvkk-btn-ghost text-xs">📋 Kopyala</button>
            </div>
          </div>

          <div id="ai-report-loading" class="hidden py-8 text-center space-y-2">
            <div class="inline-block w-6 h-6 border-2 border-mistral-orange border-t-transparent rounded-full animate-spin"></div>
            <div class="text-xs font-mono text-mistral-muted">PII verileri maskeleniyor ve LLM hukuki/teknik uyum analizi hazırlanıyor...</div>
          </div>

          <div id="ai-report-output" class="prose prose-sm max-w-none text-xs leading-relaxed font-sans whitespace-pre-wrap bg-mistral-tint/60 p-4 rounded-xl border border-mistral-hairline"></div>

          <!-- Bulgular Üzerinde AI Soru-Cevap -->
          <div class="pt-2 border-t border-mistral-hairline space-y-2">
            <div class="text-xs font-semibold text-mistral-text">💬 AI KVKK &amp; GDPR Danışmanına Sorun (Mevcut Tarama Bağlamıyla)</div>
            <div class="flex gap-2">
              <input type="text" id="ai-followup-input" placeholder="Örn: Bu projedeki kayıt formu için KVKK m.10 uyumlu React kodunu ve SQL consent_logs tablosunu yaz..."
                class="flex-1 px-3 py-2 text-xs rounded-lg border border-mistral-border bg-white text-mistral-text focus:outline-none focus:border-mistral-orange"
                onkeydown="if(event.key==='Enter') sendAIFollowup()">
              <button type="button" onclick="sendAIFollowup()" class="kvkk-btn kvkk-btn-primary text-xs">Gönder</button>
            </div>
          </div>
        </div>

        <!-- Detaylı Bulgular Listesi (Dosya · Satır · İhlalli Kod · Uyumlu Çözüm) -->
        <div class="kvkk-card p-4 sm:p-5 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-sm font-semibold text-mistral-text">🔍 Detaylı Teknik Bulgular, Kanun Maddeleri ve Kod Yamaları</h2>
            <div class="flex flex-wrap gap-1.5" id="finding-filter-chips">
              <button type="button" onclick="filterFindings('ALL')" class="kvkk-chip active">Tümü</button>
              <button type="button" onclick="filterFindings('CRITICAL')" class="kvkk-chip">Kritik</button>
              <button type="button" onclick="filterFindings('HIGH')" class="kvkk-chip">Yüksek</button>
              <button type="button" onclick="filterFindings('MEDIUM')" class="kvkk-chip">Orta</button>
            </div>
          </div>
          <div id="findings-list-container" class="space-y-3"></div>
        </div>
      </section>
    </div>

    <!-- AI & LLM Yapılandırma Modalı -->
    <div id="ai-config-modal" class="kvkk-modal-backdrop hidden" onclick="if(event.target===this)closeAIConfigModal()">
      <div class="kvkk-card max-w-xl w-full p-5 space-y-4 bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-mistral-hairline pb-3">
          <div>
            <h3 class="text-base font-bold text-mistral-text">🤖 AI &amp; LLM Analiz Ayarları</h3>
            <p class="text-[11px] text-mistral-muted">
              Google Gemini API, Google Cloud Vertex AI (bölge: global), OpenAI veya Claude yapılandırması. Kimlik bilgileriniz sunucuya kaydedilmez; yalnızca kendi tarayıcınızda tutulur.
            </p>
          </div>
          <button type="button" onclick="closeAIConfigModal()" class="text-mistral-muted hover:text-mistral-text text-lg font-bold">&times;</button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-mistral-text mb-1">LLM Sağlayıcısı (Provider)</label>
              <select id="ai-provider" onchange="onAIProviderChange()" class="w-full px-3 py-2 rounded-lg border border-mistral-border bg-white text-mistral-text font-mono text-xs">
                <option value="gemini">Google Gemini API (AI Studio)</option>
                <option value="vertex">Google Cloud Vertex AI (Bölge: global)</option>
                <option value="openai">OpenAI Compatible (OpenAI / DeepSeek vb.)</option>
                <option value="anthropic">Anthropic Claude API</option>
                <option value="openrouter">OpenRouter</option>
                <option value="groq">Groq Cloud API</option>
                <option value="ollama">Ollama (Lokal / Host)</option>
                <option value="custom">Özel OpenAI-Uyumlu Endpoint</option>
              </select>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="font-semibold text-mistral-text">Model Adı</label>
                <span class="text-[10px] text-mistral-muted font-mono">Hızlı seç:</span>
              </div>
              <input type="text" id="ai-model" value="gemini-3.8-flash" placeholder="gemini-3.8-flash"
                class="w-full px-3 py-2 font-mono rounded-lg border border-mistral-border bg-white text-mistral-text">
              <div class="flex flex-wrap gap-1 pt-1.5">
                <button type="button" onclick="setModelPreset('gemini-3.8-flash')" class="kvkk-chip text-[10px] font-mono">gemini-3.8-flash</button>
                <button type="button" onclick="setModelPreset('gemini-3.1-pro-preview')" class="kvkk-chip text-[10px] font-mono">gemini-3.1-pro</button>
                <button type="button" onclick="setModelPreset('gpt-4o')" class="kvkk-chip text-[10px] font-mono">gpt-4o</button>
                <button type="button" onclick="setModelPreset('claude-sonnet-4-5')" class="kvkk-chip text-[10px] font-mono">claude-sonnet-4-5</button>
              </div>
            </div>
          </div>

          <!-- Vertex AI Özel Alanları (Project ID, Region, Auth Type) -->
          <div id="ai-vertex-fields" class="hidden grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div id="ai-project-id-container">
              <label class="block font-semibold text-mistral-text mb-1">Project ID (Google Cloud)</label>
              <input type="text" id="ai-project-id" placeholder="my-gcp-project-id"
                class="w-full px-3 py-2 font-mono rounded-lg border border-mistral-border bg-white text-mistral-text">
            </div>
            <div id="ai-region-container">
              <label class="block font-semibold text-mistral-text mb-1">Bölge (Region)</label>
              <input type="text" id="ai-region" value="global" placeholder="global"
                class="w-full px-3 py-2 font-mono rounded-lg border border-mistral-border bg-white text-mistral-text">
              <p class="text-[10px] text-emerald-600 font-semibold mt-0.5">Önerilen bölge: "global"</p>
            </div>
            <div id="ai-auth-type-container">
              <label class="block font-semibold text-mistral-text mb-1">Vertex Kimlik Doğrulama</label>
              <select id="ai-auth-type" onchange="onAuthTypeChange()" class="w-full px-3 py-2 rounded-lg border border-mistral-border bg-white text-mistral-text font-mono text-xs">
                <option value="service_account">Service Account (JSON - Önerilen)</option>
                <option value="api_key">Vertex API Key</option>
              </select>
            </div>
          </div>

          <!-- Base URL Alanı (OpenAI Compatible / Ollama / Custom için) -->
          <div id="ai-base-url-container" class="hidden">
            <label class="block font-semibold text-mistral-text mb-1">Base URL (Endpoint)</label>
            <input type="text" id="ai-base-url" placeholder="https://api.openai.com/v1"
              class="w-full px-3 py-2 font-mono rounded-lg border border-mistral-border bg-white text-mistral-text">
          </div>

          <!-- API Key / Service Account JSON Alanı -->
          <div id="ai-api-key-wrapper">
            <label id="ai-auth-label" class="block font-semibold text-mistral-text mb-1">Google Gemini API Key (AIza...)</label>
            <input type="password" id="ai-api-key" placeholder="AIzaSy..."
              class="w-full px-3 py-2 font-mono rounded-lg border border-mistral-border bg-white text-mistral-text">
            <textarea id="ai-service-account-json" rows="4" placeholder='{"type": "service_account", "project_id": "...", "private_key": "-----BEGIN PRIVATE KEY-----...", "client_email": "..."}'
              class="hidden w-full px-3 py-2 font-mono text-[11px] rounded-lg border border-mistral-border bg-white text-mistral-text"></textarea>
          </div>

          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="ai-redact-pii" checked>
              <span>LLM'e kod göndermeden önce TCKN, IBAN, E-posta, Telefon ve API anahtarlarını maskele (KVKK m.4/m.9)</span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-mistral-hairline pt-3">
          <button type="button" onclick="clearAIConfig()" class="kvkk-btn kvkk-btn-ghost text-xs text-red-600">
            🗑️ Ayarları Sıfırla
          </button>
          <div class="flex gap-2">
            <button type="button" onclick="closeAIConfigModal()" class="kvkk-btn kvkk-btn-ghost text-xs">İptal</button>
            <button type="button" onclick="saveAIConfig()" class="kvkk-btn kvkk-btn-primary text-xs">💾 Ayarları Kaydet</button>
          </div>
        </div>
      </div>
    </div>

    <script data-cfasync="false" src="/static/apps/kvkk-gdpr-scanner/app.js?v=20261111b"></script>
    `;

    res.send(pageTemplate('KVKK & GDPR Scanner — Hukuki Kod ve Uyum Denetçisi', content, extraHead));
  });

  return router;
};
