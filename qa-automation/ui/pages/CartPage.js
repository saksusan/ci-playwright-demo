export class CartPage {

  constructor(page) {
    this.page = page;

    this.cartButton = page.getByRole('button', { name: '🛒' });
    this.cartDrawer = page.locator('#cartDrawer');
    this.closeCartBtn = page.locator('#cartDrawer').getByRole('button', { name: '✕' });
    this.checkoutButton = page.getByRole('button', { name: '✅ Checkout' });
    this.cartItems = page.locator('#cartList li');
  }

  async addProductToCart(cardId) {
    await this.page
      .locator(`#card-${cardId}`)
      .getByRole('button', { name: '+ Cart' })
      .click();
  }

  async openCart() {
    await this.cartButton.click();
    await this.cartDrawer.waitFor({ state: 'visible' });
  }

  async closeCart() {
    await this.closeCartBtn.click();
    await this.cartDrawer.waitFor({ state: 'hidden' });
  }

  async checkout() {
    await this.checkoutButton.click();
  }

  async removeFirstItem() {
    await this.cartItems.first()
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async getCartItemCount() {
    return await this.cartItems.count();
  }

}