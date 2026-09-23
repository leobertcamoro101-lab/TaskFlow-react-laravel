import { test, expect } from '@playwright/test';
import { registerAndLogin, expectPath, uniqueEmail, TEST_PASSWORD } from './helpers';

test('redirects an unauthenticated visitor from / to /login', async ({ page }) => {
  await page.goto('/');
  await expectPath(page, '/login');
});

test('registers a new user, logs out, and logs back in with the same credentials', async ({ page }) => {
  const email = uniqueEmail();
  await registerAndLogin(page, email);
  await expectPath(page, '/');

  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await expectPath(page, '/login');

  // The dashboard and its data should be gone from the client too, not
  // just the route — hitting a protected page post-logout should bounce
  // straight back to /login rather than flashing stale content.
  await page.goto('/');
  await expectPath(page, '/login');

  await page.getByPlaceholder('your@email.com', { exact: true }).fill(email);
  await page.getByPlaceholder('••••••••', { exact: true }).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  await expectPath(page, '/');
  await expect(page.getByText(/Good day,/)).toBeVisible();
});

test('shows an error and stays on /login for wrong credentials', async ({ page }) => {
  const email = uniqueEmail();
  await registerAndLogin(page, email);
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await expectPath(page, '/login');

  await page.getByPlaceholder('your@email.com', { exact: true }).fill(email);
  await page.getByPlaceholder('••••••••', { exact: true }).fill('DefinitelyWrong1!');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  // AuthController::login() throws ValidationException::withMessages(['email'
  // => ['The provided credentials are incorrect.']]) on bad credentials, and
  // LoginPage surfaces that field-level message (confirmed against the real
  // running app) — not Laravel's generic top-level "The given data was
  // invalid." envelope message, which an earlier version of this test
  // wrongly assumed without checking what actually renders.
  await expect(page.getByText('The provided credentials are incorrect.')).toBeVisible();
  await expectPath(page, '/login');
});
