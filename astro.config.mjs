// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  integrations: [
    sanity({
      projectId: 'jfsf87io',
      dataset: 'production',
      useCdn: false,
      apiVersion: '2024-03-21', 
    })
  ],

  adapter: cloudflare()
});