import { createHabit } from "../actions";
import { HABIT_COLORS, HabitRow } from "@/components/HabitRow";
import { PageHeader } from "@/components/PageHeader";
import { ResetForm } from "@/components/ResetForm";
import { SubmitButton } from "@/components/SubmitButton";
import { getHabits } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await getHabits();
  return (
    <>
      <PageHeader title="Habits" subtitle="Tap a day to check in. Streaks count consecutive days." />
      <section className="card">
        <ResetForm action={createHabit} className="flex flex-wrap items-center gap-2">
          <input name="name" required maxLength={80} placeholder="New habit, e.g. Read 20 pages" className="input min-w-0 flex-1" />
          <fieldset className="flex gap-1" aria-label="Colour">
            {Object.entries(HABIT_COLORS).map(([name, cls], i) => (
              <label key={name} className="cursor-pointer" title={name}>
                <input type="radio" name="color" value={name} defaultChecked={i === 0} className="peer sr-only" />
                <span
                  className={`block h-6 w-6 rounded-full border-2 ${cls} opacity-40 peer-checked:opacity-100 peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-zinc-400 peer-focus-visible:ring-2 dark:ring-offset-zinc-900`}
                />
              </label>
            ))}
          </fieldset>
          <SubmitButton>Add habit</SubmitButton>
        </ResetForm>
        {habits.length === 0 ? (
          <p className="pt-4 text-sm text-zinc-500">No habits yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-zinc-100 dark:divide-zinc-800">
            {habits.map((h) => (
              <HabitRow key={h.id} habit={h} showArchive />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
