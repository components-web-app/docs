# CWA Docs - Claude Context

## ⚑ Priority: Track changes from other CWA projects for documentation

Whenever work is done in the other CWA projects, a summary is logged below under **Pending Documentation Review**. Before starting any docs work, scan that section and decide whether each change warrants new or updated documentation.

Source projects and their local paths:
- **API bundle** (`api-components-bundle`) — `/Users/danielwest/Documents/GitHub/_CWA/api-components-bundle`
- **Nuxt module** (`@cwa/nuxt`) — `/Users/danielwest/Documents/GitHub/_CWA/cwa-nuxt-3-module`

If a change is documented, move it to **Documented** below. If it is intentionally not documented (internal, not user-facing), mark it **Skipped** with a reason.

---

## Pending Documentation Review

### API bundle — 2026-06-19

| Change | Commit | Needs docs? |
|---|---|---|
| **Filter `componentPositions` by `allowedComponents`** — non-allowed component positions hidden from API response; components kept in DB for template-switch reversibility | `c6964304` | Maybe — security behaviour worth noting in component group docs |
| **Route path auto-prefixed with `/`** — `Route::setPath()` prepends `/` if missing; no error thrown, path just works | `da82d8e1` | No — transparent normalisation, nothing for users to know |
| **Security docs (#132, #133, #134)** — topics to cover: securing component collections via Doctrine extension, custom route security logic, `routable_security` config | — | Yes — `content/4.api/9.users-and-security.md` or new security section |
| **`user:create` default role correction** — command creates `ROLE_USER` by default (NOT `ROLE_SUPER_ADMIN`). `--admin` flag → `ROLE_ADMIN`, `--super-admin` flag → `ROLE_SUPER_ADMIN`. `content/4.api/4.users-and-security.md` line 244 currently says "created with `ROLE_SUPER_ADMIN` by default" — **this is wrong and must be corrected**. | `8a495b16` | **Yes — fix incorrect claim in users-and-security.md** |

### Nuxt module (`@cwa/nuxt`) — 2026-06-19

| Change | Needs docs? |
|---|---|
| **Auto-fallback `<CwaPage />`** (Step 10, pending) — once implemented, `CwaPage.vue` auto-appends a child `<CwaPage />` if the template omits one and a child depth exists; new `autoFallback` prop | Yes — update `creating-page-templates.md` `<CwaPage />` section once shipped |
| **Mercure null safety fixes** — `getPublishedResourceState` missing `?.` before `.publishable` caused TypeError on delete events; `isMessageForCurrentResource` null guard added; `isCwaResourceSame` strips `@context` to prevent false-positive 'content outdated' notices | No — internal bug fixes |
| **Route slug fixes** (#209 #210) — suffix `.trim()` before path assembly; `slugify` strict mode strips dots/punctuation | No — internal bug fix |
| **OutdatedContentNotice on add/delete fix (#198)** — `saveResource` (non-`isNew` path) was unconditionally calling `initResource({ isCurrent: true })`, adding every CRUD-saved IRI to `current.currentIds`. Mercure notifications for those IRIs then passed `isMessageForCurrentResource` and triggered the notice. Fix: only set `isCurrent: true` when the IRI was already in `currentIds` before save. The fetch path is unaffected — it adds to `currentIds` via `setResourceFetchStatus` before `saveResource` is called. | No — internal bug fix |

---

## Documented

### Nuxt module (`@cwa/nuxt`) — 2026-06-18

| Change | Documented in |
|---|---|
| **Nested sub-pages / `<CwaPage />`** — depth-aware rendering, `cwa-page-depth` / `cwa-page-own-depth` provide/inject | `content/5.nuxt-module/3.creating-page-templates.md` — full `<CwaPage />` section |
| **`pageIriAtDepth()` / `pageDataIriAtDepth()` no-arg form** — injects `cwa-page-own-depth` automatically | `content/5.nuxt-module/3.creating-page-templates.md` + `content/5.nuxt-module/10.cwa-api.md` |
| **`pageAtDepth()` / `pageDataAtDepth()`** — convenience wrappers | `content/5.nuxt-module/10.cwa-api.md` — Nested Pages section |
| **`depthCount`** — computed depth level count | `content/5.nuxt-module/10.cwa-api.md` + breadcrumb pattern in `3.creating-page-templates.md` |
| **`cwa-page-data-iri` inject key** — ComputedRef<string\|undefined> from `<CwaPage />` | `content/5.nuxt-module/3.creating-page-templates.md` + `10.cwa-api.md` |
| **`resource_iris: string[][]` manifest format** | `content/4.api/3.dynamic-pages.md` — manifest section |
| **Race condition fixes** | Skipped — internal |

### API bundle — 2026-06-18

| Change | Documented in |
|---|---|
| **Nested sub-pages** — `parentPage`/`parentPageData` on `AbstractPage`; depth-grouped manifest | `content/4.api/3.dynamic-pages.md` — Nested Pages section |
| **Cascade child path update** — `cascadeChildPaths: true` on PATCH route | `content/4.api/3.dynamic-pages.md` — Cascading Route Changes section |
| **Route children endpoint** — `GET /_/routes/{id}/children` | `content/4.api/3.dynamic-pages.md` — Fetching a Route's Children section |
| **CwaFixtureBuilder scaffold tools** (`AbstractCwaScaffold`, builders, fluent API) | `content/4.api/5.data-fixtures.md` (written in prior session) |
| **`locationReference` on groups** | `content/4.api/5.data-fixtures.md` |
| **`component()` on CwaFixtureBuilder** | `content/4.api/5.data-fixtures.md` |
| **Auto-tag `AbstractCwaScaffold` subclasses** | `content/4.api/5.data-fixtures.md` |

## Skipped

*(nothing)*

---

## Project Overview
Nuxt docs site migrating from `@nuxt/ui-pro` v1 + Nuxt 3 + `@nuxt/content` v2 → `@nuxt/ui` v4 + Nuxt 4 + `@nuxt/content` v3.

**Active branch**: `feature/nuxt-ui-v4-migration`
**Dev server**: `http://localhost:3003` (run `pnpm run dev --port 3003`)
**Visual tests**: `npx playwright test tests/pages.spec.ts --grep "home - visual" --reporter=list`
**Update snapshot**: `PLAYWRIGHT_UPDATE_SNAPSHOTS=1 npx playwright test tests/pages.spec.ts --grep "home - visual"`

## Rules
- NEVER add `Co-Authored-By` to git commits
- Visual test snapshot threshold: `maxDiffPixelRatio: 0.02`

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
If you see "no such table: _content_docs": `rm -rf .nuxt && pnpm run dev --port 3003`

### Tailwind v4 changes
- `text-*` classes no longer include line-height — elements inherit from `html { line-height: 1.5 }`
- Don't add `leading-*` overrides to app.config unless specifically needed for a component

### V1 → V4 size differences (key reference)
| Component | V1 defaults | V4 defaults |
|-----------|-------------|-------------|
| UPageHero container | `py-8 sm:py-16, gap-8 sm:gap-y-16` | `py-24 sm:py-32 lg:py-40, gap-16 sm:gap-y-24` |
| UPageHero title | `text-3xl sm:text-4xl lg:text-5xl` | `text-5xl sm:text-7xl` |
| UPageCard icon | `w-8 h-8` (v1 ULandingCard) | `size-5` |
| UPage layout | `lg:gap-8` | `lg:gap-10` |
| Header nav links | `gap-x-8` | `gap-1.5` |
| Header nav link weight | `font-semibold` | `font-medium` |
| FAQ trigger | `text-lg py-6` | `text-sm py-3.5` |
| Warning color | `color="orange"` | needs `color="orange"` explicitly |

All fixed via `app.config.ts` `slots` overrides + per-component `:ui` props.

## Migration Issues Backlog

### Global / App-wide
- [ ] **Typography text colors darker**: v1 `tailwind.config.ts` had `colors: { gray: { 400: colors.gray['300'] } }` making text-gray-400 lighter. v4 uses standard zinc palette which is darker.
- [x] **Code syntax highlighting**: Migrated to Comark (`@comark/nuxt`), removes @nuxtjs/mdc API route dependency.
- [x] **Dark mode button**: Changed to `UColorModeSwitch` in `AppHeader.vue`.
- [x] **Desktop nav icons**: Stripped via `linksWithoutIcons` computed in AppHeader.
- [x] **Mobile nav search**: Shows only on docs pages via `isDocsPage` computed.
- [x] **Spotlight on page cards**: Fixed by adding `spotlight: true` to the YAML props.

### Home Page
- [ ] **HomeContributors looks wrong**: Spacing/sizing differences remain
- [x] **HomeCode UTabs height**: `:ui="{ list: 'h-16' }"` applied
- [ ] **Home page visual snapshot**: Target 5697px

### About Page
- [x] **Docker and Kubernetes logos**: Added `@source "../../../content/**/*.yml"` in main.css
- [x] **Grid columns**: Fixed to 2-column via `:ui` override
- [x] **imageFirstMobile**: Fixed via `ui.wrapper = 'order-last lg:order-none'`
- [ ] **Font sizes/spacing**: App.config overrides reduce UPageHero title/padding

### Built-for-Business Page
- [x] **Hero alignment**: Added `orientation="horizontal"` explicitly
- [x] **Grid columns**: Fixed to 2-column via `:ui` override
- [x] **FAQ accordion**: Fixed via `:ui` trigger/label overrides
- [ ] **"Built with teamwork in mind" text/margins**: App.config reduces UPageHero sizes

### Docs Pages
- [x] **Warning notice color**: Changed `color="orange"` (v1 value) in `[...slug].vue`
- [x] **Docs layout gap**: `page.slots.root: 'lg:gap-8'` in app.config
- [x] **Search button collapsed**: Added `:collapsed="false"` in docs.vue
- [ ] **Search button styling**: May still differ from v1's input style
- [ ] **TOC padding**: May differ from v1

## CWA API Scaffold Tools

The API bundle (`/Users/danielwest/Documents/GitHub/_CWA/api-components-bundle`) ships a fluent fixture builder for scaffolding CWA site structure in Doctrine fixtures. Documentation for this feature belongs in `content/4.api/`.

### Entry points

| Class | Namespace | Role |
|---|---|---|
| `AbstractCwaScaffold` | `Silverback\ApiComponentsBundle\Fixture` | Abstract base class; implements `FixtureInterface`. Register as a service and extend with `build(CwaFixtureBuilder $cwa): void`. |
| `CwaFixtureBuilder` | `Silverback\ApiComponentsBundle\Fixture` | Fluent builder injected into `AbstractCwaScaffold`. All scaffold methods live here. |

### Builder API

```php
// Layout — creates a Layout entity (deduped by ref)
$cwa->layout(string $ref, string $uiComponent): LayoutBuilder

// Page — creates a Page entity (deduped by ref)
$cwa->page(string $ref, string $uiComponent, string $layout, ?string $route, ?string $routeName, bool $isTemplate, ?\Closure $configure): PageBuilder

// PageData — wraps an AbstractPageData instance
$cwa->pageData(AbstractPageData $pageData, ?string $template, ?string $route, ?string $routeName, ?\Closure $configure): PageDataBuilder

// Component — wraps an AbstractComponent instance (deduped by object identity); persists in phase 1
$cwa->component(AbstractComponent $component): ComponentBuilder

// Named route lookup (only valid after flush())
$cwa->getRoute(string $routeName): Route

// Explicit persist (for app-specific entities not managed by the builder)
$cwa->persist(object $entity): static

// Trigger all phases (phases 1–3 run once; phase 4 runs on every call)
$cwa->flush(): void
```

### Sub-builder APIs

**`LayoutBuilder`** — returned by `$cwa->layout()`
```php
->group(string $name, array $allow = [], ?\Closure $configure = null, ?string $locationReference = null): GroupBuilder
```

**`PageBuilder`** — returned by `$cwa->page()`
```php
->title(string): self
->metaDescription(string): self
->group(string $name, ?\Closure $configure = null, ?string $locationReference = null): GroupBuilder
->nested(\Closure $configure): void   // Closure receives CwaFixtureBuilder with parent context
->getRoute(): ?Route                  // available after flush()
```

**`PageDataBuilder`** — returned by `$cwa->pageData()`
```php
->nested(\Closure $configure): void
->onRoutesCreated(\Closure $cb): self // Closure receives array<PageBuilder> of child page builders; fires after child routes exist
->getRoute(): ?Route
```

**`ComponentBuilder`** — returned by `$cwa->component()`
```php
->group(string $name, array $allow = [], ?\Closure $configure = null, ?string $locationReference = null): GroupBuilder
```

**`GroupBuilder`** — returned by any `->group()` call
```php
->add(AbstractComponent $component, ?int $sort = null): self
->pageDataPosition(string $propertyName, ?int $sort = null): self  // creates a slot resolved from PageData at render time
```

### `locationReference` — stable group references

By default, `ComponentGroup.reference = "{groupName}_{ownerIri}"`. If `locationReference` is set, `reference = "{groupName}_{locationReference}"` (stable across environments). Two builders sharing the same `locationReference` produce **one** `ComponentGroup` entity linked to both owners — useful for a nav group that appears in multiple layouts.

The front-end `<CwaComponentGroup>` component matches by `fullReference = "{reference}_{locationReference || location}"`, so `locationReference` on the Vue component must match what was used in the scaffold.

### Internal flush ordering

1. **Phase 1** — persist layouts, pages, pageData, components (registered via `->component()`); create all component groups; `flush()`
2. **evaluateNested** — evaluate `->nested()` closures; persist new nested entities; `flush()` if any added
3. **Phase 3** — call `RouteGenerator::create()` for all auto-routed entities in parent-before-child order; `flush()`
4. **phaseThreePointFive** — fire `onRoutesCreated` callbacks; `flush()` if any registered
5. **Phase 4** — create `ComponentPosition` entities for all group builders (layout, page, component); `flush()` if any created. Runs on every `flush()` call so nav links added after routes exist are picked up.

### Route auto-generation rules

| Situation | Result |
|---|---|
| `route: '/path'` explicit | creates Route with that path; optionally named `routeName:` |
| no `route:` + `isTemplate: true` | no Route |
| no `route:` on a Page | `RouteGenerator::create()` from title slug |
| `->pageData()` inside `->nested()`, no route | `RouteGenerator` called → `/parent-path/slug` |
| no `route:`, no title, top-level | no Route (draft) |

## Component Migration Map (v1 → v4)
- `ULandingSection` → `UPageSection` (v1 used `align` prop; v4 uses `orientation` + `reverse`)
- `ULandingCard` → `UPageCard` (`color: 'gray'` → `color: 'neutral'`)
- `ULandingGrid` → `UPageGrid`
- `ULandingCTA` → `UPageCTA` (v1 had `:card="false"`; v4 use `variant="naked"`)
- `ULandingLogos` → `UPageLogos`
- `ULandingHero` → `UPageHero`
- `UAside` → `UPageAside`
- `UNavigationTree` → `UContentNavigation`
- `UDivider` → `USeparator`
- `UColorModeToggle` → `UColorModeSwitch`
- `<MDC :value="..." />` → `<Comark>{{ value }}</Comark>` OR `v-html` for HTML content
- UTabs: slot `#item` → `#content`
- UHeader: v1 `:links` prop → v4 `UNavigationMenu :items`
