import "server-only";
import { query } from "./db";
import { TIMEZONE, addDays, dayKey, lastNDays } from "./time";

export type Task = {
  id: number;
  title: string;
  priority: 1 | 2 | 3;
  due_date: string | null;
  completed_at: string | null;
};

export type Habit = {
  id: number;
  name: string;
  color: string;
  days: string[]; // check-in day keys, newest first
  streak: number;
  doneToday: boolean;
};

export type Note = {
  id: number;
  title: string;
  body: string;
  pinned: boolean;
  updated_at: string;
};

export type FocusSession = { id: number; label: string; minutes: number; ended_at: string };

export type TaskFilter = "open" | "done" | "all";

/** Render a timestamptz column as an ISO-8601 UTC string, independent of driver and session settings. */
const iso = (col: string) => `to_char(${col} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`;

const TASK_COLS = `id, title, priority, due_date::text AS due_date, ${iso("completed_at")} AS completed_at`;

export async function getTasks(filter: TaskFilter = "open"): Promise<Task[]> {
  if (filter === "done") {
    return query<Task>(
      `SELECT ${TASK_COLS} FROM tasks WHERE completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 200`,
    );
  }
  const where = filter === "open" ? "WHERE completed_at IS NULL" : "";
  return query<Task>(
    `SELECT ${TASK_COLS} FROM tasks ${where}
     ORDER BY completed_at IS NOT NULL, due_date ASC NULLS LAST, priority ASC, created_at DESC
     LIMIT 500`,
  );
}

/** Open tasks that are overdue, due today, or have no due date, plus tasks finished today. */
export async function getTodayTasks(): Promise<Task[]> {
  const today = dayKey();
  return query<Task>(
    `SELECT ${TASK_COLS} FROM tasks
     WHERE (completed_at IS NULL AND (due_date IS NULL OR due_date <= $1::date))
        OR (completed_at AT TIME ZONE $2)::date = $1::date
     ORDER BY completed_at IS NOT NULL, priority ASC, due_date ASC NULLS LAST, created_at DESC
     LIMIT 12`,
    [today, TIMEZONE],
  );
}

function currentStreak(days: Set<string>, today: string): number {
  // A streak survives until the end of today, so start from yesterday if today isn't done yet.
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export async function getHabits(): Promise<Habit[]> {
  const today = dayKey();
  const rows = await query<{ id: number; name: string; color: string; days: string[] | null }>(
    `SELECT h.id, h.name, h.color,
            array_agg(c.day::text ORDER BY c.day DESC) FILTER (WHERE c.day IS NOT NULL) AS days
     FROM habits h
     LEFT JOIN habit_checkins c ON c.habit_id = h.id AND c.day > $1::date - 366
     WHERE h.archived_at IS NULL
     GROUP BY h.id
     ORDER BY h.created_at`,
    [today],
  );
  return rows.map((r) => {
    const days = r.days ?? [];
    const set = new Set(days);
    return { ...r, days, streak: currentStreak(set, today), doneToday: set.has(today) };
  });
}

export async function getNotes(): Promise<Note[]> {
  return query<Note>(
    `SELECT id, title, body, pinned, ${iso("updated_at")} AS updated_at
     FROM notes ORDER BY pinned DESC, updated_at DESC LIMIT 200`,
  );
}

export async function getRecentFocusSessions(limit = 20): Promise<FocusSession[]> {
  return query<FocusSession>(
    `SELECT id, label, minutes, ${iso("ended_at")} AS ended_at
     FROM focus_sessions ORDER BY ended_at DESC LIMIT $1`,
    [limit],
  );
}

/** Focus minutes per day for the last `n` days (oldest first), including zero days. */
export async function getFocusByDay(n = 7): Promise<{ day: string; minutes: number }[]> {
  const days = lastNDays(n);
  const rows = await query<{ day: string; minutes: number }>(
    `SELECT (ended_at AT TIME ZONE $1)::date::text AS day, sum(minutes)::int AS minutes
     FROM focus_sessions
     WHERE (ended_at AT TIME ZONE $1)::date >= $2::date
     GROUP BY 1`,
    [TIMEZONE, days[0]],
  );
  const byDay = new Map(rows.map((r) => [r.day, r.minutes]));
  return days.map((day) => ({ day, minutes: byDay.get(day) ?? 0 }));
}

export async function getTaskStats() {
  const today = dayKey();
  const [row] = await query<{ open: number; overdue: number; done_today: number; done_week: number }>(
    `SELECT
       count(*) FILTER (WHERE completed_at IS NULL)::int AS open,
       count(*) FILTER (WHERE completed_at IS NULL AND due_date < $1::date)::int AS overdue,
       count(*) FILTER (WHERE (completed_at AT TIME ZONE $2)::date = $1::date)::int AS done_today,
       count(*) FILTER (WHERE (completed_at AT TIME ZONE $2)::date > $1::date - 7)::int AS done_week
     FROM tasks`,
    [today, TIMEZONE],
  );
  return row;
}
