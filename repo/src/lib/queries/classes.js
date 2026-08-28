import { supabase } from "../supabaseClient";

export async function fetchClasses() {
  const { data, error } = await supabase.from("classes").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function fetchSections() {
  const { data, error } = await supabase
    .from("sections")
    .select("*, classes(name)")
    .order("name");
  if (error) throw error;
  return data.map((s) => ({
    id: s.id,
    name: s.name,
    classId: s.class_id,
    className: s.classes?.name || "",
    classTeacherId: s.class_teacher_id,
  }));
}

export async function fetchTeacherAssignments() {
  const { data, error } = await supabase.from("teacher_assignments").select("*");
  if (error) throw error;
  return data.map((a) => ({ id: a.id, teacherId: a.teacher_id, sectionId: a.section_id }));
}

export async function createClass(name) {
  const { data, error } = await supabase.from("classes").insert({ name }).select().single();
  if (error) throw error;
  return data;
}

export async function createSection(classId, { name, classTeacherId }) {
  const { data, error } = await supabase
    .from("sections")
    .insert({ name, class_id: classId, class_teacher_id: classTeacherId || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSectionTeacher(sectionId, classTeacherId) {
  const { data, error } = await supabase
    .from("sections")
    .update({ class_teacher_id: classTeacherId || null })
    .eq("id", sectionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Replaces the full set of subject-teacher assignments for a section.
export async function setSectionAssignments(sectionId, teacherIds) {
  const { error: delErr } = await supabase.from("teacher_assignments").delete().eq("section_id", sectionId);
  if (delErr) throw delErr;

  if (teacherIds.length > 0) {
    const { error: insErr } = await supabase
      .from("teacher_assignments")
      .insert(teacherIds.map((teacherId) => ({ teacher_id: teacherId, section_id: sectionId })));
    if (insErr) throw insErr;
  }
}
