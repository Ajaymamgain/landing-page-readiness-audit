#!/usr/bin/env node
/**
 * Run Lighthouse (stock) + Playwright probe with a shared basename.
 * Usage: node scripts/full-audit.mjs <url> [basename]
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const url = process.argv[2];
const base = process.argv[3] ?? 'run';

if (!url) {
  console.error('Usage: node scripts/full-audit.mjs <url> [basename]');
  process.exit(1);
}

const lhBase = join(root, 'reports', `${base}-lh`);
const probeOut = join(root, 'reports', `${base}-probe.json`);

const lh = spawnSync(process.execPath, [join(__dirname, 'lighthouse-run.mjs'), url, lhBase], {
  cwd: root,
  stdio: 'inherit',
});
if (lh.status !== 0) process.exit(lh.status ?? 1);

const pr = spawnSync(process.execPath, [join(__dirname, 'playwright-probe.mjs'), url, probeOut], {
  cwd: root,
  stdio: 'inherit',
});
if (pr.status !== 0) process.exit(pr.status ?? 1);

console.log('\nArtifacts:');
console.log(`  ${lhBase}.report.json`);
console.log(`  ${lhBase}.report.html`);
console.log(`  ${probeOut}`);
