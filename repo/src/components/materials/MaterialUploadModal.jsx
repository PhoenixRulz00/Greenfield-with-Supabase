import React, { useState } from "react";
import { UploadCloud, FileText, X, AlertCircle, BookOpen, CheckSquare, FileCode } from "lucide-react";
import { Button, Field, Input, Modal, Select } from "../ui";
import { sectionLabel } from "../../utils/attendanceStats";
import { uploadMaterialFile, createMaterial } from "../../lib/queries/materials";

const TYPES = [
  { id: "notes", label: "Notes / Study Material", icon: BookOpen, desc: "Upload chapter notes, reading material, or slides (PDF/Images)" },
  { id: "homework", label: "Homework", icon: FileText, desc: "Daily or weekly homework tasks with optional submission deadline" },
  { id: "assignment", label: "Assignment / Project", icon: CheckSquare, desc: "Graded project or class assignment with clear instructions and due date" },
];

export default function MaterialUploadModal({
  sections = [],
  allowedSectionIds = [],
  defaultSectionId = null,
  teacherId = null,
  teacherSubject = "",
  onClose,
  onSuccess,
}) {
  const [sectionId, setSectionId] = useState(
    defaultSectionId && allowedSectionIds.includes(defaultSectionId)
      ? defaultSectionId
      : allowedSectionIds[0] || ""
  );
  const [type, setType] = useState("notes");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(teacherSubject || "");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      // Limit to 25MB
      if (selected.size > 25 * 1024 * 1024) {
        setError("File size exceeds 25MB limit.");
        return;
      }
      setFile(selected);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!sectionId) {
      setError("Please select a target class and section.");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a title (e.g., Chapter 1 or Topic).");
      return;
    }

    setLoading(true);
    try {
      let fileData = null;
      if (file) {
        fileData = await uploadMaterialFile(file, sectionId);
      }

      await createMaterial({
        sectionId,
        teacherId,
        type,
        title,
        subject,
        description,
        dueDate: type !== "notes" ? dueDate : null,
        fileUrl: fileData?.fileUrl || null,
        fileName: fileData?.fileName || null,
        fileType: fileData?.fileType || null,
        fileSize: fileData?.fileSize || null,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to post material. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Post Notes, Homework or Assignment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto erp-scroll pr-1">
        {/* Step 1: Select Class & Section */}
        <Field label="Target Class & Section">
          <Select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            required
            className="w-full"
          >
            {allowedSectionIds.map((sId) => (
              <option key={sId} value={sId}>
                {sectionLabel(sections, sId)}
              </option>
            ))}
          </Select>
          <span className="text-xs text-[var(--ink-soft)] mt-1">
            Only students enrolled in this class and section will be able to see this post.
          </span>
        </Field>

        {/* Step 2: Choose Category / Type */}
        <Field label="Category / Post Type">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {TYPES.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "border-[var(--ink)] bg-[var(--paper)] ring-2 ring-[var(--ink)] ring-offset-1"
                      : "border-[var(--rule)] bg-[var(--paper-raised)] hover:bg-[var(--slate-bg)]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs text-[var(--ink)]">
                    <Icon size={14} className={isSelected ? "text-[var(--ink)]" : "text-[var(--ink-soft)]"} />
                    <span>{t.label}</span>
                  </div>
                  <span className="text-[11px] text-[var(--ink-soft)] leading-tight">
                    {t.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        {/* Step 3: Title & Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Title / Chapter Name">
            <Input
              type="text"
              required
              placeholder="e.g. Chapter 1: Living Organisms"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>

          <Field label="Subject">
            <Input
              type="text"
              placeholder="e.g. Science, Mathematics, English"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field>
        </div>

        {/* Due Date if Homework or Assignment */}
        {type !== "notes" && (
          <Field label="Submission Due Date (Optional)">
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>
        )}

        {/* Description / Instructions */}
        <Field label="Instructions or Additional Notes (Optional)">
          <textarea
            rows={3}
            className="w-full focus-ring rounded-md border border-[var(--rule)] bg-[var(--paper-raised)] p-2.5 text-sm text-[var(--ink)]"
            placeholder="Add context, instructions for students, or important guidelines..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        {/* File Attachment (PDF, JPG, PNG, etc.) */}
        <Field label="Attach File (PDF, JPG, PNG, Docs - max 25MB)">
          {!file ? (
            <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--rule)] bg-[var(--paper-raised)] p-5 text-center cursor-pointer hover:border-[var(--ink-soft)] hover:bg-[var(--slate-bg)]/40 transition-colors">
              <UploadCloud size={24} className="text-[var(--ink-soft)]" />
              <div className="text-xs text-[var(--ink-soft)]">
                <span className="font-semibold text-[var(--ink)]">Click to upload</span> or drag and drop
              </div>
              <span className="text-[11px] text-[var(--ink-soft)]">
                PDF documents, JPG/PNG scans, or Word docs
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.ppt,.pptx,.txt"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-[var(--rule)] bg-[var(--slate-bg)]/60 p-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <FileText size={20} className="shrink-0 text-[var(--ink)]" />
                <div className="truncate text-xs">
                  <p className="font-medium text-[var(--ink)] truncate">{file.name}</p>
                  <p className="text-[var(--ink-soft)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="focus-ring rounded p-1 hover:bg-[var(--red-bg)] text-[var(--ink-soft)] hover:text-[var(--red)] transition-colors"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </Field>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-[var(--red-bg)] p-3 text-xs text-[var(--red)]">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-2 border-t border-[var(--rule-soft)] pt-3">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (file ? "Uploading & Posting…" : "Posting…") : "Post to Class"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
