<template>
  <DiagramChart :definition="definition" />
</template>

<script setup lang="ts">
const definition = `flowchart LR
  subgraph YourProject["Your Project"]
    direction LR
    subgraph Backend["Backend"]
      API["Your entities &amp; PageData<br/>+ API Components Bundle<br/>+ API Platform / Symfony"]
    end
    subgraph Frontend["Frontend"]
      MOD["Your Vue UI templates<br/>visual shells for layouts, pages &amp; components<br/>+ @cwa/nuxt module<br/>+ Nuxt / Vue / Pinia"]
    end
    Backend -->|"REST + Mercure"| Frontend
  end`
</script>
