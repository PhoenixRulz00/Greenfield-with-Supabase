import React from "react";
import { Download, ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { Button, Modal } from "../ui";

export default function MaterialViewerModal({ material, onClose }) {
  if (!material || !material.fileUrl) return null;

  const isImage = material.fileType?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(material.fileName || "");
  const isPdf = material.fileType === "application/pdf" || /\.pdf$/i.test(material.fileName || "");

  return (
    <Modal title={material.title} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--rule-soft)] pb-2 text-xs text-[var(--ink-soft)]">
          <div className="flex items-center gap-1.5 truncate">
            {isImage ? <ImageIcon size={14} /> : <FileText size={14} />}
            <span className="font-medium text-[var(--ink)] truncate">{material.fileName}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={material.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1 text-xs text-[var(--ink)] hover:underline"
            >
              <ExternalLink size={12} />
              Open in new tab
            </a>
            <a
              href={material.fileUrl}
              download={material.fileName || "download"}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1 rounded bg-[var(--ink)] px-2.5 py-1 text-xs font-medium text-[var(--paper)] hover:bg-[#0f1830]"
            >
              <Download size={12} />
              Download
            </a>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex min-h-[360px] max-h-[70vh] items-center justify-center overflow-auto rounded-lg border border-[var(--rule)] bg-[var(--paper)] p-2">
          {isImage ? (
            <img
              src={material.fileUrl}
              alt={material.title}
              className="max-h-[65vh] w-auto max-w-full rounded object-contain"
            />
          ) : isPdf ? (
            <iframe
              src={`${material.fileUrl}#toolbar=1`}
              title={material.title}
              className="h-[60vh] w-full rounded border-0"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <FileText size={48} className="text-[var(--ink-soft)]" />
              <p className="text-sm text-[var(--ink)] font-medium">
                Preview not available in-browser for this file format.
              </p>
              <a
                href={material.fileUrl}
                download
                className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--paper)]"
              >
                <Download size={14} />
                Download file
              </a>
            </div>
          )}
        </div>

        {material.description && (
          <div className="rounded-md bg-[var(--slate-bg)]/60 p-3 text-xs text-[var(--ink)]">
            <p className="font-semibold mb-1">Notes / Instructions:</p>
            <p className="whitespace-pre-line">{material.description}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
