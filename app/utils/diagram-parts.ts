import { h } from 'vue'

// Small icons for the HTML diagrams in components/content/Diagram/.
// Render functions, not `template:` strings: the site has no runtime compiler.

const svgAttrs = {
  'viewBox': '0 0 20 20',
  'fill': 'none',
  'stroke': 'currentColor',
  'stroke-width': '1.75',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'aria-hidden': 'true'
}

/** An arrow pointing right. Rotate it with a class for other directions. */
export const DiagramArrowIcon = {
  render: () => h('svg', svgAttrs, [
    h('path', { d: 'M3 10h13' }),
    h('path', { d: 'M11.5 5.5 16 10l-4.5 4.5' })
  ])
}

export const DiagramCheckIcon = {
  render: () => h('svg', svgAttrs, [
    h('path', { d: 'm4.5 10.5 3.5 3.5 7.5-8' })
  ])
}

export const DiagramCrossIcon = {
  render: () => h('svg', svgAttrs, [
    h('path', { d: 'm5.5 5.5 9 9' }),
    h('path', { d: 'm14.5 5.5-9 9' })
  ])
}

/**
 * Text with `backtick` spans shown as code. A render function, so the
 * template's whitespace never lands between a code span and the punctuation
 * after it.
 */
export const DiagramCodeText = {
  props: {
    text: { type: String, required: true },
    codeClass: { type: String, default: 'font-mono text-[10.5px]' }
  },
  setup(props: { text: string, codeClass: string }) {
    return () => props.text.split('`').map((part, i) =>
      i % 2 ? h('code', { class: props.codeClass }, part) : part
    )
  }
}
