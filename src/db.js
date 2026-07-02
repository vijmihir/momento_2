import { createClient } from '@supabase/supabase-js'

// ── Your Supabase project credentials ──────────────────────────────────────────
// Replace these two with the values from your Supabase dashboard:
//   Project Settings → API → Project URL  and  anon/public key
// Then redeploy. Until you do, the app runs in DEMO MODE (seeded sample data,
// nothing persists) so it still works for clicking through.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || ''

export const DEMO_MODE = !SUPABASE_URL || !SUPABASE_ANON

export const supabase = DEMO_MODE
  ? null
  : createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Auth (photographer accounts) ────────────────────────────────────────────────
export async function signUp(email, password, studioName) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { studio_name: studioName } },
  })
  if (error) throw error
  return data.user
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut()
}

export async function getCurrentUser() {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}

// ── Events ───────────────────────────────────────────────────────────────────────
export async function createEvent({ name, venue, date, eventDate }) {
  const user = await getCurrentUser()
  const code = randomCode()
  const coupleCode = randomCode()
  const { data, error } = await supabase
    .from('events')
    .insert({ name, venue, date, code, couple_code: coupleCode, event_date: eventDate || null, owner: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listMyEvents() {
  const user = await getCurrentUser()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('owner', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getEventByCode(code) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getEventByCoupleCode(code) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('couple_code', code.toUpperCase())
    .maybeSingle()
  if (error) throw error
  return data
}

export async function updateEventStatus(eventId, status) {
  const { data, error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', eventId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Photos ─────────────────────────────────────────────────────────────────────
// Upload a file to storage, then insert a row. descriptors = JSON array of face
// vectors (each a plain array of 128 numbers) computed client-side before upload.
export async function uploadPhoto({ eventId, file, type = 'pro', uploaderName = null, descriptors = [] }) {
  const path = `${eventId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
  const { error: upErr } = await supabase.storage.from('photos').upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  })
  if (upErr) throw upErr
  const { data: pub } = supabase.storage.from('photos').getPublicUrl(path)
  const { data, error } = await supabase
    .from('photos')
    .insert({
      event_id: eventId,
      src: pub.publicUrl,
      type,
      uploader_name: uploaderName,
      descriptors,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listPhotos(eventId) {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// Live-subscribe to new photo inserts for an event. Returns an unsubscribe fn.
export function subscribeToPhotos(eventId, onInsert) {
  const channel = supabase
    .channel('photos:' + eventId)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'photos',
      filter: `event_id=eq.${eventId}`,
    }, payload => onInsert(payload.new))
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// ── Guests ───────────────────────────────────────────────────────────────────────
export async function joinAsGuest({ eventId, name, descriptor, email = null }) {
  const { data, error } = await supabase
    .from('guests')
    .insert({ event_id: eventId, name, descriptor, email })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listGuests(eventId) {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ── Delivery workflow (favorites + revision notes) ─────────────────────────────
export async function toggleFavorite({ photoId, eventId, guestName }) {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('photo_id', photoId)
    .eq('guest_name', guestName)
    .maybeSingle()
  if (existing) {
    const { error } = await supabase.from('favorites').delete().eq('id', existing.id)
    if (error) throw error
    return false
  }
  const { error } = await supabase.from('favorites').insert({ photo_id: photoId, event_id: eventId, guest_name: guestName })
  if (error) throw error
  return true
}

export async function listFavorites(eventId) {
  const { data, error } = await supabase.from('favorites').select('*').eq('event_id', eventId)
  if (error) throw error
  return data || []
}

export async function addRevisionNote({ eventId, photoId = null, authorName, note }) {
  const { data, error } = await supabase
    .from('revision_notes')
    .insert({ event_id: eventId, photo_id: photoId, author_name: authorName, note })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listRevisionNotes(eventId) {
  const { data, error } = await supabase
    .from('revision_notes')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function resolveRevisionNote(id) {
  const { error } = await supabase.from('revision_notes').update({ resolved: true }).eq('id', id)
  if (error) throw error
}

// ── Highlight reels ──────────────────────────────────────────────────────────────
export async function saveGuestPhotoMatches(guestId, eventId, matches) {
  if (!matches.length) return
  const rows = matches.map(m => ({ event_id: eventId, guest_id: guestId, photo_id: m.photoId, distance: m.distance }))
  const { error } = await supabase.from('guest_photo_matches').upsert(rows, { onConflict: 'guest_id,photo_id' })
  if (error) throw error
}

export async function uploadReel({ eventId, scope = 'guest', guestName = null, blob, photoIds, durationSeconds }) {
  const path = `${eventId}/${Date.now()}-${Math.random().toString(36).slice(2)}.webm`
  const { error: upErr } = await supabase.storage.from('reels').upload(path, blob, { contentType: 'video/webm', upsert: false })
  if (upErr) throw upErr
  const { data: pub } = supabase.storage.from('reels').getPublicUrl(path)
  const { data, error } = await supabase
    .from('highlight_reels')
    .insert({ event_id: eventId, scope, guest_name: guestName, video_url: pub.publicUrl, photo_ids: photoIds, duration_seconds: durationSeconds })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getReel(id) {
  const { data, error } = await supabase.from('highlight_reels').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let c = ''
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)]
  return c
}
