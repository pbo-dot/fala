import { useState } from 'react'
import { Icon } from '../icons'
import { normalize } from '../speech'
import { findItem } from '../srs'
import { useData } from '../store'
import { Header, PhraseRow } from '../ui'

function toDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function ago(iso: string): number {
  const n = new Date()
  const now = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime()
  return Math.round((now - toDate(iso).getTime()) / 86400000)
}

function shortLabel(iso: string): string {
  const a = ago(iso)
  if (a === 0) return 'I dag'
  if (a === 1) return 'I går'
  const s = toDate(iso)
    .toLocaleDateString('da-DK', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(/\./g, '')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function longLabel(iso: string): string {
  const a = ago(iso)
  const s = toDate(iso).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })
  if (a === 0) return `I dag · ${s}`
  if (a === 1) return `I går · ${s}`
  return `${s} · ${a} dage siden`
}

let lastDay = 'alle'

export function Learned() {
  const d = useData()
  const [q, setQ] = useState('')
  const [day, setDay] = useState(lastDay)
  const choose = (x: string) => {
    lastDay = x
    setDay(x)
  }

  const dates = Object.keys(d.log)
    .filter((k) => d.log[k].length > 0)
    .sort()
    .reverse()
  const needle = normalize(q)
  const sel = dates.includes(day) ? day : 'alle'
  const shown = (needle || sel === 'alle' ? dates : dates.filter((x) => x === sel)).map((date) => ({
    date,
    items: d.log[date]
      .map((id) => findItem(d, id))
      .filter((x) => x !== undefined)
      .filter((ph) => !needle || normalize(`${ph.pt} ${ph.da} ${ph.say}`).includes(needle)),
  }))
  const any = shown.some((g) => g.items.length > 0)

  return (
    <main className="page screen">
      <Header title="Det har jeg lært" back="#/" />
      <label className="search">
        <Icon n="search" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søg på dansk eller portugisisk" aria-label="Søg" />
        {q && (
          <button className="round clear" onClick={() => setQ('')} aria-label="Ryd søgning">
            <Icon n="close" />
          </button>
        )}
      </label>
      {!needle && dates.length > 0 && (
        <div className="chips days" role="group" aria-label="Vælg dag">
          <button className={`chip ${sel === 'alle' ? 'on' : ''}`} onClick={() => choose('alle')} aria-pressed={sel === 'alle'}>
            Alle
          </button>
          {dates.map((x) => (
            <button key={x} className={`chip ${sel === x ? 'on' : ''}`} onClick={() => choose(x)} aria-pressed={sel === x}>
              {shortLabel(x)}
            </button>
          ))}
        </div>
      )}

      {dates.length === 0 && (
        <section className="card notice">
          <b>Intet endnu</b>
          <span>Når du trykker "Kunne den" i I dag, kommer sætningen her under dagen.</span>
        </section>
      )}
      {dates.length > 0 && !any && <p className="center muted">Ingen sætninger passer på "{q}".</p>}

      {shown
        .filter((g) => g.items.length > 0)
        .map((g) => (
          <section key={g.date}>
            <div className="sec row2">
              <span>{longLabel(g.date)}</span>
              <span>
                {g.items.length} {g.items.length === 1 ? 'sætning' : 'sætninger'}
              </span>
            </div>
            {g.items.map((ph) => (
              <PhraseRow key={ph.id} ph={ph} />
            ))}
          </section>
        ))}
    </main>
  )
}
