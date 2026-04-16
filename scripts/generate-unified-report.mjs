#!/usr/bin/env node
/**
 * Build ONE polished HTML report from Lighthouse LHR + Playwright probe + optional CRO JSON.
 * Features: SVG gauge rings, traffic-light vitals, verdict banner, print CSS, live CRO scores.
 *
 * Usage: node scripts/generate-unified-report.mjs <lhr.json> <probe.json> [cro.json] <out.html>
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Parse args: <lhr> <probe> [cro] <out>
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node scripts/generate-unified-report.mjs <lhr.json> <probe.json> [cro.json] [out.html]');
  process.exit(1);
}

const lhrPath = args[0];
const probePath = args[1];
let croPath = null;
let outHtml = join(root, 'reports', 'readiness-report.html');

if (args.length === 4) {
  croPath = args[2];
  outHtml = args[3];
} else if (args.length === 3) {
  if (args[2].endsWith('.json')) {
    croPath = args[2];
  } else {
    outHtml = args[2];
  }
}

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let lhr, probe;
try { lhr = JSON.parse(readFileSync(lhrPath, 'utf8')); }
catch (e) { console.error(`Failed to read/parse Lighthouse JSON at ${lhrPath}: ${e.message}`); process.exit(1); }
try { probe = JSON.parse(readFileSync(probePath, 'utf8')); }
catch (e) { console.error(`Failed to read/parse Playwright probe JSON at ${probePath}: ${e.message}`); process.exit(1); }

let cro = null;
if (croPath && existsSync(croPath)) {
  try { cro = JSON.parse(readFileSync(croPath, 'utf8')); }
  catch (e) { console.warn(`Warning: Could not parse CRO JSON at ${croPath}: ${e.message}`); }
}
const hasCro = cro && cro.overall_score != null;

// --- Data extraction ---
const cat = (k) => (lhr.categories[k]?.score != null ? Math.round(lhr.categories[k].score * 100) : null);
const perf = cat('performance');
const a11y = cat('accessibility');
const bp = cat('best-practices');
const seo = cat('seo');

const A = (id) => lhr.audits[id];
const lcp = A('largest-contentful-paint');
const cls = A('cumulative-layout-shift');
const tbt = A('total-blocking-time');
const inp = A('interaction-to-next-paint');

const lcpVal = lcp?.numericValue;
const clsVal = cls?.numericValue;
const tbtVal = tbt?.numericValue;

const lcpDisp = lcp?.displayValue ?? '—';
const clsDisp = cls?.displayValue ?? '—';
const tbtDisp = tbt?.displayValue ?? '—';
const inpDisp = inp?.displayValue ?? 'N/A';

function vitalRating(metric, val) {
  if (val == null) return 'na';
  if (metric === 'lcp') return val <= 2500 ? 'good' : val <= 4000 ? 'needs-work' : 'poor';
  if (metric === 'cls') return val <= 0.1 ? 'good' : val <= 0.25 ? 'needs-work' : 'poor';
  if (metric === 'tbt') return val <= 200 ? 'good' : val <= 600 ? 'needs-work' : 'poor';
  return 'na';
}

const worst = [];
for (const [id, au] of Object.entries(lhr.audits)) {
  if (!au || au.score == null || typeof au.score !== 'number' || au.score >= 0.9) continue;
  worst.push({ id, title: au.title, score: au.score, dv: au.displayValue || '' });
}
worst.sort((a, b) => a.score - b.score);
const topWorst = worst.slice(0, 10);

const probeAdCount = probe.adRelatedRequestCount ?? 0;
const gptLikely = probe.interpretation?.gptLikelyLoaded === true;
const hasErr = probe.interpretation?.hasConsoleErrors === true;

// --- Verdict ---
let verdictLevel = 'review'; // 'pass' | 'fail' | 'review'
let verdict = 'Needs manual review';
let verdictDetail = 'Stock Lighthouse + Playwright only — the deprecated npm Publisher Ads plugin is not used. Monetization readiness requires confirming GPT/ad traffic on representative URLs.';

if (typeof perf === 'number' && perf < 50) {
  verdictLevel = 'fail';
  verdict = 'Not ready';
  verdictDetail = `Performance ${perf}/100 with weak lab vitals — treat as revenue/CRO risk until improved. ${verdictDetail}`;
} else if (typeof perf === 'number' && perf >= 90 && probeAdCount > 0 && gptLikely) {
  verdictLevel = 'pass';
  verdict = 'Likely on track';
  verdictDetail = 'Lab scores acceptable and ad-related requests were observed — still validate field data and revenue KPIs.';
} else if (typeof perf === 'number' && perf >= 50 && !gptLikely) {
  verdictLevel = 'review';
  verdict = 'Needs manual review';
  verdictDetail = `Performance ${perf}/100 but no GPT/ad-signature requests seen in Playwright — retest a monetized page. ${verdictDetail}`;
}

const PUB_ADS_CONCEPTS = [
  { topic: 'Tag load & async loading', refs: 'tag-load-time, async-ad-tags', icon: '⚡' },
  { topic: 'Ad request latency & waterfall', refs: 'ad-request-from-page-start, ad-request-critical-path', icon: '🔗' },
  { topic: 'Header bidding & parallel bids', refs: 'serial-header-bidding, gpt-bids-parallel', icon: '🔀' },
  { topic: 'Layout shift around ads', refs: 'cumulative-ad-shift', icon: '📐' },
  { topic: 'Main-thread / ad JS blocking', refs: 'total-ad-blocking-time, ad-blocking-tasks', icon: '🧱' },
  { topic: 'GPT source, HTTPS, static loaders', refs: 'loads-gpt-from-official-source, loads-ad-tag-over-https, script-injected-tags', icon: '🔒' },
  { topic: 'GPT errors & deprecated APIs', refs: 'gpt-errors-overall, deprecated-api-usage', icon: '⚠️' },
  { topic: 'Slot density & viewport', refs: 'viewport-ad-density, ads-in-viewport, ad-top-of-viewport', icon: '📊' },
];

// --- SVG gauge helpers ---
function scoreColor(score) {
  if (score == null) return '#555';
  if (score >= 90) return '#0cce6b';
  if (score >= 50) return '#ffa400';
  return '#ff4e42';
}

function gaugeRing(score, label) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const pct = score != null ? score / 100 : 0;
  const offset = circ * (1 - pct);
  const color = scoreColor(score);
  const display = score != null ? score : '—';
  return `
    <div class="gauge">
      <svg viewBox="0 0 120 120" width="120" height="120">
        <circle cx="60" cy="60" r="${r}" fill="none" stroke="#1a1a2e" stroke-width="8"/>
        <circle cx="60" cy="60" r="${r}" fill="none" stroke="${color}" stroke-width="8"
          stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
          stroke-linecap="round" transform="rotate(-90 60 60)"
          style="transition:stroke-dashoffset .8s ease"/>
      </svg>
      <div class="gauge-val" style="color:${color}">${display}</div>
      <div class="gauge-label">${esc(label)}</div>
    </div>`;
}

function vitalPill(label, value, rating) {
  return `<div class="vital vital-${rating}">
    <span class="vital-label">${esc(label)}</span>
    <span class="vital-value">${esc(value)}</span>
  </div>`;
}

const dateHuman = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Readiness Report — ${esc(lhr.finalUrl || probe.requestedUrl)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

    :root{
      --bg:#08090d;--surface:#0f1117;--surface2:#161822;--surface3:#1c1f2e;
      --border:#232640;--border2:#2d3154;
      --text:#e8eaf0;--text2:#a0a5c0;--text3:#6b7094;
      --green:#0cce6b;--amber:#ffa400;--red:#ff4e42;
      --blue:#4f8ff7;--purple:#a78bfa;
      --green-bg:rgba(12,206,107,.08);--amber-bg:rgba(255,164,0,.08);--red-bg:rgba(255,78,66,.08);
      --radius:12px;--radius-sm:8px;
    }

    body{font-family:'DM Sans',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased}

    .page{max-width:1000px;margin:0 auto;padding:2.5rem 1.5rem 4rem}

    /* --- Header --- */
    .header{text-align:center;padding:2rem 0 2.5rem;border-bottom:1px solid var(--border)}
    .header h1{font-size:1.75rem;font-weight:700;letter-spacing:-.02em;margin-bottom:.5rem}
    .header .url{font-family:'JetBrains Mono',monospace;font-size:.85rem;color:var(--blue);word-break:break-all;margin-bottom:1rem}
    .header .meta-row{display:flex;gap:1.5rem;justify-content:center;flex-wrap:wrap;font-size:.78rem;color:var(--text3)}
    .header .meta-row span{display:inline-flex;align-items:center;gap:.35rem}

    /* --- Verdict banner --- */
    .verdict{margin:2rem 0;padding:1.5rem 2rem;border-radius:var(--radius);position:relative;overflow:hidden}
    .verdict::before{content:'';position:absolute;inset:0;border-radius:var(--radius);pointer-events:none}
    .verdict-pass{background:var(--green-bg);border:1px solid rgba(12,206,107,.25)}
    .verdict-pass::before{box-shadow:inset 0 1px 0 rgba(12,206,107,.15)}
    .verdict-fail{background:var(--red-bg);border:1px solid rgba(255,78,66,.25)}
    .verdict-fail::before{box-shadow:inset 0 1px 0 rgba(255,78,66,.15)}
    .verdict-review{background:var(--amber-bg);border:1px solid rgba(255,164,0,.25)}
    .verdict-review::before{box-shadow:inset 0 1px 0 rgba(255,164,0,.15)}
    .verdict-badge{display:inline-flex;align-items:center;gap:.5rem;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;padding:.3rem .7rem;border-radius:100px;margin-bottom:.75rem}
    .verdict-pass .verdict-badge{background:rgba(12,206,107,.15);color:var(--green)}
    .verdict-fail .verdict-badge{background:rgba(255,78,66,.15);color:var(--red)}
    .verdict-review .verdict-badge{background:rgba(255,164,0,.15);color:var(--amber)}
    .verdict h2{font-size:1.35rem;font-weight:700;margin-bottom:.5rem}
    .verdict-pass h2{color:var(--green)}
    .verdict-fail h2{color:var(--red)}
    .verdict-review h2{color:var(--amber)}
    .verdict p{font-size:.88rem;color:var(--text2);line-height:1.65}

    /* --- Gauges --- */
    .gauges{display:flex;justify-content:center;gap:2rem;flex-wrap:wrap;margin:2.5rem 0}
    .gauge{position:relative;text-align:center;width:120px}
    .gauge svg{display:block}
    .gauge-val{position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);font-size:1.7rem;font-weight:700;font-family:'JetBrains Mono',monospace}
    .gauge-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);margin-top:.35rem;font-weight:500}

    /* --- Vitals --- */
    .vitals{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.75rem;margin:1.5rem 0 2.5rem}
    .vital{display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.1rem;border-radius:var(--radius-sm);border:1px solid var(--border)}
    .vital-label{font-size:.78rem;color:var(--text2);font-weight:500;text-transform:uppercase;letter-spacing:.04em}
    .vital-value{font-family:'JetBrains Mono',monospace;font-size:.95rem;font-weight:700}
    .vital-good{background:var(--green-bg);border-color:rgba(12,206,107,.2)}.vital-good .vital-value{color:var(--green)}
    .vital-needs-work{background:var(--amber-bg);border-color:rgba(255,164,0,.2)}.vital-needs-work .vital-value{color:var(--amber)}
    .vital-poor{background:var(--red-bg);border-color:rgba(255,78,66,.2)}.vital-poor .vital-value{color:var(--red)}
    .vital-na{background:var(--surface)}.vital-na .vital-value{color:var(--text3)}

    /* --- Sections --- */
    .section{margin-top:2.5rem}
    .section-title{font-size:1rem;font-weight:700;color:var(--text);padding-bottom:.5rem;border-bottom:1px solid var(--border);margin-bottom:1rem;display:flex;align-items:center;gap:.5rem}
    .section-title .tag{font-size:.6rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;padding:.2rem .55rem;border-radius:100px;background:var(--surface3);color:var(--text3)}

    /* --- Priority list --- */
    .priorities{list-style:none;counter-reset:pri}
    .priorities li{counter-increment:pri;display:flex;gap:.85rem;align-items:flex-start;padding:.85rem 1rem;border-radius:var(--radius-sm);margin-bottom:.5rem;background:var(--surface);border:1px solid var(--border);font-size:.85rem;color:var(--text2);line-height:1.5}
    .priorities li::before{content:'P' counter(pri);flex-shrink:0;font-family:'JetBrains Mono',monospace;font-size:.7rem;font-weight:700;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:var(--surface3);color:var(--text3)}
    .priorities li:first-child::before{background:rgba(255,78,66,.12);color:var(--red)}
    .priorities li:nth-child(2)::before{background:rgba(255,164,0,.12);color:var(--amber)}

    /* --- Tables --- */
    .table-wrap{overflow-x:auto;margin:.75rem 0;border-radius:var(--radius-sm);border:1px solid var(--border)}
    table{width:100%;border-collapse:collapse;font-size:.82rem}
    th{background:var(--surface2);color:var(--text3);font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;padding:.65rem .85rem;text-align:left}
    td{padding:.6rem .85rem;border-top:1px solid var(--border);color:var(--text2);vertical-align:top}
    tr:hover td{background:rgba(255,255,255,.015)}
    .score-bad{color:var(--red);font-weight:600}
    .score-warn{color:var(--amber);font-weight:600}
    .score-ok{color:var(--green);font-weight:600}

    /* --- Checklist (Publisher Ads concepts) --- */
    .checklist{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:.6rem;margin:.75rem 0}
    .check-item{display:flex;gap:.65rem;padding:.75rem .9rem;border-radius:var(--radius-sm);background:var(--surface);border:1px solid var(--border);font-size:.82rem;align-items:flex-start}
    .check-icon{font-size:1rem;flex-shrink:0;line-height:1.2}
    .check-body{flex:1}
    .check-topic{font-weight:600;color:var(--text);margin-bottom:.15rem}
    .check-refs{font-family:'JetBrains Mono',monospace;font-size:.72rem;color:var(--text3);word-break:break-all}

    /* --- Playwright signals --- */
    .signal-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.6rem;margin:.75rem 0}
    .signal{padding:.85rem 1rem;border-radius:var(--radius-sm);background:var(--surface);border:1px solid var(--border)}
    .signal-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;color:var(--text3);margin-bottom:.25rem;font-weight:500}
    .signal-value{font-size:1rem;font-weight:600}
    .signal-yes{color:var(--green)}.signal-no{color:var(--text3)}.signal-warn{color:var(--amber)}

    /* --- CRO dimension table --- */
    .dim-row{display:flex;gap:.5rem;align-items:center;padding:.5rem 0;border-bottom:1px solid var(--border)}
    .dim-row:last-child{border-bottom:none}
    .dim-name{flex:1;font-size:.82rem;font-weight:500}
    .dim-note{flex:1.5;font-size:.78rem;color:var(--text3)}
    .dim-badge{font-size:.62rem;font-weight:600;padding:.15rem .45rem;border-radius:4px;text-transform:uppercase;letter-spacing:.04em}
    .dim-cro{background:rgba(167,139,250,.1);color:var(--purple)}
    .dim-overlap{background:rgba(79,143,247,.1);color:var(--blue)}
    .dim-lh{background:rgba(12,206,107,.1);color:var(--green)}

    /* --- Evidence --- */
    .evidence{margin-top:1.25rem;padding:1rem 1.25rem;border-radius:var(--radius-sm);background:var(--surface);border:1px solid var(--border)}
    .evidence code{font-family:'JetBrains Mono',monospace;font-size:.78rem;color:var(--blue)}
    .evidence li{margin-bottom:.35rem;font-size:.82rem;color:var(--text2)}

    /* --- Footer --- */
    .footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--border);text-align:center;font-size:.75rem;color:var(--text3);line-height:1.7}

    /* --- Print --- */
    @media print{
      :root{--bg:#fff;--surface:#f8f9fa;--surface2:#f0f1f4;--surface3:#e8eaf0;--border:#dee0e8;--border2:#ccc;--text:#1a1a2e;--text2:#444;--text3:#777;--green-bg:#e6f9ef;--amber-bg:#fff5e0;--red-bg:#ffeae8}
      body{background:#fff;color:#1a1a2e;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .page{max-width:100%;padding:1rem}
      .verdict,.vital,.check-item,.signal,.priorities li,.evidence{break-inside:avoid}
      .section{break-inside:avoid}
    }
  </style>
</head>
<body>
<div class="page">

  <div class="header">
    <h1>Google Ads / Monetization Readiness</h1>
    <div class="url">${esc(lhr.finalUrl || probe.requestedUrl)}</div>
    <div class="meta-row">
      <span>📅 ${esc(dateHuman)}</span>
      <span>🔦 Lighthouse ${esc(lhr.lighthouseVersion || '?')}</span>
      <span>🎭 Playwright probe</span>
      <span>📋 Stock CLI — no Publisher Ads plugin</span>
    </div>
  </div>

  <!-- Verdict -->
  <div class="verdict verdict-${verdictLevel}">
    <div class="verdict-badge">${verdictLevel === 'pass' ? '✓ On Track' : verdictLevel === 'fail' ? '✗ Not Ready' : '⟳ Review Needed'}</div>
    <h2>${esc(verdict)}</h2>
    <p>${esc(verdictDetail)}</p>
  </div>

  <!-- Gauges -->
  <div class="gauges">
    ${gaugeRing(perf, 'Performance')}
    ${gaugeRing(a11y, 'Accessibility')}
    ${gaugeRing(bp, 'Best Practices')}
    ${gaugeRing(seo, 'SEO')}
  </div>

  <!-- Core Web Vitals -->
  <div class="section">
    <div class="section-title">Core Web Vitals <span class="tag">Lab data</span></div>
    <div class="vitals">
      ${vitalPill('LCP', lcpDisp, vitalRating('lcp', lcpVal))}
      ${vitalPill('CLS', clsDisp, vitalRating('cls', clsVal))}
      ${vitalPill('TBT', tbtDisp, vitalRating('tbt', tbtVal))}
      ${vitalPill('INP', inpDisp, 'na')}
    </div>
  </div>

  <!-- CRO Priorities -->
  <div class="section">
    <div class="section-title">CRO Priority Order <span class="tag">This run</span></div>
    <ol class="priorities">
      <li>Fix Performance (${perf ?? '—'}/100): LCP ${esc(lcpDisp)}, TBT ${esc(tbtDisp)} — reduces bounce and lost impressions.</li>
      <li>Confirm ads: Playwright saw ${probeAdCount} ad-pattern requests; GPT-like traffic ${gptLikely ? 'detected' : 'not detected'} — test deal/article routes if homepage is light on ads.</li>
      <li>Accessibility (${a11y ?? '—'}/100) and trust signals — secondary to speed + monetization path.</li>
      <li>SEO (${seo ?? '—'}/100) — maintain while executing priorities above.</li>
    </ol>
  </div>

  <!-- Lowest-scoring audits -->
  <div class="section">
    <div class="section-title">Lowest-Scoring Audits <span class="tag">${topWorst.length} flagged</span></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Audit</th><th>Score</th><th>Detail</th></tr></thead>
        <tbody>
${topWorst.map((r) => {
  const cls = r.score < 0.5 ? 'score-bad' : 'score-warn';
  return `          <tr><td>${esc(r.title)}</td><td class="${cls}">${(r.score * 100).toFixed(0)}</td><td>${esc(r.dv)}</td></tr>`;
}).join('\n')}
${topWorst.length === 0 ? '          <tr><td colspan="3" style="text-align:center;color:var(--text3)">All audits scored ≥ 90 — looking good</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Playwright signals -->
  <div class="section">
    <div class="section-title">Playwright — Real Browser Signals</div>
    <div class="signal-grid">
      <div class="signal">
        <div class="signal-label">Ad-pattern requests</div>
        <div class="signal-value ${probeAdCount > 0 ? 'signal-yes' : 'signal-no'}">${probeAdCount}</div>
      </div>
      <div class="signal">
        <div class="signal-label">GPT-like traffic</div>
        <div class="signal-value ${gptLikely ? 'signal-yes' : 'signal-no'}">${gptLikely ? 'Detected' : 'Not detected'}</div>
      </div>
      <div class="signal">
        <div class="signal-label">Console / page errors</div>
        <div class="signal-value ${hasErr ? 'signal-warn' : 'signal-yes'}">${hasErr ? 'Errors found' : 'None'}</div>
      </div>
      <div class="signal">
        <div class="signal-label">Page title</div>
        <div class="signal-value" style="font-size:.82rem;font-weight:400;color:var(--text2)">${esc(probe.title || '—')}</div>
      </div>
    </div>
  </div>

  <!-- Publisher Ads concepts -->
  <div class="section">
    <div class="section-title">Publisher Ads Audit Concepts <span class="tag">Manual checklist</span></div>
    <p style="font-size:.82rem;color:var(--text3);margin-bottom:.75rem">The npm <code style="font-family:'JetBrains Mono',monospace;font-size:.78rem;color:var(--purple)">lighthouse-plugin-publisher-ads</code> is not executed (incompatible with modern Lighthouse). Verify these themes in DevTools / staging:</p>
    <div class="checklist">
${PUB_ADS_CONCEPTS.map((c) => `      <div class="check-item">
        <span class="check-icon">${c.icon}</span>
        <div class="check-body">
          <div class="check-topic">${esc(c.topic)}</div>
          <div class="check-refs">${esc(c.refs)}</div>
        </div>
      </div>`).join('\n')}
    </div>
  </div>

  <!-- Conversion Ops -->
  <div class="section">
    <div class="section-title">Conversion Ops — 8-Dimension CRO <span class="tag">${hasCro ? esc(cro.letter_grade) + ' — ' + esc(cro.overall_score) + '/100' : 'Not executed'}</span></div>
${hasCro ? `
    <div style="display:flex;align-items:center;gap:1.5rem;margin-bottom:1.25rem;flex-wrap:wrap">
      ${gaugeRing(Math.round(cro.overall_score), 'CRO Score')}
      <div style="flex:1;min-width:200px">
        <div style="font-size:1.1rem;font-weight:700;margin-bottom:.25rem">Overall: ${esc(cro.overall_score)}/100 <span style="color:${scoreColor(Math.round(cro.overall_score))}">(${esc(cro.letter_grade)})</span></div>
        ${cro.benchmark_comparison ? `<div style="font-size:.82rem;color:var(--text3)">
          Industry: ${esc(cro.benchmark_comparison.industry)} —
          vs avg (${esc(cro.benchmark_comparison.industry_avg)}): <span style="color:${cro.benchmark_comparison.vs_avg >= 0 ? 'var(--green)' : 'var(--red)'}">${cro.benchmark_comparison.vs_avg >= 0 ? '↑' : '↓'}${Math.abs(cro.benchmark_comparison.vs_avg)} pts</span>,
          vs top quartile (${esc(cro.benchmark_comparison.top_quartile)}): <span style="color:${cro.benchmark_comparison.vs_top >= 0 ? 'var(--green)' : 'var(--red)'}">${cro.benchmark_comparison.vs_top >= 0 ? '↑' : '↓'}${Math.abs(cro.benchmark_comparison.vs_top)} pts</span>
        </div>` : ''}
      </div>
    </div>

    <div style="padding:0 .25rem">
      <div class="dim-row" style="padding-bottom:.4rem;margin-bottom:.35rem;border-bottom:1px solid var(--border2)">
        <div class="dim-name" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.04em;color:var(--text3);font-weight:600">Dimension</div>
        <div style="width:60px;font-size:.68rem;text-transform:uppercase;letter-spacing:.04em;color:var(--text3);font-weight:600;text-align:center">Score</div>
        <div class="dim-note" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.04em;color:var(--text3);font-weight:600">Key finding</div>
      </div>
${Object.entries(cro.dimensions || {}).map(([key, dim]) => {
  const c = scoreColor(dim.score);
  const finding = (dim.findings && dim.findings[0]) || '';
  return `      <div class="dim-row">
        <div class="dim-name">${esc(dim.name)}</div>
        <div style="width:60px;text-align:center;font-family:'JetBrains Mono',monospace;font-weight:700;color:${c}">${dim.score}</div>
        <div class="dim-note" style="font-size:.78rem">${esc(finding)}</div>
      </div>`;
}).join('\n')}
    </div>

${(cro.priority_fixes && cro.priority_fixes.length > 0) ? `
    <div style="margin-top:1.25rem">
      <div style="font-size:.78rem;font-weight:600;color:var(--text2);margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.04em">Top CRO fixes</div>
${cro.priority_fixes.slice(0, 6).map((fix, i) => {
  const impColor = fix.impact === 'HIGH' ? 'var(--red)' : fix.impact === 'MEDIUM' ? 'var(--amber)' : 'var(--green)';
  return `      <div style="display:flex;gap:.5rem;align-items:flex-start;margin-bottom:.5rem;font-size:.82rem;color:var(--text2)">
        <span style="flex-shrink:0;font-size:.62rem;font-weight:700;padding:.15rem .4rem;border-radius:4px;background:rgba(255,255,255,.05);color:${impColor}">${esc(fix.impact)}</span>
        <span><strong style="color:var(--text)">${esc(fix.dimension)}</strong> — ${esc(fix.fix)}</span>
      </div>`;
}).join('\n')}
    </div>` : ''}
` : `
    <p style="font-size:.82rem;color:var(--text3);margin-bottom:.5rem">
      CRO audit was not executed in this run. To include live scores, ensure
      <a href="https://github.com/ericosiu/ai-marketing-skills/tree/main/conversion-ops" style="color:var(--blue);text-decoration:none">ai-marketing-skills/conversion-ops</a>
      is cloned alongside this project with its Python venv installed.
    </p>
    <div style="padding:0 .25rem">
      <div class="dim-row" style="padding-bottom:.4rem;margin-bottom:.35rem;border-bottom:1px solid var(--border2)">
        <div class="dim-name" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.04em;color:var(--text3);font-weight:600">Dimension</div>
        <div class="dim-note" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.04em;color:var(--text3);font-weight:600">Coverage</div>
      </div>
      <div class="dim-row"><div class="dim-name">Headline Clarity</div><div class="dim-note"><span class="dim-badge dim-cro">CRO tool</span> Not covered by Lighthouse</div></div>
      <div class="dim-row"><div class="dim-name">CTA Visibility</div><div class="dim-note"><span class="dim-badge dim-cro">CRO tool</span> Not covered by Lighthouse</div></div>
      <div class="dim-row"><div class="dim-name">Social Proof</div><div class="dim-note"><span class="dim-badge dim-cro">CRO tool</span> Not covered by Lighthouse</div></div>
      <div class="dim-row"><div class="dim-name">Urgency</div><div class="dim-note"><span class="dim-badge dim-cro">CRO tool</span> Not covered by Lighthouse</div></div>
      <div class="dim-row"><div class="dim-name">Trust Signals</div><div class="dim-note"><span class="dim-badge dim-overlap">Partial</span> Best Practices touches this</div></div>
      <div class="dim-row"><div class="dim-name">Form Friction</div><div class="dim-note"><span class="dim-badge dim-cro">CRO tool</span> Not covered by Lighthouse</div></div>
      <div class="dim-row"><div class="dim-name">Mobile Responsiveness</div><div class="dim-note"><span class="dim-badge dim-overlap">Partial</span> Lab + A11y partially cover</div></div>
      <div class="dim-row"><div class="dim-name">Page Speed Indicators</div><div class="dim-note"><span class="dim-badge dim-lh">Lighthouse</span> Lab perf is authoritative</div></div>
    </div>
`}
  </div>

  <!-- Evidence -->
  <div class="section">
    <div class="section-title">Evidence <span class="tag">This run</span></div>
    <div class="evidence">
      <p style="font-size:.82rem;color:var(--text2);margin-bottom:.65rem">This file is the only narrative report. Supporting machine files:</p>
      <ul style="list-style:none;padding:0">
        <li>📄 <code>${esc(lhrPath.replace(root + '/', ''))}</code> — Lighthouse JSON</li>
        <li>📄 <code>${esc(lhrPath.replace(/\.json$/, '.html').replace(root + '/', ''))}</code> — Lighthouse HTML</li>
        <li>📄 <code>${esc(probePath.replace(root + '/', ''))}</code> — Playwright probe JSON</li>
${croPath ? `        <li>📄 <code>${esc(croPath.replace(root + '/', ''))}</code> — CRO audit JSON (conversion-ops)</li>` : ''}
      </ul>
    </div>
  </div>

  <div class="footer">
    One report per run — regenerate with <code style="font-family:'JetBrains Mono',monospace;font-size:.72rem;color:var(--blue)">npm run report -- &lt;url&gt;</code><br/>
    Not affiliated with Google or the site owner. Lab data only unless you add RUM/CrUX separately.
  </div>

</div>
</body>
</html>`;

writeFileSync(outHtml, html, 'utf8');
console.log(`Unified report written: ${outHtml}`);
