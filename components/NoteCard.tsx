"use client";

import { useState } from "react";
import { deleteNote, togglePinNote, updateNote } from "@/app/actions";
import type { Note } from "@/lib/data";
import { SubmitButton } from "./SubmitButton";

export function NoteCard({ note }: { note: Note }) {
  const [editing, setEditing] = useState(false);
  const updated = new Date(note.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (editing) {
    return (
      <form
        action={async (form) => {
          await updateNote(form);
          setEditing(false);
        }}
        className="card flex flex-col gap-2"
      >
        <input type="hidden" name="id" value={note.id} />
        <input name="title" defaultValue={note.title} placeholder="Title" maxLength={200} className="input" />
        <textarea name="body" defaultValue={note.body} rows={6} className="input resize-y" autoFocus />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
            Cancel
          </button>
          <SubmitButton>Save</SubmitButton>
        </div>
      </form>
    );
  }

  return (
    <article className={`card flex flex-col ${note.pinned ? "ring-1 ring-indigo-500/40" : ""}`}>
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 truncate font-medium">{note.title || "Untitled"}</h3>
        <form action={togglePinNote}>
          <input type="hidden" name="id" value={note.id} />
          <SubmitButton className="btn-ghost" title={note.pinned ? "Unpin" : "Pin"}>
            {note.pinned ? "★" : "☆"}
          </SubmitButton>
        </form>
      </div>
      <p className="mt-2 line-clamp-6 flex-1 whitespace-pre-wrap break-words text-sm text-zinc-600 dark:text-zinc-300">
        {note.body}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
        <span>Edited {updated}</span>
        <div className="flex gap-1">
          <button type="button" className="btn-ghost" onClick={() => setEditing(true)}>
            Edit
          </button>
          <form
            action={deleteNote}
            onSubmit={(e) => {
              if (!confirm("Delete this note?")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={note.id} />
            <SubmitButton className="btn-ghost">Delete</SubmitButton>
          </form>
        </div>
      </div>
    </article>
  );
}
