import React from "react";
import { Users } from "lucide-react";
import { Badge, EmptyState } from "../../components/ui";
import { attendanceStats, sectionLabel, STATUS_META } from "../../utils/attendanceStats";

export default function StudentHomePage({ data, studentId }) {
  const { students, sections, attendance } = data;
  const student = students.find((s) => s.id === studentId);
  if (!student) return <EmptyState icon={Users} title="Profile not linked" hint="This student login isn't linked to a student record yet. Ask your admin to check the account setup." />;
  const stats = attendanceStats(attendance, student.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="erp-serif text-2xl font-semibold">My Profile</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-4 lg:col-span-1">
          <p className="erp-serif text-lg font-semibold">{student.name}</p>
          <dl className="mt-3 flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--ink-soft)]">Admission No.</dt><dd className="erp-mono">{student.admissionNo}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--ink-soft)]">Section</dt><dd>{sectionLabel(sections, student.sectionId)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--ink-soft)]">Date of birth</dt><dd>{student.dob || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--ink-soft)]">Guardian</dt><dd>{student.guardianName || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--ink-soft)]">Guardian phone</dt><dd>{student.guardianPhone || "—"}</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-4 lg:col-span-2">
          <h3 className="erp-serif mb-3 text-base font-semibold">Attendance summary</h3>
          <div className="mb-4 flex items-center gap-4">
            <div className="erp-serif text-3xl font-semibold" style={{ color: stats.pct === null ? "var(--ink-soft)" : stats.pct < 75 ? "var(--red)" : "var(--green)" }}>
              {stats.pct === null ? "—" : `${stats.pct}%`}
            </div>
            <p className="text-xs text-[var(--ink-soft)]">{stats.present} present / {stats.total} recorded days</p>
          </div>
          {stats.records.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">No attendance has been recorded yet.</p>
          ) : (
            <div className="erp-scroll max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-[var(--ink-soft)]"><tr><th className="py-1">Date</th><th className="py-1">Status</th></tr></thead>
                <tbody>
                  {stats.records.map((r) => (
                    <tr key={r.id} className="border-t border-[var(--rule-soft)]">
                      <td className="erp-mono py-1.5 text-xs">{r.date}</td>
                      <td className="py-1.5"><Badge tone={STATUS_META[r.status].tone}>{STATUS_META[r.status].name}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
