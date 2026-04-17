/**
 * Regenerates skills/*.md from publisher-ads-readiness bundled audits.
 * Run: node scripts/build-skill-files.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const AUDIT_SRC = path.join(ROOT, '../publisher-ads-readiness/reference/audits');
const OUT = path.join(ROOT, 'skills');

/** [auditId, skillFilename] — matches GOOGLE-ADS-AUDIT-SKILLS-CHECKLIST.md */
const MAP = [
  ['ad-blocking-tasks', 'skill-ad-blocking-tasks.md'],
  ['ad-render-blocking-resources', 'skill-ad-render-blocking-resources.md'],
  ['ad-request-critical-path', 'skill-ad-request-critical-path.md'],
  ['ad-request-from-page-start', 'skill-ad-request-from-page-start.md'],
  ['ad-request-from-tag-load', 'skill-ad-request-from-tag-load.md'],
  ['ad-top-of-viewport', 'skill-ad-top-of-viewport.md'],
  ['ads-in-viewport', 'skill-ads-in-viewport.md'],
  ['async-ad-tags', 'skill-async-ad-tags.md'],
  ['bid-request-from-page-start', 'skill-bid-request-from-page-start.md'],
  ['blocking-load-events', 'skill-blocking-load-events.md'],
  ['bottleneck-requests', 'skill-bottleneck-requests.md'],
  ['cumulative-ad-shift', 'skill-cumulative-ad-shift.md'],
  ['deprecated-api-usage', 'skill-deprecated-api-usage.md'],
  ['duplicate-tags', 'skill-duplicate-tags.md'],
  ['first-ad-render', 'skill-first-ad-render.md'],
  ['gpt-bids-parallel', 'skill-gpt-bids-parallel.md'],
  ['gpt-errors-overall', 'skill-gpt-errors-overall.md'],
  ['loads-ad-tag-over-https', 'skill-loads-ad-tag-over-https.md'],
  ['loads-gpt-from-official-source', 'skill-loads-gpt-from-official-source.md'],
  ['script-injected-tags', 'skill-script-injected-tags.md'],
  ['serial-header-bidding', 'skill-serial-header-bidding.md'],
  ['tag-load-time', 'skill-tag-load-time.md'],
  ['total-ad-blocking-time', 'skill-total-ad-blocking-time.md'],
  ['viewport-ad-density', 'skill-viewport-ad-density.md'],
];

const META = {
  'ad-blocking-tasks': { category: 'Performance', level: 'Intermediate', impact: 'High' },
  'ad-render-blocking-resources': { category: 'Performance', level: 'Intermediate', impact: 'High' },
  'ad-request-critical-path': { category: 'Performance', level: 'Intermediate', impact: 'High' },
  'ad-request-from-page-start': { category: 'Performance', level: 'Beginner', impact: 'High' },
  'ad-request-from-tag-load': { category: 'Performance', level: 'Intermediate', impact: 'High' },
  'ad-top-of-viewport': { category: 'Layout / monetization', level: 'Beginner', impact: 'Medium' },
  'ads-in-viewport': { category: 'Layout / monetization', level: 'Beginner', impact: 'Medium' },
  'async-ad-tags': { category: 'Performance', level: 'Beginner', impact: 'High' },
  'bid-request-from-page-start': { category: 'Performance', level: 'Intermediate', impact: 'High' },
  'blocking-load-events': { category: 'Performance', level: 'Intermediate', impact: 'High' },
  'bottleneck-requests': { category: 'Performance', level: 'Intermediate', impact: 'High' },
  'cumulative-ad-shift': { category: 'Performance', level: 'Intermediate', impact: 'High' },
  'deprecated-api-usage': { category: 'Best practices', level: 'Intermediate', impact: 'Medium' },
  'duplicate-tags': { category: 'Best practices', level: 'Beginner', impact: 'High' },
  'first-ad-render': { category: 'Performance', level: 'Intermediate', impact: 'High' },
  'gpt-bids-parallel': { category: 'Performance', level: 'Advanced', impact: 'High' },
  'gpt-errors-overall': { category: 'Best practices', level: 'Intermediate', impact: 'High' },
  'loads-ad-tag-over-https': { category: 'Best practices', level: 'Beginner', impact: 'High' },
  'loads-gpt-from-official-source': { category: 'Best practices', level: 'Beginner', impact: 'High' },
  'script-injected-tags': { category: 'Best practices', level: 'Intermediate', impact: 'High' },
  'serial-header-bidding': { category: 'Performance', level: 'Advanced', impact: 'High' },
  'tag-load-time': { category: 'Performance', level: 'Intermediate', impact: 'High' },
  'total-ad-blocking-time': { category: 'Performance', level: 'Intermediate', impact: 'High' },
  'viewport-ad-density': { category: 'Layout / monetization', level: 'Beginner', impact: 'Medium' },
};

const SOURCE =
  'https://github.com/googleads/publisher-ads-lighthouse-plugin/tree/main/docs/audits';

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [auditId, outName] of MAP) {
    const srcPath = path.join(AUDIT_SRC, `${auditId}.md`);
    if (!fs.existsSync(srcPath)) {
      console.error('Missing:', srcPath);
      process.exit(1);
    }
    let body = fs.readFileSync(srcPath, 'utf8');
    const firstLine = body.split('\n')[0] || '';
    const title = firstLine.replace(/^#\s*/, '').trim() || auditId;
    // Drop upstream H1 so "Audit Skill:" is the only top-level title
    body = body.replace(/^#\s[^\n]*\n+/, '');
    const m = META[auditId] || {
      category: 'Performance',
      level: 'Intermediate',
      impact: 'Medium',
    };

    const header = `# Audit Skill: ${title}

**Category**: ${m.category}  
**Lighthouse audit ID**: \`${auditId}\`  
**Skill level**: ${m.level}  
**Typical impact**: ${m.impact}  
**Upstream source**: [Publisher Ads Lighthouse plugin — docs/audits](${SOURCE})

---

`;

    const outPath = path.join(OUT, outName);
    fs.writeFileSync(outPath, header + body.trimStart() + '\n', 'utf8');
    console.log('Wrote', outPath);
  }
}

main();
