---
name: publisher-ads-readiness
description: Runs stock Lighthouse CLI without the Publisher Ads npm plugin, interprets lab metrics against bundled googleads/publisher-ads-lighthouse-plugin audit documentation, and fills a standalone HTML readiness report with verdict and GAM-topic gap analysis. Use when the user wants ad readiness without the plugin, Publisher Ads docs as a manual checklist, LCP or CLS or TBT, Lighthouse JSON and HTML artifacts, or heuristic readiness gates.
---

# Publisher Ads readiness (Lighthouse CLI + skills, no runtime plugin)

## When to use

Use when **stock Lighthouse** is acceptable and the **`lighthouse-plugin-publisher-ads` package is not installed or not invoked**. The agent still uses **bundled** upstream Publisher Ads **documentation** under [reference/audit-index.md](reference/audit-index.md) for explanations and **manual or assisted** review—not as automated Lighthouse audit rows.

## Agent workflow

1. **Read** [reference/lighthouse-modern.md](reference/lighthouse-modern.md): Node 22+, Chrome, CLI flags, JSON + HTML outputs. **Do not** pass `--plugins=lighthouse-plugin-publisher-ads`.
2. **Run** Lighthouse on the target URL; save **JSON** and **HTML** artifacts.
3. **Parse** category scores and key lab audits (LCP, CLS, TBT, performance score) per [reference/rubric.md](reference/rubric.md).
4. **Gap analysis**: List which Publisher Ads topics from [reference/audit-index.md](reference/audit-index.md) are **not** validated by this stock run (effectively all GAM-specific plugin audits). Tie partial coverage to lab metrics only where the rubric says so.
5. **Fill** [templates/readiness-report.html](templates/readiness-report.html) with verdict, scores, vitals, gap bullets, manual checklist items, and links to evidence files.

## Critical limitation

**GAM-specific automated audits** (GPT errors, duplicate tags, tag path, bids, etc.) **do not execute** without the real plugin or other instrumentation. The HTML report must state that bundled `docs/audits/*.md` are **reference** for humans and assisted review, not scores from this run.

## Bundled documentation

- [reference/audits/](reference/audit-index.md) — upstream audit explainers (mirrored from [googleads/publisher-ads-lighthouse-plugin](https://github.com/googleads/publisher-ads-lighthouse-plugin)).
- [reference/SOURCES.md](reference/SOURCES.md) — license and provenance.
- Optional context: [upstream-plugin-README.md](reference/upstream-plugin-README.md) (describes the plugin product; this skill does not run it by default).

## File map

- [reference/lighthouse-modern.md](reference/lighthouse-modern.md) — stock Lighthouse CLI.
- [reference/lighthouse-develop-984294e.md](reference/lighthouse-develop-984294e.md) — optional upstream **Develop → Setup / Run** (pinned commit excerpt).
- [reference/rubric.md](reference/rubric.md) — verdict + heuristics + gap rules.
- [reference/audit-index.md](reference/audit-index.md) — audit doc index and `audits/images/`.
- [templates/readiness-report.html](templates/readiness-report.html) — HTML shell.

## Example command

```bash
npx lighthouse "https://www.example.com/page" \
  --output=json --output=html \
  --output-path=./reports/readiness \
  --chrome-flags="--headless=new" \
  --quiet
```

## Report template tokens

Fill [templates/readiness-report.html](templates/readiness-report.html):

- **Meta**: `{{PAGE_TITLE}}`, `{{HEADLINE}}`, `{{TEST_URL}}`, `{{DATE_ISO}}`, `{{DATE_HUMAN}}`, `{{LIGHTHOUSE_VERSION}}`.
- **Scores**: `{{PERF_SCORE}}`, `{{A11Y_SCORE}}`, `{{BP_SCORE}}`, `{{SEO_SCORE}}` (0–100 or `—`).
- **Verdict**: `{{VERDICT_CLASS}}` (`ready` | `not-ready` | `review` | empty), `{{VERDICT_TITLE}}`, `{{VERDICT_BODY}}`.
- **Vitals**: `{{LCP_DISPLAY}}`, `{{CLS_DISPLAY}}`, `{{TBT_DISPLAY}}`.
- **Prose**: `{{METHODOLOGY_PARAGRAPH}}` — stock Lighthouse + no plugin; point to [rubric](reference/rubric.md).
- **Gaps**: `{{GAP_ANALYSIS_ITEMS}}` — `<li>` bullets listing Publisher Ads topics not validated (see **Gap analysis** in [rubric](reference/rubric.md)).
- **Manual**: `{{MANUAL_CHECKLIST_ITEMS}}` — `<li>` items with links to specific [audits/*.md](reference/audit-index.md) where useful.
- **Evidence**: `{{LIGHTHOUSE_HTML_PATH}}`, `{{LIGHTHOUSE_HTML_LABEL}}`, `{{LIGHTHOUSE_JSON_PATH}}`.

## Quality bar

- Prefer **Needs manual review** over **Ready** when material GAM/tag risk exists but was not instrumented.
- Never claim Publisher Ads **category scores** from LHR unless the user explicitly ran a plugin elsewhere and pasted JSON from that run.

## Related skills

- [`google-ads-readiness-modern`](../google-ads-readiness-modern/SKILL.md) — Lighthouse + Playwright unified report project.
- [`google-ads-audit-skills-checklist`](../google-ads-audit-skills-checklist/SKILL.md) — 24 standalone audit playbooks.
- [`publisher-ads-google-ads-report`](../publisher-ads-google-ads-report/SKILL.md) — Legacy plugin-first workflow (pinned Lighthouse 8.6).
