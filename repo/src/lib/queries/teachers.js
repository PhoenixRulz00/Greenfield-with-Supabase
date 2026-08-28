import { supabase } from "../supabaseClient";

const mapTeacher = (t) => ({
  id: t.id,
  name: t.name,
  email: t.email,
  phone: t.phone,
  subject: t.subject,
  active: t.active,
});

export async function fetchTeachers() {
  const { data, error } = await supabase.from("teachers").select("*").order("name");
  if (error) throw error;
  return data.map(mapTeacher);
}

export async function createTeacher({ name, email, phone, subject }) {
  const { data, error } = await supabase
    .from("teachers")
    .insert({ name, email: email.toLowerCase(), phone, subject })
    .select()
    .single();
  if (error) throw error;
  return mapTeacher(data);
}

export async function updateTeacher(id, { name, email, phone, subject }) {
  const { data, error } = await supabase
    .from("teachers")
    .update({ name, email: email?.toLowerCase(), phone, subject })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapTeacher(data);
}

export async function setTeacherActive(id, active) {
  const { data, error } = await supabase.from("teachers").update({ active }).eq("id", id).select().single();
  if (error) throw error;
  return mapTeacher(data);
}

// Sections a teacher can access (homeroom OR subject assignment).
export async function fetchTeacherSections(teacherId) {
  const [{ data: homeroom, error: e1 }, { data: assigned, error: e2 }] = await Promise.all([
    supabase.from("sections").select("id").eq("class_teacher_id", teacherId),
    supabase.from("teacher_assignments").select("section_id").eq("teacher_id", teacherId),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  const ids = new Set([...(homeroom || []).map((s) => s.id), ...(assigned || []).map((a) => a.section_id)]);
  return [...ids];
}
