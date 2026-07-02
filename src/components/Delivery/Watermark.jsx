// Diagonal repeating "PREVIEW" overlay, shown on pro photos until an event is delivered.
// Same technique as CameraTab.jsx's film-grain SVG overlay — a background-image data URI,
// so it costs nothing to render across a whole grid of thumbnails.
export default function Watermark() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100'%3E%3Ctext x='0' y='50' font-family='sans-serif' font-size='16' font-weight='700' fill='rgba(255,255,255,0.35)' transform='rotate(-24 100 50)'%3EPREVIEW%3C/text%3E%3C/svg%3E")`,
      backgroundSize: '160px',
      pointerEvents: 'none',
      mixBlendMode: 'overlay',
    }} />
  )
}
