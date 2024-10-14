<script setup lang="ts">
const isOpen = ref(false)
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
              solid: 'shadow-sm ring-1 ring-inset ring-gray-300 ring-gray-700 text-gray-200 bg-gray-700 dark:bg-gray-800 hover:bg-gray-900 disabled:bg-gray-800 aria-disabled:bg-gray-800'
            }
          }
        }"
        color="gray"
        @click="isOpen = true"
      >
        <SvgoVipCrown
          class="h-8"
          :font-controlled="false"
          filled
        />
      </UButton>
    </div>

    <USlideover v-model="isOpen">
      <div class="p-4 flex-1">
        <UButton
          color="gray"
          variant="ghost"
          size="sm"
          icon="i-heroicons-x-mark-20-solid"
          class="flex absolute end-5 top-5 z-10"
          square
          padded
          @click="isOpen = false"
        />
      </div>
    </USlideover>
  </div>
</template>
