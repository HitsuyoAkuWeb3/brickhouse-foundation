import { test, expect } from '@playwright/test';

test.describe('Affirmations View and Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Mock user being logged in
    await page.route('**/auth/v1/user', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify({ id: 'test', aud: 'authenticated' }) });
    });
    
    // Mock the affirmations fetching
    await page.route('**/rest/v1/user_affirmations*', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify([]) }); // Empty personal affirmations
    });

    await page.route('**/rest/v1/affirmations*', async (route) => {
      await route.fulfill({ 
        status: 200, 
        body: JSON.stringify([
          { id: '1', text: 'I am the architect of my life', brick_id: 1 }
        ]) 
      });
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

    await page.goto('http://localhost:8080/affirmations');
  });

  test('Page header and content load', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Affirmations/i })).toBeVisible();
    await expect(page.getByText('Speak your truth into existence')).toBeVisible();
  });

  test('Adding custom affirmation handles validation', async ({ page }) => {
    // Open I AM Builder
    await page.getByRole('button', { name: /I AM Builder/i }).click();

    const addBtn = page.getByRole('button', { name: 'Add Affirmation' });
    const input = page.getByPlaceholder('I am...');

    // Test blank submission
    await expect(addBtn).toBeDisabled();

    // Test missing prefix
    await input.fill('This is a test');
    await expect(addBtn).toBeEnabled();
    
    // Setup error toast mock or just watch for text
    await addBtn.click();
    await expect(page.getByText("Start your affirmation with 'I am' or 'I'")).toBeVisible();

    // Add valid affirmation
    await input.fill('I am powerful and capable');
    
    // Mock the POST for inserting custom affirmation
    await page.route('**/rest/v1/user_affirmations*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 201, body: JSON.stringify({ id: '2', affirmation: 'I am powerful and capable' }) });
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
      }
    });

    await addBtn.click();
    await expect(page.getByText('Affirmation added 💎')).toBeVisible();
  });

  test('Expand preset bricks and schedule an affirmation', async ({ page }) => {
    // Expand Brick 1
    const brickButton = page.getByRole('button').filter({ hasText: 'Self-Love' }); 
    if (await brickButton.isVisible()) {
      await brickButton.click();
      
      // Look for the mock affirmation text
      await expect(page.getByText('"I am the architect of my life"', { exact: true })).toBeVisible();
      
      // Click schedule
      await page.locator('button[title="Schedule this affirmation"]').click();
      
      // Select a time and submit
      const timeInput = page.locator('input[type="time"]');
      await expect(timeInput).toBeVisible();
      await timeInput.fill('08:00');
      
      // Mock schedule task creation
      await page.route('**/rest/v1/scheduler_tasks*', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({ status: 201, body: JSON.stringify({}) });
        }
      });

      await page.getByRole('button', { name: 'Schedule' }).click();
      await expect(page.getByText(/Affirmation scheduled for 08:00/)).toBeVisible();
    }
  });
});
