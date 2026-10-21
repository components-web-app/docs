# Documentation versions

The docs come in versions ("channels"), the way Symfony's do. Each channel is one git branch of
this repo, named after what it documents, and built on its own. Every version is served from
`cwa.rocks`, and the path says which one. A switcher in the header moves between them. Issue:
[docs #289](https://github.com/components-web-app/docs/issues/289).

| Channel | Branch | Documents | Served at |
|---------|--------|-----------|-----------|
| **edge** | `main` | The source repos' development branches: bundle `main`, module `dev`, template `main` | `cwa.rocks/` while no release line is live, then `cwa.rocks/edge/` |
| **2.0** | `2.0` | The 2.0 line: each template release from 2.0.0-alpha to 2.0.0 and its patches, and the bundle and module versions it pins | `cwa.rocks/` while it's the newest line |
| **2.1, 2.2, …** | `2.1`, … | One minor each | `cwa.rocks/` while newest, then `cwa.rocks/2.1/` |

The **current** version is the newest live release line, or edge while there's none. It's served
at the root and it's the only one search engines index. Every other version is served under
`/<id>/`.

Until a `2.0` branch is live, the root serves `main` with no switcher and no notice, as it does now.

## How it's served

Each version is a separate Nuxt build, with its path as `app.baseURL` (`/edge/`, `/2.0/`). Links,
assets, `_payload.json`, OG images and the quiz data all carry the path, and each version keeps its
own search index, sitemap, `llms.txt` and quiz bank.

The current version's build is the one on `cwa.rocks`. Its Vercel config (written by
`nuxt.config.ts › nitro.vercel.config.routes`, from `versionRewrites()` in
`shared/docs-versions.ts`) rewrites `/edge/...` and the other versions' paths to each version's
own Vercel deployment, at the `origin` its entry names. The visitor stays on `cwa.rocks`.

One build that reads every branch (a Nuxt Content git source per version) was considered and
rejected. It would multiply the build time by the number of versions, and every branch would have
to use the same site code. Search, the sitemap, the llms files, OG images and the quiz bank would
all need splitting by version by hand. Separate builds get all of that for free.

## The config

`shared/docs-versions.ts` is the only place channels are named: id, kind, label, branch, `origin`,
`live`, and the source versions each documents. Everything else reads it.

- `nuxt.config.ts` picks this build's channel: `NUXT_PUBLIC_DOCS_CHANNEL` if set, else the branch
  Vercel is building (`VERCEL_GIT_COMMIT_REF`) matched against each channel's `branch`, else edge.
  So `main` builds edge and `2.0` builds 2.0 with no env var. An unknown id fails the build. The
  value reaches the app as `runtimeConfig.public.docsVersion` (not `docsChannel`, which the env
  var would override at run time, reading `2.0` as the number 2).
- The current version has no prefix. Every other version gets `<meta name="robots" content="noindex, follow">`,
  a self-canonical under its path, an empty sitemap, and no `Sitemap:` line in its `robots.txt`.
- With more than one live channel, `llms.txt` and `llms-full.txt` say which version they describe.
- "Edit this page" opens the file on the channel's branch.
- `<prefix>/api/docs-version.json` lists the channel, the channel list built in, and every page
  path. The switcher fetches the target version's copy and keeps the reader on the same page (and
  heading) when the target has it, otherwise it opens the target's Getting Started. A version that
  isn't current also reads the channel list from the root, so an old version's switcher shows
  versions cut after it.
- Notices appear on every version that isn't current. Edge says the pages describe unreleased
  changes; an older line says it's an older version. Both link the current version's same page.
  Each can be dismissed, per version.
- The switcher is hidden while only one channel is live.
- The `routeRules` redirects get the path on their target, and a version under a path adds its own
  Vercel routes for them (`vercelRedirects()` in `nuxt.config.ts`). `@nuxt/image` gets an alias so
  `/edge/logo.svg` reads `public/logo.svg`. Head links (favicon, manifest) use `app.baseURL`.

Keep `shared/docs-versions.ts` the same on every live branch: change it on `main` and carry the
commit to the other branches (see [Fixes between branches](#fixes-between-branches)).

## Turning on the 2.0 line (once)

1. On `main`, check the `2.0` entry: `label` and `sources` match the newest template release
   (Releases › Versions and support has the bundle and module it pins). Check that the `edge` entry's
   `origin` is the edge project's public URL (see [What Vercel needs](#what-vercel-needs)).
2. Create `2.0` from the docs commit that matches that release: the last commit before the first
   "On `main` after template <release>" change. Bring in the site code from `main` that the content
   doesn't depend on (at least the versioning commits) with `git cherry-pick -x`.
3. On `2.0`, follow [Moving 2.0 to a new release](#moving-20-to-a-new-release-before-200) steps 3 and 4.
4. Set `live: true` on the `2.0` entry, on `2.0` **and** on `main`, then push both.
5. In Vercel, set up the edge project, then make `2.0` the production branch of the `cwa.rocks`
   project (see [What Vercel needs](#what-vercel-needs)).

From then on `cwa.rocks/` is 2.0 and `cwa.rocks/edge/` is `main`.

## Moving 2.0 to a new release (before 2.0.0)

The template and `create-cwa` share one version, and each template release pins a bundle and a
module version. Before 2.0.0, every template release moves `2.0` forward.

1. On `main`, turn the release's markers into release links as now: every "On `main` after template
   X" for a change in the new release becomes `*Since [template Y](…/releases/tag/vY)*`, and the
   What's new quiz questions move to the release's file (quiz/README.md › What's new and versions).
2. Update the `2.0` entry in `shared/docs-versions.ts` (`label`, `sources`) on `main`.
3. Make `2.0`'s files match that commit of `main`, as a new commit (no force push, and history
   stays):

   ```sh
   git checkout 2.0
   git rm -rq . && git checkout <commit> -- . && git commit -m "2.0: docs as of <commit> (template <release>)"
   ```

   Don't `git merge` here: what the last move removed from `2.0` would stay removed even though it's
   in this release. Nothing on `2.0` is lost, because every fix was made on `main` first. Then, on
   `2.0`, remove what documents changes that aren't in the release: any section still marked "On
   `main` after …", and, for the bundle and module, anything after the versions the release pins.
4. The quiz on a release branch: questions with `unreleased: true` test behaviour the release
   doesn't have. Set them to `status: draft` on that branch only. Run
   `pnpm quiz:check --strict --drift-warn`; drift against the source repos' development branches is
   expected there and stays a warning. Run `pnpm quiz:lock` if the check asks for it.
5. `pnpm generate`, the internal link check, and `npx playwright test tests/quiz.spec.ts`, then push.

From 2.0.0, `2.0` only takes fixes and patch releases (2.0.1, …): cherry-pick, don't move it.

## Cutting a new minor (2.1 and later)

1. On `main`, add a `2.1` entry (`kind: 'release'`, `branch: '2.1'`, `live: false`) and give the
   `2.0` entry an `origin`: the public URL of the project that will serve the old line (below).
2. Create `2.1` from the commit of `main` that matches the release and follow steps 3 to 5 above.
3. In Vercel, create the `2.0` project (as for edge, production branch `2.0`) so `2.0` has its own
   deployment, then make `2.1` the production branch of the `cwa.rocks` project.
4. Set `live: true` on the `2.1` entry, on `main`, `2.0` and `2.1`, and push all three. `2.0` now
   builds under `/2.0/` and is served at `cwa.rocks/2.0/`.

## Fixes between branches

Work as now: document a change on `main` when it lands in the source repo (CLAUDE.md › Docs track
`dev`/`main`). A fix that is also true of a release (a wrong claim, a typo, a broken link, site code,
`shared/docs-versions.ts`):

1. Commit it on `main` first, on its own, with no unreleased content in the same commit.
2. `git cherry-pick -x <commit>` onto each release branch it applies to. Fix conflicts by keeping the
   release branch's wording around the fix.
3. Never merge `main` into a release branch, and never merge a release branch into `main`.

Markers stay as they are on every branch: `*Since [template 2.0.0-alpha.N](…)*` is true on every
version that has the change, and "On `main` after …" only exists on `main`.

## What Vercel needs

Vercel's GitHub integration builds every pushed branch. Nothing in the repo needs a token, and no
environment variables are needed, because the branch picks the channel. System environment
variables must stay exposed (Vercel's default), so the build sees `VERCEL_GIT_COMMIT_REF`.

**Now:** nothing changes. The existing project keeps `cwa.rocks` and production branch `main`.

**When 2.0 is turned on:**

1. Add a second project on the same repo, named for example `cwa-docs-edge`, with production branch
   `main` and the same build settings as the existing project.
2. Make its production URL public. Branch and deployment URLs are behind Vercel's team login, which
   the rewrite from `cwa.rocks` can't pass. Either turn off Vercel Authentication for the project
   (Settings › Deployment Protection) so `https://cwa-docs-edge.vercel.app` is public, or give its
   production branch a domain of its own, such as `edge-origin.cwa.rocks` (a CNAME to what Vercel
   shows), and use that.
3. Put that URL in the `edge` entry's `origin` (`https://cwa-docs-edge.vercel.app` is there now as
   a placeholder) on `main` and `2.0`.
4. In the existing project, change the production branch to `2.0`. `cwa.rocks` then serves `2.0`,
   and its build sends `/edge/...` to the edge project.

Pages are reachable on the edge project's own URL too, with `noindex` and canonical URLs on
`cwa.rocks/edge/`, so search engines don't index both.

**Each later minor:** one more project for the line that stops being current (production branch
`2.0`, a public URL), its URL as that entry's `origin`, and the `cwa.rocks` project's production
branch moved to the new line.

**Previews:** a preview of a branch other than the release lines builds as edge. Once a release line
is current, edge is under `/edge/`, so open `<preview URL>/edge/` (the root of the preview is
empty). Set `NUXT_PUBLIC_DOCS_CHANNEL` on a branch's Preview environment to build it as another
channel.
