import { useState, useEffect, useCallback, useRef } from 'react'
import { T } from '../../theme.js'
import { useApp } from '../../context/AppContext.jsx'
import { DEMO_MODE, uploadPhoto, listPhotos, listGuests } from '../../db.js'
import { DEMO_PHOTOS, DEMO_GUESTS, GUEST_COLORS } from '../../context/AppContext.jsx'
import { loadModels, allFaceDescriptors } from '../../faceEngine.js'
import Shell from '../../components/Shell.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import Photo from '../../components/ui/Photo.jsx'

// QR via free API — no package needed
function QRCode({ url, size = 200 }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=F7F3EA&color=1C1814&margin=10`
  return (
    <img
      src={src}
      alt="QR code"
      width={size}
      height={size}
      style={{ borderRadius: 12, display: 'block', margin: '0 auto' }}
    />
  )
}

export default function PhEvent() {
  const { event, setView, showToast } = useApp()
  const [tab, setTab] = useState('share')
  const [photos, setPhotos] = useState([])
  const [guests, setGuests] = useState([])
  const [uploading, setUploading] = useState(false)
  const [upPct, setUpPct] = useState(0)
  const [upStep, setUpStep] = useState('')
  const fileRef = useRef()

  const refresh = useCallback(async () => {
    if (DEMO_MODE) { setPhotos(DEMO_PHOTOS[event.id] || []); setGuests(DEMO_GUESTS); return }
    try {
      const [ps, gs] = await Promise.all([listPhotos(event.id), listGuests(event.id)])
      setPhotos(ps); setGuests(gs)
    } catch {}
  }, [event])

  useEffect(() => { refresh() }, [refresh])

  const shareLink = `${window.location.origin}?e=${event.code}`

  const copyLink = () => {
    navigator.clipboard?.writeText(shareLink)
      .then(() => showToast('Link copied ✓'))
      .catch(() => showToast(shareLink))
  }

  const shareNative = async () => {
    if (!navigator.share) { copyLink(); return }
    try { await navigator.share({ title: event.name, text: `Join the photo gallery for ${event.name}`, url: shareLink }) }
    catch {}
  }

  const upload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length || uploading) return
    setUploading(true); setUpPct(0); setUpStep('Preparing…')
    await loadModels().catch(() => {})
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      setUpStep(`${i + 1} of ${files.length} — indexing faces…`)
      if (DEMO_MODE) {
        const url = await new Promise(r => { const rd = new FileReader(); rd.onload = ev => r(ev.target.result); rd.readAsDataURL(f) })
        setPhotos(p => [{ id: 'd' + Date.now() + i, src: url, type: 'pro', title: f.name }, ...p])
      } else {
        try {
          const url = await new Promise(r => { const rd = new FileReader(); rd.onload = ev => r(ev.target.result); rd.readAsDataURL(f) })
          const descriptors = await allFaceDescriptors(url).catch(() => [])
          const row = await uploadPhoto({ eventId: event.id, file: f, type: 'pro', descriptors })
          setPhotos(p => [row, ...p])
        } catch (err) { showToast('Upload failed: ' + (err.message || '')) }
      }
      setUpPct(Math.round(((i + 1) / files.length) * 100))
    }
    setUpStep('Done!')
    setTimeout(() => { setUploading(false); setUpPct(0); setUpStep('') }, 1200)
    showToast(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded`)
    e.target.value = ''
  }

  return (
    <Shell>
      <div style={{ minHeight: '100vh', paddingBottom: 20 }}>
        {/* Header */}
        <div style={{ background: T.sage, color: T.off, padding: '18px 20px 22px', borderRadius: '0 0 26px 26px' }}>
          <button onClick={() => setView('phDash')} style={{ color: 'rgba(245,241,232,.75)', fontSize: 13, marginBottom: 14 }}>
            ← All events
          </button>
          <div className="serif" style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>{event.name}</div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            {[event.venue, event.date].filter(Boolean).join(' · ')}
          </div>
        </div>

        <div style={{ padding: '18px 18px' }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 20, background: T.cream2, padding: 4, borderRadius: 14 }}>
            {[['share','Share'],['upload','Upload'],['guests','Guests']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  flex: 1, padding: '9px 4px', borderRadius: 11,
                  fontSize: 13, fontWeight: 500,
                  background: tab === id ? T.card : 'transparent',
                  color: tab === id ? T.ink : T.muted,
                  boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all .15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* SHARE TAB */}
          {tab === 'share' && (
            <div style={{ animation: 'fadeUp .2s ease' }}>
              <div style={{ background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 18, padding: 22, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: 16 }}>
                  Scan to join
                </div>
                <QRCode url={shareLink} size={200} />
                <div className="serif" style={{ fontSize: 38, fontWeight: 500, color: T.sage, textAlign: 'center', letterSpacing: '5px', margin: '16px 0 4px' }}>
                  {event.code}
                </div>
                <div style={{ fontSize: 12, color: T.dim, textAlign: 'center', marginBottom: 18 }}>
                  Guests scan this QR or enter the code at momentó
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={copyLink}
                    style={{
                      flex: 1, padding: 12,
                      background: T.sageBg, color: T.sage,
                      borderRadius: 11, fontSize: 13, fontWeight: 500,
                    }}
                  >
                    Copy link
                  </button>
                  {!!navigator.share && (
                    <button
                      onClick={shareNative}
                      style={{
                        flex: 1, padding: 12,
                        background: T.sage, color: T.off,
                        borderRadius: 11, fontSize: 13, fontWeight: 500,
                      }}
                    >
                      Share →
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  [photos.length, 'Photos'],
                  [guests.length, 'Guests'],
                  [guests.filter(g => g.matched).length, 'Face IDs'],
                ].map(([n, label]) => (
                  <div key={label} style={{ flex: 1, background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                    <div className="serif" style={{ fontSize: 28, fontWeight: 500 }}>{n}</div>
                    <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPLOAD TAB */}
          {tab === 'upload' && (
            <div style={{ animation: 'fadeUp .2s ease' }}>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={upload} />

              {/* Drop zone */}
              <div
                onClick={() => !uploading && fileRef.current?.click()}
                style={{
                  border: `1.5px dashed ${T.clay}`,
                  borderRadius: 18,
                  padding: '40px 20px',
                  textAlign: 'center',
                  cursor: uploading ? 'default' : 'pointer',
                  marginBottom: 16,
                  background: T.clayBg,
                  transition: 'opacity .2s',
                  opacity: uploading ? 0.5 : 1,
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T.clay} strokeWidth="1.4" style={{ opacity: 0.5, marginBottom: 12 }}>
                  <path d="M12 16V4m0 0l-4 4m4-4l4 4"/>
                  <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>
                </svg>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 5, color: T.ink }}>Upload photos</div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
                  Faces are indexed on upload — guests match instantly
                </div>
              </div>

              {/* Upload progress */}
              {uploading && (
                <div style={{ background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Spinner color={T.clay} size={13} />
                      {upStep}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.clay }}>{upPct}%</div>
                  </div>
                  <div style={{ height: 4, background: T.cream2, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${upPct}%`, background: T.clay, borderRadius: 2, transition: 'width .3s' }} />
                  </div>
                </div>
              )}

              {/* Photo grid */}
              {photos.length > 0 && (
                <div style={{ columns: 3, columnGap: 5 }}>
                  {photos.map(p => (
                    <div key={p.id} style={{ breakInside: 'avoid', marginBottom: 5, borderRadius: 9, overflow: 'hidden' }}>
                      <Photo src={p.src} style={{ width: '100%', display: 'block' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GUESTS TAB */}
          {tab === 'guests' && (
            <div style={{ animation: 'fadeUp .2s ease' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: 14 }}>
                {guests.length} guest{guests.length === 1 ? '' : 's'} joined
              </div>

              {guests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: T.dim, fontSize: 14 }}>
                  No guests yet. Share the code to get started.
                </div>
              ) : guests.map((g, i) => (
                <div key={g.id} style={{ background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Avatar initial={g.name[0]} bg={GUEST_COLORS[i % GUEST_COLORS.length]} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: g.matched ? T.sage : T.dim, marginTop: 2 }}>
                      {g.matched ? '✓ Face registered' : 'Pending face ID'}
                    </div>
                  </div>
                  {typeof g.count === 'number' && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: T.sage }}>{g.count}</div>
                      <div style={{ fontSize: 10, color: T.dim }}>photos</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  )
}
