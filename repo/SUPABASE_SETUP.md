# Greenfield School ERP — Supabase edition

This app now stores everything in your Supabase project (`nejpubzkusxpmxpntpnq`)
instead of browser storage. There is **no seeded/dummy data** — every
teacher, student, class and attendance record comes from real database rows
that the admin panel creates.

## What changed from the old version

- The old app kept a single fake "database" object in `window.storage` /
  `localStorage`, pre-filled with sample teachers and students, and "login"
  was just picking a name from a dropdown — no real authentication.
- This version uses **Supabase Postgres** for all data, **Supabase Auth**
  (real email + password accounts) for login, and **Row Level Security**
  policies so teachers/students can only see what they're supposed to.
- The single 1,300-line `App.jsx` has been split into `lib/` (Supabase
  queries), `hooks/` (auth + data loading), `components/` (shared UI +
  layout) and `pages/` (one file per screen, grouped by role).

## 1. Set up the database (one-time)

1. Open the SQL editor for your project:
   `https://supabase.com/dashboard/project/nejpubzkusxpmxpntpnq/sql/new`
2. Paste in the entire contents of `supabase/schema.sql` and run it.
   This creates every table, the auto-profile trigger, and all RLS
   policies. It does **not** insert any sample data.
3. Create your first admin login:
   - Go to **Authentication → Users → Add user**, enter your email and a
     password.
   - Copy that user's UUID from the Users table.
   - Back in the SQL editor, run:
     ```sql
     insert into public.profiles (id, name, role)
     values ('paste-the-uuid-here', 'Your Name', 'admin');
     ```
4. That's it — sign in with that email/password and you're the admin.
   Every teacher/student login after this is created from inside the app
   (Students/Teachers pages → "Add student/teacher" → check "Also create a
   login").

## 2. Get your API keys

Go to **Project Settings → API**:
`https://supabase.com/dashboard/project/nejpubzkusxpmxpntpnq/settings/api`

You need two values:
- **Project URL** — `https://nejpubzkusxpmxpntpnq.supabase.co`
- **anon / public key** — safe to put in frontend code; RLS policies do the
  actual access control.

Copy `.env.example` to `.env.local` and fill both in:

```bash
cp .env.example .env.local
```

Never put the **service_role** key in `.env.local` or anywhere in `src/` —
it bypasses every RLS policy. It only belongs in the Edge Function's own
secrets (step 3).

## 3. Deploy the Edge Function (lets admins create logins)

The "Also create a login" checkbox on the Students/Teachers forms calls a
small server-side function, because creating a Supabase Auth user requires
the service_role key, which must never reach the browser.

```bash
npm install -g supabase
supabase login
supabase link --project-ref nejpubzkusxpmxpntpnq
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-api-settings
supabase secrets set SUPABASE_ANON_KEY=your-anon-key-from-api-settings
supabase functions deploy admin-create-user
```

(If you'd rather skip this for now, everything else works fine — you just
create teacher/student *records* from the admin panel, and create their
*logins* manually via Authentication → Users in the dashboard instead.)

## 4. Run it locally

```bash
npm install
npm run dev
```

Visit the local URL, sign in with the admin account you created in step 1.

## 5. Deploy the frontend

This is a static Vite build — it deploys to any static host. Two easy options:

### Vercel
```bash
npm install -g vercel
vercel
```
In the Vercel project settings, add environment variables
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (same values as your
`.env.local`), then redeploy.

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --build
```
Same idea: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under
**Site settings → Environment variables**.

Either way, build command is `npm run build`, output directory is `dist`.

## 6. Add teachers and students for real

Once deployed and signed in as admin:
1. **Classes** tab → create a class (e.g. "Grade 5") → create a section
   (e.g. "A") inside it.
2. **Teachers** tab → "Add teacher" → optionally check "create a login" to
   give them access immediately.
3. **Classes** tab → "Manage teacher assignments" on a section → set the
   homeroom teacher and any subject teachers.
4. **Students** tab → "Add student" (or "Import CSV" for a whole roster at
   once) → optionally create a student login too.

From here, everything — attendance marking, corrections, the dashboard,
reports — reads and writes straight to your Supabase project in real time
(attendance updates live-refresh via a Supabase Realtime subscription, so
two admins/teachers looking at the same section see each other's marks
without reloading).

## Notes on security

- RLS policies are the real access control, not the frontend code — even if
  someone bypassed the UI, Postgres itself enforces who can read/write what.
- Review `supabase/schema.sql`'s policies before putting real student data
  in production; the ones here are a reasonable default (admin: everything,
  teacher: their own sections, student: their own record) but you may want
  to tighten them further depending on your school's requirements.
- Consider Supabase's built-in password-reset flow for teacher/student
  accounts rather than admins choosing temporary passwords by hand long-term.
