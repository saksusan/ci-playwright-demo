import { chromium } from '@playwright/test';

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/');

  // Step 1 — Open Auth modal
  await page.locator('#authNavBtn').click();

  // Step 2 — Try to Register (safe if user already exists in DB)
  try {
    await page.locator('#tabRegister').click();
    // Wait for register form to become visible before filling it
    await page.locator('#regUsername').waitFor({ state: 'visible' });
    await page.locator('#regUsername').fill('usan');
    await page.locator('#regEmail').fill('usan@gmail.com');
    await page.locator('#regPassword').fill('Pass@123');
    await page.locator('#registerBtn').click();
    // Wait for registartion API response before switching tabs
    await page.waitForTimeout(1500);
  } catch (e) {
    console.log('ℹ️  Register step skipped (user may already exist):', e.message);
  }

  // Step 3 — Login with the user (always runs)
  await page.locator('#tabLogin').click();
  // Wait for login form to be visible before filling it
  await page.locator('#loginEmail').waitFor({ state: 'visible' });
  await page.locator('#loginEmail').fill('usan@gmail.com');
  await page.locator('#loginPassword').fill('Pass@123');
  await page.locator('#loginBtn').click();

  // Step 4 — Wait until shopToken appears in localStorage
  // IMPORTANT: The app stores the JWT under key 'shopToken' (see index.html ~ line 1668):
  //   localStorage.setItem('shopToken', data.token);
  await page.waitForFunction(
    () => localStorage.getItem('shopToken') !== null,
    null,
    { timeout: 60_000 }
  );

  // Step 5 — Save auth state to auth.json
  await page.context().storageState({ path: 'auth.json' });

  await browser.close();
  console.log('✅ global-setup done — auth.json saved');
}