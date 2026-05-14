export default function LogsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Logs</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Per-session application log feed.
        </p>
      </div>
      <div className="card text-sm text-slate-400">
        Coming soon. Live logs already stream over the WebSocket to the{" "}
        <a href="/dashboard/console" className="text-brand-300 underline">
          Live console
        </a>
        ; this page will surface the historical
        <code className="text-slate-300"> application_logs</code> table next.
      </div>
    </div>
  );
}
