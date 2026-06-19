<template>
  <DiagramChart :options="options" />
</template>

<script setup lang="ts">
import type Highcharts from 'highcharts'
import { diagramBase, diagramChart, diagramSeries, nodeColor } from '~/utils/diagram'

const options: Highcharts.Options = {
  ...diagramBase,
  chart: { ...diagramChart, height: 580 },
  series: [{
    type: 'organization',
    ...diagramSeries,
    keys: ['from', 'to'],
    data: [
      ['build',   'test'],
      ['test',    'review'],
      ['test',    'staging'],
      ['staging', 'canary'],
      ['canary',  'production'],
    ],
    nodes: [
      { id: 'build',      name: 'Build',       ...nodeColor.stone, description: 'docker buildx' },
      { id: 'test',       name: 'Test',        ...nodeColor.stone, description: 'PHPUnit + Behat' },
      { id: 'review',     name: 'Review App',  ...nodeColor.blue,  description: 'per-branch — all branches' },
      { id: 'staging',    name: 'Staging',     ...nodeColor.blue,  description: 'auto on merge to main' },
      { id: 'canary',     name: 'Canary',      ...nodeColor.blue,  description: 'manual promotion' },
      { id: 'production', name: 'Production',  ...nodeColor.blue,  description: 'manual promotion' },
    ],
  }],
}
</script>
