import { useState, useEffect, useCallback } from 'react'
import { T } from '../../theme.js'
import { useApp } from '../../context/AppContext.jsx'
import { DEMO_MODE, signOut, createEvent, listMyEvents } from '../../db.js'
import { DEMO_EVENTS } from '../../context/AppContext.jsx'
import Shell from '../../components/Shell.jsx'
import Btn from '../../components/ui/Btn.jsx'
import Field from '../../components/ui/Field.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import Photo from '../../components/ui/Photo.jsx'

function img(id) { return `https://images.unsplash.com/photo-${id}?w=200&q=60` }

export default function PhDash() {
  const { user, setUser, setEvent, setView, showToast } = useApp()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', venue: '', date: '' })

  const refresh = useCallback(async () => {
    setLoading(true)
    if (DEMO_MODE) { setEvents(DEMO_EVENTS); setLoading(false); return }
    try { setEvents(await listMyEvents()) } catch { showToast('Could not load events') }
    setLoading(false)
  }, [showToast])

  useEffect(() => { refresh() }, [refresh])

  const create = async () => {
    if (!form.name.trim()) { showToast('Give the event a name'); return }
    if (DEMO_MODE) {
      const ev = { id: 'demo-new-' + Date.now(), name: form.name, venue: form.venue, date: form.date || 'Today', code: 'NEW' + Math.random().toString(36).slice(2,5).toUpperCase(), cover: '1519741497674-611481863552' }
      setEvents(prev => [ev, ...prev])
      setCreating(false); setForm({ name: '', venue: '', date: '' })
      showToast(`Created! Code: ${ev.code}`)
      return
    }
    try {
      const ev = await createEvent(form)
      setEvents(prev => [ev, ...prev])
      setCreating(false); setForm({ name: '', venue: '', date: '' })
      showToast(`Event created · code ${ev.code}`)
    } catch (e) { showToast(e.message || 'Could not create event') }
  }

  const openEvent = ev => { setEvent(ev); setView('phEvent') }

  const handleSignOut = async () => {
    if (!DEMO_MODE) await signOut()
    setUser(null); setView('splash')
  }

  const studioName = user?.user_metadata?.studio_name || 'My Studio'

  return (
    <Shell>
      <div style={{ minHeight: '100vh', paddingBottom: 24 }}>
        {/* Header */}
        <div style={{
          background: T.sage, color: T.off,
          padding: '20px 20px 24px',
          borderRadius: '0 0 28px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(245,241,232,0.7)" strokeWidth="1.7">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3.5"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.9 }}>{studioName}</span>
            </div>
            <button
              onClick={handleSignOut}
              style={{ background: 'rgba(245,241,232,0.15)', color: T.off, fontSize: 12, padding: '6px 14px', borderRadius: 8 }}
            >
              Sign out
            </button>
          </div>
          <div className="serif" style={{ fontSize: 28, fontWeight: 500, marginBottom: 4 }}>Your events</div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            {loading ? 'Loading…' : `${events.length} event${events.length === 1 ? '' : 's'}`}
          </div>
        </div>

        <div style={{ padding: '20px 18px' }}>
          {/* Create button or form */}
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              style={{
                width: '100%', padding: 15,
                border: `1.5px dashed ${T.sage}`,
                borderRadius: 16,
                background: T.sageBg,
                color: T.sage,
                fontSize: 15, fontWeight: 500,
                marginBottom: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              Create new event
            </button>
          ) : (
            <div style={{ background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 16, padding: 18, marginBottom: 18, animation: 'fadeUp .2s ease' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 14 }}>New event</div>
              <Field label="Event name *" value={form.name} set={v => setForm(f => ({...f, name: v}))} placeholder="Sharma · Gupta Wedding" />
              <Field label="Venue" value={form.venue} set={v => setForm(f => ({...f, venue: v}))} placeholder="The Shangri-La" />
              <Field label="Date" value={form.date} set={v => setForm(f => ({...f, date: v}))} placeholder="Jun 14 2026" mb={18} />
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn kind="primary" onClick={create}>Create event</Btn>
                <button onClick={() => setCreating(false)} style={{ padding: '0 18px', background: T.cream2, borderRadius: 12, color: T.muted, fontSize: 14, fontWeight: 500 }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Events list */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Spinner color={T.sage} size={22} />
            </div>
          ) : events.map(ev => (
            <div
              key={ev.id}
              onClick={() => openEvent(ev)}
              style={{
                background: T.card, border: `1px solid ${T.bdr}`,
                borderRadius: 16, padding: 14,
                marginBottom: 10,
                display: 'flex', gap: 14, alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform .1s',
              }}
            >
              {/* Cover thumbnail */}
              <div style={{ width: 58, height: 58, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                <Photo
                  src={ev.cover ? img(ev.cover) : img('1519741497674-611481863552')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.name}
                </div>
                <div style={{ fontSize: 11, color: T.dim, marginBottom: 7 }}>
                  {[ev.venue, ev.date].filter(Boolean).join(' · ')}
                </div>
                <div style={{
                  display: 'inline-block', fontSize: 11, fontWeight: 700,
                  color: T.sage, background: T.sageTint,
                  padding: '3px 10px', borderRadius: 7, letterSpacing: '.5px',
                }}>
                  {ev.code}
                </div>
              </div>

              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.faint} strokeWidth="1.8">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  )
}
