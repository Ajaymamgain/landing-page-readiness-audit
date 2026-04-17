# Audit Skill: Avoid waiting on load events

**Category**: Performance  
**Lighthouse audit ID**: `blocking-load-events`  
**Skill level**: Intermediate  
**Typical impact**: High  
**Upstream source**: [Publisher Ads Lighthouse plugin — docs/audits](https://github.com/googleads/publisher-ads-lighthouse-plugin/tree/main/docs/audits)

---

## Overview

This audit checks whether or not the first ad request is blocked on a page load
event. Ad requests themselves do not interact with the DOM and are not dependent
on the page being fully loaded. It's therefore recommended to make ad requests
as early as possible to speed up ad loading.

## Recommendations

Remove any logic that prevents ad requests from being made before the page
`load` or `domContentLoaded` events fire.

