import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import remarkPublicationBreaks from './src/lib/remark-publication-breaks.mjs';

// pages.dev 検証用。大学サーバー配下へ置く場合は base: '/rinyaku' に変更。
export default defineConfig({
  site: 'https://example.pages.dev',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkPublicationBreaks],
  },
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
