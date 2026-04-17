# Reading Publisher Ads scores in Lighthouse JSON (LHR)

## Category

The plugin adds a category titled **Publisher Ads** (GPT / AdSense–oriented). In LHR `categories`, the object key is typically the npm module name: **`lighthouse-plugin-publisher-ads`**.

Robust lookup if keys differ by version:

```js
const cats = lhr.categories;
const pub = cats['lighthouse-plugin-publisher-ads']
  ?? Object.values(cats).find((c) => c.title === 'Publisher Ads');
const score100 = pub && pub.score != null ? Math.round(pub.score * 100) : null;
```

## Audits

Publisher Ads audits appear under top-level `audits` with string ids such as:

- `tag-load-time`, `ad-request-from-page-start`, `cumulative-ad-shift`, `gpt-errors-overall`, `async-ad-tags`, `loads-gpt-from-official-source`, …

Each audit entry includes `score` (0–1 or `null`), `scoreDisplayMode`, `title`, `description`, and often `details`.

Use the bundled [audit-index.md](audit-index.md) / [audits/](audit-index.md) markdown files to explain what each id means in stakeholder language.

## Plugin vs docs

Upstream **plugin.js** may reference an audit id that uses a **slightly different** id string than the `docs/audits/*.md` filename (for example `deprecated-gpt-api-usage` vs `deprecated-api-usage.md`). Always prefer **ids present in LHR** when explaining failures, and map to the closest doc file when names differ.

## Stock categories

For the outer “Digital Insights”-style shell, also read:

- `categories.performance`, `categories.accessibility`, `categories['best-practices']`, `categories.seo` — scores are 0–1; multiply by 100 for display.
