import { archiveHabit, toggleHabit } from "@/app/actions";
import type { Habit } from "@/lib/data";
import { lastNDays, weekdayShort } from "@/lib/time";
import { SubmitButton } from "./SubmitButton";

export const HABIT_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500 border-emerald-500",
  sky: "bg-sky-500 border-sky-500",
  violet: "bg-violet-500 border-violet-500",
  amber: "bg-amber-500 border-amber-500",
  rose: "bg-rose-500 border-rose-500",
};

function DayToggle({ habit, day, label }: { habit: Habit; day: string; label: string }) {
  const done = habit.days.includes(day);
  return (
    <form action={toggleHabit}>
      <input type="hidden" name="id" value={habit.id} />
      <input type="hidden" name="day" value={day} />
      <SubmitButton
        title={`${habit.name} — ${day}: ${done ? "done" : "not done"}`}
        className={`h-7 w-7 rounded-md border text-[10px] font-medium transition ${
          done
            ? `${HABIT_COLORS[habit.color] ?? HABIT_COLORS.emerald} text-white`
            : "border-zinc-200 text-zinc-400 hover:border-zinc-400 dark:border-zinc-700"
        }`}
      >
        {label}
      </SubmitButton>
    </form>
  );
}

/** A habit with a week of toggleable days. */
export function HabitRow({ habit, showArchive = false }: { habit: Habit; showArchive?: boolean }) {
  const days = lastNDays(7);
  return (
    <li className="group flex flex-wrap items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{habit.name}</div>
        <div className="text-xs text-zinc-500">
          {habit.streak > 0 ? `🔥 ${habit.streak}-day streak` : "No current streak"}
        </div>
      </div>
      <div className="flex gap-1">
        {days.map((d) => (
          <DayToggle key={d} habit={habit} day={d} label={weekdayShort(d).slice(0, 2)} />
        ))}
      </div>
      {showArchive && (
        <form action={archiveHabit} className="transition md:opacity-0 md:focus-within:opacity-100 md:group-hover:opacity-100">
          <input type="hidden" name="id" value={habit.id} />
          <SubmitButton className="btn-ghost" title="Archive habit">
            ✕
          </SubmitButton>
        </form>
      )}
    </li>
  );
}
