// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
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