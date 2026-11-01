import { useState } from 'react'
import { kr } from '../ai'
import { hasPtVoice, speak } from '../speech'
import { update, useData, type Settings as S } from '../store'
import { Header } from '../ui'

export function Settings() {
  const d = useData()
  const s = d.settings
  const [showKey, setShowKey] = useState(false)
  const set = <K extends keyof S>(k: K, v: S[K]) => update((x) => ({ ...x, settings: { ...x.settings, [k]: v } }))
  const voice = hasPtVoice()

  return (
    <main className="page screen">
      <Header title="Indstillinger" back="#/" />

      <section className="card form">
        <b>Ferien</b>
        <label htmlFor="date">Afrejse</label>
        <input id="date" type="date" value={s.tripDate} onChange={(e) => set('tripDate', e.target.value)} />
        <label htmlFor="place">Hvortil</label>
        <input id="place" type="text" value={s.tripPlace} onChange={(e) => set('tripPlace', e.target.value)} placeholder="Lissabon" />
        <p className="hintline">Så står der fx "12 dage til Lissabon" i toppen.</p>
      </section>

      <section className="card form">
        <b>Øvning</b>
        <label>Sætninger om dagen</label>
        <div className="seg">
          {[5, 8, 12].map((n) => (
            <button key={n} className={s.perDay === n ? 'on' : ''} onClick={() => set('perDay', n)}>
              {n}
            </button>
          ))}
        </div>
      </section>

      <section className="card form">
        <b>Oplæsning</b>
        <p className="hintline">
          {voice
            ? 'Telefonen har en portugisisk stemme fra Portugal.'
            : 'Fandt ingen stemme fra Portugal. På Android: Indstillinger → Tekst til tale → Google → installer "Portugisisk (Portugal)".'}
        </p>
        <div className="actions">
          <button className="btn tonal" onClick={() => speak('Olá! Bom dia. Uma bica, por favor.')}>
            Prøv stemmen
          </button>
        </div>
      </section>

      <section className="card form">
        <b>Claude</b>
        <p className="hintline">Bruges kun til "Sig det" og "Om mig". Nøglen gemmes kun på telefonen.</p>
        <label htmlFor="key">Din nøgle</label>
        <input
          id="key"
          type={showKey ? 'text' : 'password'}
          value={s.apiKey}
          onChange={(e) => set('apiKey', e.target.value.trim())}
          placeholder="sk-ant-…"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="actions">
          <button className="btn text small" onClick={() => setShowKey((v) => !v)}>
            {showKey ? 'Skjul' : 'Vis'}
          </button>
        </div>
        <p className="hintline">Brugt indtil nu: {kr(d.spentKr)} (skøn)</p>
      </section>

      <section className="card form">
        <b>Udseende</b>
        <div className="seg" style={{ marginTop: 10 }}>
          {(
            [
              ['system', 'Som telefonen'],
              ['light', 'Lys'],
              ['dark', 'Mørk'],
            ] as const
          ).map(([v, l]) => (
            <button key={v} className={s.theme === v ? 'on' : ''} onClick={() => set('theme', v)}>
              {l}
            </button>
          ))}
        </div>
      </section>

      <div className="center">
        <button
          className="btn text danger"
          onClick={() => {
            if (confirm('Start øvningen forfra? Din parlør og Om mig bliver ikke slettet.')) update((x) => ({ ...x, cards: {}, days: {}, log: {} }))
          }}
        >
          Start øvningen forfra
        </button>
      </div>
    </main>
  )
}
