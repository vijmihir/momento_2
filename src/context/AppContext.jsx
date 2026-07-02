import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { DEMO_MODE, getCurrentUser, getEventByCode, listPhotos } from '../db.js'
import { loadModels } from '../faceEngine.js'

// ─── Demo data ────────────────────────────────────────────────────────────────
function img(id) { return `https://images.unsplash.com/photo-${id}?w=600&q=80` }

export const DEMO_EVENTS = [
  { id:'demo-1', name:'Sharma · Gupta Wedding', venue:'The Shangri-La', date:'Jun 14 2026', code:'SHARMA', cover:'1519741497674-611481863552' },
  { id:'demo-2', name:'Kumar Corporate Summit',  venue:'Marina Bay Sands', date:'Jun 10 2026', code:'KUMAR',  cover:'1540575467063-178a50c2df87' },
  { id:'demo-3', name:"Priya's 30th Birthday",   venue:'Capella Hotel',  date:'Jun 5 2026',  code:'PRIYA',  cover:'1530103862676-de8c9debad1d' },
]

export const DEMO_PHOTOS = {
  'demo-1': [
    { id:1,  src:img('1519741497674-611481863552'), type:'pro',   title:'The altar' },
    { id:2,  src:img('1606216794074-735e91aa2c92'), type:'pro',   title:'Bridal portrait' },
    { id:3,  src:img('1532712938310-34cb3982ef74'), type:'pro',   title:'First dance' },
    { id:4,  src:img('1465495976277-4387d4b0b4c6'), type:'pro',   title:'Garden moment' },
    { id:5,  src:img('1583939003579-730e3918a45a'), type:'pro',   title:'Reception joy' },
    { id:6,  src:img('1537633552985-df8429e8048b'), type:'pro',   title:'Group shot' },
    { id:7,  src:img('1511285560929-80b456fea0bc'), type:'pro',   title:'Dinner tables' },
    { id:8,  src:img('1520854221256-17451cc331bf'), type:'pro',   title:'Decor detail' },
    { id:9,  src:img('1591604466107-ec97de577aff'), type:'guest', title:'Candid moment', uploader_name:'Priya' },
    { id:10, src:img('1545232979-8bf68ee9b1af'), type:'guest', title:'Garden fun',    uploader_name:'Sarah' },
    { id:11, src:img('1472653431158-6364773b2a56'), type:'guest', title:'Dancing',       uploader_name:'Dev' },
    { id:12, src:img('1554696468-19f8c7a71ad5'), type:'pro',   title:'Detail shot' },
  ],
  'demo-2': [
    { id:21, src:img('1540575467063-178a50c2df87'), type:'pro', title:'Keynote' },
    { id:22, src:img('1505373877841-8d25f7d46678'), type:'pro', title:'Panel session' },
    { id:23, src:img('1511578314322-379afb476865'), type:'pro', title:'Networking' },
  ],
  'demo-3': [
    { id:31, src:img('1530103862676-de8c9debad1d'), type:'pro',   title:'Cake moment' },
    { id:32, src:img('1464349095431-e9a21285b5f3'), type:'pro',   title:'Toast' },
    { id:33, src:img('1492684223066-81342ee5ff30'), type:'guest', title:'Dance floor', uploader_name:'Ananya' },
  ],
}

export const DEMO_GUESTS = [
  { id:'g1', name:'Priya Sharma', count:23, matched:true },
  { id:'g2', name:'Arjun Gupta',  count:18, matched:true },
  { id:'g3', name:'Sarah Chen',   count:12, matched:true },
  { id:'g4', name:'Dev Kapoor',   count:7,  matched:true },
  { id:'g5', name:'Rohan Mehta',  count:0,  matched:false },
]

export const GUEST_COLORS = ['#9A4A4A','#4A4A8A','#3D7860','#7A6030','#7A4868','#486078']

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [view, setView] = useState('splash')
  const [toast, setToast] = useState('')

  // Photographer session
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Guest session
  const [event, setEvent] = useState(null)
  const [photos, setPhotos] = useState([])
  const [guestName, setGuestName] = useState('')
  const [myDescriptor, setMyDescriptor] = useState(null)
  const [matchedIds, setMatchedIds] = useState(new Set())

  const showToast = useCallback(msg => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }, [])

  const startGuestJoin = useCallback(async (code) => {
    if (DEMO_MODE) {
      const ev = DEMO_EVENTS.find(e => e.code === code.toUpperCase()) || DEMO_EVENTS[0]
      setEvent(ev)
      setPhotos(DEMO_PHOTOS[ev.id] || [])
      setView('guestJoin')
      return
    }
    try {
      const ev = await getEventByCode(code)
      if (!ev) { showToast('No event with that code'); return }
      setEvent(ev)
      setPhotos(await listPhotos(ev.id))
      setView('guestJoin')
    } catch {
      showToast('Could not load event')
    }
  }, [showToast])

  useEffect(() => {
    ;(async () => {
      loadModels().catch(() => {})
      if (!DEMO_MODE) {
        const u = await getCurrentUser()
        if (u) { setUser(u); setView('phDash') }
      }
      const params = new URLSearchParams(window.location.search)
      const code = params.get('e')
      if (code) await startGuestJoin(code)
      setAuthLoading(false)
    })()
  }, [startGuestJoin])

  return (
    <AppContext.Provider value={{
      view, setView,
      toast, showToast,
      user, setUser,
      authLoading,
      event, setEvent,
      photos, setPhotos,
      guestName, setGuestName,
      myDescriptor, setMyDescriptor,
      matchedIds, setMatchedIds,
      startGuestJoin,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
