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

### 2026-07-06 — cwa-nuxt-module #250 / api-components-bundle #197: nested per-depth manifest
`GET /_/resource_manifest/{id}`'s `resource_iris` changed from `string[][]` to `NestedJsonStructure[]` — outer array still indexed by rendering depth (root first), but each depth is now a recursive `{ iri, children }` tree preserving component containment (to enable placeholder/skeleton rendering that reduces loader flicker/layout shift). Module migrated: retains the raw tree (`manifest.resourceTree`) and derives the flat `irisByDepth` via a pure `flattenManifestNode` helper — all existing depth/render semantics unchanged, no rendering change yet. Hard swap, no BC window (pre-alpha). **Status:** bundle #197 + module #250 **COMPLETE**; the manifest shape is now settled. Bundle **#198 (extra per-node placeholder metadata) is closed NOT_PLANNED** — the module can build skeletons from the containment tree it already receives, so **no further manifest metadata is coming**. The eventual skeleton/placeholder feature will be **module-side only**, now tracked as **[cwa-nuxt-module #255](https://github.com/components-web-app/cwa-nuxt-module/issues/255)** (raised, **not yet shipped**). Planned user-facing API when it lands: opt-in per-component-type placeholder templates at `app/cwa/components/<Name>/placeholder.vue` (scanned like `admin/`/`ui/`), rendered until the resource resolves, laid out from the `resourceTree` to reserve space (anti-CLS); component type derived from the IRI, no manifest/API metadata. *Docs impact: low, deferred — internal plumbing with no consuming-app surface today. Document the `placeholder.vue` convention when #255 phase 2 ships.*

## Documented

- **2026-07-06 — api-bundle #189 (generate-fixtures) + #195 (seed uploadable files) + #192 (suffix-only builder DX)** → `content/4.api/5.data-fixtures.md`. Added "Seeding Uploadable Files" (`$component->file = new File(...)`) and "Generating Fixtures From an Existing Database" (`silverback:api-components:generate-fixtures`, `-o` option) sections. #192's suffix-only names + variadic `uiClassNames` were **already** current in the guide — no change needed there.
- **2026-07-06 — api-bundle #194 (unique tokenised upload filenames)** → `content/4.api/2.components/2.annotations/2.uploadable.md`. Added a "Stored Filenames" section: `<stem>-<token>.<ext>` naming, UUID for data-URI uploads, non-collision guarantee, and "read `contentUrl`, don't reconstruct the name".
- **2026-07-06 — cwa-nuxt-module #249 / api-bundle #196 (`explicitAllowOnly` opt-in component types)** → `content/5.nuxt-module/4.cwa-components/1.cwa-component-group.md`, new "Opt-in component types (`explicitAllowOnly`)" subsection under Allowed Components. Covers the `#[Silverback\ExplicitAllowOnly]` class attribute, hidden-from-add-dialog + rejected-on-save (direct **and** dynamic paths), the requirement to list flagged types in `allowedComponents`, and the `explicitAllowOnly` Hydra flag. Feature is complete server-side + admin UI; the only open thread is cloning ([nuxt #157](https://github.com/components-web-app/cwa-nuxt-module/issues/157)) — not a docs concern until it ships.
- **api-bundle #191 (`make:rename-component`)** → already documented at `content/4.api/7.console-commands.md` (## make:rename-component). Covers the `dtype` rename, `allowedComponents` JSON update, per-group warning output, and front-end checklist. No action needed.
- **2026-07-06 — components-web-app `useCwaComponent` migration** → verification only, no change. Guide pages (`2.guides/3.your-first-component.md`, `5.nuxt-module/3.building-your-ui/3.creating-components.md`) already teach the canonical `useCwaComponent(props)` idiom; no stale `useCwaResource`/`useCwaImageResource` + `toRef` usage remained. The composable APIs themselves were already documented under `5.nuxt-module/6.composables/`.
- **2026-07-08 — cwa-nuxt-module #247 (CSS isolation styling best practice)** → new page `content/5.nuxt-module/9.cwa-layer/4.styling.md` ("Styling & CSS Isolation"). Explains CWA's cascade-layer design (`@layer theme, base, cwa, components, utilities` → app CSS wins), the unscoped-global-element-selector gotcha (bleeds into the admin UI), and the fix: scope global element styles (content wrapper / `.prose` / your own `@layer` / Tailwind typography). Framed as best practice, not a CWA limitation.
- **2026-07-08 — api-bundle: multiple uploadable files on one resource** → `content/4.api/2.components/2.annotations/2.uploadable.md`, new "Multiple Files on One Resource" section: one `#[UploadableField]` per `File` property with a distinct `property:`, the `property`-defaults-to-`filename` collision warning, auto-mapped storage columns (no `#[ORM\Column]`, no `UploadableTrait`), and per-field `_metadata.mediaObjects`/download-route/multipart-key independence. Cross-linked to the front-end multi-file guides.
- **2026-07-08 — cwa-nuxt-module #251 (`CwaComponentGroup` load/update events)** → `content/5.nuxt-module/4.cwa-components/1.cwa-component-group.md`, new "Events" section: `@components-loaded` / `@components-updated`, the `{ component, position }[]` payload, the temporary-excluded / errored-omitted rules, empty-group case, and own-positions-only scope, with a fade-in/analytics example.
- **2026-07-08 — `#[Silverback\ExplicitAllowOnly]` promoted to the API annotations section** → new page `content/4.api/2.components/2.annotations/4.explicit-allow-only.md` (canonical attribute reference: setup, direct+dynamic enforcement, opting a group in via `allowedComponents`, the Hydra flag). Cross-linked with the module-side `cwa-component-group.md` "Opt-in component types" subsection (which keeps the admin/module angle and now points to the API page).
- **2026-07-08 — cwa-nuxt-module #252 (Image→File API rename + multi-file) + `publishedIri`** → front-end + admin fully re-documented. `withImage`/`useCwaImage`/`useCwaImageResource` removed everywhere; `withFile()` + the `files` map, `useCwaFileField`, and multi-file usage documented. Pages: **renamed** `3.use-cwa-image-resource.md` → `3.use-cwa-file-field.md` (rewritten for `useCwaFileField`); `0.use-cwa-component.md` (`withFile` section, `files` map + merge accumulation, multi-file, **`publishedIri` return row**); `7.component-helpers/1.images-and-uploads.md` (full rewrite to `files` map + admin `v-bind="upload.bind"` + multi-file); `2.admin-manager/3.use-cwa-resource-upload.md` (new `bind` object, `fileDisplayType` default `'File'`, multi-field example); `3.building-your-ui/4.cwa-cli.md` (`File` type / `withFile()`); `3.core-concepts/5.components.md`, `2.uploadable.md` front-end note. Build verified (228 routes, new `use-cwa-file-field` route). The `<CwaImage>` page (`4.cwa-components/4.cwa-image.md`) was **deleted** — it documented a component that doesn't exist in the module (may be built in future; no docs until then).

## Skipped

- **2026-07-08 — cwa-nuxt-module #241 (TipTap bubble/floating menu z-index fix) + #254 (text-selection drag deselect fix)** — both internal admin bug fixes. #241's fix lives in the **app-side** editor (`TipTapHtmlEditor.vue` in the template/playground: TipTap v3 `appendTo`/`options` replacing the ignored `:tippy-options`, plus `z-index: 760`), not the module's public API; the docs don't document TipTap editor setup (only `useHtmlContent` for *rendering* HTML). #254 is inline-editor selection behaviour in `ResourceStackManager`. No consuming-app doc surface either way.
- **2026-07-08 — components-web-app File API migration (`c52b746`)** — template app catching up to the #252 Image→File rename; verification only, the #252 docs already cover the current API. No change (same as the earlier `useCwaComponent` template migration).
- **2026-06-30 — cwa-nuxt-module redirect "flash of blank page" fix** — internal fetcher behaviour (`abortFetch(token,'redirect')`, `FetchAbortReason` on `FetchStatus`). No consuming-app API surface; docs describe route redirects (301s on rename) not fetcher internals, so nothing to update. Diagnostic follow-up [nuxt #245](https://github.com/components-web-app/cwa-nuxt-module/issues/245) (redirects on rapid repeated clicks) is unconfirmed — no docs action until it is.

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
