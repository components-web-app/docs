<script setup lang="ts">
import { COMPARISON_HOME_PRODUCTS, COMPARISON_HOME_ROWS } from '~/utils/comparison'

// The five-row comparison summary inside a page's text (Built for Business). The full table is on /compare.
</script>

<template>
  <div class="not-prose my-6">
    <ComparisonTable
      compact
      :rows="COMPARISON_HOME_ROWS"
      :products="COMPARISON_HOME_PRODUCTS"
    />
  </div>
</template>
