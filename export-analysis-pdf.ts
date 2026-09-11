import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

async function exportAnalysisToPdf() {
  const outputPath = path.resolve(process.cwd(), 'Playwright_Test_Flakiness_Analysis.pdf');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Playwright Automation Analysis - Root Causes & Solutions</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #24292e;
      line-height: 1.6;
      font-size: 13px;
    }
    h1 {
      color: #0f2d59;
      font-size: 22px;
      border-bottom: 2px solid #0f2d59;
      padding-bottom: 8px;
      margin-top: 0;
    }
    h2 {
      color: #1a4971;
      font-size: 16px;
      margin-top: 18px;
      margin-bottom: 8px;
      border-bottom: 1px solid #e1e4e8;
      padding-bottom: 4px;
    }
    h3 {
      color: #2b5d8f;
      font-size: 14px;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    p {
      margin: 6px 0 10px 0;
    }
    ul, ol {
      margin: 6px 0 12px 20px;
      padding: 0;
    }
    li {
      margin-bottom: 6px;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
      background: #eef2f7;
      color: #1a4971;
      margin-bottom: 12px;
    }
    .card {
      background: #f8fafc;
      border-left: 4px solid #1a4971;
      padding: 10px 14px;
      margin: 10px 0;
      border-radius: 0 4px 4px 0;
    }
    .card-warning {
      background: #fffbeb;
      border-left: 4px solid #d97706;
      padding: 10px 14px;
      margin: 10px 0;
      border-radius: 0 4px 4px 0;
    }
    .card-success {
      background: #f0fdf4;
      border-left: 4px solid #16a34a;
      padding: 10px 14px;
      margin: 10px 0;
      border-radius: 0 4px 4px 0;
    }
    code {
      font-family: Consolas, Monaco, "Courier New", monospace;
      background: #e2e8f0;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 12px;
    }
    .footer {
      margin-top: 30px;
      font-size: 11px;
      color: #64748b;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <h1>Playwright Test Suite Stability & Flakiness Analysis</h1>
  <div class="badge">Project: DXL Playwright Automation Framework | Scope: Cross-Browser E2E Stability</div>

  <div class="card-warning">
    <strong>Core Question:</strong> <em>"When we fix an issue for a failed test, why does another test fail?"</em>
  </div>

  <p>
    In modern, dynamic Single-Page Applications (SPAs) and e-commerce platforms like DXL.com, test flakiness and shifting failures across test runs typically stem from four primary architectural and environmental factors:
  </p>

  <h2>1. Heavy Parallel Execution Against Live Production Site</h2>
  <ul>
    <li><strong>Rate Limiting & Anti-Bot Throttling:</strong> Running multiple browser workers (e.g. <code>workers: 3</code>) creates simultaneous bursts of traffic against the live CDN and edge servers (Akamai / Cloudflare).</li>
    <li><strong>Asynchronous Timing Shifts:</strong> When one test is optimized or fixed, its execution duration decreases. This alters the exact second when concurrent network requests collide, shifting server delays or rate-limiting responses to a different worker.</li>
  </ul>

  <h2>2. Randomized Test Data Across Executions</h2>
  <ul>
    <li><strong>Dynamic Landing Page Layouts:</strong> When tests draw randomized queries (e.g. <code>'shirts'</code>, <code>'tie'</code>, <code>'shoes'</code>), the server returns fundamentally different layouts:
      <ul>
        <li>Standard product categories render full textual breadcrumbs and <code>&lt;h1&gt;</code> headers.</li>
        <li>Curated seasonal categories (e.g., Activewear, Suiting, Outerwear) render marketing image banners, hero carousels, or title variants like <em>"Men's Big + Tall Suits | DXL"</em>.</li>
      </ul>
    </li>
    <li><strong>DOM Discrepancies:</strong> A test may pass on Run #1 because it selected a standard PLP, but fail on Run #2 when selecting a category with an alternate DOM hierarchy.</li>
  </ul>

  <h2>3. Asynchronous React / Next.js Hydration Differences</h2>
  <ul>
    <li><strong>SSR vs. CSR Replacement:</strong> When DXL loads, the server sends initial HTML, and client-side JavaScript then re-renders (hydrates) the interactive components.</li>
    <li><strong>DOM Detachment:</strong> In WebKit (Safari engine) and Firefox, hydration speeds differ from Chromium. If Playwright attempts an action while React replaces an unmounted node, a <code>TimeoutError: element was detached from the DOM</code> occurs.</li>
  </ul>

  <h2>4. Shared Page Object Model (POM) Coupling</h2>
  <ul>
    <li><strong>Unified Helpers:</strong> Shared utility methods (such as <code>validateBreadcrumb()</code> or <code>enterSearchQuery()</code>) serve dozens of test cases across multiple test files.</li>
    <li><strong>Narrow Regex / Edge-Case Overfitting:</strong> Adjusting an assertion for one category pattern (e.g. matching only <code>/Outerwear/i</code>) without category synonyms (e.g., coats, jackets, suiting, suits) can inadvertently cause sibling tests calling that same helper to fail.</li>
  </ul>

  <h2>Strategic Solutions for 100% Framework Stability</h2>

  <div class="card-success">
    <h3>Recommended Best Practices Applied to the Framework:</h3>
    <ol>
      <li><strong>Deterministic Data Selection:</strong> Use standardized, stable test data for UI contract assertions (e.g., breadcrumb and pagination tests) to ensure predictable DOM structures.</li>
      <li><strong>Flexible Synonym Matching in Assertions:</strong> Use comprehensive regular expressions (e.g., <code>/suit|suiting/i</code>, <code>/outerwear|coats|jackets/i</code>) with multi-tier fallbacks (Breadcrumb → Heading → Page Title).</li>
      <li><strong>Hydration-Resilient Action Handlers:</strong> Re-query locators with automatic fallback setter injection to prevent DOM detachment timeouts during React re-mounting.</li>
      <li><strong>Controlled Concurrency for Live Environments:</strong> Run live smoke/regression suites with optimal worker limits (1–2 workers) to minimize CDN rate limiting and protocol socket exhaustion.</li>
    </ol>
  </div>

  <div class="footer">
    Generated by Playwright Automation QA Team &bull; Document Version 1.0 &bull; DXL Playwright Framework
  </div>
</body>
</html>
  `;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  console.log(`Generating PDF to: ${outputPath}`);
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      right: '15mm',
      bottom: '15mm',
      left: '15mm',
    },
  });

  await browser.close();
  console.log(`✅ Successfully generated: ${outputPath}`);
}

exportAnalysisToPdf().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
