<script setup lang="ts">
// Renders a page from the `standalone` collection (content/standalone/), outside the docs layout.
// `wide` gives the page a column wide enough for a full-width table, such as /compare's.
const props = defineProps<{
  path: string
  wide?: boolean
}>()

const { data: page } = await useAsyncData(`standalone-${props.path}`, () => queryCollection('standalone').path(props.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: page.value.title,
  ogTitle: page.value.title,
  description: page.value.description,
  ogDescription: page.value.description
})

defineOgImage('Docs.satori', {
  title: page.value.title,
  description: page.value.description
})
</script>

<template>
  <UContainer :class="wide ? 'max-w-6xl' : 'max-w-3xl'">
    <UPage>
      <UPageHeader
        :title="page?.title"
        :description="page?.description"
      />
      <UPageBody>
        <ContentRenderer
          v-if="page"
          :value="page"
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
