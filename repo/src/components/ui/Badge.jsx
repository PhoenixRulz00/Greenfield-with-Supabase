import React from "react";

export default function Badge({ tone = "slate", children }) {
  const tones = {
    green: "bg-[var(--green-bg)] text-[var(--green)]",
    red: "bg-[var(--red-bg)] text-[var(--red)]",
    amber: "bg-[var(--amber-bg)] text-[var(--amber)]",
    slate: "bg-[var(--slate-bg)] text-[var(--ink-soft)]",
    blue: "bg-[var(--blue-bg)] text-[var(--blue)]",
    orange: "bg-[var(--orange-bg)] text-[var(--orange)]",
  };
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${tones[tone] || tones.slate}`}>{children}</span>;
}

