import React, { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Button, Field, Input, Select } from "../../components/ui";

export default function StudentForm({ sections, initial, onSave, onCancel, saving, existingTeachers = [] }) {
  const isNew = initial === "new";
  const [form, setForm] = useState(
    isNew
      ? { name: "", admissionNo: "", dob: "", gender: "F", guardianName: "", guardianPhone: "", sectionId: sections[0]?.id || "" }
      : initial
  );
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const duplicateLoginEmail = useMemo(() => {
    const value = String(loginEmail || "").trim().toLowerCase();
    if (!isNew || !value) return false;

    return existingTeachers.some((teacher) => String(teacher.email || "").trim().toLowerCase() === value);
  }, [existingTeachers, isNew, loginEmail]);

  const loginEmailClass = duplicateLoginEmail
    ? "focus-ring rounded-md border border-[var(--red)] bg-[var(--paper-raised)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)]"
    : "focus-ring rounded-md border border-[var(--rule)] bg-[var(--paper-raised)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-soft)]";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (duplicateLoginEmail) return;
        if (isNew && (!loginEmail.trim() || !loginPassword.trim())) return;
        onSave(form, isNew ? { email: loginEmail, password: loginPassword } : null);
      }}
      className="grid grid-cols-2 gap-3"
    >
      <div className="col-span-2"><Field label="Full name"><Input required value={form.name} onChange={set("name")} /></Field></div>
      <Field label="Admission No."><Input required value={form.admissionNo} onChange={set("admissionNo")} /></Field>
      <Field label="Date of birth"><Input type="date" value={form.dob || ""} onChange={set("dob")} /></Field>
      <Field label="Gender">
        <Select value={form.gender || "F"} onChange={set("gender")}>
          <option value="F">Female</option><option value="M">Male</option><option value="X">Other</option>
        </Select>
      </Field>
      <Field label="Class / Section">
        <Select required value={form.sectionId} onChange={set("sectionId")}>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.className} - {s.name}</option>)}
        </Select>
      </Field>
      <Field label="Guardian name"><Input value={form.guardianName || ""} onChange={set("guardianName")} /></Field>
      <Field label="Guardian phone"><Input value={form.guardianPhone || ""} onChange={set("guardianPhone")} /></Field>

      {isNew && (
        <div className="col-span-2 mt-1 rounded-md border border-[var(--rule-soft)] bg-[var(--slate-bg)] p-3">
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">Create student login</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="col-span-1">
              <Field label="Login email">
                <Input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  aria-invalid={duplicateLoginEmail}
                  className={loginEmailClass}
                />
              </Field>
              {duplicateLoginEmail && (
                <p className="mt-1 text-xs font-medium text-[var(--red)]">This email already exists.</p>
              )}
            </div>
            <Field label="Temporary password"><Input type="text" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} /></Field>
          </div>
        </div>
      )}

      <div className="col-span-2 mt-2 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" icon={Check} disabled={saving || duplicateLoginEmail}>{saving ? "Saving…" : "Save student"}</Button>
      </div>
    </form>
  );
}
