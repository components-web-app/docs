<script setup lang="ts">
import { COMPARISON_AS_OF, COMPARISON_PRODUCTS } from '~/utils/comparison'

// The pages each comparison cell came from, product by product: small print at the foot of the page.
const products = COMPARISON_PRODUCTS.filter(product => product.sources.length)
</script>

<template>
  <div class="not-prose mt-16 border-t border-default pt-6 text-xs/5 text-dimmed">
    <p class="font-medium text-muted">
      Where the comparison comes from
    </p>
    <p class="mt-1">
      Each product's cells come from these pages, read in {{ COMPARISON_AS_OF }}.
    </p>
    <ul class="mt-2 space-y-1">
      <li
        v-for="product in products"
        :key="product.id"
      >
        <span class="mr-1 font-medium text-muted">{{ product.name }}:</span>
        <span
          v-for="source in product.sources"
          :key="source.url"
          class="after:content-[',_'] last:after:content-none"
        >
          <a
            :href="source.url"
            target="_blank"
            rel="noopener"
            class="underline underline-offset-2 hover:text-default"
          >{{ product.name }} › {{ source.label }}</a>
        </span>
      </li>
    </ul>
  </div>
</template>
