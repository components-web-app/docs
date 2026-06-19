<template>
  <DiagramChart :definition="definition" />
</template>

<script setup lang="ts">
const definition = `flowchart LR
  U1["/blog/post-1"] --> P1["BlogArticle #1"]
  U2["/blog/post-2"] --> P2["BlogArticle #2"]
  U3["/blog/post-3"] --> P3["BlogArticle #3"]
  P1 & P2 & P3 --> T["Page (isTemplate)<br/>BlogDetail"]
  T --> L["Layout<br/>Primary"]`
</script>
