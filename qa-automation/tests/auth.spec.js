const { test, expect } = require('@playwright/test');
const { beforeEach } = require('node:test');

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/');
});

test('Test Home Page Title', async ({ page }) => {
  await expect(page).toHaveTitle("  QA Practice Store");
});

test('Test Valid Register', async ({ page }) => {
  await page.locator('#authNavBtn').click();
  await page.locator('#tabRegister').click()
  await page.locator('#regUsername').fill("usan")
  await page.locator('#regEmail').fill("usan@gmail.com")
  await page.locator('#regPassword').fill("Pass@123")
  await page.locator('#registerBtn').click();
  // await expect(page.locator('#message')).toHaveText('Login Successful')
});

test('Test Valid Login', async ({ page }) => {
  await page.locator('#tabLogin').click();
  await page.locator('#tabRegister').click()
  await page.locator('#loginEmail').fill("usan@gmail.com")
  await page.locator('#loginPassword').fill("Pass@123")
  await page.locator('#loginBtn').click();
  // await expect(page.locator('#message')).toHaveText('Login Successful')
});

// test('Test Invalid Login', async ({ page }) => {
//   await expect(page).toHaveTitle("QA Practice Store");
// });

test('Test Store', async ({ page }) => {
  await page.locator('#addToCartBtn').click();
  await expect(page.locator('#cartList')).toHaveText("Item added!");
});
