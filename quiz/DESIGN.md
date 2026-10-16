# Docs quiz: design (v1)

## In short

The quiz at `/quiz` is plain data and code: no LLM is called anywhere. This page explains how it works
and how a future exam that places candidate developers in levels would reuse it.

- **Questions are YAML** in `quiz/bank/`, written by people or made by deterministic generators from the
  docs' code blocks and the catalogues in `quiz/catalogue/`. Each question cites the docs section it
  comes from, with a hash, or for expert questions a source file's lines at a pinned commit.
  `pnpm quiz:check` flags anything stale or unverifiable.
- **Questions and answers are split at build time.** `splitQuestion()` writes a questions file and a
  keys file per level. The page selects and shows questions through a `QuizSource`, and only the grader
  reads keys, through `grade()`. An exam swaps both for server-backed ones: questions as opaque tokens,
  keys never in the browser, the same `gradeAgainstKey()` on the server.
- **Stable ids and versions.** An id never changes or comes back; a change of meaning bumps the version;
  `quiz/bank.lock.json` records every published `(id, version)`, and `quiz:check --strict` fails when the
  bank and the lock disagree. Retired questions stay, so old responses still point at them.
- **Levels and pass marks** are in `quiz/config.yml`. v1 records a level as passed only on a first
  attempt at a full quiz on Everything. Placement climbs the levels while the candidate passes.
- **Exposure:** a quiz shows one question per `family` (one fact), each family has one draw's worth of
  chance whatever its number of variants, and `exposure.weight` lowers an over-shown one. An exam adds
  `maxRate`, exclusion of families already seen, and per-area blueprints.
- **Calibration:** `difficulty` is the author's guess; `calibration` (tied to a version) and `cutRating`
  hold values fitted from response data later. Only reviewed questions (`reviewed.version` equal to
  `version`, by a named person) may enter an exam bank.

Sections 1 to 10 describe the build. Section 11 is the path to an exam, and section 15 lists what is
left to do. Sections 2 and 13 are the original build plan for two developers, kept for history.

---

## Build plan

This is the plan for the quiz at `/quiz`. Two developers build it in parallel: one on the **runtime**
(pages, components, server routes) and one on the **bank pipeline** (scripts, generators, catalogues,
the question bank). The shared contract is already written:

| File | What it is |
|---|---|
| `quiz/schema.ts` | Zod schemas and types for questions, catalogues and config. Also `splitQuestion()`, `gradeAgainstKey()` and `sourceLink()`. |
| `quiz/lib/select.ts` | Seeded selection and option shuffling. The page and the scripts both use it, so a seed gives the same quiz everywhere. |
| `quiz/lib/hash.ts` | Text normalising and provenance hashes (Node only). |
| `quiz/config.yml` | Levels, pass marks, result titles, areas and tags. |
| `quiz/catalogue/mistakes.yml` | The mistake catalogue (one seed entry). |
| `quiz/bank/**` | Three example questions, one per type. |

Neither developer changes these files without telling the other. If a change is needed, make it in
one small commit that both pick up.

### Schema changes during build

Made by the bank pipeline developer, from the exam-readiness review (section 14). All additive except
`reviewedBy` (no question used it yet) and `GradeResult`.

- `GradeResult` has `status: 'graded' | 'ungraded'`, `correct: boolean | null` (null when ungraded)
  and an optional `key`. `gradeAgainstKey()` returns `ungraded` on a version mismatch. **Runtime:** leave
  ungraded answers out of the score, and read `key` with `?.`.
- `QuestionDisplay` (the fields a UI may read) and `ExamItem` (`QuestionDisplay` plus `token`) types.
  UI components take `QuestionDisplay`.
- `calibration` gains `version` (required when any value is set; the schema errors when it isn't the
  question's version), `model` (`rasch | 2pl | 3pl`) and `guessing`.
- `reviewed: { by, version }` replaces `reviewedBy`. Optional `cutRating` (0 to 1).
- The `QuestionId` example is now `nuxt.admin.is-editing`.
- `renderQuestion()` in `quiz/lib/` is the runtime developer's (section 14, "Runtime").

Made in the fix round after the review:

- **`quiz/core.ts`** holds the zod-free half of the contract: the vocabulary (`LEVELS`, `AREAS`, …),
  `PublicQuestion`, `AnswerKey`, `QuestionDisplay`, `ExamItem`, `QuizResponse`, `QuizAnswer`,
  `GradeResult`, `QuizGrader`, `gradeAgainstKey()` and `quizLengthFor()`. `schema.ts` re-exports it.
  The pages import values from `core.ts`, so zod no longer reaches the browser.
- `AnswerKey` has `tags`, so the result screen takes tags from the grade, not from the question.
- `QuizGrader.grade()` takes a `QuizResponse`: `{ ref, optionId }` or `{ ref, line }`. `ref` is opaque
  to the UI (v1: `<id>@<version>`; an exam: a token). The grader resolves it to a `QuizAnswer`.
- Config: `minTopicFamilies` (a topic is offered at a level only with this many families) and an
  optional per-level `quizLength` (expert is 8 while its bank is small).
- Catalogue entries take an optional `family`, and glossary terms too, so a generated question can
  share a family with a hand-written one on the same fact.
- Retirement reasons gain `too-easy`.

Made by the runtime developer:

- `splitQuestion()` copies `options` and `code` field by field instead of passing the parsed objects
  through. Same output. The Nuxt app type-checks `schema.ts` without `strictNullChecks`, where zod
  infers every property as optional, so the old spread failed `pnpm typecheck`. Keep it this way.
- New runtime file `quiz/lib/render.ts`: `renderQuestion()`, `renderKey()` and the types the UI uses
  (`Rendered<T>`, `RenderedDisplay`, `RenderedKey`, `QuizManifest`). It imports Comark and Shiki, so
  the bank scripts must not import it. The keys file serves `{ key: AnswerKey, explanation, optionNotes }`
  per question: grading reads the unrendered `key` with `gradeAgainstKey()`; the UI shows the trees.

---

## 1. Architecture

```
  content/**/*.md ─┐                       quiz/catalogue/*.yml (people edit)
                   │                                 │
   source repos ───┼──► scripts/quiz/generate.ts ◄───┘     (offline, deterministic, no LLM)
   (git, pinned)   │            │
                   │            ▼
                   │   quiz/bank/generated/*.yml ─┐
                   │   quiz/bank/handwritten/**  ─┤   (people edit; reviewed in PRs)
                   │                              │
                   └──► scripts/quiz/check.ts ◄───┤   (stale / invalid / duplicate / lock)
                                                  │
                         nuxt generate (prerender)│
                                                  ▼
          server/api/quiz/*  reads quiz/ as Nitro server assets, validates with QuestionSchema,
                             splits each question with splitQuestion(), renders markdown and code
                                                  │
                    ┌─────────────────────────────┴───────────────────────────┐
                    ▼                                                         ▼
     /api/quiz/questions/<level>.json                         /api/quiz/keys/<level>.json
     (PublicQuestion[], no answers)                           (AnswerKey[]; only the grader reads it)
                    │                                                         │
                    ▼                                                         ▼
     /quiz, /quiz/play  ── selectQuestions(seed) ── UI ── grade(answer) ── createLocalGrader()
```

- Everything is static. Nitro prerenders the JSON at build time, and the browser does the rest.
  There is no SSR runtime and no edge function for the quiz.
- No step calls an LLM. The generators are pattern matches over real code blocks and a catalogue a
  person writes. An LLM may draft YAML offline; that YAML goes through the same schema and checks.

### Why not a Nuxt Content collection

A `data` collection would validate the YAML, but `queryCollection` in the browser downloads the
collection's whole SQLite dump, answers included, and there is no way to give the client a
question without its key. The exam system needs exactly that split. Plain YAML compiled by a server
route gives us the split, per-level files, and the markdown and code pre-rendered at build time.

---

## 2. File boundaries

### Shared (written now, see the table above)

`quiz/schema.ts`, `quiz/lib/select.ts`, `quiz/lib/hash.ts`, `quiz/config.yml`.

### Runtime developer owns

| Path | Purpose |
|---|---|
| `nuxt.config.ts` | `nitro.serverAssets` for `quiz/` (`{ baseName: 'quiz', dir: <abs path to quiz/> }`), prerender routes `/quiz`, `/quiz/play`, `/api/quiz/config.json` and the 8 per-level JSON routes. |
| `server/api/quiz/config.json.get.ts` | Parsed `quiz/config.yml` (validated). |
| `server/api/quiz/questions/[level].get.ts` | `/api/quiz/questions/<level>.json`: live questions for one level, public shape, with prompt/option markdown as Comark trees and code as Shiki tokens per line. |
| `server/api/quiz/keys/[level].get.ts` | `/api/quiz/keys/<level>.json`: the answer keys, explanations as Comark trees. |
| `server/utils/quiz-bank.ts` | Reads every `bank/**/*.yml` from `useStorage('assets:quiz')`, parses with `yaml`, validates with `BankFileSchema` (an invalid file fails the prerender, so the build fails), keeps `status: live`. |
| `app/pages/quiz/index.vue` | Start page: pitch, four level cards, topic filter, "passed" marks from local storage. |
| `app/pages/quiz/play.vue` | The quiz and the result screen. Reads `level`, `topic`, `seed` from the query. |
| `app/components/quiz/*.vue` | `QuizLevelCard`, `QuizTopicFilter`, `QuizProgress`, `QuizMultipleChoice`, `QuizCodeLines` (pick-the-line and spot-the-mistake), `QuizFeedback`, `QuizResult`, `QuizReadLink`. |
| `app/composables/useQuiz.ts` | The state machine: `loading → question → answered → … → result`. |
| `app/composables/useQuizBank.ts` | Fetches config and the level's questions on the client. |
| `app/composables/useQuizGrader.ts` | `createLocalGrader()`, the only code that fetches `/api/quiz/keys/*`. Implements `QuizGrader` from `quiz/schema.ts`. |
| `app/composables/useQuizProgress.ts` | Local storage, every read and write in `try/catch`. |
| `app/utils/site.ts` | Adds `{ label: 'Quiz', to: '/quiz' }` to `siteLinks` (header, mobile menu, footer, 404). |
| `content/1.getting-started/1.index.md` | One link card to `/quiz`. |
| `tests/quiz.spec.ts` | Playwright: start a quiz, answer by keyboard only, phone width has no horizontal scroll, same seed gives same questions. |

### Bank pipeline developer owns

| Path | Purpose |
|---|---|
| `package.json` | Adds `zod` (^3.25.76) and `yaml` (^2.9.1) as direct dependencies (both are hoisted today but not declared), and the `quiz:*` scripts below. |
| `scripts/quiz/lib/docs.ts` | Reads `content/`, maps files to URLs, finds sections, anchors and code blocks, hashes them. |
| `scripts/quiz/lib/source.ts` | Reads source files at a commit (local git or raw GitHub), hashes line ranges, finds moved lines. |
| `scripts/quiz/lib/bank.ts` | Loads and validates `quiz/bank/**`, `quiz/catalogue/*`, `quiz/config.yml`, the lock file. |
| `scripts/quiz/generators/{spot-the-mistake,pick-the-line,glossary}.ts` | The generators. |
| `scripts/quiz/generate.ts` | Runs the generators and writes `quiz/bank/generated/*.yml`, keeping ids. |
| `scripts/quiz/stamp.ts` | Fills in or refreshes hashes (and re-pins source) for named questions after a person has reviewed them. |
| `scripts/quiz/check.ts` | Every check in section 9. |
| `scripts/quiz/lock.ts` | Updates `quiz/bank.lock.json`. |
| `scripts/quiz/sample.ts` | Prints a quiz for a seed with no answers (`--answers` to include them). Proves the split. |
| `scripts/quiz/diversity.ts` | Overlap report over N seeds per level (criterion 10). |
| `scripts/quiz/no-llm.ts` | Greps the build output and the lockfile for LLM SDKs and endpoints (criterion 14). |
| `quiz/catalogue/mistakes.yml`, `quiz/catalogue/line-targets.yml`, `quiz/catalogue/glossary.yml` | Catalogues. |
| `quiz/bank/handwritten/<level>/<area>.yml`, `quiz/bank/generated/*.yml` | The bank. |
| `quiz/bank.lock.json` | Published ids, versions and fingerprints. |
| `quiz/README.md` | How to write a question, for someone who never reads app code. |
| `.github/workflows/quiz-check.yml` | Runs `quiz:check --strict` and `quiz:diversity` on PRs (the repo has no workflows yet). |

The scripts are TypeScript run directly by Node (`node scripts/quiz/check.ts`). Node 22.18+ strips
types by default; use erasable syntax only (no `enum`, no parameter properties) and import local
files with the `.ts` extension. They import `quiz/schema.ts` and `quiz/lib/*.ts`, never anything under
`app/` or `server/`.

### The contract between the two

- The runtime reads only `quiz/config.yml` and `quiz/bank/**/*.yml`, through `BankFileSchema` and
  `splitQuestion()`. It never reads catalogues or the lock file.
- The pipeline guarantees every file it writes passes `BankFileSchema`.
- Until the bank exists, the runtime developer works from the three examples, plus throwaway
  questions in `quiz/bank/handwritten/` with `status: draft` if needed (drafts are never served).

---

## 3. The question data model

A bank file is YAML with one key, `questions`, holding a list. Hand-written questions go in
`quiz/bank/handwritten/<level>/<area>.yml`. Generated ones go in `quiz/bank/generated/<generator>.yml`.
The schema is `QuestionSchema` in `quiz/schema.ts`; it is strict, so a misspelt key is an error.

### Fields on every question

| Field | Required | Why |
|---|---|---|
| `id` | yes | Stable forever once live. Exam responses are stored against it. Lower-case words joined by `.` or `-`, e.g. `nuxt.setup.extends-layer`. **An id names the topic, never the answer** (`nuxt.admin.is-editing`, not `nuxt.admin.is-editing-plain-boolean`). Generated ids are `gen.<kind>.<ref>.<n>`. Never reused, even after retiring. Ids are internal: an exam client never sees them (section 11). |
| `version` | yes | Starts at 1. Goes up when the prompt's meaning, the options, the code or the answer changes. Not for typo fixes in the explanation. Calibration data belongs to an `(id, version)` pair. The lock file enforces it (section 9). An answer given to a different version than the key's is not graded at all (it is neither right nor wrong; see "Grading" below). |
| `status` | yes | `draft` (never served), `live`, `retired` (kept, never served). Questions are retired, not deleted. Exam mode will add `pilot` (served, not scored, collecting data) and `suspended` (pulled for review, may come back at the same version); v1 doesn't need them. |
| `retired` | if retired | `{ reason, replacedBy? }`. Start each reason with one of `stale-source`, `ambiguous`, `wrong`, `poor-stats`, `over-exposed`, `leaked`, `superseded`, so retirements can be counted later. |
| `level` | yes | `beginner`, `intermediate`, `advanced`, `expert`. |
| `area` | yes | The topic filter: `core-concepts`, `api`, `nuxt-module`, `deployment`. One per question. |
| `tags` | yes | 1–4 tags from `quiz/config.yml`. The result screen suggests reading for the tags of wrong answers (each tag has a docs link). Finer than `area`, so it can feed per-skill scores later. |
| `type` | yes | `multiple-choice`, `pick-the-line`, `spot-the-mistake`. Decides which fields follow. |
| `difficulty` | no | The author's guess, 1–5, within the level. A prior until there is response data. |
| `calibration` | no | `{ difficulty, discrimination, responses, calibratedAt }`, written by a future calibration job (IRT b and a). Present now so adding it needs no schema change. It must also say which `version` it was fitted on, so a version bump makes it stale instead of silently carrying over (required change, see the review section). |
| `exposure` | no | `{ weight, maxRate }`. `weight` (default 1) scales how often selection picks the question. `maxRate` is for exam mode. |
| `docsCoverage` | expert only | `undocumented`, `light` or `documented`. Lets the check report that most expert questions cover behaviour the docs don't (criterion 8). |
| `family` | no | Questions that test **the same fact** share a family, and a quiz shows at most one per family. Generated questions get `mistake:<id>` or `target:<id>`. A hand-written question on the same fact as a catalogue entry uses that entry's family (a multiple choice on `isEditing` being a plain boolean is `mistake:is-editing-value`), otherwise one question gives the other away. The family, not the question, is the unit a candidate can memorise, so bank sizes are counted in families (section 7). |
| `prompt` | yes | Inline markdown, one or two sentences. |
| `sources` | yes | 1–3 provenance entries (below). The first is the main "Read more" link. |
| `generator` | generated only | `{ name, ref }`: which generator and catalogue entry made it. `quiz:generate` uses it, with the source, to keep the id. |
| `author`, `reviewed` | no | Who wrote it, and `{ by, version }`: who checked it and at which version (a version bump makes the review stale). The reviewer is a person other than the author. A question drafted with an LLM offline still needs a human `reviewed`; the hashes prove where a question came from, not that its answer is right. |

### Fields by type

**multiple-choice**

```yaml
options:            # 3–5, each { id: a–z, text }. Ids are stable; the display order is shuffled.
  - { id: a, text: … }
code: { lang, text } # optional snippet above the options
answer:
  correct: b
  explanation: …     # 1–3 short sentences, docs style
  optionNotes:       # optional, a note for a wrong option, shown when it's picked
    a: …
  links: []          # optional extra links (label, to)
```

**pick-the-line**

```yaml
code: { lang: ts, text: | … }  # 3–30 lines, exactly as shown, no [!code] annotations
answer:
  lines: [3]                    # every line that counts (a statement can span lines), 1-based
  explanation: …
```

**spot-the-mistake**

```yaml
code: { lang: php, text: | … } # the snippet with exactly one wrong line
answer:
  line: 5                       # the wrong line, 1-based
  fix: …                        # what the line should say, shown after answering
  explanation: …
```

The schema also checks: the correct option exists, option ids are unique, notes are only for wrong
options, answer lines are inside the code and not blank, and expert questions cite a source file.

### Provenance

**Docs source**

```yaml
- kind: docs
  page: /nuxt-module/module-setup        # the URL path, as the site serves it
  anchor: install                        # the heading id, as the site renders it
  sectionHash: sha256:be07d232ea5ebdc5   # hash of the section's markdown
  block: 1                               # code questions: which fenced block in the section, from 0
  blockHash: sha256:4452d03e14874b65     # hash of that block's display text
```

**Code source** (expert)

```yaml
- kind: code
  repo: cwa-nuxt-module                  # api-components-bundle | cwa-nuxt-module | components-web-app
  path: src/runtime/storage/stores/resources/actions.ts
  lines: [582, 592]
  commit: ccc7bbcd145adda34f45b0e137c2bad945e89316   # full SHA
  linesHash: sha256:23f72f170cfb7b8c
```

`sourceLink()` turns a docs source into `/page#anchor` and a code source into
`https://github.com/<org>/<repo>/blob/<sha>/<path>#L582-L592`. Read-more links are derived, never
typed by hand, so they can't drift from the provenance.

### The answer key is built separately

Authors write the question and its `answer` together, because that is easier to review. At build
time `splitQuestion()` separates them into a `PublicQuestion` (no `answer`, no `sources`, no
calibration) and an `AnswerKey` (`correct`, `fix`, `explanation`, `optionNotes`, `links`). They are
served from different URLs. The UI only reaches a key through `QuizGrader.grade(answer)`
(criterion 17).

### Grading

- An answer carries the `version` the reader saw. If it differs from the key's (a deploy landed
  mid-quiz, or a cached questions file), the grader returns the question as **ungraded**, not wrong,
  and the result screen leaves it out of the score. Marking a right answer wrong because the bank
  moved is unfair, and in an exam it is a scoring bug. (Today `gradeAgainstKey()` returns
  `correct: false`; see the review section.)
- The key in a `GradeResult` is optional. v1 always returns it; an exam may return only `correct`, or
  nothing, until the sitting ends.
- One answer per question, no partial credit. A pick-the-line question with `lines: [3, 4]` accepts
  either line; it is still one right answer (one statement), not two.

### Writing fair questions

These rules are for every question, generated or not. `quiz:check` tests the ones marked *(check)*.

- **One defensible answer.** A developer who knows the fact gets it right without guessing what the
  author meant. If two options are right in some setup, rewrite or drop the question.
- **No trick questions.** No negative prompts ("Which is NOT…") *(check: warns on "not" or "except"
  in a prompt)*, no "all of the above" or "none of the above" *(check)*, no options that differ only in
  punctuation.
- **No cues in the options.** Options are about the same length and the same grammar. The right one
  must not be the longest by a clear margin *(check: warns when it is over 1.5× the median of the
  others)*. Across the bank the correct option id is spread over `a`–`e`, not mostly `a` or `b`
  *(check: reports the spread)*.
- **Nothing tied to a release number** in a prompt or answer, unless the prompt names that release.
  A fact that changed in a release makes the question stale for half the candidates.
- **Spot-the-mistake:** exactly one line is wrong in the shown code. Trimming a block must not leave
  something else that looks wrong, such as an unclosed brace or a variable used before the shown
  lines define it.
- **Pick-the-line:** every line that a reader could fairly call "the line that does X" is in
  `answer.lines`.
- **Read the answer from the source, not from memory.** The docs page or the pinned source lines must
  say it. Docs that are wrong get fixed before the question goes live.

### Example questions

- `quiz/bank/handwritten/intermediate/nuxt-module.yml`: pick-the-line on the module-setup Install block.
- `quiz/bank/generated/spot-the-mistake.yml`: spot-the-mistake made from the `builder-get-entity`
  catalogue entry and the fixtures page's IRI block.
- `quiz/bank/handwritten/expert/nuxt-module.yml`: multiple choice on the module's server-side
  401/403 cookie redirect, which no docs page describes, pinned to module `dev` at `ccc7bbcd`.

All three pass `BankFileSchema`, and their hashes were computed with the algorithm in section 4.

---

## 4. Sections, anchors and hashes

### Page and anchor

- **URL from file:** drop `content/`, drop each segment's numeric prefix (`5.nuxt-module` →
  `nuxt-module`, `01.module-setup.md` → `module-setup`), drop `.md`, and an `index` page is its
  folder (`0.index.md` → the folder's path). `content/standalone/**` and the `*.yml` marketing pages
  are not questions' sources.
- **Anchors come from the site's own parser.** Parse the file with `parseMarkdown` from
  `@nuxtjs/mdc/runtime` (what Nuxt Content uses) and read each heading's `props.id`. Never
  re-implement the slugger: this site's ids have quirks (a heading starting with a digit gets a `_`
  prefix, and `{#id}` is appended, not used).
- **Pairing ids with source lines:** scan the raw file for ATX headings outside fenced code (PHP
  attributes like `#[ORM\Entity]` inside a block are not headings), skipping the front matter. The
  n-th heading found is the n-th id. If the counts differ, the check reports the page as
  unparseable rather than guessing.

### Section extent and hash

- A section runs from its heading line to the line before the next heading of the **same or a higher
  level**, so an `##` section includes its `###` children. A change in a child marks the parent's
  questions stale too. That is deliberate: a false "stale" costs a review, a missed one costs a wrong
  answer.
- `sectionHash = shortHash(normaliseText(sectionMarkdown))`, from `quiz/lib/hash.ts`: LF line ends,
  trailing spaces removed, blank-line runs collapsed, trimmed, then the first 16 hex characters of
  SHA-256 with a `sha256:` prefix.

### Code blocks

- `block` counts the fenced blocks in the section from 0, including blocks in child sections and in
  `::callout` components.
- `blockHash = shortHash(displayCode(block))`. `displayCode` removes `// [!code …]` and `# [!code …]`
  annotations and trailing spaces, and keeps indentation.
- A code question's `code.text` must be a contiguous run of lines of that block's display text
  (after removing their common indentation), so an author may trim a long block. For
  spot-the-mistake, it must match except for exactly the answer line, and `fix` must equal the
  original line.

---

## 5. Expert questions and pinned source

- An expert question cites at least one `kind: code` source with a full commit SHA. Use the tracked
  branch's head when writing it: bundle `main`, module `dev`, template `main` (`REPOS` in the schema).
- Code shown in an expert question must be the pinned lines (after removing common indentation), or,
  for spot-the-mistake, those lines with one line changed. A multiple-choice question may show no
  code at all.
- `docsCoverage` is required. `quiz:check` prints the share that are `undocumented` or `light`.
- Only the three public repos may be cited. No internal tools, dashboards or issue processes appear in
  any question, explanation or link.

**Reading the repos.** `scripts/quiz/lib/source.ts` looks for local clones in `CWA_BUNDLE_DIR`,
`CWA_MODULE_DIR`, `CWA_TEMPLATE_DIR`, defaulting to `../api-components-bundle`,
`../cwa-nuxt-3-module` and `../components-web-app`. It reads with
`git -C <dir> show <sha>:<path>` and `git -C <dir> show origin/<track>:<path>`, never the working
tree (a clone may be on another branch). With `--fetch` it runs `git fetch` first. With no clone it
reads `https://raw.githubusercontent.com/<org>/<repo>/<ref>/<path>`. With neither, it reports the
question as unverifiable (a warning, or an error under `--strict`).

---

## 6. Generators and catalogues

All generators are deterministic: the same `content/` and catalogues always give byte-identical
YAML. They read code blocks with `scripts/quiz/lib/docs.ts`, so anchors and hashes match the check.

### Spot-the-mistake (`quiz/catalogue/mistakes.yml`)

Each entry (`MistakeSchema`) has `id`, `status`, `title`, `level`, `area`, `tags`, `langs`, `match`
(a regex), `replace`, `explanation`, optional `pages`, `exclude`, `readMore`, `prompt` and `limit`.

1. For each live entry, visit every docs code block in `langs` (and under `pages`, if set), in file
   order, skipping blocks listed in `exclude`.
2. The block qualifies if `match` hits **exactly one** line, that line isn't a comment, and applying
   `replace` changes it.
3. If the block is longer than 30 lines, take a 20-line window centred on the line, clipped to the
   block.
4. Write a question: the changed code, `answer.line`, `answer.fix` (the original line), the entry's
   explanation, `family: mistake:<id>`, a docs source for the block, and `generator`. Read more goes
   to the block's section, plus `readMore` if given.
5. Stop at `limit` questions for the entry.

Mistakes are single-line replacements, so the reader always has a line to click. A "missing" mistake
is written as the line that should hold it, e.g. `cwa: { disabled: true }` → `cwa: { disabled: false }`.

The pipeline developer fills the catalogue. Each entry must be wrong for a reason the docs state,
and is checked against source before it goes live. Starting list, from mistakes the docs warn about:

| id | Change | Docs |
|---|---|---|
| `builder-get-entity` | `->getPage()` → `->getEntity()` | data-fixtures |
| `is-editing-value` | `admin.isEditing` → `admin.isEditing.value` | cwa-api/admin |
| `layer-in-modules` | `extends: ['@cwa/nuxt/layer']` → `modules: ['@cwa/nuxt/layer']` (only in blocks with no other `modules` key) | module-setup |
| `cwa-disabled-false` | `cwa: { disabled: true }` → `cwa: { disabled: false }` | module-setup |
| `subpath-import` | `#cwa/` → `@cwa/nuxt/runtime/` | composables |
| `bundle-package-name` | `components-web-app/api-components-bundle` → `silverbackis/api-components-bundle` | bundle-setup |
| `unpublish-with-patch` | `DELETE` … `?published=true` → `PATCH` | publishable |
| `navigate-to-iri` | `navigateTo(getInternalResourceLink(iri))` → `navigateTo(iri)` | use-cwa-resource-route |

### Pick-the-line (`quiz/catalogue/line-targets.yml`)

Same base fields (`LineTargetSchema`), with a `prompt` such as "Which line loads CWA, including the
admin panel and the sign-in pages?". A block qualifies when `match` hits exactly one line and the
block has at least 4 non-blank lines. The answer is that line. `family: target:<id>`.

### Glossary multiple choice (`quiz/catalogue/glossary.yml` + `content/2.core-concepts/9.glossary.md`)

Facts from structured data. Each `###` term in the glossary becomes "Which term means: <first
sentence of its definition>?". The options are the term and three other terms from the same `##`
group, chosen by `hash53(term)` so they never change between runs. A definition that contains its own
term is skipped. `glossary.yml` maps a term to its level and tags, and can exclude a term.

### Keeping generated ids stable

`quiz:generate` reads the existing generated file and matches each new question to an old one by
`(generator.name, generator.ref, page, anchor, block)`.

- Match, same code and answer: keep everything (refresh `sectionHash` if only prose changed).
- Match, different code or answer: keep the id, bump `version`, refresh hashes.
- Old question with no match: set `status: retired` with reason "source block gone".
- New question: the next free number for that ref, never one used before (the lock file remembers).

New generated questions are written as `live`. The person opening the PR reviews the YAML diff.
That is enough for the public practice bank. An exam bank takes a generated question only once a
person has reviewed it at its current version (`reviewed`), because a regex can produce a line
that is wrong for a second reason, or a "mistake" that is valid in that block's context.

---

## 7. Selection and randomisation

Implemented in `quiz/lib/select.ts`.

- **Seed:** 8 base-36 characters from `crypto.getRandomValues` (`newSeed()`), the only randomness.
- **Pool:** live questions with the chosen `level`, and the chosen `area` unless it's `all`.
- **Order:** each question's key is `-ln(u) × familySize / weight`, where
  `u = unit("<seed>|<level>|<area>|<id>")` (cyrb53) and `familySize` is the number of eligible questions
  in its family. Sorting by key is a weighted sample without replacement (Efraimidis–Spirakis) in which
  each family, not each variant, has one draw's worth of chance. Weighting each question on its own
  made a family with six generated variants about six times as likely, and four of ten beginner slots
  came out the same on every seed. A key depends only on the seed, the question's id and its family's
  size, so adding a question changes an old shared link only if it ranks in or joins a family in it.
- **Constraints, in key order:** at most one question per `family`; at most 60% of one type, or the
  type's share of the pool's families when that is bigger (so a few code families aren't forced into
  every quiz); and at most two glossary questions (`groupCaps`, keyed by the family's prefix before
  `:`). A second pass fills any gap, ignoring the type and group caps but never the family rule.
- **Length:** `quizLength`, or the level's own `quizLength` (expert is 8 while its bank is small).
- **Short pool:** the result carries `shortBy`. The UI says "There are only 7 questions for this
  level and topic so far" and runs those 7. A question never repeats within a quiz.
- **Options:** `shuffleOptions(options, seed, id)`, seeded per question.

### A note on criterion 10 (overlap)

With 20 questions per level and 10 per quiz, two random quizzes share 6 or more questions a third of
the time. Over 100 seeds (4,950 pairs), about 1,600 pairs break the "no more than half" rule. This
follows from the numbers, not from the algorithm. Measured with `select.ts` on a uniform pool:

| Live questions in the pool | Pairs sharing more than 5 (of 4,950) |
|---|---|
| 20 | ~1,650 |
| 60 | ~3 |
| 120 | 0 |

So criterion 10 needs about **120 live questions per level** for "Everything". The generators make
that realistic for beginner to advanced (the docs have about 575 code blocks). Expert questions are
hand-written from source, so expert will start near 20–40 and won't meet criterion 10 at launch.
Proposal for the client: hold beginner to advanced to criterion 10 at 120+, and report expert's
overlap without failing on it until its bank grows. A topic filter shrinks the pool, so criterion 10
applies to "Everything" only.

`quiz:diversity` prints the max and mean overlap per level over 100 seeds and fails when a level with
120+ live questions breaks the rule.

**Count families, not questions.** A catalogue entry with `limit: 6` makes six questions that test one
fact, and the family rule stops two of them meeting in one quiz. So 120 questions from 20 catalogue
entries is a bank of 20 facts. `quiz:diversity` also reports, per level and area, the number of live
families and the overlap measured in families (two quizzes that show different variants of the same
family share that fact). The target for "Everything" is **at least 60 live families per level**, with
at least 10 per area that has questions at that level.

---

## 8. The runtime

### Routes

- `/quiz`: the start page. A one-line pitch, four level cards (each with its blurb and pass mark; the
  expert card says its questions come from the source of the bundle, the Nuxt module and the template,
  and some cover behaviour the docs don't describe), a topic filter defaulting to "Everything", and a
  Start button. Levels already passed (from local storage) show a mark. Start makes a seed and goes to
  `/quiz/play`.
- `/quiz/play?level=advanced&topic=all&seed=k3j9x2ab`: the quiz, then the result screen on the same
  page. The URL holds the level, topic and seed only, never answers or a score, so it is the share
  link. A missing or invalid seed gets a new one with `router.replace`. `noindex`.

Both pages are prerendered shells. The question data loads on the client with `$fetch` after the
reader starts, so it isn't put in every page's payload. Each level's questions file is small enough
to fetch in one go; fetch the level's keys file at the same time so feedback is instant.

The explicit `app/pages/quiz/` routes take precedence over `[...slug].vue`. The JSON routes aren't
linked from any page, so they must be listed in `nitro.prerender.routes`.

### Rendering

- The server routes turn `prompt`, option text and `explanation` into Comark trees with
  `parseMarkdown` (as `server/api/highlighted-code/[file].get.ts` does), rendered with
  `<MarkdownDocument>`. Code is tokenised per line with Shiki's `codeToTokens` (github-light and
  github-dark), so the browser never loads Shiki or a markdown parser.
- `QuizCodeLines` renders one row per line with a line number. The whole block is a
  `role="radiogroup"`; each non-blank line is a `role="radio"` with a roving `tabindex`. Up/Down move,
  Space or Enter selects, and "Check answer" submits. Only the code block scrolls sideways; the page
  never does. After grading, the chosen line and the correct line are marked with an icon as well as a
  colour, and spot-the-mistake shows `fix` under the wrong line.
- Multiple choice uses the same radiogroup pattern with full-width option buttons.
- Colours come from Nuxt UI tokens (`primary`, `success`, `error`), so light and dark mode work.
- Watch for the vue-tsc gotcha in CLAUDE.md: a link component with a dynamic `to` inside a `v-for`
  loses the loop variable. Use a per-item component (`QuizReadLink.vue`) for read-more and
  read-next lists.

### Flow and state (`useQuiz`)

`loading → question → answered → question … → result`. `source.start(settings)` returns the sitting:
items with the display fields and an opaque `ref`, plus `shortBy`. v1's static source selects and
shuffles behind that call, so `useQuiz` never sees the pool, an id, a family or a tag. Each answer goes
through `grader.grade({ ref, … })`, which returns `{ status, correct, key }`; the result screen's tags
come from `key.tags`. An exam source can serve one item at a time from a server behind the same
interface (a `next()` method would be added for adaptive use).

### The result screen

The score, the rank title from `config.levels[].ranks` (the highest `min` at or below the score),
whether it passed the level's pass mark, the tags answered well, "Read next" links for the tags
of wrong answers (from `config.tags[].read`), and a collapsible "Your answers" list with each prompt,
right or wrong, and its first read-more link. An exam would leave the list out. Buttons: "Try the next level" (a new seed), "Try this
level again" (a new seed), and "Share this quiz" (the current URL, through `navigator.share` or the
clipboard).

### Local storage

One key, `cwa-quiz:v1`: `{ best: { <level>: { score, total, at } }, passed: Level[], last: { level,
topic }, started: string[] }`. `started` holds the last 200 quizzes (`level|topic|seed`) answered at
least once, so a pass counts only on a first attempt: reloading a quiz after seeing its answers can't
record one. Every access is in `try/catch`; when storage is blocked, the quiz works and remembers
nothing. Nothing is sent anywhere.

A level counts as **passed** only for a first attempt at a full quiz on "Everything" (`topic=all`,
`shortBy` 0, every question graded). A pass on one topic, or on a short pool, shows the score and rank but doesn't add
the level to `passed`. This keeps v1's "passed" meaning the same as an exam pass.

---

## 9. Scripts

| Command | What it does |
|---|---|
| `pnpm quiz:generate` | Runs all generators and writes `quiz/bank/generated/*.yml`. |
| `pnpm quiz:stamp <id…>` | After a person has reviewed a question: fills in or refreshes its hashes, and re-pins an expert source to the tracked branch's head (new commit, moved line range). `--all-stale` stamps every stale question. Never changes a question's text. |
| `pnpm quiz:check` | All checks below. `--strict` turns warnings into errors. `--fetch` fetches the source repos first. |
| `pnpm quiz:lock` | Records every live and retired id with its version and fingerprint in `quiz/bank.lock.json`. Run when a PR's questions are approved. |
| `pnpm quiz:sample --level L [--topic T] [--seed S] [--answers]` | Prints the quiz `select.ts` would give, without answers unless asked. |
| `pnpm quiz:diversity [--seeds 100]` | The overlap report from section 7. |
| `pnpm quiz:no-llm` | Run after `pnpm generate`: greps `.output/public` and the lockfile (section 10). |

### What `quiz:check` reports

Each line names the question id, the file and the reason. The exit code is 1 when there are errors.

| Check | Severity |
|---|---|
| A field missing or invalid (`BankFileSchema`), with the zod path | error |
| A duplicate id across all bank files | error |
| An answer that isn't one of the options, or a line outside the code | error (schema) |
| A tag not in `config.yml` | error |
| A docs page or anchor that no longer exists | error |
| A docs `sectionHash` or `blockHash` that no longer matches | warning (stale) |
| Code that isn't a contiguous run of its block, or a spot-the-mistake that differs in more or fewer than one line, or whose `fix` isn't the original | error |
| Pinned source lines that don't match `linesHash` at the pinned commit | error |
| Source lines that changed between the pinned commit and the tracked branch | warning (stale), with "moved to L…" when the same lines are found elsewhere in the file |
| A source that can't be read (no clone, no network) | warning (unverifiable) |
| A live id in the lock file that is missing from the bank (deleted instead of retired) | error |
| A fingerprint that changed while `version` didn't, or a version that went down | error |
| An expert question with no code source or no `docsCoverage` | error (schema) |
| The share of expert questions that are `undocumented` or `light`, and the count per level and type against criterion 6 | report |

The fingerprint is `shortHash` of the canonical JSON of `type`, `prompt`, `options`, `code` and the
answer's `correct`, `lines`, `line` and `fix`. Explanations, tags, difficulty and level can change
without a version bump (moving a question to another level after calibration is expected).

The lock file also records, per `(id, version)`, the docs commit at which that version was locked.
The exact text of any version a candidate was shown can then be recovered from git, which a disputed
exam answer needs.

**Exam-readiness checks** (added by the review below; warnings in v1):

| Check | Severity |
|---|---|
| A prompt containing "not" or "except" as a word | warning |
| An option reading "all of the above" or "none of the above" | error |
| A correct option over 1.5× the median length of the others | warning |
| The spread of correct option ids per level | report |
| A `calibration` whose `version` isn't the question's | error |
| `reviewed` missing, by the `author`, or for an older version | report (v1), error in an exam bank |
| Live families per level and area against the targets in section 7 | report |

### Where it runs

- **Locally:** `pnpm quiz:check` while writing questions.
- **In GitHub Actions:** `.github/workflows/quiz-check.yml` on pull requests, with `--strict`. It
  checks out the three source repos next to the docs repo, so expert questions are verified without
  network calls to anything else.
- **During `nuxt generate`:** the server route validates the bank with the same schema, so an invalid
  file fails the build. Stale questions don't fail the build: a docs edit should never block a deploy.

---

## 10. No LLM

- The site has no LLM SDK, no AI endpoint and no API key, and the quiz adds none. The generators are
  regex matches and hash ordering.
- `quiz:no-llm` fails if `.output/public`, `server/`, `app/`, `quiz/` or `pnpm-lock.yaml` contains a
  known SDK package (`@anthropic-ai/`, `openai`, `@google/generative-ai`, `@google/genai`,
  `groq-sdk`, `@mistralai/`, `cohere-ai`, `ollama`, `@ai-sdk/`, and the `ai` package matched as a lockfile entry `/ai@`) or endpoint host
  (`api.anthropic.com`, `api.openai.com`, `generativelanguage.googleapis.com`, `api.groq.com`,
  `api.mistral.ai`, `api.cohere.ai`).
- Building and checking need no API key. The only network use is optional: `git fetch` or raw GitHub
  reads for expert sources.
- **For the client:** the planned docs chat assistant (docs #1) would call an LLM from an edge
  function. If it is built, this grep must be scoped to the quiz's own files, or the two goals
  conflict. Decide before that work starts.

---

## 11. Path to an exam system

v1 is built so an exam can reuse the bank and the UI without a rewrite. Nothing here is built now.

### Questions and answers stay on a server

- The docs repo is public, so its bank is a **practice bank**: anyone can read the answers on GitHub.
  An exam needs a **private bank** in a private repo, using the same schema, generators and checks.
  The scripts take extra bank directories, so the tooling is shared, and a few public questions can
  sit in both banks as anchor items for calibration.
- An exam is served by a server (an edge function or a small API), never by prerendered JSON:
  `POST /exam/sessions` creates a sitting, `GET /exam/sessions/:id/next` returns one `PublicQuestion`
  (made with the same `splitQuestion()`), and `POST /exam/sessions/:id/answers` grades it.
- The UI already grades only through `QuizGrader.grade(answer)`. Exam mode swaps
  `createLocalGrader()` for a remote grader that posts the answer, and the server calls the same
  `gradeAgainstKey()`. The keys never reach the browser. The seed is made on the server and never
  goes in a URL.
- An exam can also withhold the result until the end: the remote grader returns `{ correct }` only,
  and the result screen fetches explanations after submission.
- **The exam client gets less than `PublicQuestion`.** In v1 the id, `family` and `tags` are harmless,
  because the practice bank is public. In an exam they leak: `gen.mistake.builder-get-entity.1` and
  `family: mistake:builder-get-entity` name the answer. The server sends an `ExamItem`: a per-sitting
  opaque token in place of the id, no `family`, `tags`, `weight` or `version`, and option ids remapped
  per sitting (so a habit of writing the right answer as `b` can't be read from the payload). The
  server keeps the token → `(id, version, option map)` table. Make `ExamItem` a projection of
  `PublicQuestion` in the shared schema, so the UI components take the fields both have and never
  read `id` for anything but a key.
- **Rendering must be reusable by a server.** v1's server routes turn markdown into Comark trees and
  code into Shiki tokens at prerender time, so the shape the browser gets is not `PublicQuestion` but a
  rendered version of it. Put that step in one pure function (`renderQuestion()` in `quiz/lib/`) with
  a named output type, called by the prerender routes. An exam server, or a build of the private bank,
  calls the same function. The UI depends on the rendered type, not on how it was made.
- **Stale means not scored.** v1 serves a stale question, because a docs edit must never block a
  deploy. An exam serves only questions whose provenance is fresh and whose `reviewed.version` matches the
  current version; a stale one is `suspended` until a person restamps it.
- **Ids across banks.** Private exam questions use an id prefix (`x.`), so they can never collide with
  a public id. An anchor item that sits in both banks keeps its public id and must have the same
  fingerprint in both.
- **Open book or not.** Generated questions are copies of public docs blocks: in an unsupervised exam,
  a candidate can search for the snippet and diff it. Decide whether the exam is open book. If it is,
  set a time per item and store `timeMs`; if it isn't, weight the exam towards hand-written scenario
  questions, which can't be looked up.

### Calibration

- Responses are stored server-side as `(sessionId, candidate, questionId, version, answer, correct,
  timeMs)`. Because ids are stable and versions bump on any change of meaning, responses for one
  `(id, version)` are comparable, and a new version starts uncalibrated.
- A job fits an IRT model (Rasch, then 2PL once there are enough responses) and writes
  `calibration.difficulty`, `discrimination` and `responses` back to the private bank. Until then,
  the author's `difficulty` is the prior. Pass marks per level can then be set from calibrated scores
  rather than a flat 70%.
- Before there are enough responses for IRT (a few hundred per item), classical statistics do the
  work: the share who answer right, the point-biserial correlation with the total score, and how often
  each wrong option is picked. A question that strong candidates get wrong more often than weak ones,
  or a wrong option nobody picks, goes to review. This needs the chosen option id and the display
  position stored with each response; `QuizAnswer` already carries the option id, not the position.
- Multiple choice can be guessed (one in three to one in five), and pick-the-line one in the number of
  lines. A 3PL model, or at least a guessing correction in the pass mark, accounts for it. Calibration
  values must name their `version` and the model they came from, or they can't be compared.
- Calibration can show that an "advanced" question is easier than most intermediate ones. The level is
  not in the fingerprint, so moving it is a reviewed edit, not a new version.
- Until there is data, the pass mark can be set by experts rather than picked: each reviewer guesses
  the chance that a candidate just good enough for the level gets each question right (an Angoff
  rating), and the level's pass mark is the average. An optional per-question `cutRating` (0 to 1)
  would hold it. Deferred, but cheaper than a flat 70%.

### Placement

- `config.levels` is ordered and each level has a `passMark`. A placement sitting starts at
  beginner (or the candidate's chosen level), serves `quizLength` items of that level with
  `selectQuestions()`, and moves up while the candidate passes. It stops at the first failure:
  "placed at Advanced". v1's `passed` list in local storage is the same idea without a server.
- With calibrated items, the same loop can become adaptive (choose the next item by estimated
  ability) without changing the item format.
- **Ten questions is too few to place someone.** A candidate who knows exactly 70% of the level
  passes a 10-item quiz with a 70% pass mark only about two times in three, and the standard error of
  the score is about 14 points. An exam level needs its own length (around 20 to 30 items), separate from `quizLength`, or a
  sequential rule: keep serving items while the score is close to the pass mark, and stop early when
  it is clearly above or below (a sequential probability ratio test). Report a borderline band, not
  just pass or fail.
- **A blueprint per level.** Random selection on "Everything" can give eight deployment questions in
  an advanced exam. Each level needs a share per area (and later per tag), and selection fills those
  shares first. `selectQuestions()` should take an optional blueprint; v1 can pass none.
- **The family rule spans the whole sitting**, not one level, since a placement climbs through levels
  in one sitting and a beginner question can give away an advanced one in the same family.

### Exposure control

- The bank is large and partly generated, so there is plenty to sample from, and `family` keeps two
  variants of one question out of the same sitting.
- The server counts exposures per `(id, version)`. Over-exposed items get a lower `exposure.weight`,
  which `selectQuestions()` already honours, and `exposure.maxRate` is enforced with the
  Sympson–Hetter method (administer a selected item with probability `maxRate`/observed rate). Both
  fields exist in the schema now.
- A candidate never sees an item twice across sittings: the server passes the items already seen as
  an exclusion list before selection. Exclude by family, not by item.
- **Bank size per level.** With items per sitting `n` and a highest exposure rate `r`, a level needs
  at least `n / r` families. For a 25-item exam and `r = 0.2`, that is 125 families per level, more
  than the 60 the practice quiz aims for. Expert, written by hand from source, will be the bottleneck.
- A question known to be shared outside an exam (posted online, say) is retired with reason
  `leaked`.
- Retired items stay in the bank, so old responses still point at real questions.

### What in v1 makes this possible

| v1 boundary | Exam use |
|---|---|
| `splitQuestion()` and separate key files | The server serves questions and keeps keys. |
| `QuizGrader` interface; only `useQuizGrader.ts` reads keys | Swap the local grader for a remote one. |
| `gradeAgainstKey()` in shared code | The same grading on the server. |
| `selectQuestions()` with weights and families, pure and seeded | Server-side selection with exposure weights. |
| Stable ids, versions, the lock file, retired not deleted | Responses stay valid over time. |
| `calibration`, `exposure`, `difficulty`, `tags` | Calibration, exposure control, per-skill reports. |
| `levels[].passMark` in config | Placement. |

---

## 12. Decisions for the client

1. **Criterion 10 versus criterion 6.** 20 questions per level can't meet the overlap rule (section 7).
   Proposal: 120+ live questions per level for beginner to advanced, and expert reported only until
   its bank grows.
2. **Every type at every level.** All three types work at every level: expert pick-the-line and
   spot-the-mistake use pinned source lines. No exception is proposed. Expected mix: beginner leans
   on multiple choice and pick-the-line (spot-the-mistake there uses simple config mistakes); expert
   leans on multiple choice.
3. **CI.** The repo has no GitHub workflows. The quiz adds the first one, `quiz-check.yml`.
4. **The docs chat assistant** (docs #1) conflicts with "the site never calls an LLM" (section 10).
5. **For a future exam (no v1 work):** open book or not, and whether a sitting may last 20 to 30
   items per level. Both decide which questions an exam can use (section 11).

---

## 13. Build order

Both start at once.

- **Runtime:** server routes on the three examples → `/quiz` start page → `/quiz/play` with
  multiple choice → `QuizCodeLines` → result screen and storage → nav link and getting-started card →
  Playwright test → `pnpm typecheck` and `pnpm generate`.
- **Pipeline:** `lib/docs.ts` (reproduce the three example hashes first; if they differ, the
  library is wrong, not the examples) → `check.ts` and `lock.ts` → `stamp.ts` → generators and
  catalogues → hand-written questions to the counts in criterion 6 → `sample`, `diversity`, `no-llm`
  → `quiz/README.md` → the workflow.
- **Join:** `pnpm quiz:check --strict`, `pnpm generate`, `pnpm quiz:no-llm`, then a run of
  `quiz:sample` and the browser on the same seed should list the same question ids.

---

## 14. Exam-readiness review

A review of this design for later use as an exam that places candidate developers in levels.
The v1 quiz is unchanged in scope; these notes keep the data and code from blocking the exam.

### Changed in this document

- Ids name the topic, never the answer, and an exam client never sees them (sections 3 and 11).
- A version mismatch is ungraded, not wrong. The key in a `GradeResult` is optional (section 3,
  "Grading").
- Fairness rules for every question, with the ones `quiz:check` tests (section 3, "Writing fair
  questions") and an extra check table (section 9).
- `family` means "the same fact", across generated and hand-written questions. Bank targets are
  counted in families: 60 live per level for the practice quiz (section 7), `n / r` for an exam
  (section 11).
- v1 records a level as passed only for a full quiz on "Everything" (section 8).
- Retirement reasons start with a fixed word; exam statuses `pilot` and `suspended` are named.
- The lock file records the docs commit per `(id, version)`, so any version shown can be recovered.
- Generated questions enter an exam bank only after a person reviews them; LLM-drafted questions need
  a human reviewer like any other.
- Section 11 gains: `ExamItem` (opaque token, remapped option ids), a shared `renderQuestion()`, stale
  means not scored, id prefixes for the private bank, the open-book decision, classical item
  statistics before IRT, guessing, Angoff pass marks, exam length and sequential stopping, blueprints,
  and family exclusion across a sitting.

### Deferred (needs response data or an exam server)

- IRT fitting, 3PL guessing, adaptive selection, Sympson–Hetter exposure control.
- `pilot` and `suspended` statuses, `cutRating`, blueprints in `selectQuestions()`, `ExamItem`.
- Response storage (`timeMs`, display position), candidate disputes, an "I don't know" option.

### Nothing here depends on Claude

The bank is YAML, the generators are regex and hashing, the checks are git and zod, and grading is
`gradeAgainstKey()`. Removing every LLM from the process loses nothing but drafting speed.

---

## 15. Follow-ups

What the fix round left, with the reason. Exam items need an exam server or response data, so none of
them is built in v1.

### The bank

- **Human review.** No question has `reviewed` yet; many are `author: llm-draft`. A person other than
  the author must review each one, starting with the families shown most (`quiz:diversity` lists them),
  then add `reviewed: { by, version }`. `quiz/bank.lock.json` was written in the fix round so ids and
  versions are enforced from now on; it records versions, not reviews. Its docs commit is marked
  `+dirty` because the docs edits weren't committed yet: run `pnpm quiz:lock` again after committing.
  Keeping unreviewed questions at `status: draft` was not done, because it would empty the quiz; an exam
  bank takes only reviewed items instead.
- **Size.** Families per level are below the 60 target (beginner 50, intermediate 40, advanced 30,
  expert 22). Advanced and expert overlap most: grow advanced through the generators, and write expert
  questions per area (expert deployment and API have fewer than 10). Put expert back to 10 questions at
  40+ families. Thin topics (fewer than 8 families) are hidden on the start page until they grow.
- **Families across levels.** Hand-written items and catalogue entries on the same fact should share a
  family (done for the layout slot, the page template/template page pair, style variants, the publish
  group, and the two expert cache-directive questions). Audit the rest, for example the `CwaLayout`
  prefix items at beginner, intermediate and expert. A `quiz:check` report could list hand-written
  items whose tags and code match a catalogue entry's but whose family doesn't.
- **Release-dependent items.** Some questions test changes from the last few releases (the add page
  data link, the server redirect). Add an optional `appliesTo: { repo, since?, until? }` so an exam can
  skip items newer than a grace period, and `quiz:check` can report items whose `until` has passed.
  Avoid catalogue entries that are wrong only because of an open bug (the trailing-slash entry was
  retired for this reason once module commit `698e89fe` fixed it).
- **`drafted` field.** `author` mixes who wrote a question with how. An optional
  `drafted: person | llm | generator` would let the check count LLM drafts that reach an exam.
- **Docs disagree on what visitors see on a real-time update.** `/core-concepts/draft-and-publish`
  says visitors see new content without a refresh; `/nuxt-module/component-helpers/real-time-updates`
  says updates are staged behind an "outdated" notice; module `ccc7bbcd` renders that notice only in
  the admin header. Settle it in the docs before writing a question on it.

### The pipeline

- **Generated ids and docs edits.** A generated question is matched to its old self by generator, ref,
  page, anchor and block index, so inserting a code block earlier in a section, or renaming a heading,
  retires it and adds an identical one under a new id. Before retiring, match leftovers by
  `(generator, ref, fingerprint)` or `blockHash` and keep the id.
- **CI builds nothing.** The workflow runs `quiz:check --strict` and `quiz:diversity`, not
  `pnpm generate` or `quiz:no-llm`. `quiz:check` compares a local `.output` with the bank when there is
  one. A build step in CI would catch a bank the prerender can't render.
- **`@nuxtjs/mdc`** is imported by `scripts/quiz/lib/docs.ts` but comes in only through
  `@nuxt/content`. Add it as a direct dev dependency if that ever changes.

### The runtime

- **Retakes don't remember seen questions.** "Try this level again" makes a new seed, and families
  seen before are as likely as any. Down-weighting them per browser would break "same seed, same quiz",
  so it is left for the exam's exclusion list.
- **Reload restarts the quiz.** Answers in progress aren't kept, but a reload can no longer record a
  pass (first-attempt rule). Keeping `{ index, records }` in `sessionStorage` would let a reload resume.

### For the exam (needs a server or response data)

- **Selection options** to add to `selectQuestions()`: `blueprint` (area shares per level), the
  `excludeFamilies` already added (families shown in this or earlier sittings), and a per-level exam
  length separate from `quizLength`, with Sympson–Hetter `maxRate`. A placement sitting calls it once
  per level and passes the families used so far.
- **A level opens for the exam** only with about `n / r` reviewed families (125 for 25 items at a 20%
  exposure rate) and an area blueprint. Expert is the bottleneck.
- **Trust nothing from the client.** The server takes `id` and `version` from its token map, never from
  the request. An ungraded item in a sitting is replaced or counts as wrong, never dropped (otherwise a
  candidate could send a wrong version to skip a question). A malformed answer gets a 400.
- **Response capture.** Store `displayIndex` (where the chosen option was shown), the option order and
  `timeMs` in the server's response record, not in `QuizAnswer`. Widen `STATUSES` and
  `LockSchema.status` together when `pilot` and `suspended` arrive, or `quiz:lock` rejects pilot items.
- **Server-issued forms.** The v1 share link reproduces a quiz exactly, which is right for practice and
  wrong for an exam: an exam's seed and form are made on the server and never shown.

