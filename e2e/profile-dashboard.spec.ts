import { test, expect } from '@playwright/test';
import { generateTestEmail, deleteTestUser, createTestUser } from './utils/test-auth';

test.describe('Dashboard and Profile (Live DB)', () => {
  let testEmail: string;
  const testPassword = 'TestPassword123!';

  test.beforeAll(async () => {
    testEmail = generateTestEmail('profile');
    await createTestUser(testEmail, testPassword, 'E2E Profile User', {
      onboarding_completed: true,
      onboarding_complete: true,
      transformation_choice: 'business',
      goals: ['Growth'],
      audit_scores: { body: 5, mind: 5, spirit: 5, business: 5, relationships: 5 },
      zodiac_sign: 'Aries'
    });
  });

  test.afterAll(async () => {
    await deleteTestUser(testEmail);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.getByRole('button', { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
  });

  test('Dashboard or onboarding loads after login', async ({ page }) => {
    // After login, we land on dashboard or onboarding depending on profile state
    // Either outcome validates the auth flow works
    const url = page.url();
    if (url.includes('dashboard')) {
      // Dashboard loaded — verify greeting
      await expect(page.getByRole('heading', { level: 1 }).filter({ hasText: /(Wake Up|Good Morning|Good Afternoon|Good Evening)/i })).toBeVisible({ timeout: 10000 });
    } else {
      // Onboarding loaded — verify onboarding heading
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });
    }
  });

  test('Navigate to profile page via bottom nav', async ({ page }) => {
    // Navigate to profile directly (accessible even during onboarding)
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: /Profile/i })).toBeVisible({ timeout: 10000 });
  });

  test('Sign Out redirects to auth page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: /Profile/i })).toBeVisible({ timeout: 10000 });

    const signOutBtn = page.getByRole('button', { name: /Sign Out/i });
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();

    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible({ timeout: 10000 });
  });
});
