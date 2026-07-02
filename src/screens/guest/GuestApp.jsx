import { useState, useEffect, useCallback } from 'react'
import { T } from '../../theme.js'
import { useApp } from '../../context/AppContext.jsx'
import { DEMO_MODE, addPhotoNote, listPhotoNotes } from '../../db.js'
import BottomNav from '../../components/BottomNav.jsx'
import Lightbox from '../../components/Lightbox.jsx'
import PhotoNotes from '../../components/Gallery/PhotoNotes.jsx'
import GalleryTab from './GalleryTab.jsx'
import MyPhotosTab from './MyPhotosTab.jsx'
import CameraTab from './CameraTab.jsx'

const DEMO_NOTES_SEED = [
  { id: 'seed-1', photo_id: 1, author_name: 'Sarah', text: 'This moment made me cry 😭' },
  { id: 'seed-2', photo_id: 3, author_name: 'Dev', text: 'Best first dance I have ever seen' },
]

export default function GuestApp() {
  const { event, guestName } = useApp()
  const [tab, setTab] = useState('gallery')
  const [lightbox, setLightbox] = useState(null)
  const [myShots, setMyShots] = useState([])
  const [notes, setNotes] = useState(DEMO_MODE ? DEMO_NOTES_SEED : [])

  const refreshNotes = useCallback(async () => {
    if (DEMO_MODE || !event) return
    try { setNotes(await listPhotoNotes(event.id)) } catch {}
  }, [event])

  useEffect(() => { refreshNotes() }, [refreshNotes])

  const addNote = async (text) => {
    if (!lightbox) return
    const optimistic = { id: 'tmp-' + Date.now(), photo_id: lightbox.id, author_name: guestName, text }
    setNotes(n => [...n, optimistic])
    if (!DEMO_MODE) {
      try { await addPhotoNote({ photoId: lightbox.id, eventId: event.id, authorName: guestName, text }) }
      catch {}
      refreshNotes()
    }
  }

  const dark = tab === 'cam'

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto',
      minHeight: '100vh',
      paddingBottom: 78,
      background: dark ? T.dark : T.cream,
      position: 'relative',
    }}>
      {tab === 'gallery' && <GalleryTab onPick={setLightbox} />}
      {tab === 'mine'    && <MyPhotosTab myShots={myShots} onPick={setLightbox} />}
      {tab === 'cam'     && <CameraTab myShots={myShots} setMyShots={setMyShots} onPick={setLightbox} />}

      <BottomNav tab={tab} setTab={setTab} dark={dark} />

      {lightbox && (
        <Lightbox
          photo={lightbox}
          onClose={() => setLightbox(null)}
          actions={<PhotoNotes notes={notes.filter(n => n.photo_id === lightbox.id)} onAdd={addNote} />}
        />
      )}
    </div>
  )
}
