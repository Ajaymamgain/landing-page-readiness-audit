# Every run — agents & humans

Use this checklist when you run the audit pipeline or wire agent skills from this repo.

## 1. Landing-page audit (this project)

```bash
cd /path/to/landing-page-readiness-audit   # or your clone folder
npm install
npx playwright install chromium
npm run report -- https://example.com/path
open reports/readiness-report.html
```

Optional CRO scores require [ericosiu/ai-marketing-skills — `conversion-ops`](https://github.com/ericosiu/ai-marketing-skills/tree/main/conversion-ops) installed locally; if missing, the report still generates and notes that CRO was skipped.

## 2. Cursor / Claude skills (bundled here)

Only **`cursor-skills/performance-marketer-landing-page/`** and **`cursor-skills/conversion-ops/`** are in this repo. Symlink the same paths into `~/.cursor/skills/` or `~/.claude/skills/` (see README).

## 3. Obsidian + Codex (optional, not in this repo)

If you use Obsidian vaults from Codex, install skills from [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) with your Codex skill installer, then restart Codex.
