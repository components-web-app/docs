<script setup lang="ts">
import type { SiteLink } from '~/utils/site'

const { data: navigation } = useNuxtData<any>('navigation')

const props = defineProps<{
  links?: SiteLink[]
}>()

const { header } = useAppConfig()
const route = useRoute()

const isDocsPage = computed(() => !['/', '/about', '/built-for-business'].includes(route.path))

const linksWithoutIcons = computed(() =>
  (props.links || []).map(({ icon: _icon, ...link }) => link)
)
</script>

<template>
  <UHeader title="CWA">
    <template #title>
      <div
        v-if="header?.logo?.dark || header?.logo?.light"
        class="flex items-center"
      >
        <UColorModeImage v-bind="{ class: 'h-6 w-auto', ...header?.logo }" />
      </div>
      <template v-else>
        CWA <UBadge
          label="Docs"
          variant="subtle"
          class="mb-0.5"
        />
      </template>
    </template>

    <UNavigationMenu
      v-if="linksWithoutIcons?.length"
      :items="linksWithoutIcons"
      class="hidden lg:flex"
      :ui="{ link: 'font-semibold hover:text-primary', list: 'gap-x-3' }"
    />

    <template #right>
      <!-- Search on every page, not only in the docs sidebar -->
      <UContentSearchButton
        v-if="header?.search"
        :collapsed="true"
        aria-label="Search the docs"
      />

      <!-- Below sm, the colour switch and the SWA logo move into the menu -->
      <UColorModeSwitch
        v-if="header?.colorMode"
        size="sm"
        class="hidden sm:inline-flex"
      />

      <div
        v-if="header?.links"
        class="pl-1.5 md:pl-3 ml-0.5 md:ml-1 border-l border-black/30 dark:border-white/30"
      >
        <UButton
          v-for="(link, index) of header.links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </div>

      <div class="hidden sm:block text-center pl-1.5 md:pl-3 py-1.5 md:ml-1 border-l border-black/30 dark:border-white/30">
        <NuxtLink
          to="https://silverbackwebapps.com"
          target="_blank"
          aria-label="Silverback Web Apps (opens in a new tab)"
        >
          <SvgoLogoSwa
            :font-controlled="false"
            aria-hidden="true"
            class="h-5 md:h-6"
          />
        </NuxtLink>
      </div>
    </template>

    <template #body>
      <LazyUContentSearchButton
        v-if="header?.search"
        size="md"
        class="mb-4 w-full"
      />
      <UNavigationMenu
        v-if="links?.length"
        :items="links"
        orientation="vertical"
        class="mb-4"
      />
      <LazyUContentNavigation
        v-if="isDocsPage"
        :navigation="navigation"
      />
      <div class="sm:hidden mt-6 pt-4 flex items-center justify-between border-t border-default">
        <UColorModeSwitch
          v-if="header?.colorMode"
          size="sm"
        />
        <NuxtLink
          to="https://silverbackwebapps.com"
          target="_blank"
          aria-label="Silverback Web Apps (opens in a new tab)"
        >
          <SvgoLogoSwa
            :font-controlled="false"
            aria-hidden="true"
            class="h-5"
          />
        </NuxtLink>
      </div>
    </template>
  </UHeader>
</template>
