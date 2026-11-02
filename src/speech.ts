// Oplæsning (speechSynthesis, pt-PT) og udtaletjek (SpeechRecognition, pt-PT).

let ptVoice: SpeechSynthesisVoice | null = null

function pickVoice() {
  if (!('speechSynthesis' in window)) return
  const voices = speechSynthesis.getVoices()
  const norm = (l: string) => l.replace('_', '-').toLowerCase()
  ptVoice =
    voices.find((v) => norm(v.lang) === 'pt-pt' && /google|natural|online/i.test(v.name)) ??
    voices.find((v) => norm(v.lang) === 'pt-pt') ??
    null
}

if ('speechSynthesis' in window) {
  pickVoice()
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice)
}

export type VoiceInfo = { name: string; lang: string; local: boolean } | null

/** Den stemme, Fala bruger, og om telefonen kun har brasilianske stemmer. */
export function voiceInfo(): { voice: VoiceInfo; onlyBrazil: boolean } {
  pickVoice()
  const all = 'speechSynthesis' in window ? speechSynthesis.getVoices() : []
  const br = all.some((v) => v.lang.replace('_', '-').toLowerCase() === 'pt-br')
  return {
    voice: ptVoice ? { name: ptVoice.name, lang: ptVoice.lang.replace('_', '-'), local: ptVoice.localService } : null,
    onlyBrazil: !ptVoice && br,
  }
}

export function onVoicesChanged(cb: () => void): () => void {
  if (!('speechSynthesis' in window)) return () => {}
  speechSynthesis.addEventListener?.('voiceschanged', cb)
  return () => speechSynthesis.removeEventListener?.('voiceschanged', cb)
}

/** Fjerner "…" og pladsholdere, så de ikke læses op. */
export function speakable(text: string): string {
  return text.replace(/…|\.\.\./g, ' ').replace(/\s+/g, ' ').trim()
}

export function speak(text: string, slow = false, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(speakable(text))
  u.lang = 'pt-PT'
  if (ptVoice) u.voice = ptVoice
  u.rate = slow ? 0.55 : 0.9
  if (onEnd) {
    u.onend = onEnd
    u.onerror = onEnd
  }
  speechSynthesis.speak(u)
}

type Rec = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function recCtor(): (new () => Rec) | null {
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function canListen(): boolean {
  return recCtor() !== null
}

/** Lyt én gang. Giver de hørte alternativer, eller en fejlkode. */
export function listen(lang: string, done: (heard: string[], error?: string) => void): () => void {
  const C = recCtor()
  if (!C) {
    done([], 'not-supported')
    return () => {}
  }
  const r = new C()
  r.lang = lang
  r.interimResults = false
  r.maxAlternatives = 5
  r.continuous = false
  let finished = false
  const finish = (heard: string[], error?: string) => {
    if (finished) return
    finished = true
    done(heard, error)
  }
  r.onresult = (e) => {
    const res = e.results[0]
    const alts: string[] = []
    for (let i = 0; i < res.length; i++) alts.push(res[i].transcript)
    finish(alts)
  }
  r.onerror = (e) => finish([], e.error)
  r.onend = () => finish([], 'no-speech')
  try {
    r.start()
  } catch {
    finish([], 'start-failed')
  }
  return () => {
    try {
      r.stop()
    } catch {
      /* ignorer */
    }
  }
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function lev(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const row = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return row[n]
}

/** Hvor tæt det hørte er på sætningen, 0–1. Løs sammenligning. */
export function similarity(target: string, heard: string): number {
  const a = normalize(speakable(target))
  const b = normalize(heard)
  if (!a || !b) return 0
  return 1 - lev(a, b) / Math.max(a.length, b.length)
}

export type Verdict = { level: 'good' | 'close' | 'miss'; heard: string }

export function judge(target: string, alts: string[]): Verdict {
  let best = { score: -1, heard: alts[0] ?? '' }
  for (const h of alts) {
    const s = similarity(target, h)
    if (s > best.score) best = { score: s, heard: h }
  }
  const level = best.score >= 0.8 ? 'good' : best.score >= 0.5 ? 'close' : 'miss'
  return { level, heard: best.heard }
}
