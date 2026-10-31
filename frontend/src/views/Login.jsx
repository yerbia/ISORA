import { useState } from 'react'
import { useStore, hasData } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { bootstrapSupabaseSession, supabaseSignIn, supabaseSignInWithGoogle, supabaseSignUp } from '../lib/api.js'
import { t } from '../lib/i18n.js'
import { DEMO, PERSONAL, REPO } from '../lib/demo.js'
import { guestAllowed } from '../lib/guest.js'
import Icon from '../components/Icon.jsx'
import IsoraMark from '../components/IsoraMark.jsx'
import { Button } from '../components/ui.jsx'

export function AccountForm({ mode, onMode }) {
  const { setUser, pullState, pushState } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault()
    if (!email.trim() || !password || (mode === 'signup' && !name.trim())) {
      useUI.getState().toast(t('Complete the required fields')); return
    }
    setBusy(true)
    try {
      const result = mode === 'signup'
        ? await supabaseSignUp(email.trim(), password, name.trim())
        : await supabaseSignIn(email.trim(), password)
      if (!result.session) { useUI.getState().toast(t('Check your email to confirm your account.')); setBusy(false); return }
      const boot = await bootstrapSupabaseSession(result.session)
      setUser(boot.user)
      if (hasData(useStore.getState().S)) await pushState(); else await pullState()
      useUI.getState().toast(t('Welcome, {0}', boot.user.name || email.split('@')[0]))
    } catch (err) { useUI.getState().toast(err.message || t('Sign-in failed')); setBusy(false) }
  }
  const google = async () => {
    try { setBusy(true); await supabaseSignInWithGoogle() }
    catch (err) { setBusy(false); useUI.getState().toast(err.message || t('Sign-in failed')) }
  }
  return <form onSubmit={submit}>
    {mode === 'signup' && <><input className="input" autoComplete="name" placeholder={t('Your name')} value={name} onChange={e => setName(e.target.value)} /><div style={{ height: 10 }} /></>}
    <input className="input" type="email" autoComplete="email" placeholder={t('Email')} value={email} onChange={e => setEmail(e.target.value)} />
    <div style={{ height: 10 }} />
    <input className="input" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder={t('Password')} value={password} onChange={e => setPassword(e.target.value)} />
    <div style={{ height: 12 }} />
    <Button variant="primary" type="submit" disabled={busy}>{mode === 'signup' ? t('Create account') : t('Sign in')}</Button>
    <div style={{ height: 10 }} />
    <Button type="button" disabled={busy} onClick={google}>{t('Continue with Google')}</Button>
    <button type="button" className="pk-link" onClick={() => onMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? t('Already have an account? Sign in') : t('Create a new account')}</button>
  </form>
}

export default function Login() {
  const { setGuest } = useStore()
  const config = useStore(s => s.config)
  const canGuest = guestAllowed(config)
  const [mode, setMode] = useState('signin')
  const head = <><IsoraMark className="isora-mark login-mark" size={84} /><h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-.028em', margin: '10px 0 4px' }}>Entren.ar</h1></>
  const wrap = { display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '78vh', textAlign: 'center' }
  if (PERSONAL) return <div className="narrow" style={wrap}>{head}<div className="muted" style={{ marginBottom: 30 }}>{t('Everything stays on this device.')}</div><Button variant="primary" icon="play" onClick={() => setGuest(true)}>{t('Start')}</Button></div>
  if (DEMO) return <div className="narrow" style={wrap}>{head}<div className="muted" style={{ marginBottom: 30 }}>{t('Live demo. Everything stays in this browser.')}</div><Button variant="primary" icon="play" onClick={() => setGuest(true)}>{t('Start the demo')}</Button><div className="dim small" style={{ marginTop: 22 }}><a href={REPO} target="_blank" rel="noopener">{t('Self-host it in a minute →')}</a></div></div>
  return <div className="narrow" style={wrap}>{head}<div className="muted" style={{ marginBottom: 24 }}>{t('Your workouts. Your weights. Your profile.')}</div><AccountForm mode={mode} onMode={setMode} />{canGuest && <Button variant="ghost" className="dim" onClick={() => setGuest(true)}>{t('Continue without account')}</Button>}<div className="dim small" style={{ marginTop: 20, lineHeight: 1.5 }}>{t('Sign in with your email, username and password, or Google.')}</div></div>
}
