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

  test('Scheduler page loads with Architecture heading', async ({ page }) => {
    await page.goto('/scheduler');
    await expect(page.getByRole('heading', { name: /Scheduler/i })).toBeVisible({ timeout: 10000 });
  });

  test('Create a new RE.minder via 2-step flow', async ({ page }) => {
    await page.goto('/scheduler');
    await page.waitForLoadState('networkidle');

    // Click the "Add" button to start creation for General Reminders
    const addBtn = page.getByRole('button', { name: /Add/i });
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();

    // Step 1: Enter objective
    await expect(page.getByRole('heading', { name: /New RE\.minder/i })).toBeVisible();
    const objectiveInput = page.getByPlaceholder('Enter objective...');
    await objectiveInput.fill('E2E Test Reminder');

    // Categorization
    await page.getByText(/Build It/i).click();

    // Click Next to go to step 2
    const nextBtn = page.getByRole('button', { name: /Next/i });
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // Step 2: Set time
    await expect(page.getByText(/Snooze Settings/i)).toBeVisible();

    // The Date and Time inputs have defaults, so we can just proceed to schedule without interacting


    // Click Schedule to create
    const scheduleBtn = page.getByRole('button', { name: 'Schedule', exact: true });
    await scheduleBtn.click();

    // Should see success toast and return to list
    await expect(page.getByText(/RE\.minder scheduled/i)).toBeVisible({ timeout: 5000 });

    // Verify the new reminder appears in the list
    await expect(page.getByText('E2E Test Reminder')).toBeVisible({ timeout: 5000 });
  });

  test('Create a Goal Architecture roadmap', async ({ page }) => {
    await page.goto('/scheduler');
    await page.waitForLoadState('networkidle');

    // Click "New Build" to initialize Goal Roadmap
    let newBuildBtn = page.getByRole('button', { name: /Start a Build/i }).first();
    const isVisible = await newBuildBtn.isVisible();
    if (!isVisible) {
      newBuildBtn = page.getByRole('button', { name: /New Build/i }).first();
    }
    
    await newBuildBtn.click();

    // Step: Select category
    await expect(page.getByText(/building/i)).toBeVisible();
    await page.getByText('Rebuild my relationship with my body').click();

    // Wait for the goal structure to build
    await expect(page.getByText('Goal Architecture Initiated')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Rebuild my relationship with my body').first()).toBeVisible();

    // Verify timeframes generated
    await expect(page.getByText('Tomorrow', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('This Week').first()).toBeVisible();
    await expect(page.getByText('This Month').first()).toBeVisible();
    await expect(page.getByText('3 Months').first()).toBeVisible();
    await expect(page.getByText('6 Months').first()).toBeVisible();
    await expect(page.getByText('9 Months').first()).toBeVisible();
  });
});
