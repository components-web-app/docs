<template>
  <div class="flex flex-wrap justify-center -mt-8 pb-8">
    <VipFeatureIcon>
      <template #icon>
        <SvgoVipGetSupport
          :filled="true"
          class="!mb-0"
        />
      </template>
      <span class="text-black dark:text-vip">Free</span> first-hand support for the CWA
    </VipFeatureIcon>
    <VipFeatureIcon>
      <template #icon>
        <SvgoVipInfluenceFuture
          :filled="true"
          class="!mb-0"
        />
      </template>
      Help <span class="text-black dark:text-vip">shape the future</span> to work for you
    </VipFeatureIcon>
    <VipFeatureIcon>
      <template #icon>
        <SvgoVipFirstToTry
          :filled="true"
          class="!mb-0"
        />
      </template>
      Be the <span class="text-black dark:text-vip">first to try</span> new features & stay up to date
    </VipFeatureIcon>
  </div>
</template>

<script setup lang="ts">
import VipFeatureIcon from '~/components/VipFeatureIcon.vue'
</script>
