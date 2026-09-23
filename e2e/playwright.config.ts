import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dedicated ports so this suite never collides with a dev server you
// already have running locally (API defaults to 8000, Vite to 5173).
const FRONTEND_PORT = 5174;
const BACKEND_PORT = 8001;
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;

// A scratch SQLite file, not `:memory:` — Laravel's built-in dev server
// (`php artisan serve`) boots a fresh Application container per request, so
// an in-memory SQLite connection doesn't survive from one request to the
// next. A file-backed database does, and it's wiped and re-migrated by
// scripts/start-api.mjs on every run.
const DB_DATABASE = path.resolve(__dirname, '../taskflow-api/database/e2e.sqlite');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // 1, not more: SQLite allows only ONE writer at a time even in WAL mode,
  // and login especially writes to several tables in one request (sessions,
  // personal_access_tokens, the throttle cache). Serializing entirely trades
  // runtime (~1-2 min instead of under a minute) for consistent green runs,
  // and CI already treats this suite as non-blocking (continue-on-error in
  // tests.yml) so the extra time here isn't gating anything.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'html',

  // Default is 5s. This suite hits a *real* php artisan serve, which
  // re-bootstraps the whole Laravel framework on every single request (no
  // opcache/persistent worker), and registration also makes a real,
  // unmocked network call to the HIBP API as part of RegisterRequest's
  // validation. Register → navigate → fetch tasks → render can genuinely
  // take longer than 5s end to end, independent of any actual bug — this
  // isn't padding around a hang, it's the real cost of not mocking anything.
  expect: {
    timeout: 15_000,
  },

  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Real Google Chrome, not Playwright's bundled Chromium — GitHub's
        // ubuntu-latest runners ship it preinstalled, so this skips the
        // Playwright browser download step in CI entirely. See README.md.
        channel: 'chrome',
      },
    },
  ],

  webServer: [
    {
      name: 'laravel-api',
      // A plain Windows shell has no bash, so a shell script here fails with
      // "execvpe(/bin/bash) failed". Node is guaranteed present (Playwright
      // itself runs on it) and fully cross-platform, so the orchestration
      // lives in scripts/start-api.mjs instead — see README.md.
      command: `node "${path.resolve(__dirname, 'scripts/start-api.mjs')}"`,
      cwd: path.resolve(__dirname, '../taskflow-api'),
      // /up is Laravel's built-in health-check route (bootstrap/app.php's
      // `health: '/up'`) — a plain 200, unlike /api/login which is
      // POST-only and would 405 a readiness GET.
      url: `${BACKEND_URL}/up`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        PORT: String(BACKEND_PORT),
        APP_URL: BACKEND_URL,
        FRONTEND_URL,
        DB_CONNECTION: 'sqlite',
        DB_DATABASE,
        // Laravel's own CORS default only allows :5173 — this suite runs
        // the frontend on :5174 to avoid clashing with a dev server you
        // already have open, so the allowed origin has to move with it.
        CORS_ALLOWED_ORIGINS: FRONTEND_URL,
        // /register, /login etc. are throttled to 6/min per IP in production
        // (AppServiceProvider's 'auth' limiter) to block brute-forcing — every
        // E2E request shares one IP, and tasks.spec.ts's 4 tests each
        // registering a fresh user in beforeEach plus auth.spec.ts's own 2
        // calls adds up to more than 6 requests within a minute. That's
        // ordinary test traffic, not an attack, so it gets real headroom here
        // without touching the production default.
        AUTH_THROTTLE_PER_MINUTE: '100',
      },
    },
    {
      name: 'vite-frontend',
      command: `npm run dev -- --port ${FRONTEND_PORT} --strictPort`,
      cwd: path.resolve(__dirname, '../taskflow'),
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        VITE_API_URL: `${BACKEND_URL}/api`,
      },
    },
  ],
});
