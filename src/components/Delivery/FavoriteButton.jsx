import { T } from '../../theme.js'

export default function FavoriteButton({ active, onClick, size = 30 }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: active ? T.clay : 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill={active ? '#fff' : 'none'} stroke="#fff" strokeWidth="2">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z" />
      </svg>
    </button>
  )
}
