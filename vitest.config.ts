import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: {
    jsx: { importSource: 'hono/jsx' },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
