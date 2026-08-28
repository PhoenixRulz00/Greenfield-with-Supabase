import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, History, BookOpen } from "lucide-react";
import { EmptyState, Input, Modal } from "../../components/ui";
import { markAttendance, fetchHistoryForRecord } from "../../lib/queries/attendance";
import { STATUS_META, sectionAttendanceForDate, sectionLabel, teacherSectionIds, todayISO } from "../../utils/attendanceStats";

export default function TeacherHomePage({ data, teacherId, refetch }) {
  const { sections, students, teacherAssignments, attendance } = data;
  const mySections = teacherSectionIds(sections, teacherAssignments, teacherId);
  const [activeSection, setActiveSection] = useState(mySections[0] || null);
  const [date, setDate] = useState(todayISO());
  const [historyFor, setHistoryFor] = useState(null); // { student, history }
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!activeSection && mySections.length) setActiveSection(mySections[0]); }, [mySections, activeSection]);

  if (mySections.length === 0) {
    return <EmptyState icon={BookOpen} title="No sections assigned yet" hint="Ask an admin to assign you to a class section." />;
  }

  const sectionStudents = students.filter((s) => s.sectionId === activeSection && s.active);
  const todaysMarks = sectionAttendanceForDate(attendance, activeSection, date);
  const markedCount = todaysMarks.length;

  const setStatus = async (studentId, status) => {
    setSaving(true);
    try {
      await markAttendance({ studentId, sectionId: activeSection, date, status, markedById: teacherId });
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const shiftDate = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  };

  const openHistory = async (student, record) => {
    const history = await fetchHistoryForRecord(record.id);
    setHistoryFor({ student, history });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="erp-serif text-2xl font-semibold">My Classes</h2>
        <p className="text-sm text-[var(--ink-soft)]">Mark or correct attendance for a section and date. Changes save to Supabase immediately.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {mySections.map((secId) => (
          <button
            key={secId}
            onClick={() => setActiveSection(secId)}
            className={`focus-ring rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              activeSection === secId ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]" : "border-[var(--rule)] hover:bg-[var(--slate-bg)]"
            }`}
          >
            {sectionLabel(sections, secId)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-3">
        <div className="flex items-center gap-2">
          <button onClick={() => shiftDate(-1)} className="focus-ring rounded p-1.5 hover:bg-[var(--slate-bg)]"><ChevronLeft size={16} /></button>
          <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          <button onClick={() => shiftDate(1)} disabled={date >= todayISO()} className="focus-ring rounded p-1.5 hover:bg-[var(--slate-bg)] disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
        <span className="text-xs text-[var(--ink-soft)]">{markedCount} of {sectionStudents.length} marked{saving ? " · saving…" : ""}</span>
      </div>

      <div className="erp-scroll overflow-x-auto rounded-lg border border-[var(--rule)]">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-[var(--slate-bg)] text-left text-xs uppercase tracking-wide text-[var(--ink-soft)]">
            <tr><th className="px-3 py-2">Student</th><th className="px-3 py-2">Admission No.</th><th className="px-3 py-2">Mark attendance</th><th className="px-3 py-2"></th></tr>
          </thead>
          <tbody>
            {sectionStudents.map((s) => {
              const rec = todaysMarks.find((a) => a.studentId === s.id);
              return (
                <tr key={s.id} className="border-t border-[var(--rule-soft)]">
                  <td className="px-3 py-2 font-medium">{s.name}</td>
                  <td className="erp-mono px-3 py-2 text-xs">{s.admissionNo}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      {Object.entries(STATUS_META).map(([key, meta]) => (
                        <button
                          key={key}
                          title={meta.name}
                          onClick={() => setStatus(s.id, key)}
                          className={`stamp ${rec?.status === key ? "active" : ""}`}
                          style={{ color: meta.color, background: rec?.status === key ? `color-mix(in srgb, ${meta.color} 14%, transparent)` : "transparent" }}
                        >
                          {meta.label}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {rec && (
                      <button onClick={() => openHistory(s, rec)} className="focus-ring inline-flex items-center gap-1 text-xs text-[var(--ink-soft)] hover:text-[var(--ink)]">
                        <History size={12} /> history
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {historyFor && (
        <Modal title={`Attendance history · ${historyFor.student.name}`} onClose={() => setHistoryFor(null)}>
          {historyFor.history.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">No corrections have been made to this record yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {historyFor.history.map((h, i) => (
                <li key={i} className="rounded-md border border-[var(--rule-soft)] p-2">
                  <span className="capitalize">{h.from}</span> → <span className="font-semibold capitalize">{h.to}</span>
                  <div className="text-xs text-[var(--ink-soft)]">{new Date(h.changedAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}
