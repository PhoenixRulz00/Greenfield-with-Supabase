import { supabase } from "../supabaseClient";

const mapRecord = (r) => ({
  id: r.id,
  date: r.date,
  status: r.status,
  studentId: r.student_id,
  sectionId: r.section_id,
  markedBy: r.marked_by,
  markedAt: r.marked_at,
});

export async function fetchAttendanceForRange(from, to) {
  // Pulls everything in range once; the app computes per-section/per-student
  // stats client-side. Fine for a single school's data volume.
  const { data, error } = await supabase.from("attendance_records").select("*").gte("date", from).lte("date", to);
  if (error) throw error;
  return data.map(mapRecord);
}

export async function fetchAllAttendance() {
  const { data, error } = await supabase.from("attendance_records").select("*");
  if (error) throw error;
  return data.map(mapRecord);
}

export async function fetchHistoryForRecord(recordId) {
  const { data, error } = await supabase
    .from("attendance_audit_log")
    .select("*")
    .eq("record_id", recordId)
    .order("changed_at", { ascending: true });
  if (error) throw error;
  return data.map((h) => ({ from: h.from_status, to: h.to_status, changedBy: h.changed_by, changedAt: h.changed_at }));
}

// Marks (or corrects) attendance for one student on one date. If a record
// already exists for that student+date with a different status, logs the
// change to attendance_audit_log for the audit trail.
export async function markAttendance({ studentId, sectionId, date, status, markedById }) {
  const { data: existing, error: findErr } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("student_id", studentId)
    .eq("date", date)
    .maybeSingle();
  if (findErr) throw findErr;

  if (!existing) {
    const { data, error } = await supabase
      .from("attendance_records")
      .insert({ student_id: studentId, section_id: sectionId, date, status, marked_by: markedById || null })
      .select()
      .single();
    if (error) throw error;
    return mapRecord(data);
  }

  if (existing.status === status) return mapRecord(existing); // no-op

  const { error: auditErr } = await supabase.from("attendance_audit_log").insert({
    record_id: existing.id,
    from_status: existing.status,
    to_status: status,
    changed_by: markedById || null,
  });
  if (auditErr) throw auditErr;

  const { data, error } = await supabase
    .from("attendance_records")
    .update({ status, marked_by: markedById || null, marked_at: new Date().toISOString() })
    .eq("id", existing.id)
    .select()
    .single();
  if (error) throw error;
  return mapRecord(data);
}

// Subscribes to live changes on attendance_records (insert/update/delete)
// so multiple admins/teachers see updates without refreshing. Call the
// returned unsubscribe function on cleanup (e.g. in a useEffect return).
export function subscribeToAttendance(onChange) {
  const channel = supabase
    .channel("attendance-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records" }, onChange)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
