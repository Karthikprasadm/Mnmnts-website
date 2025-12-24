// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Set base path for Vercel deployment
  // Always use /repo for production builds (Vercel)
  // Use / for local development
  base: process.env.NODE_ENV === 'production' ? '/repo' : '/',
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
