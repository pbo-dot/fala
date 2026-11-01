import { useEffect, useRef, useState } from 'react'
import { errorText, kr, translate, type Translation } from '../ai'
import { Icon } from '../icons'
import { canListen, listen, speak } from '../speech'
import { update, useData } from '../store'
import { BigText, Header } from '../ui'

// Sidste svar huskes, mens appen er åben.
let last: { q: string; t: Translation; cost: number } | null = null

export function SayIt() {
  const d = useData()
  const [q, setQ] = useState(last?.q ?? '')
  const [res, setRes] = useState(last)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [listening, setListening] = useState(false)
  const [big, setBig] = useState(false)
  const stopRef = useRef<() => void>(() => {})

  useEffect(() => () => stopRef.current(), [])

  const go = async (text: string) => {
    const t = text.trim()
    if (!t || busy) return
    setBusy(true)
    setErr('')
    try {
      const { value, kr: cost } = await translate(t)
      last = { q: t, t: value, cost }
      setRes(last)
    } catch (e) {
      setErr(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  const mic = () => {
    if (listening) {
      stopRef.current()
      return
    }
    setListening(true)
    setErr('')
    stopRef.current = listen('da-DK', (heard, e) => {
      setListening(false)
      if (heard[0]) {
        setQ(heard[0])
        go(heard[0])
      } else if (e && e !== 'no-speech' && e !== 'aborted') setErr('Mikrofonen virkede ikke. Den kræver net og lov til mikrofonen.')
    })
  }

  const saved = res ? d.mine.some((m) => m.pt === res.t.portugisisk) : false

  const save = () => {
    if (!res || saved) return
    const t = res.t
    update((x) => ({
      ...x,
      mine: [...x.mine, { id: `mine-${Date.now()}`, pt: t.portugisisk, say: t.udtale, da: t.dansk, note: t.note || undefined }],
    }))
  }

  return (
    <main className="page screen">
      <Header title="Sig det" />
      <form
        className="askbar"
        onSubmit={(e) => {
          e.preventDefault()
          go(q)
        }}
      >
        {canListen() && (
          <button type="button" className={`round ${listening ? 'live' : ''}`} onClick={mic} aria-label={listening ? 'Stop' : 'Sig det på dansk'}>
            <Icon n={listening ? 'stop' : 'mic'} />
          </button>
        )}
        <textarea
          rows={1}
          value={q}
          placeholder={listening ? 'Lytter …' : 'Skriv på dansk, fx Hvor er toilettet?'}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              go(q)
            }
          }}
          aria-label="Det du vil sige, på dansk"
          enterKeyHint="send"
        />
        <button type="submit" className="round filled" disabled={!q.trim() || busy} aria-label="Oversæt">
          <Icon n="send" />
        </button>
      </form>

      {!d.settings.apiKey && (
        <section className="card notice">
          <b>Kræver din Claude-nøgle</b>
          <span>
            Indsæt den under <a href="#/indstillinger">Indstillinger</a>. Parløren og øvningen virker uden.
          </span>
        </section>
      )}

      {busy && (
        <article className="card answer loading">
          <span className="dot-pulse" /> Finder det på portugisisk …
        </article>
      )}
      {err && <p className="error">{err}</p>}

      {res && !busy && (
        <>
          <article className="card answer">
            <div className="kicker">Portugisisk (Portugal)</div>
            <div className="big-pt" lang="pt-PT">
              {res.t.portugisisk}
            </div>
            <div className="lyd">{res.t.udtale}</div>
            <div className="da">{res.t.dansk}</div>
            <div className="actions">
              <button className="btn filled" onClick={() => speak(res.t.portugisisk)}>
                <Icon n="speaker" /> Hør
              </button>
              <button className="btn tonal" onClick={() => speak(res.t.portugisisk, true)}>
                <Icon n="slow" /> Langsomt
              </button>
              <button className="btn tonal" onClick={() => setBig(true)}>
                <Icon n="expand" /> Vis stort
              </button>
            </div>
            {res.t.note && <div className="note">{res.t.note}</div>}
          </article>
          <div className="center">
            <button className="btn text" onClick={save} disabled={saved}>
              {saved ? (
                <>
                  <Icon n="check" /> I din parlør
                </>
              ) : (
                <>
                  <Icon n="plus" /> Læg i min parlør
                </>
              )}
            </button>
          </div>
          <p className="cost">Svaret kostede {kr(res.cost)}</p>
        </>
      )}
      {big && res && <BigText pt={res.t.portugisisk} da={res.t.dansk} onClose={() => setBig(false)} />}
    </main>
  )
}
