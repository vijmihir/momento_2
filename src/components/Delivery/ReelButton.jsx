import { useState } from 'react'
import { T } from '../../theme.js'
import { DEMO_MODE, uploadReel } from '../../db.js'
import { renderReel, reelSupported } from '../../reelEngine.js'
import Btn from '../ui/Btn.jsx'
import Spinner from '../ui/Spinner.jsx'

// Photographer-triggered, event-wide highlight reel. Pulls from favorited photos
// if any exist, else falls back to the most recent pro photos.
export default function ReelButton({ event, photos, favorites, showToast }) {
  const [rendering, setRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [reelUrl, setReelUrl] = useState(null)

  if (!reelSupported()) {
    return (
      <div style={{ fontSize: 12, color: T.dim, textAlign: 'center', padding: '10px 0' }}>
        Highlight reels aren't supported on this browser.
      </div>
    )
  }

  const buildPhotoSet = () => {
    const favoritedIds = new Set(favorites.map(f => f.photo_id))
    const favorited = photos.filter(p => favoritedIds.has(p.id))
    const source = favorited.length ? favorited : photos.filter(p => p.type === 'pro')
    return source.slice(0, 12)
  }

  const create = async () => {
    const set = buildPhotoSet()
    if (!set.length) { showToast('No photos to build a reel from yet'); return }
    setRendering(true); setProgress(0); setReelUrl(null)
    try {
      const blob = await renderReel({ photos: set, onProgress: setProgress })
      if (DEMO_MODE) {
        setReelUrl(URL.createObjectURL(blob))
        showToast('Reel ready (demo — not saved)')
      } else {
        const row = await uploadReel({
          eventId: event.id, scope: 'event', guestName: null,
          blob, photoIds: set.map(p => p.id), durationSeconds: set.length * 3,
        })
        setReelUrl(row.video_url)
        showToast('Event highlight reel ready ✦')
      }
    } catch (e) {
      showToast(e.message === 'unsupported' ? 'Not supported on this device' : 'Could not build reel')
    }
    setRendering(false)
  }

  return (
    <div style={{ background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 16, padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: 10 }}>
        Event highlight reel
      </div>
      {reelUrl ? (
        <video src={reelUrl} controls playsInline style={{ width: '100%', borderRadius: 12, marginBottom: 10 }} />
      ) : rendering ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
          <Spinner color={T.clay} size={16} />
          <span style={{ fontSize: 13, color: T.muted }}>Rendering… {Math.round(progress * 100)}%</span>
        </div>
      ) : (
        <p style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.5, marginBottom: 12 }}>
          Auto-cuts a ~35s vertical video from the couple's favorites (or the best pro shots) — shareable to Instagram.
        </p>
      )}
      {!rendering && (
        <Btn kind="clay" onClick={create}>{reelUrl ? 'Regenerate reel' : 'Create event highlight reel'}</Btn>
      )}
    </div>
  )
}
