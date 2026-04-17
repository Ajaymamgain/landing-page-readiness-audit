# Ad readiness rubric (stock Lighthouse + manual Publisher Ads docs)

## Inputs

1. **Lighthouse JSON (LHR)** from a **stock** run (no Publisher Ads plugin).
2. Optional **qualitative** notes (staging, consent, known ad layout).

## Verdict rules (three-state)

Set **`Not ready`** when any of:

- `categories.performance.score` **\< 0.5**, or
- `audits['cumulative-layout-shift']` indicates failure (e.g. audit `score` **\< 0.9** when scored, or documented CLS **\> 0.1** in details), or
- `audits['largest-contentful-paint']` indicates strong failure for the chosen profile (e.g. audit `score` **\< 0.5** when present).

Set **`Ready`** only when:

- Performance category **≥ 0.75** (tunable) **and** CLS/LCP audits are not in clear failure range **and** the user accepts that **GAM-specific checks were not automated**.

**Default for this skill:** Prefer **`Needs manual review`** whenever ad monetization is business-critical and the run did not include Publisher Ads plugin instrumentation—unless the user explicitly accepts heuristic-only gates.

## Partial mapping (lab → ad concerns)

These stock audits are **not** GAM-specific but support common Publisher Ads themes:

- **CLS** ↔ layout stability around slots — see [audits/cumulative-ad-shift.md](audits/cumulative-ad-shift.md).
- **TBT / long tasks** ↔ main-thread blocking — see [audits/total-ad-blocking-time.md](audits/total-ad-blocking-time.md) and [audits/ad-blocking-tasks.md](audits/ad-blocking-tasks.md) (manual).
- **LCP / render-blocking** ↔ early load path — see [audits/ad-render-blocking-resources.md](audits/ad-render-blocking-resources.md) (manual).

## Gap analysis (required in HTML)

For every engagement, list that the following **were not** executed as Lighthouse audits in this workflow (examples):

- Tag load time, GPT host verification, duplicate tags, GPT errors, header bidding parallelism, bid request timing, etc.

Point readers to the relevant **bundled** file in [audit-index.md](audit-index.md) for what to check manually.

## Display

- Category scores: `Math.round(score * 100)` with `—` if `score` is `null`.
