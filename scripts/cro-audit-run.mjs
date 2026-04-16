#!/usr/bin/env node
/**
 * Run Eric Siu's cro_audit.py and save the JSON output.
 * Requires: ai-marketing-skills/conversion-ops installed with a Python venv.
 *
 * Usage: node scripts/cro-audit-run.mjs <url> [out-json-path] [industry]
 */
import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const url = process.argv[2];
const outPath = process.argv[3] ?? join(root, 'reports', 'latest-cro.json');
const industry = process.argv[4] ?? 'general';

if (!url) {
  console.error('Usage: node scripts/cro-audit-run.mjs <url> [out-json] [industry]');
  process.exit(1);
}

mkdirSync(dirname(outPath), { recursive: true });

const croDir = join(root, '..', 'ai-marketing-skills', 'conversion-ops');
const venvPython = join(croDir, '.venv', 'bin', 'python3');
const croScript = join(croDir, 'cro_audit.py');

if (!existsSync(croScript)) {
  console.error(`cro_audit.py not found at ${croScript}`);
  console.error('Clone: git clone https://github.com/ericosiu/ai-marketing-skills.git ../ai-marketing-skills');
  process.exit(1);
}

const python = existsSync(venvPython) ? venvPython : 'python3';

console.log(`Running CRO audit on ${url} (industry: ${industry})...`);

const result = spawnSync(python, [
  croScript,
  '--url', url,
  '--industry', industry,
  '--json',
], {
  cwd: croDir,
  encoding: 'utf8',
  timeout: 60000,
});

if (result.error) {
  console.error(`Failed to run cro_audit.py: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`cro_audit.py exited with code ${result.status}`);
  if (result.stderr) console.error(result.stderr);
  process.exit(1);
}

const jsonOutput = result.stdout.trim();
let cro;
try {
  cro = JSON.parse(jsonOutput);
} catch (e) {
  console.error(`Failed to parse CRO JSON output: ${e.message}`);
  console.error('Raw output:', jsonOutput.slice(0, 500));
  process.exit(1);
}

writeFileSync(outPath, JSON.stringify(cro, null, 2), 'utf8');
console.log(`CRO report saved: ${outPath}`);
console.log(`Overall score: ${cro.overall_score}/100 (${cro.letter_grade})`);

const dims = cro.dimensions || {};
for (const [key, dim] of Object.entries(dims)) {
  console.log(`  ${dim.name}: ${dim.score}/100`);
}
