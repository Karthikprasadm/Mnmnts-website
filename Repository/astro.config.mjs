// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Set base path for Vercel deployment
  // Check for Vercel environment variables (VERCEL or VERCEL_ENV)
  base: (process.env.VERCEL || process.env.VERCEL_ENV) ? '/repo' : '/',
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
