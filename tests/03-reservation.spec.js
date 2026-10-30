
const { test, expect } = require('@playwright/test');

test('invalid email displays an error and does not POST a reservation', async ({ page }) => {
  let postCalled = false;

  await page.route('**/api/reservations', async route => {
    postCalled = true;
    await route.continue();
  });

  await page.goto('/');

  // Select a station to open the reservation form.
  await page.getByRole('button', { name: 'Reserve at Central' }).click();

  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Confirm reservation' }).click();

  await expect(page.getByText(/valid email|invalid email/i)).toBeVisible();
  expect(postCalled).toBe(false);
});

test('successful reservation sends the correct payload and displays confirmation ID', async ({ page }) => {
  let requestBody;

  await page.route('**/api/reservations', async route => {
    requestBody = route.request().postDataJSON();

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        reservationId: 'CB-DEMO-777'
      })
    });
  });

  await page.goto('/');

  await page.getByRole('button', { name: 'Reserve at Central' }).click();

  await page.getByLabel('Email').fill('student@example.com');
  await page.getByRole('button', { name: 'Confirm reservation' }).click();

  await expect.poll(() => requestBody).toEqual({
    stationId: 'central',
    email: 'student@example.com'
  });

  await expect(page.getByText(/CB-DEMO-777/)).toBeVisible();
});
