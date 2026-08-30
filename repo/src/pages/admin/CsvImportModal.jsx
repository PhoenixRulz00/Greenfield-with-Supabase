import React, { useState } from "react";
import { Check, AlertCircle, Download } from "lucide-react";
import { Button, Modal } from "../../components/ui";
import { importStudents } from "../../lib/queries/students";

export default function CsvImportModal({ sections, onClose, onImported }) {
  const defaultText = `Full name,Admission No,Dob,Age,gender,Clas/Section,guardian name,guardian phone,login email,temporary password`;

  const [text, setText] = useState(defaultText);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const normalizeHeaders = (headers) => {
    // Map user-provided column names to system column names
    const headerMap = {
      "full name": "name",
      "admission no": "admissionNo",
      "admission number": "admissionNo",
      "dob": "dob",
      "date of birth": "dob",
      "age": "age",
      "gender": "gender",
      "clas/section": "section",
      "class/section": "section",
      "section": "section",
      "guardian name": "guardianName",
      "guardian phone": "guardianPhone",
      "guardian phonel": "guardianPhone", // typo tolerance
      "login email": "email",
      "email": "email",
      "temporary password": "password",
      "password": "password",
      "temp password": "password",
    };
    
    return headers.map(h => {
      const normalized = h.trim().toLowerCase();
      return headerMap[normalized] || normalized;
    });
  };

  const parse = () => {
    setError("");
    const lines = text.trim().split("\n").filter(line => line && !line.startsWith("#"));
    if (lines.length < 2) { setError("Add a header row and at least one data row."); return; }
    
    const rawHeaders = lines[0].split(",").map((h) => h.trim());
    const headers = normalizeHeaders(rawHeaders);
    
    const rows = lines.slice(1).map((line) => {
      const cells = line.split(",").map((c) => c.trim());
      const obj = {};
      headers.forEach((h, i) => (obj[h] = cells[i] || ""));
      return obj;
    });
    setPreview(rows);
  };

  const doImport = async () => {
    setImporting(true);
    setError("");
    setResult(null);
    try {
      const importResult = await importStudents(preview, sections);
      setResult(importResult);
      onImported(importResult);
    } catch (err) {
      setError(err.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  // Download logins as CSV
  const downloadLogins = () => {
    if (!result?.logins || result.logins.length === 0) return;
    const headers = ["Name", "Email", "Temporary Password", "Admission No"];
    const rows = result.logins.map((l) => [l.name, l.email, l.tempPassword, l.admissionNo]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-logins-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal title="Import students from CSV" onClose={onClose} wide>
      {!result ? (
        <>
          <p className="mb-2 text-xs text-[var(--ink-soft)]">Edit the CSV data below. Lines starting with # are comments/guidelines. Required: <strong>Full name, Admission No, Clas/Section, login email, temporary password</strong>. Column names are flexible—system accepts common variations.</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="erp-mono focus-ring w-full rounded-md border border-[var(--rule)] bg-[var(--paper-raised)] p-2 text-xs"
          />
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="subtle" onClick={() => setText(defaultText)}>Reset Template</Button>
            <Button size="sm" variant="subtle" onClick={() => { navigator.clipboard.writeText("Full name,Admission No,Dob,Age,gender,Clas/Section,guardian name,guardian phone,login email,temporary password"); alert("Template copied to clipboard!"); }}>Copy Template</Button>
          </div>
          {error && <p className="mt-2 text-xs text-[var(--red)]">{error}</p>}
          <div className="mt-3 flex gap-2">
            <Button variant="ghost" onClick={parse}>Preview</Button>
            {preview.length > 0 && <Button icon={Check} onClick={doImport} disabled={importing}>{importing ? "Importing…" : `Import ${preview.length} students`}</Button>}
          </div>
          {preview.length > 0 && (
            <div className="erp-scroll mt-3 max-h-40 overflow-auto rounded-md border border-[var(--rule)]">
              <table className="w-full text-xs">
                <thead className="bg-[var(--slate-bg)]"><tr>{Object.keys(preview[0]).map((h) => <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead>
                <tbody>{preview.map((r, i) => <tr key={i} className="border-t border-[var(--rule-soft)]">{Object.values(r).map((v, j) => <td key={j} className="px-2 py-1">{v}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="space-y-4">
            {result.created.length > 0 && (
              <div className="rounded-md border border-[var(--green)] bg-[var(--green-bg)] p-3">
                <p className="text-sm font-medium text-[var(--green)]">✓ {result.created.length} students imported successfully</p>
              </div>
            )}

            {result.logins && result.logins.length > 0 && (
              <div className="rounded-md border border-[var(--blue)] bg-[var(--blue-bg)] p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--blue)]">Login credentials created</p>
                    <p className="mt-1 text-xs text-[var(--blue)]">{result.logins.length} auth accounts with temporary passwords</p>
                  </div>
                  <Button size="sm" variant="ghost" icon={Download} onClick={downloadLogins}>Download CSV</Button>
                </div>
                <div className="erp-scroll mt-2 max-h-40 overflow-auto rounded-md border border-[var(--blue)]">
                  <table className="w-full text-xs">
                    <thead className="bg-[var(--blue)]"><tr><th className="px-2 py-1 text-left text-white">Name</th><th className="px-2 py-1 text-left text-white">Email</th><th className="px-2 py-1 text-left text-white">Temp Password</th></tr></thead>
                    <tbody>
                      {result.logins.map((l, i) => (
                        <tr key={i} className="border-t border-[var(--blue)]">
                          <td className="px-2 py-1">{l.name}</td>
                          <td className="px-2 py-1">{l.email}</td>
                          <td className="px-2 py-1 font-mono text-xs">{l.tempPassword}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {result.loginErrors && result.loginErrors.length > 0 && (
              <div className="rounded-md border border-[var(--orange)] bg-[var(--orange-bg)] p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-[var(--orange)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--orange)]">{result.loginErrors.length} login creation failed</p>
                    <p className="mt-1 text-xs text-[var(--orange)]">Students were created but logins couldn't be set up. You can create logins manually later.</p>
                  </div>
                </div>
              </div>
            )}

            {result.skipped && result.skipped.length > 0 && (
              <div className="rounded-md border border-[var(--rule)] bg-[var(--slate-bg)] p-3">
                <p className="text-xs font-medium text-[var(--ink)]">{result.skipped.length} rows skipped:</p>
                <ul className="mt-2 space-y-1 text-xs text-[var(--ink-soft)]">
                  {result.skipped.slice(0, 5).map((s, i) => (
                    <li key={i}>• {s.row.name || s.row.admissionNo} — {s.reason}</li>
                  ))}
                  {result.skipped.length > 5 && <li>• ... and {result.skipped.length - 5} more</li>}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </>
      )}
    </Modal>
  );
}
