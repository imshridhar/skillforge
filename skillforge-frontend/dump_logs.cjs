const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/login');

    // Login
    await page.fill('input[type="email"]', 'learner@skillforge.com');
    await page.fill('input[type="password"]', 'learner123');
    await page.click('button[type="submit"]');

    console.log('Waiting for successful login / navigation...');
    await page.waitForTimeout(3000);

    console.log('Current URL:', page.url());

    await browser.close();
})();
