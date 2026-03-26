import { test, expect } from '../base/baseTest';
import { CategoriesPage } from '../../pages/CategoriesPage';
import { ProductsPage } from '../../pages/ProductsPage';

test('Select All resets category filter @regression', async ({ page }) => {
  const categories = new CategoriesPage(page);
  const products = new ProductsPage(page);

  await categories.selectAll();

  const count = await products.getProductCount();
  expect(count).toBeGreaterThan(0);
});

test('Filter products by Books category @regression', async ({ page }) => {
  const categories = new CategoriesPage(page);
  const products = new ProductsPage(page);

  await categories.selectCategory('Books');

  const count = await products.getProductCount();
  expect(count).toBeGreaterThan(0);
});

test('Filter products by Clothing category @regression', async ({ page }) => {
  const categories = new CategoriesPage(page);
  const products = new ProductsPage(page);

  await categories.selectCategory('Clothing');

  const count = await products.getProductCount();
  expect(count).toBeGreaterThan(0);
});