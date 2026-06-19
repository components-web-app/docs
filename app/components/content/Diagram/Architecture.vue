<template>
  <DiagramChart :options="options" />
</template>

<script setup lang="ts">
import type Highcharts from 'highcharts'
import { diagramBase, diagramChart, diagramSeries, nodeColor } from '~/utils/diagram'

const options: Highcharts.Options = {
  ...diagramBase,
  chart: { ...diagramChart, inverted: false, height: 220 },
  series: [{
    type: 'organization',
    ...diagramSeries,
    nodeWidth: 100,
    keys: ['from', 'to'],
    data: [
      ['backend', 'frontend'],
    ],
    nodes: [
      {
        id: 'backend',
        name: 'Backend',
        ...nodeColor.stone,
        description: 'Your entities & PageData\n+ API Components Bundle\n+ API Platform / Symfony',
      },
      {
        id: 'frontend',
        name: 'Frontend',
        ...nodeColor.blue,
        description: 'Your Vue UI templates\n+ @cwa/nuxt module\n+ Nuxt / Vue / Pinia',
      },
    ],
  }],
}
</script>
