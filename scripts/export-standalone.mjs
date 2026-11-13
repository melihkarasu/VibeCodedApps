#!/usr/bin/env node
/**
 * export-standalone.mjs — MK Studio v2 & Privacy-by-Design Standalone Exporter
 *
 * Tek kaynaklı VibeCodedApps monoreposundan bağımsız (zero-backend, zero-login,
 * self-hosted fonts, localStorage-tabanlı) GitHub Pages sürümlerini üretir.
 *
 * Usage:
 *   node scripts/export-standalone.mjs --app qr-studio [--dry-run] [--no-verify]
 *   node scripts/export-standalone.mjs --app kvkk-gdpr-scanner --out-dir /tmp/test-sa
 *   node scripts/export-standalone.mjs --all [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MONOREPO_ROOT = path.resolve(__dirname, '..');
const WORKSPACE_ROOT = path.resolve(MONOREPO_ROOT, '..');
const MANIFEST_PATH = path.join(__dirname, 'apps-manifest.json');

const MK_FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%231E2028'/%3E%3Cstop offset='100%25' stop-color='%23090A0F'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='40' height='40' rx='10' fill='url(%23bg)' stroke='%232E323E' stroke-width='1.5'/%3E%3Cpath d='M7.5 27.5V12.5H10.6L14.5 20.2L18.4 12.5H21.5V27.5H18.6V17.6L15.4 23.8H13.6L10.4 17.6V27.5H7.5Z' fill='%23FFFFFF'/%3E%3Cpath d='M24.2 27.5V12.5H27.2V19.2L32.8 12.5H36.5L30.5 19.4L36.8 27.5H33.1L28.4 21.3L27.2 22.7V27.5H24.2Z' fill='%23FFFFFF'/%3E%3Ccircle cx='35.2' cy='9.2' r='2' fill='%23FA520F'/%3E%3C/svg%3E";

function parseArgs(argv) {
  const opts = {
    appId: null,
    all: false,
    dryRun: false,
    noVerify: false,
    outBase: path.join(WORKSPACE_ROOT, 'standalone-apps'),
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--app' && argv[i + 1]) opts.appId = argv[++i];
    else if (a === '--all') opts.all = true;
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--no-verify') opts.noVerify = true;
    else if (a === '--out-dir' && argv[i + 1]) opts.outBase = path.resolve(argv[++i]);
  }
  return opts;
}

/**
 * Extract (title, content, extraHead) safely by running the Express route factory
 * against a mock pageTemplate and mock req/res — handles dynamic template interpolations
 * (like numpadButtonsHtml in sudoku.js) cleanly.
 */
function extractRoutePayload(routeAbsPath, appName) {
  if (!fs.existsSync(routeAbsPath)) {
    throw new Error(`Route file not found: ${routeAbsPath}`);
  }
  const code = fs.readFileSync(routeAbsPath, 'utf8');

  let captured = null;
  const mockPageTemplate = (title, content, extraHead = '') => {
    captured = { title, content, extraHead };
    return '<!-- captured -->';
  };

  // Provide minimal Express/Node stubs for route files that register router.get(...)
  const registeredHandlers = [];
  const makeRouter = () => ({
    get: (_path, handler) => registeredHandlers.push(handler),
    post: () => {},
    use: () => {},
  });
  const mockModule = { exports: {} };
  const routeDir = path.dirname(routeAbsPath);
  const customRequire = (id) => {
    if (id === 'express') {
      const fn = () => makeRouter();
      fn.Router = makeRouter;
      return fn;
    }
    if (id.startsWith('.')) {
      return requireFallback(path.resolve(routeDir, id));
    }
    return {};
  };

  const realRequire = createRequire(routeAbsPath);
  const safeRequire = (id) => {
    if (id === 'express') {
      const fn = () => makeRouter();
      fn.Router = makeRouter;
      return fn;
    }
    if (id.startsWith('.')) {
      return realRequire(id);
    }
    return realRequire(id);
  };

  function requireFallback(p) {
    return realRequire(p);
  }

  try {
    const wrapped = `(function(exports, require, module, __filename, __dirname) {\n${code}\n})`;
    const fn = vm.runInNewContext(wrapped, {
      console,
      Buffer,
      process,
      URL,
      URLSearchParams,
      AbortSignal,
      fetch: async () => ({ ok: false, json: async () => ({}) }),
      setTimeout,
      clearTimeout,
    });
    fn(mockModule.exports, safeRequire, mockModule, routeAbsPath, routeDir);

    const exported = mockModule.exports;
    if (typeof exported === 'function') {
      const maybeHandler = exported(mockPageTemplate);
      if (typeof maybeHandler === 'function') {
        maybeHandler(
          { query: {}, params: {}, headers: {}, path: '/' },
          { send: () => {}, status: () => ({ send: () => {}, json: () => {} }), json: () => {} }
        );
      } else if (registeredHandlers.length > 0) {
        registeredHandlers[0](
          { query: {}, params: {}, headers: {}, path: '/' },
          { send: () => {}, status: () => ({ send: () => {}, json: () => {} }), json: () => {} }
        );
      }
    }
  } catch (err) {
    // Fallback regex extraction if route executes unsupported side effects
    const contentMatch = code.match(/const\s+content\s*=\s*`([\s\S]*?)`;/);
    const headMatch = code.match(/const\s+extraHead\s*=\s*`([\s\S]*?)`;/);
    if (contentMatch) {
      captured = {
        title: appName,
        content: contentMatch[1],
        extraHead: headMatch ? headMatch[1] : '',
      };
    } else {
      throw new Error(`Failed to extract route HTML from ${routeAbsPath}: ${err.message}`);
    }
  }

  if (!captured || !captured.content) {
    throw new Error(`No pageTemplate() payload captured from ${routeAbsPath}`);
  }
  return captured;
}

function sanitizeStandaloneHtml(html, publicDirRel) {
  let out = html;

  // Remove monorepo "Vitrine Dön" link + trailing divider
  out = out.replace(/<a\s+href="\/"[^>]*>[\s\S]*?Vitrine Dön[\s\S]*?<\/a>\s*(?:<span[^>]*>\s*\|\s*<\/span>)?/gi, '');
  // Remove auth navigation / user badges / login-only blocks
  out = out.replace(/<div[^>]+id=["'](?:auth-nav|qr-user-badge|user-sync-badge)["'][^>]*>[\s\S]*?<\/div>/gi, '');
  // Remove inline auth/user-data script tags if any
  out = out.replace(/<script[^>]*src=["']\/static\/js\/core\.js[^"']*["'][^>]*><\/script>/gi, '');
  // Rewrite /static/apps/<dir>/... -> relative css/... or js/...
  if (publicDirRel) {
    const appFolder = path.basename(publicDirRel);
    const cssRe = new RegExp(`/static/apps/${appFolder}/app\\.css(?:\\?[^"']*)?`, 'gi');
    const jsRe = new RegExp(`/static/apps/${appFolder}/app\\.js(?:\\?[^"']*)?`, 'gi');
    out = out.replace(cssRe, 'css/app.css');
    out = out.replace(jsRe, 'js/app.js');
  }
  // Remove duplicate app.js script tag inside body if already injected at bottom cleanly
  return out;
}

function transformAppJsForStandalone(jsContent, appId) {
  let out = jsContent;

  // Standalone is 100% independent (zero app.melihkarasu.com or Supabase login dependency).
  // Ensure standalone never fails if monorepo core.js helpers (syncAppUserData/saveAppUserData/isLoggedIn) are referenced.
  const shim = [
    `/* Standalone Runtime Shim (${appId}) — zero-backend, zero-login, localStorage-only via VibeRuntime */`,
    `window.__VIBE_STANDALONE__ = true;`,
    `window.__VIBE_APP_ID__ = ${JSON.stringify(appId)};`,
    `if (typeof window.isLoggedIn !== 'function') window.isLoggedIn = function () { return false; };`,
    `if (typeof window.getCurrentUser !== 'function') window.getCurrentUser = function () { return null; };`,
    `if (typeof window.syncAppUserData !== 'function') window.syncAppUserData = async function () { return null; };`,
    `if (typeof window.saveAppUserData !== 'function') window.saveAppUserData = async function (aid, k, v) {`,
    `  return window.VibeRuntime ? window.VibeRuntime.storage.set(aid, k, v) : false;`,
    `};`,
    '',
  ].join('\n');

  if (!out.includes('window.__VIBE_STANDALONE__')) {
    out = `${shim}\n${out}`;
  }
  return out;
}

function buildStandaloneHtml({ title, extraHead, content, appId, hasAppCss, hasAppJs, hasInlineScript }) {
  const cleanHead = sanitizeStandaloneHtml(extraHead || '', null)
    // Remove Google Fonts if any route injected it manually
    .replace(/<link[^>]+fonts\.googleapis\.com[^>]*>/gi, '')
    .replace(/<link[^>]+fonts\.gstatic\.com[^>]*>/gi, '')
    // Rewrite any /static/apps/<x>/app.css or app.js already handled; strip duplicate local links we include deterministically
    .replace(/<link[^>]+href=["']css\/app\.css["'][^>]*>/gi, '')
    .replace(/<script[^>]+src=["']js\/app\.js["'][^>]*><\/script>/gi, '')
    .trim();

  const appCssLink = hasAppCss ? '  <link rel="stylesheet" href="css/app.css">\n' : '';
  const appJsTag = (hasAppJs && !hasInlineScript) ? '  <script src="js/app.js" defer></script>\n' : '';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${escapeHtml(title)} — VibeCodedApps Standalone</title>
  <!-- Self-Hosted Local Fonts (KVKK m.9 & GDPR Art. 44 — Zero External Font CDN) -->
  <link rel="stylesheet" href="vendor/fonts/fonts.css">
  <!-- Precompiled Tailwind CSS + MK Studio Mistral Theme -->
  <link rel="stylesheet" href="css/tailwind.min.css">
  <link rel="stylesheet" href="css/mistral-theme.css">
${appCssLink}  <link rel="icon" type="image/svg+xml" href="${MK_FAVICON}">
  <script>
    window.__VIBE_STANDALONE__ = true;
    window.__VIBE_APP_ID__ = ${JSON.stringify(appId)};
  </script>
  <script src="js/vibe-runtime.js"></script>
${cleanHead ? '  ' + cleanHead.split('\n').join('\n  ') + '\n' : ''}</head>
<body class="bg-mistral-canvas text-mistral-ink min-h-screen flex flex-col antialiased selection:bg-mistral-orange selection:text-white">
  <main class="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
${content.trim()}
  </main>

  <div class="sunset-stripe mt-auto"></div>
  <footer class="bg-mistral-cream border-t border-mistral-beige-deep py-5 px-4 sm:px-6 text-mistral-slate text-xs">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
      <span>MK Studio · Zero-Backend Standalone Edition (Veriler yalnızca tarayıcınızda saklanır)</span>
      <a href="https://github.com/melihkarasu/VibeCodedApps" target="_blank" rel="noopener noreferrer" class="hover:text-mistral-orange transition font-medium">VibeCodedApps Monorepo &rarr;</a>
    </div>
  </footer>
${appJsTag}</body>
</html>
`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function copySelfHostedAssets(targetDir, dryRun) {
  const fontsSrcDir = path.join(MONOREPO_ROOT, 'web/public/vendor/fonts');
  const fontsDstDir = path.join(targetDir, 'vendor/fonts');
  const cssDstDir = path.join(targetDir, 'css');
  const jsDstDir = path.join(targetDir, 'js');

  if (dryRun) return;

  fs.mkdirSync(fontsDstDir, { recursive: true });
  fs.mkdirSync(cssDstDir, { recursive: true });
  fs.mkdirSync(jsDstDir, { recursive: true });

  for (const file of fs.readdirSync(fontsSrcDir)) {
    const srcPath = path.join(fontsSrcDir, file);
    const dstPath = path.join(fontsDstDir, file);
    if (file === 'fonts.css') {
      const css = fs.readFileSync(srcPath, 'utf8').replace(/url\(\/static\/vendor\/fonts\//g, 'url(./');
      fs.writeFileSync(dstPath, css, 'utf8');
    } else if (file.endsWith('.woff2')) {
      fs.copyFileSync(srcPath, dstPath);
    }
  }

  fs.copyFileSync(path.join(MONOREPO_ROOT, 'web/public/css/tailwind.min.css'), path.join(cssDstDir, 'tailwind.min.css'));
  fs.copyFileSync(path.join(MONOREPO_ROOT, 'web/public/css/mistral-theme.css'), path.join(cssDstDir, 'mistral-theme.css'));
  fs.copyFileSync(path.join(MONOREPO_ROOT, 'web/public/js/vibe-runtime.js'), path.join(jsDstDir, 'vibe-runtime.js'));
  fs.writeFileSync(path.join(targetDir, '.nojekyll'), '', 'utf8');
}

function exportApp(entry, opts) {
  if (!entry.exportable) {
    console.log(`⏭️  Skipping non-exportable app: ${entry.id}`);
    return false;
  }

  const routeAbs = path.join(MONOREPO_ROOT, entry.routeFile);
  const targetDir = path.join(opts.outBase, entry.standaloneDir);
  const payload = extractRoutePayload(routeAbs, entry.name);

  let cleanHead = sanitizeStandaloneHtml(payload.extraHead, entry.publicDir);
  let cleanContent = sanitizeStandaloneHtml(payload.content, entry.publicDir);

  const pubDirAbs = entry.publicDir ? path.join(MONOREPO_ROOT, entry.publicDir) : null;
  const appCssSrc = pubDirAbs ? path.join(pubDirAbs, 'app.css') : null;
  const appJsSrc = pubDirAbs ? path.join(pubDirAbs, 'app.js') : null;
  const hasAppCss = Boolean(appCssSrc && fs.existsSync(appCssSrc));
  const hasAppJs = Boolean(appJsSrc && fs.existsSync(appJsSrc));
  const hasInlineScript = cleanContent.includes('src="js/app.js"') || cleanHead.includes('src="js/app.js"');

  const html = buildStandaloneHtml({
    title: payload.title || entry.name,
    extraHead: cleanHead,
    content: cleanContent,
    appId: entry.id,
    hasAppCss,
    hasAppJs,
    hasInlineScript,
  });

  if (opts.dryRun) {
    console.log(`[DRY-RUN] Would export ${entry.id} -> ${targetDir} (css=${hasAppCss}, js=${hasAppJs})`);
    return true;
  }

  copySelfHostedAssets(targetDir, false);
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');

  if (hasAppCss) {
    fs.copyFileSync(appCssSrc, path.join(targetDir, 'css/app.css'));
  }
  if (hasAppJs) {
    const rawJs = fs.readFileSync(appJsSrc, 'utf8');
    fs.writeFileSync(path.join(targetDir, 'js/app.js'), transformAppJsForStandalone(rawJs, entry.id), 'utf8');
  }

  console.log(`✅ Exported ${entry.id} -> ${targetDir}`);
  return true;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.appId && !opts.all) {
    console.error('Usage: node scripts/export-standalone.mjs --app <id> | --all [--dry-run] [--out-dir <dir>]');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const targets = opts.all
    ? manifest
    : manifest.filter((m) => m.id === opts.appId || m.standaloneDir === opts.appId);

  if (targets.length === 0) {
    console.error(`App not found in scripts/apps-manifest.json: ${opts.appId}`);
    process.exit(1);
  }

  let count = 0;
  for (const entry of targets) {
    if (exportApp(entry, opts)) count += 1;
  }

  console.log(`\n📦 Processed ${count} standalone target(s).`);

  const verifyScript = path.join(__dirname, 'verify-sync.mjs');
  if (!opts.dryRun && !opts.noVerify && fs.existsSync(verifyScript)) {
    console.log('\n🔎 Triggering continuous verification...');
    execFileSync(process.execPath, [verifyScript], { stdio: 'inherit' });
  }
}

main();
