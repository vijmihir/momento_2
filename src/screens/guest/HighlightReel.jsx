import { useState, useMemo } from 'react'
import { T } from '../../theme.js'
import { useApp } from '../../context/AppContext.jsx'
import { DEMO_MODE, uploadReel } from '../../db.js'
import { renderReel, reelSupported } from '../../reelEngine.js'
import Shell from '../../components/Shell.jsx'
import Btn from '../../components/ui/Btn.jsx'
import Spinner from '../../components/ui/Spinner.jsx'

export default function HighlightReel() {
  const { event, photos, guestName, matchedIds, setView, showToast } = useApp()
  const [step, setStep] = useState('select')  // select | rendering | done
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState(null)
  const [shareUrl, setShareUrl] = useState(null)

  const myPhotos = useMemo(() => {
    const mine = photos.filter(p => matchedIds?.has(p.id) && p.type === 'pro')
    return mine.slice(0, 12)
  }, [photos, matchedIds])

  const back = () => setView('guestApp')

  const create = async () => {
    if (!myPhotos.length) return
    setStep('rendering'); setProgress(0)
    try {
      const blob = await renderReel({ photos: myPhotos, onProgress: setProgress })
      const url = URL.createObjectURL(blob)
      setVideoUrl(url)
      if (!DEMO_MODE) {
        try {
          const row = await uploadReel({
            eventId: event.id, scope: 'guest', guestName,
            blob, photoIds: myPhotos.map(p => p.id), durationSeconds: myPhotos.length * 3,
          })
          setShareUrl(`${window.location.origin}?reel=${row.id}`)
        } catch { /* still show local preview even if upload fails */ }
      }
      setStep('done')
    } catch (e) {
      showToast(e.message === 'unsupported' ? 'Not supported on this browser' : 'Could not build reel')
      setStep('select')
    }
  }

  const share = async () => {
    if (!navigator.share || !videoUrl) return
    try {
      const res = await fetch(videoUrl)
      const blob = await res.blob()
      const file = new File([blob], 'momento-highlights.webm', { type: 'video/webm' })
      await navigator.share({ files: [file], title: 'My wedding highlights', url: shareUrl })
    } catch {}
  }

  if (!reelSupported()) {
    return (
      <Shell>
        <div style={{ minHeight: '100vh', padding: 28, display: 'flex', flexDirection: 'column' }}>
          <button onClick={back} style={{ color: T.dim, fontSize: 13, marginBottom: 28, alignSelf: 'flex-start' }}>← Back</button>
          <h2 className="serif" style={{ fontSize: 26, fontWeight: 500, marginBottom: 10 }}>Not supported here</h2>
          <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>
            Highlight reels need a browser that supports video recording (Chrome, Firefox, Edge). Try again from one of those.
          </p>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div style={{ minHeight: '100vh', padding: '28px 28px', display: 'flex', flexDirection: 'column' }}>
        <button onClick={back} style={{ color: T.dim, fontSize: 13, marginBottom: 28, alignSelf: 'flex-start' }}>← Back</button>

        {step === 'select' && (
          <>
            <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>Your highlight reel ✦</h2>
            <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 24 }}>
              A ~{Math.round(myPhotos.length * 3)}s video from the {myPhotos.length} best photos of you, ready to share.
            </p>
            {myPhotos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: T.dim, fontSize: 14 }}>
                No matched photos yet — set up Face ID first.
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginBottom: 28 }}>
                  {myPhotos.map(p => (
                    <div key={p.id} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
                      <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
                <Btn kind="clay" onClick={create}>Create my reel →</Btn>
              </>
            )}
          </>
        )}

        {step === 'rendering' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <Spinner color={T.clay} size={28} />
            <div style={{ fontSize: 15, fontWeight: 500 }}>Rendering your reel…</div>
            <div style={{ width: '100%', height: 4, background: T.cream2, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round(progress * 100)}%`, background: T.clay, borderRadius: 2, transition: 'width .2s' }} />
            </div>
          </div>
        )}

        {step === 'done' && (
          <>
            <h2 className="serif" style={{ fontSize: 26, fontWeight: 500, marginBottom: 16 }}>Ready ✦</h2>
            <video src={videoUrl} controls playsInline style={{ width: '100%', borderRadius: 16, marginBottom: 20, background: '#000' }} />
            <a href={videoUrl} download="momento-highlights.webm" style={{
              display: 'block', textAlign: 'center', background: T.sageBg, color: T.sage,
              fontSize: 14, fontWeight: 500, padding: 14, borderRadius: 13, marginBottom: 10,
            }}>
              Download
            </a>
            {!!navigator.share && (
              <Btn kind="clay" onClick={share}>Share →</Btn>
            )}
          </>
        )}
      </div>
    </Shell>
  )
}
