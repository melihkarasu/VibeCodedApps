#!/usr/bin/env node
/**
 * publish.mjs — Monorepo + Standalone Tek Komut Yayınlama Aracı
 *
 * Mevcut 45 standalone uygulamaya toplu müdahale etmeden, yalnızca güncellenen veya
 * yeni eklenen uygulamayı/skill'i:
 *   1. (Gerekiyorsa) export-standalone.mjs / sync-skills.mjs ile üretir
 *   2. verify-sync.mjs --ci ile sürekli doğrulamadan geçirir
 *   3. Hem VibeCodedApps monoreposunu hem ilgili standalone repoyu commit + push eder
 *
 * Usage:
 *   node scripts/publish.mjs --app qr-studio [-m "feat: ..."] [--dry-run] [--no-push] [--no-export] [--force-export]
 *   node scripts/publish.mjs --skills [--skill vibecoding-kvkk-gdpr] [-m "docs: ..."] [--dry-run] [--no-push]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MONOREPO_ROOT = path.resolve(__dirname, '..');
const WORKSPACE_ROOT = path.resolve(MONOREPO_ROOT, '..');
const MANIFEST_PATH = path.join(__dirname, 'apps-manifest.json');

function parseArgs(argv) {
  const opts = {
    appId: null,
    skills: false,
    skillFilter: null,
    message: null,
    dryRun: false,
    noPush: false,
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
      `\n⚠️  KORUMA DURDURMASI (${entry.id}):\n` +
      `   Monorepo app.js henüz /api/... proxy çağrısı kullanıyor (VibeRuntime.isStandalone ayrımı yok),\n` +
      `   standalone-apps/${entry.standaloneDir}/js/app.js ise doğrudan public CORS API ile çalışıyor.\n` +
      `   Üzerine yazmamak için export durduruldu.\n\n` +
      `   Seçenekler:\n` +
      `   • İki sürümü ayrı tutarak yalnızca commit/push yapmak için: --no-export\n` +
      `   • Monorepo app.js içine VibeRuntime.isStandalone dalı ekledikten sonra tekrar çalıştırın\n` +
      `   • Standalone'u yine de monorepodan ezmek için: --force-export\n`
    );
    process.exit(1);
  }
}

function commitAndPushPaths(repoDir, label, scopedPaths, commitMessage, opts) {
  if (!fs.existsSync(path.join(repoDir, '.git'))) {
    console.log(`⏭️  ${label}: git reposu değil, atlanıyor (${repoDir})`);
    return;
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
    console.log(`ℹ️  ${label}: hedef kapsamda değişiklik yok (kapsam dışı değişikliklere dokunulmadı).`);
  }

  if (relevantDirty) {
    if (opts.dryRun) {
      console.log(`[DRY-RUN] ${label}: commit edilecek değişiklikler:\n${relevantDirty}`);
    } else {
      if (scopedPaths) {
        runGit(repoDir, ['add', '--', ...existingScoped], false);
      } else {
        runGit(repoDir, ['add', '-A'], false);
      }
      runGit(repoDir, ['commit', '-m', commitMessage], false);
      console.log(`✅ ${label}: commit edildi.`);
    }
  } else {
    console.log(`✅ ${label}: çalışma ağacı temiz.`);
  }

  if (opts.noPush) {
    console.log(`⏭️  ${label}: --no-push nedeniyle push atlandı.`);
    return;
  }

  let aheadCount = 0;
  try {
    aheadCount = parseInt(runGit(repoDir, ['rev-list', '--count', 'origin/main..HEAD']).trim(), 10) || 0;
  } catch {
    aheadCount = 1;
  }

  if (aheadCount === 0 && !relevantDirty) {
    console.log(`✅ ${label}: origin/main ile güncel.`);
    return;
  }

  if (opts.dryRun) {
    console.log(`[DRY-RUN] ${label}: git push origin main çalıştırılacak.`);
  } else {
    runGit(repoDir, ['push', 'origin', 'main'], false);
    console.log(`🚀 ${label}: origin/main'e push edildi.`);
  }
}

function isTracked(repoDir, relPath) {
  try {
    runGit(repoDir, ['ls-files', '--error-unmatch', relPath]);
    return true;
  } catch {
    return false;
  }
}

function printHelp() {
  console.log(`
VibeCodedApps Tek Komut Yayınlama Aracı (publish.mjs)

Kullanım:
  npm run publish -- --app <id> [-m "mesaj"] [--dry-run] [--no-push] [--no-export] [--force-export]
  npm run publish -- --skills [--skill <ad>] [-m "mesaj"] [--dry-run] [--no-push]

Örnekler:
  npm run publish -- --app qr-studio -m "feat(qr): add vector badge" --dry-run
  npm run publish -- --app kripto-trend --no-export -m "fix(kripto): update chart"
  npm run publish -- --skills -m "docs(rules): add new check"
`);
}

function main() {
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
      console.log(`[DRY-RUN] node scripts/sync-skills.mjs ${skillArgs.join(' ')}`);
    } else {
      runNode(syncScript, skillArgs);
    }

    runNode(path.join(__dirname, 'verify-sync.mjs'), ['--ci']);

    const msg = opts.message || `docs(skills): sync ${opts.skillFilter || 'vibecoding rules'} across monorepo and standalone`;
    const monoScopes = opts.skillFilter
      ? [`skills/${opts.skillFilter}`]
      : ['skills/vibecoding-security-rules', 'skills/vibecoding-kvkk-gdpr'];

    commitAndPushPaths(MONOREPO_ROOT, 'VibeCodedApps (monorepo)', monoScopes, msg, opts);

    const skillDirs = opts.skillFilter
      ? [opts.skillFilter]
      : ['vibecoding-security-rules', 'vibecoding-kvkk-gdpr'];

    for (const s of skillDirs) {
      const saRepo = path.join(WORKSPACE_ROOT, 'standalone-apps', s);
      commitAndPushPaths(saRepo, `standalone/${s}`, null, msg, opts);
    }
    return;
  }

  // App publish mode
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const entry = manifest.find((m) => m.id === opts.appId || m.standaloneDir === opts.appId);
  if (!entry) {
    console.error(`❌ Uygulama scripts/apps-manifest.json içinde bulunamadı: ${opts.appId}`);
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
    console.log(`⏭️  Standalone export atlandı (${entry.id}${!entry.exportable ? ' — exportable=false' : ' — --no-export'}).`);
  }

  console.log('\n🔎 Sürekli doğrulama çalıştırılıyor...');
  runNode(path.join(__dirname, 'verify-sync.mjs'), ['--ci']);

  const msg = opts.message || `chore(${entry.id}): update monorepo and standalone release`;
  const monoScopes = [
    entry.routeFile,
    entry.publicDir,
    'scripts/apps-manifest.json',
  ].filter(Boolean);

  commitAndPushPaths(MONOREPO_ROOT, 'VibeCodedApps (monorepo)', monoScopes, msg, opts);

  if (entry.standaloneDir) {
    const saRepo = path.join(WORKSPACE_ROOT, 'standalone-apps', entry.standaloneDir);
    commitAndPushPaths(saRepo, `standalone/${entry.standaloneDir}`, null, msg, opts);
  }

  console.log('\nℹ️  Not: app.melihkarasu.com canlı sunucusu için gerekirse Pattern D (aaPanel git pull + docker restart vibe-web) ayrıca tetiklenmelidir.');
}

main();
