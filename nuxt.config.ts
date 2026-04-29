// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
  ],
  css: ['@/assets/css/main.css'],
  app: {
    head: {
      title: 'TenantReport',
      link: [
        { 
          rel: 'icon', 
          type: 'image/svg+xml', 
          href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%233b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' 
        }
      ]
    }
  }
})
