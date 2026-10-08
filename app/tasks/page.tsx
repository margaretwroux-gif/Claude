import Link from "next/link";
import { clearCompletedTasks } from "../actions";
import { PageHeader } from "@/components/PageHeader";
import { SubmitButton } from "@/components/SubmitButton";
import { TaskForm, TaskList } from "@/components/TaskList";
import { getTasks, type TaskFilter } from "@/lib/data";

export const dynamic = "force-dynamic";

const FILTERS: { key: TaskFilter; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "done", label: "Completed" },
  { key: "all", label: "All" },
];

export default async function TasksPage({ searchParams }: { searchParams: { filter?: string } }) {
  const filter: TaskFilter = FILTERS.some((f) => f.key === searchParams.filter)
    ? (searchParams.filter as TaskFilter)
    : "open";
  const tasks = await getTasks(filter);

  return (
    <>
      <PageHeader title="Tasks" subtitle="Capture, prioritise, finish." />
      <section className="card">
        <TaskForm />
        <div className="mt-4 flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-zinc-800">
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={f.key === "open" ? "/tasks" : `/tasks?filter=${f.key}`}
                className={`rounded-md px-2.5 py-1 text-sm ${
                  f.key === filter
                    ? "bg-zinc-100 font-medium dark:bg-zinc-800"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
          {filter === "done" && tasks.length > 0 && (
            <form action={clearCompletedTasks}>
              <SubmitButton className="btn-ghost">Clear completed</SubmitButton>
            </form>
          )}
        </div>
        <TaskList
          tasks={tasks}
          empty={filter === "done" ? "No completed tasks yet." : "No tasks. Add one above."}
        />
      </section>
    </>
  );
}
