# CRO prioritization for “Ads readiness” reports

Ads readiness is a **subset of overall conversion health**: slow, unstable pages reduce **sessions, scroll depth, and impressions**—hurting revenue even when “SEO score” is high.

## Conversion Ops alignment (Eric Siu)

For **landing-page CRO** (headline, CTA, social proof, forms, trust—not only Web Vitals), use the **8-dimension** model and tooling from [ai-marketing-skills/conversion-ops](https://github.com/ericosiu/ai-marketing-skills/tree/main/conversion-ops) (MIT). Full integration notes: [conversion-ops.md](conversion-ops.md).

## Framework (use in every report)

1. **Impact** — Revenue or growth at stake (traffic to URL × expected CPM × engagement).
2. **User friction** — What hurts **task completion** (read, search, click deals) before ads even matter.
3. **Effort** — Engineering / design cost to fix.
4. **Evidence strength** — Lighthouse + Playwright + DevTools alignment.

## Prioritization matrix

- **P0 — Fix first**: Severe LCP/TBT/CLS in lab **and** Playwright shows ad scripts **or** console errors on monetized paths; high-traffic templates.
- **P1**: Strong performance issues on **high-value** landing pages; ad requests present but slow.
- **P2**: Polish / SEO / A11y when core perf and tags are healthy.
- **Deprioritize**: Chasing a **green Lighthouse number** on a URL **without** ad traffic if the business goal is monetization—**test the right URL** first.

## How to phrase “importance”

- Tie each finding to **user outcome** (“Users wait 9s before meaningful paint → likely bounce → fewer ad opportunities”).
- Avoid raw audit names without **business translation**.

## When “Google Ads ready” is inconclusive

If Playwright finds **no** GPT-related network activity on the tested URL, say: **“Not validated for ad load — rerun on a page with expected slots or after consent.”** Do not claim failure of Google Ads.
