import { useState } from 'react'
import { T } from '../../theme.js'

export default function Photo({ src, alt = '', style = {}, onClick }) {
  const [failed, setFailed] = useState(false)

  if (failed) return (
    <div
      onClick={onClick}
      style={{ background: T.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.faint} strokeWidth="1.4">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  )

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onClick={onClick}
      onError={() => setFailed(true)}
      style={style}
    />
  )
}
