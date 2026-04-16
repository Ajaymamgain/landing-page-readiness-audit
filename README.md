# Google Ads readiness audit (Lighthouse + Playwright)

**Does not use** the deprecated `lighthouse-plugin-publisher-ads` npm package. Use **stock Lighthouse** (v12+) and **Playwright** to capture lab scores plus real-network hints (GPT / Google ad domains) and console errors.

## Setup

```bash
cd ~/Projects/google-ads-readiness-audit
npm install
npx playwright install chromium   # once per machine
```

## Run

```bash
npm run audit -- https://example.com my-basename
```

Outputs under `reports/`:

- `my-basename-lh.report.json` / `.html` — Lighthouse
- `my-basename-probe.json` — Playwright

## Cursor skill

See `~/.cursor/skills/google-ads-readiness-modern/` for methodology, DevTools checklist, and **CRO prioritization** (`reference/cro-prioritization.md`).
