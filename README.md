# Landing page readiness audit — one report

Runs **stock Lighthouse** and **Playwright** (no deprecated `lighthouse-plugin-publisher-ads` npm package). Output is **one narrative HTML file**:

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

## Agent skills (bundled in this repo)

The audit **code** only uses `scripts/` and Node deps; skills are for Cursor / Claude agents. This repo ships **two** bundles (same layout as `~/.cursor/skills/<name>/`):

| Folder | Role |
|--------|------|
| `cursor-skills/performance-marketer-landing-page/` | How to run and interpret this pipeline (report sections, rubric, tracking pixels, policy checklist). |
| `cursor-skills/conversion-ops/` | How to install and use upstream **conversion-ops** / `cro_audit.py` for the CRO section of the report. |

**Before every run:** **[`docs/EVERY-RUN.md`](docs/EVERY-RUN.md)**.

**Cursor** — symlink into user skills:

```bash
ln -sf "$(pwd)/cursor-skills/performance-marketer-landing-page" ~/.cursor/skills/performance-marketer-landing-page
ln -sf "$(pwd)/cursor-skills/conversion-ops" ~/.cursor/skills/conversion-ops
```

**Claude Code** — same paths, `~/.claude/skills/`:

```bash
ln -sf "$(pwd)/cursor-skills/performance-marketer-landing-page" ~/.claude/skills/performance-marketer-landing-page
ln -sf "$(pwd)/cursor-skills/conversion-ops" ~/.claude/skills/conversion-ops
```
