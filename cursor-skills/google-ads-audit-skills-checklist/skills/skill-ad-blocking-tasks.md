# Audit Skill: Avoid long tasks that block ad-related network requests

**Category**: Performance  
**Lighthouse audit ID**: `ad-blocking-tasks`  
**Skill level**: Intermediate  
**Typical impact**: High  
**Upstream source**: [Publisher Ads Lighthouse plugin — docs/audits](https://github.com/googleads/publisher-ads-lighthouse-plugin/tree/main/docs/audits)

---

## Overview

This audit checks whether or not the first ad request is being delayed by long
tasks. A
[long task](https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API) is
defined as JavaScript code that blocks the main thread for 50ms or more. If long
tasks occur before an ad request, the browser will be unable to issue the
request until all of the tasks complete.

Note: Although 50ms is the commonly accepted long task threshold, this audit
will only flag tasks that block the main thread for 100ms or more. This is
because shorter tasks generally have a smaller impact on ad loading.

## Recommendations

Examine the tasks that are blocking the first ad request and investigate ways to
remove them or reduce their execution time below 100ms. Some approaches to
reducing execution time include:

* Optimizing tasks to execute faster
* Splitting tasks into smaller chunks, which individually execute in < 100ms
* Delaying tasks until after ad requests are made
* Moving tasks off of the main thread via a worker

## More information
This audit displays the top 10 longest tasks by execution time, sorted by start
time (ascending).

[Are long JavaScript tasks delaying your Time to Interactive?](https://web.dev/long-tasks-devtools)  
[Inspect Network Activity In Chrome DevTools](https://developer.chrome.com/docs/devtools/network/)

