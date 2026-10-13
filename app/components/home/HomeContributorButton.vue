<script setup lang="ts">
// One maintainer in the home page's contributors section. A component of its own because vue-tsc
// loses a v-for's variables inside a link component bound to them (HomeContributors' loop).
defineProps<{
  user: { username: string, name?: string, to?: string }
}>()
</script>

<template>
  <UButton
    :to="user.to"
    size="md"
    color="neutral"
    variant="ghost"
    target="_blank"
  >
    <UAvatar
      :alt="user.username"
      :src="`https://ipx.nuxt.com/s_80x80/gh_avatar/${user.username}`"
      :srcset="`https://ipx.nuxt.com/s_160x160/gh_avatar/${user.username} 2x`"
      width="80"
      height="80"
      size="md"
      loading="lazy"
    />

    <div class="text-left">
      <p class="font-medium">
        {{ user.name }}
      </p>
      <p class="text-gray-500 dark:text-gray-400 leading-4">
        {{ `@${user.username}` }}
      </p>
    </div>
  </UButton>
</template>
