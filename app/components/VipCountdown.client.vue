<script lang="ts" setup>
import VueCountdown from '@chenfengyuan/vue-countdown'

const vipExpires = useCookie('vip-expires')
</script>

<template>
  <div
    v-if="vipExpires"
    class="p-4 text-center prose dark:prose-invert mb-14"
  >
    <h1>Limited Time Offer</h1>
    <VueCountdown
      v-slot="{ days, hours, minutes, seconds }"
      :time="parseInt(vipExpires) * 1000"
    >
      <span class="font-mono font-bold text-vip text-sm">
        <template v-if="days > 0"><span class="text-2xl text-white mr-0.5">{{ days }}</span>day{{ days !== 1 ? 's' : '' }}&nbsp;</template>
        <template v-if="hours > 0"><span class="text-2xl text-white mr-0.5">{{ hours }}</span>hr{{ hours !== 1 ? 's' : '' }}&nbsp;</template>
        <template v-if="minutes > 0"><span class="text-2xl text-white mr-0.5">{{ minutes }}</span>min{{ minutes !== 1 ? 's' : '' }}&nbsp;</template>
        <span class="text-2xl text-white">{{ seconds }}</span>sec{{ seconds !== 1 ? 's' : '' }}
      </span>
    </VueCountdown>
  </div>
</template>
