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
        :ui="{
          rounded: 'rounded-full',
          inline: 'justify-center w-20 h-20',
          color: {
            gray: {
              solid: 'transition shadow-sm ring-1 ring-inset ring-gray-500 dark:ring-gray-700 text-gray-200 bg-gray-900/60 dark:bg-gray-800/60 hover:bg-gray-900 dark:hover:bg-gray-900 disabled:bg-gray-800 aria-disabled:bg-gray-800 backdrop-blur-sm'
            }
          }
        }"
        color="gray"
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
      v-model="isOpen"
      :ui="{ background: 'bg-transparent dark:bg-transparent backdrop-blur-sm', base: 'overflow-auto' }"
    >
      <UCard
        class="flex flex-col flex-1"
        :ui="{
          body: {
            base: 'flex-1'
          },
          ring: '',
          rounded: 'rounded-none',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          background: 'bg-white/70 dark:bg-gray-900/70',
          header: {
            background: 'bg-gray-900/90'
          }
        }"
      >
        <template #header>
          <UButton
            color="gray"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark-20-solid"
            class="flex absolute end-5 top-5 z-10"
            square
            padded
            :ui="{
              color: {
                gray: {
                  ghost: 'text-gray-200 hover:text-white hover:bg-gray-800 focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400'
                }
              }
            }"
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
