import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const lib = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@lab/finance-domain': lib('./libs/finance/domain/src/index.ts'),
      '@lab/finance-data-access': lib('./libs/finance/data-access/src/index.ts'),
    },
  },
  test: { include: ['libs/**/*.spec.ts'], environment: 'node' },
});
