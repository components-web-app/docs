<script setup lang="ts">
const isOpen = ref(false)
const vipIsShown = useCookie<boolean>('vip-shown', {
  maxAge: 3600 // 1 hour
})
onMounted(async () => {
  await nextTick()
  if (!vipIsShown.value) {
    isOpen.value = true
    vipIsShown.value = true
  }
})
</script>

<template>
  <div>
    <div class="fixed bottom-5 right-5 z-10">
      <UButton
        color="neutral"
        variant="solid"
        class="rounded-full w-20 h-20 justify-center shadow-sm ring-1 ring-inset ring-gray-500 dark:ring-gray-700 text-gray-200 bg-gray-900/60 dark:bg-gray-800/60 hover:bg-gray-900 dark:hover:bg-gray-900 backdrop-blur-sm"
        @click="isOpen = true"
      >
        <SvgoVipCrown
          class="h-9"
          :font-controlled="false"
          filled
        />
      </UButton>
    </div>

    <USlideover
      v-model:open="isOpen"
      :ui="{ content: 'overflow-auto bg-transparent dark:bg-transparent backdrop-blur-sm' }"
    >
      <UCard
        class="flex flex-col flex-1 rounded-none divide-y divide-gray-100 dark:divide-gray-800 bg-white/70 dark:bg-gray-900/70"
        :ui="{ body: 'flex-1', header: 'bg-gray-900/90' }"
      >
        <template #header>
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark-20-solid"
            class="flex absolute end-5 top-5 z-10 text-gray-200 hover:text-white hover:bg-gray-800"
            square
            padded
            @click="isOpen = false"
          />
          <div class="flex flex-col pt-10 space-y-4">
            <div class="flex justify-center">
              <SvgoVipCrown
                class="h-9"
                :font-controlled="false"
                filled
              />
            </div>
            <div class="flex justify-center font-source-code">
              <SvgoVipTitle
                :font-controlled="false"
                :filled="true"
                class="w-9/12"
              />
            </div>
          </div>
        </template>
        <VipCountdown />
        <VipFeatureIcons />
        <div class="prose dark:prose-invert bg-gray-400/5 rounded-xl border border-gray-500 p-4 font-bold text-center">
          <p class="text-sm">
            We promise to <span class="text-vip">only</span> use your email to stay touch from time to time about <span class="text-vip">relevant VIP topics</span>.
          </p>
        </div>
        <VipSignUp />
      </UCard>
    </USlideover>
  </div>
</template>
