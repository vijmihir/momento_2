import { useState, useEffect, useRef } from 'react'
import { T } from '../../theme.js'
import Photo from '../ui/Photo.jsx'

const GAP = 4
const TARGET_HEIGHT = 160

export default function PhotoGrid({ photos, isMine, onPick }) {
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(390)
  const [ratios, setRatios] = useState({})

  useEffect(() => {
    const measure = () => wrapRef.current && setWidth(wrapRef.current.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    photos.forEach(p => {
      if (ratios[p.id] != null) return
      const im = new Image()
      im.onload = () => setRatios(r => ({ ...r, [p.id]: im.naturalWidth / im.naturalHeight || 1.33 }))
      im.onerror = () => setRatios(r => ({ ...r, [p.id]: 1.33 }))
      im.src = p.src
    })
    // eslint-disable-next-line
  }, [photos])

  // Justified layout: pack into rows of equal height
  const rows = []
  let row = [], rowRatioSum = 0
  for (const p of photos) {
    const ar = ratios[p.id] ?? 1.33
    row.push({ p, ar })
    rowRatioSum += ar
    const gaps = (row.length - 1) * GAP
    const rowHeight = (width - gaps) / rowRatioSum
    if (rowHeight < TARGET_HEIGHT && row.length >= 1) {
      rows.push({ items: row, height: rowHeight })
      row = []; rowRatioSum = 0
    }
  }
  if (row.length) {
    const gaps = (row.length - 1) * GAP
    let h = (width - gaps) / rowRatioSum
    if (h > TARGET_HEIGHT * 1.7) h = TARGET_HEIGHT
    rows.push({ items: row, height: h, partial: true })
  }

  return (
    <div ref={wrapRef} style={{ padding: '0 14px 100px' }}>
      {rows.map((r, ri) => (
        <div key={ri} style={{ display: 'flex', gap: GAP, marginBottom: GAP }}>
          {r.items.map(({ p, ar }) => {
            const mine = isMine?.(p)
            const isGuest = p.type === 'guest'
            const w = r.partial ? r.height * ar : undefined
            return (
              <div
                key={p.id}
                onClick={() => onPick(p)}
                style={{
                  height: r.height,
                  width: w,
                  flex: r.partial ? `0 0 ${w}px` : ar,
                  borderRadius: 9,
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  background: T.cream2,
                  // Ring for matched photos
                  boxShadow: mine && !isGuest ? `0 0 0 2.5px ${T.clay}` : 'none',
                }}
              >
                <Photo
                  src={p.src}
                  alt={p.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Guest cam warm overlay */}
                {isGuest && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(150,90,30,.12)',
                    mixBlendMode: 'multiply',
                    pointerEvents: 'none',
                  }} />
                )}
                {/* Badges */}
                {isGuest && (
                  <span style={{
                    position: 'absolute', top: 6, left: 6,
                    fontSize: 9, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 6,
                    background: 'rgba(196,112,58,0.9)', color: '#fff',
                    letterSpacing: '.3px',
                  }}>
                    GUEST
                  </span>
                )}
                {mine && !isGuest && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 20, height: 20,
                    borderRadius: '50%',
                    background: T.clay,
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                  }}>
                    ✦
                  </span>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
