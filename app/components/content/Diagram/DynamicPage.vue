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
    keys: ['from', 'to'],
    data: [
      ['route1',   'article1'],
      ['route2',   'article2'],
      ['route3',   'article3'],
      ['article1', 'template'],
      ['article2', 'template'],
      ['article3', 'template'],
      ['template', 'layout'],
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
