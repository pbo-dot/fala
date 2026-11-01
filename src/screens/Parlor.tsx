import { useState } from 'react'
import { CATEGORIES, allItems } from '../data/phrases'
import { update, useData } from '../store'
import { Header, PhraseRow } from '../ui'

let lastTab = 'ord'

export function Parlor() {
  const d = useData()
  const [tab, setTab] = useState(lastTab)
  const choose = (t: string) => {
    lastTab = t
    setTab(t)
  }
  const cat = CATEGORIES.find((c) => c.id === tab)
  const aboutCount = d.about.lines.length

  return (
    <main className="page screen">
      <Header title="Parlør" />
      <div className="grid">
        <a className="tile" href="#/om-mig" style={{ textDecoration: 'none' }}>
          Om mig<span>{aboutCount ? `${aboutCount} sætninger` : 'Lav din egen'}</span>
        </a>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`tile ${tab === c.id ? 'on' : ''}`} onClick={() => choose(c.id)} aria-pressed={tab === c.id}>
            {c.name}
            <span>
              {allItems(c).length} {c.unit}
            </span>
          </button>
        ))}
        <button className={`tile ${tab === 'mine' ? 'on' : ''}`} onClick={() => choose('mine')} aria-pressed={tab === 'mine'}>
          Min parlør<span>{d.mine.length ? `${d.mine.length} sætninger` : 'Fra "Sig det"'}</span>
        </button>
      </div>
      <p className="legend">
        <b>STORE</b> bogstaver = tryk · ë = svagt e · sj som i "sjov" · ã õ ĩ = gennem næsen
      </p>

      {cat &&
        cat.groups.map((g) => (
          <section key={g.title}>
            <div className="sec">{g.title}</div>
            {g.items.map((ph) => (
              <PhraseRow key={ph.id} ph={ph} />
            ))}
          </section>
        ))}

      {tab === 'mine' && (
        <section>
          <div className="sec">Min parlør</div>
          {d.mine.length === 0 && (
            <section className="card notice">
              <b>Tom endnu</b>
              <span>Brug "Sig det" og tryk "+ Læg i min parlør". Så kommer sætningen her og med i øvningen.</span>
            </section>
          )}
          {d.mine.map((ph) => (
            <PhraseRow
              key={ph.id}
              ph={ph}
              onDelete={() => {
                if (!confirm(`Fjern "${ph.pt}" fra din parlør?`)) return
                update((x) => {
                  const cards = { ...x.cards }
                  delete cards[ph.id]
                  return { ...x, mine: x.mine.filter((m) => m.id !== ph.id), cards }
                })
              }}
            />
          ))}
        </section>
      )}
    </main>
  )
}
