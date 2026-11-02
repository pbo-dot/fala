import { useEffect, useRef, useState } from 'react'
import { Icon } from '../icons'
import { canListen, judge, listen, speak, type Verdict } from '../speech'
import { buildSession, findItem, grade } from '../srs'
import { daysUntil, getData, today, useData } from '../store'
import { Header, PhraseRow } from '../ui'

// Dagens øvelse: først "lær" (alt synligt), så "husker du?" med de samme sætninger (kun dansk).
// Gemmes på telefonen, så man kan lukke appen midt i og fortsætte.
type Session = {
  date: string
  phase: 'learn' | 'test' | 'done'
  queue: string[]
  total: number
  done: number
  learned: string[]
  missed: string[]
  tested: number
}

const SKEY = 'fala-session'
let session: Session | null = null

function save() {
  try {
    localStorage.setItem(SKEY, JSON.stringify(session))
  } catch {
    /* ignorer */
  }
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SKEY)
    const x = raw ? (JSON.parse(raw) as Session) : null
    return x && x.date === today() && Array.isArray(x.queue) && x.phase ? x : null
  } catch {
    return null
  }
}

function newSession() {
  const d = getData()
  const queue = buildSession(d, d.settings.perDay)
  session = { date: today(), phase: queue.length ? 'learn' : 'done', queue, total: queue.length, done: 0, learned: [], missed: [], tested: 0 }
  save()
}

function shuffle<T>(a: T[]): T[] {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

function countdown(date: string, place: string): string | null {
  const n = daysUntil(date)
  if (n === null || n < 0) return null
  const to = place.trim() || 'Portugal'
  if (n === 0) return `I dag: ${to}!`
  if (n === 1) return `1 dag til ${to}`
  return `${n} dage til ${to}`
}

export function Today() {
  const d = useData()
  if (!session || session.date !== today()) {
    session = loadSession()
    if (!session) {
      if ((d.days[today()] ?? 0) >= d.settings.perDay) {
        session = { date: today(), phase: 'done', queue: [], total: 0, done: 0, learned: [], missed: [], tested: 0 }
        save()
      } else newSession()
    }
  }
  const [, force] = useState(0)
  const [verdict, setVerdict] = useState<Verdict | 'listening' | 'error' | null>(null)
  const [shown, setShown] = useState(false)
  const stopRef = useRef<() => void>(() => {})

  const s = session!
  const id = s.queue[0]
  const item = id ? findItem(d, id) : undefined
  const testing = s.phase === 'test'

  useEffect(() => () => stopRef.current(), [])
  useEffect(() => {
    setVerdict(null)
    setShown(false)
  }, [id, s.phase])

  const cd = countdown(d.settings.tripDate, d.settings.tripPlace)
  const header = (
    <Header
      title="Fala"
      right={
        <>
          {cd && <span className="muted small">{cd}</span>}
          {Object.keys(d.log).length > 0 && (
            <a className="round plain" href="#/laert" aria-label="Det har jeg lært">
              <Icon n="days" />
            </a>
          )}
          <a className="round plain" href="#/indstillinger" aria-label="Indstillinger">
            <Icon n="gear" />
          </a>
        </>
      }
    />
  )

  if (!item) {
    const practiced = d.days[today()] ?? 0
    const learned = (d.log[today()] ?? []).map((x) => findItem(d, x)).filter((x) => x !== undefined)
    return (
      <main className="page screen">
        {header}
        <article className="card done">
          <div className="ring">
            <Icon n="check" s={32} />
          </div>
          <div>
            <h2>Godt klaret!</h2>
            <span className="muted">
              {practiced > 0 ? `${practiced} ${practiced === 1 ? 'sætning' : 'sætninger'} i dag` : 'Ikke mere at øve lige nu'}
            </span>
            {s.tested > 0 && (
              <span className="muted" style={{ display: 'block' }}>
                Husket første gang: {s.tested - s.missed.length} af {s.tested}
              </span>
            )}
          </div>
        </article>
        {learned.length > 0 && (
          <>
            <div className="sec">Det lærte du i dag</div>
            {learned.map((ph) => (
              <PhraseRow key={ph.id} ph={ph} />
            ))}
          </>
        )}
        <div className="actions" style={{ justifyContent: 'center' }}>
          <a className="btn tonal" href="#/laert">
            <Icon n="days" /> Tidligere dage
          </a>
          <button
            className="btn text"
            onClick={() => {
              newSession()
              force((x) => x + 1)
            }}
          >
            <Icon n="plus" /> Øv mere
          </button>
        </div>
      </main>
    )
  }

  const pos = s.done + 1
  const total = Math.max(s.total, pos)

  const next = () => {
    if (s.queue.length === 0) {
      if (s.phase === 'learn' && s.learned.length > 0) {
        s.phase = 'test'
        s.queue = shuffle(s.learned)
        s.total = s.queue.length
        s.tested = s.queue.length
        s.done = 0
        s.missed = []
      } else s.phase = 'done'
    }
    save()
    setVerdict(null)
    setShown(false)
    force((x) => x + 1)
    window.scrollTo(0, 0)
  }

  const rate = (ok: boolean) => {
    stopRef.current()
    const [first, ...rest] = s.queue
    if (testing) {
      // "Husker du?": glemt → FSRS får besked (én gang), og sætningen kommer igen om lidt.
      if (!ok && !s.missed.includes(item.id)) {
        s.missed.push(item.id)
        grade(item.id, false)
      }
    } else {
      grade(item.id, ok)
      if (ok && !s.learned.includes(item.id)) s.learned.push(item.id)
    }
    if (ok) {
      s.queue = rest
      s.done++
    } else {
      // "Igen": kortet kommer igen senere, efter et par andre.
      rest.splice(Math.min(2, rest.length), 0, first)
      s.queue = rest
    }
    next()
  }

  const sayIt = () => {
    if (verdict === 'listening') {
      stopRef.current()
      return
    }
    speechSynthesis?.cancel()
    setVerdict('listening')
    stopRef.current = listen('pt-PT', (heard, err) => {
      if (!heard.length) {
        setVerdict(err === 'no-speech' || err === 'aborted' ? null : 'error')
        return
      }
      setVerdict(judge(item.pt, heard))
      setShown(true)
    })
  }

  return (
    <main className="page screen">
      {header}
      <div className="prog" aria-label={`${pos - 1} af ${total} klaret`}>
        {Array.from({ length: total }, (_, i) => (
          <i key={i} className={i < s.done ? 'on' : ''} />
        ))}
      </div>
      <article className="card answer" key={`${s.phase}-${item.id}`}>
        <div className="kicker">
          {testing ? 'Husker du?' : item.cat} · {pos} af {total}
        </div>
        {testing && !shown ? (
          <>
            <div className="ask">{item.da}</div>
            <div className="muted">Sig det på portugisisk.</div>
            {s.done === 0 && s.missed.length === 0 && <div className="note">Nu de samme sætninger igen, kun på dansk. Kan du huske dem?</div>}
            <div className="hidden-pt">Portugisisk skjult</div>
          </>
        ) : (
          <>
            {testing && <div className="da-small">{item.da}</div>}
            <div className="big-pt" lang="pt-PT">
              {item.pt}
            </div>
            <div className="lyd">{item.say}</div>
            {!testing && <div className="da">{item.da}</div>}
          </>
        )}
        <div className="actions">
          {(!testing || shown) && (
            <>
              <button className="btn filled" onClick={() => speak(item.pt)}>
                <Icon n="speaker" /> Hør
              </button>
              <button className="btn tonal" onClick={() => speak(item.pt, true)}>
                <Icon n="slow" /> Langsomt
              </button>
            </>
          )}
          {canListen() && (!testing || !shown) && (
            <button className={`btn ${verdict === 'listening' ? 'live' : 'tonal'}`} onClick={sayIt}>
              <Icon n={verdict === 'listening' ? 'stop' : 'mic'} /> {verdict === 'listening' ? 'Lytter …' : 'Sig det'}
            </button>
          )}
        </div>
        {item.note && verdict === null && (!testing || shown) && <div className="note">{item.note}</div>}
        {verdict && verdict !== 'listening' && (
          <div className={`note ${verdict !== 'error' && verdict.level === 'good' ? 'good' : ''}`} role="status">
            {verdict === 'error'
              ? 'Mikrofonen virkede ikke. Den kræver net og lov til mikrofonen.'
              : verdict.level === 'good'
                ? `Godt sagt! Du sagde: "${verdict.heard}"`
                : verdict.level === 'close'
                  ? `Næsten! Du sagde: "${verdict.heard}"`
                  : `Ikke helt. Jeg hørte: "${verdict.heard}"`}
          </div>
        )}
      </article>
      {testing && !shown ? (
        <div className="two">
          <button
            className="btn filled"
            onClick={() => {
              stopRef.current()
              setShown(true)
              speak(item.pt)
            }}
          >
            <Icon n="eye" /> Vis svar
          </button>
        </div>
      ) : (
        <div className="two">
          <button className="btn tonal" onClick={() => rate(false)}>
            <Icon n="again" /> Igen
          </button>
          <button className="btn ok" onClick={() => rate(true)}>
            <Icon n="check" /> Kunne den
          </button>
        </div>
      )}
    </main>
  )
}
