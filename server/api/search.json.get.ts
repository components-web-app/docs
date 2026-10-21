import { queryCollectionSearchSections } from '@nuxt/content/server'

export default eventHandler(async (event) => {
  // Each section's .navigation.yml is in the collection for its sidebar title; it isn't a page to search.
  const sections = await queryCollectionSearchSections(event, 'docs')
  return sections.filter(section => !section.id.includes('/.navigation'))
})
