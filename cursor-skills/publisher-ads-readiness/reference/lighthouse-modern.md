# Stock Lighthouse CLI (no Publisher Ads plugin)

## Requirements

- **Node.js** 22.x or newer (matches current Lighthouse).
- **Chrome / Chromium**; set `CHROME_PATH` if needed.
- Install Lighthouse in a project or use `npx lighthouse@latest` for one-off runs.

## Default run

```bash
npx lighthouse "https://www.example.com/path" \
  --output=json --output=html \
  --output-path=./reports/readiness-run \
  --chrome-flags="--headless=new" \
  --quiet
```

Artifacts: `reports/readiness-run.report.json` and `reports/readiness-run.report.html`.

## Do not use

- **`--plugins=lighthouse-plugin-publisher-ads`** — out of scope for this skill’s primary workflow. If the user later runs the plugin in another project, they may supply that JSON separately; the skill’s default rubric assumes **stock** LHR only.

## Useful flags

- `--preset=desktop` — desktop lab profile.
- `--only-categories=performance` — narrow scope for iteration.
- `--save-assets` — traces (large files).
- `--view` — open HTML after run.

## JSON fields to read first

- `categories.performance`, `categories.accessibility`, `categories['best-practices']`, `categories.seo` — scores are 0–1; multiply by 100 for display.
- `audits['largest-contentful-paint']`, `audits['cumulative-layout-shift']`, `audits['total-blocking-time']` — lab signals.

## Notes

- Exit code may be `0` even when scores are poor; gate on JSON.
- Control variance with consistent hardware and flags when comparing runs.

## Optional: build Lighthouse from source

If you need the CLI from a specific Lighthouse commit (e.g. contributing upstream), see [lighthouse-develop-984294e.md](lighthouse-develop-984294e.md) for the **Develop → Setup / Run** pattern (`yarn`, `yarn build-all`, `node cli <url>`).
