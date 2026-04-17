# Ad-policy checklist

These are landing-page items that can cause **ad disapproval** or **account suspension** on paid platforms. Most are auditable from HTML + response headers.

## Google Ads ([Destination requirements](https://support.google.com/adspolicy/answer/6368661))

| Check | How to verify |
|-------|---------------|
| HTTPS on final URL | Lighthouse `is-on-https` |
| No mixed content | Lighthouse `is-on-https` subitems |
| Navigable (no 404) | HTTP status 200 |
| Privacy policy link visible | Probe scans for `/privacy` or `policy` text |
| Clear business identity | SEO meta + Trust Signals (CRO) |
| No malware / phishing | Google Safe Browsing (manual) |
| No deceptive content | Headline clarity (CRO) |
| No prohibited content (drugs, gambling, etc.) | Manual review |
| No auto-download | Response type check on navigation |
| Mobile-friendly | Lighthouse `viewport`, `content-width` |

## LinkedIn Ads ([Landing page requirements](https://www.linkedin.com/help/lms/answer/a420410))

| Check | How to verify |
|-------|---------------|
| HTTPS | Lighthouse `is-on-https` |
| Accurate, non-misleading content | Manual |
| No broken links to policy pages | Probe checks `/privacy`, `/terms` return 200 |
| Fully functional on mobile | Lighthouse mobile audit |
| Not a file download | Response type |
| No pop-ups obscuring main content | Manual — Lighthouse partial coverage |
| Disclosures for regulated industries (finance, health) | Manual |

## Meta Ads ([Advertising Standards](https://transparency.meta.com/en-us/policies/ad-standards/))

| Check | How to verify |
|-------|---------------|
| HTTPS | Lighthouse |
| Landing page matches ad creative promise | Manual |
| Accessible (no auto-playing loud audio) | Manual |
| Post-click experience matches pre-click | Manual |
| No manipulated media claims | Manual |

## Microsoft Ads

Similar to Google. See [relevance and quality](https://help.ads.microsoft.com/apex/3/56786/1/).

## Workflow

1. Run the audit.
2. Open the **Ad policy** section of the HTML report — it shows pass/fail for the auto-checkable items.
3. Walk the manual items with the media team before launch.
4. For regulated industries (finance, health, crypto, political), do a manual policy review regardless of automated scores.
