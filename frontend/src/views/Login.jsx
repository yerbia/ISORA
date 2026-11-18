import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { bootstrapSupabaseSession, supabaseResetPassword, supabaseSignIn, supabaseSignInWithGoogle, supabaseSignUp, supabaseUpdatePassword } from '../lib/api.js'
import { supabase } from '../lib/supabase.js'
import { t } from '../lib/i18n.js'
import { DEMO, PERSONAL, REPO } from '../lib/demo.js'
import { guestAllowed } from '../lib/guest.js'
import Icon from '../components/Icon.jsx'
import { Button } from '../components/ui.jsx'
import EntrenLogo from '../components/EntrenLogo.jsx'

function GoogleMark() {
  return <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.69-.06-1.35-.18-1.98H12v3.75h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.32 2.98-7.29Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.48l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.13H3.06v2.58A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.85A6 6 0 0 1 6.1 12c0-.64.11-1.27.31-1.85V7.57H3.06A10 10 0 0 0 2 12c0 1.6.38 3.1 1.06 4.43l3.35-2.58Z"/><path fill="#EA4335" d="M12 6.02c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.95 2.92 14.7 2 12 2a10 10 0 0 0-8.94 5.57l3.35 2.58C7.2 7.78 9.4 6.02 12 6.02Z"/></svg>
}

export function PasswordRecoveryForm({ onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault()
    if (password.length < 8 || password !== confirm) { useUI.getState().toast(t('Enter matching passwords of at least 8 characters.')); return }
    setBusy(true)
    try {
      await supabaseUpdatePassword(password)
      useUI.getState().toast(t('Your password has been changed.'))
      onDone?.()
    } catch (err) { useUI.getState().toast(err.message || t('Couldn’t change your password.')); setBusy(false) }
  }
  return <form onSubmit={submit}>
    <h3>{t('Choose a new password')}</h3>
    <input className="input" type="password" autoComplete="new-password" placeholder={t('New password')} value={password} onChange={e => setPassword(e.target.value)} />
    <div style={{ height: 10 }} />
    <input className="input" type="password" autoComplete="new-password" placeholder={t('Repeat new password')} value={confirm} onChange={e => setConfirm(e.target.value)} />
    <div style={{ height: 12 }} />
    <Button variant="primary" type="submit" disabled={busy}>{t('Save new password')}</Button>
  </form>
}

export function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const submit = async e => {
    e.preventDefault()
    if (!email.trim()) { useUI.getState().toast(t('Enter your email address.')); return }
    setBusy(true)
    try { await supabaseResetPassword(email.trim()); setSent(true) }
    catch (err) { useUI.getState().toast(err.message || t('Couldn’t send the reset email.')); setBusy(false) }
  }
  if (sent) return <div><h3>{t('Check your email')}</h3><p className="muted">{t('If an account uses that email, Supabase has sent a password reset link.')}</p><button type="button" className="pk-link" onClick={onBack}>{t('Back to sign in')}</button></div>
  return <form onSubmit={submit}><h3>{t('Reset your password')}</h3><p className="muted small">{t('Enter the email linked to your account and we’ll send a reset link.')}</p><input className="input" type="email" autoComplete="email" placeholder={t('Email')} value={email} onChange={e => setEmail(e.target.value)} /><div style={{ height: 12 }} /><Button variant="primary" type="submit" disabled={busy}>{t('Send reset link')}</Button><button type="button" className="pk-link" onClick={onBack}>{t('Back to sign in')}</button></form>
}

export function AccountForm({ mode, onMode, onDone }) {
  const { setUser, adoptProfile } = useStore()
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
      // Resolve this browser's local copy against the account copy before syncing. A direct
      // push here made every new browser overwrite or isolate the profile instead of merging it.
      setUser(boot.user, { adopt: true })
      await useStore.getState().adoptProfile(async () => true)
      useUI.getState().toast(t('Welcome, {0}', boot.user.name || email.split('@')[0]))
      onDone?.()
    } catch (err) { useUI.getState().toast(err.message || t('Sign-in failed')); setBusy(false) }
  }
  const google = async () => {
    try { setBusy(true); await supabaseSignInWithGoogle() }
    catch (err) { setBusy(false); useUI.getState().toast(err.message || t('Sign-in failed')) }
  }
  if (mode === 'forgot') return <ForgotPasswordForm onBack={() => onMode('signin')} />
  return <form onSubmit={submit}>
    {mode === 'signup' && <><input className="input" autoComplete="name" placeholder={t('Your name')} value={name} onChange={e => setName(e.target.value)} /><div style={{ height: 10 }} /></>}
    <input className="input" type="email" autoComplete="email" placeholder={t('Email')} value={email} onChange={e => setEmail(e.target.value)} />
    <div style={{ height: 10 }} />
    <input className="input" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder={t('Password')} value={password} onChange={e => setPassword(e.target.value)} />
    <div style={{ height: 12 }} />
    <Button variant="primary" type="submit" disabled={busy}>{mode === 'signup' ? t('Create account') : t('Sign in')}</Button>
    <div style={{ height: 10 }} />
    <Button type="button" disabled={busy} onClick={google}><span className="google-button"><GoogleMark />{t('Continue with Google')}</span></Button>
    {mode === 'signin' && <button type="button" className="pk-link" onClick={() => onMode('forgot')}>{t('Forgot your password?')}</button>}
    <button type="button" className="pk-link" onClick={() => onMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? t('Already have an account? Sign in') : t('Create a new account')}</button>
  </form>
}

export default function Login() {
  const { setGuest } = useStore()
  const config = useStore(s => s.config)
  const canGuest = guestAllowed(config)
  const [mode, setMode] = useState('signin')
  const [recovery, setRecovery] = useState(false)
  useEffect(() => {
    const isRecovery = () => /(?:^|[&#?])type=recovery(?:&|$)/.test(window.location.hash + window.location.search)
    setRecovery(isRecovery() || window.location.hash.includes('reset-password'))
    const { data: sub } = supabase.auth.onAuthStateChange(event => { if (event === 'PASSWORD_RECOVERY') setRecovery(true) })
    return () => sub.subscription.unsubscribe()
  }, [])
  const head = <><img className="login-logo" src="/logo.png" alt="" /><h1 className="login-wordmark"><EntrenLogo /></h1></>
  const wrap = { display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '78vh', textAlign: 'center' }
  if (PERSONAL) return <div className="narrow" style={wrap}>{head}<div className="muted" style={{ marginBottom: 30 }}>{t('Everything stays on this device.')}</div><Button variant="primary" icon="play" onClick={() => setGuest(true)}>{t('Start')}</Button></div>
  if (DEMO) return <div className="narrow" style={wrap}>{head}<div className="muted" style={{ marginBottom: 30 }}>{t('Live demo. Everything stays in this browser.')}</div><Button variant="primary" icon="play" onClick={() => setGuest(true)}>{t('Start the demo')}</Button><div className="dim small" style={{ marginTop: 22 }}><a href={REPO} target="_blank" rel="noopener">{t('Self-host it in a minute →')}</a></div></div>
  return <div className="narrow" style={wrap}>{head}<div className="muted" style={{ marginBottom: 24 }}>{recovery ? t('Set a new password for your account.') : t('Your workouts. Your weights. Your profile.')}</div>{recovery ? <PasswordRecoveryForm onDone={() => { setRecovery(false); window.location.hash = '#/home'; window.location.reload() }} /> : <AccountForm mode={mode} onMode={setMode} />}{!recovery && canGuest && <Button variant="ghost" className="dim" onClick={() => setGuest(true)}>{t('Continue without account')}</Button>} {!recovery && <div className="dim small" style={{ marginTop: 20, lineHeight: 1.5 }}>{t('Sign in with your email, username and password, or Google.')}</div>}</div>
}
