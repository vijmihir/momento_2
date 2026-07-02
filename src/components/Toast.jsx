import { T } from '../theme.js'

export default function Toast({ msg }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 96,
      left: '50%',
      transform: 'translateX(-50%)',
      background: T.ink,
      color: T.off,
      fontSize: 13,
      fontWeight: 500,
      padding: '11px 22px',
      borderRadius: 24,
      zIndex: 300,
      opacity: msg ? 1 : 0,
      transition: 'opacity .2s',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      maxWidth: 320,
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
    }}>
      {msg}
    </div>
  )
}
