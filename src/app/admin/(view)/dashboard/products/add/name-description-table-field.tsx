"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CirclePlusIcon,
  ClipboardPasteIcon,
  Rows3Icon,
  Trash2Icon,
} from "lucide-react";

export type NameDescriptionRow = {
  id: string;
  name: string;
  description: string;
};

type NameDescriptionTableFieldProps = {
  title: string;
  subtitle?: string;
  value: NameDescriptionRow[];
  onChange: (rows: NameDescriptionRow[]) => void;
  adaptFromBaseRows?: NameDescriptionRow[];
  addLabel?: string;
  namePlaceholder?: string;
  descriptionPlaceholder?: string;
};

function createRow(): NameDescriptionRow {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return {
    id,
    name: "",
    description: "",
  };
}

function cloneRows(rows: NameDescriptionRow[]) {
  return rows.map((row) => ({
    ...row,
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
  }));
}

export function NameDescriptionTableField({
  title,
  subtitle,
  value,
  onChange,
  adaptFromBaseRows,
  addLabel = "Add row",
  namePlaceholder = "Name",
  descriptionPlaceholder = "Description",
}: NameDescriptionTableFieldProps) {
  function updateRow(id: string, key: "name" | "description", next: string) {
    onChange(
      value.map((row) => (row.id === id ? { ...row, [key]: next } : row)),
    );
  }

  function addRow() {
    onChange([...value, createRow()]);
  }

  function removeRow(id: string) {
    onChange(value.filter((row) => row.id !== id));
  }

  function adaptFromBaseVariant() {
    if (!adaptFromBaseRows || adaptFromBaseRows.length === 0) return;

    onChange(cloneRows(adaptFromBaseRows));
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-2">
          <div className="rounded-md border bg-background p-1.5">
            <Rows3Icon />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-sm">{title}</p>
            {subtitle ? (
              <p className="text-muted-foreground text-xs">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {adaptFromBaseRows && adaptFromBaseRows.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={adaptFromBaseVariant}
            >
              <ClipboardPasteIcon /> Adapt from base variant
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <CirclePlusIcon data-icon="inline-start" />
            {addLabel}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-18 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {value.length === 0 ? (
            <TableRow>
              <TableCell className="text-muted-foreground" colSpan={3}>
                No rows added yet.
              </TableCell>
            </TableRow>
          ) : (
            value.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Input
                    placeholder={namePlaceholder}
                    value={row.name}
                    onChange={(event) =>
                      updateRow(row.id, "name", event.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder={descriptionPlaceholder}
                    value={row.description}
                    onChange={(event) =>
                      updateRow(row.id, "description", event.target.value)
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => removeRow(row.id)}
                  >
                    <Trash2Icon />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
