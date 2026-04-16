#!/usr/bin/env node
/**
 * Run Lighthouse using the Node API (same engine as the CLI).
 * Produces both JSON and HTML reports with full audit results.
 *
 * Usage: node scripts/lighthouse-run.mjs <url> [output-basename]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const url = process.argv[2];
const outBase = process.argv[3] ?? join(root, 'reports', 'latest-lh');

if (!url) {
  console.error('Usage: node scripts/lighthouse-run.mjs <url> [output-basename]');
  process.exit(1);
}

mkdirSync(dirname(outBase), { recursive: true });

console.log(`Launching Chrome and running Lighthouse on ${url}...`);

const chrome = await chromeLauncher.launch({
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});

try {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: ['json', 'html'],
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });

  if (!result || !result.lhr) {
    console.error('Lighthouse returned no results');
    process.exit(1);
  }

  const [jsonReport, htmlReport] = result.report;

  writeFileSync(`${outBase}.report.json`, jsonReport, 'utf8');
  writeFileSync(`${outBase}.report.html`, htmlReport, 'utf8');

  const lhr = result.lhr;
  const scores = Object.entries(lhr.categories)
    .map(([k, v]) => `${k}: ${v.score != null ? Math.round(v.score * 100) : '—'}`)
    .join(', ');
  console.log(`Lighthouse ${lhr.lighthouseVersion} — ${scores}`);
  console.log(`JSON: ${outBase}.report.json`);
  console.log(`HTML: ${outBase}.report.html`);
} finally {
  await chrome.kill();
}
