<script setup lang="ts">
import type { ComparisonValue } from '~/utils/comparison'
import { COMPARISON_PRODUCTS, COMPARISON_ROWS } from '~/utils/comparison'

// The CWA comparison table. With no props it shows every row and product, each cell with its note.
// `compact` shows the marks only (the note is the cell's title), for the home page summary.
const props = withDefaults(defineProps<{
  rows?: string[]
  products?: string[]
  compact?: boolean
}>(), {
  rows: undefined,
  products: undefined,
  compact: false
})

const products = computed(() => props.products
  ? COMPARISON_PRODUCTS.filter(product => props.products!.includes(product.id))
  : COMPARISON_PRODUCTS)
const rows = computed(() => props.rows
  ? COMPARISON_ROWS.filter(row => props.rows!.includes(row.id))
  : COMPARISON_ROWS)

const MARKS: Record<Exclude<ComparisonValue, 'text'>, { icon: string, label: string, class: string }> = {
  yes: { icon: 'i-heroicons-check-circle-solid', label: 'Yes', class: 'text-primary' },
  partly: { icon: 'i-heroicons-minus-circle', label: 'Partly', class: 'text-warning' },
  no: { icon: 'i-heroicons-x-circle', label: 'No', class: 'text-muted' },
  paid: { icon: 'i-heroicons-banknotes', label: 'Paid plan', class: 'text-warning' },
  planned: { icon: 'i-heroicons-clock', label: 'Planned', class: 'text-info' },
  unknown: { icon: 'i-heroicons-question-mark-circle', label: 'Not checked', class: 'text-dimmed' }
}

// Whether the table is wider than its box, and whether columns are still hidden on the right.
const scroller = useTemplateRef<HTMLElement>('scroller')
const overflows = ref(false)
const moreToRight = ref(false)
function measure() {
  const el = scroller.value
  if (!el) return
  overflows.value = el.scrollWidth > el.clientWidth + 1
  moreToRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}
onMounted(() => {
  measure()
  window.addEventListener('resize', measure, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('resize', measure))

// Only the marks the shown cells use, for the compact table's key.
const legend = computed(() => {
  const used = new Set(rows.value.flatMap(row => products.value.map(product => row.cells[product.id]?.value)))
  return (Object.keys(MARKS) as (keyof typeof MARKS)[]).filter(value => used.has(value)).map(value => MARKS[value])
})
</script>

<template>
  <div :class="compact ? 'w-full min-w-0 max-w-full' : 'not-prose my-8 relative left-1/2 w-[min(calc(100vw-2rem),80rem)] -translate-x-1/2'">
    <div class="relative">
      <div
        ref="scroller"
        class="relative overflow-x-auto rounded-lg border border-default"
        @scroll.passive="measure"
      >
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-default">
              <th
                scope="col"
                class="sticky left-0 z-10 bg-default p-3 text-left font-semibold"
              >
                <span class="sr-only">Feature</span>
              </th>
              <th
                v-for="product in products"
                :key="product.id"
                scope="col"
                class="p-3 text-center font-semibold whitespace-nowrap"
                :class="product.id === 'cwa' ? 'bg-primary/10 text-primary' : ''"
              >
                {{ product.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.id"
              class="border-b border-default last:border-b-0"
            >
              <th
                scope="row"
                class="sticky left-0 z-10 bg-default p-3 text-left font-medium align-top"
                :class="compact ? 'min-w-48' : 'min-w-56'"
              >
                {{ row.label }}
              </th>
              <td
                v-for="product in products"
                :key="product.id"
                class="p-3 align-top"
                :class="[product.id === 'cwa' ? 'bg-primary/10' : '', compact ? 'text-center' : 'min-w-44']"
              >
                <template v-if="row.cells[product.id]?.value === 'text'">
                  <span class="text-muted">{{ row.cells[product.id]?.note }}</span>
                </template>
                <template v-else-if="row.cells[product.id]">
                  <span
                    class="inline-flex items-center gap-1.5 font-medium"
                    :class="MARKS[row.cells[product.id]!.value as Exclude<ComparisonValue, 'text'>].class"
                    :title="compact ? row.cells[product.id]!.note : undefined"
                  >
                    <UIcon
                      :name="MARKS[row.cells[product.id]!.value as Exclude<ComparisonValue, 'text'>].icon"
                      class="size-5 shrink-0"
                    />
                    <span :class="compact ? 'sr-only' : ''">{{ MARKS[row.cells[product.id]!.value as Exclude<ComparisonValue, 'text'>].label }}</span>
                    <span
                      v-if="compact"
                      class="sr-only"
                    >: {{ row.cells[product.id]!.note }}</span>
                  </span>
                  <p
                    v-if="!compact"
                    class="mt-1 text-muted"
                  >
                    {{ row.cells[product.id]!.note }}
                  </p>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="moreToRight"
        class="pointer-events-none absolute inset-y-px right-px w-16 rounded-r-lg bg-linear-to-l from-default to-transparent"
        aria-hidden="true"
      />
    </div>
    <p
      v-if="!compact && overflows"
      class="mt-2 flex items-center gap-1.5 text-sm text-muted"
    >
      <UIcon
        name="i-heroicons-arrows-right-left"
        class="size-4"
      />
      Scroll the table sideways to see all {{ products.length - 1 }} products.
    </p>
    <ul
      v-if="compact"
      class="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted"
      aria-label="Key"
    >
      <li
        v-for="mark in legend"
        :key="mark.label"
        class="inline-flex items-center gap-1.5"
      >
        <UIcon
          :name="mark.icon"
          class="size-4"
          :class="mark.class"
        />
        {{ mark.label }}
      </li>
    </ul>
  </div>
</template>
