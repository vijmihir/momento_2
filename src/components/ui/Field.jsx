import { T } from '../../theme.js'

export default function Field({ label, value, set, placeholder, type = 'text', onEnter, dark = false, mb = 14 }) {
  return (
    <div style={{ marginBottom: mb }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: dark ? T.offDim : T.muted, marginBottom: 7 }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => set(e.target.value)}
        placeholder={placeholder}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        style={{
          width: '100%',
          padding: '13px 16px',
          background: dark ? T.darkCard : T.card,
          border: `1px solid ${dark ? T.darkBdr : T.bdr}`,
          borderRadius: 12,
          fontSize: 15,
          color: dark ? T.off : T.ink,
        }}
      />
    </div>
  )
}
