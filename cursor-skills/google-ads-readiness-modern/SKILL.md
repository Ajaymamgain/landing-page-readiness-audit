---
name: google-ads-readiness-modern
description: Assesses Google Ads and GAM monetization readiness with stock Lighthouse, Playwright network and console probes, and DevTools-style checks, without the lighthouse-plugin-publisher-ads npm package. Treats Publisher Ads audit docs as study material only; ranks fixes using CRO-style prioritization. Use when the user wants readiness audits, GPT or ad-domain request checks, LCP or CLS or INP lab data, Playwright probes, or a single stakeholder HTML report from the google-ads-readiness-audit project.
---

# Google Ads readiness (Lighthouse + Playwright + DevTools + CRO)

## Non-negotiables

- **Do not** install or run **`lighthouse-plugin-publisher-ads`** as part of this workflow; it is outdated / incompatible with current Lighthouse internals. Treat the [googleads/publisher-ads-lighthouse-plugin](https://github.com/googleads/publisher-ads-lighthouse-plugin) repo as **conceptual reference** (what “good” looks like for tags, bids, CLS, etc.), not as a runtime dependency.
- **Do** run **stock Lighthouse** (current major via `npx lighthouse`) for lab Performance / BP / A11y / SEO.
- **Do** run **Playwright** (Chromium) to observe **real network** requests toward GPT / `googletagservices` / `doubleclick` / `pagead` and to collect **console / page errors** that Lighthouse may not attribute to ads.
- **Do** use **Chrome DevTools** guidance (manual or scripted via CDP) for cache, throttling, coverage, and request blocking experiments—see [reference/devtools-checklist.md](reference/devtools-checklist.md).
- **Do** apply **CRO prioritization** so fixes are ordered by **business impact** and **user friction**, not audit list order alone—see [reference/cro-prioritization.md](reference/cro-prioritization.md).

## Bundled Publisher Ads “study” docs

Mirrored audit explainers live under [`publisher-ads-readiness`](../publisher-ads-readiness/reference/audit-index.md). Use them to **label risks** and **write narratives**; they are not executed by Lighthouse in this stack.

## Recommended toolchain (example project)

Reference implementation: the **`google-ads-readiness-audit`** project (default: `~/Projects/google-ads-readiness-audit`)

One command produces **one** narrative HTML file:

```bash
npm run report -- https://www.example.com
# -> reports/readiness-report.html
```

Supporting machine files (`latest-lh.report.json`, `latest-probe.json`, etc.) are overwritten each run; the **only** stakeholder-facing document is `readiness-report.html`.

## Agent workflow

1. **Lighthouse**: `npx lighthouse <url> --output=json --output=html --output-path=./reports/run --chrome-flags="--headless=new" --quiet`
2. **Playwright**: Load URL, wait for lazy tags, collect ad-domain requests and JS errors (see project `scripts/playwright-probe.mjs`).
3. **Synthesize**: Map Performance issues to **revenue / CRO risk** (slow LCP → bounce → fewer ad impressions).
4. **Verdict**: `Ready` / `Not ready` / `Needs manual review` — if Playwright sees **no** GPT-related traffic, say **inconclusive for monetization** unless a specific ad-heavy URL was tested.
5. **Report**: Fill [templates/combined-report.html](templates/combined-report.html) or project-generated HTML with Lighthouse + Playwright + CRO sections.

## File map

- [reference/stack.md](reference/stack.md) — how the pieces fit together.
- [reference/devtools-checklist.md](reference/devtools-checklist.md) — manual DevTools passes.
- [reference/cro-prioritization.md](reference/cro-prioritization.md) — impact / effort matrix and messaging.
- [reference/conversion-ops.md](reference/conversion-ops.md) — Eric Siu **AI Conversion Ops** (8 dimensions, `cro_audit.py`) paired with this stack.
- Optional sibling skill: [`conversion-ops`](../conversion-ops/SKILL.md) — Cursor entry point for the upstream repo.
- [templates/combined-report.html](templates/combined-report.html) — HTML shell.
