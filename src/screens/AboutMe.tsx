import { useState } from 'react'
import { errorText, kr, makeAbout } from '../ai'
import type { Phrase } from '../data/phrases'
import { Icon } from '../icons'
import { update, useData, type AboutMe as About } from '../store'
import { Header, PhraseRow } from '../ui'

// Skabelonen fra udkastet, vist før ejeren har lavet sine egne sætninger.
const TEMPLATE: Phrase[] = [
  { id: 't1', pt: 'Olá, chamo-me …', say: 'o-LA, SJA-mu-më …', da: 'Hej, jeg hedder …' },
  { id: 't2', pt: 'Sou dinamarquês.', say: 'so di-na-mar-KESJ', da: 'Jeg er dansker. (mand)', note: 'En kvinde siger "Sou dinamarquesa" (di-na-mar-KE-za).' },
  { id: 't3', pt: 'Tenho … anos.', say: 'TÆ-nju … A-nusj', da: 'Jeg er … år.' },
  { id: 't4', pt: 'Trabalho como …', say: 'tra-BA-lju KO-mu …', da: 'Jeg arbejder som …' },
  { id: 't5', pt: 'Estou reformado.', say: 'sjTO Rë-fur-MA-du', da: 'Jeg er pensionist. (mand)', note: 'En kvinde siger "reformada".' },
  { id: 't6', pt: 'Sou de …', say: 'so dë …', da: 'Jeg er fra …' },
  { id: 't7', pt: 'Estou de férias.', say: 'sjTO dë FÆ-rjasj', da: 'Jeg er på ferie.' },
]

export function AboutMe() {
  const d = useData()
  const a = d.about
  const [form, setForm] = useState<About>(a)
  const [editing, setEditing] = useState(a.lines.length === 0)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const set = <K extends keyof About>(k: K, v: About[K]) => setForm((f) => ({ ...f, [k]: v }))

  const make = async () => {
    setBusy(true)
    setMsg('')
    try {
      const { value, kr: cost } = await makeAbout(form)
      update((x) => {
        // Nye sætninger: start øvningen af dem forfra.
        const cards = Object.fromEntries(Object.entries(x.cards).filter(([id]) => !id.startsWith('me-')))
        return { ...x, cards, about: { ...form, lines: value } }
      })
      setEditing(false)
      setMsg(`Færdig. Det kostede ${kr(cost)}.`)
    } catch (e) {
      setMsg(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  const lines = a.lines.length ? a.lines : TEMPLATE

  return (
    <main className="page screen">
      <Header title="Om mig" back="#/parlor" />
      {editing ? (
        <section className="card form">
          <b>Dine oplysninger</b>
          <p className="muted small" style={{ margin: '4px 0 0' }}>
            Fala laver sætningerne til dig med Claude én gang og gemmer dem på telefonen.
          </p>
          <label htmlFor="n">Navn</label>
          <input id="n" type="text" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="given-name" />
          <label htmlFor="age">Alder</label>
          <input id="age" type="number" inputMode="numeric" value={form.age} onChange={(e) => set('age', e.target.value)} />
          <label>Jeg er</label>
          <div className="seg">
            <button className={!form.woman ? 'on' : ''} onClick={() => set('woman', false)}>
              Mand
            </button>
            <button className={form.woman ? 'on' : ''} onClick={() => set('woman', true)}>
              Kvinde
            </button>
          </div>
          <label className="switch">
            <input type="checkbox" checked={form.retired} onChange={(e) => set('retired', e.target.checked)} /> Jeg er pensionist
          </label>
          {!form.retired && (
            <>
              <label htmlFor="w">Arbejde</label>
              <input id="w" type="text" value={form.work} onChange={(e) => set('work', e.target.value)} placeholder="fx lærer" />
            </>
          )}
          <label htmlFor="h">Hjemby</label>
          <input id="h" type="text" value={form.home} onChange={(e) => set('home', e.target.value)} placeholder="fx Aarhus" />
          <div className="actions">
            <button className="btn filled" onClick={make} disabled={busy || !form.name.trim()}>
              {busy ? <span className="dot-pulse" /> : <Icon n="sparkle" />} {busy ? 'Laver sætninger …' : 'Lav mine sætninger'}
            </button>
            {a.lines.length > 0 && (
              <button className="btn text" onClick={() => setEditing(false)}>
                Fortryd
              </button>
            )}
          </div>
          {msg && <p className="hint">{msg}</p>}
        </section>
      ) : (
        <section className="card notice">
          <b>Dine oplysninger</b>
          <span>
            {[a.name, a.age && `${a.age} år`, a.retired ? 'pensionist' : a.work, a.home].filter(Boolean).join(' · ')}
          </span>
          <div className="actions" style={{ marginBottom: 0 }}>
            <button className="btn text small" style={{ paddingLeft: 0 }} onClick={() => setEditing(true)}>
              <Icon n="edit" s={18} /> Ret
            </button>
          </div>
          {msg && <p className="hint">{msg}</p>}
        </section>
      )}
      {!a.lines.length && <div className="sec">Sådan kommer det til at lyde</div>}
      {lines.map((ph) => (
        <PhraseRow key={ph.id} ph={ph} />
      ))}
    </main>
  )
}
