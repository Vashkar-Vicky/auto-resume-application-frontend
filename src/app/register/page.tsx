"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setAccessToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    linkedinEmail: "",
    linkedinPassword: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { accessToken } = await apiFetch<{ accessToken: string }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify(form) },
      );
      setAccessToken(accessToken);
      router.push("/dashboard");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "register failed");
    } finally {
      setBusy(false);
    }
  }

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <main className="min-h-screen grid place-items-center px-6 py-16">
      <div className="w-full max-w-lg animate-fade-in">
        <Link
          href="/"
          className="flex items-center gap-2 justify-center mb-8 group"
        >
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center shadow-glow">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="font-semibold tracking-tight text-lg group-hover:text-white transition">
            AutoApply
          </span>
        </Link>

        <div className="glass-strong p-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Two minutes to set up. Cancel anytime.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Full name">
              <input
                value={form.name}
                onChange={set("name")}
                placeholder="Jane Doe"
                required
                className="input"
              />
            </Field>
            <Field label="Account email">
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                required
                className="input"
              />
            </Field>
            <Field label="Password" hint="Min. 10 characters">
              <input
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••••"
                required
                className="input"
              />
            </Field>

            <div className="!mt-7 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 h-7 w-7 rounded-md bg-brand-500/15 text-brand-300 grid place-items-center">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    LinkedIn credentials
                  </p>
                  <p className="text-xs text-slate-400">
                    Encrypted at rest. Used only to drive the auto-apply worker.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <Field label="LinkedIn email">
                  <input
                    type="email"
                    value={form.linkedinEmail}
                    onChange={set("linkedinEmail")}
                    placeholder="linkedin@example.com"
                    required
                    className="input"
                  />
                </Field>
                <Field label="LinkedIn password">
                  <input
                    type="password"
                    value={form.linkedinPassword}
                    onChange={set("linkedinPassword")}
                    placeholder="••••••••"
                    required
                    className="input"
                  />
                </Field>
              </div>
            </div>

            {err && (
              <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {err}
              </p>
            )}

            <button
              disabled={busy}
              className="btn-primary w-full py-2.5 text-base"
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner /> Creating account…
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-brand-300 hover:text-brand-200 font-medium transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
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
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="label">{label}</span>
        {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
      </div>
      {children}
    </label>
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
