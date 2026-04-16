#!/usr/bin/env node
/**
 * ONE command: Lighthouse + Playwright + single HTML report.
 * Usage: node scripts/run-report.mjs <url>
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/run-report.mjs <url>');
  process.exit(1);
}

const base = 'latest';
const lhBase = join(root, 'reports', `${base}-lh`);
const probeOut = join(root, 'reports', `${base}-probe.json`);
const outReport = join(root, 'reports', 'readiness-report.html');

const run = (script, args) => {
  const r = spawnSync(process.execPath, [join(__dirname, script), ...args], {
    cwd: root,
    stdio: 'inherit',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run('lighthouse-run.mjs', [url, lhBase]);
run('playwright-probe.mjs', [url, probeOut]);

const lhrJson = `${lhBase}.report.json`;
run('generate-unified-report.mjs', [lhrJson, probeOut, outReport]);

console.log('\n---');
console.log('Single narrative report:', outReport);
console.log('Supporting LHR JSON:', lhrJson);
console.log('Supporting LHR HTML:', `${lhBase}.report.html`);
console.log('Supporting probe JSON:', probeOut);
