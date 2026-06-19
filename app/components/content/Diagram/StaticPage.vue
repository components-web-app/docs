<template>
  <DiagramChart :options="options" />
</template>

<script setup lang="ts">
import type Highcharts from 'highcharts'
import { diagramBase, diagramChart, diagramSeries, nodeColor } from '~/utils/diagram'

const options: Highcharts.Options = {
  ...diagramBase,
  chart: { ...diagramChart, height: 340 },
  series: [{
    type: 'organization',
    ...diagramSeries,
    data: [
      { from: 'url', to: 'route' },
      { from: 'route', to: 'page' },
      { from: 'page', to: 'layout' },
    ],
    nodes: [
      { id: 'url',    name: '/about',  ...nodeColor.neutral },
      { id: 'route',  name: 'Route',   ...nodeColor.stone },
      { id: 'page',   name: 'Page',    ...nodeColor.blue, description: 'About — uiComponent: AboutPage' },
      { id: 'layout', name: 'Layout',  ...nodeColor.blue, description: 'uiComponent: PrimaryLayout' },
    ],
  }],
}
</script>
