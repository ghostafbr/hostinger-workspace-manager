import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'functions'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'functions/',
        'src/test-setup.ts',
        '**/*.spec.ts',
        '**/*.interface.ts',
        '**/*.enum.ts',
        '**/*.d.ts',
        '**/index.ts',
        'src/main.ts',
        'src/environments/**',
      ],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70,
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
    },
  },
});
