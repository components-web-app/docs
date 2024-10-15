<template>
  <div class="text-center flex justify-center justify-self-center self-center">
    <div class="max-w-[180px]">
      <div class="flex justify-center text-6xl md:text-7xl mb-2">
        <slot name="icon" />
      </div>
      <div class="font-semibold text-sm">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
