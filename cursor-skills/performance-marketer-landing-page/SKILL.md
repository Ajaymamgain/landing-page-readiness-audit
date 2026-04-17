---
name: performance-marketer-landing-page
description: Audits landing pages that Google Ads and LinkedIn Ads campaigns send traffic to. Produces a stakeholder-ready HTML report combining full Lighthouse analysis (opportunities, diagnostics, third-party breakdown, filmstrip), Playwright tracking-pixel detection (gtag, GTM, LinkedIn Insight, Meta Pixel, etc.), CRO dimension scoring, Quality Score signals, and ad-policy checks. Use when the user runs paid campaigns (Google Ads, Microsoft Ads, LinkedIn Ads, Meta Ads), needs Quality Score or Ad Rank diagnosis, wants conversion tracking verification, or asks about landing-page CWV, relevance, or bounce drivers affecting ROAS.
---

# Performance marketer landing-page audit

This skill is for **advertisers** — teams buying paid media on Google Ads, LinkedIn Ads, Microsoft Ads, Meta Ads — who need to know whether a given URL is fit to receive paid traffic. It is **not** for publishers selling ad inventory.

## Instructions

1. Confirm the target URL is the **campaign landing page** (not the homepage) — ask the user which URL receives paid clicks.
2. Ask for **industry** (saas, ecommerce, agency, finance, healthcare, education, b2b, general) and **ad platform** (google, linkedin, both) if relevant to prioritization.
3. Run the reference project (see [reference/project-setup.md](reference/project-setup.md)):
   ```bash
   npm run report -- https://yoursite.com/landing-page ecommerce
   ```
4. Open `reports/readiness-report.html` and narrate the findings using the sections in [reference/report-sections.md](reference/report-sections.md).
5. If the user wants a one-line verdict, use the rubric in [reference/verdict-rubric.md](reference/verdict-rubric.md).

## What this audit covers

| Dimension | Tool | Report section |
|-----------|------|----------------|
| Core Web Vitals (lab) | Lighthouse | Gauges + vitals pills |
| Lighthouse Opportunities (ranked) | Lighthouse | Opportunities table with savings |
| Lighthouse Diagnostics | Lighthouse | Diagnostics list |
| Third-party impact | Lighthouse | Entity breakdown with TBT contribution |
| Load filmstrip | Lighthouse | 8-frame visual timeline |
| Accessibility issues | Lighthouse | Categorized list |
| SEO signals | Lighthouse | Meta + structured data |
| Tracking pixel detection | Playwright | GTM / gtag / LinkedIn / Meta / others |
| Form + CTA inventory | Playwright | Input counts, labels |
| CRO scoring (8 dimensions) | conversion-ops (Python) | Live scores with benchmark |
| Quality Score proxy signals | Composite | Landing-page experience indicators |
| Ad-policy readiness | Checklist | Google / LinkedIn policy items |

## When NOT to use

- Auditing a **publisher** site that monetizes with Google Publisher Ads (GPT / AdSense / GAM) — that workflow is out of scope for this repo; use upstream [Publisher Ads Lighthouse plugin docs](https://github.com/googleads/publisher-ads-lighthouse-plugin) as reference.
- Pure accessibility or SEO audits (run stock Lighthouse standalone).
- Paid media attribution / analytics questions (this is a page audit, not a campaign analytics audit).

## Related skills

- [`conversion-ops`](../conversion-ops/SKILL.md) — CRO 8-dimension scoring (pulled into this skill's pipeline when `cro_audit.py` is installed).

## File map

- [reference/project-setup.md](reference/project-setup.md) — cloning, venv, npm install, first run.
- [reference/report-sections.md](reference/report-sections.md) — what each report section means and how to narrate it.
- [reference/verdict-rubric.md](reference/verdict-rubric.md) — PASS / REVIEW / FAIL rules for landing-page readiness.
- [reference/quality-score-signals.md](reference/quality-score-signals.md) — Google Ads Quality Score mapping to Lighthouse audits.
- [reference/tracking-pixels.md](reference/tracking-pixels.md) — platform pixel patterns and verification.
- [reference/ad-policy-checklist.md](reference/ad-policy-checklist.md) — Google Ads + LinkedIn Ads landing page policy items.
