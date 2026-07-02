import { useApp, AppProvider } from './context/AppContext.jsx'
import { DEMO_MODE } from './db.js'
import Toast from './components/Toast.jsx'
import Spinner from './components/ui/Spinner.jsx'
import { T } from './theme.js'

// Screens
import Splash from './screens/Splash.jsx'
import GuestJoin from './screens/GuestJoin.jsx'
import GuestFace from './screens/GuestFace.jsx'
import GuestApp from './screens/guest/GuestApp.jsx'
import PhAuth from './screens/photographer/PhAuth.jsx'
import PhDash from './screens/photographer/PhDash.jsx'
import PhEvent from './screens/photographer/PhEvent.jsx'
import WallView from './screens/WallView.jsx'
import CoupleJoin from './screens/couple/CoupleJoin.jsx'
import CoupleApp from './screens/couple/CoupleApp.jsx'
import HighlightReel from './screens/guest/HighlightReel.jsx'
import ReelView from './screens/ReelView.jsx'

function Router() {
  const { view, toast, authLoading } = useApp()

  if (authLoading && !DEMO_MODE) {
    return (
      <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: T.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner color={T.sage} size={24} />
      </div>
    )
  }

  return (
    <>
      {view === 'splash'    && <Splash />}
      {view === 'guestJoin' && <GuestJoin />}
      {view === 'guestFace' && <GuestFace />}
      {view === 'guestApp'  && <GuestApp />}
      {view === 'phAuth'    && <PhAuth />}
      {view === 'phDash'    && <PhDash />}
      {view === 'phEvent'   && <PhEvent />}
      {view === 'wall'      && <WallView />}
      {view === 'coupleJoin' && <CoupleJoin />}
      {view === 'coupleApp'  && <CoupleApp />}
      {view === 'guestReel'  && <HighlightReel />}
      {view === 'reelView'   && <ReelView />}
      <Toast msg={toast} />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
