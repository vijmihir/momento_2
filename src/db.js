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
export async function createEvent({ name, venue, date }) {
  const user = await getCurrentUser()
  const code = randomCode()
  const { data, error } = await supabase
    .from('events')
    .insert({ name, venue, date, code, owner: user.id })
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

// ── Guests ───────────────────────────────────────────────────────────────────────
export async function joinAsGuest({ eventId, name, descriptor }) {
  const { data, error } = await supabase
    .from('guests')
    .insert({ event_id: eventId, name, descriptor })
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

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let c = ''
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)]
  return c
}
