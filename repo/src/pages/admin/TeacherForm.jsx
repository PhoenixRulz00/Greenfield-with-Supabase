import React, { useState } from "react";
import { Check } from "lucide-react";
import { Button, Field, Input } from "../../components/ui";

export default function TeacherForm({ initial, onSave, onCancel, saving }) {
  const isNew = initial === "new";
  const [form, setForm] = useState(isNew ? { name: "", email: "", phone: "", subject: "" } : initial);
  const [createLogin, setCreateLogin] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form, createLogin ? { email: form.email, password: loginPassword } : null);
      }}
      className="grid grid-cols-2 gap-3"
    >
      <div className="col-span-2"><Field label="Full name"><Input required value={form.name} onChange={set("name")} /></Field></div>
      <Field label="Email"><Input type="email" required value={form.email} onChange={set("email")} /></Field>
      <Field label="Phone"><Input value={form.phone || ""} onChange={set("phone")} /></Field>
      <div className="col-span-2"><Field label="Subject specialization"><Input value={form.subject || ""} onChange={set("subject")} /></Field></div>

      {isNew && (
        <div className="col-span-2 mt-1 rounded-md border border-[var(--rule-soft)] p-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={createLogin} onChange={(e) => setCreateLogin(e.target.checked)} />
            Also create a teacher login (uses the email above)
          </label>
          {createLogin && (
            <div className="mt-2">
              <Field label="Temporary password"><Input type="text" required={createLogin} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} /></Field>
            </div>
          )}
        </div>
      )}

      <div className="col-span-2 mt-2 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" icon={Check} disabled={saving}>{saving ? "Saving…" : "Save teacher"}</Button>
      </div>
    </form>
  );
}
