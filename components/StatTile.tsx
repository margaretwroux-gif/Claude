export function StatTile({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {detail && <div className="mt-0.5 text-xs text-zinc-500">{detail}</div>}
    </div>
  );
}
