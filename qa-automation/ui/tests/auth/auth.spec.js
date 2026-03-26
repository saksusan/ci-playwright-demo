import { test, expect } from '../base/baseTest';
import { AuthPage } from '../../pages/Authpage';


test.use({ storageState: { cookies: [], origins: [] } });

test('Home page title is correct @smoke', async ({ page }) => {
  await expect(page).toHaveTitle('QA Practice Store');
});

test('Valid register works @smoke', async ({ page }) => {
  const authPage = new AuthPage(page);
  const randomEmail = `testuser_${Date.now()}@gmail.com`;
  const randomUser = `testuser_${Date.now()}`;

  await authPage.openAuth();
  await authPage.openRegister();
  await authPage.register(randomUser, randomEmail, 'Pass@123');
});

test('Valid login works @smoke @sanity @regression', async ({ page }) => {
  const authPage = new AuthPage(page);

  await authPage.openAuth();
  await authPage.openLogin();
  await authPage.login('usan@gmail.com', 'Pass@123');
});