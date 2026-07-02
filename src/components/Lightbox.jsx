import { useEffect } from 'react'
import { T } from '../theme.js'

export default function Lightbox({ photo, onClose }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const share = async () => {
    if (!navigator.share) return
    try {
      const res = await fetch(photo.src)
      const blob = await res.blob()
      const file = new File([blob], 'momento.jpg', { type: 'image/jpeg' })
      await navigator.share({ files: [file], title: photo.title || 'Momento photo' })
    } catch {}
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        maxWidth: 430,
        margin: '0 auto',
        background: 'rgba(13,12,10,0.97)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'fadeUp .18s ease',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 18, right: 18,
          width: 34, height: 34,
          borderRadius: '50%',
          background: T.offGhost ?? 'rgba(245,241,232,0.1)',
          color: T.off,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}
      >✕</button>

      <img
        src={photo.src}
        alt={photo.title || ''}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '100%',
          maxHeight: '60vh',
          borderRadius: 14,
          objectFit: 'contain',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      />

      <div style={{ textAlign: 'center', marginTop: 20, color: T.off }} onClick={e => e.stopPropagation()}>
        {photo.title && (
          <div className="serif" style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>{photo.title}</div>
        )}
        <div style={{ fontSize: 12, color: T.offDim, marginBottom: 18 }}>
          {photo.uploader_name ? `Shared by ${photo.uploader_name}` : 'Photographer'}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <a
            href={photo.src}
            download="momento.jpg"
            onClick={e => e.stopPropagation()}
            style={{
              background: T.off, color: T.ink,
              fontSize: 14, fontWeight: 500,
              padding: '11px 24px', borderRadius: 11,
              textDecoration: 'none',
            }}
          >
            Download
          </a>
          {!!navigator.share && (
            <button
              onClick={e => { e.stopPropagation(); share() }}
              style={{
                background: T.offFaint ?? 'rgba(245,241,232,0.18)',
                color: T.off,
                fontSize: 14,
                padding: '11px 24px',
                borderRadius: 11,
              }}
            >
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
