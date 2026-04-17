#!/usr/bin/env node
/**
 * Build ONE polished landing-page readiness report for performance marketers.
 * Combines full Lighthouse analysis + Playwright tracking + CRO scoring
 * into a single stakeholder HTML file.
 *
 * Usage: node scripts/generate-unified-report.mjs <lhr.json> <probe.json> [cro.json] [out.html]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

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
  if (args[2].endsWith('.json')) croPath = args[2];
  else outHtml = args[2];
}

// ---------- helpers ----------

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function scoreColor(score) {
  if (score == null) return '#555';
  if (score >= 90) return '#0cce6b';
  if (score >= 50) return '#ffa400';
  return '#ff4e42';
}

function fmtMs(n) { return n == null ? '—' : `${Math.round(n)} ms`; }
function fmtKB(bytes) { return bytes == null ? '—' : `${(bytes / 1024).toFixed(0)} KB`; }

function gaugeRing(score, label, size = 110) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const pct = score != null ? Math.max(0, Math.min(100, score)) / 100 : 0;
  const offset = circ * (1 - pct);
  const color = scoreColor(score);
  const display = score != null ? score : '—';
  return `
    <div class="gauge" style="width:${size}px">
      <svg viewBox="0 0 120 120" width="${size}" height="${size}">
        <circle cx="60" cy="60" r="${r}" fill="none" stroke="#1a1a2e" stroke-width="8"/>
        <circle cx="60" cy="60" r="${r}" fill="none" stroke="${color}" stroke-width="8"
          stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
          stroke-linecap="round" transform="rotate(-90 60 60)"/>
      </svg>
      <div class="gauge-val" style="color:${color}">${display}</div>
      <div class="gauge-label">${esc(label)}</div>
    </div>`;
}

function vitalPill(label, value, rating, threshold) {
  return `<div class="vital vital-${rating}">
    <div class="vital-top">
      <span class="vital-label">${esc(label)}</span>
      <span class="vital-badge">${rating === 'good' ? 'Good' : rating === 'needs-work' ? 'Needs work' : rating === 'poor' ? 'Poor' : 'N/A'}</span>
    </div>
    <div class="vital-value">${esc(value)}</div>
    <div class="vital-threshold">${esc(threshold)}</div>
  </div>`;
}

function vitalRating(metric, val) {
  if (val == null) return 'na';
  if (metric === 'lcp') return val <= 2500 ? 'good' : val <= 4000 ? 'needs-work' : 'poor';
  if (metric === 'cls') return val <= 0.1 ? 'good' : val <= 0.25 ? 'needs-work' : 'poor';
  if (metric === 'tbt') return val <= 200 ? 'good' : val <= 600 ? 'needs-work' : 'poor';
  if (metric === 'fcp') return val <= 1800 ? 'good' : val <= 3000 ? 'needs-work' : 'poor';
  if (metric === 'si') return val <= 3400 ? 'good' : val <= 5800 ? 'needs-work' : 'poor';
  return 'na';
}

// ---------- parse inputs ----------

let lhr, probe;
try { lhr = JSON.parse(readFileSync(lhrPath, 'utf8')); }
catch (e) { console.error(`Failed to parse Lighthouse JSON: ${e.message}`); process.exit(1); }
try { probe = JSON.parse(readFileSync(probePath, 'utf8')); }
catch (e) { console.error(`Failed to parse Playwright probe JSON: ${e.message}`); process.exit(1); }

let cro = null;
if (croPath && existsSync(croPath)) {
  try { cro = JSON.parse(readFileSync(croPath, 'utf8')); }
  catch (e) { console.warn(`Could not parse CRO JSON: ${e.message}`); }
}
const hasCro = cro && cro.overall_score != null;

// ---------- extract ----------

const cat = (k) => (lhr.categories[k]?.score != null ? Math.round(lhr.categories[k].score * 100) : null);
const perf = cat('performance');
const a11y = cat('accessibility');
const bp = cat('best-practices');
const seo = cat('seo');

const A = (id) => lhr.audits[id];
const lcp = A('largest-contentful-paint');
const cls = A('cumulative-layout-shift');
const tbt = A('total-blocking-time');
const fcp = A('first-contentful-paint');
const si = A('speed-index');
const inp = A('interaction-to-next-paint');

// Opportunities with savings
const opportunities = [];
for (const [id, a] of Object.entries(lhr.audits)) {
  if (a.details?.type === 'opportunity' && (a.details?.overallSavingsMs > 0 || a.details?.overallSavingsBytes > 0)) {
    opportunities.push({
      id, title: a.title, description: a.description, score: a.score,
      savingsMs: a.details.overallSavingsMs || 0,
      savingsBytes: a.details.overallSavingsBytes || 0,
      displayValue: a.displayValue || '',
      items: (a.details.items || []).slice(0, 3),
    });
  }
}
opportunities.sort((a, b) => b.savingsMs - a.savingsMs);

// Diagnostics
const diagnostics = [];
const perfRefs = lhr.categories.performance?.auditRefs || [];
for (const ref of perfRefs) {
  if (ref.group === 'diagnostics') {
    const a = lhr.audits[ref.id];
    if (a && a.score !== null && a.score < 1 && a.details?.type !== 'opportunity') {
      diagnostics.push({ id: a.id, title: a.title, score: a.score, displayValue: a.displayValue || '' });
    }
  }
}
diagnostics.sort((a, b) => (a.score ?? 1) - (b.score ?? 1));

// Third-party entities
const thirdPartySummary = lhr.audits['third-party-summary'];
const thirdParties = (thirdPartySummary?.details?.items || [])
  .map((it) => ({
    entity: it.entity,
    blockingTime: it.blockingTime,
    mainThreadTime: it.mainThreadTime,
    transferSize: it.transferSize,
    tbtImpact: it.tbtImpact || it.blockingTime,
  }))
  .sort((a, b) => b.blockingTime - a.blockingTime)
  .slice(0, 10);

// Filmstrip
const filmstrip = lhr.audits['screenshot-thumbnails']?.details?.items || [];

// Accessibility issues (only failing)
const a11yIssues = [];
const a11yRefs = lhr.categories.accessibility?.auditRefs || [];
for (const ref of a11yRefs) {
  const a = lhr.audits[ref.id];
  if (a && a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'manual' && a.scoreDisplayMode !== 'notApplicable') {
    a11yIssues.push({ id: a.id, title: a.title, score: a.score });
  }
}
a11yIssues.sort((a, b) => a.score - b.score);

// SEO issues
const seoIssues = [];
const seoRefs = lhr.categories.seo?.auditRefs || [];
for (const ref of seoRefs) {
  const a = lhr.audits[ref.id];
  if (a && a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'manual' && a.scoreDisplayMode !== 'notApplicable') {
    seoIssues.push({ id: a.id, title: a.title, score: a.score });
  }
}

// Best practices issues
const bpIssues = [];
const bpRefs = lhr.categories['best-practices']?.auditRefs || [];
for (const ref of bpRefs) {
  const a = lhr.audits[ref.id];
  if (a && a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'manual' && a.scoreDisplayMode !== 'notApplicable') {
    bpIssues.push({ id: a.id, title: a.title, score: a.score });
  }
}

// Page weight / network
const totalByteWeight = lhr.audits['total-byte-weight']?.numericValue;
const dom = lhr.audits['dom-size']?.numericValue;
const mainThreadWork = lhr.audits['mainthread-work-breakdown']?.numericValue;
const bootupTime = lhr.audits['bootup-time']?.numericValue;

// Mobile / policy signals
const isHttps = lhr.audits['is-on-https']?.score === 1;
const viewportOk = lhr.audits['viewport']?.score === 1;
const contentWidthOk = lhr.audits['content-width']?.score === 1;
const tapTargetsOk = lhr.audits['tap-targets']?.score === 1;

// ---------- verdict (performance-marketer specific) ----------

const pixels = probe.pixels || {};
const detectedPixelNames = probe.detectedPixelNames || [];
const conversionTracking = probe.conversionTrackingDetected === true;
const analyticsOnly = probe.analyticsOnlyDetected === true;
const hasConsoleErr = probe.interpretation?.hasConsoleErrors === true;

let verdictLevel = 'review';
let verdictTitle = 'Needs review before paid traffic';
let verdictReasons = [];

const redFlags = [];
const amberFlags = [];
const greens = [];

if (perf !== null && perf < 50) redFlags.push(`Performance ${perf}/100 — low Quality Score risk, inflated CPC`);
else if (perf !== null && perf < 75) amberFlags.push(`Performance ${perf}/100 — Page Experience signal below "good"`);
else if (perf !== null) greens.push(`Performance ${perf}/100`);

if (!conversionTracking) redFlags.push('No conversion pixel detected — campaigns cannot optimize or measure ROAS');
else greens.push(`Conversion tracking live (${detectedPixelNames.filter((n) => !['Google Tag Manager', 'GA4 (gtag)'].includes(n)).length} platform pixel(s))`);

if (analyticsOnly && !conversionTracking) amberFlags.push('Only analytics detected — no conversion pixels firing');

if (!isHttps) redFlags.push('Not on HTTPS — ad platforms will reject');
if (a11y !== null && a11y < 70) redFlags.push(`Accessibility ${a11y}/100 — legal + reach risk`);
else if (a11y !== null && a11y < 90) amberFlags.push(`Accessibility ${a11y}/100 — could exclude users`);

if (hasCro) {
  if (cro.overall_score < 40) redFlags.push(`CRO ${cro.overall_score}/100 (${cro.letter_grade}) — traffic will convert poorly`);
  else if (cro.benchmark_comparison?.vs_avg < 0) amberFlags.push(`CRO ${cro.overall_score}/100 — below ${cro.benchmark_comparison.industry} industry avg`);
  else greens.push(`CRO ${cro.overall_score}/100 (${cro.letter_grade})`);
}

const lcpVal = lcp?.numericValue;
const clsVal = cls?.numericValue;
if (lcpVal > 4000) redFlags.push(`LCP ${(lcpVal / 1000).toFixed(1)}s — poor Page Experience`);
else if (lcpVal > 2500) amberFlags.push(`LCP ${(lcpVal / 1000).toFixed(1)}s — needs work`);
if (clsVal > 0.25) redFlags.push(`CLS ${clsVal.toFixed(2)} — layout instability hurts conversion`);

if (redFlags.length > 0) {
  verdictLevel = 'fail';
  verdictTitle = 'Not ready — fix before spending';
  verdictReasons = redFlags.slice(0, 4);
} else if (amberFlags.length > 0) {
  verdictLevel = 'review';
  verdictTitle = 'Ship with caveats';
  verdictReasons = amberFlags.slice(0, 4);
} else {
  verdictLevel = 'pass';
  verdictTitle = 'Ready for paid traffic';
  verdictReasons = greens.slice(0, 4);
}

const verdictBadgeLabel = verdictLevel === 'pass' ? '✓ GO' : verdictLevel === 'fail' ? '✗ STOP' : '⟳ REVIEW';
const verdictBadgeSub = verdictLevel === 'pass' ? 'Ready for spend' : verdictLevel === 'fail' ? 'Blockers found' : 'Caveats apply';

// ---------- utility strings ----------

const finalUrl = lhr.finalDisplayedUrl || lhr.finalUrl || probe.requestedUrl || '';
const dateHuman = new Date().toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
});
const formFactor = lhr.configSettings?.formFactor || 'mobile';

// ---------- HTML ----------

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Landing Page Audit — ${esc(finalUrl)}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --bg:#08090d;--surface:#0f1117;--surface2:#161822;--surface3:#1c1f2e;
  --border:#232640;--border2:#2d3154;
  --text:#e8eaf0;--text2:#a0a5c0;--text3:#6b7094;
  --green:#0cce6b;--amber:#ffa400;--red:#ff4e42;
  --blue:#4f8ff7;--purple:#a78bfa;--pink:#f472b6;--cyan:#22d3ee;
  --green-bg:rgba(12,206,107,.08);--amber-bg:rgba(255,164,0,.08);--red-bg:rgba(255,78,66,.08);
  --radius:12px;--radius-sm:8px;
}

body{font-family:'DM Sans',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased}
.page{max-width:1100px;margin:0 auto;padding:2.5rem 1.5rem 4rem}

/* Header */
.header{text-align:center;padding:1.5rem 0 2rem;border-bottom:1px solid var(--border)}
.header-eyebrow{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--blue);margin-bottom:.75rem}
.header h1{font-size:1.8rem;font-weight:700;letter-spacing:-.02em;margin-bottom:.5rem;line-height:1.2}
.header .url{font-family:'JetBrains Mono',monospace;font-size:.85rem;color:var(--blue);word-break:break-all;margin-bottom:1rem;display:inline-block;max-width:100%}
.header .meta-row{display:flex;gap:1.25rem;justify-content:center;flex-wrap:wrap;font-size:.75rem;color:var(--text3)}
.header .meta-row span{display:inline-flex;align-items:center;gap:.3rem}

/* Verdict */
.verdict{margin:2rem 0 2.5rem;padding:1.5rem 2rem;border-radius:var(--radius);position:relative;overflow:hidden;display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap}
.verdict-pass{background:var(--green-bg);border:1px solid rgba(12,206,107,.25)}
.verdict-fail{background:var(--red-bg);border:1px solid rgba(255,78,66,.25)}
.verdict-review{background:var(--amber-bg);border:1px solid rgba(255,164,0,.25)}
.verdict-stamp{flex-shrink:0;text-align:center;padding:1rem 1.25rem;border-radius:var(--radius-sm);min-width:120px}
.verdict-pass .verdict-stamp{background:rgba(12,206,107,.15)}
.verdict-fail .verdict-stamp{background:rgba(255,78,66,.15)}
.verdict-review .verdict-stamp{background:rgba(255,164,0,.15)}
.verdict-stamp-big{font-family:'JetBrains Mono',monospace;font-size:1.5rem;font-weight:700;letter-spacing:.02em;margin-bottom:.25rem}
.verdict-pass .verdict-stamp-big{color:var(--green)}
.verdict-fail .verdict-stamp-big{color:var(--red)}
.verdict-review .verdict-stamp-big{color:var(--amber)}
.verdict-stamp-sub{font-size:.65rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);font-weight:600}
.verdict-body{flex:1;min-width:240px}
.verdict-body h2{font-size:1.3rem;font-weight:700;margin-bottom:.5rem}
.verdict-pass .verdict-body h2{color:var(--green)}
.verdict-fail .verdict-body h2{color:var(--red)}
.verdict-review .verdict-body h2{color:var(--amber)}
.verdict-reasons{list-style:none;margin-top:.75rem}
.verdict-reasons li{padding:.3rem 0;font-size:.85rem;color:var(--text2);border-left:2px solid var(--border2);padding-left:.75rem;margin-bottom:.2rem}

/* Gauges */
.gauges{display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;margin:2rem 0 2.5rem;padding:1.5rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}
.gauge{position:relative;text-align:center}
.gauge-val{position:absolute;top:50%;left:50%;transform:translate(-50%,-65%);font-size:1.55rem;font-weight:700;font-family:'JetBrains Mono',monospace}
.gauge-label{font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-top:.4rem;font-weight:600}

/* Sections */
.section{margin-top:2.5rem}
.section-title{font-size:1.05rem;font-weight:700;color:var(--text);padding-bottom:.5rem;border-bottom:1px solid var(--border);margin-bottom:1rem;display:flex;align-items:center;gap:.6rem}
.section-title .tag{font-size:.62rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;padding:.2rem .55rem;border-radius:100px;background:var(--surface3);color:var(--text3)}
.section-title .tag-ok{background:rgba(12,206,107,.15);color:var(--green)}
.section-title .tag-bad{background:rgba(255,78,66,.15);color:var(--red)}
.section-title .tag-warn{background:rgba(255,164,0,.15);color:var(--amber)}
.section-sub{font-size:.82rem;color:var(--text3);margin-bottom:.9rem}

/* Vitals */
.vitals{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.75rem;margin-bottom:.5rem}
.vital{padding:.9rem 1rem;border-radius:var(--radius-sm);border:1px solid var(--border)}
.vital-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:.45rem}
.vital-label{font-size:.7rem;color:var(--text2);font-weight:600;text-transform:uppercase;letter-spacing:.05em}
.vital-badge{font-size:.58rem;font-weight:700;padding:.12rem .4rem;border-radius:100px;text-transform:uppercase;letter-spacing:.04em}
.vital-value{font-family:'JetBrains Mono',monospace;font-size:1.2rem;font-weight:700;margin-bottom:.15rem}
.vital-threshold{font-size:.68rem;color:var(--text3);font-family:'JetBrains Mono',monospace}
.vital-good{background:var(--green-bg);border-color:rgba(12,206,107,.2)}.vital-good .vital-value,.vital-good .vital-badge{color:var(--green)}
.vital-needs-work{background:var(--amber-bg);border-color:rgba(255,164,0,.2)}.vital-needs-work .vital-value,.vital-needs-work .vital-badge{color:var(--amber)}
.vital-poor{background:var(--red-bg);border-color:rgba(255,78,66,.2)}.vital-poor .vital-value,.vital-poor .vital-badge{color:var(--red)}
.vital-na{background:var(--surface)}.vital-na .vital-value,.vital-na .vital-badge{color:var(--text3)}

/* Filmstrip */
.filmstrip{display:flex;gap:.45rem;overflow-x:auto;padding:.75rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm)}
.frame{flex-shrink:0;text-align:center}
.frame img{width:80px;height:auto;border:1px solid var(--border);border-radius:4px;background:#fff}
.frame-time{font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--text3);margin-top:.35rem}

/* Tables */
.table-wrap{overflow-x:auto;border-radius:var(--radius-sm);border:1px solid var(--border)}
table{width:100%;border-collapse:collapse;font-size:.82rem}
th{background:var(--surface2);color:var(--text3);font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:.65rem .85rem;text-align:left;white-space:nowrap}
td{padding:.6rem .85rem;border-top:1px solid var(--border);color:var(--text2);vertical-align:top}
tr:hover td{background:rgba(255,255,255,.015)}
td.num{font-family:'JetBrains Mono',monospace;font-weight:700;text-align:right;white-space:nowrap}
.savings-bar{display:inline-block;width:60px;height:4px;background:var(--surface3);border-radius:2px;overflow:hidden;vertical-align:middle;margin-right:.4rem}
.savings-bar-fill{height:100%;background:var(--red)}

/* Pixels grid */
.pixels{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.5rem}
.pixel{display:flex;align-items:center;gap:.5rem;padding:.6rem .75rem;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface);font-size:.8rem}
.pixel-yes{background:rgba(12,206,107,.05);border-color:rgba(12,206,107,.25)}
.pixel-no{opacity:.45}
.pixel-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;background:var(--text3)}
.pixel-yes .pixel-dot{background:var(--green);box-shadow:0 0 6px rgba(12,206,107,.6)}
.pixel-name{flex:1;font-weight:500}
.pixel-count{font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--text3)}

/* Issue lists */
.issues{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:.45rem}
.issue{padding:.6rem .8rem;border-radius:var(--radius-sm);background:var(--surface);border:1px solid var(--border);font-size:.8rem;display:flex;gap:.5rem;align-items:flex-start}
.issue-dot{width:6px;height:6px;border-radius:50%;margin-top:.5rem;flex-shrink:0}
.issue-bad .issue-dot{background:var(--red)}
.issue-warn .issue-dot{background:var(--amber)}

/* CRO */
.dim-row{display:flex;gap:.75rem;align-items:center;padding:.55rem 0;border-bottom:1px solid var(--border)}
.dim-row:last-child{border-bottom:none}
.dim-name{flex:1.2;font-size:.82rem;font-weight:500}
.dim-score{width:50px;text-align:center;font-family:'JetBrains Mono',monospace;font-weight:700}
.dim-note{flex:2;font-size:.76rem;color:var(--text3)}

/* Policy grid */
.policy{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:.5rem}
.policy-item{display:flex;gap:.5rem;padding:.65rem .8rem;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface);font-size:.82rem;align-items:center}
.policy-check{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;flex-shrink:0}
.policy-pass{background:rgba(12,206,107,.15);color:var(--green)}
.policy-fail{background:rgba(255,78,66,.15);color:var(--red)}
.policy-manual{background:var(--surface3);color:var(--text3)}

/* Evidence */
.evidence{padding:1rem 1.25rem;border-radius:var(--radius-sm);background:var(--surface);border:1px solid var(--border)}
.evidence li{margin-bottom:.35rem;font-size:.82rem;color:var(--text2);list-style:none}
.evidence code{font-family:'JetBrains Mono',monospace;font-size:.78rem;color:var(--blue)}

/* Footer */
.footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--border);text-align:center;font-size:.72rem;color:var(--text3);line-height:1.7}

/* Print */
@media print{
  :root{--bg:#fff;--surface:#f8f9fa;--surface2:#f0f1f4;--surface3:#e8eaf0;--border:#dee0e8;--border2:#ccc;--text:#1a1a2e;--text2:#444;--text3:#777;--green-bg:#e6f9ef;--amber-bg:#fff5e0;--red-bg:#ffeae8}
  body{background:#fff;color:#1a1a2e;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .page{max-width:100%;padding:1rem}
  .section,.verdict,.vital,.gauges,.evidence,.pixel,.issue,.policy-item,.dim-row{break-inside:avoid}
}
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="header-eyebrow">Landing Page Audit for Performance Marketers</div>
    <h1>Paid-traffic readiness report</h1>
    <div class="url">${esc(finalUrl)}</div>
    <div class="meta-row">
      <span>📅 ${esc(dateHuman)}</span>
      <span>🔦 Lighthouse ${esc(lhr.lighthouseVersion || '?')} (${esc(formFactor)})</span>
      <span>🎭 Playwright pixel probe</span>
      <span>🎯 CRO ${hasCro ? 'live' : 'skipped'}</span>
    </div>
  </div>

  <!-- Verdict -->
  <div class="verdict verdict-${verdictLevel}">
    <div class="verdict-stamp">
      <div class="verdict-stamp-big">${esc(verdictBadgeLabel)}</div>
      <div class="verdict-stamp-sub">${esc(verdictBadgeSub)}</div>
    </div>
    <div class="verdict-body">
      <h2>${esc(verdictTitle)}</h2>
      <ul class="verdict-reasons">
${verdictReasons.map((r) => `        <li>${esc(r)}</li>`).join('\n')}
      </ul>
    </div>
  </div>

  <!-- Scorecard gauges -->
  <div class="gauges">
    ${gaugeRing(perf, 'Performance')}
    ${gaugeRing(a11y, 'A11y')}
    ${gaugeRing(bp, 'Best Practices')}
    ${gaugeRing(seo, 'SEO')}
    ${hasCro ? gaugeRing(Math.round(cro.overall_score), `CRO · ${cro.letter_grade}`) : ''}
  </div>

  <!-- Core Web Vitals -->
  <div class="section">
    <div class="section-title">Core Web Vitals <span class="tag">Lab · ${esc(formFactor)}</span></div>
    <p class="section-sub">Thresholds: Google's "Good" bar for Page Experience. Field (CrUX) data is authoritative for Quality Score — confirm in PageSpeed Insights when campaign live.</p>
    <div class="vitals">
      ${vitalPill('LCP', lcp?.displayValue || '—', vitalRating('lcp', lcp?.numericValue), 'Good ≤ 2.5s · Poor > 4s')}
      ${vitalPill('CLS', cls?.displayValue || '—', vitalRating('cls', cls?.numericValue), 'Good ≤ 0.1 · Poor > 0.25')}
      ${vitalPill('TBT', tbt?.displayValue || '—', vitalRating('tbt', tbt?.numericValue), 'Good ≤ 200ms · Poor > 600ms')}
      ${vitalPill('FCP', fcp?.displayValue || '—', vitalRating('fcp', fcp?.numericValue), 'Good ≤ 1.8s · Poor > 3s')}
      ${vitalPill('Speed Index', si?.displayValue || '—', vitalRating('si', si?.numericValue), 'Good ≤ 3.4s · Poor > 5.8s')}
      ${vitalPill('INP', inp?.displayValue || 'Field only', 'na', 'Field-data metric')}
    </div>
  </div>

${filmstrip.length > 0 ? `
  <!-- Filmstrip -->
  <div class="section">
    <div class="section-title">Load Filmstrip <span class="tag">${filmstrip.length} frames</span></div>
    <p class="section-sub">What the visitor sees during load. Blank frames past 2s are perceived as slow — fix with critical CSS, preload hero media, and faster TTFB.</p>
    <div class="filmstrip">
${filmstrip.map((f) => `      <div class="frame">
        <img src="${f.data}" alt="frame"/>
        <div class="frame-time">${(f.timing / 1000).toFixed(1)}s</div>
      </div>`).join('\n')}
    </div>
  </div>` : ''}

${opportunities.length > 0 ? `
  <!-- Opportunities -->
  <div class="section">
    <div class="section-title">Performance Opportunities <span class="tag tag-warn">${opportunities.length} findings</span></div>
    <p class="section-sub">Ranked by estimated load-time savings. These are the P0/P1 engineering tickets that directly lift Quality Score and reduce CPC.</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th style="width:45%">Audit</th><th>Savings</th><th>Size</th><th>Biggest offender</th></tr></thead>
        <tbody>
${opportunities.slice(0, 10).map((o) => {
  const maxSavings = Math.max(...opportunities.map((x) => x.savingsMs));
  const pct = Math.min(100, (o.savingsMs / Math.max(maxSavings, 1)) * 100);
  const topUrl = o.items[0]?.url ? o.items[0].url.replace(/^https?:\/\//, '').slice(0, 60) : '—';
  return `          <tr>
            <td><strong style="color:var(--text)">${esc(o.title)}</strong><br/><span style="font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--text3)">${esc(o.id)}</span></td>
            <td class="num"><span class="savings-bar"><span class="savings-bar-fill" style="width:${pct}%"></span></span>${fmtMs(o.savingsMs)}</td>
            <td class="num">${fmtKB(o.savingsBytes)}</td>
            <td><code style="font-size:.72rem;color:var(--text3)">${esc(topUrl)}</code></td>
          </tr>`;
}).join('\n')}
        </tbody>
      </table>
    </div>
  </div>` : ''}

${thirdParties.length > 0 ? `
  <!-- Third parties -->
  <div class="section">
    <div class="section-title">Third-Party Impact <span class="tag">${thirdParties.length} entities</span></div>
    <p class="section-sub">Every marketing pixel adds to blocking time. If TBT is high, the biggest offenders here are where to start (server-side tagging, async tags, or removing unused tools).</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Entity</th><th>Blocking time</th><th>Main thread</th><th>Transfer</th></tr></thead>
        <tbody>
${thirdParties.map((t) => {
  const blockColor = t.blockingTime > 250 ? 'var(--red)' : t.blockingTime > 100 ? 'var(--amber)' : 'var(--text2)';
  return `          <tr>
            <td><strong>${esc(t.entity || 'Unknown')}</strong></td>
            <td class="num" style="color:${blockColor}">${fmtMs(t.blockingTime)}</td>
            <td class="num">${fmtMs(t.mainThreadTime)}</td>
            <td class="num">${fmtKB(t.transferSize)}</td>
          </tr>`;
}).join('\n')}
        </tbody>
      </table>
    </div>
  </div>` : ''}

  <!-- Tracking pixels -->
  <div class="section">
    <div class="section-title">Conversion Tracking & Pixels <span class="tag ${conversionTracking ? 'tag-ok' : 'tag-bad'}">${detectedPixelNames.length} detected</span></div>
    <p class="section-sub">${conversionTracking ? 'Conversion tracking confirmed live on page load.' : analyticsOnly ? 'Only analytics detected — no conversion pixel will fire for paid campaigns.' : 'No marketing pixels detected — campaigns cannot optimize or measure ROAS.'}</p>
    <div class="pixels">
${Object.entries(pixels).map(([name, info]) => `      <div class="pixel ${info.detected ? 'pixel-yes' : 'pixel-no'}">
        <span class="pixel-dot"></span>
        <span class="pixel-name">${esc(name)}</span>
        <span class="pixel-count">${info.detected ? info.requestCount + ' req' : '—'}</span>
      </div>`).join('\n')}
    </div>
${probe.consentBannerDetected ? '    <p style="margin-top:.75rem;font-size:.78rem;color:var(--amber)">⚠ Consent banner detected — pixel firing may be gated by user consent. Verify with consent accepted in a second run.</p>' : ''}
  </div>

  <!-- Form & CTA inventory -->
  <div class="section">
    <div class="section-title">Forms & CTAs <span class="tag">${probe.forms?.length || 0} form(s) · ${probe.ctas?.length || 0} CTA(s)</span></div>
${probe.forms && probe.forms.length > 0 ? `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Form</th><th>Method</th><th>Visible fields</th><th>Field types</th></tr></thead>
        <tbody>
${probe.forms.map((f, i) => `          <tr>
            <td>Form #${i + 1}${f.action ? `<br/><span style="font-family:&#39;JetBrains Mono&#39;,monospace;font-size:.7rem;color:var(--text3)">${esc(f.action)}</span>` : ''}</td>
            <td class="num">${esc(f.method)}</td>
            <td class="num" style="color:${f.fieldCount <= 3 ? 'var(--green)' : f.fieldCount <= 6 ? 'var(--amber)' : 'var(--red)'}">${f.fieldCount}</td>
            <td><span style="font-family:'JetBrains Mono',monospace;font-size:.72rem;color:var(--text3)">${esc(f.fieldTypes.slice(0, 8).join(', '))}</span></td>
          </tr>`).join('\n')}
        </tbody>
      </table>
    </div>` : '    <p style="font-size:.82rem;color:var(--text3)">No HTML forms found — this is a link-only landing page. Ensure CTAs deep-link to a form on a subsequent page or trigger a chat widget.</p>'}
${probe.ctas && probe.ctas.length > 0 ? `
    <p style="font-size:.78rem;color:var(--text3);margin-top:.75rem">CTA labels detected: ${probe.ctas.slice(0, 8).map((c) => `<code style="color:var(--text2);background:var(--surface2);padding:.1rem .4rem;border-radius:3px;font-size:.72rem">${esc(c)}</code>`).join(' ')}</p>` : ''}
  </div>

${hasCro ? `
  <!-- CRO -->
  <div class="section">
    <div class="section-title">Conversion Rate Optimization <span class="tag">${esc(cro.letter_grade)} · ${esc(cro.overall_score)}/100</span></div>
${cro.benchmark_comparison ? `    <p class="section-sub">Industry benchmark: <strong>${esc(cro.benchmark_comparison.industry)}</strong> — avg ${esc(cro.benchmark_comparison.industry_avg)}, top quartile ${esc(cro.benchmark_comparison.top_quartile)}. You are <span style="color:${cro.benchmark_comparison.vs_avg >= 0 ? 'var(--green)' : 'var(--red)'}">${cro.benchmark_comparison.vs_avg >= 0 ? '↑' : '↓'}${Math.abs(cro.benchmark_comparison.vs_avg)} pts vs avg</span>, <span style="color:${cro.benchmark_comparison.vs_top >= 0 ? 'var(--green)' : 'var(--red)'}">${cro.benchmark_comparison.vs_top >= 0 ? '↑' : '↓'}${Math.abs(cro.benchmark_comparison.vs_top)} pts vs top</span>.</p>` : ''}
    <div style="padding:0 .25rem">
      <div class="dim-row" style="padding-bottom:.4rem;margin-bottom:.25rem;border-bottom:1px solid var(--border2)">
        <div class="dim-name" style="font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text3);font-weight:700">Dimension</div>
        <div class="dim-score" style="font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text3);font-weight:700">Score</div>
        <div class="dim-note" style="font-size:.66rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text3);font-weight:700">Finding</div>
      </div>
${Object.entries(cro.dimensions || {}).map(([k, d]) => {
  const c = scoreColor(d.score);
  const finding = (d.findings && d.findings[0]) || '—';
  return `      <div class="dim-row">
        <div class="dim-name">${esc(d.name)}</div>
        <div class="dim-score" style="color:${c}">${d.score}</div>
        <div class="dim-note">${esc(finding)}</div>
      </div>`;
}).join('\n')}
    </div>
${(cro.priority_fixes && cro.priority_fixes.length > 0) ? `
    <p style="font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text3);font-weight:700;margin:1.25rem 0 .5rem">Top CRO fixes</p>
${cro.priority_fixes.slice(0, 6).map((f) => {
  const c = f.impact === 'HIGH' ? 'var(--red)' : f.impact === 'MEDIUM' ? 'var(--amber)' : 'var(--green)';
  return `    <div style="display:flex;gap:.55rem;align-items:flex-start;margin-bottom:.45rem;font-size:.82rem">
      <span style="flex-shrink:0;font-size:.6rem;font-weight:700;padding:.15rem .4rem;border-radius:4px;background:rgba(255,255,255,.04);color:${c};text-transform:uppercase;letter-spacing:.04em">${esc(f.impact)}</span>
      <span style="color:var(--text2)"><strong style="color:var(--text)">${esc(f.dimension)}</strong> — ${esc(f.fix)}</span>
    </div>`;
}).join('\n')}` : ''}
  </div>` : ''}

${a11yIssues.length > 0 ? `
  <!-- A11y issues -->
  <div class="section">
    <div class="section-title">Accessibility Issues <span class="tag tag-warn">${a11yIssues.length} to fix</span></div>
    <p class="section-sub">A11y failures exclude users and create legal risk. They also drag Google Ads Quality Score because the Page Experience signal rewards usability.</p>
    <div class="issues">
${a11yIssues.slice(0, 15).map((i) => `      <div class="issue issue-${i.score === 0 ? 'bad' : 'warn'}">
        <span class="issue-dot"></span>
        <span>${esc(i.title)}<br/><span style="font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--text3)">${esc(i.id)}</span></span>
      </div>`).join('\n')}
    </div>
  </div>` : ''}

${seoIssues.length > 0 || bpIssues.length > 0 ? `
  <!-- SEO + Best Practices issues -->
  <div class="section">
    <div class="section-title">SEO & Best Practices <span class="tag">${seoIssues.length + bpIssues.length} items</span></div>
    <div class="issues">
${[...seoIssues.map((i) => ({ ...i, cat: 'SEO' })), ...bpIssues.map((i) => ({ ...i, cat: 'BP' }))].slice(0, 20).map((i) => `      <div class="issue issue-${i.score === 0 ? 'bad' : 'warn'}">
        <span class="issue-dot"></span>
        <span><strong style="color:var(--text);font-size:.75rem">${esc(i.cat)}</strong> · ${esc(i.title)}</span>
      </div>`).join('\n')}
    </div>
  </div>` : ''}

  <!-- Diagnostics -->
${diagnostics.length > 0 ? `
  <div class="section">
    <div class="section-title">Performance Diagnostics</div>
    <div class="issues">
${diagnostics.slice(0, 12).map((d) => `      <div class="issue issue-${(d.score ?? 1) < 0.5 ? 'bad' : 'warn'}">
        <span class="issue-dot"></span>
        <span><strong style="color:var(--text);font-size:.8rem">${esc(d.title)}</strong>${d.displayValue ? `<br/><span style="font-family:&#39;JetBrains Mono&#39;,monospace;font-size:.72rem;color:var(--text3)">${esc(d.displayValue)}</span>` : ''}</span>
      </div>`).join('\n')}
    </div>
  </div>` : ''}

  <!-- Page weight -->
  <div class="section">
    <div class="section-title">Page Weight & Compute</div>
    <div class="vitals">
      <div class="vital vital-na">
        <div class="vital-top"><span class="vital-label">Total bytes</span></div>
        <div class="vital-value">${fmtKB(totalByteWeight)}</div>
        <div class="vital-threshold">Total network transfer</div>
      </div>
      <div class="vital vital-na">
        <div class="vital-top"><span class="vital-label">DOM nodes</span></div>
        <div class="vital-value">${dom != null ? dom.toLocaleString() : '—'}</div>
        <div class="vital-threshold">Good ≤ 1,500 · Poor > 3,000</div>
      </div>
      <div class="vital vital-na">
        <div class="vital-top"><span class="vital-label">Main thread</span></div>
        <div class="vital-value">${fmtMs(mainThreadWork)}</div>
        <div class="vital-threshold">Scripting + style + layout</div>
      </div>
      <div class="vital vital-na">
        <div class="vital-top"><span class="vital-label">JS bootup</span></div>
        <div class="vital-value">${fmtMs(bootupTime)}</div>
        <div class="vital-threshold">Parse + compile + execute</div>
      </div>
    </div>
  </div>

  <!-- Ad platform policy -->
  <div class="section">
    <div class="section-title">Ad-Platform Policy Checks <span class="tag">Google · LinkedIn · Meta · Microsoft</span></div>
    <p class="section-sub">Landing-page items that block ad approval across major platforms. Manual items are flagged — walk them with the media team before launch.</p>
    <div class="policy">
${[
  { label: 'HTTPS', pass: isHttps, auto: true },
  { label: 'Viewport meta (mobile)', pass: viewportOk, auto: true },
  { label: 'Content fits viewport', pass: contentWidthOk, auto: true },
  { label: 'Tap targets ≥ 44px', pass: tapTargetsOk, auto: true },
  { label: 'Privacy policy link', pass: probe.policyLinks?.privacy, auto: true },
  { label: 'Terms link', pass: probe.policyLinks?.terms, auto: true },
  { label: 'Contact link', pass: probe.policyLinks?.contact, auto: true },
  { label: 'Consent banner (if EU/UK)', pass: probe.consentBannerDetected, auto: true, neutral: true },
  { label: 'Clear business identity', pass: null, auto: false },
  { label: 'Message match to ad copy', pass: null, auto: false },
  { label: 'No prohibited content', pass: null, auto: false },
  { label: 'Industry disclosures (finance/health)', pass: null, auto: false },
].map((p) => {
  const cls = p.pass === true ? 'policy-pass' : p.pass === false ? 'policy-fail' : 'policy-manual';
  const glyph = p.pass === true ? '✓' : p.pass === false ? '✗' : '?';
  const note = !p.auto ? ' <span style="color:var(--text3);font-size:.7rem">(manual)</span>' : '';
  return `      <div class="policy-item">
        <span class="policy-check ${cls}">${glyph}</span>
        <span>${esc(p.label)}${note}</span>
      </div>`;
}).join('\n')}
    </div>
  </div>

  <!-- Quality Score composite -->
  <div class="section">
    <div class="section-title">Quality Score Signals <span class="tag">Composite view</span></div>
    <p class="section-sub">Google Ads Quality Score has three components. Landing page experience is fully auditable here. Expected CTR and Ad Relevance require ad account data.</p>
    <div class="policy">
      <div class="policy-item">
        <span class="policy-check ${perf >= 75 ? 'policy-pass' : perf >= 50 ? 'policy-manual' : 'policy-fail'}">${perf >= 75 ? '✓' : perf >= 50 ? '~' : '✗'}</span>
        <span>Landing page experience (Perf ${perf ?? '—'}/100, A11y ${a11y ?? '—'}/100)</span>
      </div>
      <div class="policy-item">
        <span class="policy-check ${isHttps ? 'policy-pass' : 'policy-fail'}">${isHttps ? '✓' : '✗'}</span>
        <span>Secure (HTTPS)</span>
      </div>
      <div class="policy-item">
        <span class="policy-check ${viewportOk && contentWidthOk ? 'policy-pass' : 'policy-fail'}">${viewportOk && contentWidthOk ? '✓' : '✗'}</span>
        <span>Mobile-friendly</span>
      </div>
      <div class="policy-item">
        <span class="policy-check ${conversionTracking ? 'policy-pass' : 'policy-fail'}">${conversionTracking ? '✓' : '✗'}</span>
        <span>Conversion tracking firing</span>
      </div>
      <div class="policy-item">
        <span class="policy-check policy-manual">?</span>
        <span>Expected CTR <span style="color:var(--text3);font-size:.7rem">(ad account)</span></span>
      </div>
      <div class="policy-item">
        <span class="policy-check policy-manual">?</span>
        <span>Ad relevance to page copy <span style="color:var(--text3);font-size:.7rem">(manual)</span></span>
      </div>
    </div>
  </div>

  <!-- Evidence -->
  <div class="section">
    <div class="section-title">Evidence <span class="tag">This run</span></div>
    <ul class="evidence">
      <li>📄 <code>${esc(lhrPath.replace(root + '/', ''))}</code> — Lighthouse JSON (full LHR)</li>
      <li>📄 <code>${esc(lhrPath.replace(/\.json$/, '.html').replace(root + '/', ''))}</code> — Lighthouse HTML (deep-dive)</li>
      <li>📄 <code>${esc(probePath.replace(root + '/', ''))}</code> — Playwright probe JSON</li>
${croPath ? `      <li>📄 <code>${esc(croPath.replace(root + '/', ''))}</code> — CRO 8-dimension JSON</li>` : ''}
    </ul>
  </div>

  <div class="footer">
    Landing-page audit for performance marketers — Lighthouse ${esc(lhr.lighthouseVersion || '?')} + Playwright + conversion-ops.<br/>
    Regenerate: <code style="font-family:'JetBrains Mono',monospace;font-size:.72rem;color:var(--blue)">npm run report -- &lt;url&gt; [industry]</code>.
    Lab data only — confirm CrUX / field data in PageSpeed Insights for Quality Score impact.
  </div>
</div>
</body>
</html>`;

writeFileSync(outHtml, html, 'utf8');
console.log(`Unified report written: ${outHtml}`);
