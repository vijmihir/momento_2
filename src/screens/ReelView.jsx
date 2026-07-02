import { T } from '../theme.js'
import { useApp } from '../context/AppContext.jsx'
import Shell from '../components/Shell.jsx'

export default function ReelView() {
  const { reel, setView } = useApp()

  if (!reel) return null

  return (
    <Shell dark>
      <div style={{ minHeight: '100vh', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <video src={reel.video_url} controls autoPlay playsInline style={{ width: '100%', borderRadius: 16, marginBottom: 20 }} />
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="serif" style={{ fontSize: 20, fontWeight: 500, color: T.off, marginBottom: 4 }}>
            {reel.guest_name ? `${reel.guest_name}'s highlights` : 'Event highlights'}
          </div>
          <div style={{ fontSize: 12, color: T.offDim }}>via momentó</div>
        </div>
        <a href={reel.video_url} download="momento-highlights.webm" style={{
          display: 'block', textAlign: 'center', background: T.off, color: T.ink,
          fontSize: 14, fontWeight: 500, padding: 14, borderRadius: 13,
        }}>
          Download
        </a>
        <button onClick={() => setView('splash')} style={{ color: T.offDim, fontSize: 13, textAlign: 'center', marginTop: 20 }}>
          Open momentó →
        </button>
      </div>
    </Shell>
  )
}
