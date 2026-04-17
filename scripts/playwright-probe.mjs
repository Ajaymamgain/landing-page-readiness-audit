#!/usr/bin/env node
/**
 * Playwright: load URL in Chromium, detect marketing tracking pixels,
 * form/CTA inventory, and capture console errors for performance marketers.
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
const outPath = process.argv[3] ?? join(root, 'reports', 'latest-probe.json');

if (!url) {
  console.error('Usage: node scripts/playwright-probe.mjs <url> [out-json-path]');
  process.exit(1);
}

/**
 * Marketing platform tracking pixel patterns — what a paid campaign relies on.
 * Detection is regex over request URLs.
 */
const PIXEL_PATTERNS = {
  'Google Tag Manager': /googletagmanager\.com\/gtm\.js/,
  'GA4 (gtag)': /googletagmanager\.com\/gtag\/js\?id=G-|google-analytics\.com\/g\/collect/,
  'Google Ads Conversion': /googleads\.g\.doubleclick\.net\/pagead\/conversion|googleads\.g\.doubleclick\.net\/pagead\/landing/,
  'Google Ads Remarketing': /googleads\.g\.doubleclick\.net\/pagead\/viewthroughconversion/,
  'DoubleClick Floodlight': /fls\.doubleclick\.net\/activityi/,
  'Microsoft Ads (Bing UET)': /bat\.bing\.com\/(bat\.js|action)/,
  'LinkedIn Insight': /snap\.licdn\.com\/li\.lms-analytics|px\.ads\.linkedin\.com/,
  'Meta Pixel': /connect\.facebook\.net\/.+\/fbevents\.js|facebook\.com\/tr(\/|\?)/,
  'TikTok Pixel': /analytics\.tiktok\.com\/i18n\/pixel/,
  'X (Twitter) Pixel': /static\.ads-twitter\.com\/uwt\.js|t\.co\/i\/adsct/,
  'Pinterest Tag': /s\.pinimg\.com\/ct\/core\.js|ct\.pinterest\.com/,
  'Reddit Pixel': /redditstatic\.com\/ads\/pixel\.js|alb\.reddit\.com\/rp\.gif/,
  'Snapchat Pixel': /sc-static\.net\/scevent\.min\.js/,
  'HubSpot': /js\.hs-scripts\.com|track\.hubspot\.com/,
  'Hotjar': /static\.hotjar\.com\/c\/hotjar-/,
  'FullStory': /edge\.fullstory\.com\/s\/fs\.js/,
  'Segment': /cdn\.segment\.com\/analytics\.js/,
  'Mixpanel': /cdn\.mxpnl\.com\/libs\/mixpanel-/,
  'Intercom': /widget\.intercom\.io\/widget/,
  'Drift': /js\.driftt\.com\/include\//,
};

let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch (e) {
  console.error(`Failed to launch Chromium: ${e.message}`);
  process.exit(1);
}

const allRequests = [];
const allErrors = [];
const pixelHits = {};
for (const name of Object.keys(PIXEL_PATTERNS)) {
  pixelHits[name] = { detected: false, firstUrl: null, requestCount: 0 };
}

let title = '';
let finalUrl = url;
let forms = [];
let ctas = [];
let policyLinks = { privacy: false, terms: false, contact: false };
let consentBannerDetected = false;

try {
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  page.on('request', (req) => {
    const u = req.url();
    allRequests.push({ url: u.split('?')[0], type: req.resourceType() });
    for (const [name, pattern] of Object.entries(PIXEL_PATTERNS)) {
      if (pattern.test(u)) {
        pixelHits[name].detected = true;
        pixelHits[name].requestCount += 1;
        if (!pixelHits[name].firstUrl) pixelHits[name].firstUrl = u.split('?')[0];
      }
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') allErrors.push(msg.text());
  });
  page.on('pageerror', (err) => allErrors.push(`PageError: ${err.message}`));

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    // Scroll to flush lazy pixels and interactions
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

    // Form + CTA + policy inventory
    const snapshot = await page.evaluate(() => {
      const formList = Array.from(document.querySelectorAll('form')).map((f) => {
        const inputs = Array.from(f.querySelectorAll('input, select, textarea'));
        const visible = inputs.filter((i) => {
          const t = (i.getAttribute('type') || '').toLowerCase();
          return !['hidden', 'submit', 'button'].includes(t);
        });
        return {
          action: f.getAttribute('action') || '',
          method: (f.getAttribute('method') || 'GET').toUpperCase(),
          fieldCount: visible.length,
          fieldTypes: visible.map((i) => (i.getAttribute('type') || i.tagName.toLowerCase())),
        };
      });

      const ctaRe = /\b(get started|sign up|start free|try free|book a?\s*demo|schedule|download|buy now|add to cart|subscribe|join|register|request|claim|unlock|learn more|contact|talk to|start now|begin|enroll|apply now|shop now|order now)\b/i;
      const ctaList = Array.from(document.querySelectorAll('button, a'))
        .map((el) => (el.textContent || '').trim())
        .filter((t) => t && ctaRe.test(t))
        .slice(0, 15);

      const allLinks = Array.from(document.querySelectorAll('a'));
      const linkHrefs = allLinks.map((a) => (a.getAttribute('href') || '').toLowerCase());
      const linkTexts = allLinks.map((a) => (a.textContent || '').toLowerCase());

      const policy = {
        privacy: linkHrefs.some((h) => /privacy/.test(h)) || linkTexts.some((t) => /\bprivacy\b/.test(t)),
        terms: linkHrefs.some((h) => /\/terms|\/tos\b/.test(h)) || linkTexts.some((t) => /\bterms\b/.test(t)),
        contact: linkHrefs.some((h) => /\/contact|mailto:/.test(h)) || linkTexts.some((t) => /\bcontact\b/.test(t)),
      };

      // Heuristic consent banner
      const consent = !!document.querySelector(
        '[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], [id*="cmp" i]'
      );

      return { forms: formList, ctas: ctaList, policy, consent };
    });

    forms = snapshot.forms;
    ctas = snapshot.ctas;
    policyLinks = snapshot.policy;
    consentBannerDetected = snapshot.consent;
  } catch (e) {
    allErrors.push(`Navigation: ${e.message}`);
  }

  title = await page.title().catch(() => '');
  finalUrl = page.url();
} finally {
  await browser.close();
}

const detectedPixels = Object.entries(pixelHits)
  .filter(([, v]) => v.detected)
  .map(([name]) => name);

const conversionTrackingDetected = detectedPixels.some((name) =>
  [
    'Google Ads Conversion',
    'Google Ads Remarketing',
    'DoubleClick Floodlight',
    'Microsoft Ads (Bing UET)',
    'LinkedIn Insight',
    'Meta Pixel',
    'TikTok Pixel',
    'X (Twitter) Pixel',
    'Pinterest Tag',
    'Reddit Pixel',
    'Snapchat Pixel',
  ].includes(name)
);

const analyticsOnlyDetected =
  (pixelHits['GA4 (gtag)'].detected || pixelHits['Google Tag Manager'].detected) &&
  !conversionTrackingDetected;

const result = {
  probedAt: new Date().toISOString(),
  requestedUrl: url,
  finalUrl,
  title,
  totalRequests: allRequests.length,
  pixels: pixelHits,
  detectedPixelCount: detectedPixels.length,
  detectedPixelNames: detectedPixels,
  conversionTrackingDetected,
  analyticsOnlyDetected,
  forms,
  ctas,
  policyLinks,
  consentBannerDetected,
  consoleAndPageErrors: [...new Set(allErrors)].slice(0, 60),
  interpretation: {
    conversionTrackingReady: conversionTrackingDetected,
    hasConsoleErrors: allErrors.length > 0,
    primaryFormFields: forms[0]?.fieldCount ?? 0,
    ctaCount: ctas.length,
  },
};

writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
console.log(`Wrote ${outPath}`);
console.log(
  JSON.stringify(
    {
      conversionTrackingDetected,
      detectedPixels,
      formCount: forms.length,
      ctaCount: ctas.length,
    },
    null,
    2
  )
);
