import { test, expect } from '@playwright/test';
import { generateTestEmail, deleteTestUser, confirmTestUser } from './utils/test-auth';

test.describe('8-Step Onboarding Flow', () => {
  let testEmail: string;
  const testPassword = 'TestPassword123!';

  test.beforeAll(() => {
    testEmail = generateTestEmail('onboarding');
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

    // 2. Switch to Sign Up mode
    await page.getByRole('button', { name: /Sign up/i }).click();
    await expect(page.getByRole('heading', { name: 'Start Building' })).toBeVisible();

    // 3. Fill in the signup details
    await page.getByPlaceholder('Full Name').fill('E2E Onboarding User');
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);

    // Submit
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Expect the "Check Your Email" view
    try {
      await expect(page.getByText('Check Your Email')).toBeVisible({ timeout: 10000 });
    } catch (e) {
      await page.screenshot({ path: 'test-failure.png' });
      const content = await page.content();
      console.log('PAGE CONTENT at failure:', content);
      throw e;
    }

    // 4. Auto-confirm via Supabase Admin API to bypass email checks in E2E
    await confirmTestUser(testEmail);

    // 5. Switch back to Log In mode
    await page.getByRole('button', { name: /Back to sign in/i }).click();
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    // 6. Log in with the confirmed account
    await page.getByPlaceholder('Email').fill(testEmail);
    await page.locator('input[type="password"]').fill(testPassword);
    await page.getByRole('button', { name: /Sign In/i }).click();

    // 7. Verify redirection to onboarding flow
    // Next.js/React Router should naturally redirect based on profile data missing
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 15000 });

    // --- Onboarding Flow Execution ---

    // Step 1: Welcome
    await expect(page.getByText('Welcome to')).toBeVisible();
    await page.getByRole('button', { name: /Begin Architecture/i }).click();

    // Step 2: Life Audit
    await expect(page.getByText('Your Baseline')).toBeVisible();
    // Default sliders to 5, we are okay with the defaults so click Next
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
    await expect(page.locator('text=Good Morning, E2E').or(page.locator('text=Good Afternoon, E2E')).or(page.locator('text=Good Evening, E2E'))).toBeVisible({ timeout: 10000 });
  });
});
