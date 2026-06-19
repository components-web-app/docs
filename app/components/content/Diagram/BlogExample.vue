<template>
  <DiagramChart :definition="definition" />
</template>

<script setup lang="ts">
const definition = `flowchart TD
  URL["URL<br/>/blog/my-first-post"]
  Route[Route]
  BA["BlogArticle (PageData)"]
  BT["BlogTemplate (Page)"]
  Layout["CwaLayoutPrimary (Layout)"]
  HC["HtmlContent (Component)"]

  URL --> Route --> BA
  BA -->|"page field"| BT --> Layout
  BA -->|"htmlContent field"| HC

  style Route   fill:#fef9c3,stroke:#ca8a04,color:#713f12
  style BA      fill:#fef9c3,stroke:#ca8a04,color:#713f12
  style BT      fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
  style Layout  fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a
  style HC      fill:#dbeafe,stroke:#3b82f6,color:#1e3a8a`
</script>
