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

## Cursor skills (bundled in this repo)

The full skill trees live under **`cursor-skills/`** (same layout as `~/.cursor/skills/<name>/`). Each folder contains `SKILL.md` plus `reference/`, `templates/`, or `scripts/` as needed.

| Folder | Role |
|--------|------|
| `cursor-skills/performance-marketer-landing-page/` | Primary skill for this pipeline: landing-page audit, Lighthouse + Playwright, stakeholder HTML report. |
| `cursor-skills/google-ads-readiness-modern/` | CRO prioritization, DevTools checklist, Publisher Ads concepts (no deprecated plugin). |
| `cursor-skills/publisher-ads-readiness/` | Stock Lighthouse–style report template + upstream Publisher Ads audit explainers. |
| `cursor-skills/publisher-ads-google-ads-report/` | Lighthouse + Publisher Ads plugin workflow (legacy stack); scripts and templates for comparison. |
| `cursor-skills/google-ads-audit-skills-checklist/` | 24 standalone audit playbooks + build script. |
| `cursor-skills/conversion-ops/` | Eric Siu–style CRO 8-dimension framework (pairs with the audit). |

**Use in Cursor:** copy or symlink a skill into your user skills directory, for example:

```bash
ln -s "$(pwd)/cursor-skills/performance-marketer-landing-page" ~/.cursor/skills/performance-marketer-landing-page
```

Repeat for any other folder under `cursor-skills/` you want the agent to load globally, or keep the repo open as the workspace so paths stay relative to the project.
