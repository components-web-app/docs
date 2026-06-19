<template>
  <DiagramChart :definition="definition" />
</template>

<script setup lang="ts">
const definition = `flowchart TD
  URL(["/about-us"]) --> Route
  Route --> Page
  Page --> Layout
  Layout --> CG1["ComponentGroup<br/>nav region"]
  CG1 --> CP1[ComponentPosition] --> C1([Component])
  Page --> CG2["ComponentGroup<br/>page content"]
  CG2 --> CP2[ComponentPosition] --> C2([Component])`
</script>
