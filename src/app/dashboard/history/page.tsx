"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type SessionRow = {
  id: string;
  status: string;
  progress: { applied?: number; skipped?: number; failed?: number } | null;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
};

export default function HistoryPage() {
  const [rows, setRows] = useState<SessionRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<SessionRow[]>("/sessions")
      .then(setRows)
      .catch((e) => setErr(e instanceof Error ? e.message : "failed"));
  }, []);

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">History</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Recent runs (most recent first).
        </p>
      </div>

      {err && (
        <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 mb-4">
          {err}
        </p>
      )}

      {rows === null && !err && (
        <div className="card text-sm text-slate-400">Loading…</div>
      )}

      {rows && rows.length === 0 && (
        <div className="card text-sm text-slate-400">
          No runs yet — start one from the{" "}
          <Link href="/dashboard" className="text-brand-300 underline">
            Overview
          </Link>{" "}
          page.
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/5">
                <th className="py-2 pr-4">Session</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Applied</th>
                <th className="py-2 pr-4">Skipped</th>
                <th className="py-2 pr-4">Failed</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-white/[0.03]">
                  <td className="py-2.5 pr-4 font-mono text-xs text-slate-300">
                    {r.id.slice(0, 8)}
                  </td>
                  <td className="py-2.5 pr-4">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="py-2.5 pr-4 tabular-nums">
                    {r.progress?.applied ?? 0}
                  </td>
                  <td className="py-2.5 pr-4 tabular-nums">
                    {r.progress?.skipped ?? 0}
                  </td>
                  <td className="py-2.5 pr-4 tabular-nums">
                    {r.progress?.failed ?? 0}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-400 text-xs">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="py-2.5">
                    <Link
                      href={`/dashboard/console?sessionId=${r.id}`}
                      className="text-brand-300 hover:text-brand-200 text-xs"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  let cls = "bg-slate-500/15 text-slate-300 border-slate-500/30";
  if (s === "running" || s === "paused")
    cls = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  else if (s === "queued")
    cls = "bg-amber-500/15 text-amber-300 border-amber-500/30";
  else if (s === "failed" || s === "cancelled")
    cls = "bg-rose-500/15 text-rose-300 border-rose-500/30";
  else if (s === "completed")
    cls = "bg-brand-500/15 text-brand-300 border-brand-500/30";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${cls}`}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
