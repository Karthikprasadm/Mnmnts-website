// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Set base path for Vercel deployment
  base: process.env.VERCEL ? '/repo' : '/',
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
