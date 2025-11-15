import { test, expect } from '@playwright/test';

test.describe('Home Page E2E', () => {
  test('should display the title', async ({ page }) => {
    await page.goto('/');

    // タイトルが表示されることを確認
    const title = page.locator('h1');
    await expect(title).toContainText('SNAKE GAME');
  });

  test('should have correct meta information', async ({ page }) => {
    await page.goto('/');

    // メタ情報の確認
    await expect(page).toHaveTitle(/スネークゲーム/);
  });
});
