import { queryCollectionSearchSections } from '@nuxt/content/server'

export default eventHandler(async (event) => {
  return queryCollectionSearchSections(event, 'docs')
})
