import React, { useState } from "react";
import { Users, Search, Plus, Pencil, UserX, UserCheck, Upload } from "lucide-react";
import { Button, Badge, EmptyState, Modal, Select } from "../../components/ui";
import { attendanceStats, sectionLabel } from "../../utils/attendanceStats";
import { createStudent, updateStudent, setStudentActive } from "../../lib/queries/students";
import { createLogin } from "../../lib/queries/auth";
import StudentForm from "./StudentForm";
import CsvImportModal from "./CsvImportModal";

export default function StudentsPage({ data, refetch }) {
  const { students, sections, attendance } = data;
  const [query, setQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [editing, setEditing] = useState(null); // null | 'new' | student
  const [csvOpen, setCsvOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = students.filter((s) => {
    if (statusFilter === "active" && !s.active) return false;
    if (statusFilter === "inactive" && s.active) return false;
    if (sectionFilter !== "all" && s.sectionId !== sectionFilter) return false;
    if (query && !`${s.name} ${s.admissionNo}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const saveStudent = async (form, loginInfo) => {
    setSaving(true);
    setError("");
    try {
      let student;
      if (editing === "new") {
        student = await createStudent(form);
        if (loginInfo) {
          await createLogin({
            email: loginInfo.email,
            password: loginInfo.password,
            name: student.name,
            role: "student",
            studentId: student.id,
          });
        }
      } else {
        await updateStudent(editing.id, form);
      }
      await refetch();
      setEditing(null);
    } catch (err) {
      setError(err.message || "Failed to save student.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (student) => {
    await setStudentActive(student.id, !student.active);
    await refetch();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="erp-serif text-2xl font-semibold">Students</h2>
          <p className="text-sm text-[var(--ink-soft)]">{filtered.length} shown · {students.filter((s) => s.active).length} active total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" icon={Upload} onClick={() => setCsvOpen(true)}>Import CSV</Button>
          <Button icon={Plus} onClick={() => setEditing("new")} disabled={sections.length === 0}>Add student</Button>
        </div>
      </div>

      {sections.length === 0 && (
        <p className="rounded-md bg-[var(--amber-bg)] px-3 py-2 text-xs text-[var(--amber)]">
          Create a class and section first (under Classes) before adding students.
        </p>
      )}
      {error && <p className="rounded-md bg-[var(--red-bg)] px-3 py-2 text-xs text-[var(--red)]">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or admission no."
            className="focus-ring w-64 rounded-md border border-[var(--rule)] bg-[var(--paper-raised)] py-2 pl-8 pr-3 text-sm"
          />
        </div>
        <Select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
          <option value="all">All sections</option>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.className} - {s.name}</option>)}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
          <option value="all">All statuses</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No students found" hint="Try adjusting filters, or add a new student." />
      ) : (
        <div className="erp-scroll overflow-x-auto rounded-lg border border-[var(--rule)]">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-[var(--slate-bg)] text-left text-xs uppercase tracking-wide text-[var(--ink-soft)]">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Admission No.</th>
                <th className="px-3 py-2">Section</th>
                <th className="px-3 py-2">Guardian</th>
                <th className="px-3 py-2">Attendance</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const stats = attendanceStats(attendance, s.id);
                return (
                  <tr key={s.id} className="border-t border-[var(--rule-soft)]">
                    <td className="px-3 py-2 font-medium">{s.name}</td>
                    <td className="erp-mono px-3 py-2 text-xs">{s.admissionNo}</td>
                    <td className="px-3 py-2">{sectionLabel(sections, s.sectionId)}</td>
                    <td className="px-3 py-2 text-xs text-[var(--ink-soft)]">{s.guardianName}<br/>{s.guardianPhone}</td>
                    <td className="px-3 py-2">{stats.pct === null ? "—" : <Badge tone={stats.pct < 75 ? "red" : "green"}>{stats.pct}%</Badge>}</td>
                    <td className="px-3 py-2">{s.active ? <Badge tone="green">Active</Badge> : <Badge tone="red">Deactivated</Badge>}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEditing(s)} className="focus-ring rounded p-1.5 hover:bg-[var(--slate-bg)]" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => toggleActive(s)} className="focus-ring rounded p-1.5 hover:bg-[var(--slate-bg)]" title={s.active ? "Deactivate" : "Reactivate"}>
                          {s.active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Add student" : `Edit ${editing.name}`} onClose={() => setEditing(null)} wide>
          <StudentForm sections={sections} initial={editing} onSave={saveStudent} onCancel={() => setEditing(null)} saving={saving} />
        </Modal>
      )}
      {csvOpen && (
        <CsvImportModal
          sections={sections}
          onClose={() => setCsvOpen(false)}
          onImported={async () => { await refetch(); setCsvOpen(false); }}
        />
      )}
    </div>
  );
}
