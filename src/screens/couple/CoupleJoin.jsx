import { useState } from 'react'
import { T } from '../../theme.js'
import { useApp } from '../../context/AppContext.jsx'
import Shell from '../../components/Shell.jsx'
import Btn from '../../components/ui/Btn.jsx'
import Field from '../../components/ui/Field.jsx'

export default function CoupleJoin() {
  const { event, setCoupleName, setView } = useApp()
  const [name, setName] = useState('')
  const [err, setErr] = useState('')

  const next = () => {
    const n = name.trim()
    if (!n) { setErr('Add your name'); return }
    setCoupleName(n)
    setView('coupleApp')
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

        <div style={{
          background: T.clayTint,
          border: `1px solid rgba(196,112,58,0.25)`,
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.clay, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 4 }}>
            Your delivery portal
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, color: T.ink }}>{event?.name}</div>
          {(event?.venue || event?.date) && (
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
              {[event.venue, event.date].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>

        <h2 className="serif" style={{ fontSize: 30, fontWeight: 500, marginBottom: 8 }}>Welcome back 💌</h2>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 28 }}>
          Favorite your photos and leave notes for your photographer.
        </p>

        <Field
          label="Your name"
          value={name}
          set={v => { setName(v); setErr('') }}
          placeholder="e.g. Priya & Arjun"
          onEnter={next}
        />
        <div style={{ fontSize: 12, color: T.err, minHeight: 16, margin: '-8px 2px 8px' }}>{err}</div>

        <div style={{ flex: 1 }} />

        <Btn kind="clay" onClick={next}>Continue →</Btn>
      </div>
    </Shell>
  )
}
