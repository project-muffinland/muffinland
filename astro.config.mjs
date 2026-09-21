// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [
    sanity({
      projectId: 'jfsf87io',
      dataset: 'production',
      useCdn: false,
      apiVersion: '2024-03-21', 
    })
  ]
});