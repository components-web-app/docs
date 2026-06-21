# CWA Docs - Claude Context

## Daniel made these notes on a plane.
- Comments like "The location must be one of either a layout, page or component IRI." should be highlighted as a key point.
- Added "Class names are intentionally restricted and defined by the developer and designer to prevent unintentional style drifts when passed to clients." Perhaps useful to note this
- Some of these comments I'm making as key points in the getting started section to help onboard developers but we need to make sure what I wrote was clear and is also in the specific documentation for the feature/property
- It may be a nice feature whereby we can automatically apply classnames defined to the root html entity of a component/page etc. Resource with a uiTrait. But we would need this to be configured to be able to be disabled
- "Create the Layout in the API" we should introduce the idea of the structure of the CWA before this. Explaining what we have as opinionated resources in the API and then which parts the user is defining. Nice graphs/visuals.
- When talking about the Fixture scaffold tool, we can say it's easy to reset data for feature branches or to initialise a new app when they first deploy it for a client as well.
- An idea for a tool - PHP command which can create fixtures from the currently populated database. We could also have tools then which find component groups that aren't actually used, and other orphaned data. That could be a bit difficult to do and maybe needs a combined effort with npx scripts to figure out which locations and references are still in use in the front-end application. This is important and easy enough for orphaned components. We can also add an admin page for server maintenance - application maintence. Discuss if we could potentially clean up data in a more automtaed way, or migrate components with the front end when we change a component group reference
- Also worth discussing how we change component names, a command could be useful which can create migrations to update discriminator mapping?
- i want consistent reliable structures for information. If we are addressing both how to populate an internal resource like we do here /guides/your-first-page-template#create-a-page-record - we should be uniform in the layout getting started too. These initial docs bring a few ideas and parts of the system together into a single page. Clear headers like in layout page are good, Clear sections on how to create, either via the admin or via the fixtures.
- We are talking about page templates here /guides/your-first-page-template#template-pages-for-dynamic-content before we have introduced the idea of static and dynamic pages and the blue and yellow colouring. The admin signifies static as blue, dynamic page templates as yellow and data pages as green.
- The getting started guides should be intentionally simplified introductions, introducing each concept to build up a developer's knowledge. They need to feel like they are learning, interested and achieving wonderful things. Let's look at Behaviour Driven approach with Com-B and WPP marketing styles of behaviour approach so we can really engage new users to onboard. Think up ideas and how we can excite this specific market of web developers, agencies who would want to use it, designers as well - this isn't really a customer/client facing docs. But the main part of the website could entice a prospective client to get a developer to check it out.
- We need to work on adding the visuals for each of the website sections, so we visualise the layout, page, admin tab etc. We have some of this in the main website. But we need to document where these would be, add placeholders for them explaining the image that needs adding as we go through and populate these docs.
- In code blocks, where we are homing in on one idea but are showing context with a bigger block of text, use the ablity to focus on lines like we do on /about page.
- Maybe videos we could add of trying things when we give steps, add placeholders for this.
- File structure summary can be prettier visuals. Like http://localhost:3001/guides/your-first-component#file-structure-summary and multiple admin tabs, should just look nicer and break the text heavy pages up a bit.
- Your first component links to something that wsa a guide before in the simple section and now is more detailed. We should link there.
- http://localhost:3001/guides/alternative-ui-variants#conditional-rendering-based-on-style - not recommended, prone to maintainability issues when class names could change. If we want a different HTML structure, use a new UI, if it's just styles use classes.
- Getting started can also describe the alternative component types briefly too. Getting started for Alt UI and style classes is a big long. Getting started should be simple intros, the detailed information should come later and be linked to from the simpler information.
- I usually introduce people to the CWA with a simple idea of us abstracting out a data structure. Every website needs a layout, the area with header and footer, when you click those headers and footers we get pages, so every website needs pages, and within those pages and layout we needs areas for UI/visual items to go, we call the items the components, and the areas they will display component groups. The developer is responsible for creating the visual layout and the data structure for the websites is set, but the developer just decides how they look and the individual components data structure and visuals that go into it. By making it a predictable layout we can then provide powerful features out of the box, such as X Y and Z, and idempotent small cachable requests for a decoupled website etc. and only loading data we need for each page, reusing data wherever we can. And so CWA is born. But you can be more elegant and user friendly introcuding with diagrams and visuals.

## ⚑ Priority: Track changes from other CWA projects for documentation

Whenever work is done in the other CWA projects, a summary is logged below under **Pending Documentation Review**. Before starting any docs work, scan that section and decide whether each change warrants new or updated documentation.

Source projects and their local paths:
- **API bundle** (`api-components-bundle`) — `/Users/danielwest/Documents/GitHub/_CWA/api-components-bundle`
- **Nuxt module** (`@cwa/nuxt`) — `/Users/danielwest/Documents/GitHub/_CWA/cwa-nuxt-3-module`

If a change is documented, move it to **Documented** below. If it is intentionally not documented (internal, not user-facing), mark it **Skipped** with a reason.

---

## Pending Documentation Review

*(none)*

---

## Documented

*(see git history for full log)*

- 2026-06-20 | @cwa/nuxt | Collection cross-entry validation clearing fix + Nuxt UI `:value-key`/`:label-key` requirement + `displayErrors` validating guard — documented in `5.nuxt-module/7.component-helpers/5.forms.md`: added `label-key="label"` to all choice components, added `value-key`+`label-key` to `USelectMenu`, updated Validation internals section.
- 2026-06-20 | @cwa/nuxt | Collection entry realtime validation + label fixes — updated `5.nuxt-module/7.component-helpers/5.forms.md` CollectionType callout and entry component layout (button inside `UFormField` with `flex items-center`).
- 2026-06-20 | @cwa/nuxt | RoutesTab forward-redirect fixes — **Skipped**: internal normalisation (`redirectIri` computed) and UI polish; admin panel docs already describe forward-redirect behaviour at user level. No developer-facing config change.
- 2026-06-20 | api-components-bundle | Form submit `@id` fix now uses IriConverter (`7ceddfdc`) — **Skipped**: internal refactor, same user-facing behaviour.
- 2026-06-20 | api-components-bundle | `make:cwa-scaffold` maker (`ecfc8dee`) — documented in `4.api/7.console-commands.md` under Maker Commands.

- 2026-06-20 | @cwa/nuxt | Checkbox unchecked value is `null` — updated `5.nuxt-module/7.component-helpers/5.forms.md` checkbox pattern (setter now `v ? '1' : null`).
- 2026-06-20 | @cwa/nuxt | `useCwaFormRepeated` three bug fixes (duplicate entry, already documented in previous commit) — **Skipped**: already covered.
- 2026-06-20 | @cwa/nuxt | `forms.ts` ChoiceType and multi-select fixes (duplicate entry, already documented) — **Skipped**: already covered.
- 2026-06-20 | @cwa/nuxt | Form component renamed `Form` → `ExampleForm` — **Skipped**: docs use generic example names (`ContactForm.vue`), no `Form/Form.vue` or `CwaComponentForm` references in docs.

- 2026-06-20 | api-components-bundle | Fix form submit `@id` (`fcef2c6f`) — documented in `4.api/2.components/3.built-ins/2.form-component.md` Submission Endpoint section.
- 2026-06-20 | @cwa/nuxt | `useCwaFormRepeated` both-blurred gate (`3877dbc8`) — documented in `6.composables/1.component/6.use-cwa-form-repeated.md` under Error display gate.
- 2026-06-20 | @cwa/nuxt | Per-field validation response normalisation (`c20e6074`) — documented in `5.nuxt-module/7.component-helpers/5.forms.md` under Validation internals.
- 2026-06-20 | @cwa/nuxt | `forms.ts` ChoiceType `full_name` fixes (expanded radio / multi-select `[]` strip) — documented in `5.nuxt-module/7.component-helpers/5.forms.md` under `full_name` convention.
- 2026-06-20 | @cwa/nuxt | `useCwaFormRepeated` three bug fixes (no `__FAKE__`, `valid` reads parent node, pair-mismatch redirect) — updated `6.composables/1.component/6.use-cwa-form-repeated.md`.
- 2026-06-20 | @cwa/nuxt | Playground collection entry components (`FormChildEntry.vue`, `FormTextEntry.vue`) — label fallback note added to `5.nuxt-module/7.component-helpers/5.forms.md` CollectionType section.

- 2026-06-20 | api-components-bundle | Fix `RouteNormalizer` entity mutation (`d8da04f4`) — **Skipped**: internal serializer bug fix, no user-facing change.
- 2026-06-20 | @cwa/nuxt | Route redirect admin UI (`RoutesTabView`, `RoutesTabForwardTo`) — documented in `3.core-concepts/7.admin-panel.md` under Managing Routes.
- 2026-06-20 | @cwa/nuxt | Form composable bug fixes: checkbox getter now `!!field.value.value`; validation endpoint corrected to `{iri}/submit` — updated `5.nuxt-module/7.component-helpers/5.forms.md` checkbox pattern.
- 2026-06-20 | api-components-bundle | Form `/submit` endpoint and security (`FormViewFactory` sets `vars.action`) — documented in `4.api/2.components/3.built-ins/2.form-component.md` under Submission Endpoint.

- 2026-06-20 | @cwa/nuxt | Form composables (#172 steps 1–5): `useCwaFormRepeated`, `useCwaFormCollection`, `unregisteredFieldErrors` on `useCwaForm` — documented in new `5.nuxt-module/7.component-helpers/5.forms.md` (guide with all field types), new `6.composables/1.component/6.use-cwa-form-repeated.md`, new `6.composables/1.component/7.use-cwa-form-collection.md`, and updated `6.composables/1.component/4.use-cwa-form.md`.

- 2026-06-19 | api-components-bundle | #170: `allowedComponents` read-side enforcement — `ComponentPosition` entries of disallowed types are now omitted from the API response. Documented in `5.nuxt-module/4.cwa-components/1.cwa-component-group.md` under Allowed Components.
- 2026-06-19 | api-components-bundle | #86: Stable `silverback.api_components.*` service IDs — documented in `4.api/6.configuration.md` under Services You Can Override.

- 2026-06-19 | api-components-bundle | Fix #178: `routable_security` now also applies to POST (create) for Page/PageData — documented in `4.api/4.users-and-security.md` under `routable_security`.
- 2026-06-19 | api-components-bundle | `ComponentGroup.allowedComponents` in Layout:read/Page:read — documented in `5.nuxt-module/4.cwa-components/1.cwa-component-group.md`.
- 2026-06-19 | api-components-bundle | PropagateUpdatesListener cache purge (#167) — **Skipped**: internal HTTP cache optimization, not user-facing configuration.
- 2026-06-19 | api-components-bundle | Fix #129: Mercure double-publish guard — **Skipped**: internal bug fix, Mercure already documented.
- 2026-06-19 | api-components-bundle | Fix #163/#159: Removed `fileExists()` check in `MediaObjectFactory` — **Skipped**: internal perf fix, no user-facing config change.
- 2026-06-19 | api-components-bundle | Fix #181: Doctrine proxy class name in `allowedComponents` IRI check — **Skipped**: internal bug fix.
- 2026-06-19 | api-components-bundle | Fix #182: `initializeObject()` before publishable field read (PHP 8.4 lazy ghost) — **Skipped**: internal bug fix.
- 2026-06-19 | api-components-bundle | `_metadata.publishable.locationCount` (`b438d60d`) — documented in `4.api/2.components/2.annotations/1.publishable.md` under API Response Metadata.
- 2026-06-19 | api-components-bundle | `ComponentPosition` sort collision fix (`b438d60d`) — **Skipped**: internal behaviour fix, no user-facing config change.
- 2026-06-19 | api-components-bundle | `locationCount` extended to include PageData property usages (`65de12f1`) — updated description in `4.api/2.components/2.annotations/1.publishable.md`.
- 2026-06-20 | api-components-bundle | `pageDataClass` required on `ComponentPosition` alongside `pageDataProperty`; `pageDataPosition()` signature updated (`c09c7bb9`) — documented in `4.api/3.dynamic-pages.md`, `4.api/5.data-fixtures.md`, and `3.core-concepts/4.dynamic-pages.md`.
- 2026-06-20 | @cwa/nuxt | `cwa.pageData[TypeName].properties` config key (`4d35130b`) — documented in `5.nuxt-module/2.configuration/1.nuxt-config.md`.
- 2026-06-20 | @cwa/nuxt | Admin two-step position picker for `pageDataClass`/`pageDataProperty` (`4d35130b`) — **Skipped**: admin UI behaviour, no developer configuration change.
- 2026-06-20 | @cwa/nuxt | Two families of page/pageData getters on `$cwa.resources` — documented in `5.nuxt-module/5.cwa-api.md` under `cwa.resources`.
- 2026-06-20 | api-components-bundle | `make:api-component` Maker command (`942c192c`) — documented in `4.api/7.console-commands.md` under Maker Commands.
- 2026-06-20 | @cwa/nuxt | SEO title concatenation for nested pages (leaf-first ` | ` join) and deepest-layer meta description — documented in `4.api/3.dynamic-pages.md` under SEO Titles and Meta Descriptions for Nested Pages.
- 2026-06-20 | api-components-bundle | `#[UploadableField(urlGenerator: 'public'|'temporary')]` with fallback behaviour — documented in `4.api/2.components/2.annotations/2.uploadable.md` under urlGenerator values.
- 2026-06-20 | api-components-bundle | `mercure.secure_subscriptions` config option (`5ec68934`) — documented in `4.api/6.configuration.md` under Mercure Secure Subscriptions.
- 2026-06-20 | api-components-bundle | Symfony profiler CWA panel (`8a7c95cf`) — documented in new `4.api/8.debugging.md`.
- 2026-06-20 | api-components-bundle | Profiler panel four new sections: publishable ORM queries, pageDataProperty resolutions, write invalidation fan-out, private Mercure upgrades (`3797fdd5`) — updated `4.api/8.debugging.md`.
- 2026-06-20 | @cwa/nuxt | Default OG image via `CwaDefault.satori.vue` and nuxt-og-image — documented in `5.nuxt-module/2.configuration/2.site-config-and-seo.md` under Default OG Image.
- 2026-06-20 | @cwa/nuxt | `<CwaLink>` defaults `prefetch: false` — documented in `5.nuxt-module/4.cwa-components/3.cwa-link.md` under Props.
- 2026-06-20 | api-components-bundle | #183: `flush()` idempotency — updated `4.api/5.data-fixtures.md` flush() description, Flush Phases table, and Tips.
- 2026-06-20 | api-components-bundle | #184: `make:page-data` Maker command — documented in `4.api/7.console-commands.md` under Maker Commands.
- 2026-06-20 | api-components-bundle | `HtmlContentPlaceholder` moved into bundle as registered service — updated `4.api/5.data-fixtures.md` Seeding HTML Content section with new namespace and no-config injection pattern.
- 2026-06-20 | @cwa/nuxt | Form composables #172 (`useCwaForm`, `useCwaFormInput`) — new pages in composables section; updated `4.api/2.components/3.built-ins/2.form-component.md` Front-End section.
- 2026-06-20 | api-components-bundle | `HtmlContentPlaceholder` (`Silverback\ApiComponentsBundle\Fixture\Placeholder\HtmlContentPlaceholder`) — moved from `components-web-app` into the bundle (`66b1cfcb`, service registration `c28c8066`). Generates structured placeholder HTML/plaintext for seeding `HtmlContent` entities in fixtures. **Registered as a bundle service** (`silverback.api_components.fixture.html_content_placeholder`) — inject via constructor, no app-side `services.yaml` needed. Options: `paragraphs` (int), `paragraphLength` (short/medium/long), `includeHeadings`, `includeLists`, `includeQuotes`, `includeCode`, `includeLinks` (bool), `format` (html/plaintext). Usage: inject `HtmlContentPlaceholder $placeholder` into your `AbstractCwaScaffold` subclass, then call `$placeholder->generate(['paragraphs' => 3, 'includeHeadings' => true])`. Constants: `FORMAT_HTML`, `FORMAT_PLAINTEXT`, `LENGTH_SHORT`, `LENGTH_MEDIUM`, `LENGTH_LONG`. Document in `4.api/5.data-fixtures.md` under Seeding HTML Content. Also document the `AbstractCwaScaffold` extra-dependency pattern (e.g. injecting `IriConverterInterface` alongside `CwaFixtureBuilder`) and the `Collection.resourceIri` snippet: `$iriConverter->getIriFromResource(SomePageData::class, ABS_PATH, (new GetCollection())->withClass(SomePageData::class))`.
- 2026-06-20 | @cwa/nuxt | `/_/site_config_parameters` single-fetch per SSR request — **Skipped**: internal H3 event context caching, no user-facing configuration change.

---

## Project Overview

Docs site built on Nuxt 4 + `@nuxt/ui` v4 + `@nuxt/content` v3. Migration from v1 stack complete.

**Branch**: `main`
**Dev server**: `pnpm run dev --port 3000`

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
If you see "no such table: _content_docs": `rm -rf .nuxt && pnpm run dev --port 3000`

### Badge frontmatter in docs pages
- Must be declared in `content.config.ts` schema or Nuxt Content v3 strips it at query time
- `UPageHeader` in v4 has no `badge` prop — render via `#headline` slot with `<UBadge>`
- Valid color tokens: `primary`, `secondary`, `success`, `info`, `warning`, `error`, `neutral` (not `amber`)

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
->pageDataPosition(string $pageDataClass, string $propertyName, ?int $sort = null): self  // creates a slot resolved from PageData at render time
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


