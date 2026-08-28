-- ============================================================================
-- Greenfield School ERP — Supabase schema
-- ============================================================================
-- Run this once in your Supabase project's SQL Editor:
--   https://supabase.com/dashboard/project/nejpubzkusxpmxpntpnq/sql/new
--
-- This creates every table the app needs, with NO seed/dummy data, plus
-- Row Level Security (RLS) policies so that:
--   - Admins (role = 'admin') can manage everything.
--   - Teachers can only see/mark attendance for sections they are assigned to
--     (as homeroom/class teacher OR as a subject-teacher assignment).
--   - Students can only see their own profile and their own attendance.
--
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / OR REPLACE.
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- 1. CORE TABLES
-- ----------------------------------------------------------------------------

create table if not exists public.teachers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  phone       text,
  subject     text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.classes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,           -- e.g. "Grade 5"
  created_at  timestamptz not null default now()
);

create table if not exists public.sections (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,           -- e.g. "A"
  class_id           uuid not null references public.classes(id) on delete cascade,
  class_teacher_id   uuid references public.teachers(id) on delete set null,
  created_at         timestamptz not null default now(),
  unique (class_id, name)
);

create table if not exists public.teacher_assignments (
  id           uuid primary key default gen_random_uuid(),
  teacher_id   uuid not null references public.teachers(id) on delete cascade,
  section_id   uuid not null references public.sections(id) on delete cascade,
  subject      text,
  created_at   timestamptz not null default now(),
  unique (teacher_id, section_id)
);

create table if not exists public.students (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  admission_no    text not null unique,
  dob             date,
  gender          text,
  guardian_name   text,
  guardian_phone  text,
  active          boolean not null default true,
  section_id      uuid not null references public.sections(id) on delete restrict,
  created_at      timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id            uuid primary key default gen_random_uuid(),
  date          date not null,
  status        text not null check (status in ('present','absent','late','excused')),
  marked_at     timestamptz not null default now(),
  student_id    uuid not null references public.students(id) on delete cascade,
  section_id    uuid not null references public.sections(id) on delete cascade,
  marked_by     uuid references public.teachers(id) on delete set null,
  unique (student_id, date)
);

create table if not exists public.attendance_audit_log (
  id             uuid primary key default gen_random_uuid(),
  record_id      uuid not null references public.attendance_records(id) on delete cascade,
  from_status    text not null,
  to_status      text not null,
  changed_by     uuid references public.teachers(id) on delete set null,
  changed_at     timestamptz not null default now()
);

create table if not exists public.academic_years (
  id          uuid primary key default gen_random_uuid(),
  label       text not null unique,           -- e.g. "2026-2027"
  start_date  date not null,
  end_date    date not null,
  is_active   boolean not null default false
);

-- Links a Supabase Auth user (auth.users) to a role + optional teacher/student record.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  role         text not null check (role in ('admin','teacher','student')),
  teacher_id   uuid references public.teachers(id) on delete set null,
  student_id   uuid references public.students(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_sections_class_id on public.sections(class_id);
create index if not exists idx_students_section_id on public.students(section_id);
create index if not exists idx_attendance_section_date on public.attendance_records(section_id, date);
create index if not exists idx_attendance_student on public.attendance_records(student_id);
create index if not exists idx_teacher_assignments_teacher on public.teacher_assignments(teacher_id);

-- ----------------------------------------------------------------------------
-- 2. AUTO-CREATE A PROFILE WHEN AN ADMIN CREATES A NEW AUTH USER
-- ----------------------------------------------------------------------------
-- The admin panel creates login accounts via the "admin-create-user" Edge
-- Function, which sets user_metadata { name, role, teacher_id, student_id }.
-- This trigger turns that metadata into a row in public.profiles automatically.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role, teacher_id, student_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    nullif(new.raw_user_meta_data->>'teacher_id', '')::uuid,
    nullif(new.raw_user_meta_data->>'student_id', '')::uuid
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. HELPER FUNCTIONS FOR RLS POLICIES
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER so they can read public.profiles regardless of the
-- calling user's own RLS visibility (avoids recursive-policy issues).

create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_teacher_id()
returns uuid language sql stable security definer set search_path = public as $$
  select teacher_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_student_id()
returns uuid language sql stable security definer set search_path = public as $$
  select student_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_role() = 'admin';
$$;

create or replace function public.teacher_can_access_section(sec_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.sections s
    where s.id = sec_id
      and (
        s.class_teacher_id = public.current_teacher_id()
        or exists (
          select 1 from public.teacher_assignments ta
          where ta.section_id = sec_id and ta.teacher_id = public.current_teacher_id()
        )
      )
  );
$$;

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.sections enable row level security;
alter table public.teacher_assignments enable row level security;
alter table public.students enable row level security;
alter table public.attendance_records enable row level security;
alter table public.attendance_audit_log enable row level security;
alter table public.academic_years enable row level security;
alter table public.profiles enable row level security;

-- profiles: everyone can read their own profile; admins can read all.
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- teachers: admins manage; any signed-in user can read (needed for section
-- labels, "class teacher" display, roster screens, etc).
drop policy if exists "teachers_select_authenticated" on public.teachers;
create policy "teachers_select_authenticated" on public.teachers
  for select using (auth.role() = 'authenticated');
drop policy if exists "teachers_write_admin" on public.teachers;
create policy "teachers_write_admin" on public.teachers
  for all using (public.is_admin()) with check (public.is_admin());

-- classes / sections / teacher_assignments: same pattern.
drop policy if exists "classes_select_authenticated" on public.classes;
create policy "classes_select_authenticated" on public.classes
  for select using (auth.role() = 'authenticated');
drop policy if exists "classes_write_admin" on public.classes;
create policy "classes_write_admin" on public.classes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "sections_select_authenticated" on public.sections;
create policy "sections_select_authenticated" on public.sections
  for select using (auth.role() = 'authenticated');
drop policy if exists "sections_write_admin" on public.sections;
create policy "sections_write_admin" on public.sections
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "assignments_select_authenticated" on public.teacher_assignments;
create policy "assignments_select_authenticated" on public.teacher_assignments
  for select using (auth.role() = 'authenticated');
drop policy if exists "assignments_write_admin" on public.teacher_assignments;
create policy "assignments_write_admin" on public.teacher_assignments
  for all using (public.is_admin()) with check (public.is_admin());

-- students: admin full access. Teachers can read students in sections they
-- can access. Students can read only their own record.
drop policy if exists "students_select_admin" on public.students;
create policy "students_select_admin" on public.students
  for select using (public.is_admin());
drop policy if exists "students_select_teacher" on public.students;
create policy "students_select_teacher" on public.students
  for select using (
    public.current_role() = 'teacher' and public.teacher_can_access_section(section_id)
  );
drop policy if exists "students_select_self" on public.students;
create policy "students_select_self" on public.students
  for select using (id = public.current_student_id());
drop policy if exists "students_write_admin" on public.students;
create policy "students_write_admin" on public.students
  for insert with check (public.is_admin());
drop policy if exists "students_update_admin" on public.students;
create policy "students_update_admin" on public.students
  for update using (public.is_admin()) with check (public.is_admin());

-- attendance_records: admin full access. Teachers can read/write for
-- sections they're assigned to. Students can read only their own rows.
drop policy if exists "attendance_select_admin" on public.attendance_records;
create policy "attendance_select_admin" on public.attendance_records
  for select using (public.is_admin());
drop policy if exists "attendance_select_teacher" on public.attendance_records;
create policy "attendance_select_teacher" on public.attendance_records
  for select using (
    public.current_role() = 'teacher' and public.teacher_can_access_section(section_id)
  );
drop policy if exists "attendance_select_self" on public.attendance_records;
create policy "attendance_select_self" on public.attendance_records
  for select using (student_id = public.current_student_id());
drop policy if exists "attendance_write_admin" on public.attendance_records;
create policy "attendance_write_admin" on public.attendance_records
  for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "attendance_insert_teacher" on public.attendance_records;
create policy "attendance_insert_teacher" on public.attendance_records
  for insert with check (
    public.current_role() = 'teacher' and public.teacher_can_access_section(section_id)
  );
drop policy if exists "attendance_update_teacher" on public.attendance_records;
create policy "attendance_update_teacher" on public.attendance_records
  for update using (
    public.current_role() = 'teacher' and public.teacher_can_access_section(section_id)
  ) with check (
    public.current_role() = 'teacher' and public.teacher_can_access_section(section_id)
  );

-- attendance_audit_log: readable by admin, or by a teacher who can access
-- the underlying record's section. Inserted by the same teacher/admin who
-- updates the record (handled in application code, not a trigger, so the
-- "changed_by" value is explicit).
drop policy if exists "audit_select_admin" on public.attendance_audit_log;
create policy "audit_select_admin" on public.attendance_audit_log
  for select using (public.is_admin());
drop policy if exists "audit_select_teacher" on public.attendance_audit_log;
create policy "audit_select_teacher" on public.attendance_audit_log
  for select using (
    exists (
      select 1 from public.attendance_records r
      where r.id = record_id and public.teacher_can_access_section(r.section_id)
    )
  );
drop policy if exists "audit_insert_admin_or_teacher" on public.attendance_audit_log;
create policy "audit_insert_admin_or_teacher" on public.attendance_audit_log
  for insert with check (
    public.is_admin()
    or exists (
      select 1 from public.attendance_records r
      where r.id = record_id and public.teacher_can_access_section(r.section_id)
    )
  );

-- academic_years: admin manages, everyone signed in can read.
drop policy if exists "years_select_authenticated" on public.academic_years;
create policy "years_select_authenticated" on public.academic_years
  for select using (auth.role() = 'authenticated');
drop policy if exists "years_write_admin" on public.academic_years;
create policy "years_write_admin" on public.academic_years
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 5. FIRST ADMIN ACCOUNT
-- ============================================================================
-- This schema intentionally seeds NO data. After running this script:
--   1. Go to Authentication > Users in the Supabase dashboard and click
--      "Add user" to create your first login (email + password).
--   2. Then run the snippet below (with that user's UUID from the Users
--      table) to make them an admin:
--
--   insert into public.profiles (id, name, role)
--   values ('paste-the-user-uuid-here', 'Your Name', 'admin');
--
-- Every admin created after that can use the in-app "Add teacher/student"
-- flows, which call the admin-create-user Edge Function to create further
-- logins — no more manual SQL needed after this first bootstrap step.
