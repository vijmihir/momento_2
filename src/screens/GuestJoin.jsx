import { useState } from 'react'
import { T } from '../theme.js'
import { useApp } from '../context/AppContext.jsx'
import Shell from '../components/Shell.jsx'
import Btn from '../components/ui/Btn.jsx'
import Field from '../components/ui/Field.jsx'

export default function GuestJoin() {
  const { event, setGuestName, setView } = useApp()
  const [name, setName] = useState('')
  const [err, setErr] = useState('')

  const next = () => {
    const n = name.trim()
    if (!n) { setErr('Add your name'); return }
    setGuestName(n)
    setView('guestFace')
  }

  return (
    <Shell>
      <div style={{ minHeight: '100vh', padding: '28px 28px', display: 'flex', flexDirection: 'column' }}>
        <button
          onClick={() => setView('splash')}
          style={{ color: T.dim, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 32, alignSelf: 'flex-start' }}
        >
          ← Back
        </button>

        {/* Event badge */}
        <div style={{
          background: T.sageTint,
          border: `1px solid rgba(75,114,89,0.2)`,
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.sageTxt, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 4 }}>
            You're joining
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, color: T.ink }}>{event?.name}</div>
          {(event?.venue || event?.date) && (
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
              {[event.venue, event.date].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>

        <h2 className="serif" style={{ fontSize: 30, fontWeight: 500, marginBottom: 8 }}>Welcome 👋</h2>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 28 }}>
          What's your name? It's shown when you share candids and how you're greeted.
        </p>

        <Field
          label="Your name"
          value={name}
          set={v => { setName(v); setErr('') }}
          placeholder="e.g. Sarah Chen"
          onEnter={next}
        />
        <div style={{ fontSize: 12, color: T.err, minHeight: 16, margin: '-8px 2px 8px' }}>{err}</div>

        <div style={{ flex: 1 }} />

        <Btn kind="primary" onClick={next}>Continue →</Btn>
      </div>
    </Shell>
  )
}
