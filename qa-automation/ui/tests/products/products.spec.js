import { test, expect } from '../base/baseTest';
import { ProductsPage } from '../../pages/ProductsPage';

test('Products list is visible @smoke @sanity @regression', async ({ page }) => {
  const products = new ProductsPage(page);

  const count = await products.getProductCount();
  expect(count).toBeGreaterThan(0);
});

test('Search product by name @regression', async ({ page }) => {
  const products = new ProductsPage(page);

  await products.searchProduct('keyboard');

  // const count = await products.getProductCount();
  // expect(count).toBeGreaterThan(0);
});

test('Sort products by price ascending @regression', async ({ page }) => {
  const products = new ProductsPage(page);

  await products.sortBy('price_asc');

  // const count = await products.getProductCount();
  // expect(count).toBeGreaterThan(0);
});

test('Filter products by price range @regression', async ({ page }) => {
  const products = new ProductsPage(page);

  await products.filterByPrice('0-30');

  // const count = await products.getProductCount();
  // expect(count).toBeGreaterThan(0);
});