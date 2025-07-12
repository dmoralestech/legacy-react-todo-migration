import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/e2e/**',
      'src/test/e2e/**',
      '**/*.e2e.{js,jsx}',
      '**/*.spec.js' // Exclude playwright spec files
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'build/',
        'coverage/',
        '**/*.test.{js,jsx}',
        '**/*.spec.{js,jsx}'
      ],
      thresholds: {
        lines: 65,
        functions: 75,
        branches: 85,
        statements: 65
      }
    },
    globals: true,
  },
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
});