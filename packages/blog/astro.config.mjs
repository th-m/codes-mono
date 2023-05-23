import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import solid from '@astrojs/solid-js';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  outDir: '../../dist/packages/blog',
  integrations: [
    react(),
    solid(),
    svelte(),
    vue(),
    partytown(),
    sitemap(),
    tailwind(),
  ],
});
