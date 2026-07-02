# Anniversary memory emails — deployment steps

This function is written but **not deployed**. It won't send anything until you do the following:

## 1. Get a Resend API key
Sign up at [resend.com](https://resend.com) (free tier works), verify a sending domain,
grab an API key. Update `from: 'momentó <memories@yourdomain.com>'` in `index.ts` to use
your verified domain.

## 2. Install the Supabase CLI (if you haven't)
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF
```

## 3. Deploy the function
```bash
supabase functions deploy anniversary-emails
supabase secrets set RESEND_API_KEY=your-resend-key
```
(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by Supabase.)

## 4. Schedule it daily
In the Supabase SQL editor, enable the extensions and schedule a daily cron hit:
```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'anniversary-emails-daily',
  '0 9 * * *',  -- 9am UTC daily
  $$
  select net.http_post(
    url := 'https://YOUR-PROJECT-REF.functions.supabase.co/anniversary-emails',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR-SERVICE-ROLE-KEY')
  )
  $$
);
```

## Notes
- Only guests who left an email at Face ID registration are emailed (`guests.email`).
- Only events with a structured `event_date` (set on the "Anniversary date" field when
  creating the event) are considered — events created before this feature shipped will
  have `event_date = null` until you edit them.
- `anniversary_emails_log` prevents duplicate sends per (event, guest, years).
