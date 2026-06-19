import type Highcharts from 'highcharts'

// Colour system: blue = UI (uiComponent), violet = user PHP, stone = CWA structural
export const nodeColor = {
  stone: { color: '#e7e5e4', dataLabels: { color: '#292524' } },
  blue: { color: '#dbeafe', dataLabels: { color: '#1e3a8a' } },
  violet: { color: '#ede9fe', dataLabels: { color: '#2e1065' } },
  neutral: { color: '#f5f5f4', dataLabels: { color: '#44403c' } },
} satisfies Record<string, Partial<Highcharts.SeriesOrganizationDataOptions>>

export const diagramChart = {
  inverted: true,
  animation: { duration: 0 },
} satisfies Highcharts.ChartOptions

export const diagramSeries = {
  colorByPoint: false,
  borderColor: 'transparent',
  nodeWidth: 65,
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '12px',
      fontWeight: '600',
      fontFamily: 'system-ui, sans-serif',
      textOutline: 'none',
    },
  },
} satisfies Partial<Highcharts.SeriesOrganizationOptions>

export const diagramBase = {
  title: { text: undefined },
  credits: { enabled: false },
  tooltip: { enabled: false },
} satisfies Highcharts.Options
