// Anniversary memory emails — NOT deployed yet. See ./README.md for the remaining
// manual setup (Resend key, deploy, pg_cron schedule).
//
// Runs once a day (via pg_cron -> pg_net -> this function). For every event whose
// event_date lands on today's month/day in a past year, finds guests with an email
// on file who haven't already been sent this year's anniversary email, pulls their
// top 5 face-matched photos, and sends a "N years ago today" email via Resend.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()

  // Events whose event_date matches today's month/day, in a past year.
  const { data: events, error: evErr } = await supabase
    .from('events')
    .select('id, name, event_date')
    .not('event_date', 'is', null)
  if (evErr) return new Response(JSON.stringify({ error: evErr.message }), { status: 500 })

  const dueEvents = (events || []).filter(e => {
    const d = new Date(e.event_date)
    return d.getMonth() + 1 === month && d.getDate() === day && d.getFullYear() < today.getFullYear()
  })

  let sent = 0
  for (const event of dueEvents) {
    const years = today.getFullYear() - new Date(event.event_date).getFullYear()

    const { data: guests } = await supabase
      .from('guests')
      .select('id, name, email')
      .eq('event_id', event.id)
      .not('email', 'is', null)

    for (const guest of guests || []) {
      const { data: already } = await supabase
        .from('anniversary_emails_log')
        .select('id')
        .eq('event_id', event.id)
        .eq('guest_id', guest.id)
        .eq('years', years)
        .maybeSingle()
      if (already) continue

      const { data: matches } = await supabase
        .from('guest_photo_matches')
        .select('photo_id, distance, photos(src)')
        .eq('guest_id', guest.id)
        .order('distance', { ascending: true })
        .limit(5)

      const photoUrls = (matches || []).map(m => m.photos?.src).filter(Boolean)

      const html = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2>${years} year${years === 1 ? '' : 's'} ago today — ${event.name}</h2>
          <p>Here's a look back at some of your favorite moments.</p>
          ${photoUrls.map(u => `<img src="${u}" style="width:100%;border-radius:12px;margin-bottom:10px" />`).join('')}
          <p style="color:#888;font-size:12px">Sent by momentó</p>
        </div>
      `

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'momentó <memories@yourdomain.com>',
          to: guest.email,
          subject: `${years} year${years === 1 ? '' : 's'} ago today — ${event.name}`,
          html,
        }),
      })

      await supabase.from('anniversary_emails_log').insert({
        event_id: event.id, guest_id: guest.id, years,
        status: res.ok ? 'sent' : 'failed',
      })
      if (res.ok) sent++
    }
  }

  return new Response(JSON.stringify({ dueEvents: dueEvents.length, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
