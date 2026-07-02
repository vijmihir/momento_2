import { T } from '../../theme.js'

const STAGES = [
  ['shooting', 'Shooting'],
  ['editing', 'Editing'],
  ['proofing', 'Proofing'],
  ['delivered', 'Delivered'],
]

export default function StatusStepper({ status, onChange }) {
  const activeIndex = STAGES.findIndex(([id]) => id === status)

  return (
    <div style={{ background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: 14 }}>
        Delivery status
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {STAGES.map(([id, label], i) => {
          const done = i <= activeIndex
          return (
            <div key={id} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => onChange(id)}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: done ? T.sage : T.cream2,
                  color: done ? T.off : T.dim,
                  fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all .15s',
                }}
              >
                {done ? '✓' : i + 1}
              </button>
              {i < STAGES.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < activeIndex ? T.sage : T.cream2, transition: 'background .15s' }} />
              )}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', marginTop: 8 }}>
        {STAGES.map(([id, label]) => (
          <div key={id} style={{ flex: 1, textAlign: 'center', fontSize: 10.5, color: id === status ? T.sageTxt : T.dim, fontWeight: id === status ? 600 : 400 }}>
            {label}
          </div>
        ))}
      </div>
      {status !== 'delivered' && (
        <div style={{ fontSize: 11.5, color: T.dim, marginTop: 10, textAlign: 'center' }}>
          Photos show a "PREVIEW" watermark until marked Delivered.
        </div>
      )}
    </div>
  )
}
