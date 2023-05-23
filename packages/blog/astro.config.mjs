// import { defineConfig } from 'astro/config';
// import react from '@astrojs/react';
// import solid from '@astrojs/solid-js';
// import svelte from '@astrojs/svelte';
// import vue from '@astrojs/vue';
// import partytown from '@astrojs/partytown';
// import sitemap from '@astrojs/sitemap';
// import tailwind from '@astrojs/tailwind';

// export default defineConfig({
//   outDir: '../../dist/packages/blog',
//   integrations: [
//     react(),
//     solid(),
//     svelte(),
//     vue(),
//     partytown(),
//     sitemap(),
//     tailwind(),
//   ],
// });

import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import image from '@astrojs/image';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import compress from 'astro-compress';
import { SITE } from './src/config.mjs';
// import netlify from "@astrojs/netlify/functions";
// import netlify from '@astrojs/netlify/edge-functions';
import react from "@astrojs/react";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const whenExternalScripts = (items = []) => SITE.googleAnalyticsId ? Array.isArray(items) ? items.map(item => item()) : [items()] : [];

// https://astro.build/config

// https://astro.build/config
export default defineConfig({
  site: SITE.origin,
  base: SITE.basePathname,
  trailingSlash: SITE.trailingSlash ? 'always' : 'never',
  output: 'static',
  // output: 'server',
  // adapter: netlify(),
  integrations: [tailwind({
    config: {
      applyBaseStyles: false
    }
  }), sitemap(), image({
    serviceEntryPoint: '@astrojs/image/sharp'
  }), mdx(), ...whenExternalScripts(() => partytown({
    config: {
      forward: ['dataLayer.push']
    }
  })), compress({
    css: true,
    html: {
      removeAttributeQuotes: false
    },
    img: false,
    js: true,
    svg: false,
    logger: 1
  }), react()],
  markdown: {},
  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src')
      }
    }
  }
});