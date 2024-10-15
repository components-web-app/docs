<template>
  <div class="flex space-x-5 space-y-8 md:space-10 flex-wrap justify-center">
    <VipFeatureIcon>
      <template #icon>
        <SvgoVipGetSupport :filled="true" />
      </template>
      <span class="text-vip">Free</span> support when you use the CWA
    </VipFeatureIcon>
    <VipFeatureIcon>
      <template #icon>
        <SvgoVipInfluenceFuture :filled="true" />
      </template>
      Help <span class="text-vip">shape the future</span> to work for you
    </VipFeatureIcon>
    <VipFeatureIcon>
      <template #icon>
        <SvgoVipFirstToTry :filled="true" />
      </template>
      Be the <span class="text-vip">first to try</span> new features & stay up to date
    </VipFeatureIcon>
  </div>
</template>

<script setup lang="ts">
import VipFeatureIcon from '~/components/VipFeatureIcon.vue'
</script>
