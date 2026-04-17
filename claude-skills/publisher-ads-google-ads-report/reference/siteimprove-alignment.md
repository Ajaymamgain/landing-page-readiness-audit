# Alignment with “Digital Insights”-style reports

[Siteimprove’s Digital Insights Report](https://www.siteimprove.com/digital-insights-report/) markets a **consolidated view**: SEO, accessibility, performance, quality, and (in their product) ads-related insight—often with **simple scores** so stakeholders can see standing at a glance. They explicitly note that **Performance** can be grounded in **Google Lighthouse’s scale**, reducing conflicting interpretations between tools.

## What this skill borrows

- **Pillar scores** (0–100) for major areas, with Performance tied to **Lighthouse** category scores and **Publisher Ads** as an extra pillar when `lighthouse-plugin-publisher-ads` is used.
- **Executive framing**: one page answers “where do we stand?” before the detail.
- **Action orientation**: gaps point to follow-up work, not only charts.

## What this skill is not

- It is **not** Siteimprove software, their crawler, or their Ads product analytics.
- It does **not** provide competitor SEO comparisons or site-wide multi-page crawling unless the user runs additional tools.

## Lighthouse as the anchor

Use Lighthouse JSON/HTML as the **objective lab** baseline for Performance (and other stock categories). Layer **Publisher Ads audit markdown** for **qualitative** checklist items that require GPT/tag/bid context or the dedicated plugin.
