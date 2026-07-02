import { useState } from 'react'
import { T } from '../../theme.js'

export default function PhotoNotes({ notes, onAdd }) {
  const [text, setText] = useState('')

  const submit = () => {
    const t = text.trim()
    if (!t) return
    onAdd(t)
    setText('')
  }

  return (
    <div style={{ width: '100%', textAlign: 'left' }}>
      {notes.length > 0 && (
        <div style={{ marginBottom: 10, maxHeight: 140, overflowY: 'auto' }}>
          {notes.map(n => (
            <div key={n.id} style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: T.off, lineHeight: 1.5 }}>
                <b>{n.author_name}</b> {n.text}
              </span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Add a memory or story…"
          style={{
            flex: 1, padding: '10px 14px',
            background: T.offGhost ?? 'rgba(245,241,232,0.08)',
            border: `1px solid ${T.offFaint}`,
            borderRadius: 11, fontSize: 13, color: T.off,
          }}
        />
        <button
          onClick={submit}
          style={{ background: T.clay, color: '#fff', fontSize: 13, fontWeight: 500, padding: '0 16px', borderRadius: 11 }}
        >
          Post
        </button>
      </div>
    </div>
  )
}
