<template>
  <DiagramChart :options="options" />
</template>

<script setup lang="ts">
import type Highcharts from 'highcharts'
import { diagramBase, diagramChart, diagramSeries, nodeColor } from '~/utils/diagram'

const options: Highcharts.Options = {
  ...diagramBase,
  chart: { ...diagramChart, height: 400 },
  series: [{
    type: 'organization',
    ...diagramSeries,
    keys: ['from', 'to'],
    data: [
      ['eventlist', 'cwapage'],
      ['cwapage',   'eventdata'],
      ['eventdata', 'eventdetail'],
    ],
    nodes: [
      { id: 'eventlist',   name: 'EventList',   ...nodeColor.blue,   description: 'Page — /events' },
      { id: 'cwapage',     name: '<CwaPage />',  ...nodeColor.stone,  description: 'renders the child page at this depth' },
      { id: 'eventdata',   name: 'EventData',    ...nodeColor.violet, description: 'PageData — /events/2024-conference' },
      { id: 'eventdetail', name: 'EventDetail',  ...nodeColor.blue,   description: 'Page — isTemplate: true' },
    ],
  }],
}
</script>
