// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Always use /repo as base path for Vercel deployment
  // This ensures all assets are correctly referenced under /repo
  base: '/repo',
  devToolbar: {
    enabled: false,
  },
  prefetch: true,

  site: 'https://karthikprasadm.github.io/',

  integrations: [sitemap()],
});
