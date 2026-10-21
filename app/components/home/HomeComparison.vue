<script setup lang="ts">
import { COMPARISON_AS_OF, COMPARISON_HOME_PRODUCTS, COMPARISON_HOME_ROWS, COMPARISON_PRODUCTS } from '~/utils/comparison'

// The five comparison rows where CWA differs most; the full table is on /why-cwa.
const comparedCount = COMPARISON_PRODUCTS.length - 1
</script>

<template>
  <UPageSection
    :ui="{ container: 'py-16 sm:py-20 lg:py-24' }"
    description="Five ways CWA differs from the tools teams usually weigh it against. The full table says why for every mark."
  >
    <template #title>
      How CWA <span class="text-primary-400">compares</span>
    </template>
    <ComparisonTable
      compact
      :rows="COMPARISON_HOME_ROWS"
      :products="COMPARISON_HOME_PRODUCTS"
    />
    <div class="flex flex-col items-center gap-3 text-center">
      <UButton
        to="/why-cwa#how-cwa-compares"
        size="xl"
        variant="subtle"
        trailing-icon="i-heroicons-arrow-right"
      >
        Why CWA › How CWA compares, with {{ comparedCount }} products
      </UButton>
      <p class="text-sm text-muted">
        Accurate as of {{ COMPARISON_AS_OF }}.
      </p>
    </div>
  </UPageSection>
</template>
