# Verdict rubric

## Ready for paid traffic (green)

**All of:**
- Lighthouse Performance ≥ 75
- Lighthouse Accessibility ≥ 80 (legal + reach; no blocking a11y violations)
- At least one conversion pixel detected (GA4, Google Ads, LinkedIn Insight, Meta Pixel, or equivalent)
- No critical console errors tied to tracking scripts
- CRO overall score ≥ industry average
- Core Web Vitals: LCP ≤ 2.5s AND CLS ≤ 0.1

## Ship with caveats (amber)

**Any of:**
- Performance 50-74 → flag as a Quality Score drag; estimate impression share loss
- CRO below industry average but above 40 → spend will be suboptimal; call out the top 3 priority fixes
- Tracking detected but only analytics (no conversion pixels) → attribution will be partial
- LCP 2.5s-4.0s or CLS 0.1-0.25 → Page Experience still passes in most cases

## Not ready — fix before spending (red)

**Any of:**
- Performance < 50 → Quality Score will be low; CPC will be inflated
- No conversion tracking detected at all → cannot optimize or measure ROAS
- HTTPS issues or mixed content → ad rejection likely
- CRO overall < 40 → conversion rate will be poor regardless of traffic quality
- Critical A11y violations (keyboard trap, missing labels on forms) → excludes users + legal risk
- Console errors in tracking scripts → ad platform callbacks may fail

## How to narrate

Give the verdict as a single sentence, then 3 bullet reasons citing the gauges or metric values. Stakeholders want to know: **can we turn on spend tomorrow, yes or no.**
