# Greenfield School Register

A React + Vite school ERP for managing students, teachers, classes, sections
and attendance — backed by a real **Supabase** project (Postgres database +
Auth + Row Level Security + Realtime). There is no seeded or dummy data;
every record comes from what an admin enters.

## Full setup

See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for the complete walkthrough:
running the database schema, creating your first admin login, deploying the
Edge Function that lets admins create teacher/student logins, and deploying
the frontend itself. That file is the source of truth — the quick version
below assumes you've already done the one-time Supabase setup.

## Role access

Login is real Supabase Auth (email + password) — no PINs, no name pickers.

- **Admin** — full dashboard, manages teachers/students/classes/sections,
  assigns teachers to sections, imports students by CSV, views class-wise
  reports and exports CSV.
- **Teacher** — sees only the sections they're assigned to (homeroom or
  subject), marks/corrects attendance by date, views correction history.
- **Student** — sees only their own profile and attendance record.

Access is enforced by Postgres Row Level Security policies
(`supabase/schema.sql`), not just the frontend — so it holds even if someone
bypasses the UI.

## Project structure

```
src/
  lib/
    supabaseClient.js     Supabase client (reads VITE_SUPABASE_* env vars)
    queries/               One file per entity: auth, students, teachers,
                            classes, attendance — all real Supabase calls
  hooks/
    useAuth.jsx             Session + profile state, backed by Supabase Auth
    useSchoolData.js         Loads everything, live-refreshes attendance
  components/
    ui/                     Button, Field, Input, Select, Modal, Badge, etc.
    layout/                 ThemeStyles, AppShell (sidebar/nav)
  pages/
    LoginPage.jsx
    admin/                  Dashboard, Students, Teachers, Classes, Reports
    teacher/                TeacherHomePage (assigned sections + attendance)
    student/                StudentHomePage (own profile + attendance)
  App.jsx                   Wires auth + data + role-based routing
supabase/
  schema.sql                Tables + RLS policies (run once in SQL editor)
  functions/admin-create-user/   Edge Function for admin-created logins
```

## Run locally

Requires Node.js 18+, and a Supabase project set up per
[SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

```bash
cp .env.example .env.local   # fill in your Supabase URL + anon key
npm install
npm run dev
```

## Deploy

Static build — deploys to any static host (Vercel, Netlify, Cloudflare
Pages, etc). Build command `npm run build`, output directory `dist`. Set
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables on
the host. Full details in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).
