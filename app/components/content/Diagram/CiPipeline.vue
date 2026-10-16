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
    data: [
      { from: 'build', to: 'test' },
      { from: 'build', to: 'browser' },
      { from: 'test', to: 'review' },
      { from: 'test', to: 'staging' },
      { from: 'browser', to: 'review' },
      { from: 'browser', to: 'staging' },
      { from: 'staging', to: 'canary' },
      { from: 'canary', to: 'production' },
    ],
    nodes: [
      { id: 'build',      name: 'Build',       ...nodeColor.stone, description: 'docker buildx' },
      { id: 'test',       name: 'Test',        ...nodeColor.stone, description: 'PHPUnit unit + functional' },
      { id: 'browser',    name: 'Browser Tests', ...nodeColor.violet, description: 'Playwright — opt-in' },
      { id: 'review',     name: 'Review App',  ...nodeColor.blue,  description: 'per-branch — all branches' },
      { id: 'staging',    name: 'Staging',     ...nodeColor.blue,  description: 'auto on merge to main' },
      { id: 'canary',     name: 'Canary',      ...nodeColor.blue,  description: 'manual promotion' },
      { id: 'production', name: 'Production',  ...nodeColor.blue,  description: 'manual promotion' },
    ],
  }],
}
</script>
