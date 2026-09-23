#!/usr/bin/env node
// Node, not a shell script — this runs as Playwright's webServer.command,
// and a bash/sh script isn't portable to a plain Windows shell (no WSL, no
// Git Bash on PATH gives "execvpe(/bin/bash) failed"). php itself is
// already on PATH as a normal Windows binary (the PHPUnit suite runs the
// same way), so only the orchestration needs to be cross-platform, and
// Node already is one, since this is a Playwright/npm test run.
import { existsSync, mkdirSync, rmSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { spawnSync, spawn } from 'node:child_process';

const dbPath = process.env.DB_DATABASE;
if (!dbPath) {
  console.error('DB_DATABASE is not set — expected from playwright.config.ts webServer.env');
  process.exit(1);
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.error) {
    console.error(`Failed to run ${cmd} ${args.join(' ')}:`, result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// No .env is committed (it's gitignored) — self-heal the same way the
// backend-tests CI job does, so this also works on a bare checkout in CI.
if (!existsSync('.env')) {
  copyFileSync('.env.example', '.env');
  run('php', ['artisan', 'key:generate', '--ansi']);
}

// Fresh scratch database for every run. A file (not :memory:) because
// `php artisan serve` boots a new Application per request — an in-memory
// SQLite connection wouldn't survive from one request to the next.
//
// WAL journal_mode (config/database.php) keeps its state in sidecar files
// next to the main one (`<db>-wal`, `<db>-shm`) — deleting/truncating only
// the main file and leaving a stale pair behind is exactly the kind of
// mismatch that wedges SQLite's locking, so every sidecar goes too.
mkdirSync(dirname(dbPath), { recursive: true });
for (const suffix of ['', '-wal', '-shm', '-journal']) {
  const p = dbPath + suffix;
  if (existsSync(p)) rmSync(p);
}
writeFileSync(dbPath, '');

run('php', ['artisan', 'migrate:fresh', '--force']);

const port = process.env.PORT || '8001';
// Not run() here — this one has to keep running as Playwright's server
// process. Playwright kills this whole process tree (this script + the PHP
// child below) on teardown.
//
// PHP_CLI_SERVER_WORKERS matters a lot here: php artisan serve handles ONE
// request at a time by default. playwright.config.ts runs with
// fullyParallel: true, so several tests register/fetch concurrently — with
// a single worker they just queue up behind whichever request is slowest
// (e.g. RegisterRequest's real, unmocked HIBP network call), and that
// queueing is exactly what made "Good day," time out even at 15s: not one
// slow request, but N of them serialized behind a single PHP process.
const server = spawn('php', ['artisan', 'serve', '--host=127.0.0.1', `--port=${port}`], {
  stdio: 'inherit',
    env: { ...process.env, PHP_CLI_SERVER_WORKERS: process.env.PHP_CLI_SERVER_WORKERS || '2' },
});
server.on('exit', (code) => process.exit(code ?? 0));
