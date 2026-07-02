import { useState, useEffect, useRef } from 'react'
import { T } from '../../theme.js'
import { useApp } from '../../context/AppContext.jsx'
import { DEMO_MODE } from '../../db.js'
import { uploadPhoto } from '../../db.js'
import { allFaceDescriptors } from '../../faceEngine.js'
import { useCamera, filmFromFile } from '../../camera.js'

const MAX_SHOTS = 24

function Corner({ pos }) {
  const SIZE = 22
  const s = {
    tl: { top: 14, left: 14,  borderTop: `2px solid ${T.offFaint}`,  borderLeft:  `2px solid ${T.offFaint}`,  borderRadius: '3px 0 0 0' },
    tr: { top: 14, right: 14, borderTop: `2px solid ${T.offFaint}`,  borderRight: `2px solid ${T.offFaint}`,  borderRadius: '0 3px 0 0' },
    bl: { bottom: 14, left: 14,  borderBottom: `2px solid ${T.offFaint}`, borderLeft:  `2px solid ${T.offFaint}`,  borderRadius: '0 0 0 3px' },
    br: { bottom: 14, right: 14, borderBottom: `2px solid ${T.offFaint}`, borderRight: `2px solid ${T.offFaint}`,  borderRadius: '0 0 3px 0' },
  }[pos]
  return <div style={{ position: 'absolute', width: SIZE, height: SIZE, zIndex: 3, pointerEvents: 'none', ...s }} />
}

export default function CameraTab({ myShots, setMyShots, onPick }) {
  const { event, guestName, setPhotos, showToast } = useApp()
  const cam = useCamera('environment')
  const fileRef = useRef()

  const [pending, setPending] = useState(null)
  const [shotCount, setShotCount] = useState(0)
  const [capturing, setCapturing] = useState(false)

  useEffect(() => { cam.start() }, [])

  const haptic = () => navigator.vibrate?.(30)

  const takeShot = async () => {
    if (pending || capturing) return
    if (shotCount >= MAX_SHOTS) { showToast('Roll finished — 24 shots used!'); return }
    haptic()
    setCapturing(true)
    const res = await cam.capture(true)
    setCapturing(false)
    if (!res) { showToast('Camera not ready'); return }
    setPending(res)
    setShotCount(c => c + 1)
  }

  const fromFile = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    const res = await filmFromFile(f)
    setPending(res); setShotCount(c => c + 1)
    e.target.value = ''
  }

  const retake = () => { setPending(null); setShotCount(c => Math.max(0, c - 1)) }

  const share = async () => {
    if (!pending) return
    const localShot = {
      id: 'local-' + Date.now(),
      src: pending.dataUrl,
      type: 'guest',
      title: 'Candid',
      uploader_name: guestName,
      _mine: true,
    }
    setMyShots(s => [localShot, ...s])
    setPhotos(p => [localShot, ...p])
    setPending(null)
    showToast('Added to the gallery ✦')
    haptic()

    if (!DEMO_MODE) {
      try {
        let descriptors = []
        try { descriptors = await allFaceDescriptors(pending.dataUrl) } catch {}
        const file = new File([pending.blob], 'shot.jpg', { type: 'image/jpeg' })
        await uploadPhoto({ eventId: event.id, file, type: 'guest', uploaderName: guestName, descriptors })
      } catch { showToast('Saved locally — cloud upload failed') }
    }
  }

  const isRollFull = shotCount >= MAX_SHOTS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 78px)', background: T.dark }}>
      {/* Top bar */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.offDim, letterSpacing: '2px' }}>DISPOSABLE · 200 ISO</div>
        <div style={{ textAlign: 'right' }}>
          <span className="serif" style={{ fontSize: 20, fontWeight: 500, color: isRollFull ? T.err : T.clay }}>{shotCount}</span>
          <span style={{ fontSize: 11, color: T.offDim }}> / {MAX_SHOTS}</span>
        </div>
      </div>

      {/* Viewfinder */}
      <div
        onClick={() => !pending && !capturing && takeShot()}
        style={{
          flex: 1,
          position: 'relative',
          margin: '0 16px',
          borderRadius: 20,
          overflow: 'hidden',
          background: '#0A0908',
          minHeight: 340,
          cursor: pending ? 'default' : 'pointer',
        }}
      >
        {/* Live video */}
        {!pending && (
          <video
            ref={cam.videoRef}
            autoPlay playsInline muted
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              display: cam.ready ? 'block' : 'none',
              opacity: capturing ? 0.4 : 1,
              transition: 'opacity .1s',
            }}
          />
        )}

        {/* Captured shot */}
        {pending && (
          <img
            src={pending.dataUrl}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* Film grain CSS overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
          opacity: 0.6,
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
        }} />

        {/* Dark vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Corner brackets */}
        <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />

        {/* Camera off state */}
        {!pending && !cam.ready && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 1 }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={T.off} strokeWidth="1.3" style={{ opacity: 0.2 }}>
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3.5"/>
            </svg>
            <div style={{ fontSize: 10, color: T.offDim, letterSpacing: '2px' }}>
              {cam.error ? 'CAMERA OFF' : 'STARTING…'}
            </div>
          </div>
        )}

        {/* Capture flash */}
        {capturing && (
          <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.15, zIndex: 4, pointerEvents: 'none' }} />
        )}

        {/* Roll full overlay */}
        {isRollFull && !pending && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3,
            background: 'rgba(13,12,10,0.85)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <div className="serif" style={{ fontSize: 28, fontWeight: 500, color: T.off }}>Roll Finished</div>
            <div style={{ fontSize: 13, color: T.offDim }}>24 shots developed</div>
          </div>
        )}
      </div>

      {/* Camera error bar */}
      {cam.error && !pending && !isRollFull && (
        <div style={{ padding: '10px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: T.offDim, marginBottom: 8 }}>
            {cam.error === 'denied' ? 'Camera blocked — pick from your roll instead.' : 'No camera — pick from your roll.'}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={fromFile} />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              background: T.offGhost,
              border: `1px solid ${T.offFaint}`,
              color: T.offDim,
              fontSize: 13, padding: '8px 18px', borderRadius: 10,
            }}
          >
            Choose from roll
          </button>
        </div>
      )}

      {/* Controls */}
      <div style={{ padding: '16px 24px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        {/* Thumbnail strip */}
        <div style={{ width: 80, display: 'flex', gap: 5, overflow: 'hidden' }}>
          {myShots.slice(0, 2).map(s => (
            <div key={s.id} onClick={() => onPick(s)} style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${T.offFaint}`, cursor: 'pointer', flexShrink: 0 }}>
              <img src={s.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        {/* Shutter */}
        <button
          onClick={takeShot}
          disabled={isRollFull || !!capturing}
          style={{
            width: 74, height: 74,
            borderRadius: '50%',
            border: `3.5px solid ${isRollFull ? T.offDim : T.off}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            opacity: isRollFull ? 0.4 : 1,
            transition: 'transform .1s',
            transform: capturing ? 'scale(0.92)' : 'scale(1)',
          }}
        >
          <div style={{
            width: 57, height: 57,
            borderRadius: '50%',
            background: pending ? T.offFaint : T.off,
            transition: 'background .15s',
          }} />
        </button>

        {/* Share / retake */}
        <div style={{ width: 80, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          {pending && (
            <>
              <button onClick={retake} style={{ background: T.offGhost, border: `1px solid ${T.offFaint}`, color: T.offDim, fontSize: 12, padding: '7px 12px', borderRadius: 9 }}>
                Retake
              </button>
              <button onClick={share} style={{ background: T.clay, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 10 }}>
                Share
              </button>
            </>
          )}
        </div>
      </div>

      {/* Your roll */}
      {myShots.length > 0 && (
        <div style={{ background: T.dark2, padding: '14px 16px 28px', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: T.offDim, marginBottom: 10, fontWeight: 500, letterSpacing: '.5px' }}>
            YOUR ROLL · {myShots.length} SHARED
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {myShots.map(s => (
              <div
                key={s.id}
                onClick={() => onPick(s)}
                style={{
                  width: 70, height: 70,
                  borderRadius: 10, overflow: 'hidden',
                  flexShrink: 0, cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <img src={s.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(150,90,30,.12)', mixBlendMode: 'multiply' }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
