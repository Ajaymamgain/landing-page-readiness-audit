---
name: google-ads-audit-skills-checklist
description: Supplies twenty-four standalone Markdown playbooks for Publisher Ads Lighthouse audit themes (audit ID, category, remediation text from upstream docs/audits). Use when auditing GPT, AdSense, or GAM pages, building monetization QA or training materials, or mapping audit IDs to fixes without the npm plugin; also when the user mentions ad latency, CLS, header bidding, viewport ad density, or googleads/publisher-ads-lighthouse-plugin documentation.
---

# Google Ads audit skills checklist

## Instructions

1. Open the **[master index](GOOGLE-ADS-AUDIT-SKILLS-CHECKLIST.md)** for the numbered list and links to each file under [`skills/`](skills/).
2. For a specific audit, use **[reference/audit-id-map.md](reference/audit-id-map.md)** or pick the matching [`skills/skill-*.md`](skills/) file.
3. Treat content as **manual or assisted review** — not automated Lighthouse rows. Pair with **stock Lighthouse** + DevTools (see [`publisher-ads-readiness`](../publisher-ads-readiness/SKILL.md)).

## When to apply

- Structured pass against Google’s publisher-audit themes.
- Exporting playbooks to Obsidian, Notion, or VS Code (`skills/*.md`).
- **Audit ID → remediation** lookup without installing the plugin.

## Regenerate skill files

From this skill directory:

```bash
node scripts/build-skill-files.mjs
```

Source markdown is read from [`../publisher-ads-readiness/reference/audits/`](../publisher-ads-readiness/reference/audit-index.md). After upstream docs change, refresh those mirrors, then rerun the script.

## Related skills

- [`publisher-ads-readiness`](../publisher-ads-readiness/SKILL.md) — bundled audit docs + stock Lighthouse HTML report path.
- [`google-ads-readiness-modern`](../google-ads-readiness-modern/SKILL.md) — Lighthouse + Playwright + unified report project.
