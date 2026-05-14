"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function DashboardOverview() {
  const router = useRouter();
  const [keywords, setKeywords] = useState("software engineer, golang, backend");
  const [locations, setLocations] = useState("Remote, Bangalore");
  const [dailyLimit, setDailyLimit] = useState(50);
  const [minScore, setMinScore] = useState(60);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setErr(null);
    try {
      const { sessionId } = await apiFetch<{ sessionId: string }>("/sessions", {
        method: "POST",
        body: JSON.stringify({
          keywords: keywords
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          locations: locations
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          dailyLimit,
          minScore,
        }),
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("lastSessionId", sessionId);
      }
      router.push(`/dashboard/console?sessionId=${sessionId}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  const keywordChips = keywords
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const locationChips = locations
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Start a new run
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Configure your filters — the worker will queue and start applying.
        </p>
      </div>

      <div className="card space-y-6">
        <Field
          label="Keywords"
          hint={`${keywordChips.length} term${keywordChips.length === 1 ? "" : "s"}`}
        >
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="input"
            placeholder="software engineer, golang, backend"
          />
          {keywordChips.length > 0 && (
            <ChipRow chips={keywordChips} tone="brand" />
          )}
        </Field>

        <Field
          label="Locations"
          hint={`${locationChips.length} location${locationChips.length === 1 ? "" : "s"}`}
        >
          <input
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            className="input"
            placeholder="Remote, Bangalore"
          />
          {locationChips.length > 0 && (
            <ChipRow chips={locationChips} tone="emerald" />
          )}
        </Field>

        <Field label="Daily limit" hint="1–200 applications / day">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={200}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <input
              type="number"
              min={1}
              max={200}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="input w-24 text-center"
            />
          </div>
        </Field>

        <Field label="Min match score" hint="0–100% — skip jobs below this">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="input w-24 text-center"
            />
          </div>
        </Field>

        {err && (
          <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
            {err}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-white/5">
          <button
            disabled={busy}
            onClick={start}
            className="btn-primary px-5 py-2.5"
          >
            {busy ? (
              <>
                <Spinner /> Starting…
              </>
            ) : (
              <>
                <PlayIcon /> Start auto-apply
              </>
            )}
          </button>
          <p className="text-xs text-slate-500">
            You&rsquo;ll be redirected to the live console.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="label">{label}</span>
        {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ChipRow({
  chips,
  tone,
}: {
  chips: string[];
  tone: "brand" | "emerald";
}) {
  const cls =
    tone === "brand"
      ? "bg-brand-500/10 text-brand-200 border-brand-500/20"
      : "bg-emerald-500/10 text-emerald-200 border-emerald-500/20";
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <span
          key={c}
          className={`text-xs px-2 py-1 rounded-md border ${cls}`}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
    </svg>
  );
}
