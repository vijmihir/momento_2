import { useState, useEffect, useCallback } from 'react'
import { T } from '../../theme.js'
import { useApp } from '../../context/AppContext.jsx'
import { DEMO_MODE, toggleFavorite, listFavorites, addRevisionNote, listRevisionNotes } from '../../db.js'
import Header from '../../components/Header.jsx'
import BottomNav from '../../components/BottomNav.jsx'
import Lightbox from '../../components/Lightbox.jsx'
import PhotoGrid from '../../components/Gallery/PhotoGrid.jsx'
import FavoriteButton from '../../components/Delivery/FavoriteButton.jsx'
import Watermark from '../../components/Delivery/Watermark.jsx'
import NoteComposer from '../../components/Delivery/NoteComposer.jsx'
import NoteList from '../../components/Delivery/NoteList.jsx'

const TABS = [
  { id: 'gallery', label: 'Gallery', icon: (
    <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>
  )},
  { id: 'favorites', label: 'Favorites', icon: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z" />
  )},
  { id: 'notes', label: 'Notes', icon: (
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  )},
]

export default function CoupleApp() {
  const { event, photos, coupleName } = useApp()
  const [tab, setTab] = useState('gallery')
  const [lightbox, setLightbox] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [notes, setNotes] = useState([])

  const refresh = useCallback(async () => {
    if (DEMO_MODE) return
    try {
      const [fs, ns] = await Promise.all([listFavorites(event.id), listRevisionNotes(event.id)])
      setFavorites(fs); setNotes(ns)
    } catch {}
  }, [event])

  useEffect(() => { refresh() }, [refresh])

  const favoritedIds = new Set(favorites.filter(f => f.guest_name === coupleName).map(f => f.photo_id))

  const toggle = async (photo) => {
    const willBeActive = !favoritedIds.has(photo.id)
    setFavorites(f => willBeActive
      ? [...f, { photo_id: photo.id, guest_name: coupleName }]
      : f.filter(x => !(x.photo_id === photo.id && x.guest_name === coupleName)))
    if (!DEMO_MODE) {
      try { await toggleFavorite({ photoId: photo.id, eventId: event.id, guestName: coupleName }) }
      catch { refresh() }
    }
  }

  const sendNote = async (photoId, text) => {
    const optimistic = { id: 'tmp-' + Date.now(), note: text, author_name: coupleName, resolved: false, photo_id: photoId }
    setNotes(n => [optimistic, ...n])
    if (!DEMO_MODE) {
      try { await addRevisionNote({ eventId: event.id, photoId, authorName: coupleName, note: text }) }
      catch {}
      refresh()
    }
  }

  const proPhotos = photos.filter(p => p.type === 'pro')
  const favoritedPhotos = proPhotos.filter(p => favoritedIds.has(p.id))
  const watermarked = event.status && event.status !== 'delivered'

  const badge = (photo) => (
    <>
      {watermarked && <Watermark />}
      <div style={{ position: 'absolute', bottom: 6, right: 6 }}>
        <FavoriteButton active={favoritedIds.has(photo.id)} onClick={() => toggle(photo)} size={26} />
      </div>
    </>
  )

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', paddingBottom: 78, background: T.cream, position: 'relative' }}>
      <Header title={event.name} sub={`Delivery portal · ${event.status || 'shooting'}`} initial={(coupleName[0] || 'C').toUpperCase()} />

      {tab === 'gallery' && (
        proPhotos.length === 0
          ? <div style={{ textAlign: 'center', padding: '60px 20px', color: T.dim, fontSize: 14 }}>No photos yet.</div>
          : <PhotoGrid photos={proPhotos} onPick={setLightbox} renderBadge={badge} />
      )}

      {tab === 'favorites' && (
        favoritedPhotos.length === 0
          ? <div style={{ textAlign: 'center', padding: '60px 20px', color: T.dim, fontSize: 14 }}>Tap the heart on any photo to favorite it.</div>
          : <PhotoGrid photos={favoritedPhotos} onPick={setLightbox} renderBadge={badge} />
      )}

      {tab === 'notes' && (
        <div style={{ padding: '16px 16px 100px' }}>
          <div style={{ marginBottom: 16 }}>
            <NoteComposer onSubmit={(text) => sendNote(null, text)} />
          </div>
          <NoteList notes={notes} />
        </div>
      )}

      <BottomNav tab={tab} setTab={setTab} tabs={TABS} />

      {lightbox && (
        <Lightbox
          photo={lightbox}
          onClose={() => setLightbox(null)}
          actions={
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => toggle(lightbox)}
                style={{
                  background: favoritedIds.has(lightbox.id) ? T.clay : T.offGhost,
                  color: T.off, fontSize: 13, fontWeight: 500,
                  padding: '10px 18px', borderRadius: 10,
                }}
              >
                {favoritedIds.has(lightbox.id) ? '♥ Favorited' : '♡ Favorite'}
              </button>
            </div>
          }
        />
      )}
    </div>
  )
}
