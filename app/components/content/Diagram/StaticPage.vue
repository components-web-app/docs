<template>
  <DiagramChart :definition="definition" />
</template>

<script setup lang="ts">
const definition = `flowchart LR
  U["URL<br/>/about"] --> R["Route<br/>/about"]
  R --> P["Page<br/>About"]
  P --> L["Layout<br/>Primary"]`
</script>
