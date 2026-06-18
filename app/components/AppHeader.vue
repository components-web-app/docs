<script setup lang="ts">
const { data: navigation } = useNuxtData<any>('navigation')

const props = defineProps<{
  links?: { label: string, icon?: string, to: string, target?: string }[]
}>()

const { header } = useAppConfig()
const route = useRoute()

const isDocsPage = computed(() => !['/', '/about', '/built-for-business'].includes(route.path))

const linksWithoutIcons = computed(() =>
  (props.links || []).map(({ icon: _icon, ...link }) => link)
)
</script>

<template>
  <UHeader>
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
      <UColorModeSwitch
        v-if="header?.colorMode"
        size="sm"
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

      <div class="text-center pl-1.5 md:pl-3 py-1.5 md:ml-1 border-l border-black/30 dark:border-white/30">
        <NuxtLink
          to="https://silverbackwebapps.com"
          target="_blank"
        >
          <SvgoLogoSwa
            :font-controlled="false"
            class="h-5 md:h-6"
          />
        </NuxtLink>
      </div>
    </template>

    <template #body>
      <LazyUContentSearchButton
        v-if="isDocsPage"
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
    </template>
  </UHeader>
</template>
