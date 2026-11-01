import { useEffect, useRef, useState } from 'react'
import { Icon } from '../icons'
import { canListen, judge, listen, speak, type Verdict } from '../speech'
import { buildSession, findItem, grade } from '../srs'
import { daysUntil, getData, today, useData } from '../store'
import { Header } from '../ui'

// Dagens øvelse huskes, mens appen er åben, så man kan skifte fane uden at miste stedet.
let session: { date: string; queue: string[]; total: number; done: number } | null = null

function newSession() {
  const d = getData()
  const queue = buildSession(d, d.settings.perDay)
  session = { date: today(), queue, total: queue.length, done: 0 }
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
    if ((d.days[today()] ?? 0) >= d.settings.perDay) session = { date: today(), queue: [], total: 0, done: 0 }
    else newSession()
  }
  const [, force] = useState(0)
  const [verdict, setVerdict] = useState<Verdict | 'listening' | 'error' | null>(null)
  const stopRef = useRef<() => void>(() => {})

  const s = session!
  const id = s.queue[0]
  const item = id ? findItem(d, id) : undefined

  useEffect(() => () => stopRef.current(), [])
  useEffect(() => {
    setVerdict(null)
  }, [id])

  const cd = countdown(d.settings.tripDate, d.settings.tripPlace)
  const header = (
    <Header
      title="Fala"
      right={
        <>
          {cd && <span className="muted small">{cd}</span>}
          <a className="round plain" href="#/indstillinger" aria-label="Indstillinger">
            <Icon n="gear" />
          </a>
        </>
      }
    />
  )

  if (!item) {
    const practiced = d.days[today()] ?? 0
    return (
      <main className="page screen">
        {header}
        <article className="card done">
          <div className="ring">
            <Icon n="check" s={36} />
          </div>
          <h2>Godt klaret!</h2>
          <p className="muted">
            {practiced > 0 ? `Du har øvet ${practiced} ${practiced === 1 ? 'sætning' : 'sætninger'} i dag.` : 'Ikke mere at øve lige nu.'} Kom
            tilbage i morgen.
          </p>
          <div className="actions" style={{ justifyContent: 'center' }}>
            <button
              className="btn tonal"
              onClick={() => {
                newSession()
                force((x) => x + 1)
              }}
            >
              <Icon n="plus" /> Øv lidt mere
            </button>
          </div>
        </article>
      </main>
    )
  }

  const pos = s.done + 1
  const total = Math.max(s.total, pos)

  const rate = (ok: boolean) => {
    stopRef.current()
    grade(item.id, ok)
    const [first, ...rest] = s.queue
    if (ok) {
      s.queue = rest
      s.done++
    } else {
      // "Igen": kortet kommer igen senere i dag, efter et par andre.
      rest.splice(Math.min(2, rest.length), 0, first)
      s.queue = rest
    }
    setVerdict(null)
    force((x) => x + 1)
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
      <article className="card answer" key={item.id}>
        <div className="kicker">
          {item.cat} · {pos} af {total}
        </div>
        <div className="big-pt" lang="pt-PT">
          {item.pt}
        </div>
        <div className="lyd">{item.say}</div>
        <div className="da">{item.da}</div>
        <div className="actions">
          <button className="btn filled" onClick={() => speak(item.pt)}>
            <Icon n="speaker" /> Hør
          </button>
          <button className="btn tonal" onClick={() => speak(item.pt, true)}>
            <Icon n="slow" /> Langsomt
          </button>
          {canListen() && (
            <button className={`btn ${verdict === 'listening' ? 'live' : 'tonal'}`} onClick={sayIt}>
              <Icon n={verdict === 'listening' ? 'stop' : 'mic'} /> {verdict === 'listening' ? 'Lytter …' : 'Sig det'}
            </button>
          )}
        </div>
        {item.note && verdict === null && <div className="note">{item.note}</div>}
        {verdict && verdict !== 'listening' && (
          <div className={`note ${verdict !== 'error' && verdict.level === 'good' ? 'good' : ''}`} role="status">
            {verdict === 'error'
              ? 'Mikrofonen virkede ikke. Den kræver net og lov til mikrofonen.'
              : verdict.level === 'good'
                ? `Godt sagt! Du sagde: "${verdict.heard}"`
                : verdict.level === 'close'
                  ? `Næsten! Du sagde: "${verdict.heard}"`
                  : `Prøv igen. Jeg hørte: "${verdict.heard}"`}
          </div>
        )}
      </article>
      <div className="two">
        <button className="btn tonal" onClick={() => rate(false)}>
          <Icon n="again" /> Igen
        </button>
        <button className="btn ok" onClick={() => rate(true)}>
          <Icon n="check" /> Kunne den
        </button>
      </div>
    </main>
  )
}
