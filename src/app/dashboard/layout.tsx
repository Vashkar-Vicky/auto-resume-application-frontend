"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const nav: { href: string; label: string; icon: ReactNode }[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/dashboard/console",
    label: "Live console",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="m7 9 3 3-3 3M13 15h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/history",
    label: "History",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" />
        <path d="M3 4v5h5M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/linkedin",
    label: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.11 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22V8zm7.51 0h4.37v1.92h.06c.61-1.16 2.1-2.39 4.32-2.39 4.62 0 5.47 3.04 5.47 7v7.47h-4.56v-6.62c0-1.58-.03-3.6-2.19-3.6-2.2 0-2.54 1.72-2.54 3.49V22H7.73V8z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/resume",
    label: "Resume",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/logs",
    label: "Logs",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-white/[0.06] bg-black/30 backdrop-blur-xl px-4 py-6 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-2 px-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center shadow-glow">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="font-semibold tracking-tight">AutoApply</span>
        </Link>

        <p className="px-3 mb-2 text-[10px] uppercase tracking-wider text-slate-500">
          Workspace
        </p>
        <nav className="space-y-0.5">
          {nav.map((n) => {
            const active =
              n.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? "bg-brand-500/15 text-white border border-brand-500/30 shadow-[0_0_0_1px_rgba(99,102,241,0.1)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <span
                  className={
                    active ? "text-brand-300" : "text-slate-500"
                  }
                >
                  {n.icon}
                </span>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 mx-2 rounded-xl border border-white/10 bg-gradient-to-br from-brand-500/10 to-purple-500/10 p-4">
          <p className="text-xs font-semibold text-slate-200">Pro tip</p>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Keep the live console open to watch screenshots stream in real-time.
          </p>
        </div>
      </aside>

      <main className="flex-1 px-8 py-8 max-w-[1400px] animate-fade-in">
        {children}
      </main>
    </div>
  );
}
