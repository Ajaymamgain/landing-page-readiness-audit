# Audit Skill: Reduce time to render first ad

**Category**: Performance  
**Lighthouse audit ID**: `first-ad-render`  
**Skill level**: Intermediate  
**Typical impact**: High  
**Upstream source**: [Publisher Ads Lighthouse plugin — docs/audits](https://github.com/googleads/publisher-ads-lighthouse-plugin/tree/main/docs/audits)

---

## Overview

The time it takes for the first ad to be rendered. This is the interval from
page load until the first ad impression is recorded.

## Recommendations

This metric is not indicative of a specific issue. It should be used to help
identify areas for improvement and track that improvement over time.

The goal here is to reduce the time it takes for the first ad to be rendered.
Ensuring that other, more specific audits are passing should have a major impact
on this metric. In particular, audits affecting [tag load time](./tag-load-time.md)
and [latency of first ad request (from tag load)](./ad-request-from-tag-load.md)
are likely to affect this metric.

## More information

[Avoiding Common GPT Implementation Mistakes](https://developers.google.com/publisher-tag/common_implementation_mistakes)  
[Tagging best practices to minimize page latency](https://support.google.com/admanager/answer/7485975)

