// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'vi' },
      title: 'Từ vựng N5',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'color-scheme', content: 'light dark' },
        { name: 'description', content: 'Ôn từ vựng N5 theo bài: flashcard và gõ romaji.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Zen+Maru+Gothic:wght@400;500;700&display=swap',
        },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  nitro: {
    // Trang chủ sang /study bằng JavaScript nên crawler không tự tìm thấy.
    // Khai báo tường minh để build tĩnh luôn có study/index.html — nếu thiếu,
    // mở thẳng link học hoặc F5 trên hosting tĩnh sẽ ra 404.
    prerender: { routes: ['/study'] },
  },
})
