import { test, expect } from '@playwright/test';

test('should load Playwright website', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  const title = await page.title();
  expect(title).toBe('Playwright');
});
