// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // No base path - proxy will handle /repo prefix
  devToolbar: {
    enabled: false,
  },
  prefetch: true,

  site: 'https://karthikprasadm.github.io/',

  integrations: [sitemap()],
  experimental: {
    svg: true,
  },
});
