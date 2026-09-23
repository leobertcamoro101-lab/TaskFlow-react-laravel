// Extends Vitest's `expect` with jest-dom matchers (toBeInTheDocument, etc.)
// for every test file, via vite.config.ts's test.setupFiles.
import '@testing-library/jest-dom/vitest';

// @testing-library/react normally auto-registers an afterEach(cleanup) hook,
// but only if it finds a global `afterEach` at import time — which requires
// vitest's `test.globals: true`. This project uses explicit imports instead
// (`import { afterEach } from 'vitest'` in each test file), so that
// auto-detection never fires and unmounted components leak into the next
// test's DOM within the same file. Register cleanup explicitly instead.
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
