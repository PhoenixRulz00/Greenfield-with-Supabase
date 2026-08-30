import React, { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Button, Field, Input } from "../../components/ui";

export default function TeacherForm({ initial, onSave, onCancel, saving, existingTeachers = [] }) {
  const isNew = initial === "new";
  const [form, setForm] = useState(isNew ? { name: "", email: "", phone: "", subject: "" } : initial);
  const [loginPassword, setLoginPassword] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const duplicateEmail = useMemo(() => {
    const value = String(form.email || "").trim().toLowerCase();
    if (!value) return false;

    return existingTeachers.some((teacher) => {
      const sameEmail = String(teacher.email || "").trim().toLowerCase() === value;
      const sameTeacher = !isNew && teacher.id === initial?.id;
      return sameEmail && !sameTeacher;
    });
  }, [existingTeachers, form.email, initial, isNew]);

  const emailInputClass = duplicateEmail
    ? "focus-ring rounded-md border border-[var(--red)] bg-[var(--paper-raised)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)]"
    : "focus-ring rounded-md border border-[var(--rule)] bg-[var(--paper-raised)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)]";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (duplicateEmail) {
          return;
        }
        if (isNew && !loginPassword.trim()) {
          return;
        }
        onSave(form, isNew ? { email: form.email, password: loginPassword } : null);
      }}
      className="grid grid-cols-2 gap-3"
    >
      <div className="col-span-2"><Field label="Full name"><Input required value={form.name} onChange={set("name")} /></Field></div>
      <div className="col-span-1">
        <Field label="Email">
          <Input
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            aria-invalid={duplicateEmail}
            className={emailInputClass}
          />
        </Field>
        {duplicateEmail && (
          <p className="mt-1 text-xs font-medium text-[var(--red)]">This email already exists.</p>
        )}
      </div>
      <Field label="Phone"><Input value={form.phone || ""} onChange={set("phone")} /></Field>
      <div className="col-span-2"><Field label="Subject specialization"><Input value={form.subject || ""} onChange={set("subject")} /></Field></div>

      {isNew && (
        <div className="col-span-2 mt-1 rounded-md border border-[var(--rule-soft)] bg-[var(--slate-bg)] p-3">
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">Create teacher login</p>
          <div className="mt-2">
            <Field label="Temporary password"><Input type="text" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} /></Field>
          </div>
        </div>
      )}

      <div className="col-span-2 mt-2 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" icon={Check} disabled={saving || duplicateEmail}>{saving ? "Saving…" : "Save teacher"}</Button>
      </div>
    </form>
  );
}
