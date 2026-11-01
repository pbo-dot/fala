import { createEmptyCard, fsrs, Rating, type Card } from 'ts-fsrs'
import { BUILTIN, CATEGORIES, PRACTICE_ORDER, allItems, type Phrase } from './data/phrases'
import { getData, today, update, type CardState, type Data } from './store'

// Gentagelse styres af FSRS (ts-fsrs, MIT).

const f = fsrs({ enable_fuzz: true })

export type PracticeItem = Phrase & { cat: string }

export function practicePool(d: Data): PracticeItem[] {
  const out: PracticeItem[] = []
  for (const id of PRACTICE_ORDER) {
    const c = CATEGORIES.find((x) => x.id === id)!
    out.push(...allItems(c).map((ph) => ({ ...ph, cat: c.name })))
    if (id === 'hoeflighed') {
      out.push(...d.about.lines.map((ph) => ({ ...ph, cat: 'Om mig' })))
      out.push(...d.mine.map((ph) => ({ ...ph, cat: 'Min parlør' })))
    }
  }
  return out
}

export function findItem(d: Data, id: string): PracticeItem | undefined {
  const b = BUILTIN.get(id)
  if (b) return b
  const a = d.about.lines.find((x) => x.id === id)
  if (a) return { ...a, cat: 'Om mig' }
  const m = d.mine.find((x) => x.id === id)
  if (m) return { ...m, cat: 'Min parlør' }
  return undefined
}

function toCard(s: CardState): Card {
  return { ...s, due: new Date(s.due), last_review: s.last_review ? new Date(s.last_review) : undefined }
}

function fromCard(c: Card): CardState {
  return {
    due: c.due.toISOString(),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last_review: c.last_review?.toISOString(),
  }
}

/** Dagens kort: først dem, der skal gentages, så nye. */
export function buildSession(d: Data, size: number): string[] {
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  const pool = practicePool(d)
  const known = new Set(pool.map((p) => p.id))
  const due = Object.entries(d.cards)
    .filter(([id, c]) => known.has(id) && new Date(c.due) <= end)
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .map(([id]) => id)
  const ids = due.slice(0, size)
  for (const p of pool) {
    if (ids.length >= size) break
    if (!d.cards[p.id]) {
      ids.push(p.id)
    }
  }
  return ids
}

export function grade(id: string, ok: boolean) {
  const now = new Date()
  update((d) => {
    const prev = d.cards[id] ? toCard(d.cards[id]) : createEmptyCard(now)
    const next = f.next(prev, now, ok ? Rating.Good : Rating.Again).card
    const t = today()
    return {
      ...d,
      cards: { ...d.cards, [id]: fromCard(next) },
      days: ok ? { ...d.days, [t]: (d.days[t] ?? 0) + 1 } : d.days,
    }
  })
}

export function learnedCount(): number {
  return Object.values(getData().cards).filter((c) => c.reps > 0 && c.state === 2).length
}
