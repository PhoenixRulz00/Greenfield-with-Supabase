import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Badge, Button, Field, Input } from "../../components/ui";
import { fetchAttendanceForRange } from "../../lib/queries/attendance";
import { sectionLabel, todayISO } from "../../utils/attendanceStats";

export default function ReportsPage({ data }) {
  const { sections } = data;
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(todayISO());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchAttendanceForRange(from, to)
      .then((r) => active && setRecords(r))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [from, to]);

  const rows = sections.map((sec) => {
    const secRecords = records.filter((r) => r.sectionId === sec.id);
    const present = secRecords.filter((r) => r.status === "present" || r.status === "late").length;
    const pct = secRecords.length ? Math.round((present / secRecords.length) * 100) : null;
    return { sec, total: secRecords.length, present, pct };
  });

  const exportCSV = () => {
    const header = "Section,Records,Present,Attendance %\n";
    const body = rows.map((r) => `${sectionLabel(sections, r.sec.id)},${r.total},${r.present},${r.pct ?? ""}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `attendance-report-${from}-to-${to}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="erp-serif text-2xl font-semibold">Reports</h2>
        <p className="text-sm text-[var(--ink-soft)]">Class-wise attendance over a date range, pulled live from Supabase.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-3">
        <Field label="From"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="To"><Input type="date" value={to} max={todayISO()} onChange={(e) => setTo(e.target.value)} /></Field>
        <Button variant="ghost" icon={Download} onClick={exportCSV}>Export CSV</Button>
      </div>
      {error && <p className="rounded-md bg-[var(--red-bg)] px-3 py-2 text-xs text-[var(--red)]">{error}</p>}
      <div className="erp-scroll overflow-x-auto rounded-lg border border-[var(--rule)]">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-[var(--slate-bg)] text-left text-xs uppercase tracking-wide text-[var(--ink-soft)]">
            <tr><th className="px-3 py-2">Section</th><th className="px-3 py-2">Records</th><th className="px-3 py-2">Present</th><th className="px-3 py-2">Attendance %</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-4 text-xs text-[var(--ink-soft)]" colSpan={4}>Loading…</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.sec.id} className="border-t border-[var(--rule-soft)]">
                  <td className="px-3 py-2 font-medium">{sectionLabel(sections, r.sec.id)}</td>
                  <td className="px-3 py-2">{r.total}</td>
                  <td className="px-3 py-2">{r.present}</td>
                  <td className="px-3 py-2">{r.pct === null ? "—" : <Badge tone={r.pct < 75 ? "red" : "green"}>{r.pct}%</Badge>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
