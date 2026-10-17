/**
 * Seeded question selection. Shared by the quiz page and scripts/quiz (sample, diversity),
 * so a seed gives the same quiz in the browser and in a terminal.
 *
 * No Math.random() here except in newSeed(). Everything else is a pure function of
 * (seed, level, area, the pool), so a shared link reproduces a quiz exactly.
 */
import { WHATS_NEW, type AreaFilter, type PublicQuestion, type QuizSet } from '../core.ts'

/** cyrb53: a fast, well-mixed 53-bit string hash. Not cryptographic, which is fine here. */
export function hash53(input: string, salt = 0): number {
  let h1 = 0xDEADBEEF ^ salt
  let h2 = 0x41C6CE57 ^ salt
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

/** A number in (0, 1) from a string, the same on every machine. */
export function unit(input: string): number {
  return (hash53(input) + 0.5) / 2 ** 53
}

/** mulberry32: a small seeded generator for shuffles. */
export function rng(seed: string): () => number {
  let a = hash53(seed) >>> 0
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const SEED_PATTERN = /^[a-z0-9]{4,16}$/

/** 8 base-36 characters. The only place randomness enters. */
export function newSeed(): string {
  const bytes = new Uint8Array(8)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, b => (b % 36).toString(36)).join('')
}

export type SelectOptions = {
  seed: string
  /** A level, or What's new, whose pool is already only new questions (from every level). */
  level: QuizSet
  area: AreaFilter
  count: number
  /**
   * At most this share of the quiz may be one question type, while the pool allows it. A type that
   * holds a bigger share of the pool's families may fill up to that share instead, so a few code
   * families aren't forced into every quiz.
   */
  maxTypeShare?: number
  /**
   * At most this many questions whose family starts with `<group>:`, such as `{ term: 2 }` for the
   * glossary. Relaxed only when the quiz would otherwise be short.
   */
  groupCaps?: Record<string, number>
  /**
   * Families never to pick. Not used in v1. A placement sitting that climbs levels passes the families
   * it has already shown, and an exam can pass the ones a candidate saw in earlier sittings.
   */
  excludeFamilies?: ReadonlySet<string>
}

/** v1's default: glossary questions are quick recall, so a quiz has at most two. */
export const DEFAULT_GROUP_CAPS: Record<string, number> = { term: 2 }

export type Selection<T> = {
  questions: T[]
  /** How many questions the pool was short of `count`. The UI says so when this is above 0. */
  shortBy: number
  /** How many families were eligible: the most questions a quiz from this pool can show. */
  poolSize: number
}

type Selectable = Pick<PublicQuestion, 'id' | 'level' | 'area' | 'type' | 'family' | 'weight'>

/**
 * Picks `count` questions for a level and area.
 *
 * Each eligible question gets a key from hash(seed, id), weighted by its exposure weight divided
 * by the number of eligible questions in its family (Efraimidis–Spirakis: key = -ln(u) / weight,
 * smallest first). This is a weighted random sample without replacement in which each family,
 * not each variant, has one draw's worth of chance: a family with six generated variants is no
 * more likely to appear than a hand-written question. Because each key depends only on the seed,
 * the question's own id and its family's size, adding a question changes a shared quiz only if it
 * ranks into it or joins a family in it.
 *
 * Then, walking in key order: at most one question per family, at most `maxTypeShare` of one type
 * (or the type's share of the pool's families, when that is bigger),
 * and at most `groupCaps` per family group. If that leaves the quiz short, a second pass fills it
 * ignoring the type and group caps. The family rule is never relaxed: two variants of one question
 * in a quiz would give each other away.
 */
export function selectQuestions<T extends Selectable>(pool: T[], options: SelectOptions): Selection<T> {
  const { seed, level, area, count, maxTypeShare = 0.6, groupCaps = DEFAULT_GROUP_CAPS, excludeFamilies } = options
  const familyOf = (q: T) => q.family ?? `q:${q.id}`
  const eligible = pool.filter(q => (level === WHATS_NEW || q.level === level) && (area === 'all' || q.area === area) && !excludeFamilies?.has(familyOf(q)))
  const familySize = new Map<string, number>()
  for (const q of eligible) familySize.set(familyOf(q), (familySize.get(familyOf(q)) ?? 0) + 1)
  const groupOf = (q: T) => q.family?.includes(':') ? q.family.slice(0, q.family.indexOf(':')) : undefined
  const ranked = eligible
    .map(q => ({ q, key: -Math.log(unit(`${seed}|${level}|${area}|${q.id}`)) * familySize.get(familyOf(q))! / (q.weight ?? 1) }))
    .sort((a, b) => a.key - b.key || (a.q.id < b.q.id ? -1 : 1))
    .map(r => r.q)

  const familyTypes = new Map<string, string>()
  for (const q of eligible) familyTypes.set(familyOf(q), q.type)
  const typeShare = (type: string) => [...familyTypes.values()].filter(t => t === type).length / Math.max(1, familyTypes.size)
  const typeCap = (type: string) => Math.max(1, Math.ceil(count * Math.max(maxTypeShare, typeShare(type))))
  const picked: T[] = []
  const families = new Set<string>()
  const perType = new Map<string, number>()
  const perGroup = new Map<string, number>()

  const take = (q: T) => {
    picked.push(q)
    if (q.family) families.add(q.family)
    perType.set(q.type, (perType.get(q.type) ?? 0) + 1)
    const group = groupOf(q)
    if (group) perGroup.set(group, (perGroup.get(group) ?? 0) + 1)
  }

  for (const q of ranked) {
    if (picked.length === count) break
    if (q.family && families.has(q.family)) continue
    if ((perType.get(q.type) ?? 0) >= typeCap(q.type)) continue
    const group = groupOf(q)
    if (group && groupCaps[group] !== undefined && (perGroup.get(group) ?? 0) >= groupCaps[group]) continue
    take(q)
  }
  for (const q of ranked) {
    if (picked.length === count) break
    if (picked.includes(q) || (q.family && families.has(q.family))) continue
    take(q)
  }

  // Present in key order, not in the two-pass order.
  const order = new Map(ranked.map((q, i) => [q.id, i]))
  picked.sort((a, b) => order.get(a.id)! - order.get(b.id)!)

  return { questions: picked, shortBy: Math.max(0, count - picked.length), poolSize: familySize.size }
}

/** Shuffles a question's options. Seeded per question, so the order doesn't depend on the rest of the quiz. */
export function shuffleOptions<T>(items: readonly T[], seed: string, questionId: string): T[] {
  const next = rng(`${seed}|options|${questionId}`)
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
