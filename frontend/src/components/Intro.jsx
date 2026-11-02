import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore.js'
import { t } from '../lib/i18n.js'
import { setUp } from '../lib/onboarding.js'
import Buddy from './Buddy.jsx'

// The app intro, once each time ISORA is opened (not on every tab switch or reload of a sheet):
// the speech bubble pops up, the three blocks of the I drop into it like Rest Blast pieces, the
// name rises, and the app zooms in through the bubble. The very first time, before you have met
// Iso, it is longer: Iso hops on and waves. A tap skips it; under reduced motion there is none.

const SEEN = 'isora_intro'
const FULL_MS = 3300, SHORT_MS = 1750

// decided once per page load (StrictMode runs state initialisers twice; the second would see the mark)
let decided = null
const shouldShow = () => decided ??= decide()
const decide = () => {
  if (import.meta.env.MODE === 'test') return false
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
    if (sessionStorage.getItem(SEEN)) return false
    sessionStorage.setItem(SEEN, '1')
  } catch { /* storage blocked: show it */ }
  return true
}

export default function Intro() {
  const [show] = useState(shouldShow)
  const full = useState(() => !setUp(useStore.getState().S))[0]   // the long one before the first setup only
  const [phase, setPhase] = useState(show ? 'play' : 'gone')
  const total = full ? FULL_MS : SHORT_MS

  useEffect(() => {
    if (phase !== 'play') return
    const a = setTimeout(() => setPhase('exit'), total - 520)
    return () => clearTimeout(a)
  }, [phase])
  useEffect(() => {
    if (phase !== 'exit') return
    const b = setTimeout(() => setPhase('gone'), 560)
    return () => clearTimeout(b)
  }, [phase])

  if (phase === 'gone') return null
  return (
    <div className={'intro ' + (full ? 'full' : 'short') + (phase === 'exit' ? ' exit' : '')} aria-hidden="true"
      onClick={() => setPhase('exit')}>
      <div className="intro-glow" />
      <div className="intro-stage">
        <div className="intro-markwrap">
          <span className="intro-ring" /><span className="intro-ring r2" />
          <img className="intro-logo" src="/logo.png" alt="" />
        </div>
        <div className="intro-word">{'Entren.ar'.split('').map((ch, i) => <span key={i} style={{ '--i': i }}>{ch}</span>)}</div>
        <div className="intro-tag">{t('Find your balance.')}</div>
      </div>
      {full && <div className="intro-iso"><div className="intro-iso-hop"><Buddy mood="hyped" size={96} /></div></div>}
    </div>
  )
}
