
const { test, expect } = require('@playwright/test');

// MISSION 2 — BUG-101
// Available-only filter must hide stations with zero bikes.

test('BUG-101: available-only filter excludes zero-bike stations', async ({ page }) => {
  await page.goto('/');

  // First verify that all four stations are displayed.
  await expect(page.getByTestId('station-card')).toHaveCount(4);

  // Enable the available bikes only checkbox.
  await page.getByRole('checkbox', {
    name: 'Available bikes only'
  }).check();

  // Verify exactly three station cards remain.
  await expect(page.getByTestId('station-card')).toHaveCount(3);

  // Verify Riverside Park is absent.
  await expect(
    page.getByText('Riverside Park')
  ).toHaveCount(0);
});
