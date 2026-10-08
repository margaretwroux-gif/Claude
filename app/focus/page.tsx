import { deleteFocusSession } from "../actions";
import { FocusChart } from "@/components/FocusChart";
import { FocusTimer } from "@/components/FocusTimer";
import { PageHeader } from "@/components/PageHeader";
import { SubmitButton } from "@/components/SubmitButton";
import { getFocusByDay, getRecentFocusSessions } from "@/lib/data";
import { TIMEZONE } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function FocusPage() {
  const [sessions, byDay] = await Promise.all([getRecentFocusSessions(15), getFocusByDay(14)]);
  return (
    <>
      <PageHeader title="Focus" subtitle="Pomodoro timer. Completed focus sessions are logged automatically." />
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <FocusTimer />
        <section className="card">
          <h2 className="card-title">Recent sessions</h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-zinc-500">No sessions yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {sessions.map((s) => (
                <li key={s.id} className="group flex items-center gap-3 py-2 text-sm">
                  <span className="w-12 font-medium tabular-nums">{s.minutes}m</span>
                  <span className="min-w-0 flex-1 truncate">{s.label || <span className="text-zinc-400">Untitled</span>}</span>
                  <span className="text-xs text-zinc-500">
                    {new Date(s.ended_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: TIMEZONE,
                    })}
                  </span>
                  <form action={deleteFocusSession} className="transition md:opacity-0 md:focus-within:opacity-100 md:group-hover:opacity-100">
                    <input type="hidden" name="id" value={s.id} />
                    <SubmitButton className="btn-ghost" title="Delete session">
                      ✕
                    </SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <section className="card mt-6">
        <h2 className="card-title">Focus minutes · last 14 days</h2>
        <FocusChart data={byDay} />
      </section>
    </>
  );
}
