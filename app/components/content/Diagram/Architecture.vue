<template>
  <DiagramChart :definition="definition" />
</template>

<script setup lang="ts">
const definition = `flowchart LR
  API["API Bundle<br/>Symfony + API Platform<br/>Your entities &amp; PageData"]
  MOD["Nuxt Module<br/>@cwa/nuxt"]
  APP["Your App<br/>Vue components &amp; templates"]
  API -->|"REST + Mercure"| MOD
  MOD -->|"useCwa() + composables"| APP`
</script>
