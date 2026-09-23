# TaskFlow E2E tests

Playwright tests that drive the real frontend against the real backend — no
mocked API calls. `playwright.config.ts` starts both servers itself before
the tests run and tears them down after:

- **`laravel-api`** — `scripts/start-api.sh` wipes and re-migrates a scratch
  SQLite file (`taskflow-api/database/e2e.sqlite`), then runs
  `php artisan serve` on **port 8001**.
- **`vite-frontend`** — `npm run dev` on **port 5174**, pointed at that API
  via `VITE_API_URL`.

Both ports are deliberately different from your normal dev setup (API 8000,
Vite 5173) so this suite never collides with, or accidentally runs against,
a server you already have open.

## Running it

```bash
cd e2e
npm install
npm test          # headless run
npm run test:ui   # Playwright's interactive UI mode — good for writing new tests
```

First run needs `taskflow-api`'s Composer dependencies and `taskflow`'s npm
dependencies already installed (`composer install` / `npm install` in those
directories) — this suite runs your existing checkout, it doesn't set those
up for you.

## Why a real SQLite file, not `:memory:`

`php artisan serve` boots a fresh Laravel `Application` per request. An
in-memory SQLite connection is scoped to that one request's process
lifetime, so it doesn't survive to the next request — data written by
"register" would already be gone by the time "login" ran. A file-backed
database is shared across requests the same way a real deployment's
Postgres/MySQL would be, while still needing no separate DB service to
stand up in CI.

## Why `channel: "chrome"`

`playwright.config.ts` runs with the real Google Chrome, not Playwright's
own downloaded Chromium, since GitHub's `ubuntu-latest` runners ship it
preinstalled — this skips the Playwright browser download entirely. If
Chrome isn't installed locally, either install it or drop `channel:
"chrome"` from the config and run `npx playwright install chromium` once
first.

## Why `laravel-api` runs with `PHP_CLI_SERVER_WORKERS=4`

`php artisan serve` handles one request at a time by default. This suite
runs with `fullyParallel: true`, so several tests register and fetch
concurrently — with a single PHP worker those requests just queue up behind
whichever one is slowest, which looks exactly like a hang (the "Good day,"
assertion timing out even at 15s, when nothing is actually broken). Setting
`PHP_CLI_SERVER_WORKERS` (in `scripts/start-api.mjs`) gives the dev server
real concurrency instead. `taskflow-api/config/database.php`'s sqlite
connection also gets a `busy_timeout` and WAL `journal_mode` for the same
reason — once more than one PHP process can touch the database file at
once, a writer-vs-writer clash should wait and retry, not fail outright
with "database is locked".

## Why the default assertion timeout is raised to 15s

Nothing here is mocked: every request goes through a real `php artisan
serve`, which re-bootstraps the whole Laravel framework from scratch on
*every single request* (no opcache, no persistent worker), and
registration additionally makes a real network call to the HIBP API as
part of `RegisterRequest`'s password validation. Register → navigate →
load the dashboard's task list → render can legitimately take longer than
Playwright's 5s default, with no bug involved — that's just the real cost
of exercising the genuine stack instead of a mocked one.

## Why `TEST_PASSWORD` is a random string, not something readable

`RegisterRequest`'s password rule includes `Password::uncompromised()`,
which checks the real Have I Been Pwned API — this suite doesn't fake that
HTTP call the way the PHPUnit suite does, so it has to pass a password HIBP
has never seen. A "looks strong" string like `Str0ng!Passw0rd` is exactly
the kind of thing tutorials reuse and HIBP already has on file; a random
high-entropy string in `tests/helpers.ts` isn't.

## Selector notes

`src/components/FormField.tsx` renders a `<label>` with no `htmlFor`/`id`,
so `getByLabel()` can't find its inputs. `tests/helpers.ts` targets the
label's sibling element directly instead of guessing field order — see
`fieldInput`/`fieldSelect` there.
