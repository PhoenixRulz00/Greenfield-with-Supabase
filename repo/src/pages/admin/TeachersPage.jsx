import React, { useEffect, useState } from "react";
import { GraduationCap, Search, Plus, Pencil, UserX, UserCheck } from "lucide-react";
import { Button, Badge, EmptyState, Modal, Select } from "../../components/ui";
import { createTeacher, updateTeacher, setTeacherActive } from "../../lib/queries/teachers";
import { createLogin } from "../../lib/queries/auth";
import { sectionLabel, teacherSectionIds } from "../../utils/attendanceStats";
import TeacherForm from "./TeacherForm";

export default function TeachersPage({ data, refetch }) {
  const { teachers, sections, teacherAssignments } = data;
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState({ visible: false, email: "", password: "" });

  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(() => setToast((current) => ({ ...current, visible: false })), 5000);
    return () => clearTimeout(timer);
  }, [toast.visible]);

  const filtered = teachers.filter((t) => {
    if (statusFilter === "active" && !t.active) return false;
    if (statusFilter === "inactive" && t.active) return false;
    if (query && !`${t.name} ${t.subject}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const saveTeacher = async (form, loginInfo) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      let teacher;
      if (editing === "new") {
        teacher = await createTeacher(form);
        if (loginInfo) {
          await createLogin({
            email: loginInfo.email,
            password: loginInfo.password,
            name: teacher.name,
            role: "teacher",
            teacherId: teacher.id,
          });
          setSuccess(`Temporary password created for ${teacher.name}. Tell them to sign in with ${loginInfo.email} and set a new password immediately.`);
          setToast({ visible: true, email: loginInfo.email, password: loginInfo.password });
        }
      } else {
        await updateTeacher(editing.id, form);
      }
      await refetch();
      setEditing(null);
    } catch (err) {
      const message = err?.message || "";
      if (message.includes("teachers_email_key") || message.toLowerCase().includes("duplicate key") || message.toLowerCase().includes("already exists") || message === "This email already exists.") {
        setError("This email already exists.");
      } else {
        setError(message || "Failed to save teacher.");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (teacher) => {
    await setTeacherActive(teacher.id, !teacher.active);
    await refetch();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="erp-serif text-2xl font-semibold">Teachers</h2>
          <p className="text-sm text-[var(--ink-soft)]">{filtered.length} shown · {teachers.filter((t) => t.active).length} active total</p>
        </div>
        <Button icon={Plus} onClick={() => setEditing("new")}>Add teacher</Button>
      </div>

      {success && (
        <div className="rounded-md border border-[var(--green)] bg-[var(--green-bg)] px-3 py-2 text-sm text-[var(--green)]">
          {success}
        </div>
      )}
      {error && <p className="rounded-md bg-[var(--red-bg)] px-3 py-2 text-xs text-[var(--red)]">{error}</p>}

      {toast.visible && (
        <div className="fixed right-4 top-4 z-50 w-80 rounded-lg border border-[var(--green)] bg-[var(--paper-raised)] p-3 shadow-lg">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--green)]">Temporary password created</p>
          <p className="mt-2 text-sm font-medium">{toast.email}</p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">Temporary password: {toast.password}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or subject"
            className="focus-ring w-64 rounded-md border border-[var(--rule)] bg-[var(--paper-raised)] py-2 pl-8 pr-3 text-sm" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="active">Active</option><option value="inactive">Deactivated</option><option value="all">All statuses</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No teachers found" hint="Try adjusting filters, or add a new teacher." />
      ) : (
        <div className="erp-scroll overflow-x-auto rounded-lg border border-[var(--rule)]">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-[var(--slate-bg)] text-left text-xs uppercase tracking-wide text-[var(--ink-soft)]">
              <tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Subject</th><th className="px-3 py-2">Contact</th><th className="px-3 py-2">Sections</th><th className="px-3 py-2">Status</th><th className="px-3 py-2"></th></tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-[var(--rule-soft)]">
                  <td className="px-3 py-2 font-medium">{t.name}</td>
                  <td className="px-3 py-2">{t.subject || "—"}</td>
                  <td className="px-3 py-2 text-xs text-[var(--ink-soft)]">{t.email}<br/>{t.phone}</td>
                  <td className="px-3 py-2 text-xs">{teacherSectionIds(sections, teacherAssignments, t.id).map((id) => sectionLabel(sections, id)).join(", ") || "—"}</td>
                  <td className="px-3 py-2">{t.active ? <Badge tone="green">Active</Badge> : <Badge tone="red">Deactivated</Badge>}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditing(t)} className="focus-ring rounded p-1.5 hover:bg-[var(--slate-bg)]"><Pencil size={14} /></button>
                      <button onClick={() => toggleActive(t)} className="focus-ring rounded p-1.5 hover:bg-[var(--slate-bg)]">{t.active ? <UserX size={14} /> : <UserCheck size={14} />}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Add teacher" : `Edit ${editing.name}`} onClose={() => setEditing(null)} wide>
          <TeacherForm initial={editing} onSave={saveTeacher} onCancel={() => setEditing(null)} saving={saving} existingTeachers={teachers} />
        </Modal>
      )}
    </div>
  );
}
