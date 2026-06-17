import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: {
        include: '{1,2}.*/**/*.md'
      }
    }),
    pages: defineCollection({
      type: 'page',
      source: {
        include: '*.yml'
      }
    })
  }
})
