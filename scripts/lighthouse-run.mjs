#!/usr/bin/env node
/**
 * Stock Lighthouse only (no third-party Lighthouse plugins).
 * Usage: node scripts/lighthouse-run.mjs <url> <output-basename-without-extension>
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const url = process.argv[2];
const outBase = process.argv[3] ?? join(root, 'reports', 'lighthouse-latest');

if (!url) {
  console.error('Usage: node scripts/lighthouse-run.mjs <url> [output-basename]');
  process.exit(1);
}

const args = [
  'lighthouse',
  url,
  '--output=json',
  '--output=html',
  `--output-path=${outBase}`,
  '--chrome-flags=--headless=new',
  '--quiet',
];

const child = spawn('npx', args, { cwd: root, stdio: 'inherit', env: { ...process.env } });
child.on('exit', (code) => process.exit(code ?? 1));
