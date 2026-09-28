// @ts-check
import { defineConfig, envField } from 'astro/config';
import sanity from '@sanity/astro';
import cloudflare from '@astrojs/cloudflare';
import { loadEnv } from 'vite';

// The config file runs before Astro starts, so astro:env isn't available here.
// loadEnv reads .env locally and the build environment on Cloudflare.
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  env: {
    schema: {
      SANITY_PROJECT_ID: envField.string({ context: 'server', access: 'public', default: 'jfsf87io' }),
      SANITY_DATASET: envField.string({ context: 'server', access: 'public', default: 'production' }),
      SANITY_WRITE_TOKEN: envField.string({ context: 'server', access: 'secret' }),
    },
  },
  integrations: [
    sanity({
      projectId: env.SANITY_PROJECT_ID,
      dataset: env.SANITY_DATASET ?? 'production',
      useCdn: false,
      apiVersion: '2024-03-21',
    }),
  ],
});