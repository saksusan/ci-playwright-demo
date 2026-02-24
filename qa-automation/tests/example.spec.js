const { test, expect } = require('@playwright/test');

test('Test Login Page Title', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');
  await expect(page).toHaveTitle(/The Internet/);
});