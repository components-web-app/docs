<template>
  <div class="justify-center flex mb-8 px-4 sm:px-10">
    <div class="relative">
      <div class="opacity-50">
        <img
          src="/images/screenshot-1c.jpg"
          alt="CWA Web Page Screenshot"
          class="w-full"
        >
      </div>
      <div
        class="absolute block w-full bg-white/20 bg-[length:calc(100%+8px)_auto] rounded-lg border-4 border-primary z-10 transition-all duration-700 overflow-hidden"
        :style="{
          top: `${position.top}%`,
          left: `${position.left}%`,
          height: `${position.height}%`
        }"
      >
        <img
          src="/images/screenshot-1c.jpg"
          alt="CWA Web Page Screenshot"
          class="absolute -left-1 -top-1.5 transition-all duration-700 max-w-none w-[calc(100%+8px)]"
          :style="{
            transform: `translateY(-${position.top}%) translateX(-${position.left}%)`
          }"
        >
      </div>
      <div
        class="absolute top-0 transition-all duration-700 z-20 text-primary"
        :style="arrowStyle"
      >
        <SvgoScreenshotArrow
          :font-controlled="false"
          class="h-20 scale-75 md:scale-100"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  highlight: 'component' | 'admin' | 'page'
}>()

const arrowStyle = computed(() => {
  if (props.highlight === 'page') {
    return {
      top: `${position.value.top}%`,
      marginTop: `${(position.value.height / 2).toFixed(1)}%`,
      transform: `translateY(-20%)`,
      right: '100%',
      marginRight: '4px',
      left: 'auto'
    }
  }
  if (props.highlight === 'component') {
    return {
      top: `${position.value.top}%`,
      marginTop: `${(position.value.height / 2).toFixed(1)}%`,
      transform: `translateY(-20%)`,
      right: '100%',
      marginRight: '4px',
      left: 'auto'
    }
  }
  return {
    top: `${position.value.top}%`,
    marginTop: `${(position.value.height / 2).toFixed(1)}%`,
    transform: `translateY(-30%) scaleX(-1) translateX(-100%)`,
    right: 0,
    marginRight: '-4px'
  }
})

const position = computed(() => {
  if (props.highlight === 'page') {
    return {
      top: 27,
      left: 0,
      height: 47
    }
  }
  if (props.highlight === 'component') {
    return {
      top: 31,
      left: 0,
      height: 13
    }
  }
  return {
    top: 74,
    left: 0,
    height: 26
  }
})
</script>
