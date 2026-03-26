export class OrdersPage {

  constructor(page) {
    this.page = page;
    this.myOrdersLink = page.getByRole('link', { name: 'My Orders' });
    this.orderRows = page.locator('#orderList li');
  }

  async viewOrders() {
    await this.myOrdersLink.click();
    // await this.page.waitForURL('**/orders');
  }

  async getOrderCount() {
    return await this.orderRows.count();
  }

}