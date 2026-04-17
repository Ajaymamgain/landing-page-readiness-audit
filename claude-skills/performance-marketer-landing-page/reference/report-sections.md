# Report sections — what each one means

## 1. Verdict banner

One of three states, rendered with colored border:

| State | Color | Meaning |
|-------|-------|---------|
| **Ready for paid traffic** | Green | Lighthouse perf ≥ 75, tracking detected, CRO ≥ industry avg |
| **Ship with caveats** | Amber | Some blockers but not critical (e.g. perf 50-74, or CRO below avg) |
| **Not ready — fix before spending** | Red | Lab perf < 50 OR no conversion tracking OR critical A11y failures |

## 2. Score gauges

SVG ring gauges for Lighthouse Performance / Accessibility / Best Practices / SEO plus CRO Overall. Red for < 50, amber for 50-89, green for ≥ 90.

## 3. Core Web Vitals

Field thresholds (Google Ads uses these for **Page Experience** signal):

| Metric | Good | Needs work | Poor |
|--------|------|------------|------|
| LCP | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| TBT | ≤ 200ms | ≤ 600ms | > 600ms |
| INP (field only) | ≤ 200ms | ≤ 500ms | > 500ms |

## 4. Filmstrip

8 thumbnails captured by Lighthouse showing visual page load. Look for **blank frames past 2s** — that is what the user perceives as slow.

## 5. Opportunities (ranked by savings ms)

Lighthouse's **opportunity** audits — each shows estimated savings in ms and KB. The top 3-5 are the P0/P1 engineering tickets. Common ones:

- `unused-javascript` — code splitting
- `render-blocking-resources` — critical CSS / defer JS
- `server-response-time` — TTFB / backend
- `largest-contentful-paint-element` — what is the LCP element
- `uses-optimized-images` / `uses-webp-images` — image pipeline
- `modern-image-formats`
- `uses-responsive-images`

## 6. Diagnostics

Non-opportunity perf findings: bootup time, main-thread work, dom size, critical request chains.

## 7. Third-party impact

Entity breakdown with blocking time per third party. Critical for paid campaigns because every marketing pixel adds to TBT which hurts Quality Score. Common offenders on landing pages:

- Google Tag Manager (primary culprit — use [GTM async / server-side](https://developers.google.com/tag-platform/tag-manager/server-side))
- Meta Pixel (fbevents.js)
- LinkedIn Insight Tag (snap.licdn.com)
- Hotjar / FullStory / LogRocket (session replay)
- Intercom / Drift / HubSpot chat widgets

## 8. Tracking pixel detection (Playwright)

Real network capture of pixels firing on page load. Confirms:

- ✅ **Google Ads conversion tracking**: `googleads.g.doubleclick.net/pagead/conversion/...`
- ✅ **GA4**: `google-analytics.com/g/collect`, `googletagmanager.com/gtag/js?id=G-...`
- ✅ **Google Tag Manager**: `googletagmanager.com/gtm.js?id=GTM-...`
- ✅ **LinkedIn Insight**: `snap.licdn.com/li.lms-analytics/insight.min.js`
- ✅ **Meta Pixel**: `connect.facebook.net/.../fbevents.js`
- ✅ **Microsoft Ads (Bing UET)**: `bat.bing.com/bat.js`
- ✅ **TikTok Pixel**: `analytics.tiktok.com/i18n/pixel/events.js`
- ✅ **X (Twitter) Pixel**: `static.ads-twitter.com/uwt.js`
- ✅ **Pinterest Tag**: `s.pinimg.com/ct/core.js`
- ✅ **Reddit Pixel**: `www.redditstatic.com/ads/pixel.js`

**If zero pixels detected on a paid landing page, the campaign cannot optimize.** Escalate.

## 9. CRO 8-dimension scores

Live scores from `cro_audit.py`. Each dimension has findings and recommendations. Benchmark comparison shows how the page ranks vs industry average and top quartile.

## 10. Quality Score signals (composite)

Maps Lighthouse and Playwright signals to **Google Ads Quality Score** components:

- **Landing page experience**: Performance score, mobile friendliness, HTTPS, CLS
- **Ad relevance** (requires ad copy — note as manual)
- **Expected CTR** (historical — note as manual)

## 11. Ad-policy checklist

Static landing-page policy items that have to pass or Google/LinkedIn rejects ads:

- HTTPS on final URL (no mixed content)
- Clear privacy policy link
- Working navigation (no broken links)
- Contact info visible
- Mobile usable (no zoom-required, tap targets ≥ 44px)
- No auto-play audio, no popups that block content
- Disclosed data collection (consent banner where required)

## 12. Evidence

All 4 artifacts listed with paths so stakeholders can drill deeper.
