"use client";

import { useNotes } from "@/hooks/use-notes";
import { NoteList } from "./notes-list";
import { NoteEditor } from "./note-editor";

export default function Page() {
  const {
    notes,
    currentNote,
    setCurrentNote,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes();

  const handleCreateNote = () => {
    createNote();
  };

  const handleSelectNote = (note: any) => {
    setCurrentNote(note);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote(id);
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <NoteEditor note={currentNote} onUpdateNote={updateNote} />
      <NoteList
        notes={notes}
        currentNote={currentNote}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
      />
    </div>
  );
}
