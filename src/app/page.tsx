import Link from "next/link";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* decorative grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]
                   [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)]
                   [background-size:28px_28px]
                   [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
      />

      {/* nav */}
      <nav className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-semibold tracking-tight">AutoApply</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-slate-300 hover:text-white transition"
          >
            Sign in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-28 text-center animate-fade-in">
        <span
          className="inline-flex items-center gap-2 rounded-full border border-white/10
                     bg-white/[0.04] px-3 py-1 text-xs text-slate-300 backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
          </span>
          Live screenshot streaming · v1.0
        </span>

        <h1 className="mt-6 text-5xl sm:text-6xl font-semibold tracking-tight gradient-text leading-[1.05]">
          LinkedIn auto-apply,
          <br />
          on autopilot.
        </h1>

        <p className="mt-6 max-w-xl mx-auto text-lg text-slate-400 leading-relaxed">
          Configure your search once. Watch it apply, in real-time, with live
          screenshots and per-step logs — so you always know what&rsquo;s
          happening.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className="btn-primary px-6 py-3 text-base">
            Start applying →
          </Link>
          <Link href="/login" className="btn-secondary px-6 py-3 text-base">
            Sign in
          </Link>
        </div>

        {/* preview card */}
        <div className="mt-16 mx-auto max-w-3xl">
          <div className="glass-strong p-1 animate-fade-in">
            <div className="rounded-xl bg-slate-950/60 p-6 text-left">
              <div className="flex items-center gap-1.5 mb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <Mini label="Applied" value="42" tone="emerald" />
                <Mini label="Skipped" value="11" tone="amber" />
                <Mini label="Failed" value="2" tone="rose" />
                <Mini label="Progress" value="84%" tone="brand" />
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-400 to-brand-600 animate-[shimmer_2.5s_linear_infinite]"
                  style={{
                    width: "84%",
                    backgroundSize: "200% 100%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24 grid sm:grid-cols-3 gap-4">
        <Feature
          title="Live console"
          desc="Stream every step over WebSocket — counts, current job, errors."
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h10M4 18h16" strokeLinecap="round" />
            </svg>
          }
        />
        <Feature
          title="Screenshot capture"
          desc="See what the worker sees. Latest screenshot pinned, full history saved."
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="12" cy="12" r="3.5" />
            </svg>
          }
        />
        <Feature
          title="Encrypted creds"
          desc="LinkedIn credentials encrypted at rest. Daily limits enforced."
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          }
        />
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} AutoApply
      </footer>
    </main>
  );
}

function Logo() {
  return (
    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center shadow-glow">
      <span className="text-sm font-bold text-white">A</span>
    </div>
  );
}

function Feature({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass p-5 hover:border-white/20 transition group">
      <div className="h-10 w-10 rounded-lg bg-brand-500/15 text-brand-300 grid place-items-center group-hover:bg-brand-500/25 transition">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "rose" | "brand";
}) {
  const tones: Record<typeof tone, string> = {
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
    brand: "text-brand-300",
  };
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
      <div className={`text-xl font-semibold ${tones[tone]}`}>{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
    </div>
  );
}
