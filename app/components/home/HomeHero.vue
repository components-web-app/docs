<script lang="ts" setup>
const { data: page } = await useAsyncData(`home`, () => queryContent('/').findOne())
const videoModalOpen = ref(false)
</script>

<template>
  <div class="relative overflow-hidden dark:[text-shadow:_0_1px_40px_rgb(0_0_0_/_90%)] bg-primary/5">
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
        <UButton
          size="xl"
          color="white"
          icon="i-ph-video-duotone"
          label="What is the CWA?"
          @click="videoModalOpen = true"
        />
      </template>

      <MDC
        :value="page.hero.code"
        class="prose prose-primary dark:prose-invert mx-auto"
      />

      <UModal
        v-model="videoModalOpen"
        :ui="{ width: 'sm:max-w-[560px]' }"
      >
        <div>
          <div style="padding:56.25% 0 0 0;position:relative;">
            <iframe
              src="https://player.vimeo.com/video/1010679128?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;autoplay=1"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
              style="position:absolute;top:0;left:0;width:100%;height:100%;"
              title="CWA Overview"
            />
          </div>
        </div>
      </UModal>
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
