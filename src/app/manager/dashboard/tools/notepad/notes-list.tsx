"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Note } from "@/types/notes";
import { FileText, Plus, Trash2 } from "lucide-react";

interface NoteListProps {
  notes: Note[];
  currentNote: Note | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
}

export function NoteList({
  notes,
  currentNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
}: NoteListProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-80 border-l bg-muted/20">
      <div className="p-4 border-b">
        <Button onClick={onCreateNote} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-2">
          {notes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notes yet</p>
              <p className="text-sm">Create your first note!</p>
            </div>
          ) : (
            notes.map((note) => (
              <Card
                key={note.id}
                className={`mb-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                  currentNote?.id === note.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => onSelectNote(note)}
              >
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {note.title || "Untitled Note"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {note.content || "No content"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(note.updatedAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 ml-2 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
