import { T } from '../../theme.js'
import { DEMO_MODE } from '../../db.js'

function anniversaryYears(event) {
  if (!event?.event_date) return null
  const d = new Date(event.event_date)
  if (isNaN(d)) return null
  const today = new Date()
  if (d.getMonth() === today.getMonth() && d.getDate() === today.getDate() && d.getFullYear() < today.getFullYear()) {
    return today.getFullYear() - d.getFullYear()
  }
  return null
}

export default function ThisDayBanner({ event, photos, matchedIds, onPick }) {
  // Demo mode: always show, since a real DEMO_EVENTS date match against "today"
  // would only be true one day a year — the demo should tell its story reliably.
  const years = DEMO_MODE ? 1 : anniversaryYears(event)
  if (!years) return null

  const mine = photos.filter(p => matchedIds?.has(p.id) && p.type === 'pro')
  const top = (mine.length ? mine : photos.filter(p => p.type === 'pro')).slice(0, 6)
  if (!top.length) return null

  return (
    <div style={{ margin: '10px 14px 16px', background: T.dark, borderRadius: 18, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>🎉</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.off }}>
            {years} year{years === 1 ? '' : 's'} ago today
          </div>
          <div style={{ fontSize: 11.5, color: T.offDim }}>{event.name}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
        {top.map(p => (
          <div
            key={p.id}
            onClick={() => onPick(p)}
            style={{ width: 74, height: 74, borderRadius: 10, overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}
          >
            <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
