<template>
  <DiagramChart :options="options" />
</template>

<script setup lang="ts">
import type Highcharts from 'highcharts'
import { diagramBase, diagramChart, diagramSeries, nodeColor } from '~/utils/diagram'

const options: Highcharts.Options = {
  ...diagramBase,
  chart: { ...diagramChart, height: 620 },
  series: [{
    type: 'organization',
    ...diagramSeries,
    data: [
      { from: 'url', to: 'route' },
      { from: 'route', to: 'page' },
      { from: 'page', to: 'layout' },
      { from: 'page', to: 'componentgroup' },
      { from: 'componentgroup', to: 'componentposition' },
      { from: 'componentposition', to: 'component' },
    ],
    nodes: [
      { id: 'url',               name: 'URL',               ...nodeColor.neutral },
      { id: 'route',             name: 'Route',             ...nodeColor.stone,  description: 'also targets PageData for dynamic pages' },
      { id: 'page',              name: 'Page',              ...nodeColor.blue,   description: 'uiComponent → your Vue template' },
      { id: 'layout',            name: 'Layout',            ...nodeColor.blue,   description: 'uiComponent → your Vue template' },
      { id: 'componentgroup',    name: 'ComponentGroup',    ...nodeColor.stone,  description: 'named region in Layout or Page' },
      { id: 'componentposition', name: 'ComponentPosition', ...nodeColor.stone,  description: 'one ordered slot' },
      { id: 'component',         name: 'Component',         ...nodeColor.blue,   description: 'uiComponent → your Vue template' },
    ],
  }],
}
</script>
