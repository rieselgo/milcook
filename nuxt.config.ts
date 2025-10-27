// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // シングルページアプリなのでpagesディレクトリを無効化
  pages: false,

  modules: [
    // '@nuxt/ui', // 一旦コメントアウト（Tailwind依存のため）
    '@pinia/nuxt',
    '@vueuse/nuxt',
    // '@nuxtjs/tailwindcss', // 一旦コメントアウト
    '@vite-pwa/nuxt',
  ],

  app: {
    head: {
      title: '粉ミルク調乳タイマー',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'description', content: '科学的根拠に基づいた正確な調乳タイマー' },
        { name: 'theme-color', content: '#FF6B35' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  // css: ['~/assets/css/main.css'], // 一旦コメントアウト

  typescript: {
    strict: true,
    typeCheck: false, // 一旦オフ（vue-tsc未インストールのため）
  },

  runtimeConfig: {
    public: {
      // 将来のFirebase設定用（現在は不要）
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'みるくっく - 粉ミルク調乳タイマー',
      short_name: 'みるくっく',
      description: '科学的根拠に基づいた正確な調乳タイマーアプリ',
      theme_color: '#FF6B35',
      background_color: '#FFFFFF',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icon.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
})
