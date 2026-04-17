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

## Agent skills (bundled in this repo)

**Before every run:** see **[`docs/EVERY-RUN.md`](docs/EVERY-RUN.md)** — audit command, Cursor/Claude symlinks, optional Codex Obsidian bootstrap, and which publisher skills matter.

### Cursor — `cursor-skills/`

Same layout as `~/.cursor/skills/<name>/`. Each folder has `SKILL.md` (YAML frontmatter) plus `reference/`, `templates/`, or `scripts/` as needed.

| Folder | Role |
|--------|------|
| `cursor-skills/performance-marketer-landing-page/` | Primary skill for this pipeline: landing-page audit, Lighthouse + Playwright, stakeholder HTML report. |
| `cursor-skills/google-ads-readiness-modern/` | CRO prioritization, DevTools checklist, Publisher Ads concepts (no deprecated plugin). |
| `cursor-skills/publisher-ads-readiness/` | Stock Lighthouse–style report template + upstream Publisher Ads audit explainers. |
| `cursor-skills/publisher-ads-google-ads-report/` | Lighthouse + Publisher Ads plugin workflow (legacy stack); scripts and templates for comparison. |
| `cursor-skills/google-ads-audit-skills-checklist/` | 24 standalone audit playbooks + build script. |
| `cursor-skills/conversion-ops/` | Eric Siu–style CRO 8-dimension framework (pairs with the audit). |
| `cursor-skills/obsidian-skills-bootstrap/` | Installs [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) into `~/.codex/skills` (Codex). |

**Symlink example (Cursor):**

```bash
ln -sf "$(pwd)/cursor-skills/performance-marketer-landing-page" ~/.cursor/skills/performance-marketer-landing-page
```

### Claude Code — `claude-skills/`

A **synced copy** of `cursor-skills/` (same files). After editing anything under `cursor-skills/`, run:

```bash
./scripts/sync-skills-dirs.sh
```

**Symlink example (Claude):**

```bash
ln -sf "$(pwd)/claude-skills/performance-marketer-landing-page" ~/.claude/skills/performance-marketer-landing-page
```

### Do you still need the publisher skills?

- **Landing pages for paid campaigns (Google Ads, LinkedIn, Meta, etc.):** you need **`performance-marketer-landing-page`**, **`conversion-ops`**, and **`google-ads-readiness-modern`**. You do **not** need the publisher-only bundles for that path.
- **Sites monetized with GAM / GPT / AdSense (inventory):** keep **`publisher-ads-readiness`**, **`publisher-ads-google-ads-report`**, and **`google-ads-audit-skills-checklist`** as reference for tag, bid, and layout audits.
