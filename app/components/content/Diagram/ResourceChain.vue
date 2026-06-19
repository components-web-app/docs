<template>
  <DiagramChart :definition="definition" />
</template>

<script setup lang="ts">
const definition = `flowchart TD
  URL["URL"] --> Route
  Route -->|static| Page
  Route -->|dynamic| PageData
  PageData -->|page field| Page
  Page --> Layout
  Page --> ComponentGroup
  ComponentGroup --> ComponentPosition
  ComponentPosition --> Component

  style Route             fill:#fafaf9,stroke:#a8a29e,color:#292524
  style ComponentGroup    fill:#fafaf9,stroke:#a8a29e,color:#292524
  style ComponentPosition fill:#fafaf9,stroke:#a8a29e,color:#292524
  style Layout            fill:#eff6ff,stroke:#60a5fa,color:#1e3a8a
  style Page              fill:#eff6ff,stroke:#60a5fa,color:#1e3a8a
  style Component         fill:#eff6ff,stroke:#60a5fa,color:#1e3a8a
  style PageData          fill:#f5f3ff,stroke:#8b5cf6,color:#2e1065`
</script>
