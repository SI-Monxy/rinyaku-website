import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// pages.dev 検証用。大学サーバー配下へ置く場合は base: '/rinyaku' に変更。
export default defineConfig({
  site: 'https://example.pages.dev',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
