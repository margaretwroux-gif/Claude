import { createNote } from "../actions";
import { NoteCard } from "@/components/NoteCard";
import { PageHeader } from "@/components/PageHeader";
import { ResetForm } from "@/components/ResetForm";
import { SubmitButton } from "@/components/SubmitButton";
import { getNotes } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const notes = await getNotes();
  return (
    <>
      <PageHeader title="Notes" subtitle="Pinned notes stay on top." />
      <ResetForm action={createNote} className="card mb-6 flex flex-col gap-2">
        <input name="title" placeholder="Title" maxLength={200} className="input" />
        <textarea name="body" placeholder="Write a note…" rows={3} className="input resize-y" />
        <div className="flex justify-end">
          <SubmitButton>Add note</SubmitButton>
        </div>
      </ResetForm>
      {notes.length === 0 ? (
        <p className="text-sm text-zinc-500">No notes yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((n) => (
            <NoteCard key={`${n.id}-${n.updated_at}`} note={n} />
          ))}
        </div>
      )}
    </>
  );
}
