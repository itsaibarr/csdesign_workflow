import { test, expect } from '@playwright/test';

test.describe('Admin Panel Access', () => {
    // Note: These tests assume a seeded environment or mock auth. 
    // Since we use Better Auth, full E2E requires a valid session cookie.
    // For this check, we verify that unauthenticated users are redirected.

    test('Guest should be redirected to login', async ({ page }) => {
        await page.goto('/dashboard/admin');
        await expect(page).toHaveURL(/\/login/);
    });

    test('Guest should be redirected to login from sub-routes', async ({ page }) => {
        await page.goto('/dashboard/admin/users');
        await expect(page).toHaveURL(/\/login/);
    });
});
