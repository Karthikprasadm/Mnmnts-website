// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  prefetch: true,
  server: {
    host: true, // Listen on all network interfaces
    port: 4321,
  },

  site: 'https://playersclub.crnacura.workers.dev/',

  integrations: [sitemap()],
  experimental: {
    svg: true,
  },
});
