
const { test, expect } = require('@playwright/test');

test('station API outage shows an error and retry restores results', async ({ page }) => {
  let attempts = 0;

  await page.route('**/api/stations', async route => {
    attempts++;

    if (attempts === 1) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service unavailable' })
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('/');

  // First request fails: verify the error message and retry button.
  await expect(page.getByText('Unable to load stations.')).toBeVisible();
  await page.getByRole('button', { name: 'Retry loading' }).click();

  // Retry reaches the real server and restores the station list.
  await expect(page.getByTestId('station-card')).toHaveCount(4);

  // The error notification should be dismissed after recovery.
  await expect(page.getByText('Unable to load stations.')).toBeHidden();

  expect(attempts).toBe(2);
});
