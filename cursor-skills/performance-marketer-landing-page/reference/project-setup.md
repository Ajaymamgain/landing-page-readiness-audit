# Project setup

The audit runs from this repo ([**landing-page-readiness-audit**](https://github.com/Ajaymamgain/landing-page-readiness-audit) on GitHub). Your local clone folder name may differ.

## First-time setup

```bash
# 1. Clone / check project (example path)
cd ~/Projects/landing-page-readiness-audit
npm install
npx playwright install chromium

# 2. Clone conversion-ops for CRO scoring (sibling folder)
cd ..
git clone https://github.com/ericosiu/ai-marketing-skills.git
cd ai-marketing-skills/conversion-ops
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run an audit

```bash
cd ~/Projects/landing-page-readiness-audit
npm run report -- https://yoursite.com/landing-page ecommerce
open reports/readiness-report.html
```

Industries supported by CRO scoring: `saas`, `ecommerce`, `agency`, `finance`, `healthcare`, `education`, `b2b`, `general`.

## Artifacts written

| File | Content |
|------|---------|
| `reports/readiness-report.html` | Single stakeholder narrative (the only file to share) |
| `reports/latest-lh.report.json` | Full Lighthouse JSON |
| `reports/latest-lh.report.html` | Stock Lighthouse HTML (deep-dive) |
| `reports/latest-probe.json` | Playwright network + pixels + console |
| `reports/latest-cro.json` | conversion-ops 8-dimension scores |

## Sub-commands

```bash
npm run lh    -- <url>              # Lighthouse only
npm run probe -- <url>              # Playwright probe only
npm run cro   -- <url>              # CRO audit only
```
