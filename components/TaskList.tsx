import { createTask, deleteTask, toggleTask } from "@/app/actions";
import type { Task } from "@/lib/data";
import { dayKey, formatDay } from "@/lib/time";
import { ResetForm } from "./ResetForm";
import { SubmitButton } from "./SubmitButton";

const PRIORITY: Record<number, { label: string; className: string }> = {
  1: { label: "High", className: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
  2: { label: "Med", className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  3: { label: "Low", className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
};

function DueLabel({ due, done }: { due: string; done: boolean }) {
  const today = dayKey();
  const overdue = !done && due < today;
  const text = due === today ? "Today" : formatDay(due);
  return (
    <span className={`text-xs ${overdue ? "font-medium text-rose-600 dark:text-rose-400" : "text-zinc-500"}`}>
      {overdue ? `Overdue · ${text}` : text}
    </span>
  );
}

export function TaskItem({ task }: { task: Task }) {
  const done = task.completed_at !== null;
  const p = PRIORITY[task.priority];
  return (
    <li className="group flex items-center gap-3 py-2">
      <form action={toggleTask}>
        <input type="hidden" name="id" value={task.id} />
        <SubmitButton
          title={done ? "Mark as not done" : "Mark as done"}
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] ${
            done ? "border-indigo-600 bg-indigo-600 text-white" : "border-zinc-300 hover:border-indigo-500 dark:border-zinc-600"
          }`}
        >
          {done ? "✓" : ""}
        </SubmitButton>
      </form>
      <span className={`min-w-0 flex-1 truncate text-sm ${done ? "text-zinc-400 line-through" : ""}`}>{task.title}</span>
      {task.due_date && <DueLabel due={task.due_date} done={done} />}
      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${p.className}`}>{p.label}</span>
      <form action={deleteTask} className="transition md:opacity-0 md:focus-within:opacity-100 md:group-hover:opacity-100">
        <input type="hidden" name="id" value={task.id} />
        <SubmitButton className="btn-ghost" title="Delete task">
          ✕
        </SubmitButton>
      </form>
    </li>
  );
}

export function TaskList({ tasks, empty }: { tasks: Task[]; empty: string }) {
  if (tasks.length === 0) return <p className="py-4 text-sm text-zinc-500">{empty}</p>;
  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} />
      ))}
    </ul>
  );
}

export function TaskForm({ compact = false }: { compact?: boolean }) {
  return (
    <ResetForm action={createTask} className="flex flex-wrap gap-2">
      <input name="title" required maxLength={200} placeholder="Add a task…" className="input min-w-0 flex-1" />
      {!compact && (
        <>
          <select name="priority" defaultValue="2" className="input w-auto" aria-label="Priority">
            <option value="1">High</option>
            <option value="2">Medium</option>
            <option value="3">Low</option>
          </select>
          <input type="date" name="due_date" className="input w-auto" aria-label="Due date" />
        </>
      )}
      <SubmitButton>Add</SubmitButton>
    </ResetForm>
  );
}
