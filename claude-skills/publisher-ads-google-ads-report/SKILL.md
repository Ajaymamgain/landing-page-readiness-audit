---
name: publisher-ads-google-ads-report
description: Runs Lighthouse CLI with lighthouse-plugin-publisher-ads for Google Publisher Ads and GPT-style audits, interprets LHR JSON using bundled plugin documentation, and fills a client-ready HTML readiness report. Use when a pinned old Lighthouse and plugin stack is in play; prefer google-ads-readiness-modern for current Node and Lighthouse. Also applies when the user mentions lighthouse-plugin-publisher-ads, Publisher Ads plugin audits, GAM pages, or Lighthouse --plugins runs.
---

# Google Ads / Publisher Ads Lighthouse report skill

## When to use

Use when the goal is a **readiness narrative** grounded in **Lighthouse plus the Publisher Ads plugin** (not generic performance alone). Typical cues: `lighthouse-plugin-publisher-ads`, `--plugins`, GPT or AdSense tags, GAM pages, LHR JSON, stakeholder HTML.

## Primary workflow (plugin + CLI)

1. Use a **local Node project** whose `node_modules` contains **`lighthouse`** and **`lighthouse-plugin-publisher-ads`**. Run commands from that project root so the plugin resolves (avoid global-only installs for the plugin).
2. **Read** [reference/lighthouse-modern.md](reference/lighthouse-modern.md) for exact CLI flags and artifact names.
3. **Run** Lighthouse with `--plugins=lighthouse-plugin-publisher-ads` and capture **JSON + HTML**.
4. **Parse** the **Publisher Ads** category and audit scores per [reference/plugin-lhr.md](reference/plugin-lhr.md); combine with stock categories (Performance, etc.) as needed.
5. **Explain failures** using the matching file under [reference/audit-index.md](reference/audit-index.md) (upstream audit docs bundled in this skill).
6. **Fill** [templates/readiness-report.html](templates/readiness-report.html) for a single stakeholder HTML deliverable; link the raw Lighthouse HTML as evidence.

## Bundled documentation (full upstream set)

All markdown from [googleads/publisher-ads-lighthouse-plugin](https://github.com/googleads/publisher-ads-lighthouse-plugin) shipped with the repo is mirrored under [reference/](reference/SOURCES.md), including:

- Every file under [reference/audit-index.md](reference/audit-index.md) (Publisher Ads audit reference pages).
- [reference/upstream-plugin-README.md](reference/upstream-plugin-README.md), [reference/upstream-CONTRIBUTING.md](reference/upstream-CONTRIBUTING.md), [reference/upstream-lighthouse-ci-README.md](reference/upstream-lighthouse-ci-README.md), GitHub issue templates under `reference/github-issue-templates/`, and [reference/upstream-LICENSE.txt](reference/upstream-LICENSE.txt).

The repository root `README` is a pointer file in upstream; the substantive readme is the plugin package readme above.

## Fallback (stock Lighthouse only)

If the user cannot install the plugin, follow the **Fallback** section in [reference/rubric.md](reference/rubric.md) and label the report **Needs manual review** for Publisher Ads–specific automation. Still cite bundled audit docs for checklists.

## File map

- [reference/lighthouse-modern.md](reference/lighthouse-modern.md) — CLI, plugin invocation, Lighthouse/plugin version compatibility, artifacts.
- [reference/plugin-lhr.md](reference/plugin-lhr.md) — where Publisher Ads scores live in JSON.
- [reference/rubric.md](reference/rubric.md) — verdict rules (plugin-first).
- [reference/audit-index.md](reference/audit-index.md) — catalog of audit docs.
- [reference/runner-project.md](reference/runner-project.md) — pinned runner repo on disk (`publisher-ads-lighthouse-runner`).
- [reference/siteimprove-alignment.md](reference/siteimprove-alignment.md) — executive “insights” style framing.
- [reference/SOURCES.md](reference/SOURCES.md) — license and provenance.
- [scripts/run-publisher-ads-audit.sh](scripts/run-publisher-ads-audit.sh) — optional shell wrapper (match Lighthouse/plugin pins in [lighthouse-modern.md](reference/lighthouse-modern.md)).
- [templates/readiness-report.html](templates/readiness-report.html) — HTML shell.

## Example (pinned runner — recommended)

Use the pinned runner project (see [runner-project.md](reference/runner-project.md)):

```bash
cd publisher-ads-lighthouse-runner
npm run audit -- "https://www.example.com/page" "./reports/gam-run"
npm run summary -- ./reports/gam-run.report.json
```

## Report template tokens

Fill [templates/readiness-report.html](templates/readiness-report.html):

- **Standard**: `{{PAGE_TITLE}}`, `{{HEADLINE}}`, `{{TEST_URL}}`, `{{DATE_ISO}}`, `{{DATE_HUMAN}}`, `{{LIGHTHOUSE_VERSION}}`.
- **Category scores**: `{{PERF_SCORE}}`, `{{A11Y_SCORE}}`, `{{BP_SCORE}}`, `{{SEO_SCORE}}`, `{{PUB_ADS_SCORE}}` (0–100 or `—`).
- **Verdict**: `{{VERDICT_CLASS}}` (`ready` | `not-ready` | `review` | empty), `{{VERDICT_TITLE}}`, `{{VERDICT_BODY}}`.
- **Vitals**: `{{LCP_DISPLAY}}`, `{{CLS_DISPLAY}}`, `{{TBT_DISPLAY}}`.
- **Publisher Ads**: `{{PUB_ADS_SUMMARY}}` (1–2 sentences); `{{PUB_ADS_AUDIT_ROWS}}` — `<tr><td>…</td><td>…</td><td>…</td></tr>` rows for key audits (or one row explaining plugin not run).
- **Manual**: `{{MANUAL_CHECKLIST_ITEMS}}` — `<li>` fragments from bundled docs when needed.
- **Evidence**: `{{LIGHTHOUSE_HTML_PATH}}`, `{{LIGHTHOUSE_HTML_LABEL}}`, `{{LIGHTHOUSE_JSON_PATH}}`.

## Quality bar

- Prefer **plugin runs** for any “ready for Google Ads / GPT” claim that depends on tag path, bids, or GPT errors.
- Align audit explanations with bundled `reference/audits/*.md`; do not invent audit IDs.
- Call out upstream audits that exist in code but have **no** standalone doc file (e.g. some builds include `full-width-slots`) by audit id from LHR.

## Related skills

- [`google-ads-readiness-modern`](../google-ads-readiness-modern/SKILL.md) — Preferred modern workflow (stock Lighthouse 12 + Playwright, no plugin).
- [`publisher-ads-readiness`](../publisher-ads-readiness/SKILL.md) — Stock Lighthouse only, bundled audit docs.
- [`google-ads-audit-skills-checklist`](../google-ads-audit-skills-checklist/SKILL.md) — 24 standalone audit playbooks.
