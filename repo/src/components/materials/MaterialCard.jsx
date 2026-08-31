import React, { useState } from "react";
import { FileText, Image as ImageIcon, Download, Trash2, Calendar, User, ExternalLink, Paperclip } from "lucide-react";
import { Badge, Button } from "../ui";
import { sectionLabel } from "../../utils/attendanceStats";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const TYPE_CONFIG = {
  notes: { label: "Notes", tone: "blue", bg: "var(--blue-bg)", color: "var(--blue)" },
  homework: { label: "Homework", tone: "amber", bg: "var(--amber-bg)", color: "var(--amber)" },
  assignment: { label: "Assignment", tone: "green", bg: "var(--green-bg)", color: "var(--green)" },
};

export default function MaterialCard({
  material,
  sections = [],
  canDelete = false,
  onDelete,
  onViewFile,
}) {
  const [deleting, setDeleting] = useState(false);
  const typeMeta = TYPE_CONFIG[material.type] || TYPE_CONFIG.notes;
  const isImage = material.fileType?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(material.fileName || "");
  const isPdf = material.fileType === "application/pdf" || /\.pdf$/i.test(material.fileName || "");

  const isDueOverdue = material.dueDate && new Date(material.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${material.title}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(material.id, material.fileUrl);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-4 transition-all hover:border-[var(--ink-soft)] shadow-sm">
      <div className="flex flex-col gap-2.5">
        {/* Top bar: Type badge, Subject, Class/Section */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge tone={typeMeta.tone}>{typeMeta.label}</Badge>
            {material.subject && (
              <span className="rounded bg-[var(--slate-bg)] px-2 py-0.5 text-xs font-medium text-[var(--ink)]">
                {material.subject}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-[var(--ink-soft)]">
            {sectionLabel(sections, material.sectionId)}
          </span>
        </div>

        {/* Title */}
        <h4 className="erp-serif text-lg font-semibold text-[var(--ink)] leading-snug">
          {material.title}
        </h4>

        {/* Description */}
        {material.description && (
          <p className="text-sm text-[var(--ink-soft)] whitespace-pre-line line-clamp-3">
            {material.description}
          </p>
        )}

        {/* Attachment Card if present */}
        {material.fileUrl && (
          <div className="mt-1 flex items-center justify-between rounded-md border border-[var(--rule-soft)] bg-[var(--slate-bg)]/50 p-2.5">
            <div className="flex items-center gap-2 overflow-hidden pr-2">
              {isImage ? (
                <ImageIcon size={18} className="shrink-0 text-[var(--amber)]" />
              ) : isPdf ? (
                <FileText size={18} className="shrink-0 text-[var(--red)]" />
              ) : (
                <Paperclip size={18} className="shrink-0 text-[var(--blue)]" />
              )}
              <div className="truncate text-xs">
                <span className="font-medium text-[var(--ink)] block truncate">
                  {material.fileName || "Attached File"}
                </span>
                {material.fileSize && (
                  <span className="text-[var(--ink-soft)]">{formatBytes(material.fileSize)}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onViewFile ? (
                <button
                  onClick={() => onViewFile(material)}
                  className="focus-ring inline-flex items-center gap-1 rounded bg-[var(--paper-raised)] px-2 py-1 text-xs font-medium text-[var(--ink)] border border-[var(--rule)] hover:bg-[var(--slate-bg)]"
                  title="Preview in app"
                >
                  <ExternalLink size={12} />
                  View
                </button>
              ) : (
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex items-center gap-1 rounded bg-[var(--paper-raised)] px-2 py-1 text-xs font-medium text-[var(--ink)] border border-[var(--rule)] hover:bg-[var(--slate-bg)]"
                  title="Open file"
                >
                  <Download size={12} />
                  Download
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Due Date */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--rule-soft)] pt-3 text-xs text-[var(--ink-soft)]">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>{material.teacherName || "Teacher"}</span>
            <span>·</span>
            <span>{new Date(material.createdAt).toLocaleDateString()}</span>
          </div>

          {material.dueDate && (
            <div className="flex items-center gap-1 font-medium mt-0.5">
              <Calendar size={12} className={isDueOverdue ? "text-[var(--red)]" : "text-[var(--green)]"} />
              <span className={isDueOverdue ? "text-[var(--red)]" : "text-[var(--ink)]"}>
                Due: {material.dueDate} {isDueOverdue && "(Past Due)"}
              </span>
            </div>
          )}
        </div>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="focus-ring rounded p-1.5 text-[var(--ink-soft)] hover:bg-[var(--red-bg)] hover:text-[var(--red)] disabled:opacity-40 transition-colors"
            title="Delete material"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
