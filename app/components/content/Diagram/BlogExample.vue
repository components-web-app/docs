<template>
  <DiagramChart :options="options" />
</template>

<script setup lang="ts">
import type Highcharts from 'highcharts'
import { diagramBase, diagramChart, diagramSeries, nodeColor } from '~/utils/diagram'

const options: Highcharts.Options = {
  ...diagramBase,
  chart: { ...diagramChart, height: 500 },
  series: [{
    type: 'organization',
    ...diagramSeries,
    data: [
      { from: 'route', to: 'blogarticle' },
      { from: 'blogarticle', to: 'blogtemplate' },
      { from: 'blogtemplate', to: 'componentgroup' },
      { from: 'componentgroup', to: 'componentposition' },
    ],
    nodes: [
      { id: 'route',             name: 'Route',             ...nodeColor.stone },
      { id: 'blogarticle',       name: 'BlogArticle',       ...nodeColor.violet, description: 'PageData — carries title, body, htmlContent' },
      { id: 'blogtemplate',      name: 'BlogTemplate',      ...nodeColor.blue,   description: 'Page — isTemplate: true, shared across all articles' },
      { id: 'componentgroup',    name: 'ComponentGroup',    ...nodeColor.stone },
      { id: 'componentposition', name: 'ComponentPosition', ...nodeColor.stone,  description: "pageDataProperty: 'htmlContent' — resolves BlogArticle's component at render time" },
    ],
  }],
}
</script>
