import { useState } from 'react'
import { T } from '../../theme.js'
import { useApp } from '../../context/AppContext.jsx'
import Header from '../../components/Header.jsx'
import Filters from '../../components/Gallery/Filters.jsx'
import PhotoGrid from '../../components/Gallery/PhotoGrid.jsx'

export default function GalleryTab({ onPick }) {
  const { event, photos, guestName, myDescriptor, matchedIds } = useApp()
  const [filter, setFilter] = useState('all')

  const isMine = p => matchedIds?.has(p.id) || p._mine

  // Sort: matched photos first, then rest
  const sorted = myDescriptor
    ? [...photos].sort((a, b) => (isMine(b) ? 1 : 0) - (isMine(a) ? 1 : 0))
    : photos

  const visible = sorted.filter(p =>
    filter === 'all'   ? true :
    filter === 'guest' ? p.type === 'guest' : true
  )

  const matchCount = photos.filter(isMine).length

  return (
    <div style={{ animation: 'fadeUp .2s ease' }}>
      <Header
        title="Gallery"
        sub={`${event?.name} · ${photos.length} photos`}
        initial={(guestName[0] || 'G').toUpperCase()}
      />

      {/* Face match banner */}
      {myDescriptor && matchCount > 0 && (
        <div style={{
          margin: '10px 14px 0',
          background: T.clayTint,
          border: `1px solid rgba(196,112,58,0.25)`,
          borderRadius: 12,
          padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 17 }}>✦</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.clay }}>
              {matchCount} photo{matchCount === 1 ? '' : 's'} of you
            </div>
            <div style={{ fontSize: 11, color: T.muted }}>Highlighted with an orange ring · shown first</div>
          </div>
        </div>
      )}

      <Filters value={filter} onChange={setFilter} />

      {visible.length === 0
        ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: T.dim, fontSize: 14 }}>
            No photos here yet.
          </div>
        )
        : <PhotoGrid photos={visible} isMine={isMine} onPick={onPick} />
      }
    </div>
  )
}
