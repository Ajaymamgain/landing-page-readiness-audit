# Tracking pixel detection patterns

The Playwright probe matches request URLs against these regex patterns to confirm pixels fired.

## Platforms detected

| Platform | Pattern (substring / regex) | What to expect |
|----------|-----------------------------|----------------|
| Google Tag Manager | `googletagmanager.com/gtm.js` | 1 request per page load |
| GA4 | `google-analytics.com/g/collect`, `googletagmanager.com/gtag/js?id=G-` | gtag.js load + collect beacon |
| Google Ads conversion | `googleads.g.doubleclick.net/pagead/conversion/`, `googleads.g.doubleclick.net/pagead/landing` | Fires on conversion event |
| Google Ads remarketing | `googleads.g.doubleclick.net/pagead/viewthroughconversion/` | Fires on page view |
| Microsoft / Bing UET | `bat.bing.com/bat.js`, `bat.bing.com/action/0` | Load + action beacons |
| LinkedIn Insight Tag | `snap.licdn.com/li.lms-analytics/insight.min.js`, `px.ads.linkedin.com/collect` | Load + track |
| Meta (Facebook) Pixel | `connect.facebook.net/en_US/fbevents.js`, `www.facebook.com/tr` | Load + PageView event |
| TikTok Pixel | `analytics.tiktok.com/i18n/pixel/events.js` | Load + page_view |
| X (Twitter) Pixel | `static.ads-twitter.com/uwt.js`, `t.co/i/adsct` | Load + track |
| Pinterest Tag | `s.pinimg.com/ct/core.js`, `ct.pinterest.com/v3/` | Load + page visit |
| Reddit Pixel | `www.redditstatic.com/ads/pixel.js`, `alb.reddit.com/rp.gif` | Load + track |
| Snapchat Pixel | `sc-static.net/scevent.min.js` | Load + page view |
| HubSpot | `js.hs-scripts.com/`, `track.hubspot.com` | Tracking code |
| Hotjar | `static.hotjar.com/c/hotjar-` | Session replay |
| FullStory | `edge.fullstory.com/s/fs.js` | Session replay |
| Segment | `cdn.segment.com/analytics.js/v1/` | Event router |
| Mixpanel | `cdn.mxpnl.com/libs/mixpanel-` | Event tracking |

## Verification workflow

1. Run the audit on the **live** landing page (not staging — tracking is usually gated).
2. Open `reports/latest-probe.json` and inspect `pixels` object.
3. For each pixel the marketer expects, confirm `detected: true`.
4. If Google Ads conversion pixel expected but not detected, ask: **is consent mode blocking the fire?** Consent Mode v2 can delay or skip conversion pings until the user accepts cookies.
5. Cross-check against the ad account (Google Ads Tag Assistant, LinkedIn Campaign Manager Conversion Tracking) for server-side confirmation.

## Consent mode caveat

If the site uses a CMP (OneTrust, Cookiebot, Didomi, etc.), pixels may not fire on the first page load in headless Chrome. The probe should be run with consent accepted OR the user informed that detection is pre-consent only.
