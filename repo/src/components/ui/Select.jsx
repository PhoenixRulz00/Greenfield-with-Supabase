import React from "react";

export default function Select(props) {
  return (
    <select
      {...props}
      className="focus-ring rounded-md border border-[var(--rule)] bg-[var(--paper-raised)] px-3 py-2 text-sm text-[var(--ink)]"
    />
  );
}
