import { T } from '../../theme.js'

export default function Spinner({ color = T.clay, size = 16 }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size,
      border: `2px solid ${color}33`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin .6s linear infinite',
      verticalAlign: '-3px',
      flexShrink: 0,
    }} />
  )
}
