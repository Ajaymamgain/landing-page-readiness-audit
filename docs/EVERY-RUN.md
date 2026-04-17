# Every run — agents & humans

Use this checklist whenever you run the audit pipeline or refresh agent tooling from this repo.

## 1. Landing-page audit (this project)

```bash
cd /path/to/landing-page-readiness-audit   # or your clone folder
npm install
npx playwright install chromium
npm run report -- https://example.com/path
open reports/readiness-report.html
```

## 2. Cursor / Claude skills from this repo

Bundled skills live in **`cursor-skills/`** and **`claude-skills/`** (kept in sync; see `scripts/sync-skills-dirs.sh`).

**Cursor** — symlink into user skills:

```bash
ln -sf "$(pwd)/cursor-skills/performance-marketer-landing-page" ~/.cursor/skills/performance-marketer-landing-page
```

**Claude Code** — symlink into user skills:

```bash
ln -sf "$(pwd)/claude-skills/performance-marketer-landing-page" ~/.claude/skills/performance-marketer-landing-page
```

Repeat for any other skill folder you need globally.

## 3. Codex + Obsidian skills (optional)

Only when you need Obsidian vault automation in Codex. Follow **`cursor-skills/obsidian-skills-bootstrap/SKILL.md`** (same content as **`claude-skills/obsidian-skills-bootstrap/SKILL.md`**): install missing skills from `kepano/obsidian-skills`, then **restart Codex**.

Canonical install:

```bash
cd ~/.codex/skills/.system/skill-installer/scripts && \
python3 install-skill-from-github.py \
  --repo kepano/obsidian-skills \
  --path skills/defuddle skills/json-canvas skills/obsidian-bases skills/obsidian-cli skills/obsidian-markdown
```

## 4. Do you need publisher (GAM/GPT) skills?

- **Paid traffic landing pages (Google Ads, LinkedIn, Meta, etc.):** use **`performance-marketer-landing-page`**, **`conversion-ops`**, and **`google-ads-readiness-modern`**. You do **not** need the publisher-only bundles for that workflow.
- **Sites that sell ad inventory (GPT, AdSense, GAM):** keep **`publisher-ads-readiness`**, **`publisher-ads-google-ads-report`**, and **`google-ads-audit-skills-checklist`** as reference; they map Publisher Ads audits and legacy plugin workflows.
