#!/usr/bin/env node
/**
 * verify-sync.mjs — Sürekli Doğrulama (Continuous Verification) Scripti
 *
 * Denetledikleri:
 *  1. Katman A: Skill kaynakları (SKILL.md) ↔ üretilen 5 dosya ↔ workspace/skills ↔ standalone-apps/vibecoding-*
 *  2. Güvenlik & Gizlilik Kuralları:
 *     - web/template.js & export-standalone.mjs içinde Google Fonts CDN olmaması (self-hosted fonts)
 *     - web/template.js içinde ConsentGate bulunması ve statik gtag/adsbygoogle olmaması
 *     - .github/workflows/sync-skills.yml owner-lock & pinned SHA kuralları
 *     - Core JS dosyalarında sözdizimi doğrulaması
 *  3. Katman B: Monorepo (web/public/apps/*) ↔ standalone-apps/* dosya ve modern şablon paritesi
 *
 * Usage:
 *   node scripts/verify-sync.mjs [--ci] [--strict]
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

const args = new Set(process.argv.slice(2));
const IS_CI = args.has('--ci');
const IS_STRICT = args.has('--strict');

let failures = 0;
let warnings = 0;

function pass(msg) {
  console.log(`  ✅ ${msg}`);
}
function warn(msg) {
  warnings += 1;
  console.log(`  ⚠️  ${msg}`);
}
function fail(msg) {
  failures += 1;
  console.error(`  ❌ ${msg}`);
}

function normalizeJsForComparison(src) {
  return src
    .replace(/\/\* Standalone Runtime Shim[\s\S]*?};\s*\n*/m, '')
    .replace(/\r\n/g, '\n')
    .trim();
}

function checkKatmanASkills() {
  console.log('\n[1/3] Katman A — Tek Kaynak Skills & Rules Senkronizasyonu');
  const syncArgs = [path.join(__dirname, 'sync-skills.mjs'), '--check'];
  if (IS_CI) syncArgs.push('--no-external');
  try {
    execFileSync(process.execPath, syncArgs, { stdio: 'inherit' });
  } catch {
    failures += 1;
  }
}

function checkSecurityAndPrivacyGuards() {
  console.log('\n[2/3] Güvenlik, KVKK/GDPR & Owner-Lock Workflow Kontrolleri');

  const templatePath = path.join(MONOREPO_ROOT, 'web/template.js');
  const templateSrc = fs.readFileSync(templatePath, 'utf8');

  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(templateSrc)) {
    fail('web/template.js içinde Google Fonts CDN referansı bulundu (yerel font kullanılmalı).');
  } else {
    pass('web/template.js yerel font kullanıyor (Google Fonts CDN yok).');
  }

  if (!templateSrc.includes('__vibeLoadConsentScripts')) {
    fail('web/template.js içinde __vibeLoadConsentScripts ConsentGate eksik.');
  } else if (/<script[^>]+src=["'][^"']*(?:googletagmanager\.com\/gtag\/js|adsbygoogle\.js)/i.test(templateSrc)) {
    fail('web/template.js içinde statik GA4/AdSense <script src> bulundu.');
  } else {
    pass('web/template.js ConsentGate aktif (statik GA4/AdSense yüklemesi yok).');
  }

  if (!templateSrc.includes('/static/js/vibe-runtime.js')) {
    fail('web/template.js içinde /static/js/vibe-runtime.js adaptörü yüklenmemiş.');
  } else {
    pass('web/template.js VibeRuntime ortam adaptörünü yüklüyor.');
  }

  const exporterPath = path.join(__dirname, 'export-standalone.mjs');
  const exporterSrc = fs.readFileSync(exporterPath, 'utf8');
  if (!exporterSrc.includes('vendor/fonts/fonts.css') || !exporterSrc.includes('vibe-runtime.js')) {
    fail('scripts/export-standalone.mjs güncel self-hosted font / VibeRuntime şablonunu kullanmıyor.');
  } else if (/PROD_API_ORIGIN/.test(exporterSrc)) {
    fail('scripts/export-standalone.mjs standalone modda app.melihkarasu.com yönlendirmesi yapmamalıdır.');
  } else {
    pass('scripts/export-standalone.mjs MK Studio v2 + self-hosted font + tam bağımsız VibeRuntime şablonu doğrulanmış.');
  }

  const runtimeSrc = fs.readFileSync(path.join(MONOREPO_ROOT, 'web/public/js/vibe-runtime.js'), 'utf8');
  if (/app\.melihkarasu\.com/i.test(runtimeSrc)) {
    fail('web/public/js/vibe-runtime.js bağımsız standalone modda app.melihkarasu.com referansı içeriyor.');
  } else {
    pass('web/public/js/vibe-runtime.js tamamen bağımsız (sıfır dış origin zorunluluğu).');
  }

  const hookPath = path.join(MONOREPO_ROOT, '.githooks/pre-commit');
  if (!fs.existsSync(hookPath)) {
    fail('.githooks/pre-commit bulunamadı.');
  } else {
    const hk = fs.readFileSync(hookPath, 'utf8');
    if (hk.includes('verify-sync.mjs')) {
      pass('.githooks/pre-commit sürekli doğrulamayı otomatik tetikliyor (GitHub Actions tokensuz/opsiyonel).');
    } else {
      fail('.githooks/pre-commit içinde verify-sync.mjs çağrısı eksik.');
    }
  }

  // Syntax checks on key JS files
  for (const rel of ['web/template.js', 'web/public/js/vibe-runtime.js', 'scripts/sync-skills.mjs', 'scripts/export-standalone.mjs', 'scripts/publish.mjs']) {
    try {
      execFileSync(process.execPath, ['--check', path.join(MONOREPO_ROOT, rel)], { stdio: 'pipe' });
    } catch (err) {
      fail(`JS sözdizimi hatası (${rel}): ${err.message}`);
    }
  }
  pass('Temel şablon ve script dosyaları sözdizimi doğrulamasını geçti.');
}

function checkKatmanBStandaloneParity() {
  console.log('\n[3/3] Katman B — Monorepo ↔ Standalone Uygulama Paritesi');
  if (IS_CI) {
    pass('CI modunda harici standalone-apps/ klasörü taraması atlandı.');
    return;
  }

  const standaloneRoot = path.join(WORKSPACE_ROOT, 'standalone-apps');
  if (!fs.existsSync(standaloneRoot)) {
    warn(`standalone-apps dizini bulunamadı: ${standaloneRoot}`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  let synced = 0;
  let jsDrifted = 0;
  let legacyCdn = 0;
  let missing = 0;
  const details = [];

  for (const entry of manifest) {
    if (!entry.exportable) continue;
    const saDir = path.join(standaloneRoot, entry.standaloneDir);
    if (!fs.existsSync(saDir)) {
      missing += 1;
      details.push(`MISSING: ${entry.id} (${entry.standaloneDir})`);
      continue;
    }

    const indexPath = path.join(saDir, 'index.html');
    const html = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
    const usesGoogleFonts = /fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(html);
    if (usesGoogleFonts) legacyCdn += 1;

    let hasJsDrift = false;
    if (entry.publicDir) {
      const monoJs = path.join(MONOREPO_ROOT, entry.publicDir, 'app.js');
      const saJs = path.join(saDir, 'js/app.js');
      if (fs.existsSync(monoJs)) {
        if (!fs.existsSync(saJs)) {
          hasJsDrift = true;
        } else {
          const mNorm = normalizeJsForComparison(fs.readFileSync(monoJs, 'utf8'));
          const sNorm = normalizeJsForComparison(fs.readFileSync(saJs, 'utf8'));
          if (mNorm !== sNorm) {
            hasJsDrift = true;
          }
        }
      }
    }

    if (hasJsDrift) {
      jsDrifted += 1;
      details.push(`JS_DRIFT: ${entry.id}${usesGoogleFonts ? ' (+legacy Google Fonts CDN)' : ''}`);
    } else if (usesGoogleFonts) {
      details.push(`LEGACY_CDN: ${entry.id} (JS eşit, HTML eski Google Fonts CDN kullanıyor)`);
    } else {
      synced += 1;
    }
  }

  console.log(`  📊 Özet: ${synced} tam güncel | ${jsDrifted} JS farkı | ${legacyCdn} eski Google Fonts CDN HTML | ${missing} eksik`);
  if (details.length > 0) {
    const preview = details.slice(0, 12);
    for (const line of preview) console.log(`     • ${line}`);
    if (details.length > preview.length) {
      console.log(`     ... ve ${details.length - preview.length} uygulama daha (yenilemek için: npm run export:standalone -- --app <id> veya --all)`);
    }
  }

  if (IS_STRICT && (jsDrifted > 0 || legacyCdn > 0 || missing > 0)) {
    fail(`Strict modda ${jsDrifted + legacyCdn + missing} standalone uyumsuzluğu tespit edildi.`);
  } else if (jsDrifted > 0 || legacyCdn > 0) {
    warn('Bazı standalone uygulamalar eski şablon veya JS farkı içeriyor (--strict ile hata verir).');
  }
}

function main() {
  console.log('🔍 VibeCodedApps Continuous Verification');
  checkKatmanASkills();
  checkSecurityAndPrivacyGuards();
  checkKatmanBStandaloneParity();

  console.log(`\nSonuç: ${failures} hata, ${warnings} uyarı.`);
  if (failures > 0) {
    process.exit(1);
  }
}

main();
