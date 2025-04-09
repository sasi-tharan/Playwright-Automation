
import { LoginPage } from './LoginPage';
import { Page } from '@playwright/test';

export class POManager {
    
    loginPage: LoginPage;
    page: Page;


    constructor(page: Page) {
        this.page = page;
        this.loginPage = new LoginPage(this.page);

    }

    getLoginPage() {
        return this.loginPage;
    }

 
}
