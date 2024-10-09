<script setup lang="ts">
const points = useState(() => new Array(16).fill(0).map(() => [Math.random(), Math.random()]))

const poly = computed(() => points.value.map(([x, y]) => `${x * 100}% ${y * 80}%`).join(', '))

function jumpVal(val: number) {
  return Math.random() > 0.5 ? val + (Math.random() - 0.5) / 2 : Math.random()
}

let timeout: NodeJS.Timeout

function jumpPoints() {
  for (let i = 0; i < points.value.length; i++) {
    points.value[i] = [jumpVal(points.value[i][0]), jumpVal(points.value[i][1])]
  }
  timeout = setTimeout(jumpPoints, 2000 + Math.random() * 1000)
}

onMounted(() => {
  jumpPoints()
  onUnmounted(() => clearTimeout(timeout))
})
</script>

<template>
  <div class="bg absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
    <div
      class="h-full w-full bg-gradient-to-l from-[rgb(var(--color-primary-DEFAULT))] to-transparent opacity-20"
      :style="{ 'clip-path': `polygon(${poly})` }"
    />
  </div>
</template>

<style scoped>
.bg > div {
  clip-path: circle(75%);
  transition: clip-path 3s;
}

.light .bg > div {
  opacity: 1 !important;
}
</style>
