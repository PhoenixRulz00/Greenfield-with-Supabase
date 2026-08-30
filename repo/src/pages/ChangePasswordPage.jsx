import React, { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button, Field, Input } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

export default function ChangePasswordPage() {
  const { completePasswordChange, profile } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await completePasswordChange(password);
      setSuccess("Password updated successfully. You can continue using the app.");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err.message || "Password update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[560px] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-7 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--ink)]">
            <KeyRound size={20} />
          </div>
          <h1 className="erp-serif text-xl font-semibold">Change your password</h1>
          <p className="text-sm text-[var(--ink-soft)]">
            {profile?.name || "Your admin has set a temporary password."} Please choose a new secure password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="New password">
            <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Confirm new password">
            <Input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>

          {error && <p className="rounded-md bg-[var(--red-bg)] px-3 py-2 text-xs text-[var(--red)]">{error}</p>}
          {success && <p className="rounded-md bg-[var(--green-bg)] px-3 py-2 text-xs text-[var(--green)]">{success}</p>}

          <Button type="submit" disabled={submitting}>{submitting ? "Updating…" : "Update password"}</Button>
        </form>
      </div>
    </div>
  );
}
