# Google Ads readiness audit — one report

**Does not use** the deprecated `lighthouse-plugin-publisher-ads` npm package (incompatible with current Lighthouse). Runs **stock Lighthouse** and **Playwright**, then writes **a single narrative HTML file**:

```
reports/readiness-report.html
```

Supporting machine files (same folder, overwritten each run):

- `reports/latest-lh.report.json` / `.report.html`
- `reports/latest-probe.json`

## Setup

```bash
npm install
npx playwright install chromium
```

## Run (one command)

```bash
npm run report -- https://example.com
open reports/readiness-report.html
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run report` | Full pipeline: Lighthouse + Playwright + unified HTML |
| `npm run lh` | Stock Lighthouse only |
| `npm run probe` | Playwright network/console probe only |

## Cursor skills

- `google-ads-readiness-modern` — CRO + DevTools + bundled Publisher Ads docs (concepts only).
- `publisher-ads-readiness` — Stock Lighthouse report template + 24 upstream audit explainers.
- `google-ads-audit-skills-checklist` — 24 standalone audit playbook files.
- `conversion-ops` — Eric Siu CRO 8-dimension framework (pair with this project).
