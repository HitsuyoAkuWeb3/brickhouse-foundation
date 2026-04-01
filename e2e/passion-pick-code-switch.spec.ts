import { test, expect } from '@playwright/test';
import { generateTestEmail, deleteTestUser, createTestUser } from './utils/test-auth';

test.describe('Passion Pick & Code Switch (Live DB)', () => {
  let testEmail: string;
  const testPassword = 'TestPassword123!';

  test.beforeAll(async () => {
    testEmail = generateTestEmail('passion');
    await createTestUser(testEmail, testPassword, 'E2E Passion User', {
      onboarding_completed: true,
      onboarding_complete: true,
      transformation_choice: 'business',
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

  test('Passion Pick page loads with upload area', async ({ page }) => {
    await page.goto('/passion-pick');

    // Verify the page renders
    await expect(page.getByRole('heading', { name: /Passion Pick/i })).toBeVisible({ timeout: 10000 });

    // The upload file input should be present
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('Passion Pick page has media upload controls', async ({ page }) => {
    await page.goto('/passion-pick');
    await page.waitForLoadState('networkidle');

    // Verify heading
    await expect(page.getByRole('heading', { name: /Passion Pick/i })).toBeVisible({ timeout: 10000 });

    // Upload area should exist with file input
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();

    // The file input should accept both images and video
    const accept = await fileInput.getAttribute('accept');
    expect(accept).toBeTruthy();
  });

  test('Passion Pick page successfully uploads and displays an image', async ({ page }) => {
    test.setTimeout(30000); // Give upload time if needed
    await page.goto('/passion-pick');
    await page.waitForLoadState('networkidle');

    // the file input is visually hidden but we can interact with it
    const fileInput = page.locator('input[type="file"]');
    
    // We can upload a local asset that is part of the repo
    await fileInput.setInputFiles('src/assets/brickhouse-logo.png');

    // Need to wait for the image tag to become visible
    // The image has alt="Passion pick"
    const displayImage = page.locator('img[alt="Passion pick"]');
    await expect(displayImage).toBeVisible({ timeout: 15000 });
    
    // Check that src is a valid url (will depend on storage bucket config)
    const src = await displayImage.getAttribute('src');
    expect(src).toContain('passion-picks');
  });
});
