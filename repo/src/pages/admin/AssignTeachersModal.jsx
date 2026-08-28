import React, { useState } from "react";
import { Check } from "lucide-react";
import { Button, Field, Modal, Select } from "../../components/ui";
import { updateSectionTeacher, setSectionAssignments } from "../../lib/queries/classes";

export default function AssignTeachersModal({ teachers, section, teacherAssignments, onClose, onSaved }) {
  const [classTeacherId, setClassTeacherId] = useState(section.classTeacherId || "");
  const assignedIds = teacherAssignments.filter((a) => a.sectionId === section.id).map((a) => a.teacherId);
  const [checked, setChecked] = useState(new Set(assignedIds));
  const [saving, setSaving] = useState(false);

  const toggle = (id) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateSectionTeacher(section.id, classTeacherId || null);
      await setSectionAssignments(section.id, [...checked]);
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Assign teachers · ${section.className} - ${section.name}`} onClose={onClose} wide>
      <Field label="Class (homeroom) teacher">
        <Select value={classTeacherId} onChange={(e) => setClassTeacherId(e.target.value)}>
          <option value="">Unassigned</option>
          {teachers.filter((t) => t.active).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>
      </Field>
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Subject teachers with access to this section</p>
        <div className="flex flex-col gap-1.5">
          {teachers.filter((t) => t.active).map((t) => (
            <label key={t.id} className="flex items-center gap-2 rounded-md border border-[var(--rule-soft)] px-3 py-2 text-sm">
              <input type="checkbox" checked={checked.has(t.id)} onChange={() => toggle(t.id)} />
              {t.name} <span className="text-xs text-[var(--ink-soft)]">— {t.subject}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button icon={Check} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save assignments"}</Button>
      </div>
    </Modal>
  );
}
