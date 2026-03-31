import { test, expect } from '@playwright/test';
import { generateTestEmail, deleteTestUser, createTestUser } from './utils/test-auth';

test.describe('8-Step Onboarding Flow', () => {
  let testEmail: string;
  const testPassword = 'TestPassword123!';

  test.beforeAll(async () => {
    testEmail = generateTestEmail('onboarding');
    await createTestUser(testEmail, testPassword, 'E2E Onboarding User');
  });

  test.afterAll(async () => {
    // Teardown: Remove the test user from local Supabase instance
    await deleteTestUser(testEmail);
  });

  test('should register a new user and complete onboarding', async ({ page }) => {
    // Listen for console logs and 400 network responses
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error));
    page.on('response', async response => {
      if (response.status() === 400) {
        console.error(`400 RESPONSE from ${response.url()}:`);
        try {
          const body = await response.text();
          console.error(body);
        } catch (e) {
          console.error('Could not read response body');
        }
      }
    });

    // 1. Navigate to auth screen
    await page.goto('/auth');

    // 2. Log in with the pre-created account
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.getByRole('button', { name: /Sign In/i }).click();

    // 3. Verify redirection to onboarding flow
    // Next.js/React Router should naturally redirect based on profile data missing
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 15000 });

    // --- Onboarding Flow Execution ---

    // Step 1: Welcome
    await expect(page.getByText('Welcome to')).toBeVisible();
    await page.getByRole('button', { name: /Begin Architecture/i }).click();

    // Step 2: Life Audit
    await expect(page.getByText('Your Baseline')).toBeVisible();
    
    // We must interact with the form to set the scores so 'Next' enables.
    const sliders = page.locator('[role="slider"]');
    await expect(sliders).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await sliders.nth(i).focus();
      await page.keyboard.press('ArrowRight'); // Increments to 6, guaranteeing state registration
    }
    
    await expect(page.getByRole('button', { name: /Next/i })).toBeEnabled();
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 3: Zodiac Sign
    await expect(page.getByText('Your Zodiac')).toBeVisible();
    // Select "Aries"
    await page.getByRole('button', { name: 'Aries' }).click();
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 4: Goal Selection
    await expect(page.getByText('Select Your Goal')).toBeVisible();
    await page.getByRole('button', { name: /Body Transformation/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 5: Passion Pick
    await expect(page.getByText('Your Passion Pick')).toBeVisible();
    // Verify we have a "Skip for now" option
    await expect(page.getByRole('button', { name: /Skip for now/i })).toBeVisible();
    await page.getByRole('button', { name: /Skip for now/i }).click();

    // Step 6: Reminders
    await expect(page.getByText('Set Your Rituals')).toBeVisible();
    // Proceed to enter dashboard
    await page.getByRole('button', { name: /Enter Dashboard/i }).click();

    // 8. Verify arrival at Dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Expect the "You're all set." welcome overlay briefly, or Dashboard greetings
    await expect(page.getByRole('heading', { level: 1 }).filter({ hasText: /(Wake Up|Good Morning|Good Afternoon|Good Evening)/i })).toBeVisible({ timeout: 10000 });
  });
});
