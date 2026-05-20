"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setAccessToken } from "@/lib/api";

const EXTENSION_INSTALL_URL =
  "https://chromewebstore.google.com/detail/autoapply-linkedin-connec/hlaopmkjjcfmhnokpdcjcojilnddoinp";

async function requestCookieFromExtension(): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      window.removeEventListener(
        "AUTOAPPLY_LINKEDIN_COOKIE_RESPONSE",
        onResp as EventListener,
      );
      reject(
        new Error(
          "Extension did not respond — open LinkedIn in this browser and try again",
        ),
      );
    }, 8000);
    const onResp = (e: Event) => {
      clearTimeout(timeoutId);
      window.removeEventListener(
        "AUTOAPPLY_LINKEDIN_COOKIE_RESPONSE",
        onResp as EventListener,
      );
      const detail = (e as CustomEvent).detail as
        | { cookie?: string; error?: string }
        | undefined;
      if (!detail) return reject(new Error("empty response from extension"));
      if (detail.error) return reject(new Error(detail.error));
      if (!detail.cookie) return reject(new Error("no cookie returned"));
      resolve(detail.cookie);
    };
    window.addEventListener(
      "AUTOAPPLY_LINKEDIN_COOKIE_RESPONSE",
      onResp as EventListener,
    );
    window.dispatchEvent(new CustomEvent("AUTOAPPLY_REQUEST_LINKEDIN_COOKIE"));
  });
}

type Phase = "idle" | "verifying" | "registering";

// The verify-linkedin token is bound to the exact LinkedIn email/cookie the
// user verified with; track both so we can invalidate the token when either
// field is edited.
type Verified = {
  linkedinEmail: string;
  linkedinCookie: string;
  token: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    linkedinEmail: "",
    linkedinCookie: "",
  });
  const [verified, setVerified] = useState<Verified | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [showManual, setShowManual] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [extReady, setExtReady] = useState(false);

  useEffect(() => {
    const onReady = () => setExtReady(true);
    window.addEventListener("AUTOAPPLY_EXTENSION_READY", onReady);
    // The extension's content script dispatches the ready event on document
    // idle. If we mount after that fires, we won't catch it — but the
    // extension will fire it on every page (re)load, so a navigation cures it.
    return () =>
      window.removeEventListener("AUTOAPPLY_EXTENSION_READY", onReady);
  }, []);

  async function connectWithExtension() {
    if (!form.linkedinEmail.trim()) {
      setErr("enter your LinkedIn email first");
      return;
    }
    setErr(null);
    setPhase("verifying");
    try {
      const cookie = await requestCookieFromExtension();
      setForm((f) => ({ ...f, linkedinCookie: cookie }));
      const { verificationToken } = await apiFetch<{
        verified: boolean;
        verificationToken: string;
      }>("/auth/verify-linkedin", {
        method: "POST",
        body: JSON.stringify({
          linkedinEmail: form.linkedinEmail,
          linkedinCookie: cookie,
        }),
      });
      setVerified({
        linkedinEmail: form.linkedinEmail,
        linkedinCookie: cookie,
        token: verificationToken,
      });
    } catch (e: unknown) {
      setVerified(null);
      setErr(
        e instanceof Error ? e.message : "could not connect via extension",
      );
    } finally {
      setPhase("idle");
    }
  }

  const busy = phase !== "idle";
  const isVerified =
    verified !== null &&
    verified.linkedinEmail === form.linkedinEmail &&
    verified.linkedinCookie === form.linkedinCookie;

  const canVerify =
    !busy && form.linkedinEmail.trim() !== "" && form.linkedinCookie.trim() !== "";

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
          linkedinCookie: form.linkedinCookie.trim(),
        }),
      });
      setVerified({
        linkedinEmail: form.linkedinEmail,
        linkedinCookie: form.linkedinCookie,
        token: verificationToken,
      });
    } catch (e: unknown) {
      setVerified(null);
      setErr(
        e instanceof Error
          ? e.message
          : "could not verify LinkedIn session cookie",
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
            linkedinCookie: form.linkedinCookie.trim(),
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
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
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
                      Connect LinkedIn
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
                    Paste your LinkedIn session cookie (li_at). We never see
                    your password, and your cookie is stored encrypted.{" "}
                    <button
                      type="button"
                      onClick={() => setShowHelp((v) => !v)}
                      className="text-brand-300 hover:text-brand-200 underline underline-offset-2"
                    >
                      {showHelp ? "hide instructions" : "how do I get this?"}
                    </button>
                  </p>
                </div>
              </div>

              {showHelp && (
                <ol className="mt-3 space-y-1.5 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-300 list-decimal list-inside">
                  <li>
                    Open{" "}
                    <a
                      href="https://www.linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-300 hover:text-brand-200 underline"
                    >
                      linkedin.com
                    </a>{" "}
                    in another tab and sign in normally.
                  </li>
                  <li>
                    Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">F12</kbd>{" "}
                    (Windows) or{" "}
                    <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">⌥⌘I</kbd>{" "}
                    (Mac) to open DevTools.
                  </li>
                  <li>
                    Go to <span className="text-slate-100">Application</span>{" "}
                    tab → <span className="text-slate-100">Cookies</span> →{" "}
                    <span className="text-slate-100">https://www.linkedin.com</span>.
                  </li>
                  <li>
                    Find the row named{" "}
                    <code className="px-1 py-0.5 rounded bg-white/10">
                      li_at
                    </code>{" "}
                    and copy its <span className="text-slate-100">Value</span>{" "}
                    (a long string starting with{" "}
                    <code className="px-1 py-0.5 rounded bg-white/10">
                      AQE
                    </code>
                    ).
                  </li>
                  <li>Paste it into the field below.</li>
                </ol>
              )}

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

                {!isVerified && (
                  <>
                    {extReady ? (
                      <button
                        type="button"
                        onClick={connectWithExtension}
                        disabled={busy || form.linkedinEmail.trim() === ""}
                        className="btn-primary w-full py-2 text-sm"
                      >
                        {phase === "verifying" ? (
                          <span className="inline-flex items-center gap-2">
                            <Spinner /> Connecting via extension…
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-2">
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M9 12l2 2 4-4" />
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                            Connect with extension
                          </span>
                        )}
                      </button>
                    ) : (
                      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs space-y-2">
                        <p className="text-slate-300">
                          Install our 1-click browser extension to connect
                          your LinkedIn securely — no copy-pasting needed.
                        </p>
                        <a
                          href={EXTENSION_INSTALL_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary inline-flex items-center gap-2 px-3 py-1.5 text-xs"
                        >
                          Install Chrome extension
                        </a>
                        <p className="text-[11px] text-slate-500">
                          Already installed?{" "}
                          <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="text-brand-300 hover:text-brand-200 underline"
                          >
                            Reload this page
                          </button>
                          .
                        </p>
                      </div>
                    )}

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowManual((v) => !v)}
                        className="text-[11px] text-slate-500 hover:text-slate-300 underline underline-offset-2"
                      >
                        {showManual
                          ? "Hide manual cookie paste"
                          : "Paste cookie manually instead"}
                      </button>
                    </div>
                  </>
                )}

                {(showManual || isVerified) && (
                  <Field
                    label="LinkedIn session cookie (li_at)"
                    hint="Advanced — paste only the value"
                  >
                    <textarea
                      value={form.linkedinCookie}
                      onChange={set("linkedinCookie")}
                      placeholder="AQEDAR... (long opaque token)"
                      required
                      rows={3}
                      spellCheck={false}
                      autoComplete="off"
                      className="input font-mono text-xs"
                    />
                  </Field>
                )}

                {showManual && !isVerified && (
                  <button
                    type="button"
                    onClick={verifyLinkedIn}
                    disabled={!canVerify}
                    className="btn-secondary w-full py-2 text-sm"
                  >
                    {phase === "verifying" ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner /> Verifying with LinkedIn…
                      </span>
                    ) : (
                      "Verify pasted cookie"
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
