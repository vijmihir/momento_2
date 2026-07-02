import { T } from '../../theme.js'

const ITEMS = [
  { id: 'all',   label: 'All photos' },
  { id: 'guest', label: 'Guest cam' },
]

export default function Filters({ value, onChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: 8,
      padding: '10px 16px',
      overflowX: 'auto',
      position: 'sticky',
      top: 57,
      background: 'rgba(239,233,220,0.92)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      zIndex: 29,
    }}>
      {ITEMS.map(({ id, label }) => {
        const on = value === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: 18,
              fontSize: 12.5,
              fontWeight: on ? 600 : 400,
              whiteSpace: 'nowrap',
              background: on ? T.ink : 'transparent',
              border: `1px solid ${on ? T.ink : T.bdr}`,
              color: on ? T.off : T.muted,
              transition: 'all .15s',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
