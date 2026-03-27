export class CategoriesPage {

  constructor(page) {
    this.page = page;
    this.categoryChips = page.locator('#categoryChips');
  }

  async selectAll() {
    await this.categoryChips.getByText('All').click();
  }

  async selectCategory(name) {
    await this.categoryChips.getByText(name).click();
  }

}