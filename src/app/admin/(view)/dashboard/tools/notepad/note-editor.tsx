"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Note } from "@/types/notes";
import { Save, FileText } from "lucide-react";

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
}

export function NoteEditor({ note, onUpdateNote }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setHasUnsavedChanges(false);
    } else {
      setTitle("");
      setContent("");
      setHasUnsavedChanges(false);
    }
  }, [note]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (note) {
      onUpdateNote(note.id, { title, content });
      setHasUnsavedChanges(false);
    }
  };

  // Auto-save after 2 seconds of inactivity
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (hasUnsavedChanges && note) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [title, content, hasUnsavedChanges, note]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center text-muted-foreground">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">
            KinteHobe Admin Notebook
          </h2>
          <p>Select a note to start editing or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4 flex items-center gap-4">
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title..."
        />
        <Button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          size="sm"
          variant={hasUnsavedChanges ? "default" : "outline"}
        >
          <Save className="w-4 h-4 mr-2" />
          {hasUnsavedChanges ? "Save" : "Saved"}
        </Button>
      </div>
      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing your note..."
          className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 text-base leading-relaxed"
        />
      </div>
      <div className="border-t p-2 text-xs text-muted-foreground text-center">
        {hasUnsavedChanges
          ? "Auto-saving..."
          : `Last saved: ${note.updatedAt.toLocaleTimeString()}`}
      </div>
    </div>
  );
}
