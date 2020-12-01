import Playwright, { Page, Cookie } from 'playwright';

class Solver {
    private page?: Page;

    async open() {
        const browser = await Playwright.firefox.launch({ headless: false });
        const browserContext = await browser.newContext({
            viewport: {
                height: 600,
                width: 440
            }
        });
        browserContext.route('**', route => {
            const request = route.request();
            const url = request.url();
            const type = request.resourceType();
    
            if (type == 'document' ||
                url.startsWith('https://www.gstatic.com') ||
                url.startsWith('https://www.google.com')
            ) route.continue();
            else route.abort();
        });
        this.page = await browserContext.newPage();
    }

    async setCookies(cookies: Cookie[]) {
        if (!this.page) return; 
        await this.page.context().clearCookies();
        await this.page.context().addCookies(cookies);
    }

    async showRecaptcha(url: string, siteKey: string) {
        if (!this.page) return;
        await this.page.evaluate((url) => window.location.href = url, url);
        await this.page.setContent(`<html>
            <head>
                <script src="https://www.google.com/recaptcha/api.js" async defer></script>
            </head>
            <body>
                <div class="g-recaptcha" data-sitekey="${siteKey}"></div>
            </body>
        </html>`);
    }

    async close() {
        if (!this.page) return;
        const browser = this.page.context().browser();
        if (browser) await browser.close();
    }
}
module.exports = Solver;