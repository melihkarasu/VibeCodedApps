#!/usr/bin/env node
/**
 * publish.mjs — Uçtan Uca Tek Komut Yayınlama, GitHub Provisioning & brj-A1 Deploy Aracı
 *
 * Tek komutla yürüttüğü adımlar:
 *   1. (Gerekiyorsa) export-standalone.mjs / sync-skills.mjs ile standalone çıktıyı üretir
 *   2. verify-sync.mjs --ci ile güvenlik, KVKK ve tek-kaynak paritesini doğrular
 *   3. Yeni bir standalone uygulama ise:
 *      - git init + git config
 *      - ~/.git-credentials üzerinden GitHub API ile melihkarasu/<repo> oluşturur
 *      - Push sonrası GitHub Pages'i (main / root) otomatik aktif eder
 *   4. Hem VibeCodedApps monoreposunu hem ilgili standalone repoyu commit + push eder
 *   5. (--no-deploy verilmedikçe) ~/.openclaw/.env içindeki AAPANEL_BRJ_A1_* bilgileriyle
 *      app.melihkarasu.com üzerinde git pull, public.apps PostgreSQL upsert, docker restart vibe-web
 *      ve canlı HTTP 200 doğrulamasını tamamlar.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MONOREPO_ROOT = path.resolve(__dirname, '..');
const WORKSPACE_ROOT = path.resolve(MONOREPO_ROOT, '..');
const MANIFEST_PATH = path.join(__dirname, 'apps-manifest.json');
const GITHUB_OWNER = 'melihkarasu';

function parseArgs(argv) {
  const opts = {
    appId: null,
    skills: false,
    skillFilter: null,
    message: null,
    dryRun: false,
    noPush: false,
    noDeploy: false,
    noExport: false,
    forceExport: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--app' && argv[i + 1]) opts.appId = argv[++i];
    else if (a === '--skills') opts.skills = true;
    else if (a === '--skill' && argv[i + 1]) opts.skillFilter = argv[++i];
    else if ((a === '-m' || a === '--message') && argv[i + 1]) opts.message = argv[++i];
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--no-push') opts.noPush = true;
    else if (a === '--no-deploy') opts.noDeploy = true;
    else if (a === '--no-export') opts.noExport = true;
    else if (a === '--force-export') opts.forceExport = true;
    else if (a === '-h' || a === '--help') opts.help = true;
  }
  return opts;
}

function runGit(repoDir, args, capture = true) {
  return execFileSync('git', ['-C', repoDir, ...args], {
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
  });
}

function runNode(scriptPath, args) {
  execFileSync(process.execPath, [scriptPath, ...args], { stdio: 'inherit' });
}

function isTracked(repoDir, relPath) {
  try {
    runGit(repoDir, ['ls-files', '--error-unmatch', relPath]);
    return true;
  } catch {
    return false;
  }
}

function readGithubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  const credPath = path.join(os.homedir(), '.git-credentials');
  if (!fs.existsSync(credPath)) return null;
  const text = fs.readFileSync(credPath, 'utf8');
  const m = text.match(/https:\/\/[^:]+:([^@\s]+)@github\.com/);
  return m ? m[1].trim() : null;
}

async function githubApi(method, endpoint, body, token) {
  const res = await fetch('https://api.github.com' + endpoint, {
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'VibeCodedApps-Publisher',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  let data = {};
  try {
    data = await res.json();
  } catch (_) {}
  return { status: res.status, data };
}

async function ensureStandaloneGitAndRemote(repoDir, entry, opts) {
  const repoName = entry.standaloneDir;
  const remoteUrl = 'https://github.com/' + GITHUB_OWNER + '/' + repoName + '.git';

  if (!fs.existsSync(path.join(repoDir, '.git'))) {
    if (opts.dryRun) {
      console.log('[DRY-RUN] standalone/' + repoName + ': git init -b main & remote add origin ' + remoteUrl);
    } else {
      fs.mkdirSync(repoDir, { recursive: true });
      runGit(repoDir, ['init', '-b', 'main'], false);
      runGit(repoDir, ['config', 'user.name', 'Melih Karasu']);
      runGit(repoDir, ['config', 'user.email', 'melihkarasu@users.noreply.github.com']);
      runGit(repoDir, ['remote', 'add', 'origin', remoteUrl]);
      console.log('✅ standalone/' + repoName + ': yerel git reposu başlatıldı.');
    }
  } else {
    try {
      runGit(repoDir, ['remote', 'get-url', 'origin']);
    } catch {
      if (!opts.dryRun) runGit(repoDir, ['remote', 'add', 'origin', remoteUrl]);
    }
  }

  if (opts.noPush) return { createdRemote: false };

  const token = readGithubToken();
  if (!token) return { createdRemote: false };

  const check = await githubApi('GET', '/repos/' + GITHUB_OWNER + '/' + repoName, null, token);
  if (check.status === 200) {
    return { createdRemote: false, token };
  }

  if (opts.dryRun) {
    console.log('[DRY-RUN] GitHub üzerinde ' + GITHUB_OWNER + '/' + repoName + ' reposu ve GitHub Pages oluşturulacak.');
    return { createdRemote: true, token };
  }

  console.log('🌐 GitHub üzerinde ' + GITHUB_OWNER + '/' + repoName + ' reposu oluşturuluyor...');
  const created = await githubApi('POST', '/user/repos', {
    name: repoName,
    description: entry.name + ' — ' + (entry.desc || 'VibeCodedApps Zero-Backend Standalone Edition'),
    homepage: 'https://' + GITHUB_OWNER + '.github.io/' + repoName + '/',
    private: false,
    has_issues: true,
    has_wiki: false,
  }, token);

  if (created.status !== 201 && created.status !== 422) {
    throw new Error('GitHub repo oluşturulamadı (HTTP ' + created.status + '): ' + (created.data.message || ''));
  }
  console.log('✅ GitHub reposu hazır: https://github.com/' + GITHUB_OWNER + '/' + repoName);
  return { createdRemote: true, token };
}

async function ensureGithubPagesEnabled(repoName, token, opts) {
  if (!token || opts.noPush || opts.dryRun) return;
  const pageCheck = await githubApi('GET', '/repos/' + GITHUB_OWNER + '/' + repoName + '/pages', null, token);
  if (pageCheck.status === 200) return;

  const enabled = await githubApi('POST', '/repos/' + GITHUB_OWNER + '/' + repoName + '/pages', {
    source: { branch: 'main', path: '/' },
  }, token);
  if (enabled.status === 201 || enabled.status === 409) {
    console.log('✅ GitHub Pages aktif edildi: https://' + GITHUB_OWNER + '.github.io/' + repoName + '/');
  }
}

function checkExportSafety(entry) {
  if (!entry.exportable || !entry.publicDir) return;
  const monoJsPath = path.join(MONOREPO_ROOT, entry.publicDir, 'app.js');
  const saJsPath = path.join(WORKSPACE_ROOT, 'standalone-apps', entry.standaloneDir, 'js/app.js');

  if (!fs.existsSync(monoJsPath) || !fs.existsSync(saJsPath)) return;

  const monoJs = fs.readFileSync(monoJsPath, 'utf8');
  const saJs = fs.readFileSync(saJsPath, 'utf8');

  const monoUsesBackendProxy = /(['"`])\/api\/(?!user-data|favorites|admin)/.test(monoJs);
  const hasRuntimeSwitch = /VibeRuntime\s*\??\.\s*isStandalone|window\.__VIBE_STANDALONE__/.test(monoJs);
  const saUsesDirectApi = !/(['"`])\/api\/(?!user-data|favorites|admin)/.test(saJs);

  if (monoUsesBackendProxy && !hasRuntimeSwitch && saUsesDirectApi) {
    console.error(
      '\n⚠️  KORUMA DURDURMASI (' + entry.id + '):\n' +
      '   Monorepo app.js henüz /api/... proxy çağrısı kullanıyor (VibeRuntime.isStandalone ayrımı yok),\n' +
      '   standalone-apps/' + entry.standaloneDir + '/js/app.js ise doğrudan public CORS API ile çalışıyor.\n' +
      '   Üzerine yazmamak için export durduruldu.\n\n' +
      '   Seçenekler:\n' +
      '   • İki sürümü ayrı tutarak yalnızca commit/push yapmak için: --no-export\n' +
      '   • Monorepo app.js içine VibeRuntime.isStandalone dalı ekledikten sonra tekrar çalıştırın\n' +
      '   • Standalone\'u yine de monorepodan ezmek için: --force-export\n'
    );
    process.exit(1);
  }
}

function commitAndPushPaths(repoDir, label, scopedPaths, commitMessage, opts) {
  if (!fs.existsSync(path.join(repoDir, '.git'))) {
    console.log('⏭️  ' + label + ': git reposu değil, atlanıyor (' + repoDir + ')');
    return false;
  }

  const allDirty = runGit(repoDir, ['status', '--porcelain']).trim();
  const existingScoped = scopedPaths
    ? scopedPaths.filter((p) => fs.existsSync(path.join(repoDir, p)) || isTracked(repoDir, p))
    : [];

  let relevantDirty = '';
  if (scopedPaths) {
    if (existingScoped.length > 0) {
      relevantDirty = runGit(repoDir, ['status', '--porcelain', '--', ...existingScoped]).trim();
    }
  } else {
    relevantDirty = allDirty;
  }

  if (scopedPaths && allDirty && !relevantDirty) {
    console.log('ℹ️  ' + label + ': hedef kapsamda değişiklik yok (kapsam dışı değişikliklere dokunulmadı).');
  }

  if (relevantDirty) {
    if (opts.dryRun) {
      console.log('[DRY-RUN] ' + label + ': commit edilecek değişiklikler:\n' + relevantDirty);
    } else {
      if (scopedPaths) {
        runGit(repoDir, ['add', '--', ...existingScoped], false);
      } else {
        runGit(repoDir, ['add', '-A'], false);
      }
      runGit(repoDir, ['commit', '-m', commitMessage], false);
      console.log('✅ ' + label + ': commit edildi.');
    }
  } else {
    console.log('✅ ' + label + ': çalışma ağacı temiz.');
  }

  if (opts.noPush) {
    console.log('⏭️  ' + label + ': --no-push nedeniyle push atlandı.');
    return false;
  }

  let hasUpstream = true;
  let aheadCount = 0;
  try {
    aheadCount = parseInt(runGit(repoDir, ['rev-list', '--count', 'origin/main..HEAD']).trim(), 10) || 0;
  } catch {
    hasUpstream = false;
    aheadCount = 1;
  }

  if (aheadCount === 0 && !relevantDirty) {
    console.log('✅ ' + label + ': origin/main ile güncel.');
    return false;
  }

  if (opts.dryRun) {
    console.log('[DRY-RUN] ' + label + ': git push ' + (hasUpstream ? 'origin main' : '-u origin main') + ' çalıştırılacak.');
    return true;
  }

  if (hasUpstream) {
    runGit(repoDir, ['push', 'origin', 'main'], false);
  } else {
    runGit(repoDir, ['push', '-u', 'origin', 'main'], false);
  }
  console.log('🚀 ' + label + ': origin/main\'e push edildi.');
  return true;
}

function loadDotEnv() {
  const candidates = [
    path.join(os.homedir(), '.openclaw', '.env'),
    path.join(WORKSPACE_ROOT, '.env'),
  ];
  const env = {};
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[m[1]] = val;
    }
  }
  return env;
}

function buildAaPanelAuth(apiKey, extra = {}) {
  const now = Math.floor(Date.now() / 1000);
  const kHash = crypto.createHash('md5').update(apiKey, 'utf8').digest('hex');
  const reqSig = crypto.createHash('md5').update(String(now) + kHash, 'utf8').digest('hex');
  const params = new URLSearchParams({
    request_time: String(now),
    request_token: reqSig,
    ...extra,
  });
  return params.toString();
}

function postAaPanel(baseUrl, endpoint, apiKey, extra = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(endpoint, baseUrl.replace(/^http:\/\//i, 'https://'));
    const body = buildAaPanelAuth(apiKey, extra);
    const req = https.request(
      u,
      {
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 30000,
      },
      (res) => {
        let chunks = '';
        res.on('data', (d) => { chunks += d; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(chunks));
          } catch {
            resolve({ raw: chunks });
          }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('aaPanel request timeout'));
    });
    req.write(body);
    req.end();
  });
}

function sqlLiteral(val) {
  return "'" + String(val == null ? '' : val).replace(/'/g, "''") + "'";
}

async function deployToProductionBrjA1(entry, opts) {
  if (opts.noDeploy || opts.noPush) {
    console.log('⏭️  Canlı sunucu (brj-A1) deploy adımı atlandı (--no-deploy / --no-push).');
    return;
  }

  const env = loadDotEnv();
  const panelUrl = env.AAPANEL_BRJ_A1_URL;
  const panelKey = env.AAPANEL_BRJ_A1_KEY;
  if (!panelUrl || !panelKey) {
    console.log('ℹ️  AAPANEL_BRJ_A1_URL/KEY bulunamadı; canlı sunucu deploy adımı atlandı.');
    return;
  }

  if (opts.dryRun) {
    console.log('[DRY-RUN] brj-A1 (app.melihkarasu.com): git pull + ' + (entry ? 'public.apps upsert (' + entry.id + ') + ' : '') + 'docker restart vibe-web + canlı HTTP 200 doğrulaması çalıştırılacak.');
    return;
  }

  console.log('\n🌍 Canlı sunucu (brj-A1 · app.melihkarasu.com) Pattern D deploy başlatılıyor...');

  const catId = (entry && entry.categoryId) || 'web-araclari';
  const upsertSql = entry
    ? [
        "docker exec -i vibe-supabase-db psql -U postgres -d postgres <<'SQL'",
        'INSERT INTO public.apps (id, category_id, name, "desc", icon, url, action, status, sort_order)',
        'VALUES (',
        '  ' + sqlLiteral(entry.id) + ',',
        '  ' + sqlLiteral(catId) + ',',
        '  ' + sqlLiteral(entry.name) + ',',
        '  ' + sqlLiteral(entry.desc || '') + ',',
        "  'svg',",
        '  ' + sqlLiteral(entry.url || ('/' + entry.id)) + ',',
        '  ' + sqlLiteral(entry.action || 'Uygulamayı Aç') + ',',
        "  'active',",
        '  COALESCE((SELECT sort_order FROM public.apps WHERE id = ' + sqlLiteral(entry.id) + '), (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM public.apps WHERE category_id = ' + sqlLiteral(catId) + '))',
        ')',
        'ON CONFLICT (id) DO UPDATE SET',
        '  category_id = EXCLUDED.category_id,',
        '  name = EXCLUDED.name,',
        '  "desc" = EXCLUDED."desc",',
        '  url = EXCLUDED.url,',
        '  action = EXCLUDED.action,',
        '  status = EXCLUDED.status,',
        '  updated_at = now();',
        'SQL',
      ].join('\n')
    : '';

  const checkFiles = [
    'web/server.js',
    'web/template.js',
    'web/routes/vitrin.js',
    entry && entry.routeFile ? entry.routeFile : null,
    entry && entry.publicDir ? entry.publicDir + '/app.js' : null,
  ]
    .filter(Boolean)
    .map((f) => '[ -f "' + f + '" ] && node --check "' + f + '" || true')
    .join('\n');

  const remoteScript = [
    'set -e',
    'cd /www/wwwroot/app.melihkarasu.com',
    'git config --global --add safe.directory /www/wwwroot/app.melihkarasu.com',
    'OLD_HEAD=$(git rev-parse --short HEAD)',
    'git pull --ff-only origin main',
    'NEW_HEAD=$(git rev-parse --short HEAD)',
    'echo "OLD_HEAD=${OLD_HEAD} NEW_HEAD=${NEW_HEAD}"',
    checkFiles,
    upsertSql,
    'if [ "$OLD_HEAD" != "$NEW_HEAD" ]; then',
    '  docker restart vibe-web',
    '  sleep 4',
    'fi',
    "docker ps --format '{{.Names}} {{.Status}}' | grep vibe-web",
  ].join('\n');

  const ts = Math.floor(Date.now() / 1000);
  const logf = '/tmp/vibe_publish_' + ts + '.log';
  const b64 = Buffer.from(remoteScript, 'utf8').toString('base64');
  const sBody = "{ echo '" + b64 + "' | base64 -d | /bin/bash ; } > " + logf + ' 2>&1; echo "★[DONE] exit=$?" >> ' + logf;

  const addRes = await postAaPanel(panelUrl, '/v2/crontab?action=AddCrontab', panelKey, {
    name: 'vibe_publish_' + ts,
    type: 'day',
    where1: '',
    hour: '1',
    minute: '30',
    week: '',
    sType: 'toShell',
    sBody,
    sName: '',
    backupTo: '',
    save: '',
    urladdress: '',
  });

  const cronId = addRes && addRes.message && addRes.message.id;
  if (!cronId) {
    throw new Error('aaPanel AddCrontab başarısız: ' + JSON.stringify(addRes));
  }

  let remoteLog = '';
  try {
    await postAaPanel(panelUrl, '/v2/crontab?action=StartTask', panelKey, { id: String(cronId) });
    for (let i = 0; i < 25; i += 1) {
      await new Promise((r) => setTimeout(r, 3000));
      const fRes = await postAaPanel(panelUrl, '/files?action=GetFileBody', panelKey, { path: logf });
      if (fRes && fRes.status && typeof fRes.data === 'string' && fRes.data.includes('★[DONE]')) {
        remoteLog = fRes.data;
        break;
      }
    }
  } finally {
    await postAaPanel(panelUrl, '/v2/crontab?action=DelCrontab', panelKey, { id: String(cronId) }).catch(() => {});
    await postAaPanel(panelUrl, '/files?action=DeleteFile', panelKey, { path: logf }).catch(() => {});
  }

  if (!remoteLog.includes('★[DONE] exit=0')) {
    throw new Error('brj-A1 deploy hatası veya zaman aşımı:\n' + remoteLog);
  }
  console.log('✅ brj-A1 git pull + DB upsert + vibe-web restart tamamlandı.');

  const verifyPath = entry && entry.url && entry.url.startsWith('/') ? entry.url : '/';
  const liveUrl = 'https://app.melihkarasu.com' + verifyPath;
  const liveRes = await fetch(liveUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (VibeCodedApps-Verify)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!liveRes.ok) {
    throw new Error('Canlı doğrulama başarısız (' + liveUrl + ' -> HTTP ' + liveRes.status + ')');
  }
  console.log('✅ Canlı doğrulama başarılı: ' + liveUrl + ' (HTTP ' + liveRes.status + ')');
}

function printHelp() {
  console.log(
    '\nVibeCodedApps Uçtan Uca Yayınlama Aracı (publish.mjs)\n\n' +
    'Kullanım:\n' +
    '  npm run publish -- --app <id> [-m "mesaj"] [--dry-run] [--no-push] [--no-deploy] [--no-export] [--force-export]\n' +
    '  npm run publish -- --skills [--skill <ad>] [-m "mesaj"] [--dry-run] [--no-push] [--no-deploy]\n'
  );
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || (!opts.appId && !opts.skills)) {
    printHelp();
    process.exit(opts.help ? 0 : 1);
  }

  if (opts.skills) {
    const syncScript = path.join(__dirname, 'sync-skills.mjs');
    const skillArgs = ['--no-verify'];
    if (opts.skillFilter) skillArgs.push('--skill', opts.skillFilter);

    if (opts.dryRun) {
      console.log('[DRY-RUN] node scripts/sync-skills.mjs ' + skillArgs.join(' '));
    } else {
      runNode(syncScript, skillArgs);
    }

    runNode(path.join(__dirname, 'verify-sync.mjs'), ['--ci']);

    const msg = opts.message || ('docs(skills): sync ' + (opts.skillFilter || 'vibecoding rules') + ' across monorepo and standalone');
    const monoScopes = opts.skillFilter
      ? ['skills/' + opts.skillFilter]
      : ['skills/vibecoding-security-rules', 'skills/vibecoding-kvkk-gdpr'];

    commitAndPushPaths(MONOREPO_ROOT, 'VibeCodedApps (monorepo)', monoScopes, msg, opts);

    const skillDirs = opts.skillFilter
      ? [opts.skillFilter]
      : ['vibecoding-security-rules', 'vibecoding-kvkk-gdpr'];

    for (const s of skillDirs) {
      const saRepo = path.join(WORKSPACE_ROOT, 'standalone-apps', s);
      commitAndPushPaths(saRepo, 'standalone/' + s, null, msg, opts);
    }

    await deployToProductionBrjA1(null, opts);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const entry = manifest.find((m) => m.id === opts.appId || m.standaloneDir === opts.appId);
  if (!entry) {
    console.error('❌ Uygulama scripts/apps-manifest.json içinde bulunamadı: ' + opts.appId);
    process.exit(1);
  }

  if (!opts.noExport && entry.exportable) {
    if (!opts.forceExport) {
      checkExportSafety(entry);
    }
    const exportArgs = ['--app', entry.id, '--no-verify'];
    if (opts.dryRun) exportArgs.push('--dry-run');
    runNode(path.join(__dirname, 'export-standalone.mjs'), exportArgs);
  } else {
    console.log('⏭️  Standalone export atlandı (' + entry.id + (!entry.exportable ? ' — exportable=false' : ' — --no-export') + ').');
  }

  console.log('\n🔎 Sürekli doğrulama çalıştırılıyor...');
  runNode(path.join(__dirname, 'verify-sync.mjs'), ['--ci']);

  const msg = opts.message || ('chore(' + entry.id + '): update monorepo and standalone release');
  const monoScopes = [
    entry.routeFile,
    entry.publicDir,
    'scripts/apps-manifest.json',
    'web/routes/vitrin.js',
    'web/server.js',
    'web/public/js/vibe-runtime.js',
    'scripts/export-standalone.mjs',
    'scripts/publish.mjs',
  ].filter(Boolean);

  commitAndPushPaths(MONOREPO_ROOT, 'VibeCodedApps (monorepo)', monoScopes, msg, opts);

  if (entry.standaloneDir) {
    const saRepo = path.join(WORKSPACE_ROOT, 'standalone-apps', entry.standaloneDir);
    const { token } = await ensureStandaloneGitAndRemote(saRepo, entry, opts);
    commitAndPushPaths(saRepo, 'standalone/' + entry.standaloneDir, null, msg, opts);
    await ensureGithubPagesEnabled(entry.standaloneDir, token, opts);
  }

  await deployToProductionBrjA1(entry, opts);
}

main().catch((err) => {
  console.error('❌ Yayınlama hatası: ' + err.message);
  process.exit(1);
});
