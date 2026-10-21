# Documentation versions

The docs come in versions ("channels"), like Symfony's and API Platform's. Each channel is one git
branch of this repo, built and deployed on its own by Vercel. A switcher in the header links across
them. Issue: [docs #289](https://github.com/components-web-app/docs/issues/289).

| Channel | Branch | Documents | Served at |
|---------|--------|-----------|-----------|
| **edge** | `main` | The source repos' development branches: bundle `main`, module `dev`, template `main` | `cwa.rocks` until latest is live, then `edge.cwa.rocks` |
| **latest** | `latest` | The newest template release, and the bundle and module versions it pins | `cwa.rocks` |
| **2.0, 2.1, …** (from 2.0.0) | `2.0`, `2.1`, … | One release line each, kept to look back | `<line>.cwa.rocks` (to decide) |

## The config

`shared/docs-versions.ts` is the only place channels are named: id, kind, label, branch, URL,
`live`, and the source versions each documents. Everything else reads it:

- `nuxt.config.ts` picks this build's channel: `NUXT_PUBLIC_DOCS_CHANNEL` if set, else the branch
  Vercel is building (`VERCEL_GIT_COMMIT_REF`) matched against each channel's `branch`, else edge. So
  `main` builds edge and `latest` builds latest with no env var. An unknown id fails the build.
- The **primary channel** is latest once its `live` is true, and edge until then. Only the primary
  channel is served at `cwa.rocks` and indexed. The others get `<meta name="robots" content="noindex, follow">`,
  an empty sitemap, no `Sitemap:` line in `robots.txt`, and canonical URLs on their own origin.
- `site.url` (OG images), canonical URLs, `llms.txt` and `llms-full.txt` use the channel's origin.
  With more than one live channel, the llms files say which version they describe.
- "Edit this page" opens the file on the channel's branch.
- `/api/docs-version.json` lists the channel, the channel list built in, and every page path. The
  switcher fetches the target version's copy (cross-origin; `vercel.json` allows it) and keeps the
  reader on the same page when the target has it, otherwise it opens the target's `/getting-started`.
  A version that isn't primary also reads the channel list from `cwa.rocks`, so an old version's
  switcher shows versions cut after it.
- The switcher is hidden while only one channel is live, and the edge and old-version notices
  appear only once latest is live. So with only edge, the site looks and behaves as before.

Keep `shared/docs-versions.ts` the same on every live branch: change it on `main` and carry the
commit to the other branches.

## Turning latest on (once)

1. On `main`, check the `latest` entry: `label` and `sources` match the newest template release
   (Releases › Versions and support has the bundle and module it pins).
2. Create `latest` from the docs commit that matches that release: the last commit before the first
   "On `main` after template <release>" change. Bring in the site code from `main` that the
   content doesn't depend on (at least the versioning commits) with `git cherry-pick`.
3. On `latest`, follow "Cutting a release" steps 3 to 5.
4. Set `live: true` on the latest entry, on `latest` **and** on `main`, in the same push.
5. In Vercel: make `latest` the production branch, and give `main` the domain `edge.cwa.rocks`
   (see "What Vercel needs").

## Cutting a release (each new template release)

The template and `create-cwa` share one version, and each template release pins a bundle and a
module version. A docs release follows a template release.

1. On `main`, turn the release's markers into release links as now: every "On `main` after template
   X" for a change in the new release becomes `*Since [template Y](…/releases/tag/vY)*`, and the
   What's new quiz questions move to the release's file (quiz/README.md › What's new and versions).
2. Update the `latest` entry in `shared/docs-versions.ts` (`label`, `sources`) on `main`.
3. **Before 2.0.0:** make `latest`'s files match that commit of `main`, as a new commit (no force
   push, and history stays):

   ```sh
   git checkout latest
   git rm -rq . && git checkout <commit> -- . && git commit -m "latest: docs as of <commit> (template <release>)"
   ```

   Don't `git merge` here: what the last cut removed from `latest` would stay removed even though
   it's in this release. Nothing on `latest` is lost, because every fix was made on `main` first.
   Then, on `latest`, remove what documents changes that aren't in the release: any section still
   marked "On `main` after …", and, for the bundle and module, anything after the versions the
   release pins.
   **From 2.0.0:** a new minor gets its own branch. Create `2.N` from the commit that matches the
   release, add a `2.N` entry (`kind: 'archive'`, `branch: '2.N'`, its URL, `live: true`) on `main`,
   and point `latest` at it as above. When the next minor comes, the previous line stays as its
   `2.N` branch and deployment.
4. The quiz on a release branch: questions with `unreleased: true` test behaviour the release
   doesn't have. Set them to `status: draft` on that branch only. Run `pnpm quiz:check --strict --drift-warn`;
   drift against the source repos' development branches is expected there and stays a warning. Run
   `pnpm quiz:lock` if the check asks for it.
5. `pnpm generate`, the internal link check, and `npx playwright test tests/quiz.spec.ts`, then push.

## Fixes between branches

Work as now: document a change on `main` when it lands in the source repo (CLAUDE.md › Docs track
`dev`/`main`). A fix that is also true of a release (a wrong claim, a typo, a broken link, site code):

1. Commit it on `main` first, on its own, with no unreleased content in the same commit.
2. `git cherry-pick -x <commit>` onto `latest`, and onto each `2.N` branch it applies to.
   Fix conflicts by keeping the release branch's wording around the fix.
3. Never merge `main` into a release branch, and never merge a release branch into `main`.

Markers stay as they are on every branch: `*Since [template 2.0.0-alpha.N](…)*` is true on every
version that has the change, and "On `main` after …" only exists on `main`.

## What Vercel needs

Vercel's GitHub integration builds every pushed branch. Nothing in the repo needs a token.

- **Production branch:** `main` today. When latest is turned on: `latest`.
- **Domains:** `cwa.rocks` on the production branch. `edge.cwa.rocks` assigned to the `main`
  branch (Project › Settings › Domains › Add, then pick the branch). Later, one domain per release
  line assigned to its branch.
- **DNS:** a CNAME for each subdomain (`edge`, later one per release line) to `cname.vercel-dns.com`,
  or whatever Vercel shows when the domain is added.
- **Environment variables:** none needed, because the branch name picks the channel. To build a
  branch as another channel (a preview of a release branch, say), set `NUXT_PUBLIC_DOCS_CHANNEL` on
  that branch's Preview environment.
- **System environment variables** must stay exposed (Vercel's default), so the build sees
  `VERCEL_GIT_COMMIT_REF`.
