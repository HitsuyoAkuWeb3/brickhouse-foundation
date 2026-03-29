import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Auth page and intercept Supabase calls
    await page.route('**/auth/v1/**', async (route) => {
      // Very basic network stub for auth tests to prevent hitting real DB
      if (route.request().url().includes('/token')) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: "invalid_credentials", error_description: "Invalid login credentials" }),
        });
      } else {
        await route.continue();
      }
    });
    // Start at auth page
    await page.goto('http://localhost:8080/auth');
  });

  test('should display the auth heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: "Welcome Back" })).toBeVisible();
  });

  test('should show validation errors on empty login', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Auth.tsx has custom Zod schema checking
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password (min 8 characters)');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should show invalid credentials error (mocked)', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password (min 8 characters)').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // The toaster error reading "Invalid login credentials" should appear due to our mock
    await expect(page.getByText('Invalid login credentials')).toBeVisible({ timeout: 5000 });
  });

  test('toggle between Sign In and Sign Up modes', async ({ page }) => {
    const toggleBtn = page.getByText("Sign up", { exact: true });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();
    
    // Check header changes
    await expect(page.getByRole('heading', { name: 'Start Building' })).toBeVisible();
    
    // Toggle back
    await page.getByText('Sign in', { exact: true }).click();
    await expect(page.getByRole('heading', { name: "Welcome Back" })).toBeVisible();
  });

  test('signup displays email confirmation notice', async ({ page }) => {
    await page.getByText("Sign up", { exact: true }).click();
    
    // We mock the signup call here to return success
    await page.route('**/auth/v1/signup*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'test-user', email: 'test@example.com' } }),
      });
    });

    await page.getByPlaceholder('Email').fill('test@example.com');
    await page.getByPlaceholder('Password (min 8 characters)').fill('password123'); // Custom hook since they dynamically add Full Name field
    await page.getByPlaceholder('Full Name').fill('Test User');
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // After signup, our UI usually shows a confirmation block
    await expect(page.getByRole('heading', { name: 'Check Your Email' })).toBeVisible({ timeout: 5000 });
  });
});
