import React, { useState } from "react";
import { Check } from "lucide-react";
import { Button, Field, Input, Select } from "../../components/ui";

export default function StudentForm({ sections, initial, onSave, onCancel, saving }) {
  const isNew = initial === "new";
  const [form, setForm] = useState(
    isNew
      ? { name: "", admissionNo: "", dob: "", gender: "F", guardianName: "", guardianPhone: "", sectionId: sections[0]?.id || "" }
      : initial
  );
  const [createLogin, setCreateLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form, createLogin ? { email: loginEmail, password: loginPassword } : null);
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
        <div className="col-span-2 mt-1 rounded-md border border-[var(--rule-soft)] p-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={createLogin} onChange={(e) => setCreateLogin(e.target.checked)} />
            Also create a student login for this record
          </label>
          {createLogin && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Field label="Login email"><Input type="email" required={createLogin} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} /></Field>
              <Field label="Temporary password"><Input type="text" required={createLogin} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} /></Field>
            </div>
          )}
        </div>
      )}

      <div className="col-span-2 mt-2 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" icon={Check} disabled={saving}>{saving ? "Saving…" : "Save student"}</Button>
      </div>
    </form>
  );
}
