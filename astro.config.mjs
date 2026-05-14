import { defineConfig } from 'astro/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  site: 'https://friendo6.github.io',
  base: '/website',

  vite: {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Sekas',
          short_name: 'Sekas',
          theme_color: '#ffffff',
          icons: []
        }
      })
    ]
  }
});