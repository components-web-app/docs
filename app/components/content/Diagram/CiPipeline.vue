<template>
  <DiagramChart :definition="definition" />
</template>

<script setup lang="ts">
const definition = `flowchart LR
  Build["Build<br/>docker buildx"] --> Test["Test<br/>PHPUnit + Behat"]
  Test -->|all branches| Review["Review App<br/>per-branch K8s"]
  Test -->|main only| Staging["Staging<br/>auto on merge"]
  Staging --> Canary["Canary<br/>manual"]
  Canary --> Production["Production<br/>manual"]`
</script>
