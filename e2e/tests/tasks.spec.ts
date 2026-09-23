import { test, expect } from '@playwright/test';
import { registerAndLogin, createTask } from './helpers';

// Each test registers its own fresh user (see helpers.ts) and therefore
// starts with an empty task list, so — within a single test — exactly one
// "Task options" button and one status <select> ever exist on the page.
// That's what lets the selectors below stay unscoped instead of needing a
// per-card test id.
test.beforeEach(async ({ page }) => {
  await registerAndLogin(page);
});

test('creates a task and sees it on the dashboard', async ({ page }) => {
  await createTask(page, 'Write E2E tests');

  await expect(page.getByText('Write E2E tests')).toBeVisible();
  // The form closes itself (TaskForm's onSuccess calls onClose) rather
  // than staying open after a successful create.
  await expect(page.locator('input[name="title"]')).toHaveCount(0);
});

test('edits a task’s title', async ({ page }) => {
  await createTask(page, 'Original title');

  await page.getByRole('button', { name: 'Task options' }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.locator('input[name="title"]').fill('Updated title');
  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByText('Updated title')).toBeVisible();
  await expect(page.getByText('Original title')).not.toBeVisible();
});

test('changes a task’s status via the card’s status select', async ({ page }) => {
  await createTask(page, 'Ship the feature');

  const statusSelect = page.locator('select');
  await expect(statusSelect).toHaveValue('todo');

  await statusSelect.selectOption('done');
  await expect(statusSelect).toHaveValue('done');

  // Confirms the change round-tripped through the API and back, not just
  // the optimistic-looking <select> value.
  await page.reload();
  await expect(page.locator('select')).toHaveValue('done');
});

test('deletes a task', async ({ page }) => {
  await createTask(page, 'Task to delete');

  await page.getByRole('button', { name: 'Task options' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText('Task to delete')).not.toBeVisible();
  await expect(page.getByText('No tasks yet. Create your first one!')).toBeVisible();
});
