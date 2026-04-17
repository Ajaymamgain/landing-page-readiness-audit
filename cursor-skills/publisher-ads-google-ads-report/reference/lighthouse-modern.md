# Lighthouse CLI + Publisher Ads plugin

## Requirements

- **Node.js** 18+ (22+ recommended).
- **Chrome / Chromium** for Lighthouse; set `CHROME_PATH` if needed.
- **Local install**: In a dedicated folder (the **project root** for runs), install pinned versions (see below).

Do **not** rely on a global install of `lighthouse-plugin-publisher-ads` alone; resolution is from the **current working directory’s** `node_modules`.

## Lighthouse version compatibility (critical)

The npm package **`lighthouse-plugin-publisher-ads@1.5.x`** declares a peer dependency on **`lighthouse@8.6.0`** and its implementation **imports internal Lighthouse paths** that match that era. Using **Lighthouse 12+** with the current plugin release **fails at load time** (missing `lighthouse-core` paths).

**Practical rule:** for a working **Publisher Ads plugin** run today, pin **`lighthouse@8.6.0`** and **`lighthouse-plugin-publisher-ads@1.5.6`** in the runner project (exact pins as in [package.json.example](package.json.example)).

For **stock Lighthouse 12+** only (no Publisher Ads plugin), use a separate `devDependency` on `lighthouse` and **omit** `--plugins` — then use the skill’s **manual** checklist from bundled audit docs.

A ready-to-use runner project exists on disk (see [runner-project.md](runner-project.md)).

## Primary command (Publisher Ads “Google Ads report” path)

Run from the project root:

```bash
npx lighthouse "https://www.example.com/path" \
  --plugins=lighthouse-plugin-publisher-ads \
  --output=json --output=html \
  --output-path=./reports/pub-ads-run \
  --chrome-flags="--headless=new" \
  --quiet
```

Artifacts: `reports/pub-ads-run.report.json` and `reports/pub-ads-run.report.html` (Lighthouse naming).

## What the plugin adds

- A **Publisher Ads** category (GPT / AdSense–oriented audits) alongside default Lighthouse categories. See [plugin-lhr.md](plugin-lhr.md) for JSON fields.

## Desktop vs mobile

- Default CLI profile is **mobile** (lab).
- For desktop comparison:

```bash
npx lighthouse "https://www.example.com/path" \
  --plugins=lighthouse-plugin-publisher-ads \
  --preset=desktop \
  --output=json --output=html \
  --output-path=./reports/pub-ads-desktop \
  --chrome-flags="--headless=new" \
  --quiet
```

## GitHub Lighthouse (advanced)

To use a **built** Lighthouse from a local clone, the **major version** must still be compatible with the plugin (see compatibility above). From the **same project root** that contains `lighthouse-plugin-publisher-ads` in `node_modules`:

```bash
node /path/to/lighthouse/cli.js "https://example.com" \
  --plugins=lighthouse-plugin-publisher-ads \
  --output=json --output=html \
  --output-path=./reports/run \
  --chrome-flags="--headless=new" \
  --quiet
```

## Lighthouse CI

For CI recipes upstream, see [upstream-lighthouse-ci-README.md](upstream-lighthouse-ci-README.md).

## Operational notes

- **Exit code**: treat **JSON** as the source of truth for gating; CLI may exit `0` with poor scores.
- **Variance**: same machine and flags when comparing runs over time.
