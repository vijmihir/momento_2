import { T } from '../../theme.js'

export default function NoteList({ notes }) {
  if (!notes.length) {
    return <div style={{ textAlign: 'center', padding: '30px 20px', color: T.dim, fontSize: 13 }}>No notes yet.</div>
  }
  return (
    <div>
      {notes.map(n => (
        <div key={n.id} style={{
          background: T.card, border: `1px solid ${T.bdr}`, borderRadius: 14,
          padding: '12px 16px', marginBottom: 8,
          opacity: n.resolved ? 0.5 : 1,
        }}>
          <div style={{ fontSize: 13.5, color: T.ink, lineHeight: 1.5, textDecoration: n.resolved ? 'line-through' : 'none' }}>{n.note}</div>
          <div style={{ fontSize: 11, color: T.dim, marginTop: 4 }}>
            {n.author_name} {n.resolved && '· resolved'}
          </div>
        </div>
      ))}
    </div>
  )
}
