// Claude-biblioteket er stort, så det hentes først, når det bruges.
import type { Phrase } from './data/phrases'
import type { AboutMe } from './store'
import type { Translation } from './claude'

export type { Translation }

async function run<T>(fn: (m: typeof import('./claude')) => Promise<T>): Promise<T> {
  const m = await import('./claude')
  try {
    return await fn(m)
  } catch (e) {
    throw new Error(m.errorText(e), { cause: e })
  }
}

export const translate = (danish: string) => run((m) => m.translate(danish))
export const makeAbout = (info: AboutMe): Promise<{ value: Phrase[]; kr: number }> => run((m) => m.makeAbout(info))

export function kr(n: number): string {
  if (n < 0.01) return 'under 1 øre'
  if (n < 1) return `ca. ${Math.max(1, Math.round(n * 100))} øre`
  return `ca. ${n.toFixed(2).replace('.', ',')} kr.`
}

export function errorText(e: unknown): string {
  return e instanceof Error ? e.message : 'Noget gik galt. Prøv igen.'
}
