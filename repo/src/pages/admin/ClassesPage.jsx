import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button, Badge, Input, Select } from "../../components/ui";
import { createClass, createSection } from "../../lib/queries/classes";
import AssignTeachersModal from "./AssignTeachersModal";

export default function ClassesPage({ data, refetch }) {
  const { classes, sections, teachers, teacherAssignments, students } = data;
  const [newClassName, setNewClassName] = useState("");
  const [newSection, setNewSection] = useState({ classId: "", name: "", classTeacherId: "" });
  const [assignOpen, setAssignOpen] = useState(null);
  const [error, setError] = useState("");

  const addClass = async () => {
    if (!newClassName.trim()) return;
    setError("");
    try {
      await createClass(newClassName.trim());
      await refetch();
      setNewClassName("");
    } catch (err) {
      setError(err.message || "Failed to create class.");
    }
  };

  const addSection = async () => {
    if (!newSection.classId || !newSection.name.trim()) return;
    setError("");
    try {
      await createSection(newSection.classId, { name: newSection.name.trim(), classTeacherId: newSection.classTeacherId || null });
      await refetch();
      setNewSection({ classId: "", name: "", classTeacherId: "" });
    } catch (err) {
      setError(err.message || "Failed to create section.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="erp-serif text-2xl font-semibold">Classes &amp; Sections</h2>
        <p className="text-sm text-[var(--ink-soft)]">Create classes, open sections within them, and assign teachers.</p>
      </div>

      {error && <p className="rounded-md bg-[var(--red-bg)] px-3 py-2 text-xs text-[var(--red)]">{error}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-4">
          <h3 className="erp-serif mb-3 text-base font-semibold">New class</h3>
          <div className="flex gap-2">
            <Input placeholder="e.g. Grade 7" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
            <Button icon={Plus} onClick={addClass}>Add</Button>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-4">
          <h3 className="erp-serif mb-3 text-base font-semibold">New section</h3>
          <div className="flex flex-col gap-2">
            <Select value={newSection.classId} onChange={(e) => setNewSection({ ...newSection, classId: e.target.value })}>
              <option value="">Choose class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <div className="flex gap-2">
              <Input placeholder="Section name e.g. C" value={newSection.name} onChange={(e) => setNewSection({ ...newSection, name: e.target.value })} />
              <Select value={newSection.classTeacherId} onChange={(e) => setNewSection({ ...newSection, classTeacherId: e.target.value })}>
                <option value="">Class teacher (optional)</option>
                {teachers.filter((t) => t.active).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
              <Button icon={Plus} onClick={addSection}>Add</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {classes.map((cls) => {
          const secs = sections.filter((s) => s.classId === cls.id);
          return (
            <div key={cls.id} className="rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-4">
              <h4 className="erp-serif mb-2 text-base font-semibold">{cls.name}</h4>
              {secs.length === 0 ? (
                <p className="text-sm text-[var(--ink-soft)]">No sections yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {secs.map((s) => {
                    const classTeacher = teachers.find((t) => t.id === s.classTeacherId);
                    const studentCount = students.filter((st) => st.sectionId === s.id && st.active).length;
                    const assignedTeachers = teacherAssignments.filter((a) => a.sectionId === s.id).map((a) => teachers.find((t) => t.id === a.teacherId)).filter(Boolean);
                    return (
                      <div key={s.id} className="rounded-md border border-[var(--rule-soft)] p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{cls.name} - {s.name}</span>
                          <Badge tone="slate">{studentCount} students</Badge>
                        </div>
                        <p className="mt-1 text-xs text-[var(--ink-soft)]">Class teacher: {classTeacher ? classTeacher.name : "Unassigned"}</p>
                        <p className="text-xs text-[var(--ink-soft)]">Subject teachers: {assignedTeachers.length ? assignedTeachers.map((t) => t.name).join(", ") : "None"}</p>
                        <button onClick={() => setAssignOpen(s)} className="focus-ring mt-2 text-xs font-semibold text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-2">
                          Manage teacher assignments
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {assignOpen && (
        <AssignTeachersModal
          teachers={teachers}
          section={assignOpen}
          teacherAssignments={teacherAssignments}
          onClose={() => setAssignOpen(null)}
          onSaved={async () => { await refetch(); setAssignOpen(null); }}
        />
      )}
    </div>
  );
}
