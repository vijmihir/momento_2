-- momentó v2 schema — run this in the Supabase SQL editor AFTER the base schema
-- from README.md. Adds: live wall realtime, delivery workflow, highlight reels,
-- anniversary email scaffolding.

-- ── 1. Live photo wall — enable Realtime on photos ────────────────────────────
alter publication supabase_realtime add table photos;

-- ── 2. Photographer delivery workflow ─────────────────────────────────────────
alter table events add column if not exists status text default 'shooting';
alter table events add column if not exists couple_code text unique;

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos on delete cascade,
  event_id uuid references events on delete cascade,
  guest_name text,
  created_at timestamptz default now(),
  unique(photo_id, guest_name)
);

create table if not exists revision_notes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade,
  photo_id uuid references photos on delete cascade,
  author_name text,
  note text not null,
  resolved boolean default false,
  created_at timestamptz default now()
);

alter table favorites enable row level security;
alter table revision_notes enable row level security;

create policy "public read favorites" on favorites for select using (true);
create policy "insert favorites" on favorites for insert with check (true);
create policy "delete own favorites" on favorites for delete using (true);
create policy "public read notes" on revision_notes for select using (true);
create policy "insert notes" on revision_notes for insert with check (true);
create policy "owner resolves notes" on revision_notes for update using (
  exists (select 1 from events e where e.id = event_id and e.owner = auth.uid())
);

-- Backfill couple_code for any events created before this migration
update events set couple_code = upper(substr(md5(random()::text), 1, 6)) where couple_code is null;

-- ── 3. AI highlight reels ──────────────────────────────────────────────────────
create table if not exists guest_photo_matches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade,
  guest_id uuid references guests on delete cascade,
  photo_id uuid references photos on delete cascade,
  distance numeric,
  created_at timestamptz default now(),
  unique(guest_id, photo_id)
);

create table if not exists highlight_reels (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade,
  scope text default 'guest',
  guest_name text,
  video_url text not null,
  photo_ids jsonb default '[]',
  duration_seconds numeric,
  created_at timestamptz default now()
);

alter table guest_photo_matches enable row level security;
alter table highlight_reels enable row level security;

create policy "public read matches" on guest_photo_matches for select using (true);
create policy "insert matches" on guest_photo_matches for insert with check (true);
create policy "upsert matches" on guest_photo_matches for update using (true);
create policy "public read reels" on highlight_reels for select using (true);
create policy "insert reels" on highlight_reels for insert with check (true);

-- Manual step: Storage → New bucket → name it "reels" → make it Public
-- (same as the existing "photos" bucket)

-- ── 4. Anniversary memory emails (scaffolding) ─────────────────────────────────
alter table guests add column if not exists email text;
alter table events add column if not exists event_date date;

create table if not exists anniversary_emails_log (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade,
  guest_id uuid references guests on delete cascade,
  years integer not null,
  sent_at timestamptz default now(),
  status text default 'sent',
  unique(event_id, guest_id, years)
);

alter table anniversary_emails_log enable row level security;
create policy "owner reads email log" on anniversary_emails_log for select using (
  exists (select 1 from events e where e.id = event_id and e.owner = auth.uid())
);
-- No insert/update policy: the Edge Function uses the service_role key, bypasses RLS.

-- See supabase/functions/anniversary-emails/README.md for the remaining manual
-- steps (Resend key, function deploy, pg_cron schedule) to actually send emails.
