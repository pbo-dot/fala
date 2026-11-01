import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Icon } from './icons'
import { AboutMe } from './screens/AboutMe'
import { Parlor } from './screens/Parlor'
import { SayIt } from './screens/SayIt'
import { Settings } from './screens/Settings'
import { Today } from './screens/Today'
import { useData } from './store'
import { useHash } from './ui'

const TABS = [
  { href: '#/', icon: 'sun', label: 'I dag', match: (h: string) => h === '#/' || h.startsWith('#/indstillinger') },
  { href: '#/parlor', icon: 'book', label: 'Parlør', match: (h: string) => h.startsWith('#/parlor') || h.startsWith('#/om-mig') },
  { href: '#/sig', icon: 'chat', label: 'Sig det', match: (h: string) => h.startsWith('#/sig') },
]

function UpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  if (!needRefresh) return null
  return (
    <div className="update-banner" role="status">
      <span className="grow">Ny udgave af Fala er klar.</span>
      <button className="btn small" onClick={() => updateServiceWorker(true)}>
        Opdater
      </button>
    </div>
  )
}

export default function App() {
  const h = useHash()
  const theme = useData().settings.theme

  useEffect(() => {
    const el = document.documentElement
    if (theme === 'system') delete el.dataset.theme
    else el.dataset.theme = theme
  }, [theme])

  let screen
  if (h.startsWith('#/parlor')) screen = <Parlor />
  else if (h.startsWith('#/om-mig')) screen = <AboutMe />
  else if (h.startsWith('#/sig')) screen = <SayIt />
  else if (h.startsWith('#/indstillinger')) screen = <Settings />
  else screen = <Today />

  return (
    <>
      <div key={h.split('?')[0]}>{screen}</div>
      <nav className="tabbar">
        {TABS.map((t) => {
          const on = t.match(h)
          return (
            <a key={t.href} href={t.href} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
              <span className="pill">
                <Icon n={t.icon} />
              </span>
              {t.label}
            </a>
          )
        })}
      </nav>
      <UpdateBanner />
    </>
  )
}
