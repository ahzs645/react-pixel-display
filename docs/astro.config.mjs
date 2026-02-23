import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://cagcoach.github.io',
  base: '/react-pixel-display',
  integrations: [
    starlight({
      title: 'React Pixel Display',
      description: 'LED matrix display simulator for React',
      social: {
        github: 'https://github.com/cagcoach/react-pixel-display',
      },
      sidebar: [
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
    react(),
  ],
});
