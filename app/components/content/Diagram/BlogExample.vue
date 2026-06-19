<template>
  <DiagramChart :definition="definition" />
</template>

<script setup lang="ts">
const definition = `flowchart TD
  URL(["/blog/my-first-post"]) --> Route
  Route --> BA["BlogArticle (PageData)"]
  BA --> title["title: My First Post"]
  BA --> hc["htmlContent → HtmlContent component"]
  BA --> BT["BlogTemplate (Page)"]
  BT --> Layout["CwaLayoutPrimary (Layout)"]`
</script>
