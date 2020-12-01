import Playwright, { Response } from 'playwright';

class Service {
    async login(url: string, siteKey: string) {
        const browser = await Playwright.firefox.launch({ headless: false });
        const browserContext = await browser.newContext({
            viewport: {
                height: 600,
                width: 440
            }
        });
        const page = await browserContext.newPage();
        await page.goto('https://accounts.google.com/');
        await page.waitForResponse((response: Response) => response.url() === 'https://myaccount.google.com/?pli=1', { timeout: 0 });
        let cookies = await browserContext.cookies();
        cookies = cookies.filter((cookie) => cookie.domain.endsWith('google.com') || cookie.domain.endsWith('youtube.com'));
        await browser.close();
        return cookies;
    }
}
module.exports = Service;