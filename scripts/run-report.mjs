#!/usr/bin/env node
/**
 * ONE command: Lighthouse + Playwright + CRO audit + single HTML report.
 * Usage: node scripts/run-report.mjs <url> [industry]
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const url = process.argv[2];
const industry = process.argv[3] ?? 'general';

if (!url) {
  console.error('Usage: node scripts/run-report.mjs <url> [industry]');
  process.exit(1);
}

const lhBase = join(root, 'reports', 'latest-lh');
const probeOut = join(root, 'reports', 'latest-probe.json');
const croOut = join(root, 'reports', 'latest-cro.json');
const outReport = join(root, 'reports', 'readiness-report.html');

const run = (script, args, optional = false) => {
  console.log(`\n${'─'.repeat(60)}`);
  const r = spawnSync(process.execPath, [join(__dirname, script), ...args], {
    cwd: root,
    stdio: 'inherit',
  });
  if (r.status !== 0 && !optional) process.exit(r.status ?? 1);
  return r.status === 0;
};

// 1. Lighthouse (Node API — full run like CLI)
run('lighthouse-run.mjs', [url, lhBase]);

// 2. Playwright probe
run('playwright-probe.mjs', [url, probeOut]);

// 3. CRO audit (optional — skips gracefully if not installed)
const croOk = run('cro-audit-run.mjs', [url, croOut, industry], true);
if (!croOk) {
  console.log('⚠ CRO audit skipped (conversion-ops not installed). Report will omit CRO scores.');
}

// 4. Generate unified HTML report
const lhrJson = `${lhBase}.report.json`;
const reportArgs = [lhrJson, probeOut];
if (croOk) reportArgs.push(croOut);
reportArgs.push(outReport);
run('generate-unified-report.mjs', reportArgs);

console.log(`\n${'═'.repeat(60)}`);
console.log('Single narrative report:', outReport);
console.log('Supporting LHR JSON:', lhrJson);
console.log('Supporting LHR HTML:', `${lhBase}.report.html`);
console.log('Supporting probe JSON:', probeOut);
if (croOk) console.log('Supporting CRO JSON:', croOut);
