<script setup lang="ts">
import type { SiteLink } from '~/utils/site'

const { footer } = useAppConfig()

const props = defineProps<{
  isVip?: boolean
  links?: SiteLink[]
}>()

// The main navigation plus the project's licence and repository, without icons.
const footerLinks = computed(() => [
  ...(props.links || []).map(({ icon: _icon, ...link }) => link),
  ...(footer?.extraLinks || [])
])
</script>

<template>
  <UFooter>
    <template #left>
      <span>
        {{ footer.credits }}
        <template v-if="footer?.owner">
          <ULink
            :to="footer.owner.to"
            target="_blank"
            class="underline underline-offset-2 hover:text-primary"
          >{{ footer.owner.label }}</ULink>
        </template>
      </span>
    </template>

    <UNavigationMenu
      v-if="footerLinks.length"
      :items="footerLinks"
      variant="link"
      class="flex-wrap justify-center"
      :ui="{ list: 'flex-wrap justify-center gap-x-2' }"
      aria-label="Footer"
    />

    <template #right>
      <UColorModeButton v-if="footer?.colorMode" />

      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>
  </UFooter>
  <div
    v-if="isVip"
    class="h-28"
  >
&nbsp;
  </div>
</template>
