import { test, expect } from '@playwright/test';
import { POManager } from '../../pageobjects/POManager';
import UserLoginData from '../../utils/UserLoginData.json';
import errorMessages from '../../testData/loginErrors.json';

const invalidLoginScenarios = errorMessages;

let poManager: POManager;
let loginPage: any;

test.describe("Login Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    poManager = new POManager(page);
    loginPage = poManager.getLoginPage();
    await loginPage.goTo();
  });

  test('Successful login with valid standard user', async () => {
    await loginPage.validLogin(
      UserLoginData.standard_user.email,
      UserLoginData.standard_user.password
    );
  });

  test('Verify Logout functionality', async () => {
    await loginPage.validLogin(
      UserLoginData.standard_user.email,
      UserLoginData.standard_user.password
    );
    await loginPage.logout();
    await loginPage.verifyLoginPage();
  });

  invalidLoginScenarios.forEach(({ name, email, password, expectedError }) => {
    test(`Verify invalid login - ${name}`, async () => {
      await loginPage.login(email, password);
      await loginPage.verifyPresenceErrorMessages();
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toContain(expectedError);
    });
  });
});
