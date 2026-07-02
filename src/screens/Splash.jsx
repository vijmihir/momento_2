import { useState } from 'react'
import { T } from '../theme.js'
import { useApp } from '../context/AppContext.jsx'
import { DEMO_MODE } from '../db.js'
import Btn from '../components/ui/Btn.jsx'
import Photo from '../components/ui/Photo.jsx'

const HERO = [
  '1519741497674-611481863552',
  '1606216794074-735e91aa2c92',
  '1532712938310-34cb3982ef74',
  '1583939003579-730e3918a45a',
  '1537633552985-df8429e8048b',
  '1554696468-19f8c7a71ad5',
]

export default function Splash() {
  const { startGuestJoin, setView, showToast } = useApp()
  const [code, setCode] = useState('')

  const go = () => {
    const c = code.trim().toUpperCase()
    if (!c) { showToast('Enter your event code'); return }
    startGuestJoin(c)
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: T.cream, display: 'flex', flexDirection: 'column' }}>
      {/* Hero grid */}
      <div style={{ height: 290, position: 'relative', overflow: 'hidden', borderRadius: '0 0 32px 32px', flexShrink: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: 3,
        }}>
          {HERO.map(id => (
            <Photo
              key={id}
              src={`https://images.unsplash.com/photo-${id}?w=280&q=60`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ))}
        </div>
        {/* Gradient fade to cream */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(to bottom, rgba(239,233,220,0) 40%, ${T.cream} 100%)`,
          pointerEvents: 'none',
        }} />
        {/* Wordmark overlay */}
        <div style={{ position: 'absolute', top: 18, left: 20 }}>
          <span className="serif" style={{ fontSize: 22, fontWeight: 500, color: T.off, textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
            moment<span style={{ color: T.clay }}>ó</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '12px 28px 40px', display: 'flex', flexDirection: 'column' }}>
        <h1 className="serif" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.15, marginBottom: 8, marginTop: 4 }}>
          Got an event code?
        </h1>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 22 }}>
          Enter it to find yourself in the gallery and shoot candids on your disposable camera.
        </p>

        {/* Code input */}
        <div style={{
          display: 'flex',
          border: `1.5px solid ${T.bdr}`,
          borderRadius: 14,
          overflow: 'hidden',
          marginBottom: 12,
          background: T.card,
        }}>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && go()}
            placeholder="Event code (e.g. SHARMA)"
            style={{
              flex: 1,
              padding: '15px 18px',
              background: 'transparent',
              fontSize: 15,
              color: T.ink,
              letterSpacing: '1.5px',
              fontWeight: 500,
            }}
          />
          <button
            onClick={go}
            style={{
              padding: '15px 22px',
              background: T.sage,
              color: T.off,
              fontSize: 15,
              fontWeight: 600,
              borderRadius: '0 12px 12px 0',
            }}
          >
            Enter
          </button>
        </div>

        {DEMO_MODE && (
          <p style={{ fontSize: 12, color: T.dim, marginBottom: 16, textAlign: 'center' }}>
            Try demo codes: <b style={{ color: T.sage, cursor: 'pointer' }} onClick={() => startGuestJoin('SHARMA')}>SHARMA</b>
            {' · '}
            <span style={{ color: T.sage, cursor: 'pointer' }} onClick={() => startGuestJoin('PRIYA')}>PRIYA</span>
          </p>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ borderTop: `1px solid ${T.cream2}`, paddingTop: 20 }}>
          <button
            onClick={() => setView('phAuth')}
            style={{
              width: '100%',
              padding: 13,
              background: T.sageBg,
              color: T.sage,
              borderRadius: 13,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            I'm a photographer / studio →
          </button>
        </div>
      </div>
    </div>
  )
}
