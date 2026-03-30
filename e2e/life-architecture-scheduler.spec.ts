import { test, expect } from '@playwright/test';
import { generateTestEmail, deleteTestUser, createTestUser } from './utils/test-auth';

test.describe('Scheduler / Life Architecture (Live DB)', () => {
  let testEmail: string;
  const testPassword = 'TestPassword123!';

  test.beforeAll(async () => {
    testEmail = generateTestEmail('sched');
    await createTestUser(testEmail, testPassword, 'E2E Scheduler User', {
      onboarding_completed: true,
      onboarding_complete: true,
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

    if (page.url().includes('onboarding')) {
      await page.goto('/dashboard');
    }
  });

  test('Scheduler page loads with RE.minders heading', async ({ page }) => {
    await page.goto('/scheduler');
    await expect(page.getByRole('heading', { name: /RE\.minders/i })).toBeVisible({ timeout: 10000 });
  });

  test('Create a new RE.minder via 2-step flow', async ({ page }) => {
    await page.goto('/scheduler');
    await page.waitForLoadState('networkidle');

    // Click the + button to start creation
    const addBtn = page.locator('button').filter({ has: page.locator('svg.lucide-plus') });
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();

    // Step 1: Enter title
    await expect(page.getByRole('heading', { name: /New RE\.minder/i })).toBeVisible();
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill('E2E Test Reminder');

    // Click Next to go to step 2
    const nextBtn = page.getByRole('button', { name: 'Next' });
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // Step 2: Set time (default is 5 min)
    await expect(page.getByText(/RE\.mind me in/i)).toBeVisible();

    // Select 15 min quick picker
    await page.getByRole('button', { name: '15' }).click();

    // Click Done to create
    const doneBtn = page.getByRole('button', { name: 'Done' });
    await doneBtn.click();

    // Should see success toast and return to list
    await expect(page.getByText('RE.minder created!')).toBeVisible({ timeout: 5000 });

    // Verify the new reminder appears in the list
    await expect(page.getByText('E2E Test Reminder')).toBeVisible({ timeout: 5000 });
  });
});
