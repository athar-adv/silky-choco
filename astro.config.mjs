import { defineConfig } from 'astro/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  vite: {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Sekas',
          short_name: 'Sekas',
          theme_color: '#ffffff',
          icons: [
            // { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            // { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
          ]
        }
      })
    ]
  }
});