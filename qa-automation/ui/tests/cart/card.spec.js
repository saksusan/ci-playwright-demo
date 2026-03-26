import { test, expect } from '../base/baseTest';
import { CartPage } from '../../pages/CartPage';

test('Add product to cart @sanity @regression', async ({ page }) => {
  const cart = new CartPage(page);

  await cart.addProductToCart(1);
  await cart.openCart();

  const count = await cart.getCartItemCount();
  expect(count).toBeGreaterThan(0);
});

// test('Remove product from cart @regression', async ({ page }) => {
//   const cart = new CartPage(page);

//   await cart.addProductToCart(1);
//   await cart.openCart();
//   await cart.removeFirstItem();

//   const count = await cart.getCartItemCount();
//   expect(count).toBe(0);
// });

test('Checkout completes successfully @regression', async ({ page }) => {
  const cart = new CartPage(page);

  await cart.addProductToCart(1);
  await cart.addProductToCart(2);
  await cart.openCart();
  await cart.checkout();

  await expect(page).not.toHaveURL(/cart/);
});