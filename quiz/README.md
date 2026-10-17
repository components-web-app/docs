# The docs quiz bank

The questions for `/quiz` live here, as YAML. You don't need to read any app code to write one.
[DESIGN.md](./DESIGN.md) explains why everything is the way it is.

| Path | What it holds |
|---|---|
| `bank/handwritten/<level>/<area>.yml` | Questions people write. |
| `bank/generated/*.yml` | Questions the generators write. Don't edit the questions; edit the catalogues. |
| `catalogue/mistakes.yml` | Realistic mistakes for spot-the-mistake questions. |
| `catalogue/line-targets.yml` | Lines to find for pick-the-line questions. |
| `catalogue/glossary.yml` | Levels and tags for the glossary questions. |
| `config.yml` | Levels, pass marks, rank titles, areas and tags. |
| `bank.lock.json` | Every published id with its versions. Written by `pnpm quiz:lock`. |

Levels are `beginner`, `intermediate`, `advanced` and `expert`. Areas are `core-concepts`, `api`,
`nuxt-module` and `deployment`.

## Commands

| Command | What it does |
|---|---|
| `pnpm quiz:check` | Runs every check. Fix every `ERROR`; a `warn` needs a look. `--strict` makes warnings errors. CI adds `--drift-warn`, which keeps source drift (lines that moved or changed in another repo) a warning, so it never fails an unrelated pull request. |
| `pnpm quiz:stamp <id…>` | Fills in or refreshes a question's hashes, after you have checked it against its source. `--all-stale` does every question. Never changes the question's text. |
| `pnpm quiz:generate` | Runs the generators and rewrites `bank/generated/`. Keeps ids. |
| `pnpm quiz:sample --level advanced --seed k3j9x2ab` | Prints the quiz a seed gives, with no answers. `--answers` adds the answer key after it; `--key-only` prints only the key; `--json` for a machine. |
| `pnpm quiz:diversity` | How much two quizzes overlap, and how many families each level has. |
| `pnpm quiz:lock` | Records the approved ids and versions in `bank.lock.json`. Run it when a pull request's questions are approved. |
| `pnpm quiz:no-llm` | After `pnpm generate`: checks the site and the lockfile hold no LLM SDK or endpoint. |

The scripts need Node 22.18 or later. Expert questions read the source repos from local clones next to
this repo (`../api-components-bundle`, `../cwa-nuxt-3-module`, `../components-web-app`), or from the paths in
`CWA_BUNDLE_DIR`, `CWA_MODULE_DIR` and `CWA_TEMPLATE_DIR`. Without a clone they read raw GitHub; set
`QUIZ_OFFLINE=1` to stop that.

## Writing a question

1. Find the docs section that states the fact. Open the page and copy its URL path and heading anchor.
2. Add the question to `bank/handwritten/<level>/<area>.yml`, with `sectionHash: 'sha256:0000000000000000'`
   (and `blockHash` the same, for code) as a placeholder.
3. Run `pnpm quiz:stamp <id>`, then `pnpm quiz:check`.
4. Ask someone else to review it. They add `reviewed: { by: <name>, version: <version> }`.

Every hand-written question from intermediate up needs a `why`: one sentence on when the fact matters
in practice, such as the bug it explains or the setting it tells you to change. It's shown after the
answer, under the explanation. If the question is about a recent change, add `since` with the release
that brought it in, so it joins the What's new quiz (see below).

### Multiple choice

```yaml
  - id: api.routes.redirect-status        # names the topic, never the answer
    version: 1
    status: live                          # draft | live | retired
    level: intermediate
    area: api
    tags: [routes]                        # 1 to 4 tags from config.yml
    type: multiple-choice
    difficulty: 3                         # your guess, 1 to 5, within the level
    prompt: A visitor opens a route that redirects. Which status does the module's route middleware send?
    why: >-                               # intermediate and up: when this matters in practice
      Redirect codes decide whether browsers and search engines remember the move and keep the method.
    options:                              # 3 to 5. The ids stay; the order is shuffled for each reader
      - { id: a, text: '`301`' }
      - { id: b, text: '`302`' }
      - { id: c, text: '`308`' }
      - { id: d, text: '`307`' }
    answer:
      correct: c
      explanation: >-                     # 1 to 3 short sentences
        The middleware issues a `308` to the route's `redirectPath`.
      optionNotes:                        # optional: shown when a reader picks that wrong option
        a: …
    sources:                              # 1 to 3. The first is the "Read more" link
      - { kind: docs, page: /api/routes, anchor: redirects, sectionHash: 'sha256:…' }
    author: your-name
```

### Pick the line

The code must be a run of lines copied from one docs code block (without `// [!code …]` annotations).
You may trim lines from the start and the end. `block` counts the code blocks in the section from 0,
including blocks in its child sections and in callouts.

```yaml
    type: pick-the-line
    prompt: Which line marks where the page's content renders inside this layout?
    code:
      lang: vue
      text: |-
        <template>
            <main>
                <slot />
            </main>
        </template>
    answer:
      lines: [3]                          # every line that fairly counts, 1-based
      explanation: …
    sources:
      - { kind: docs, page: /nuxt-module/building-your-ui/creating-layouts, anchor: minimal-layout,
          sectionHash: 'sha256:…', block: 0, blockHash: 'sha256:…' }
```

### Spot the mistake

The same as pick the line, but change exactly one line. `fix` is the original line, exactly as it is in
the code (indentation included).

```yaml
    type: spot-the-mistake
    prompt: One line in this code is wrong. Click it.
    code: { lang: php, text: … }
    answer:
      line: 7
      fix: $queryBuilder->andWhere($orX);
      explanation: …
```

### Expert questions

Expert questions come from the source of the bundle, the module or the template, and test how they work
inside. They cite a `kind: code` source pinned to a full commit SHA on the tracked branch (bundle `main`,
module `dev`, template `main`), and say how well the docs cover the behaviour:

```yaml
    docsCoverage: undocumented            # undocumented | light | documented
    sources:
      - { kind: code, repo: cwa-nuxt-module, path: src/runtime/route-middleware.ts, lines: [95, 105],
          commit: ccc7bbcd145adda34f45b0e137c2bad945e89316, linesHash: 'sha256:0000000000000000' }
```

Code shown in an expert question is the pinned lines with their common indentation removed (or, for spot
the mistake, those lines with one changed). `pnpm quiz:stamp` hashes them, and re-pins the source to the
branch's newest commit when the same lines are still there.

### YAML traps

- Quote any text that has a `: `, starts with a backtick or `*`, or (inside `{ … }`) has a comma. Double a
  `'` inside single quotes:

  ```yaml
  - { id: a, text: 'It keeps `/events/2024`, and nothing redirects to it' }
  - { id: b, text: 'You don''t: the `app` container runs it' }
  ```
- Links in a prompt or explanation need the page path, `[Routes](/api/routes#redirects)`, never `(#redirects)`.

## Use CWA's terms

A question is only fair if the reader knows what it's asking about. Name things by the terms in the
[glossary](/core-concepts/glossary), the same way every time:

| Say | Not |
|---|---|
| component group (or group, once it's clear) | region, area, section, zone, container |
| component position (or position) | slot, spot, place |
| component | block, widget, item, element |
| page template (the Vue file) / template page (the record) | template, on its own |
| page data (record) | article, post, item, entry, unless the question is about a real example such as a blog article |
| layout, page, route | shell, screen, URL, when the record is meant |

- **Say what a term means the first time a beginner or intermediate question uses it**, when it isn't
  `layout`, `page` or `component`: "a component group (the named list of components a page template shows,
  such as `main`)". Advanced and expert questions can assume the glossary.
- **Ask one thing, plainly.** Lead with the situation, then the question: "An editor adds a Quote to the
  `main` component group of a template page. Which records show it?" not "Where does it appear?".
- **Name the record, not just the screen.** "The page data record's route", not "the article's URL".
- **Code words stay code.** Vue's `<slot />`, Cloudflare's zone and similar terms from other tools are fine
  when they mean that tool's thing.

`quiz:check` warns when a prompt, option, explanation or `why` says "region", or "slot" outside Vue's
slots *(check)*.

## Writing fair questions

These rules are for every question, generated or not. `pnpm quiz:check` tests the ones marked *(check)*.

- **One defensible answer.** A developer who knows the fact gets it right without guessing what you meant.
  If two options are right in some setup, rewrite or drop the question.
- **No trick questions.** No negative prompts ("Which is NOT…") *(check: warns on "not" or "except" in a
  prompt)*, no "all of the above" or "none of the above" *(check)*, no options that differ only in
  punctuation *(check)*.
- **No cues in the options.** Options are about the same length and the same grammar. The right one must
  not be the longest by a clear margin *(check: warns when it is over 1.5× the median of the others)*.
  Across the bank, spread the right answer over `a` to `e` *(check: reports the spread)*.
- **Nothing tied to a release number** in a prompt or answer, unless the prompt names that release.
- **Spot the mistake:** exactly one line is wrong. Trimming a block must not leave something else that looks
  wrong, such as an unclosed brace or a variable used before the shown lines define it *(check: warns on
  unbalanced brackets)*.
- **Pick the line:** every line that a reader could fairly call "the line that does X" is in `answer.lines`
  *(check: errors when the answer line appears twice)*.
- **Read the answer from the source, not from memory.** The docs page or the pinned source lines must say it.
  Docs that are wrong get fixed before the question goes live.
- **A person other than the author reviews every question**, including one an LLM drafted. The hashes prove
  where a question came from, not that its answer is right.

## Ids, versions and families

- **Ids are forever.** Lower-case words joined by `.` or `-`. An id names the topic, never the answer:
  `nuxt.admin.is-editing`, not `nuxt.admin.is-editing-plain-boolean`. Never reuse one.
- **Bump `version`** when the prompt's meaning, the options, the code or the answer changes. A typo in the
  explanation doesn't need one. `quiz:check` errors when a locked question changes without a bump.
- **Retire, never delete.** Set `status: retired` and `retired: { reason: … }`. The reason starts with one of
  `stale-source`, `ambiguous`, `wrong`, `poor-stats`, `over-exposed`, `leaked`, `superseded`.
- **`family`** groups questions that test the same fact, and a quiz shows at most one of them. Generated
  questions get `mistake:<id>`, `target:<id>` or `term:<code>`. A hand-written question on the same fact as a
  catalogue entry uses that entry's family, such as `mistake:cwa-disabled-false`.

## What's new and versions

`since` says which release brought in the behaviour a question tests, one entry per repo involved:

```yaml
    since:
      - { repo: api-components-bundle, version: 2.0.0-alpha.22 }
      - { repo: cwa-nuxt-module, version: 2.0.0-alpha.17, unreleased: true }  # on dev after alpha.17
```

Find the version with `git tag --contains <commit> --sort=v:refname | head -1` in the source repo. Store it
without a leading `v`. A question joins the What's new quiz while its version is one of the repo's three
newest in the bank (`whatsNew.releases` in `config.yml`), so writing questions for a new release moves What's
new on by itself. When an unreleased change ships, `quiz:check` warns; set the release's version and drop
`unreleased`.

When a question stops being true because the behaviour changed, retire it with
`retired: { reason: superseded … }` and add `until` with the first release that changed it. Exams for older
versions can still use it.

## Stale questions

When a docs section changes, every question citing it is reported as stale. Read the new section. If the
question still holds, `pnpm quiz:stamp <id>`. If not, fix it and bump its version, or retire it. When source
lines move or change on the tracked branch, expert questions are reported the same way.

## Adding a catalogue entry

A mistake entry (`catalogue/mistakes.yml`) has a regex `match` and a `replace`. The generator finds docs
code blocks where `match` hits exactly one line, changes that line, and writes a question. Each entry must
be wrong for a reason the docs state; point `readMore` at that section. Use `exclude` to skip a block where
the change would be valid, or obvious from a comment. Run `pnpm quiz:generate` and read every new question
in the diff before you open the pull request.
