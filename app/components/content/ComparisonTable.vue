<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
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

// The full table compares CWA with three products, each column picked from its own menu, so columns never move:
// changing one changes only that column. Phones show one product column. The server renders the wider view;
// the phone query is read only after mount, so hydration matches before it switches.
const phoneQuery = useMediaQuery('(max-width: 639px)')
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
const isPhone = computed(() => mounted.value && phoneQuery.value)
const slots = ref<string[]>(['wordpress', 'storyblok', 'sanity'])
const visibleSlots = computed(() => slots.value.slice(0, isPhone.value ? 1 : 3))
const choices = COMPARISON_PRODUCTS.filter(product => product.id !== 'cwa').map(product => ({ label: product.name, value: product.id }))
// Picking a product another column already shows swaps the two, so no product appears twice.
function pick(index: number, id: string) {
  const next = [...slots.value]
  const other = next.indexOf(id)
  if (other !== -1) next[other] = next[index]!
  next[index] = id
  slots.value = next
}
const byId = (id: string) => COMPARISON_PRODUCTS.find(product => product.id === id)!

// Each column: the product it shows, and for a picked column, which slot it is.
const columns = computed(() => props.products
  ? COMPARISON_PRODUCTS.filter(product => props.products!.includes(product.id)).map(product => ({ key: product.id, product, slot: undefined as number | undefined }))
  : [
      { key: 'cwa', product: byId('cwa'), slot: undefined as number | undefined },
      ...visibleSlots.value.map((id, slot) => ({ key: `slot-${slot}`, product: byId(id), slot }))
    ])
const shownProducts = computed(() => columns.value.map(column => column.product))
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
watch(visibleSlots, () => nextTick(measure))

// Only the marks the shown cells use, for the compact table's key.
const legend = computed(() => {
  const used = new Set(rows.value.flatMap(row => shownProducts.value.map(product => row.cells[product.id]?.value)))
  return (Object.keys(MARKS) as (keyof typeof MARKS)[]).filter(value => used.has(value)).map(value => MARKS[value])
})
</script>

<template>
  <div :class="compact ? 'w-full min-w-0 max-w-full' : 'not-prose my-8 w-full'">
    <p
      v-if="!compact"
      class="mb-3 flex items-center gap-1.5 text-sm text-muted"
    >
      <UIcon
        name="i-heroicons-chevron-up-down"
        class="size-4"
      />
      {{ isPhone ? 'Pick the product to compare with CWA from the menu in its column.' : 'Pick the products to compare with CWA from the menu in each column.' }}
    </p>
    <div class="relative">
      <div
        ref="scroller"
        class="relative overflow-x-auto rounded-lg border border-default"
        @scroll.passive="measure"
      >
        <table
          class="w-full border-collapse text-sm"
          :class="compact ? '' : (isPhone ? 'table-fixed' : 'table-fixed min-w-[44rem]')"
        >
          <colgroup v-if="!compact">
            <col class="w-22 sm:w-56">
            <col
              v-for="column in columns"
              :key="column.key"
              :class="isPhone && column.slot === undefined ? 'w-24' : ''"
            >
          </colgroup>
          <thead>
            <tr class="border-b border-default">
              <th
                scope="col"
                class="sticky left-0 z-10 bg-default p-3 text-left font-semibold"
              >
                <span class="sr-only">Feature</span>
              </th>
              <th
                v-for="column in columns"
                :key="column.key"
                scope="col"
                class="p-3 font-semibold whitespace-nowrap"
                :class="[column.product.id === 'cwa' ? 'bg-primary/10 text-primary' : '', column.slot === undefined ? 'text-center' : 'text-left']"
              >
                <USelect
                  v-if="column.slot !== undefined"
                  :model-value="column.product.id"
                  :items="choices"
                  :aria-label="`Product in column ${column.slot + 1}`"
                  class="w-full"
                  @update:model-value="(id) => pick(column.slot!, String(id))"
                />
                <template v-else>
                  {{ column.product.name }}
                </template>
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
                :class="compact ? 'min-w-48' : ''"
              >
                {{ row.label }}
              </th>
              <td
                v-for="(product, index) in shownProducts"
                :key="columns[index]!.key"
                class="p-3 align-top"
                :class="[product.id === 'cwa' ? 'bg-primary/10' : '', compact ? 'text-center' : '']"
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
      Scroll the table sideways to see every column.
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
