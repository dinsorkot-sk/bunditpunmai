// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui','@nuxthub/core', '@scalar/nuxt', '@nuxt/test-utils/module', '@nuxtjs/google-fonts'],
  css: ['~/assets/css/main.css'],
  hub: {
    db: 'sqlite',
    blob: {
      driver: 'fs',
      dir: '.data/blob'
    }
  },
  googleFonts: {
    families: {
      Prompt: {
        wght: [300, 400, 500, 600, 700],
        ital: [300, 400, 500, 600, 700],
      },
    },
    display: 'swap',
    subsets: ['latin', 'thai'],
    prefetch: true,
    preconnect: true,
    preload: true,
  },

  nitro: {
    experimental: {
      openAPI: true,
      tasks: true
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        '@nuxt/ui > prosemirror-state',
        '@nuxt/ui > prosemirror-transform',
        '@nuxt/ui > prosemirror-model',
        '@nuxt/ui > prosemirror-view',
        '@nuxt/ui > prosemirror-gapcursor'
      ]
    }
  },
  routeRules: {
    // Set layout for specific route
    '/admin/**': { appLayout: 'admin' },
    '/login': { appLayout: 'auth' },
  },
})