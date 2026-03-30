import { test, expect } from '@playwright/test';
import { generateTestEmail, deleteTestUser, createTestUser } from './utils/test-auth';

test.describe('Affirmations View and Builder (Live DB)', () => {
  let testEmail: string;
  const testPassword = 'TestPassword123!';

  test.beforeAll(async () => {
    testEmail = generateTestEmail('affirm');
    await createTestUser(testEmail, testPassword, 'E2E Affirm User', {
      onboarding_completed: true,
      onboarding_complete: true,
      transformation_choice: 'wellness',
      audit_scores: { body: 5, mind: 5, spirit: 5, business: 5, relationships: 5 },
      zodiac_sign: 'Aries',
      goals: ['Body Transformation']
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

  test('Affirmations page loads with heading', async ({ page }) => {
    await page.goto('/affirmations');
    await expect(page.getByRole('heading', { name: /Affirmations/i })).toBeVisible({ timeout: 10000 });
  });

  test('I AM Builder expands and accepts affirmations', async ({ page }) => {
    await page.goto('/affirmations');
    await page.waitForLoadState('networkidle');

    // Click the "I AM Builder" accordion to expand it
    const builderToggle = page.getByText('I AM Builder');
    await expect(builderToggle).toBeVisible({ timeout: 10000 });
    await builderToggle.click();

    // Wait for the input to appear (animated collapse/expand)
    const input = page.getByPlaceholder('I am...');
    await expect(input).toBeVisible({ timeout: 5000 });

    // Type a valid affirmation
    await input.fill('I am powerful and capable');

    // The Add button should be enabled
    const addBtn = page.getByRole('button', { name: /Add Affirmation/i });
    await expect(addBtn).toBeEnabled();
    await addBtn.click();

    // Should see success toast
    await expect(page.getByText(/Affirmation added/i)).toBeVisible({ timeout: 5000 });
  });
});
