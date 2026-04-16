# Google Ads readiness audit — **one report**

**Does not use** the deprecated `lighthouse-plugin-publisher-ads` npm package (incompatible with current Lighthouse). This tool runs **stock Lighthouse** and **Playwright**, then writes **a single narrative HTML file**:

```
reports/readiness-report.html
```

Supporting machine files (same folder, overwritten each run):

- `reports/latest-lh.report.json` / `.report.html`
- `reports/latest-probe.json`

## Setup

```bash
cd ~/Projects/google-ads-readiness-audit
npm install
npx playwright install chromium
```

## Run (one command)

```bash
npm run report -- https://example.com
open reports/readiness-report.html
```

## Cursor skill

`~/.cursor/skills/google-ads-readiness-modern/` — CRO + DevTools + bundled Publisher Ads *docs* (concepts only).
