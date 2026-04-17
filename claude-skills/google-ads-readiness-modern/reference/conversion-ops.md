# Conversion Ops (Eric Siu — ai-marketing-skills)

Upstream: [github.com/ericosiu/ai-marketing-skills — `conversion-ops`](https://github.com/ericosiu/ai-marketing-skills/tree/main/conversion-ops) (MIT License, Copyright © 2026 Single Grain).

This is **not** duplicated here as code; it is the **recommended CRO layer** to pair with **`google-ads-readiness-modern`** (Lighthouse + Playwright + unified `readiness-report.html`).

## What it adds

The **AI Conversion Ops** skill scores landing pages on **8 dimensions** (each 0–100), then a weighted **overall CRO score** and letter grade:

| Dimension | Weight (upstream) | Complements our stack |
|-----------|-------------------|------------------------|
| Headline Clarity | 15% | Lighthouse does not judge copy |
| CTA Visibility | 20% | Aligns with CRO “friction” narrative |
| Social Proof | 15% | Trust / conversion |
| Urgency | 5% | Offer framing |
| Trust Signals | 10% | Security, guarantees |
| Form Friction | 15% | Fields / intimidation |
| Mobile Responsiveness | 10% | Overlaps Lighthouse viewport/a11y somewhat |
| Page Speed Indicators | 10% | Heuristic HTML weight; **Lighthouse is deeper** for perf |

Our pipeline: **Lighthouse 12** = authoritative lab perf; **Playwright** = real network for ads; **conversion-ops `cro_audit.py`** = landing-page CRO heuristics without a headless browser.

## How to run alongside the unified report

```bash
# 1) Tech + ads readiness (this repo)
cd /path/to/google-ads-readiness-audit
npm run report -- https://yoursite.com/page

# 2) CRO audit (clone upstream once)
git clone https://github.com/ericosiu/ai-marketing-skills.git
cd ai-marketing-skills/conversion-ops
pip install -r requirements.txt
python cro_audit.py --url https://yoursite.com/page --industry ecommerce --json
```

Merge **insights** into one stakeholder narrative: use `readiness-report.html` for speed/ads signals and paste or summarize `cro_audit.py` output for copy/CTA/trust/form findings.

## Survey → lead magnets

Optional: `survey_lead_magnet.py` for CSV survey segmentation — see upstream README.

## Attribution

Include upstream license notice if you redistribute or vendor substantial portions of their scripts or docs.
