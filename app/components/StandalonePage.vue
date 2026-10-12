<script setup lang="ts">
// Renders a page from the `standalone` collection (content/standalone/), outside the docs layout.
const props = defineProps<{
  path: string
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
  <UContainer class="max-w-3xl">
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
