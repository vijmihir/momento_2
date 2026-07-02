# momentó

Event photo platform — face-matched galleries (like Samaro) + a guest disposable camera.
Photographers create events and upload photos; guests join with a code, register their
face, and instantly get every photo they appear in — plus shoot their own film-look candids.

---

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
```

It works **immediately in DEMO MODE** (sample events, nothing saved) so you can click through.
Demo guest codes: **SHARMA**, **KUMAR**, **PRIYA**. Photographer login is one tap.

Use a phone or a laptop with a webcam to test the selfie + disposable camera.

---

## Make it real (Supabase — ~15 min)

DEMO MODE turns off automatically once you add Supabase keys.

### 1. Create a project at [supabase.com](https://supabase.com) (free)

### 2. SQL editor → run this:

```sql
create table events (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users,
  name text not null,
  venue text,
  date text,
  code text unique not null,
  created_at timestamptz default now()
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade,
  src text not null,
  type text default 'pro',          -- 'pro' or 'guest'
  uploader_name text,
  descriptors jsonb default '[]',    -- array of 128-float face vectors
  created_at timestamptz default now()
);

create table guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events on delete cascade,
  name text,
  descriptor jsonb,                  -- this guest's face vector
  created_at timestamptz default now()
);

-- Row Level Security
alter table events enable row level security;
alter table photos enable row level security;
alter table guests enable row level security;

-- Photographers manage their own events
create policy "owner manages events" on events
  for all using (auth.uid() = owner) with check (auth.uid() = owner);

-- Anyone can read events (guests need to look up by code), photos, guests
create policy "public read events" on events for select using (true);
create policy "public read photos" on photos for select using (true);
create policy "public read guests" on guests for select using (true);

-- Event owners insert photos; guests insert their own shots + register
create policy "insert photos" on photos for insert with check (true);
create policy "insert guests" on guests for insert with check (true);
```

### 3. Create a storage bucket
Storage → New bucket → name it **`photos`** → make it **Public**.

### 4. Add your keys
Create a file named `.env` in the project root:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON=your-anon-public-key
```

(Both are in Supabase → Project Settings → API.)

Restart `npm run dev`. DEMO MODE is now off — real accounts, real uploads, real persistence.

---

## Deploy to Vercel

Push to GitHub, then on vercel.com → Import → add the two env vars
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON`) under Project Settings → Environment Variables → Deploy.

You need HTTPS for the camera — Vercel gives you that automatically.

---

## How it works

- **Face matching is real**, on-device, via `face-api.js` (`src/faceEngine.js`). A selfie becomes a
  128-number vector; photos store the vectors of every face in them; a guest matches a photo when
  the distance is < 0.55. Photos are indexed once at upload, so guest matching is instant.
- **Camera is real** — `getUserMedia` live video for both selfie and disposable, with a warm film
  grade applied on capture. Falls back to file upload if the camera is blocked.
- **Auth, events, photos, guests** are real Supabase rows once keys are added.

### Tuning
- Match strictness: `threshold` in `src/faceEngine.js` (0.5 strict … 0.6 loose).
- For thousands of photos, swap face-api.js for AWS Rekognition (same flow, faster/more accurate).

## Files
- `src/App.jsx` — all screens and flows
- `src/db.js` — Supabase client + all data functions (swap point for any backend)
- `src/faceEngine.js` — face detection + matching
- `src/camera.js` — live camera hook + film filter
