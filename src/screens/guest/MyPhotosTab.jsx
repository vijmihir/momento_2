import { T } from '../../theme.js'
import { useApp } from '../../context/AppContext.jsx'
import { useCallback } from 'react'
import Avatar from '../../components/ui/Avatar.jsx'
import Btn from '../../components/ui/Btn.jsx'
import PhotoGrid from '../../components/Gallery/PhotoGrid.jsx'

export default function MyPhotosTab({ myShots, onPick }) {
  const { event, guestName, myDescriptor, matchedIds, setView } = useApp()

  const isMine = useCallback(p => matchedIds?.has(p.id) || p._mine, [matchedIds])
  const { photos } = useApp()
  const myPhotos = photos.filter(p => matchedIds?.has(p.id) || p._mine)

  const initial = (guestName[0] || 'G').toUpperCase()

  return (
    <div style={{ padding: '18px 0', animation: 'fadeUp .2s ease' }}>
      {/* Profile card */}
      <div style={{ margin: '0 14px 16px', background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 18, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <Avatar initial={initial} bg={T.sage} size={48} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: T.ink }}>{guestName}</div>
            <div style={{ fontSize: 12, color: T.dim, marginTop: 2 }}>{event?.name}</div>
          </div>
          <div style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: 5,
            background: myDescriptor ? T.sageTint : T.cream2,
            borderRadius: 20, padding: '5px 10px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: myDescriptor ? T.sage : T.dim }} />
            <span style={{ fontSize: 11, color: myDescriptor ? T.sageTxt : T.dim, fontWeight: 500 }}>
              {myDescriptor ? 'Face ID on' : 'No Face ID'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', borderTop: `1px solid ${T.cream2}`, paddingTop: 14 }}>
          {[
            [matchedIds?.size ?? 0, 'Matched'],
            [myShots.length,         'Your shots'],
            [myPhotos.length,        'Total'],
          ].map(([n, label], i) => (
            <div key={label} style={{
              flex: 1, textAlign: 'center',
              borderRight: i < 2 ? `1px solid ${T.cream2}` : 'none',
            }}>
              <div className="serif" style={{ fontSize: 26, fontWeight: 500 }}>{n}</div>
              <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Face ID setup CTA */}
      {!myDescriptor && (
        <div style={{
          margin: '0 14px 16px',
          background: T.card, border: `1.5px dashed ${T.bdr}`,
          borderRadius: 16, padding: '22px 18px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>📸</div>
          <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.55, marginBottom: 14 }}>
            Set up Face ID to automatically find every photo you appear in.
          </p>
          <Btn kind="primary" onClick={() => setView('guestFace')}>
            Set up Face ID
          </Btn>
        </div>
      )}

      {myPhotos.length === 0 && myDescriptor ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: T.dim, fontSize: 14 }}>
          No matches yet — photographer may still be uploading.
        </div>
      ) : (
        <>
          {myPhotos.length > 0 && (
            <div style={{ margin: '0 14px 16px' }}>
              <Btn kind="clay" onClick={() => setView('guestReel')}>Create my highlight reel ✦</Btn>
            </div>
          )}
          <PhotoGrid photos={myPhotos} isMine={() => true} onPick={onPick} />
        </>
      )}
    </div>
  )
}
