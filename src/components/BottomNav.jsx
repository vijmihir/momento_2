import { T } from '../theme.js'

const DEFAULT_TABS = [
  {
    id: 'gallery', label: 'Gallery',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  {
    id: 'mine', label: 'My Photos',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a7 7 0 0 1 14 0v1" />
      </>
    ),
  },
  {
    id: 'cam', label: 'Camera',
    icon: (
      <>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),
  },
]

export default function BottomNav({ tab, setTab, dark, tabs = DEFAULT_TABS }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      background: dark ? 'rgba(13,12,10,0.96)' : 'rgba(247,243,234,0.96)',
      borderTop: `1px solid ${dark ? T.darkBdr : T.cream2}`,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      padding: '8px 0 max(10px, env(safe-area-inset-bottom))',
      zIndex: 50,
    }}>
      {tabs.map(({ id, label, icon }) => {
        const active = tab === id
        const isCam = id === 'cam'
        const color = active
          ? (isCam ? T.clay : T.sage)
          : (dark ? T.offDim : T.dim)
        return (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 0', color }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.7}>
              {icon}
            </svg>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
