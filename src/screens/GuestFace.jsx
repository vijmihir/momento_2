import { useState, useRef } from 'react'
import { T } from '../theme.js'
import { useApp } from '../context/AppContext.jsx'
import { DEMO_MODE } from '../db.js'
import { joinAsGuest, saveGuestPhotoMatches } from '../db.js'
import { loadModels, faceDescriptor, allFaceDescriptors, appearsIn, bestMatchDistance } from '../faceEngine.js'
import { useCamera } from '../camera.js'
import Shell from '../components/Shell.jsx'
import Btn from '../components/ui/Btn.jsx'
import Spinner from '../components/ui/Spinner.jsx'

export default function GuestFace() {
  const { event, guestName, guestEmail, photos, setMyDescriptor, setMatchedIds, setGuestId, setView, showToast } = useApp()
  const cam = useCamera('user')
  const fileRef = useRef()

  const [step, setStep]         = useState('consent')  // consent | idle | live | shot | scanning | done
  const [shotUrl, setShotUrl]   = useState(null)
  const [foundCount, setFoundCount] = useState(0)

  const openCam = async () => { setStep('live'); await cam.start() }

  const finishWith = async (dataUrl) => {
    setShotUrl(dataUrl)
    setStep('scanning')
    await loadModels()
    const desc = await faceDescriptor(dataUrl)
    if (!desc) {
      showToast('No face detected — try again')
      setShotUrl(null); setStep('idle'); return
    }
    const matched = new Set()
    const distances = []
    if (DEMO_MODE) {
      // Demo photos are stock images of strangers — a real selfie will never
      // genuinely match them. Seed a few "matches" so the demo tells the
      // right story (highlight reel, matched-photo ring, etc. all work).
      const proPhotos = photos.filter(ph => ph.type === 'pro').slice(0, 5)
      proPhotos.forEach((p, i) => {
        matched.add(p.id)
        distances.push({ photoId: p.id, distance: 0.3 + i * 0.03 })
      })
    } else {
      for (const p of photos.filter(ph => ph.type === 'pro')) {
        const faces = p.descriptors?.length ? p.descriptors : await allFaceDescriptors(p.src)
        if (appearsIn(desc, faces)) {
          matched.add(p.id)
          const d = bestMatchDistance(desc, faces)
          if (d !== null) distances.push({ photoId: p.id, distance: d })
        }
      }
    }
    setFoundCount(matched.size)
    setMyDescriptor(desc)
    setMatchedIds(matched)
    if (!DEMO_MODE) {
      try {
        const row = await joinAsGuest({ eventId: event.id, name: guestName, descriptor: desc, email: guestEmail || null })
        setGuestId(row.id)
        await saveGuestPhotoMatches(row.id, event.id, distances)
      } catch {}
    }
    setStep('done')
  }

  const capture = async () => {
    const res = await cam.capture(false)
    if (!res) { showToast('Camera not ready'); return }
    cam.stop()
    finishWith(res.dataUrl)
  }

  const fromFile = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    const url = await new Promise(r => { const rd = new FileReader(); rd.onload = ev => r(ev.target.result); rd.readAsDataURL(f) })
    cam.stop(); finishWith(url); e.target.value = ''
  }

  const openGallery = () => setView('guestApp')
  const skip = () => { cam.stop(); setMyDescriptor(null); setMatchedIds(new Set()); setView('guestApp') }

  if (step === 'consent') return (
    <Shell>
      <div style={{ minHeight: '100vh', padding: '28px 28px', display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => setView('guestJoin')} style={{ color: T.dim, fontSize: 13, marginBottom: 32, alignSelf: 'flex-start' }}>← Back</button>

        <div style={{ width: 56, height: 56, background: T.sageTint, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={T.sage} strokeWidth="1.8">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>

        <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, marginBottom: 10 }}>
          Find yourself in the gallery
        </h2>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, marginBottom: 24 }}>
          Take a quick selfie and we'll scan the gallery to find every photo you appear in — all on your device. <b style={{ color: T.ink }}>Your photo is never uploaded or stored.</b>
        </p>

        <div style={{ background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 14, padding: 16, marginBottom: 28 }}>
          {[
            ['🔒', 'On-device only', 'Face matching runs entirely in your browser — no data leaves your phone.'],
            ['🗑️', 'Not stored', 'Your selfie is discarded immediately after matching.'],
            ['👤', 'Optional', 'You can skip and browse all photos without registering your face.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <Btn kind="primary" onClick={() => setStep('idle')} style={{ marginBottom: 10 }}>
          Take a selfie →
        </Btn>
        <Btn kind="soft" onClick={skip}>Skip — browse all photos</Btn>
      </div>
    </Shell>
  )

  return (
    <Shell>
      <div style={{ minHeight: '100vh', padding: '28px 28px', display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => { cam.stop(); step === 'done' ? setStep('idle') : setView('guestJoin') }} style={{ color: T.dim, fontSize: 13, marginBottom: 28, alignSelf: 'flex-start' }}>
          ← Back
        </button>

        <h2 className="serif" style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}>
          Quick selfie{guestName ? `, ${guestName.split(' ')[0]}` : ''}
        </h2>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 28 }}>
          Your face is matched on-device — never uploaded.
        </p>

        {/* Selfie circle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            width: 210, height: 210,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `3px solid ${shotUrl || step === 'live' ? T.sage : T.bdr}`,
            background: T.card,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            transition: 'border-color .3s',
          }}>
            {step === 'live' && (
              <video ref={cam.videoRef} autoPlay playsInline muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            )}
            {shotUrl && step !== 'live' && (
              <img src={shotUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            {!shotUrl && step === 'idle' && (
              <div style={{ textAlign: 'center' }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={T.dim} strokeWidth="1.3" style={{ marginBottom: 8 }}>
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3.5"/>
                </svg>
                <div style={{ fontSize: 12, color: T.dim }}>Take a live selfie</div>
              </div>
            )}
            {step === 'scanning' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,233,220,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
                <Spinner color={T.sage} size={28} />
                <div style={{ fontSize: 11, color: T.sageTxt, fontWeight: 500 }}>Scanning…</div>
              </div>
            )}
          </div>
        </div>

        {/* Actions by step */}
        {step === 'idle' && (
          <>
            <Btn kind="primary" onClick={openCam} style={{ marginBottom: 10 }}>Open camera</Btn>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={fromFile} />
            <Btn kind="soft" onClick={() => fileRef.current?.click()}>Upload a photo instead</Btn>
          </>
        )}

        {step === 'live' && (
          <>
            {cam.error && (
              <div style={{ background: T.clayBg, border: `1px solid ${T.clay}44`, borderRadius: 12, padding: '12px 15px', fontSize: 13, color: T.clay, marginBottom: 14 }}>
                {cam.error === 'denied' ? 'Camera blocked — allow access in your browser, or upload a photo.' : 'No camera found — upload a photo instead.'}
              </div>
            )}
            <Btn kind="primary" onClick={capture} disabled={!cam.ready} style={{ marginBottom: 10 }}>
              {cam.ready ? 'Capture selfie' : 'Starting camera…'}
            </Btn>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={fromFile} />
            <Btn kind="soft" onClick={() => fileRef.current?.click()}>Upload instead</Btn>
          </>
        )}

        {step === 'scanning' && (
          <div style={{ textAlign: 'center', color: T.muted, fontSize: 13, padding: '10px 0' }}>
            Scanning {photos.filter(p => p.type === 'pro').length} photos…
          </div>
        )}

        {step === 'done' && (
          <>
            <div style={{
              background: T.sageTint,
              border: '1px solid rgba(75,114,89,0.3)',
              borderRadius: 14,
              padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
              marginBottom: 20,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: T.sage,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M5 12l5 5L20 7"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.sageTxt }}>
                  Found you in {foundCount} photo{foundCount === 1 ? '' : 's'}
                </div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>They're highlighted in your gallery</div>
              </div>
            </div>
            <Btn kind="primary" onClick={openGallery} style={{ marginBottom: 10 }}>Open gallery →</Btn>
            <Btn kind="soft" onClick={() => { setShotUrl(null); setStep('idle') }}>Retake selfie</Btn>
          </>
        )}

        {(step === 'idle' || step === 'live') && (
          <button onClick={skip} style={{ color: T.dim, fontSize: 13, textAlign: 'center', marginTop: 18 }}>
            Skip — browse all photos
          </button>
        )}
      </div>
    </Shell>
  )
}
