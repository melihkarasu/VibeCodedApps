#!/usr/bin/env node
/**
 * sync-skills.mjs — Single Source of Truth Skill Generator & Syncer
 *
 * Canonical source: vibe-coded-apps/skills/<skill-name>/SKILL.md
 * Generates: README.md, AGENTS.md, CLAUDE.md, .cursorrules, and <RuleFile>.md
 * Optionally syncs to:
 *   - standalone-apps/<skill-name>/
 *   - ~/.openclaw/workspace/skills/<skill-name>/SKILL.md
 *
 * Usage:
 *   node scripts/sync-skills.mjs [--check] [--no-external] [--no-verify]
 *   node scripts/sync-skills.mjs --skill vibecoding-security-rules --standalone-target /tmp/sec
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MONOREPO_ROOT = path.resolve(__dirname, '..');
const WORKSPACE_ROOT = path.resolve(MONOREPO_ROOT, '..');

const SKILLS_CATALOG = [
  {
    name: 'vibecoding-security-rules',
    ruleFileName: 'VibeCoding_Security_Rules.md',
  },
  {
    name: 'vibecoding-kvkk-gdpr',
    ruleFileName: 'VibeCoding_KVKK_GDPR_Rules.md',
  },
];

const COMPANION_FILES = ['README.md', 'AGENTS.md', 'CLAUDE.md', '.cursorrules'];

function parseArgs(argv) {
  const opts = {
    check: false,
    noExternal: false,
    noVerify: false,
    skillFilter: null,
    standaloneDir: path.join(WORKSPACE_ROOT, 'standalone-apps'),
    standaloneTarget: null,
    workspaceSkillsDir: path.join(WORKSPACE_ROOT, 'skills'),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--check') opts.check = true;
    else if (arg === '--no-external') opts.noExternal = true;
    else if (arg === '--no-verify') opts.noVerify = true;
    else if (arg === '--skill' && argv[i + 1]) opts.skillFilter = argv[++i];
    else if (arg === '--standalone-dir' && argv[i + 1]) opts.standaloneDir = path.resolve(argv[++i]);
    else if (arg === '--standalone-target' && argv[i + 1]) opts.standaloneTarget = path.resolve(argv[++i]);
    else if (arg === '--workspace-skills-dir' && argv[i + 1]) opts.workspaceSkillsDir = path.resolve(argv[++i]);
  }
  return opts;
}

function stripYamlFrontmatter(skillContent, skillName) {
  const normalized = skillContent.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n[\s\S]*?\n---\n*/);
  if (!match) {
    throw new Error(`[${skillName}] SKILL.md missing valid YAML frontmatter (--- ... ---).`);
  }
  return normalized.slice(match[0].length);
}

function syncFile(targetPath, expectedContent, checkOnly, drifts, updated) {
  const exists = fs.existsSync(targetPath);
  const current = exists ? fs.readFileSync(targetPath, 'utf8') : null;
  if (current === expectedContent) {
    return;
  }
  if (checkOnly) {
    drifts.push(targetPath);
    return;
  }
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, expectedContent, 'utf8');
  updated.push(targetPath);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const selectedSkills = opts.skillFilter
    ? SKILLS_CATALOG.filter((s) => s.name === opts.skillFilter)
    : SKILLS_CATALOG;

  if (selectedSkills.length === 0) {
    console.error(`Unknown skill filter: ${opts.skillFilter}`);
    process.exit(1);
  }

  const drifts = [];
  const updated = [];

  for (const skill of selectedSkills) {
    const monorepoSkillDir = path.join(MONOREPO_ROOT, 'skills', skill.name);
    const sourceSkillPath = path.join(monorepoSkillDir, 'SKILL.md');
    if (!fs.existsSync(sourceSkillPath)) {
      console.error(`Missing canonical SKILL.md: ${sourceSkillPath}`);
      process.exit(1);
    }

    const skillContent = fs.readFileSync(sourceSkillPath, 'utf8').replace(/\r\n/g, '\n');
    const bodyContent = stripYamlFrontmatter(skillContent, skill.name);

    const targetsInRepo = [...COMPANION_FILES, skill.ruleFileName];

    // 1. Sync derived files inside monorepo skills/<name>/
    if (!opts.standaloneTarget) {
      for (const fileName of targetsInRepo) {
        syncFile(path.join(monorepoSkillDir, fileName), bodyContent, opts.check, drifts, updated);
      }
    }

    // 2. Sync to explicit --standalone-target (CI single-repo push mode)
    if (opts.standaloneTarget) {
      syncFile(path.join(opts.standaloneTarget, 'SKILL.md'), skillContent, opts.check, drifts, updated);
      for (const fileName of targetsInRepo) {
        syncFile(path.join(opts.standaloneTarget, fileName), bodyContent, opts.check, drifts, updated);
      }
    } else if (!opts.noExternal) {
      // 3. Sync to local standalone-apps/<skill-name>/ if present
      const localStandaloneDir = path.join(opts.standaloneDir, skill.name);
      if (fs.existsSync(localStandaloneDir)) {
        syncFile(path.join(localStandaloneDir, 'SKILL.md'), skillContent, opts.check, drifts, updated);
        for (const fileName of targetsInRepo) {
          syncFile(path.join(localStandaloneDir, fileName), bodyContent, opts.check, drifts, updated);
        }
      }

      // 4. Sync to local OpenClaw workspace skills/<skill-name>/SKILL.md if parent exists
      if (fs.existsSync(opts.workspaceSkillsDir)) {
        const wsSkillFile = path.join(opts.workspaceSkillsDir, skill.name, 'SKILL.md');
        syncFile(wsSkillFile, skillContent, opts.check, drifts, updated);
      }
    }
  }

  if (opts.check) {
    if (drifts.length > 0) {
      console.error('❌ Skill drift detected (canonical source: skills/<name>/SKILL.md):');
      for (const p of drifts) console.error(`  - ${p}`);
      process.exit(1);
    }
    console.log('✅ All skill targets match canonical SKILL.md.');
    return;
  }

  if (updated.length > 0) {
    console.log(`✅ Synced ${updated.length} file(s) from canonical SKILL.md:`);
    for (const p of updated) console.log(`  - ${p}`);
  } else {
    console.log('✅ Skills already up to date (0 files changed).');
  }

  // Trigger continuous verification after local sync unless skipped
  const verifyScript = path.join(__dirname, 'verify-sync.mjs');
  if (!opts.noVerify && !opts.standaloneTarget && fs.existsSync(verifyScript)) {
    console.log('\n🔎 Running continuous verification...');
    execFileSync(process.execPath, [verifyScript, ...(opts.noExternal ? ['--ci'] : [])], {
      stdio: 'inherit',
    });
  }
}

main();
