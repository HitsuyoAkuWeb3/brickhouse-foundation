import { test, expect } from '@playwright/test';

test.describe('Dashboard and Profile Checks', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user being logged in
    await page.route('**/auth/v1/user', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ id: 'test', aud: 'authenticated' }) });
    });

    await page.route('**/rest/v1/profiles*', async (route) => {
      await route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ 
          id: 'test', 
          full_name: 'Test Setup', 
          transformation_choice: 'career', 
          goals: ['Growth'] 
        }) 
      });
    });

    await page.route('**/rest/v1/daily_rituals*', async (route) => {
      await route.fulfill({ 
        status: 200, 
        body: JSON.stringify([
          { date: '2026-03-29', ritual_data: { gratitude_note: 'Testing out the history feature' } }
        ]) 
      });
    });

    // We can also mock the 'passion_picks' to ensure it doesn't break
    await page.route('**/rest/v1/passion_picks*', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify([]) });
    });

    await page.addInitScript(() => {
      const originalGetItem = window.localStorage.getItem;
      window.localStorage.getItem = function(key) {
        if (key && key.includes('auth-token')) {
          return JSON.stringify({
            access_token: 'test-access',
            refresh_token: 'test-refresh',
            user: { id: 'test', aud: 'authenticated', role: 'authenticated' },
            expires_at: Math.floor(Date.now() / 1000) + 3600
          });
        }
        return originalGetItem.call(this, key);
      };
    });

    await page.goto('http://localhost:8080/dashboard');
  });

  test('Dashboard loads toolbox cards correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Good (Morning|Afternoon|Evening), Test/i })).toBeVisible();

    // Verify Toolbox items exist
    await expect(page.getByText('My Bricks').first()).toBeVisible();
    await expect(page.getByText('Daily Ritual').first()).toBeVisible();
    await expect(page.getByText('Affirmations').first()).toBeVisible();
    await expect(page.getByText('Scheduler').first()).toBeVisible();
    await expect(page.getByText('Goddess Rx').first()).toBeVisible();
    
    // Passion Pick should be visible
    await expect(page.getByText('Passion Pick').first()).toBeVisible();
  });

  test('Navigate to profile and view Gratitude History', async ({ page }) => {
    // Click on Profile button in BottomNav
    await page.getByRole('button', { name: /Profile/i }).click();

    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();

    // Verify Gratitude History rendering
    await expect(page.getByRole('heading', { name: 'Gratitude History' })).toBeVisible();
    
    // Check if the mocked note appears
    await expect(page.getByText('Testing out the history feature')).toBeVisible();
  });

  test('Sign Out functionality triggers redirect', async ({ page }) => {
    await page.getByRole('button', { name: /Profile/i }).click();

    // Mock logout RPC or token endpoint
    await page.route('**/auth/v1/logout', async (route) => {
      await route.fulfill({ status: 200, body: '' });
    });

    const signOutBtn = page.getByRole('button', { name: /Sign Out/i });
    await expect(signOutBtn).toBeVisible();
    
    // Ensure we capture redirect out to /auth
    await signOutBtn.click();
    
    // Because we just simulated clicks, let's manually verify auth heading
    await expect(page.getByRole('heading', { name: "Welcome Back" })).toBeVisible({ timeout: 5000 });
  });
});
