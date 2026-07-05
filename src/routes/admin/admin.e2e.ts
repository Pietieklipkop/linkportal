import { test, expect } from '@playwright/test';

test.describe('LinkPortal Admin Flow', () => {
	test('allows login, dashboard views, and link generation', async ({ page }) => {
		// 1. Visit Login and login using auto-seeded credentials
		await page.goto('/login');
		await page.fill('input[name="email"]', 'admin@linkportal.com');
		await page.fill('input[name="password"]', 'password123');
		await page.click('button[type="submit"]');

		// 2. We should be redirected to admin dashboard
		await expect(page).toHaveURL(/\/admin/);
		await expect(page.locator('h1.page-title')).toContainText('Admin Dashboard');

		// Check telemetry cards
		await expect(page.locator('text=Active Links')).toBeVisible();
		await expect(page.locator('text=Total Submissions')).toBeVisible();

		// 3. Navigate to Form Links Management page
		await page.goto('/admin/links');
		await expect(page.locator('h1.page-title')).toContainText('Form Links Management');

		// 4. Create a new link
		const randomId = Math.random().toString(36).substring(2, 8);
		const formName = `E2E Test Form ${randomId}`;

		await page.click('button:has-text("Generate Link")');
		await page.fill('input[name="name"]', formName);
		await page.fill('input[name="company"]', 'Clear Metrics');
		await page.click('button.save-btn');

		// 5. Verify it redirected back to list and lists the new form
		await expect(page.locator('table.forms-table')).toContainText(formName);
		await expect(page.locator('table.forms-table')).toContainText('Clear Metrics');
	});
});
