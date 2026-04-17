# Publisher Ads audit documentation (bundled)

These files mirror `docs/audits/` from [googleads/publisher-ads-lighthouse-plugin](https://github.com/googleads/publisher-ads-lighthouse-plugin). Use them to explain audit IDs in Lighthouse HTML/JSON reports.

**Note:** The running plugin may ship additional audits (for example `full-width-slots` in code) without a matching `.md` in `docs/audits/` for every release. Explain those from LHR `audits[id].description` when no local doc exists.

**Images:** [audits/images/](audits/images/) mirrors upstream PNGs for `duplicate-tags.md` and `script-injected-tags.md`.

## Index

- [`ad-blocking-tasks.md`](audits/ad-blocking-tasks.md) — Avoid long tasks that block ad-related network requests
- [`ad-render-blocking-resources.md`](audits/ad-render-blocking-resources.md) — Avoid render-blocking resources
- [`ad-request-critical-path.md`](audits/ad-request-critical-path.md) — Ad request waterfall
- [`ad-request-from-page-start.md`](audits/ad-request-from-page-start.md) — Reduce latency of first ad request
- [`ad-request-from-tag-load.md`](audits/ad-request-from-tag-load.md) — Reduce latency of first ad request (from tag load)
- [`ad-top-of-viewport.md`](audits/ad-top-of-viewport.md) — Move the top ad further down the page
- [`ads-in-viewport.md`](audits/ads-in-viewport.md) — Lazily load ads below the fold
- [`async-ad-tags.md`](audits/async-ad-tags.md) — Load ad tag asynchronously
- [`bid-request-from-page-start.md`](audits/bid-request-from-page-start.md) — Reduce time to send the first bid request
- [`blocking-load-events.md`](audits/blocking-load-events.md) — Avoid waiting on load events
- [`bottleneck-requests.md`](audits/bottleneck-requests.md) — Avoid bottleneck requests
- [`cumulative-ad-shift.md`](audits/cumulative-ad-shift.md) — Reduce ad-related layout shift
- [`deprecated-api-usage.md`](audits/deprecated-api-usage.md) — Avoid deprecated GPT APIs
- [`duplicate-tags.md`](audits/duplicate-tags.md) — Load tags only once per frame
- [`first-ad-render.md`](audits/first-ad-render.md) — Reduce time to render first ad
- [`gpt-bids-parallel.md`](audits/gpt-bids-parallel.md) — Load GPT and bids in parallel
- [`gpt-errors-overall.md`](audits/gpt-errors-overall.md) — Fix GPT errors
- [`loads-ad-tag-over-https.md`](audits/loads-ad-tag-over-https.md) — Load ad tag over HTTPS
- [`loads-gpt-from-official-source.md`](audits/loads-gpt-from-official-source.md) — Load GPT from recommended host
- [`script-injected-tags.md`](audits/script-injected-tags.md) — Load ad scripts statically
- [`serial-header-bidding.md`](audits/serial-header-bidding.md) — Parallelize bid requests
- [`tag-load-time.md`](audits/tag-load-time.md) — Reduce tag load time
- [`total-ad-blocking-time.md`](audits/total-ad-blocking-time.md) — Reduce Ad JS Blocking Time
- [`viewport-ad-density.md`](audits/viewport-ad-density.md) — Reduce ads to page-height ratio

## Other upstream docs in this skill

- [upstream-plugin-README.md](upstream-plugin-README.md) — npm usage and CLI
- [upstream-CONTRIBUTING.md](upstream-CONTRIBUTING.md) — contributing
- [upstream-lighthouse-ci-README.md](upstream-lighthouse-ci-README.md) — Lighthouse CI
- [github-issue-templates/](github-issue-templates/) — GitHub issue templates
