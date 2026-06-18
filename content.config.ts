import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: {
        include: '**/*.md'
      }
    }),
    pages: defineCollection({
      type: 'page',
      source: {
        include: '*.yml'
      },
      schema: z.object({
        hero: z.record(z.string(), z.any()).optional(),
        cta: z.record(z.string(), z.any()).optional(),
        pageCards: z.record(z.string(), z.any()).optional(),
        sections: z.array(z.any()).optional(),
        faq: z.record(z.string(), z.any()).optional(),
        businessSizes: z.record(z.string(), z.any()).optional(),
        teamwork: z.record(z.string(), z.any()).optional(),
        timeline: z.array(z.any()).optional(),
        features: z.record(z.string(), z.any()).optional(),
        benefits: z.record(z.string(), z.any()).optional(),
        code: z.record(z.string(), z.any()).optional(),
        contributors: z.record(z.string(), z.any()).optional(),
      })
    })
  }
})
