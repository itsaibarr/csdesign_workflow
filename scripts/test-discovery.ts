import { chromium } from 'playwright';

async function main() {
    console.log('Starting Playwright Test...');
    const browser = await chromium.launch({ headless: true }); // headless: false to see
    const page = await browser.newPage();

    try {
        await page.goto('https://www.producthunt.com/topics/artificial-intelligence', { waitUntil: 'domcontentloaded' });
        console.log('Navigated to PH AI Topic');

        const items = await page.locator('[data-test^="post-item"]').all();
        console.log(`Found ${items.length} items`);

        for (const item of items.slice(0, 3)) {
            const name = await item.locator('h3').first().innerText();
            const tagline = await item.locator('a[class*="styles_tagline"]').first().innerText();
            console.log(`Tool: ${name} - ${tagline}`);
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
}

main();
