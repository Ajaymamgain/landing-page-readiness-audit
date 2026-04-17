# Google Ads Audit Skills Checklist

**Based on official Publisher Ads Audits for Lighthouse**  
**Source**: [googleads/publisher-ads-lighthouse-plugin — `docs/audits`](https://github.com/googleads/publisher-ads-lighthouse-plugin/tree/main/docs/audits)

**Purpose**: Ready-to-use **audit skills** as individual Markdown files under [`skills/`](skills/) (or use this file as a master index). Each skill is formatted for quick reference, training, or building an audit playbook / knowledge base.

**Audit ID map**: [reference/audit-id-map.md](reference/audit-id-map.md) (same mapping as below, with clickable links).

**Regeneration**: Bundled prose is copied from `../publisher-ads-readiness/reference/audits/` with a standard header. From this skill folder, rebuild with:

```bash
node scripts/build-skill-files.mjs
```

**Note**: The npm `lighthouse-plugin-publisher-ads` is often **incompatible** with current Lighthouse. Treat these audits as **manual / assisted review** checklists alongside stock Lighthouse + DevTools (see [`publisher-ads-readiness`](../publisher-ads-readiness/SKILL.md)).

---

## Available audit skills (24 total)

| # | Skill (plain language) | File |
|---|------------------------|------|
| 1 | Avoid long tasks that block ad-related network requests | [`skills/skill-ad-blocking-tasks.md`](skills/skill-ad-blocking-tasks.md) |
| 2 | Avoid render-blocking ad resources | [`skills/skill-ad-render-blocking-resources.md`](skills/skill-ad-render-blocking-resources.md) |
| 3 | Ad request is not on the critical path | [`skills/skill-ad-request-critical-path.md`](skills/skill-ad-request-critical-path.md) |
| 4 | Minimize delay between page start and first ad request | [`skills/skill-ad-request-from-page-start.md`](skills/skill-ad-request-from-page-start.md) |
| 5 | Minimize delay between ad tag load and first ad request | [`skills/skill-ad-request-from-tag-load.md`](skills/skill-ad-request-from-tag-load.md) |
| 6 | Ads appear at the top of the viewport | [`skills/skill-ad-top-of-viewport.md`](skills/skill-ad-top-of-viewport.md) |
| 7 | Ads are visible in the viewport | [`skills/skill-ads-in-viewport.md`](skills/skill-ads-in-viewport.md) |
| 8 | Load ad tag asynchronously | [`skills/skill-async-ad-tags.md`](skills/skill-async-ad-tags.md) |
| 9 | Minimize delay between page start and first bid request | [`skills/skill-bid-request-from-page-start.md`](skills/skill-bid-request-from-page-start.md) |
| 10 | Avoid blocking load events | [`skills/skill-blocking-load-events.md`](skills/skill-blocking-load-events.md) |
| 11 | Minimize ad-related bottleneck requests | [`skills/skill-bottleneck-requests.md`](skills/skill-bottleneck-requests.md) |
| 12 | Minimize cumulative layout shift caused by ads | [`skills/skill-cumulative-ad-shift.md`](skills/skill-cumulative-ad-shift.md) |
| 13 | Avoid deprecated API usage | [`skills/skill-deprecated-api-usage.md`](skills/skill-deprecated-api-usage.md) |
| 14 | Avoid duplicate ad tags | [`skills/skill-duplicate-tags.md`](skills/skill-duplicate-tags.md) |
| 15 | Minimize time to first ad render | [`skills/skill-first-ad-render.md`](skills/skill-first-ad-render.md) |
| 16 | Use parallel header bidding with GPT | [`skills/skill-gpt-bids-parallel.md`](skills/skill-gpt-bids-parallel.md) |
| 17 | Minimize GPT errors | [`skills/skill-gpt-errors-overall.md`](skills/skill-gpt-errors-overall.md) |
| 18 | Load ad tags over HTTPS | [`skills/skill-loads-ad-tag-over-https.md`](skills/skill-loads-ad-tag-over-https.md) |
| 19 | Load GPT from official source | [`skills/skill-loads-gpt-from-official-source.md`](skills/skill-loads-gpt-from-official-source.md) |
| 20 | Avoid script-injected ad tags | [`skills/skill-script-injected-tags.md`](skills/skill-script-injected-tags.md) |
| 21 | Avoid serial header bidding | [`skills/skill-serial-header-bidding.md`](skills/skill-serial-header-bidding.md) |
| 22 | Minimize ad tag load time | [`skills/skill-tag-load-time.md`](skills/skill-tag-load-time.md) |
| 23 | Minimize total ad blocking time | [`skills/skill-total-ad-blocking-time.md`](skills/skill-total-ad-blocking-time.md) |
| 24 | Avoid excessive ad density in viewport | [`skills/skill-viewport-ad-density.md`](skills/skill-viewport-ad-density.md) |

---

## Example: full skill file

See [`skills/skill-async-ad-tags.md`](skills/skill-async-ad-tags.md) for a complete example (metadata block + Overview + Recommendations from upstream docs).
