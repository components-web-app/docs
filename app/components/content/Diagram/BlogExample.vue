<template>
  <DiagramChart :definition="definition" />
</template>

<script setup lang="ts">
const definition = `flowchart TD
  Route[Route]
  Layout["Layout"]

  subgraph PageDataRecord["BlogArticle — PageData"]
    BA["BlogArticle"]
    HC["htmlContent\n(HtmlContent component)"]
    BA --> HC
  end

  subgraph PageTemplate["BlogTemplate — Page (isTemplate)"]
    BT["BlogTemplate"]
    CG["ComponentGroup"]
    CP["ComponentPosition\npageDataProperty: htmlContent"]
    BT --> CG --> CP
  end

  Route --> BA
  BA -->|"page field"| BT
  BT --> Layout
  HC -.->|"resolves at render time"| CP

  style Route fill:#fafaf9,stroke:#a8a29e,color:#292524
  style Layout fill:#eff6ff,stroke:#60a5fa,color:#1e3a8a
  style BT     fill:#eff6ff,stroke:#60a5fa,color:#1e3a8a
  style CG     fill:#fafaf9,stroke:#a8a29e,color:#292524
  style CP     fill:#fafaf9,stroke:#a8a29e,color:#292524
  style BA     fill:#f5f3ff,stroke:#8b5cf6,color:#2e1065
  style HC     fill:#eff6ff,stroke:#60a5fa,color:#1e3a8a`
</script>
