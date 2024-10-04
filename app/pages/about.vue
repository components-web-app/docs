<script setup lang="ts">
const { data } = await useAsyncData('landing', () => {
  return Promise.all([
    queryContent('/about').findOne()
  ])
})
const [page] = data.value

useSeoMeta({
  titleTemplate: '',
  title: page.title,
  ogTitle: page.title,
  description: page.description,
  ogDescription: page.description
})
</script>

<template>
  <div>
    <ULandingHero
      v-if="page.hero"
      v-bind="page.hero"
    >
      <template #headline>
        <UBadge
          v-if="page.hero.headline"
          variant="subtle"
          size="lg"
          class="relative rounded-full font-semibold"
        >
          <NuxtLink
            :to="page.hero.headline.to"
            target="_blank"
            class="focus:outline-none"
            tabindex="-1"
          >
            <span
              class="absolute inset-0"
              aria-hidden="true"
            />
          </NuxtLink>

          {{ page.hero.headline.label }}

          <UIcon
            v-if="page.hero.headline.icon"
            :name="page.hero.headline.icon"
            class="ml-1 w-4 h-4 pointer-events-none"
          />
        </UBadge>
      </template>

      <template #title>
        <MDC :value="page.hero.title" />
      </template>

      <template #description>
        <MDC :value="page.hero.description" />
      </template>

      <MDC
        :value="page.hero.code"
        class="prose prose-primary dark:prose-invert mx-auto"
      />

      <template #links>
        <UButton
          color="primary"
          label="Get Started"
          icon="i-ph-rocket-launch-duotone"
          to="/getting-started/installation"
          size="xl"
        />
      </template>
    </ULandingHero>

    <ULandingSection align="left">
      <template #title>
        Easily deployed using<br><span class="text-primary-400">Docker containers</span>
      </template>
      <template #description>
        ...
      </template>
      <template #links>
        <UButton
          to="/getting-started"
          icon="i-ph-rocket-launch-duotone"
          size="xl"
        >
          Get Started
        </UButton>
      </template>
      <div>
        <NuxtImg
          src="/images/docker.png"
          alt="API Platform and Nuxt into the CWA"
          loading="lazy"
        />
      </div>
    </ULandingSection>
  </div>
</template>

<style scoped lang="postcss">
</style>
