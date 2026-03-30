import { test, expect } from '@playwright/test';
import { generateTestEmail, deleteTestUser, createTestUser } from './utils/test-auth';

test.describe('Authentication Flows (Live DB)', () => {
  let testEmail: string;
  const testPassword = 'TestPassword123!';

  test.beforeAll(async () => {
    testEmail = generateTestEmail('auth');
    await createTestUser(testEmail, testPassword, 'E2E Auth User');
  });

  test.afterAll(async () => {
    await deleteTestUser(testEmail);
  });

  test('should display the auth heading', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('should show invalid credentials error for wrong password', async ({ page }) => {
    await page.goto('/auth');
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.locator('input[type="password"]').fill('wrongpassword123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid login credentials')).toBeVisible({ timeout: 5000 });
  });

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    await page.goto('/auth');
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
  });

  test('toggle between Sign In and Sign Up modes', async ({ page }) => {
    await page.goto('/auth');
    const toggleBtn = page.getByText('Sign up', { exact: true });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    await expect(page.getByRole('heading', { name: 'Start Building' })).toBeVisible();

    await page.getByText('Sign in', { exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });
});
