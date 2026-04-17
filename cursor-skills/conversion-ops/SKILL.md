---
name: conversion-ops
description: Guides installation and use of Eric Siu’s AI Conversion Ops tools from ai-marketing-skills: eight-dimension CRO scoring via cro_audit.py and optional survey-to-lead-magnet flows. Use when the user requests CRO audits, landing page conversion analysis, headline or CTA or trust scoring, industry benchmarks, survey segmentation, lead magnet briefs, or pairing CRO scores with Lighthouse speed work.
---

# Conversion Ops (upstream: ai-marketing-skills)

## Source

- **Repository:** [ericosiu/ai-marketing-skills — `conversion-ops`](https://github.com/ericosiu/ai-marketing-skills/tree/main/conversion-ops)
- **License:** MIT (Copyright © 2026 Single Grain)

This Cursor skill is a **pointer and workflow**; install the upstream folder to run Python tools locally.

## When to use

- Landing page / URL **conversion** audit (copy, CTA, social proof, forms, trust).
- **Batch** URL lists or competitor benchmarks (`--file`, `--urls`).
- **Survey CSV** → pain-point clusters → lead magnet briefs (`survey_lead_magnet.py`).

## Quick install

```bash
git clone https://github.com/ericosiu/ai-marketing-skills.git
cd ai-marketing-skills/conversion-ops
pip install -r requirements.txt
```

## CRO audit (8 dimensions)

```bash
python cro_audit.py --url https://example.com/landing --industry saas --json
```

Dimensions (each 0–100): Headline Clarity, CTA Visibility, Social Proof, Urgency, Trust Signals, Form Friction, Mobile Responsiveness, Page Speed Indicators. Overall weighted score + letter grade.

Industries include: `saas`, `ecommerce`, `agency`, `finance`, `healthcare`, `education`, `b2b`, `general`.

## Pair with landing-page readiness (this repo)

Use upstream **conversion-ops** together with **[`landing-page-readiness-audit`](https://github.com/Ajaymamgain/landing-page-readiness-audit)** (`npm run report`) so stakeholders get **lab speed + Playwright + CRO** in one `readiness-report.html`. Install steps and how `cro_audit.py` is invoked: [`performance-marketer-landing-page` / reference/project-setup.md](../performance-marketer-landing-page/reference/project-setup.md).

## Privacy note

Upstream `SKILL.md` references optional local telemetry in the full `ai-marketing-skills` repo; read `telemetry/README.md` there if you use those entry scripts.
