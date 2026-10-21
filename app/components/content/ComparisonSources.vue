<script setup lang="ts">
import { COMPARISON_AS_OF, COMPARISON_PRODUCTS } from '~/utils/comparison'

// The pages each comparison cell came from, product by product.
const products = COMPARISON_PRODUCTS.filter(product => product.sources.length)
</script>

<template>
  <div>
    <p>Each product's cells come from these pages, read in {{ COMPARISON_AS_OF }}:</p>
    <ul>
      <li
        v-for="product in products"
        :key="product.id"
      >
        <strong>{{ product.name }}:</strong>
        <span
          v-for="source in product.sources"
          :key="source.url"
          class="after:content-[',_'] last:after:content-none"
        >
          <a
            :href="source.url"
            target="_blank"
            rel="noopener"
          >{{ product.name }} › {{ source.label }}</a>
        </span>
      </li>
    </ul>
  </div>
</template>
