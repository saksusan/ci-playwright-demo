export class ProductsPage {

  constructor(page) {
    this.page = page;
    this.sortDropdown = page.locator('#sortSelect');
    this.priceFilter = page.locator('#priceFilter');
    this.searchBox = page.getByRole('textbox', { name: 'Search products…' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.productCards = page.locator('[id^="card-"]');
  }

  async sortBy(value) {
    await this.sortDropdown.selectOption(value);
  }

  async filterByPrice(range) {
    await this.priceFilter.selectOption(range);
  }

  async searchProduct(name) {
    await this.searchBox.fill(name);
    await this.searchButton.click();
  }

  async getProductCount() {
    return await this.productCards.count();
  }

}