import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {
  page: Page;
  emailInput: Locator;
  passwordInput: Locator;
  signInButton: Locator;
  errorMessage: Locator;
  logoutButton: Locator; // 👈 Add this line

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.signInButton = page.locator('#submit');
    this.errorMessage = page.locator('.error-message');
    this.logoutButton = page.locator('#logout'); // 👈 Initialize the logout button locator
  }

  async goTo() {
    await this.page.goto('https://thinking-tester-contact-list.herokuapp.com/');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async validLogin(email: string, password: string) {
    await this.login(email, password);
    // Wait for successful navigation to the contactList page using the full URL
    await this.page.waitForURL('https://thinking-tester-contact-list.herokuapp.com/contactList');
  }
  
  

  async logout() {
    await this.logoutButton.click(); // Use the locator here
    await expect(this.page).toHaveURL('https://thinking-tester-contact-list.herokuapp.com/');
  }

  async verifyLoginPage() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }

  async getErrorMessage(): Promise<string | null> {
    return this.errorMessage.textContent();
  }

  async verifyPresenceErrorMessages() {
    await expect(this.errorMessage).toBeVisible();
  }
}
