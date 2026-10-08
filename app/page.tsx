import Link from "next/link";
import { createNote } from "./actions";
import { FocusChart } from "@/components/FocusChart";
import { HabitRow } from "@/components/HabitRow";
import { PageHeader } from "@/components/PageHeader";
import { StatTile } from "@/components/StatTile";
import { ResetForm } from "@/components/ResetForm";
import { SubmitButton } from "@/components/SubmitButton";
import { TaskForm, TaskList } from "@/components/TaskList";
import { getFocusByDay, getHabits, getTaskStats, getTodayTasks } from "@/lib/data";
import { TIMEZONE, greeting } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [tasks, stats, habits, focus] = await Promise.all([
    getTodayTasks(),
    getTaskStats(),
    getHabits(),
    getFocusByDay(7),
  ]);
  const habitsDone = habits.filter((h) => h.doneToday).length;
  const focusToday = focus[focus.length - 1]?.minutes ?? 0;
  const focusWeek = focus.reduce((s, d) => s + d.minutes, 0);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: TIMEZONE,
  });

  return (
    <>
      <PageHeader title={greeting()} subtitle={today} />

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Tasks done today" value={stats.done_today} detail={`${stats.done_week} in the last 7 days`} />
        <StatTile
          label="Open tasks"
          value={stats.open}
          detail={stats.overdue ? `${stats.overdue} overdue` : "Nothing overdue"}
        />
        <StatTile label="Habits today" value={`${habitsDone}/${habits.length}`} detail="checked in" />
        <StatTile label="Focus today" value={`${focusToday}m`} detail={`${focusWeek}m this week`} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="flex items-baseline justify-between">
            <h2 className="card-title">Today</h2>
            <Link href="/tasks" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
              All tasks →
            </Link>
          </div>
          <TaskForm compact />
          <div className="mt-2">
            <TaskList tasks={tasks} empty="Nothing due today. Enjoy it." />
          </div>
        </section>

        <section className="card">
          <div className="flex items-baseline justify-between">
            <h2 className="card-title">Habits</h2>
            <Link href="/habits" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
              Manage →
            </Link>
          </div>
          {habits.length === 0 ? (
            <p className="py-4 text-sm text-zinc-500">
              No habits yet. <Link href="/habits" className="text-indigo-600 hover:underline dark:text-indigo-400">Add one</Link>.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {habits.map((h) => (
                <HabitRow key={h.id} habit={h} />
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="flex items-baseline justify-between">
            <h2 className="card-title">Focus minutes · last 7 days</h2>
            <Link href="/focus" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
              Start a session →
            </Link>
          </div>
          <FocusChart data={focus} />
        </section>

        <section className="card">
          <h2 className="card-title">Quick note</h2>
          <ResetForm action={createNote} className="flex flex-col gap-2">
            <input name="title" placeholder="Title" maxLength={200} className="input" />
            <textarea name="body" placeholder="Jot something down…" rows={4} className="input resize-y" />
            <div className="flex justify-end">
              <SubmitButton>Save note</SubmitButton>
            </div>
          </ResetForm>
        </section>
      </div>
    </>
  );
}
