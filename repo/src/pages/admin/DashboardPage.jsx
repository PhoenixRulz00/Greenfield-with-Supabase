import React from "react";
import { Users, GraduationCap, BookOpen, ClipboardCheck, AlertTriangle } from "lucide-react";
import { Badge } from "../../components/ui";
import { attendanceStats, sectionLabel, sectionOverallPct, todayISO } from "../../utils/attendanceStats";

export default function DashboardPage({ data }) {
  const { students, teachers, sections, attendance } = data;
  const activeStudents = students.filter((s) => s.active);
  const activeTeachers = teachers.filter((t) => t.active);
  const today = todayISO();
  const todaysRecords = attendance.filter((a) => a.date === today);
  const todaysPresent = todaysRecords.filter((a) => a.status === "present" || a.status === "late").length;
  const todaysPct = todaysRecords.length ? Math.round((todaysPresent / todaysRecords.length) * 100) : null;

  const lowAttendance = activeStudents
    .map((s) => ({ s, stats: attendanceStats(attendance, s.id) }))
    .filter((x) => x.stats.total >= 3 && x.stats.pct < 75)
    .sort((a, b) => a.stats.pct - b.stats.pct);

  const stats = [
    { label: "Active Students", value: activeStudents.length, icon: Users },
    { label: "Active Teachers", value: activeTeachers.length, icon: GraduationCap },
    { label: "Sections", value: sections.length, icon: BookOpen },
    { label: "Today's Attendance", value: todaysPct === null ? "—" : `${todaysPct}%`, icon: ClipboardCheck },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="erp-serif text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-[var(--ink-soft)]">
          Live from Supabase, as of {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-4">
            <s.icon size={16} className="mb-3 text-[var(--ink-soft)]" />
            <div className="erp-serif text-2xl font-semibold">{s.value}</div>
            <div className="text-xs text-[var(--ink-soft)]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-4">
          <h3 className="erp-serif mb-3 text-base font-semibold">Class-wise attendance (overall)</h3>
          {sections.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">No sections yet — create one under Classes.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {sections.map((sec) => {
                const pct = sectionOverallPct(attendance, students, sec.id);
                return (
                  <div key={sec.id} className="flex items-center gap-3 text-sm">
                    <span className="w-20 shrink-0 erp-mono text-xs">{sectionLabel(sections, sec.id)}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--slate-bg)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct ?? 0}%`, background: pct === null ? "transparent" : pct < 75 ? "var(--red)" : "var(--green)" }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs text-[var(--ink-soft)]">{pct === null ? "—" : `${pct}%`}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-4">
          <h3 className="erp-serif mb-3 flex items-center gap-2 text-base font-semibold">
            <AlertTriangle size={15} className="text-[var(--amber)]" /> Low attendance (&lt;75%)
          </h3>
          {lowAttendance.length === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">No students currently below 75% with sufficient records.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {lowAttendance.slice(0, 6).map(({ s, stats }) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <span>{s.name} <span className="erp-mono text-xs text-[var(--ink-soft)]">· {sectionLabel(sections, s.sectionId)}</span></span>
                  <Badge tone="red">{stats.pct}%</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
