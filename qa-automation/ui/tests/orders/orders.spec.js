import { test, expect } from '../base/baseTest';
import { CartPage } from '../../pages/CartPage';
import { OrdersPage } from '../../pages/OrdersPage';

test.beforeEach(async ({ page }) => {
  const cart = new CartPage(page);
  await cart.addProductToCart(1);
  await cart.openCart();
  await cart.checkout();
});

test('Orders page loads correctly @regression', async ({ page }) => {
  const orders = new OrdersPage(page);
  await orders.viewOrders();

  // await expect(page).toHaveURL(/orders/);
});

test('Placed order is visible in orders list @regression', async ({ page }) => {
  const orders = new OrdersPage(page);
  await orders.viewOrders();

  const count = await orders.getOrderCount();
  expect(count).toBeGreaterThan(0);
});