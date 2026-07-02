import { useState } from 'react'
import { T } from '../../theme.js'
import { useApp } from '../../context/AppContext.jsx'
import BottomNav from '../../components/BottomNav.jsx'
import Lightbox from '../../components/Lightbox.jsx'
import GalleryTab from './GalleryTab.jsx'
import MyPhotosTab from './MyPhotosTab.jsx'
import CameraTab from './CameraTab.jsx'

export default function GuestApp() {
  const { } = useApp()
  const [tab, setTab] = useState('gallery')
  const [lightbox, setLightbox] = useState(null)
  const [myShots, setMyShots] = useState([])

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

      {lightbox && <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}
