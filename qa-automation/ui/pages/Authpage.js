export class AuthPage {

  constructor(page) {
    this.page = page;

    this.authNavBtn = page.locator('#authNavBtn');
    this.tabRegister = page.locator('#tabRegister');
    this.tabLogin = page.locator('#tabLogin');

    this.regUsername = page.locator('#regUsername');
    this.regEmail = page.locator('#regEmail');
    this.regPassword = page.locator('#regPassword');
    this.registerBtn = page.locator('#registerBtn');

    this.loginEmail = page.locator('#loginEmail');
    this.loginPassword = page.locator('#loginPassword');
    this.loginBtn = page.locator('#loginBtn');
  }

  async openAuth() {
    await this.authNavBtn.click();
  }

  async openRegister() {
    await this.tabRegister.click();
  }

  async openLogin() {
    await this.tabLogin.click();
  }

  async register(username, email, password) {
    await this.regUsername.fill(username);
    await this.regEmail.fill(email);
    await this.regPassword.fill(password);
    await this.registerBtn.click();
  }

  async login(email, password) {
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginBtn.click();
  }

}