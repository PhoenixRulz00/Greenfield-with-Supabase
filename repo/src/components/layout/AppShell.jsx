import React from "react";
import { School, LogOut } from "lucide-react";

export default function AppShell({ navItems, tab, setTab, profile, onSignOut, onChangePassword, showChangePassword, children, footer }) {
  return (
    <div className="erp-root min-h-[600px] overflow-hidden rounded-lg border border-[var(--rule)]">
      <div className="flex flex-col sm:flex-row">
        <aside className="flex shrink-0 flex-row items-center justify-between border-b border-[var(--rule)] bg-[var(--paper-raised)] p-3 sm:w-56 sm:flex-col sm:items-stretch sm:justify-start sm:border-b-0 sm:border-r sm:p-4">
          <div className="mb-0 flex items-center gap-2 sm:mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--ink)]"><School size={15} /></div>
            <div className="hidden sm:block">
              <p className="erp-serif text-sm font-semibold leading-tight">Greenfield</p>
              <p className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)]">School Register</p>
            </div>
          </div>
          <nav className="flex flex-row gap-1 sm:flex-col">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`focus-ring flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  tab === item.key ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink)] hover:bg-[var(--slate-bg)]"
                }`}
              >
                <item.icon size={15} /> <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="hidden sm:mt-auto sm:block">
            <div className="mb-2 rounded-md bg-[var(--slate-bg)] px-3 py-2 text-xs">
              <p className="font-semibold">{profile.name}</p>
              <p className="capitalize text-[var(--ink-soft)]">{profile.role}</p>
            </div>
            {showChangePassword && (
              <button onClick={onChangePassword} className="focus-ring mb-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--ink)] hover:bg-[var(--slate-bg)]">
                Change password
              </button>
            )}
            <button onClick={onSignOut} className="focus-ring flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--ink-soft)] hover:bg-[var(--slate-bg)]">
              <LogOut size={14} /> Sign out
            </button>
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            {showChangePassword && (
              <button onClick={onChangePassword} className="focus-ring rounded-md px-2 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--slate-bg)]">Password</button>
            )}
            <button onClick={onSignOut} className="focus-ring rounded-md p-2 text-[var(--ink-soft)] hover:bg-[var(--slate-bg)]"><LogOut size={16} /></button>
          </div>
        </aside>

        <main className="erp-scroll min-h-[600px] flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
      {footer && <div className="border-t border-[var(--rule)] bg-[var(--paper-raised)] px-4 py-1.5 text-right text-[10px] text-[var(--ink-soft)]">{footer}</div>}
    </div>
  );
}
