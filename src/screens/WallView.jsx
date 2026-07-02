import { useState, useEffect, useRef } from 'react'
import { T } from '../theme.js'
import { useApp } from '../context/AppContext.jsx'
import { DEMO_MODE, subscribeToPhotos } from '../db.js'
import Spinner from '../components/ui/Spinner.jsx'

const SLIDE_MS = 6000

export default function WallView() {
  const { event, photos, setPhotos, showToast } = useApp()
  const [index, setIndex] = useState(0)
  const [justIn, setJustIn] = useState(null)
  const timerRef = useRef()

  // Live updates
  useEffect(() => {
    if (DEMO_MODE || !event) return
    const unsub = subscribeToPhotos(event.id, (photo) => {
      setPhotos(p => [photo, ...p])
      setJustIn(photo)
      setIndex(0)
      showToast(photo.uploader_name ? `New from ${photo.uploader_name}` : 'New photo')
      setTimeout(() => setJustIn(null), 4000)
    })
    return unsub
  }, [event, setPhotos, showToast])

  // Demo mode: cycle without live badge
  useEffect(() => {
    if (!DEMO_MODE) return
    const id = setInterval(() => {
      setIndex(i => (photos.length ? (i + 1) % photos.length : 0))
    }, SLIDE_MS)
    return () => clearInterval(id)
  }, [photos.length])

  // Auto-advance
  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!photos.length) return
    timerRef.current = setTimeout(() => {
      setIndex(i => (i + 1) % photos.length)
    }, SLIDE_MS)
    return () => clearTimeout(timerRef.current)
  }, [index, photos.length])

  if (!event) return null

  const current = photos[index]

  return (
    <div style={{ position: 'fixed', inset: 0, background: T.dark, overflow: 'hidden' }}>
      {!current ? (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: T.off }}>
          <Spinner color={T.clay} size={28} />
          <div style={{ fontSize: 15, color: T.offDim }}>Waiting for the first photo…</div>
        </div>
      ) : (
        <img
          key={current.id}
          src={current.src}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            animation: `kenburns ${SLIDE_MS + 500}ms ease-out forwards, fadeIn .5s ease`,
          }}
        />
      )}

      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none' }} />

      {/* Event name */}
      <div style={{ position: 'absolute', top: 28, left: 32, right: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="serif" style={{ fontSize: 22, fontWeight: 500, color: T.off, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
          {event.name}
        </div>
        <div style={{ fontSize: 13, color: T.offDim, letterSpacing: '1px' }}>
          {event.code} · momentó
        </div>
      </div>

      {/* New photo badge */}
      {justIn && (
        <div style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(196,112,58,0.92)', color: '#fff',
          padding: '10px 20px', borderRadius: 30,
          fontSize: 14, fontWeight: 600,
          animation: 'pop .25s ease',
          boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
        }}>
          ✦ New{justIn.uploader_name ? ` from ${justIn.uploader_name}` : ''}
        </div>
      )}

      {/* Dots */}
      {photos.length > 1 && (
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {photos.slice(0, 20).map((p, i) => (
            <div key={p.id} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i === index ? T.clay : 'rgba(245,241,232,0.25)',
              transition: 'background .2s',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}
