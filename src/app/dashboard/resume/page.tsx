export default function ResumePage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Resume</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Upload the resume the worker will attach to applications.
        </p>
      </div>
      <div className="card text-sm text-slate-400">
        Coming soon. The S3 bucket is provisioned (LocalStack
        <code className="text-slate-300"> autoapply-local</code>) and the
        worker has a <code className="text-slate-300">--resume</code> flag,
        but the upload endpoint isn&rsquo;t wired yet.
      </div>
    </div>
  );
}
