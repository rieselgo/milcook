// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    // '@nuxt/ui', // 一旦コメントアウト（Tailwind依存のため）
    '@pinia/nuxt',
    '@vueuse/nuxt',
    // '@nuxtjs/tailwindcss', // 一旦コメントアウト
    // '@vite-pwa/nuxt', // 一旦コメントアウト
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
})
