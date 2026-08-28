import { supabase } from "../supabaseClient";

const mapStudent = (s) => ({
  id: s.id,
  name: s.name,
  admissionNo: s.admission_no,
  dob: s.dob,
  gender: s.gender,
  guardianName: s.guardian_name,
  guardianPhone: s.guardian_phone,
  active: s.active,
  sectionId: s.section_id,
});

export async function fetchStudents() {
  const { data, error } = await supabase.from("students").select("*").order("name");
  if (error) throw error;
  return data.map(mapStudent);
}

export async function createStudent({ name, admissionNo, dob, gender, guardianName, guardianPhone, sectionId }) {
  const { data, error } = await supabase
    .from("students")
    .insert({
      name,
      admission_no: admissionNo,
      dob: dob || null,
      gender,
      guardian_name: guardianName,
      guardian_phone: guardianPhone,
      section_id: sectionId,
    })
    .select()
    .single();
  if (error) throw error;
  return mapStudent(data);
}

export async function updateStudent(id, { name, admissionNo, dob, gender, guardianName, guardianPhone, sectionId }) {
  const { data, error } = await supabase
    .from("students")
    .update({
      name,
      admission_no: admissionNo,
      dob: dob || null,
      gender,
      guardian_name: guardianName,
      guardian_phone: guardianPhone,
      section_id: sectionId,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapStudent(data);
}

export async function setStudentActive(id, active) {
  const { data, error } = await supabase.from("students").update({ active }).eq("id", id).select().single();
  if (error) throw error;
  return mapStudent(data);
}

// rows: [{ name, admissionNo, section: "5-A", guardianName, guardianPhone }]
// sections: the app's already-loaded section list (with class name attached)
// so we can resolve "5-A" -> section_id without extra round-trips.
export async function importStudents(rows, sectionsWithClassName) {
  const findSection = (label) => {
    if (!label) return null;
    const [clsPart, secPart] = label.split("-").map((s) => (s || "").trim().toLowerCase());
    return sectionsWithClassName.find(
      (s) => s.className.toLowerCase().includes(clsPart || "") && s.name.toLowerCase() === (secPart || "")
    );
  };

  const toInsert = [];
  const skipped = [];
  for (const row of rows) {
    const section = findSection(row.section);
    if (!row.name || !row.admissionNo || !section) {
      skipped.push({ row, reason: !section ? "section not found" : "missing name/admissionNo" });
      continue;
    }
    toInsert.push({
      name: row.name,
      admission_no: row.admissionNo,
      guardian_name: row.guardianName || null,
      guardian_phone: row.guardianPhone || null,
      section_id: section.id,
    });
  }

  if (toInsert.length === 0) return { created: [], skipped };

  const { data, error } = await supabase.from("students").insert(toInsert).select();
  if (error) throw error;
  return { created: (data || []).map(mapStudent), skipped };
}
