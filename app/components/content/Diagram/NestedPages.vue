<template>
  <DiagramChart :definition="definition" />
</template>

<script setup lang="ts">
const definition = `flowchart TB
  P0["Page: EventList<br/>/events"]
  CWA["&lt;CwaPage /&gt;"]
  PD["PageData: EventData<br/>/events/2024-conference"]
  P1["Page (isTemplate): EventDetail"]
  P0 --> CWA --> PD --> P1`
</script>
