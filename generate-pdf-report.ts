import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

async function generatePdfReport() {
  const reportHtmlPath = path.resolve(process.cwd(), 'playwright-report', 'index.html');
  const outputPdfPath = path.resolve(process.cwd(), 'playwright-report', 'test-results.pdf');

  if (!fs.existsSync(reportHtmlPath)) {
    console.error(`Report file not found at: ${reportHtmlPath}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Loading HTML report from: ${reportHtmlPath}`);
  await page.goto(`file://${reportHtmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Expand all test items if expandable buttons exist
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, summary, [aria-expanded="false"]'));
    buttons.forEach((b: any) => {
      try {
        b.click();
      } catch {}
    });
  });
  await page.waitForTimeout(1000);

  console.log(`Generating PDF report to: ${outputPdfPath}`);
  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px',
    },
  });

  await browser.close();
  console.log(`✅ PDF Test Report generated successfully at: ${outputPdfPath}`);
}

generatePdfReport().catch((err) => {
  console.error('Error generating PDF report:', err);
  process.exit(1);
});
