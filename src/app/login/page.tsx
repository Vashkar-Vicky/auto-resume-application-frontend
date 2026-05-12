"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setAccessToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { accessToken } = await apiFetch<{ accessToken: string }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) },
      );
      setAccessToken(accessToken);
      router.push("/dashboard");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 py-16">
      <div className="w-full max-w-md animate-fade-in">
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
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Sign in to continue your run.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label mb-1.5 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>
            <div>
              <label className="label mb-1.5 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
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
                  <Spinner /> Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          New here?{" "}
          <Link
            href="/register"
            className="text-brand-300 hover:text-brand-200 font-medium transition"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
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
