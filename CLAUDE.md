# CWA Docs - Claude Context

## Docs writing principles

- **Getting started guides = simple introductions.** One concept per guide, minimum viable code, link out to the detailed reference for everything else. Readers should feel like they're learning and building, not reading a reference manual.
- **Don't repeat the intro.** Each guide should build on what the previous page established — not re-explain the same concept.
- **Callouts for key constraints.** Constraints like "location must be a layout, page, or component IRI" belong in a callout, not buried in prose.
- **Image/video placeholders as you go.** Add `::callout{icon="i-heroicons-photo"}` placeholders describing what each image/video should show. This makes visual gaps explicit.
- **Consistent structure per guide.** Each guide: brief framing → the file → register in config → create in API (admin + fixtures) → next step.
- **Code focus.** Use `// [!code focus]` on key lines when showing context-heavy blocks.

## ⚑ Priority: Track changes from other CWA projects for documentation

Whenever work is done in the other CWA projects, a summary is logged below under **Pending Documentation Review**. Before starting any docs work, scan that section and decide whether each change warrants new or updated documentation.

Source projects and their local paths:
- **API bundle** (`api-components-bundle`) — `/Users/danielwest/Documents/GitHub/_CWA/api-components-bundle`
- **Nuxt module** (`@cwa/nuxt`) — `/Users/danielwest/Documents/GitHub/_CWA/cwa-nuxt-3-module`
- **Template app** (`components-web-app`) — `/Users/danielwest/Documents/GitHub/_CWA/components-web-app`

If a change is documented, move it to **Documented** below. If it is intentionally not documented (internal, not user-facing), mark it **Skipped** with a reason.

---

## Pending Documentation Review

### Auto-apply `uiClassNames` to component root element (#243) — 2026-06-26

`useCwaResource` (and `useCwaComponent`) now automatically applies the resource's `uiClassNames` array to the component's root element. Previously every developer had to wire `:class="resource?.data?.uiClassNames"` manually.

**Behaviour:**
- Enabled by default — no code changes needed in existing components
- **Passive detection:** if all target classes are already present on the root element (e.g. the developer has an existing `:class="resource?.data?.uiClassNames"` binding), the feature stays completely passive and does not touch the element
- On style change: removes classes it previously applied, adds the new ones — never touches classes it didn't apply
- Skipped for fragment roots (comment nodes) and detached elements

**Opt-out (per component):**
```ts
// Disable auto-apply; uiClassNames still returned for manual placement
const { resource, exposeMeta, uiClassNames } = useCwaComponent(props, [], { autoClass: false })
```
```html
<!-- Apply manually on an inner element instead of the root -->
<template>
  <div>
    <span :class="uiClassNames">content</span>
  </div>
</template>
```

**`uiClassNames`** is now returned from both `useCwaResource` and `useCwaComponent` as a `ComputedRef<string[] | undefined>`.

**Needs documenting:**
- Component reference page: note that style classes are now applied automatically; document `autoClass: false` opt-out and the `uiClassNames` return value
- Getting started / component guide: remove the `:class="resource?.data?.uiClassNames"` boilerplate step (or note it's no longer required)
- If there's a styles/UI variants guide: update to reflect that classes appear without any extra wiring

---

## Documented

*(see git history for full log)*

---

## Project Overview

Docs site built on Nuxt 4 + `@nuxt/ui` v4 + `@nuxt/content` v3. Migration from v1 stack complete.

**Branch**: `main`
**Dev server**: `pnpm run dev` (port varies — check what's running)

## Rules
- NEVER add `Co-Authored-By` to git commits

## Key Technical Notes

### app.config.ts UI overrides format
Use the `slots` wrapper — direct slot keys at top level cause TS errors:
```ts
ui: {
  pageHero: {
    slots: { container: '...', title: '...' }
  }
}
```

### Comark (replaces @nuxtjs/mdc)
- Module: `@comark/nuxt` (installed, added to nuxt.config.ts modules)
- Component: `<Comark>{{ content }}</Comark>` — content goes in the DEFAULT SLOT not a prop
- HTML content (with `<br>`, `<span>` etc.): use `v-html` instead of Comark
- Syntax highlighting: import `highlight` from `@comark/nuxt/plugins/highlight`, pass via `:plugins="[highlightPlugin]"`
- Theme config: `highlight({ themes: { light: 'github-light', dark: 'github-dark' }, languages: [...] })`
- Docs: https://comark.dev/

### @nuxt/content v3 content refresh
If you see "no such table: _content_docs": `rm -rf .nuxt && pnpm run dev`

### Badge frontmatter in docs pages
- Must be declared in `content.config.ts` schema or Nuxt Content v3 strips it at query time
- `UPageHeader` in v4 has no `badge` prop — render via `#headline` slot with `<UBadge>`
- Valid color tokens: `primary`, `secondary`, `success`, `info`, `warning`, `error`, `neutral` (not `amber`)

### `npx cwa make:component` — what it does and doesn't do
Source: `bin/cwa.mjs` in `cwa-nuxt-3-module`. It **only creates the Vue file** and **prints** the matching `php bin/console make:api-component` command — it does NOT run it. The PHP command must be run manually in the API project. Guide order: npx first (scaffolds Vue + outputs the PHP command to copy), then run that printed command in the API project.

## CWA API Scaffold Tools

Full reference in `content/4.api/5.data-fixtures.md`. Builder entry points: `AbstractCwaScaffold`, `CwaFixtureBuilder`. Sub-builders: `LayoutBuilder`, `PageBuilder`, `PageDataBuilder`, `ComponentBuilder`, `GroupBuilder`.
