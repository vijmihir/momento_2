import * as faceapi from 'face-api.js'

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'
let loaded = false
let loading = null

export async function loadModels() {
  if (loaded) return
  if (loading) return loading
  loading = (async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ])
    loaded = true
  })()
  return loading
}

const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 })

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// One descriptor (Array of 128 numbers) for the main face, or null.
export async function faceDescriptor(src) {
  await loadModels()
  let el = src
  if (typeof src === 'string') { try { el = await loadImage(src) } catch { return null } }
  const r = await faceapi.detectSingleFace(el, opts).withFaceLandmarks().withFaceDescriptor()
  return r ? Array.from(r.descriptor) : null
}

// All face descriptors in an image (group photo). Array of Array(128).
export async function allFaceDescriptors(src) {
  await loadModels()
  let el = src
  if (typeof src === 'string') { try { el = await loadImage(src) } catch { return [] } }
  const rs = await faceapi.detectAllFaces(el, opts).withFaceLandmarks().withFaceDescriptors()
  return rs.map(r => Array.from(r.descriptor))
}

function dist(a, b) {
  let s = 0
  for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; s += d * d }
  return Math.sqrt(s)
}

// Does `mine` (Array128) appear among `photoDescriptors` (Array of Array128)?
export function appearsIn(mine, photoDescriptors, threshold = 0.55) {
  if (!mine || !photoDescriptors?.length) return false
  return photoDescriptors.some(d => dist(mine, d) < threshold)
}

// Smallest distance between `mine` and any descriptor in `photoDescriptors`,
// or null if none match within `threshold`. Lower = more confident match.
export function bestMatchDistance(mine, photoDescriptors, threshold = 0.55) {
  if (!mine || !photoDescriptors?.length) return null
  let best = null
  for (const d of photoDescriptors) {
    const dd = dist(mine, d)
    if (dd < threshold && (best === null || dd < best)) best = dd
  }
  return best
}
