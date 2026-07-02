import { T } from '../../theme.js'

export default function Avatar({ initial = '?', bg = T.sage, size = 36 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: bg,
      color: T.off,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.42,
      fontWeight: 600,
      flexShrink: 0,
      letterSpacing: '-0.5px',
    }}>
      {(initial || '?').toUpperCase()}
    </div>
  )
}
