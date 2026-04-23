"use client";

import { useState, useEffect } from "react";
import type { Note } from "../types/notes";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("notepad-notes");
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
      setNotes(parsedNotes);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("notepad-notes", JSON.stringify(notes));
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setCurrentNote(newNote);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note,
      ),
    );
    if (currentNote?.id === id) {
      setCurrentNote((prev) =>
        prev ? { ...prev, ...updates, updatedAt: new Date() } : null,
      );
    }
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (currentNote?.id === id) {
      setCurrentNote(null);
    }
  };

  return {
    notes,
    currentNote,
    setCurrentNote,
    createNote,
    updateNote,
    deleteNote,
  };
}
