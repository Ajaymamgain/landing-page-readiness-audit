# Chrome DevTools checklist (Google Ads readiness)

Run on the **same URL** you care about monetizing (often not the homepage).

## Network

1. Open **Network**, preserve log, hard reload.
2. Filter: `gpt` · `pubads` · `doubleclick` · `googlesyndication` · `pagead`.
3. Confirm **gpt.js** (or loader) loads from expected host; note **redirect chains** and **failed** (red) requests.
4. Check **priority / timing** — ad JS competing with LCP image.

## Performance

1. Record trace while scrolling and waiting for slots to fill.
2. Inspect **long tasks** & **main-thread** cost from ad / CMP scripts.

## Console & Issues

1. Note **GPT** or **slot** errors, **CORS**, **CSP** blocks.
2. **Issues** tab: deprecated APIs, cookie warnings (relevant to ads in some regions).

## Rendering

1. **Layout Shift Regions** (if available) for slot injection.
2. Verify slot **sizes** reserved to limit CLS (compare [Publisher Ads doc themes](https://github.com/googleads/publisher-ads-lighthouse-plugin/tree/main/docs/audits) conceptually).
