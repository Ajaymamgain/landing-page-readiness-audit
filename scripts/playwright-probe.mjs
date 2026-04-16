#!/usr/bin/env node
/**
 * Playwright: load URL in Chromium, capture ad-related network + console errors.
 * Does NOT use lighthouse-plugin-publisher-ads — complements stock Lighthouse.
 *
 * Usage: node scripts/playwright-probe.mjs <url> [out-json-path]
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const url = process.argv[2];
const outPath = process.argv[3] ?? join(root, 'reports', 'playwright-probe.json');

if (!url) {
  console.error('Usage: node scripts/playwright-probe.mjs <url> [out-json-path]');
  process.exit(1);
}

const AD_URL_RE =
  /gpt\.js|googletagservices|doubleclick|googleadservices|pagead2|googlesyndication|pubads|securepubads|tpc\.googlesyndication|fundingchoices|fundingchoicesmessages|google\.com\/pagead|gampad|adsbygoogle/i;

let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch (e) {
  console.error(`Failed to launch Chromium: ${e.message}`);
  process.exit(1);
}

const adRelatedRequests = [];
const allErrors = [];

let title = '';
let finalUrl = url;

try {
  const page = await browser.newPage();

  page.on('request', (req) => {
    const u = req.url();
    if (AD_URL_RE.test(u)) {
      adRelatedRequests.push({
        url: u.split('?')[0],
        type: req.resourceType(),
      });
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      allErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    allErrors.push(`PageError: ${err.message}`);
  });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const id = setInterval(() => {
          window.scrollBy(0, 600);
          y += 600;
          if (y > 12000) {
            clearInterval(id);
            resolve();
          }
        }, 400);
      });
    });
    await new Promise((r) => setTimeout(r, 5000));
  } catch (e) {
    allErrors.push(`Navigation: ${e.message}`);
  }

  title = await page.title().catch(() => '');
  finalUrl = page.url();
} finally {
  await browser.close();
}

const uniqueUrls = [...new Set(adRelatedRequests.map((x) => x.url))];
const result = {
  probedAt: new Date().toISOString(),
  requestedUrl: url,
  finalUrl,
  title,
  adRelatedRequestCount: adRelatedRequests.length,
  adRelatedUniqueUrls: uniqueUrls.slice(0, 40),
  consoleAndPageErrors: [...new Set(allErrors)].slice(0, 60),
  interpretation: {
    gptLikelyLoaded: uniqueUrls.some((u) => /gpt\.js|pubads|googletagservices/i.test(u)),
    hasConsoleErrors: allErrors.length > 0,
  },
};

writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
console.log(`Wrote ${outPath}`);
console.log(JSON.stringify(result.interpretation, null, 2));
