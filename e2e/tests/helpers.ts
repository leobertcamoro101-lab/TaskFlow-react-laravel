import { expect, type Page } from '@playwright/test';

// Not a memorable/tutorial-style string on purpose. RegisterRequest's
// Password::uncompromised() rule hits the *real* Have I Been Pwned API here
// (unlike the PHPUnit suite, which fakes that HTTP call) — a "looks strong"
// password like 'Str0ng!Passw0rd' is exactly the kind of string that's
// already in HIBP's breach corpus and gets a real 422 back, which is
// indistinguishable from a UI bug until you check the network tab. A
// random, high-entropy string is vanishingly unlikely to be breached.
export const TEST_PASSWORD = '!2%h@7kpIb55oF1Aj6';

// Every worker/test shares one backend and one database (migrated fresh
// once per run, not per test), so anything that has to be unique — email,
// most of all — needs a per-call suffix to avoid colliding with another
// test running in parallel.
export function uniqueEmail(prefix = 'e2e'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@example.com`;
}

// FormField (src/components/FormField.tsx) renders a plain <label> with no
// htmlFor/id, so getByLabel() can't find these inputs — but the label is
// always the input's/select's immediate DOM sibling, which this targets
// directly instead of guessing field order.
function fieldInput(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator('xpath=following-sibling::input');
}

function fieldSelect(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator('xpath=following-sibling::select');
}

/** Registers a brand-new user through the real UI and lands on the dashboard. */
export async function registerAndLogin(page: Page, email = uniqueEmail()): Promise<string> {
  await page.goto('/register');
  // exact: true matters here — getByPlaceholder does a case-insensitive
  // *substring* match by default, and 'John' is a substring of the email
  // field's own placeholder, 'john@example.com'. Without it, this resolves
  // to two elements and fill() throws a strict-mode violation.
  await page.getByPlaceholder('John', { exact: true }).fill('Ada');
  await page.getByPlaceholder('Doe', { exact: true }).fill('Lovelace');
  await fieldInput(page, 'Birthday').fill('1995-06-15');
  await fieldSelect(page, 'Gender').selectOption('female');
  await page.getByPlaceholder('john@example.com', { exact: true }).fill(email);
  await page.getByPlaceholder('••••••••', { exact: true }).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText(/Good day,/)).toBeVisible();
  return email;
}

/** Asserts the SPA's current client-side route, independent of toHaveURL's baseURL quirks. */
export async function expectPath(page: Page, path: string) {
  await expect.poll(() => new URL(page.url()).pathname).toBe(path);
}

/** Opens the "New Task" form, fills only the title, submits, and waits for it to appear. */
export async function createTask(page: Page, title: string) {
  await page.getByRole('button', { name: /New Task/ }).click();
  await page.locator('input[name="title"]').fill(title);
  await page.getByRole('button', { name: 'Create Task', exact: true }).click();
  await expect(page.getByText(title)).toBeVisible();
}
