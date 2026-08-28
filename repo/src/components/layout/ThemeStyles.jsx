import React from "react";

export default function ThemeStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      :root {
        --paper: #F7F5EF;
        --paper-raised: #FFFFFF;
        --ink: #1E2A45;
        --ink-soft: #5B6472;
        --rule: #DAD3C0;
        --rule-soft: #E9E4D6;
        --green: #2F6B4F;
        --green-bg: #E7F0EA;
        --red: #A6362C;
        --red-bg: #F6E7E5;
        --amber: #B07A1F;
        --amber-bg: #F5EBD8;
        --slate-bg: #EEEBE2;
      }
      .erp-root { font-family: 'IBM Plex Sans', sans-serif; background: var(--paper); color: var(--ink); min-height: 100%; }
      .erp-root button, .erp-root input, .erp-root select, .erp-root textarea { font-family: inherit; }
      .erp-root table tbody tr { transition: background-color 0.14s ease; }
      .erp-root table tbody tr:hover { background: rgba(238,235,226,0.48); }
      .erp-root input:focus, .erp-root select:focus, .erp-root textarea:focus { border-color: var(--ink-soft); box-shadow: 0 0 0 3px rgba(30,42,69,0.08); }
      .erp-serif { font-family: 'Source Serif 4', serif; }
      .erp-mono { font-family: 'IBM Plex Mono', monospace; }
      .erp-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
      .erp-scroll::-webkit-scrollbar-thumb { background: var(--rule); border-radius: 4px; }
      .stamp {
        display: inline-flex; align-items: center; justify-content: center;
        width: 34px; height: 34px; border-radius: 999px; font-family: 'IBM Plex Mono', monospace;
        font-weight: 700; font-size: 13px; border: 2px solid currentColor; cursor: pointer;
        transform: rotate(-4deg); transition: transform 0.12s ease, box-shadow 0.12s ease; user-select: none;
        background: transparent;
      }
      .stamp:hover { transform: rotate(0deg) scale(1.06); }
      .stamp.active { transform: rotate(-2deg) scale(1.08); box-shadow: 0 0 0 3px rgba(30,42,69,0.08) inset; }
      .focus-ring:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
    `}</style>
  );
}
