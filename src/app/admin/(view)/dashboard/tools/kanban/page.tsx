"use client";

import { useState } from "react";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/kibo-ui/kanban";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type KanbanColumn = {
  id: string;
  name: string;
  color: string;
};

type KanbanOwner = {
  id: string;
  name: string;
  image: string;
};

type FeatureItem = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  column: string;
  owner: KanbanOwner;
  priority: "Low" | "Medium" | "High";
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const columns: KanbanColumn[] = [
  { id: "planned", name: "Planned", color: "#6B7280" },
  { id: "in-progress", name: "In Progress", color: "#F59E0B" },
  { id: "done", name: "Done", color: "#10B981" },
];

const users: KanbanOwner[] = [
  {
    id: "u1",
    name: "Amina Diallo",
    image: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: "u2",
    name: "Liam Carter",
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "u3",
    name: "Sofia Khan",
    image: "https://i.pravatar.cc/150?img=47",
  },
  {
    id: "u4",
    name: "Noah Bennett",
    image: "https://i.pravatar.cc/150?img=19",
  },
];

const exampleFeatures: FeatureItem[] = [
  {
    id: "feat-1",
    name: "Revamp order summary layout",
    startAt: new Date("2026-04-08"),
    endAt: new Date("2026-04-22"),
    column: "in-progress",
    owner: users[0],
    priority: "High",
  },
  {
    id: "feat-2",
    name: "Add export actions for reports",
    startAt: new Date("2026-04-10"),
    endAt: new Date("2026-04-24"),
    column: "planned",
    owner: users[1],
    priority: "Medium",
  },
  {
    id: "feat-3",
    name: "Improve kanban drag feedback",
    startAt: new Date("2026-04-11"),
    endAt: new Date("2026-04-25"),
    column: "done",
    owner: users[2],
    priority: "Low",
  },
  {
    id: "feat-4",
    name: "Wire filter bar to state",
    startAt: new Date("2026-04-12"),
    endAt: new Date("2026-04-26"),
    column: "in-progress",
    owner: users[3],
    priority: "High",
  },
  {
    id: "feat-5",
    name: "Create mobile board layout",
    startAt: new Date("2026-04-13"),
    endAt: new Date("2026-04-28"),
    column: "planned",
    owner: users[0],
    priority: "Medium",
  },
  {
    id: "feat-6",
    name: "Polish empty states and cards",
    startAt: new Date("2026-04-14"),
    endAt: new Date("2026-04-29"),
    column: "done",
    owner: users[1],
    priority: "Low",
  },
  {
    id: "feat-7",
    name: "Add keyboard drag shortcuts",
    startAt: new Date("2026-04-15"),
    endAt: new Date("2026-05-01"),
    column: "planned",
    owner: users[2],
    priority: "High",
  },
  {
    id: "feat-8",
    name: "Review board accessibility",
    startAt: new Date("2026-04-16"),
    endAt: new Date("2026-05-02"),
    column: "in-progress",
    owner: users[3],
    priority: "Medium",
  },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const priorityVariant = {
  Low: "secondary",
  Medium: "warning",
  High: "destructive",
} as const;

export default function Page() {
  const [features, setFeatures] = useState(exampleFeatures);

  const counts = columns.map((column) => ({
    ...column,
    count: features.filter((feature) => feature.column === column.id).length,
  }));

  return (
    <div className="flex flex-col gap-6 p-6 bg-background flex-1">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
        <p className="text-muted-foreground">
          Drag cards between columns to update work status. The board uses dummy
          data for now, but the drag and drop flow is fully working.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {counts.map((column) => (
          <Card key={column.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <CardTitle className="text-sm font-medium">
                  {column.name}
                </CardTitle>
              </div>
              <Badge variant="secondary">{column.count}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Items currently in this lane.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <KanbanProvider
        columns={columns}
        data={features}
        onDataChange={setFeatures}
      >
        {(column) => (
          <KanbanBoard id={column.id} key={column.id} className="bg-secondary">
            <KanbanHeader>
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <span>{column.name}</span>
              </div>
            </KanbanHeader>
            <KanbanCards id={column.id}>
              {(feature: FeatureItem) => (
                <KanbanCard
                  column={column.id}
                  id={feature.id}
                  key={feature.id}
                  name={feature.name}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="m-0 truncate font-medium text-sm">
                        {feature.name}
                      </p>
                      <p className="m-0 text-muted-foreground text-xs">
                        {shortDateFormatter.format(feature.startAt)} -{" "}
                        {dateFormatter.format(feature.endAt)}
                      </p>
                    </div>
                    <Avatar className="size-7 shrink-0">
                      <AvatarImage
                        src={feature.owner.image}
                        alt={feature.owner.name}
                      />
                      <AvatarFallback>
                        {feature.owner.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={priorityVariant[feature.priority]}>
                      {capitalize(feature.priority)}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {feature.owner.name}
                    </span>
                  </div>
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>
    </div>
  );
}
