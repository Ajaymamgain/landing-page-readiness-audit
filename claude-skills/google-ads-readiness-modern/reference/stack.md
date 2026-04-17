# Stack: Lighthouse + Playwright + DevTools (no Publisher Ads plugin)

## Why not the npm plugin?

The **`lighthouse-plugin-publisher-ads`** package targets an old Lighthouse internal API surface. On modern Lighthouse it fails to load. **Study** the plugin’s [docs/audits](https://github.com/googleads/publisher-ads-lighthouse-plugin/tree/main/docs/audits) for semantics; do not depend on the package for scores.

A full local mirror (all `*.md` + `images/`) lives under the sibling skill [`publisher-ads-readiness/reference/audits/`](../../publisher-ads-readiness/reference/audits/).

## Lighthouse (stock)

- Install: `npm install -D lighthouse@^12` (or `npx lighthouse@latest`).
- Produces reproducible **lab** scores and traces. No `--plugins` for Publisher Ads.

## Playwright

- Drives **real Chromium** with full network and console.
- Use to detect **requests** to GPT / Google ad domains and **JS errors** from ad stacks.
- Optional: multiple URLs (home vs article), mobile viewport, cookie / localStorage for consent.

## Chrome DevTools

- **Performance** panel: main thread, long tasks, third parties.
- **Network**: filter `gpt`, `doubleclick`, `googlesyndication`.
- **Coverage**: unused JS bytes.
- **Issues** / **Console**: GPT or CMP errors.

## Combining signals

- **Lighthouse** — Core Web Vitals lab, category scores, opportunities.
- **Playwright** — Whether ad scripts actually requested; runtime errors.
- **DevTools** — Deep dives, A/B blocking third parties.
- **Publisher Ads docs (read-only)** — Naming risks to match Google’s audit vocabulary.
