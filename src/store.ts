import { useSyncExternalStore } from 'react'
import type { Phrase } from './data/phrases'

// Alt gemmes på telefonen i localStorage.

export type Settings = {
  apiKey: string
  tripDate: string // yyyy-mm-dd
  tripPlace: string
  perDay: number
  theme: 'system' | 'light' | 'dark'
}

export type AboutMe = {
  name: string
  age: string
  work: string
  retired: boolean
  home: string
  woman: boolean
  lines: Phrase[]
  madeFrom?: string
}

export type CardState = {
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  learning_steps: number
  reps: number
  lapses: number
  state: number
  last_review?: string
}

export type Data = {
  settings: Settings
  about: AboutMe
  mine: Phrase[]
  cards: Record<string, CardState>
  spentKr: number
  days: Record<string, number> // dato -> antal kort øvet
}

const KEY = 'fala-v1'

const empty: Data = {
  settings: { apiKey: '', tripDate: '', tripPlace: 'Lissabon', perDay: 8, theme: 'system' },
  about: { name: '', age: '', work: '', retired: false, home: '', woman: false, lines: [] },
  mine: [],
  cards: {},
  spentKr: 0,
  days: {},
}

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty
    const d = JSON.parse(raw) as Partial<Data>
    return {
      ...empty,
      ...d,
      settings: { ...empty.settings, ...d.settings },
      about: { ...empty.about, ...d.about },
    }
  } catch {
    return empty
  }
}

let data = load()
const subs = new Set<() => void>()

export function getData(): Data {
  return data
}

export function update(fn: (d: Data) => Data) {
  data = fn(data)
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // fuld eller blokeret lagring: behold i hukommelsen
  }
  subs.forEach((s) => s())
}

export function useData(): Data {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb)
      return () => subs.delete(cb)
    },
    () => data,
  )
}

export function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function daysUntil(date: string): number | null {
  if (!date) return null
  const [y, m, d] = date.split('-').map(Number)
  const t = new Date(y, m - 1, d).getTime()
  const n = new Date()
  const now = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime()
  return Math.round((t - now) / 86400000)
}
