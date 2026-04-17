# Google Ads Quality Score mapping

Google Ads [Quality Score](https://support.google.com/google-ads/answer/6167118) has three components. Only **Landing page experience** is fully auditable from a landing page alone; the other two need the ad account.

## Landing page experience (full audit)

| Quality Score factor | Lighthouse audit(s) | How we surface it |
|----------------------|---------------------|-------------------|
| Useful + relevant content | — (manual) | Flagged as manual check |
| Transparency + trustworthiness | SEO category + Trust Signals (CRO) | Composite score |
| Easy navigation | Accessibility category | A11y gauge |
| Fast page load (mobile) | Performance category | Perf gauge + CWV pills |
| Mobile-friendly | `viewport`, `content-width`, `tap-targets` audits | Mobile readiness block |
| Secure (HTTPS) | `is-on-https` audit | Pass / fail pill |
| No interstitials blocking content | `intrusive-interstitials` (if available) | Ad-policy checklist |

## Expected click-through rate (manual)

Requires ad account data. Flag as "manual — not auditable from URL alone."

## Ad relevance (manual)

Requires ad copy + landing page message match. Flag as "manual — scan page H1/H2 against ad group themes if provided."

## LinkedIn Ads equivalent

LinkedIn does not publish a public Quality Score, but their relevance score uses:
- **Landing page relevance** — same Lighthouse + a11y signals apply
- **Click-through rate** (manual — account data)
- **Engagement with ad format** (manual)

## Microsoft Ads (Bing)

Microsoft publishes [Quality Score components](https://help.ads.microsoft.com/#apex/ads/en/56786/1): landing page experience, expected CTR, ad relevance. Same Lighthouse mapping as Google applies to landing page experience.

## Meta Ads

Meta uses [Ad Quality](https://www.facebook.com/business/help/1877495962459911) which considers user feedback, cloaking detection, and landing page quality. Core Web Vitals matter here too for site speed signals.
