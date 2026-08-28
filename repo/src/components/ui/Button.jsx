import React from "react";

export default function Button({ children, onClick, variant = "primary", size = "md", icon: Icon, type = "button", disabled }) {
  const base = "focus-ring inline-flex items-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "px-2.5 py-1.5 text-xs", md: "px-3.5 py-2 text-sm" };
  const variants = {
    primary: "bg-[var(--ink)] text-[var(--paper)] hover:bg-[#0f1830]",
    ghost: "bg-transparent text-[var(--ink)] hover:bg-[var(--slate-bg)] border border-[var(--rule)]",
    danger: "bg-transparent text-[var(--red)] hover:bg-[var(--red-bg)] border border-[var(--red)]",
    subtle: "bg-[var(--slate-bg)] text-[var(--ink)] hover:bg-[var(--rule-soft)]",
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {Icon && <Icon size={14} strokeWidth={2.3} />}
      {children}
    </button>
  );
}
