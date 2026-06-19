<template>
  <DiagramChart :definition="definition" />
</template>

<script setup lang="ts">
const definition = `flowchart TD
  URL["URL<br/>/blog/my-first-post"]
  Route
  BlogArticle["BlogArticle (PageData)"]
  BlogTemplate["BlogTemplate (Page)"]
  Layout["CwaLayoutPrimary (Layout)"]
  HtmlContent["HtmlContent (Component)"]

  URL --> Route --> BlogArticle
  BlogArticle -->|"page field"| BlogTemplate --> Layout
  BlogArticle -->|"htmlContent field<br/>→ ComponentPosition"| HtmlContent

  style Route        fill:#fafaf9,stroke:#a8a29e,color:#292524
  style BlogArticle  fill:#f5f3ff,stroke:#8b5cf6,color:#2e1065
  style BlogTemplate fill:#eff6ff,stroke:#60a5fa,color:#1e3a8a
  style Layout       fill:#eff6ff,stroke:#60a5fa,color:#1e3a8a
  style HtmlContent  fill:#eff6ff,stroke:#60a5fa,color:#1e3a8a`
</script>
