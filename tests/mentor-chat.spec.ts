import { test, expect } from '@playwright/test';

test.describe('Mentor AI Assistant', () => {
    test('should Chat with Mentor', async ({ page }) => {
        // Go to login page (assuming root or /login)
        await page.goto('http://localhost:3000');

        // Login
        // We might need to find the login inputs
        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');

        if (await emailInput.isVisible()) {
            await emailInput.fill('student@csc.com');
            await passwordInput.fill('password123');
            await page.click('button[type="submit"]');
        }

        // Wait for dashboard or just navigate to mentor
        await page.goto('http://localhost:3000/dashboard/mentor');

        // Verify page content
        await expect(page.locator('h1')).toContainText('AI Mentor');

        // Type message
        const chatInput = page.locator('textarea[placeholder*="Ask me anything"]');
        await chatInput.fill('Hello Mentor, what is my current stage?');
        await page.keyboard.press('Enter');

        // Wait for response
        const messages = page.locator('.flex.gap-3'); // Adjust selector based on UI
        // We expect at least 2 messages now (user + assistant)
        await expect(messages.nth(1)).toBeVisible({ timeout: 15000 });

        // Confirm it's not an error message
        const responseContent = await messages.nth(1).textContent();
        expect(responseContent).not.toContain('Internal Error');
        expect(responseContent).not.toContain('Failed to fetch');
    });
});
