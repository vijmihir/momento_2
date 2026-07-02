import { T } from '../../theme.js'

const KINDS = {
  primary: { background: T.sage,    color: T.off,   fontSize: 15 },
  clay:    { background: T.clay,    color: '#fff',  fontSize: 15 },
  soft:    { background: T.sageBg,  color: T.sage,  fontSize: 14 },
  ghost:   { background: 'transparent', color: T.muted, fontSize: 14, border: `1px solid ${T.bdr}` },
  dark:    { background: T.offGhost ?? 'rgba(245,241,232,0.08)', color: T.off, fontSize: 14, border: `1px solid ${T.offFaint}` },
}

export default function Btn({ children, onClick, kind = 'primary', style = {}, disabled = false, full = true }) {
  const base = KINDS[kind] || KINDS.primary
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        width: full ? '100%' : 'auto',
        padding: '14px 20px',
        borderRadius: 13,
        fontWeight: 500,
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'opacity .15s',
        ...base,
        ...style,
      }}
    >
      {children}
    </button>
  )
}
