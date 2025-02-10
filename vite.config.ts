/// <reference types="vitest" />
import type { UserConfig } from 'vite';

export default {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
    },
  },
} as UserConfig;
