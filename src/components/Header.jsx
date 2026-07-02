import { T } from '../theme.js'
import Avatar from './ui/Avatar.jsx'

export default function Header({ title, sub, initial, onAvatarClick }) {
  return (
    <div style={{
      padding: '14px 18px 12px',
      position: 'sticky',
      top: 0,
      background: 'rgba(239,233,220,0.92)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      zIndex: 30,
      borderBottom: `1px solid ${T.cream2}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="serif" style={{ fontSize: 21, fontWeight: 500, lineHeight: 1.1 }}>{title}</div>
          {sub && <div style={{ fontSize: 11.5, color: T.dim, marginTop: 2 }}>{sub}</div>}
        </div>
        {initial && <Avatar initial={initial} bg={T.sage} size={34} />}
      </div>
    </div>
  )
}
