# Ads readiness rubric (Publisher Ads plugin first)

## Inputs

1. **Lighthouse JSON (LHR)** with **`lighthouse-plugin-publisher-ads`** enabled (preferred).
2. Optional qualitative notes (staging, consent, ad slot layout).

## Primary verdict (plugin present)

Let `pub = categories['lighthouse-plugin-publisher-ads']` (or resolve by `title === 'Publisher Ads'` per [plugin-lhr.md](plugin-lhr.md)).

- **`Not ready`** if `pub.score` is **null** (run failed for that category) **or** `pub.score < 0.5`.
- **`Ready`** if `pub.score >= 0.9` **and** no audit with `scoreDisplayMode: binary` or numeric scoring shows a **critical** failure the user cares about (use judgment; always list top failing audits in the HTML).
- **`Needs manual review`** for scores between **0.5 and 0.9**, or when GPT/tag issues need human confirmation despite a green score.

Always list **at least three** failing or warning Publisher Ads audits (if any) with links to the matching [audits/*.md](audit-index.md) explainer.

## Cross-check with core web vitals (lab)

From stock Lighthouse audits:

- Poor **CLS** or **LCP** often correlates with ad layout or load issues; cite [audits/cumulative-ad-shift.md](audits/cumulative-ad-shift.md) and performance docs when relevant.

## Fallback (stock Lighthouse only — plugin not installed)

If Publisher Ads category is **absent**:

- Set verdict to **`Needs manual review`** unless the user explicitly accepts heuristic-only rules.
- Use **Performance** category and CLS/LCP/TBT audits heuristically per earlier thresholds (performance `score < 0.5` → at risk).
- Use bundled Publisher Ads docs as a **manual checklist** only.

## Display

- Category scores: `Math.round(score * 100)` with `—` if `score` is `null`.
