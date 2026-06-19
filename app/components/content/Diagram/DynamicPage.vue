<template>
  <DiagramChart :options="options" />
</template>

<script setup lang="ts">
import type Highcharts from 'highcharts'
import { diagramBase, diagramChart, diagramSeries, nodeColor } from '~/utils/diagram'

const options: Highcharts.Options = {
  ...diagramBase,
  chart: { ...diagramChart, height: 520 },
  series: [{
    type: 'organization',
    ...diagramSeries,
    nodeWidth: 55,
    data: [
      { from: 'route1', to: 'article1' },
      { from: 'route2', to: 'article2' },
      { from: 'route3', to: 'article3' },
      { from: 'article1', to: 'template' },
      { from: 'article2', to: 'template' },
      { from: 'article3', to: 'template' },
      { from: 'template', to: 'layout' },
    ],
    nodes: [
      { id: 'route1',   name: '/blog/post-1', ...nodeColor.stone },
      { id: 'route2',   name: '/blog/post-2', ...nodeColor.stone },
      { id: 'route3',   name: '/blog/post-3', ...nodeColor.stone },
      { id: 'article1', name: 'BlogArticle #1', ...nodeColor.violet },
      { id: 'article2', name: 'BlogArticle #2', ...nodeColor.violet },
      { id: 'article3', name: 'BlogArticle #3', ...nodeColor.violet },
      { id: 'template', name: 'BlogDetail',     ...nodeColor.blue, description: 'Page — isTemplate: true' },
      { id: 'layout',   name: 'Layout',         ...nodeColor.blue },
    ],
  }],
}
</script>
