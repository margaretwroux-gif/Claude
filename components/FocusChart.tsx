import { formatDay, weekdayShort } from "@/lib/time";

/** Single-series bar chart of focus minutes per day. Hover a column for its exact value. */
export function FocusChart({ data }: { data: { day: string; minutes: number }[] }) {
  const max = Math.max(60, ...data.map((d) => d.minutes));
  const total = data.reduce((s, d) => s + d.minutes, 0);
  return (
    <figure>
      <div className="flex h-36 items-end gap-2" role="img" aria-label={`Focus minutes per day, ${total} total`}>
        {data.map((d, i) => {
          const isToday = i === data.length - 1;
          return (
            <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end">
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-white opacity-0 shadow transition group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900">
                {formatDay(d.day)} · {d.minutes} min
              </div>
              <div className="absolute inset-0 rounded-md group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800/60" />
              <div
                className={`relative mx-auto w-full max-w-7 rounded-t ${
                  isToday ? "bg-indigo-600 dark:bg-indigo-400" : "bg-indigo-300 dark:bg-indigo-700"
                }`}
                style={{ height: d.minutes ? `${Math.max(3, (d.minutes / max) * 100)}%` : "0" }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-2 border-t border-zinc-200 pt-1 dark:border-zinc-800">
        {data.map((d, i) => (
          <div
            key={d.day}
            className={`flex-1 text-center text-[11px] ${
              i === data.length - 1 ? "font-semibold text-zinc-900 dark:text-zinc-100" : "text-zinc-500"
            }`}
          >
            {weekdayShort(d.day)}
          </div>
        ))}
      </div>
      <figcaption className="sr-only">
        {data.map((d) => `${d.day}: ${d.minutes} minutes`).join("; ")}
      </figcaption>
    </figure>
  );
}
