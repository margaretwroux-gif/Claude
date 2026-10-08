"use server";

import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { dayKey } from "@/lib/time";

const HABIT_COLORS = ["emerald", "sky", "violet", "amber", "rose"] as const;

function str(form: FormData, key: string, max: number): string {
  return String(form.get(key) ?? "").trim().slice(0, max);
}

function id(form: FormData): number {
  const n = Number(form.get("id"));
  if (!Number.isInteger(n) || n <= 0) throw new Error("Invalid id");
  return n;
}

function refresh(...paths: string[]) {
  for (const p of ["/", ...paths]) revalidatePath(p);
}

// ---------- Tasks ----------

export async function createTask(form: FormData) {
  const title = str(form, "title", 200);
  if (!title) return;
  const priority = [1, 2, 3].includes(Number(form.get("priority"))) ? Number(form.get("priority")) : 2;
  const due = str(form, "due_date", 10);
  const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null;
  await query(`INSERT INTO tasks (title, priority, due_date) VALUES ($1, $2, $3)`, [title, priority, dueDate]);
  refresh("/tasks");
}

export async function toggleTask(form: FormData) {
  await query(
    `UPDATE tasks SET completed_at = CASE WHEN completed_at IS NULL THEN now() ELSE NULL END WHERE id = $1`,
    [id(form)],
  );
  refresh("/tasks");
}

export async function deleteTask(form: FormData) {
  await query(`DELETE FROM tasks WHERE id = $1`, [id(form)]);
  refresh("/tasks");
}

export async function clearCompletedTasks() {
  await query(`DELETE FROM tasks WHERE completed_at IS NOT NULL`);
  refresh("/tasks");
}

// ---------- Habits ----------

export async function createHabit(form: FormData) {
  const name = str(form, "name", 80);
  if (!name) return;
  const raw = str(form, "color", 20);
  const color = (HABIT_COLORS as readonly string[]).includes(raw) ? raw : "emerald";
  await query(`INSERT INTO habits (name, color) VALUES ($1, $2)`, [name, color]);
  refresh("/habits");
}

/** Toggle a check-in for `day` (defaults to today; only today or past days are allowed). */
export async function toggleHabit(form: FormData) {
  const today = dayKey();
  const raw = str(form, "day", 10);
  const day = /^\d{4}-\d{2}-\d{2}$/.test(raw) && raw <= today ? raw : today;
  const habitId = id(form);
  const deleted = await query(`DELETE FROM habit_checkins WHERE habit_id = $1 AND day = $2 RETURNING 1`, [
    habitId,
    day,
  ]);
  if (deleted.length === 0) {
    await query(`INSERT INTO habit_checkins (habit_id, day) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
      habitId,
      day,
    ]);
  }
  refresh("/habits");
}

export async function archiveHabit(form: FormData) {
  await query(`UPDATE habits SET archived_at = now() WHERE id = $1`, [id(form)]);
  refresh("/habits");
}

// ---------- Notes ----------

export async function createNote(form: FormData) {
  const title = str(form, "title", 200);
  const body = str(form, "body", 20000);
  if (!title && !body) return;
  await query(`INSERT INTO notes (title, body) VALUES ($1, $2)`, [title, body]);
  refresh("/notes");
}

export async function updateNote(form: FormData) {
  await query(`UPDATE notes SET title = $2, body = $3, updated_at = now() WHERE id = $1`, [
    id(form),
    str(form, "title", 200),
    str(form, "body", 20000),
  ]);
  refresh("/notes");
}

export async function togglePinNote(form: FormData) {
  await query(`UPDATE notes SET pinned = NOT pinned WHERE id = $1`, [id(form)]);
  refresh("/notes");
}

export async function deleteNote(form: FormData) {
  await query(`DELETE FROM notes WHERE id = $1`, [id(form)]);
  refresh("/notes");
}

// ---------- Focus ----------

export async function logFocusSession(label: string, minutes: number) {
  const mins = Math.round(minutes);
  if (!Number.isFinite(mins) || mins < 1 || mins > 600) return;
  await query(`INSERT INTO focus_sessions (label, minutes) VALUES ($1, $2)`, [label.trim().slice(0, 120), mins]);
  refresh("/focus");
}

export async function deleteFocusSession(form: FormData) {
  await query(`DELETE FROM focus_sessions WHERE id = $1`, [id(form)]);
  refresh("/focus");
}
