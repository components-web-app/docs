<script lang="ts" setup>
import BackgroundParticles from '~/components/home/BackgroundParticles.vue'

const { data: page } = await useAsyncData(`home`, () => queryContent('/').findOne())
</script>

<template>
  <div class="relative overflow-hidden">
    <ULandingHero
      v-if="page.hero"
      v-bind="page.hero"
      :ui="{
        container: 'mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl gap-8 sm:gap-y-14 flex flex-col dark:[text-shadow:_0_1px_40px_rgb(0_0_0_/_90%)]'
      }"
    >
      <template #top>
        <BackgroundParticles class="absolute inset-0 -z-10 opacity-30 invert dark:invert-0" />
      </template>
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
        <div class="flex justify-center mb-6">
          <SvgoLogo
            class="text-primary h-20"
            :font-controlled="false"
          />
        </div>
        <MDC :value="page.hero.title" />
      </template>

      <template #description>
        <MDC :value="page.hero.description" />
      </template>

      <template #links>
        <UButton
          color="primary"
          label="Get Started"
          icon="i-ph-rocket-launch-duotone"
          to="/getting-started/installation"
          size="xl"
        />
      </template>

      <MDC
        :value="page.hero.code"
        class="prose prose-primary dark:prose-invert mx-auto"
      />
    </ULandingHero>
  </div>
</template>

<style scoped lang="postcss">
video[poster] {
  height: 100%;
  width: 100%;
  object-fit: cover;
}
</style>
