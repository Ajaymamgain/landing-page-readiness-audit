# Sample runner project

A runnable workspace was created at:

`publisher-ads-lighthouse-runner` (default: `~/Projects/publisher-ads-lighthouse-runner`)

It pins **Lighthouse 8.6.0** and **lighthouse-plugin-publisher-ads 1.5.6** so the plugin loads correctly.

- `npm run audit -- <url> [output-basename]` — writes `*.report.json` and `*.report.html` under `reports/`.
- `npm run summary -- path/to.report.json` — prints category scores including Publisher Ads.

Copy or adapt this folder for CI or local runs; keep the same `devDependency` pins unless you verify a newer plugin + Lighthouse pair.
