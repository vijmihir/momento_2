import { useState } from 'react'
import { T } from '../../theme.js'
import { useApp } from '../../context/AppContext.jsx'
import { DEMO_MODE, signUp, signIn } from '../../db.js'
import Shell from '../../components/Shell.jsx'
import Btn from '../../components/ui/Btn.jsx'
import Field from '../../components/ui/Field.jsx'
import Spinner from '../../components/ui/Spinner.jsx'

export default function PhAuth() {
  const { setUser, setView, showToast } = useApp()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [studio, setStudio] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (DEMO_MODE) {
      setUser({ id: 'demo', email: 'demo@studio.com', user_metadata: { studio_name: 'Demo Studio' } })
      setView('phDash')
      return
    }
    if (!email.trim() || !pass.trim()) { showToast('Enter email and password'); return }
    setBusy(true)
    try {
      const u = mode === 'signup'
        ? await signUp(email, pass, studio || 'My Studio')
        : await signIn(email, pass)
      if (u) { setUser(u); setView('phDash') }
      else showToast('Check your email to confirm, then sign in')
    } catch (e) {
      showToast(e.message || 'Auth failed')
    }
    setBusy(false)
  }

  return (
    <Shell>
      <div style={{ minHeight: '100vh', padding: '48px 28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 340, width: '100%', margin: '0 auto' }}>
          <button onClick={() => setView('splash')} style={{ color: T.dim, fontSize: 13, marginBottom: 32 }}>← Back</button>

          {/* Icon */}
          <div style={{ width: 52, height: 52, background: T.sageBg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.sage} strokeWidth="1.7">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3.5"/>
            </svg>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: T.sage, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 6 }}>
            Photographer / Studio
          </div>
          <h2 className="serif" style={{ fontSize: 30, fontWeight: 500, marginBottom: 6 }}>
            {mode === 'signup' ? 'Create your studio' : 'Welcome back'}
          </h2>
          <p style={{ fontSize: 14, color: T.muted, marginBottom: 28 }}>
            {DEMO_MODE ? 'Demo mode — tap Continue to explore.' : 'Manage event galleries and deliver photos.'}
          </p>

          {!DEMO_MODE && (
            <>
              {mode === 'signup' && (
                <Field label="Studio name" value={studio} set={setStudio} placeholder="Raj Photography" />
              )}
              <Field label="Email" value={email} set={setEmail} placeholder="you@studio.com" type="email" />
              <Field label="Password" value={pass} set={setPass} placeholder="••••••••" type="password" onEnter={submit} />
            </>
          )}

          <Btn kind="primary" onClick={submit} disabled={busy}>
            {busy ? <Spinner color={T.off} size={14} /> : null}
            {' '}
            {DEMO_MODE ? 'Continue →' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </Btn>

          {!DEMO_MODE && (
            <p style={{ textAlign: 'center', fontSize: 13, color: T.dim, marginTop: 20 }}>
              {mode === 'signup' ? 'Already have an account?' : 'New studio?'}{' '}
              <span
                onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                style={{ color: T.sage, fontWeight: 500, cursor: 'pointer' }}
              >
                {mode === 'signup' ? 'Sign in' : 'Create one'}
              </span>
            </p>
          )}
        </div>
      </div>
    </Shell>
  )
}
