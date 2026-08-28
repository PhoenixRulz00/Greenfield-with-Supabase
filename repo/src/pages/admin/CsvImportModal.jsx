import React, { useState } from "react";
import { Check } from "lucide-react";
import { Button, Modal } from "../../components/ui";
import { importStudents } from "../../lib/queries/students";

export default function CsvImportModal({ sections, onClose, onImported }) {
  const [text, setText] = useState("name,admissionNo,section,guardianName,guardianPhone\nJohn Doe,ADM-2001,5-A,Jane Doe,+91 90000 11111");
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);

  const parse = () => {
    setError("");
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) { setError("Add a header row and at least one data row."); return; }
    const headers = lines[0].split(",").map((h) => h.trim());
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
    try {
      const result = await importStudents(preview, sections);
      onImported(result);
    } catch (err) {
      setError(err.message || "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal title="Import students from CSV" onClose={onClose} wide>
      <p className="mb-2 text-xs text-[var(--ink-soft)]">Paste CSV with headers: name, admissionNo, section (e.g. "5-A"), guardianName, guardianPhone.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="erp-mono focus-ring w-full rounded-md border border-[var(--rule)] bg-[var(--paper-raised)] p-2 text-xs"
      />
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
    </Modal>
  );
}
