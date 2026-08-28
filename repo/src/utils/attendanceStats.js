export const todayISO = () => new Date().toISOString().slice(0, 10);

export const STATUS_META = {
  present: { label: "P", name: "Present", color: "var(--green)", tone: "green" },
  absent: { label: "A", name: "Absent", color: "var(--red)", tone: "red" },
  late: { label: "L", name: "Late", color: "var(--amber)", tone: "amber" },
  excused: { label: "E", name: "Excused", color: "var(--ink-soft)", tone: "slate" },
};

export function sectionLabel(sections, sectionId) {
  const sec = sections.find((s) => s.id === sectionId);
  return sec ? `${sec.className} - ${sec.name}` : "—";
}

export function attendanceStats(attendance, studentId) {
  const records = attendance.filter((a) => a.studentId === studentId);
  const total = records.length;
  const present = records.filter((a) => a.status === "present" || a.status === "late").length;
  const pct = total ? Math.round((present / total) * 100) : null;
  return { total, present, pct, records: [...records].sort((a, b) => (a.date < b.date ? 1 : -1)) };
}

export function sectionAttendanceForDate(attendance, sectionId, date) {
  return attendance.filter((a) => a.sectionId === sectionId && a.date === date);
}

export function sectionOverallPct(attendance, students, sectionId) {
  const studentIds = students.filter((s) => s.sectionId === sectionId).map((s) => s.id);
  const records = attendance.filter((a) => studentIds.includes(a.studentId));
  if (!records.length) return null;
  const present = records.filter((a) => a.status === "present" || a.status === "late").length;
  return Math.round((present / records.length) * 100);
}

export function teacherSectionIds(sections, teacherAssignments, teacherId) {
  const assigned = teacherAssignments.filter((a) => a.teacherId === teacherId).map((a) => a.sectionId);
  const homeroom = sections.filter((s) => s.classTeacherId === teacherId).map((s) => s.id);
  return [...new Set([...assigned, ...homeroom])];
}
