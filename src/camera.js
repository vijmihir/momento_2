import { useRef, useState, useCallback, useEffect } from 'react'

export function useCamera(facingMode = 'environment') {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  const start = useCallback(async () => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia) { setError('no-api'); setReady(false); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
      setReady(true)
    } catch (e) {
      setError(e.name === 'NotAllowedError' ? 'denied' : 'unavailable')
      setReady(false)
    }
  }, [facingMode])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setReady(false)
  }, [])

  // Returns { dataUrl, blob }
  const capture = useCallback(async (withFilm = true) => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return null
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    if (withFilm) applyFilm(ctx, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.85))
    return { dataUrl, blob }
  }, [])

  useEffect(() => () => stop(), [stop])
  return { videoRef, ready, error, start, stop, capture }
}

export function applyFilm(ctx, w, h) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.min(255, d[i] * 1.12 + 20)
    d[i+1] = Math.min(255, d[i+1] * 1.02 + 6)
    d[i+2] = Math.min(255, d[i+2] * 0.82)
    const g = (Math.random() - 0.5) * 26
    d[i] = Math.min(255, Math.max(0, d[i] + g))
    d[i+1] = Math.min(255, Math.max(0, d[i+1] + g))
    d[i+2] = Math.min(255, Math.max(0, d[i+2] + g))
  }
  ctx.putImageData(img, 0, 0)
}

// Apply film to a File/dataURL → { dataUrl, blob }
export function filmFromFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const im = new Image()
      im.onload = async () => {
        const canvas = document.createElement('canvas')
        canvas.width = im.width; canvas.height = im.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(im, 0, 0)
        applyFilm(ctx, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.85))
        resolve({ dataUrl, blob })
      }
      im.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export function readFileAsDataUrl(file) {
  return new Promise(resolve => {
    const r = new FileReader()
    r.onload = e => resolve(e.target.result)
    r.readAsDataURL(file)
  })
}

export function dataUrlToBlob(dataUrl) {
  return fetch(dataUrl).then(r => r.blob())
}
