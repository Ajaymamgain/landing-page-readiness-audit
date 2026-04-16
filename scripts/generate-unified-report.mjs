#!/usr/bin/env node
/**
 * Build ONE consolidated HTML report from Lighthouse LHR + Playwright probe JSON.
 * Does not use lighthouse-plugin-publisher-ads; includes a manual checklist aligned
 * with googleads/publisher-ads-lighthouse-plugin audit *concepts*.
 *
 * Usage: node scripts/generate-unified-report.mjs <lhr.json> <probe.json> [out.html]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const lhrPath = process.argv[2];
const probePath = process.argv[3];
const outHtml = process.argv[4] ?? join(root, 'reports', 'readiness-report.html');

if (!lhrPath || !probePath) {
  console.error('Usage: node scripts/generate-unified-report.mjs <lhr.json> <probe.json> [out.html]');
  process.exit(1);
}

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const lhr = JSON.parse(readFileSync(lhrPath, 'utf8'));
const probe = JSON.parse(readFileSync(probePath, 'utf8'));

const cat = (k) => (lhr.categories[k]?.score != null ? Math.round(lhr.categories[k].score * 100) : '—');
const perf = cat('performance');
const a11y = cat('accessibility');
const bp = cat('best-practices');
const seo = cat('seo');

const A = (id) => lhr.audits[id];
const lcp = A('largest-contentful-paint');
const cls = A('cumulative-layout-shift');
const tbt = A('total-blocking-time');
const inp = A('interaction-to-next-paint');

const lcpDisp = esc(lcp?.displayValue ?? '—');
const clsDisp = esc(cls?.displayValue ?? '—');
const tbtDisp = esc(tbt?.displayValue ?? '—');
const inpDisp = inp?.displayValue ? esc(inp.displayValue) : 'Not in this LHR';

const worst = [];
for (const [id, au] of Object.entries(lhr.audits)) {
  if (!au || au.score == null) continue;
  if (typeof au.score !== 'number') continue;
  if (au.score >= 0.9) continue;
  worst.push({ id, title: au.title, score: au.score, dv: au.displayValue || '' });
}
worst.sort((a, b) => a.score - b.score);
const topWorst = worst.slice(0, 12);

const probeAdCount = probe.adRelatedRequestCount ?? 0;
const gptLikely = probe.interpretation?.gptLikelyLoaded === true;
const hasErr = probe.interpretation?.hasConsoleErrors === true;

let verdict = 'Needs manual review';
let verdictDetail =
  'Stock Lighthouse + Playwright only — the deprecated npm Publisher Ads plugin is not used. Monetization readiness requires confirming GPT/ad traffic on representative URLs.';

if (typeof perf === 'number' && perf < 50) {
  verdict = 'Not ready (performance)';
  verdictDetail =
    `Performance ${perf}/100 with weak lab vitals — treat as revenue/CRO risk until improved. ${verdictDetail}`;
} else if (typeof perf === 'number' && perf >= 90 && probeAdCount > 0 && gptLikely) {
  verdict = 'Likely on track (lab + tags observed)';
  verdictDetail =
    'Lab scores acceptable and ad-related requests were observed — still validate field data and revenue KPIs.';
} else if (typeof perf === 'number' && perf >= 75 && !gptLikely) {
  verdict = 'Needs manual review';
  verdictDetail =
    `Performance moderate (${perf}/100) but no GPT/ad-signature requests seen in Playwright — retest a monetized page. ${verdictDetail}`;
}

/** Topics mirroring Publisher Ads plugin audit docs — manual verification only. */
const PUB_ADS_CONCEPTS = [
  { topic: 'Tag load & async loading', refs: 'tag-load-time, async-ad-tags' },
  { topic: 'Ad request latency & waterfall', refs: 'ad-request-from-page-start, ad-request-critical-path' },
  { topic: 'Header bidding & parallel bids', refs: 'serial-header-bidding, gpt-bids-parallel' },
  { topic: 'Layout shift around ads (CLS)', refs: 'cumulative-ad-shift' },
  { topic: 'Main-thread / ad JS blocking', refs: 'total-ad-blocking-time, ad-blocking-tasks' },
  { topic: 'GPT source, HTTPS, static loaders', refs: 'loads-gpt-from-official-source, loads-ad-tag-over-https, script-injected-tags' },
  { topic: 'GPT errors & deprecated APIs', refs: 'gpt-errors-overall, deprecated-api-usage' },
  { topic: 'Slot density & viewport', refs: 'viewport-ad-density, ads-in-viewport, ad-top-of-viewport' },
];

const cro = [
  `P0 — Fix Performance (${perf}/100): LCP ${lcpDisp}, TBT ${tbtDisp} — reduces bounce and lost impressions.`,
  `P1 — Confirm ads: Playwright saw ${probeAdCount} ad-pattern requests; GPT-like traffic ${gptLikely ? 'detected' : 'not detected'} — test deal/article routes if homepage is light on ads.`,
  `P2 — Accessibility (${a11y}/100) and trust signals — secondary to speed + monetization path.`,
  `P3 — SEO (${seo}/100) — maintain while executing P0/P1.`,
];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unified readiness report — ${esc(lhr.finalUrl || probe.requestedUrl)}</title>
  <style>
    :root { --bg:#070707; --card:#111; --text:#e5e5e5; --muted:#a3a3a3; --border:#262626; --accent:#22c55e; --bad:#f87171; --warn:#fbbf24; }
    body { margin:0; font-family:system-ui,sans-serif; background:var(--bg); color:var(--text); line-height:1.55; }
    .wrap { max-width: 920px; margin: 0 auto; padding: 2rem 1.25rem 3rem; }
    h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
    .meta { color: var(--muted); font-size: 0.88rem; margin-bottom: 1.75rem; }
    h2 { font-size: 1.05rem; margin: 2rem 0 0.65rem; border-bottom: 1px solid var(--border); padding-bottom: 0.35rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px,1fr)); gap: 0.5rem; margin: 1rem 0; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 0.75rem 0.85rem; }
    .card span { display:block; font-size:0.62rem; text-transform:uppercase; color:var(--muted); }
    .card strong { font-size: 1.4rem; }
    .bad { color: var(--bad); } .warn { color: var(--warn); }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin: 0.5rem 0; }
    th, td { border: 1px solid var(--border); padding: 0.45rem 0.5rem; text-align: left; vertical-align: top; }
    th { background:#141414; color:var(--muted); font-size:0.72rem; text-transform:uppercase; }
    .box { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; margin: 1rem 0; }
    code { color: #86efac; font-size: 0.82rem; }
    ul { margin: 0.4rem 0; padding-left: 1.2rem; }
    .footnotes { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.78rem; color: var(--muted); }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Unified Google Ads / monetization readiness report</h1>
    <p class="meta">
      <strong>Final URL:</strong> ${esc(lhr.finalUrl || '')}<br/>
      <strong>Requested:</strong> ${esc(probe.requestedUrl || '')}<br/>
      <strong>Generated:</strong> ${esc(new Date().toISOString())}<br/>
      <strong>Lighthouse:</strong> ${esc(lhr.lighthouseVersion || '?')} (stock CLI, no Publisher Ads npm plugin)<br/>
      <strong>Playwright:</strong> network + console probe (see JSON paths below)
    </p>

    <h2>Single verdict</h2>
    <div class="box">
      <p><strong>${esc(verdict)}</strong></p>
      <p>${esc(verdictDetail)}</p>
    </div>

    <h2>CRO — priority order (this run)</h2>
    <ol>
${cro.map((c) => `      <li>${esc(c)}</li>`).join('\n')}
    </ol>

    <h2>Conversion Ops — 8-dimension CRO (Eric Siu / ai-marketing-skills)</h2>
    <p>
      This HTML does <strong>not</strong> execute <code>cro_audit.py</code>. For a scored landing-page CRO pass aligned with
      <a href="https://github.com/ericosiu/ai-marketing-skills/tree/main/conversion-ops" style="color:var(--accent);">conversion-ops</a>
      (MIT License, © 2026 Single Grain), run separately and merge findings into your stakeholder deck:
    </p>
    <pre style="background:#141414;padding:0.85rem;border-radius:8px;overflow:auto;font-size:0.8rem;">cd ai-marketing-skills/conversion-ops &amp;&amp; pip install -r requirements.txt
python cro_audit.py --url ${esc(lhr.finalUrl || probe.requestedUrl || '')} --industry general --json</pre>
    <table>
      <tr><th>Dimension (0–100 each)</th><th>Notes vs this report</th></tr>
      <tr><td>Headline Clarity</td><td>Not covered by Lighthouse — CRO tool</td></tr>
      <tr><td>CTA Visibility</td><td>Not covered by Lighthouse — CRO tool</td></tr>
      <tr><td>Social Proof</td><td>Not covered by Lighthouse — CRO tool</td></tr>
      <tr><td>Urgency</td><td>Not covered by Lighthouse — CRO tool</td></tr>
      <tr><td>Trust Signals</td><td>Partial overlap with Best Practices — CRO tool is copy/UX focused</td></tr>
      <tr><td>Form Friction</td><td>Not covered by Lighthouse — CRO tool</td></tr>
      <tr><td>Mobile Responsiveness</td><td>Overlaps lab + A11y partly — CRO adds heuristics</td></tr>
      <tr><td>Page Speed Indicators</td><td><strong>Lighthouse below is authoritative</strong> for lab perf; CRO uses lighter HTML heuristics</td></tr>
    </table>
    <p style="font-size:0.82rem;color:var(--muted);">Cursor skills: <code>~/.cursor/skills/conversion-ops/SKILL.md</code> and <code>google-ads-readiness-modern/reference/conversion-ops.md</code></p>

    <h2>Lighthouse — category scores (stock)</h2>
    <div class="grid">
      <div class="card"><span>Performance</span><strong class="${typeof perf === 'number' && perf < 50 ? 'bad' : ''}">${esc(perf)}</strong></div>
      <div class="card"><span>Accessibility</span><strong class="${typeof a11y === 'number' && a11y < 90 ? 'warn' : ''}">${esc(a11y)}</strong></div>
      <div class="card"><span>Best practices</span><strong>${esc(bp)}</strong></div>
      <div class="card"><span>SEO</span><strong>${esc(seo)}</strong></div>
    </div>

    <h3>Core lab vitals (this run)</h3>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>LCP</td><td>${lcpDisp}</td></tr>
      <tr><td>CLS</td><td>${clsDisp}</td></tr>
      <tr><td>TBT</td><td>${tbtDisp}</td></tr>
      <tr><td>INP</td><td>${inpDisp}</td></tr>
    </table>

    <h3>Lowest-scoring Lighthouse audits (sample)</h3>
    <table>
      <tr><th>Audit</th><th>Score</th><th>Display</th></tr>
${topWorst.map((r) => `      <tr><td>${esc(r.title)}</td><td>${r.score.toFixed(2)}</td><td>${esc(r.dv)}</td></tr>`).join('\n')}
    </table>

    <h2>Playwright — real browser signals</h2>
    <ul>
      <li><strong>Ad-pattern HTTP requests:</strong> ${probeAdCount} (GPT/Google Ads URL heuristics)</li>
      <li><strong>GPT-like load inferred:</strong> ${gptLikely ? 'yes' : 'no'}</li>
      <li><strong>Console/page errors:</strong> ${hasErr ? 'yes' : 'none captured'}</li>
      <li><strong>Page title:</strong> ${esc(probe.title || '')}</li>
    </ul>

    <h2>Publisher Ads plugin *concepts* (manual checklist)</h2>
    <p>The npm <code>lighthouse-plugin-publisher-ads</code> is <strong>not</strong> executed here (incompatible with modern Lighthouse). Below is the same <em>conceptual</em> coverage the plugin docs describe — verify in DevTools / staging, not as automated scores:</p>
    <table>
      <tr><th>Theme</th><th>Related audit ids (reference)</th></tr>
${PUB_ADS_CONCEPTS.map((r) => `      <tr><td>${esc(r.topic)}</td><td><code>${esc(r.refs)}</code></td></tr>`).join('\n')}
    </table>
    <p>Bundled markdown explainers: <code>~/.cursor/skills/publisher-ads-readiness/reference/audits/</code></p>

    <h2>Evidence (this run only)</h2>
    <p>This file is the <strong>only</strong> narrative report. Supporting machine files:</p>
    <ul>
      <li><code>${esc(lhrPath.replace(root + '/', ''))}</code> — Lighthouse JSON (LHR)</li>
      <li><code>${esc(lhrPath.replace(/\.json$/, '.html').replace(root + '/', ''))}</code> — Lighthouse HTML</li>
      <li><code>${esc(probePath.replace(root + '/', ''))}</code> — Playwright probe JSON</li>
    </ul>

    <div class="footnotes">
      One report per run; regenerate by executing <code>npm run report -- &lt;url&gt;</code> from the project root.
      Not affiliated with Google or the site owner. Lab data only unless you add RUM/CrUX separately.
    </div>
  </div>
</body>
</html>`;

writeFileSync(outHtml, html, 'utf8');
console.log(`Unified report written: ${outHtml}`);
