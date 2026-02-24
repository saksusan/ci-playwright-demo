const { test, expect } = require('@playwright/test');
const { beforeEach } = require('node:test');

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/');
});

test('Test Home Page Title', async ({ page }) => {
  await expect(page).toHaveTitle("QA Practice Store");
});

test('Test Valid Login', async ({ page }) => {
  await page.locator('#username').fill("admin")
  await page.locator('#password').fill("password123")
  await page.locator('#loginBtn').click();
  await expect(page.locator('#message')).toHaveText('Login Successful')
});

// test('Test Invalid Login', async ({ page }) => {
//   await expect(page).toHaveTitle("QA Practice Store");
// });

test('Test Store', async ({ page }) => {
  await page.locator('#addToCartBtn').click();
  await expect(page.locator('#cartList')).toHaveText("Item added!");
});