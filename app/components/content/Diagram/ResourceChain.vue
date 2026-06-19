<template>
  <DiagramChart :definition="definition" />
</template>

<script setup lang="ts">
const definition = `flowchart TD
  URL(["URL"]) --> Route[Route]
  Route -->|static| Page[Page]
  Route -->|dynamic| PD[PageData]
  PD -->|page field| Page
  Page --> Layout[Layout]
  Page --> CG[ComponentGroup]
  CG --> CP[ComponentPosition]
  CP --> C[Component]

  style Route    fill:#fef9c3,stroke:#ca8a04,color:#713f12
  style PD       fill:#fef9c3,stroke:#ca8a04,color:#713f12
  style Layout   fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
  style Page     fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
  style CG       fill:#f1f5f9,stroke:#94a3b8,color:#334155
  style CP       fill:#f1f5f9,stroke:#94a3b8,color:#334155
  style C        fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a`
</script>
