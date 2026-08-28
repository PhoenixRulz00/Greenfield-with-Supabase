import React, { useState } from "react";
import { School } from "lucide-react";
import { Button, Field, Input } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setLocalError(err.message || "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[560px] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-7 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--ink)]">
            <School size={20} />
          </div>
          <h1 className="erp-serif text-xl font-semibold">Greenfield School Register</h1>
          <p className="text-sm text-[var(--ink-soft)]">Sign in with the email and password your admin set up for you.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email">
            <Input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <Input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {(localError || authError) && (
            <p className="rounded-md bg-[var(--red-bg)] px-3 py-2 text-xs text-[var(--red)]">{localError || authError}</p>
          )}
          <Button type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</Button>
        </form>
        <p className="mt-4 text-center text-xs text-[var(--ink-soft)]">
          No account yet? Ask your school admin — logins are created from the Teachers/Students admin panel.
        </p>
      </div>
    </div>
  );
}
