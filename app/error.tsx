"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card max-w-xl">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        The dashboard couldn&apos;t load its data. Check that <code>DATABASE_URL</code> is set and that you have run{" "}
        <code>npm run db:migrate</code> against it.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-zinc-500">Ref: {error.digest}</p>}
      <button type="button" className="btn mt-4" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
