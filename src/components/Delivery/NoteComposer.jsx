import { useState } from 'react'
import { T } from '../../theme.js'
import Btn from '../ui/Btn.jsx'

export default function NoteComposer({ onSubmit }) {
  const [text, setText] = useState('')

  const submit = () => {
    const t = text.trim()
    if (!t) return
    onSubmit(t)
    setText('')
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="Leave a note for the photographer…"
        style={{
          flex: 1, padding: '12px 14px',
          background: T.card, border: `1px solid ${T.bdr}`,
          borderRadius: 12, fontSize: 14, color: T.ink,
        }}
      />
      <Btn kind="primary" full={false} onClick={submit} style={{ padding: '0 18px' }}>Send</Btn>
    </div>
  )
}
