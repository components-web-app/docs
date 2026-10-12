<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
})

// Satori has no reliable line clamping, so cut long text here: a long description
// used to run off the bottom of the card.
function truncate(text: string, max: number) {
  if (!text || text.length <= max) {
    return text
  }
  return `${text.slice(0, max).replace(/\s+\S*$/, '')}…`
}

const shortTitle = computed(() => truncate(props.title, 60))
const shortDescription = computed(() => truncate(props.description, 150))
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between bg-slate-900 p-16">
    <img
      src="/logo-dark.svg"
      width="252"
      height="72"
      alt="CWA"
    >
    <div class="flex flex-col">
      <h1 class="text-7xl mb-6 text-white leading-tight">
        {{ shortTitle }}
      </h1>
      <p
        v-if="shortDescription"
        class="text-4xl text-gray-300 leading-snug"
      >
        {{ shortDescription }}
      </p>
    </div>
    <div class="flex text-3xl text-teal-400">
      cwa.rocks
    </div>
  </div>
</template>
