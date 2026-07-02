// Renders a set of photos into a shareable highlight video: Ken Burns pan/zoom per photo,
// crossfade between them, captured off an offscreen canvas via MediaRecorder. No server,
// no extra dependencies — same "draw to canvas" approach as camera.js's applyFilm.

const WIDTH = 720
const HEIGHT = 1280
const PHOTO_MS = 3000
const CROSSFADE_MS = 400

function pickMimeType() {
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
  for (const t of candidates) {
    if (window.MediaRecorder?.isTypeSupported?.(t)) return t
  }
  return null
}

export function reelSupported() {
  return !!(window.MediaRecorder && document.createElement('canvas').captureStream && pickMimeType())
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Cover-fit draw with a Ken Burns pan/zoom that eases from `t=0` to `t=1` across the photo's slot.
function drawFrame(ctx, img, t, seed) {
  const startScale = 1.0
  const endScale = 1.15
  const scale = startScale + (endScale - startScale) * t

  const imgRatio = img.width / img.height
  const canvasRatio = WIDTH / HEIGHT
  let drawW, drawH
  if (imgRatio > canvasRatio) { drawH = HEIGHT * scale; drawW = drawH * imgRatio }
  else { drawW = WIDTH * scale; drawH = drawW / imgRatio }

  // Randomized (but seeded, stable per-photo) pan direction
  const dx = (seed % 2 === 0 ? 1 : -1) * (drawW - WIDTH) * 0.5 * t
  const dy = ((seed >> 1) % 2 === 0 ? 1 : -1) * (drawH - HEIGHT) * 0.5 * t

  const x = (WIDTH - drawW) / 2 - dx
  const y = (HEIGHT - drawH) / 2 - dy

  ctx.drawImage(img, x, y, drawW, drawH)
}

// photos: array of {id, src}. onProgress(fraction 0-1). Resolves to a webm Blob.
export async function renderReel({ photos, onProgress }) {
  const mimeType = pickMimeType()
  if (!mimeType) throw new Error('unsupported')

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')

  const images = []
  for (const p of photos) {
    try { images.push(await loadImage(p.src)) } catch { /* skip broken images */ }
  }
  if (!images.length) throw new Error('no-images')

  const stream = canvas.captureStream(30)
  const chunks = []
  const recorder = new MediaRecorder(stream, { mimeType })
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }

  const done = new Promise(resolve => { recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' })) })
  recorder.start()

  const totalMs = images.length * PHOTO_MS
  let elapsed = 0
  const frameDelay = 1000 / 30

  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    const nextImg = images[i + 1]
    const steps = Math.round(PHOTO_MS / frameDelay)
    for (let s = 0; s < steps; s++) {
      const t = s / steps
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)
      drawFrame(ctx, img, t, i)

      // Crossfade into next photo near the end of this slot
      const msLeft = PHOTO_MS - s * frameDelay
      if (nextImg && msLeft < CROSSFADE_MS) {
        const fadeT = 1 - msLeft / CROSSFADE_MS
        ctx.save()
        ctx.globalAlpha = fadeT
        drawFrame(ctx, nextImg, 0, i + 1)
        ctx.restore()
      }

      elapsed += frameDelay
      onProgress?.(Math.min(1, elapsed / totalMs))
      await new Promise(r => setTimeout(r, frameDelay))
    }
  }

  recorder.stop()
  return done
}
