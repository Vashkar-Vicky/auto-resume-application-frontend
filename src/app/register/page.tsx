"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setAccessToken } from "@/lib/api";

type Phase = "idle" | "verifying" | "registering";

// The verify-linkedin token is bound to the exact LinkedIn email/password the
// user verified with; track both so we can invalidate the token when either
// field is edited.
type Verified = {
  linkedinEmail: string;
  linkedinPassword: string;
  token: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    linkedinEmail: "",
    linkedinPassword: "",
  });
  const [verified, setVerified] = useState<Verified | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  const busy = phase !== "idle";
  const isVerified =
    verified !== null &&
    verified.linkedinEmail === form.linkedinEmail &&
    verified.linkedinPassword === form.linkedinPassword;

  const canVerify =
    !busy && form.linkedinEmail.trim() !== "" && form.linkedinPassword !== "";

  async function verifyLinkedIn() {
    setErr(null);
    setPhase("verifying");
    try {
      const { verificationToken } = await apiFetch<{
        verified: boolean;
        verificationToken: string;
      }>("/auth/verify-linkedin", {
        method: "POST",
        body: JSON.stringify({
          linkedinEmail: form.linkedinEmail,
          linkedinPassword: form.linkedinPassword,
        }),
      });
      setVerified({
        linkedinEmail: form.linkedinEmail,
        linkedinPassword: form.linkedinPassword,
        token: verificationToken,
      });
    } catch (e: unknown) {
      setVerified(null);
      setErr(
        e instanceof Error
          ? e.message
          : "could not verify LinkedIn credentials",
      );
    } finally {
      setPhase("idle");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!isVerified || !verified) {
      setErr("verify your LinkedIn login first");
      return;
    }
    setPhase("registering");
    try {
      const { accessToken } = await apiFetch<{ accessToken: string }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            ...form,
            verificationToken: verified.token,
          }),
        },
      );
      setAccessToken(accessToken);
      router.push("/dashboard");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "register failed");
      setPhase("idle");
    }
  }

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
    };

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
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-200">
                      LinkedIn credentials
                    </p>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-medium px-2 py-0.5">
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path
                            d="M5 12l5 5 9-11"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    We sign in to LinkedIn to make sure these work before we
                    create your account. Stored encrypted at rest.
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

                {!isVerified && (
                  <button
                    type="button"
                    onClick={verifyLinkedIn}
                    disabled={!canVerify}
                    className="btn-secondary w-full py-2 text-sm"
                  >
                    {phase === "verifying" ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner /> Signing into LinkedIn… up to a minute
                      </span>
                    ) : (
                      "Verify LinkedIn login"
                    )}
                  </button>
                )}
              </div>
            </div>

            {err && (
              <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {err}
              </p>
            )}

            <button
              disabled={busy || !isVerified}
              title={
                !isVerified
                  ? "Verify your LinkedIn login above first"
                  : undefined
              }
              className="btn-primary w-full py-2.5 text-base"
            >
              {phase === "registering" ? (
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
