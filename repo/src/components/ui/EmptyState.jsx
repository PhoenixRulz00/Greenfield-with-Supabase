import React from "react";

export default function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--rule)] py-14 text-center">
      <Icon size={26} className="text-[var(--ink-soft)]" />
      <p className="erp-serif text-base font-semibold">{title}</p>
      {hint && <p className="max-w-xs text-sm text-[var(--ink-soft)]">{hint}</p>}
    </div>
  );
}
