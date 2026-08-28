import React from "react";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2A45]/40 p-4" onClick={onClose}>
      <div
        className={`erp-scroll max-h-[88vh] w-full ${wide ? "max-w-xl" : "max-w-md"} overflow-y-auto rounded-lg border border-[var(--rule)] bg-[var(--paper-raised)] p-5 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="erp-serif text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="focus-ring rounded p-1 text-[var(--ink-soft)] hover:bg-[var(--slate-bg)]">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
