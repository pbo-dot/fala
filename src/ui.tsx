import { useEffect, useState } from 'react'
import type { Phrase } from './data/phrases'
import { Icon } from './icons'
import { speak } from './speech'

export function PhraseRow({ ph, onDelete }: { ph: Phrase; onDelete?: () => void }) {
  return (
    <div className="prow">
      <span className="grow">
        <b lang="pt-PT">{ph.pt}</b>
        <span className="lydsm">{ph.say}</span>
        <span>{ph.da}</span>
        {ph.note && <span className="pnote">{ph.note}</span>}
      </span>
      {onDelete && (
        <button className="round plain" onClick={onDelete} aria-label="Fjern">
          <Icon n="trash" s={20} />
        </button>
      )}
      <button className="round" onClick={() => speak(ph.pt)} aria-label={`Hør ${ph.pt}`}>
        <Icon n="speaker" />
      </button>
    </div>
  )
}

export function BigText({ pt, da, onClose }: { pt: string; da?: string; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="big-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <button className="round close" aria-label="Luk" onClick={onClose}>
        <Icon n="close" />
      </button>
      <div className="huge" lang="pt-PT">
        {pt}
      </div>
      {da && <div className="da">{da}</div>}
    </div>
  )
}

export function Header({ title, back, right }: { title: string; back?: string; right?: React.ReactNode }) {
  return (
    <header className="top">
      {back && (
        <a className="round" href={back} aria-label="Tilbage">
          <Icon n="back" />
        </a>
      )}
      <h1 className={back ? 'h-small grow' : 'grow'}>{title}</h1>
      {right}
    </header>
  )
}

export function useHash(): string {
  const [h, setH] = useState(location.hash || '#/')
  useEffect(() => {
    const f = () => {
      setH(location.hash || '#/')
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return h
}
