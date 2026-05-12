"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSessionWS } from "@/hooks/useSessionWS";
import { useSessionStore } from "@/store/sessionStore";
import { apiFetch } from "@/lib/api";

export default function LiveConsolePage() {
  return (
    <Suspense fallback={<ConsoleFallback />}>
      <LiveConsole />
    </Suspense>
  );
}

function ConsoleFallback() {
  return (
    <div className="card max-w-md mx-auto mt-24 text-center">
      <div className="text-sm text-slate-400">Loading session…</div>
    </div>
  );
}

function LiveConsole() {
  const params = useSearchParams();
  const sessionId = params.get("sessionId");
  useSessionWS(sessionId);
  const slice = useSessionStore((s) =>
    sessionId ? s.sessions[sessionId] : undefined,
  );

  if (!sessionId) {
    return (
      <div className="max-w-md mx-auto mt-24 text-center">
        <div className="card">
          <div className="mx-auto h-12 w-12 rounded-full bg-white/[0.04] grid place-items-center text-slate-400 mb-3">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="font-semibold">No active session</h2>
          <p className="mt-1 text-sm text-slate-400">
            Pass <code className="text-brand-300">?sessionId=…</code> in the URL,
            or start a new run.
          </p>
        </div>
      </div>
    );
  }

  async function stop() {
    await apiFetch(`/sessions/${sessionId}/stop`, { method: "POST" });
  }

  const status = slice?.status ?? "—";
  const percent = slice?.percent ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Live console</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Session{" "}
            <code className="text-slate-300">{sessionId.slice(0, 8)}</code>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <button onClick={stop} className="btn-danger">
            <StopIcon /> Stop run
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold">Progress</h2>
                <p className="text-sm text-slate-400">
                  {percent}% complete
                </p>
              </div>
              <span className="text-3xl font-semibold tabular-nums text-brand-300">
                {percent}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat
                label="Applied"
                value={slice?.applied ?? 0}
                tone="emerald"
              />
              <Stat label="Skipped" value={slice?.skipped ?? 0} tone="amber" />
              <Stat label="Failed" value={slice?.failed ?? 0} tone="rose" />
              <Stat
                label="Status"
                value={status}
                tone="brand"
                small
              />
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-2">Current job</h2>
            {slice?.currentCompany ? (
              <div className="flex items-center gap-3 mt-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-400/40 to-brand-600/40 grid place-items-center text-sm font-bold">
                  {slice.currentCompany?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="font-medium">{slice.currentRole}</p>
                  <p className="text-sm text-slate-400">
                    {slice.currentCompany}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 flex items-center gap-2 mt-2">
                <span className="h-2 w-2 rounded-full bg-slate-600" />
                Idle — waiting for next job
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Logs</h2>
              <span className="text-xs text-slate-500">
                {slice?.logTail?.length ?? 0} entries
              </span>
            </div>
            <pre
              className="font-mono text-[11.5px] leading-relaxed
                         rounded-lg border border-white/5 bg-black/40 p-4
                         h-80 overflow-auto whitespace-pre-wrap"
            >
              {(slice?.logTail ?? []).length === 0 ? (
                <span className="text-slate-600">Waiting for logs…</span>
              ) : (
                (slice?.logTail ?? []).map((l, i) => (
                  <div key={i}>
                    <span className={levelClass(l.level)}>
                      [{l.level.toUpperCase()}]
                    </span>{" "}
                    <span className="text-slate-300">{l.message}</span>
                  </div>
                ))
              )}
            </pre>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Latest screenshot</h2>
              {slice?.lastScreenshotUrl && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  live
                </span>
              )}
            </div>
            {slice?.lastScreenshotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slice.lastScreenshotUrl}
                alt="latest step"
                className="w-full rounded-lg border border-white/10"
              />
            ) : (
              <div className="aspect-video rounded-lg border border-dashed border-white/10 grid place-items-center text-sm text-slate-500">
                No screenshots yet.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  small,
}: {
  label: string;
  value: string | number;
  tone: "emerald" | "amber" | "rose" | "brand";
  small?: boolean;
}) {
  const tones: Record<typeof tone, string> = {
    emerald: "text-emerald-300 bg-emerald-500/5 border-emerald-500/15",
    amber: "text-amber-300 bg-amber-500/5 border-amber-500/15",
    rose: "text-rose-300 bg-rose-500/5 border-rose-500/15",
    brand: "text-brand-300 bg-brand-500/5 border-brand-500/15",
  };
  return (
    <div className={`rounded-lg border px-3 py-3 ${tones[tone]}`}>
      <div
        className={`${small ? "text-base" : "text-2xl"} font-semibold tabular-nums truncate`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let cls = "bg-slate-500/15 text-slate-300 border-slate-500/30";
  if (s.includes("run") || s.includes("active") || s.includes("apply"))
    cls = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  else if (s.includes("queue") || s.includes("pend"))
    cls = "bg-amber-500/15 text-amber-300 border-amber-500/30";
  else if (s.includes("fail") || s.includes("error") || s.includes("stop"))
    cls = "bg-rose-500/15 text-rose-300 border-rose-500/30";
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${cls}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {status}
    </span>
  );
}

function levelClass(level: string) {
  switch (level.toLowerCase()) {
    case "error":
    case "fatal":
      return "text-rose-400";
    case "warn":
    case "warning":
      return "text-amber-400";
    case "info":
      return "text-brand-400";
    case "debug":
      return "text-slate-500";
    default:
      return "text-slate-400";
  }
}

function StopIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
