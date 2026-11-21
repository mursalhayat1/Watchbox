import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/mcp.test.ts'],
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
