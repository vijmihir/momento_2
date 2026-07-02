import { T } from '../theme.js'

export default function Shell({ children, dark = false, style = {} }) {
  return (
    <div style={{
      maxWidth: 430,
      margin: '0 auto',
      minHeight: '100vh',
      background: dark ? T.dark : T.cream,
      position: 'relative',
      overflowX: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}
