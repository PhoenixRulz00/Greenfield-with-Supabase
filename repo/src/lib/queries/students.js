import { supabase } from "../supabaseClient";
import { createLogin } from "./auth";

const mapStudent = (s) => ({
  id: s.id,
  name: s.name,
  admissionNo: s.admission_no,
  dob: s.dob,
  age: s.age,
  gender: s.gender,
  guardianName: s.guardian_name,
  guardianPhone: s.guardian_phone,
  email: s.email,
  active: s.active,
  sectionId: s.section_id,
});

export async function fetchStudents() {
  const { data, error } = await supabase.from("students").select("*").order("name");
  if (error) throw error;
  return data.map(mapStudent);
}

export async function createStudent({ name, admissionNo, dob, age, gender, guardianName, guardianPhone, email, sectionId }) {
  const { data, error } = await supabase
    .from("students")
    .insert({
      name,
      admission_no: admissionNo,
      dob: dob || null,
      age: age ? parseInt(age) : null,
      gender,
      guardian_name: guardianName,
      guardian_phone: guardianPhone,
      email: email || null,
      section_id: sectionId,
    })
    .select()
    .single();
  if (error) throw error;
  return mapStudent(data);
}

export async function updateStudent(id, { name, admissionNo, dob, age, gender, guardianName, guardianPhone, email, sectionId }) {
  const { data, error } = await supabase
    .from("students")
    .update({
      name,
      admission_no: admissionNo,
      dob: dob || null,
      age: age ? parseInt(age) : null,
      gender,
      guardian_name: guardianName,
      guardian_phone: guardianPhone,
      email: email || null,
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

// rows: [{ name, admissionNo, section: "5-A", guardianName, guardianPhone, email?, password? }]
// sections: the app's already-loaded section list (with class name attached)
// Admin must provide password column in CSV for each student
// Also creates auth logins with the provided temporary passwords.
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
    if (!row.password) {
      skipped.push({ row, reason: "password required (provide in CSV)" });
      continue;
    }
    toInsert.push({
      name: row.name,
      admission_no: row.admissionNo,
      guardian_name: row.guardianName || null,
      guardian_phone: row.guardianPhone || null,
      section_id: section.id,
      email: row.email || null,
      password: row.password,
    });
  }

  if (toInsert.length === 0) return { created: [], logins: [], skipped };

  const { data, error } = await supabase.from("students").insert(toInsert.map(({ password, ...rest }) => rest)).select();
  if (error) throw error;

  const created = (data || []).map(mapStudent);
  const logins = [];
  const loginErrors = [];

  // Create auth logins with the provided temporary passwords
  for (let i = 0; i < created.length; i++) {
    const student = created[i];
    const csvRow = toInsert[i];

    try {
      const email = student.email || `student-${student.admissionNo}@school.local`;
      const password = csvRow.password;

      await createLogin({
        email,
        password,
        name: student.name,
        role: "student",
        studentId: student.id,
      });

      logins.push({
        name: student.name,
        email,
        tempPassword: password,
        admissionNo: student.admissionNo,
      });
    } catch (loginErr) {
      // If login creation fails, log it but don't fail the entire import
      loginErrors.push({
        name: student.name,
        admissionNo: student.admissionNo,
        error: loginErr.message || "Failed to create login",
      });
    }
  }

  return { created, logins, loginErrors, skipped };
}
