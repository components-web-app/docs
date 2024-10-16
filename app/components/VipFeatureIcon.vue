<template>
  <div class="text-center flex justify-center justify-self-center self-center pt-8 px-4 w-1/2">
    <div class="max-w-[180px]">
      <div class="flex justify-center text-5xl md:text-7xl mb-2">
        <div class="rounded-full bg-gray-800/90 w-20 h-20 md:w-28 md:h-28 flex justify-center items-center text-white border border-gray-600">
          <slot name="icon" />
        </div>
      </div>
      <div class="font-semibold text-sm">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
