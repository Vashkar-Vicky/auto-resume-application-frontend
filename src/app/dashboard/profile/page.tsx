export default function ProfilePage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Account settings will live here.
        </p>
      </div>
      <div className="card text-sm text-slate-400">
        Coming soon. The backend has <code className="text-slate-300">/me</code> and
        <code className="text-slate-300"> PATCH /me</code> planned in the API spec
        but they&rsquo;re not wired yet.
      </div>
    </div>
  );
}
