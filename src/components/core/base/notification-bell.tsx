"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BellIcon,
  CheckCheckIcon,
  PackageIcon,
  PackageCheckIcon,
  PackageXIcon,
  RotateCcwIcon,
  TruckIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

type Notification = {
  id: string;
  type:
    | "order_placed"
    | "order_status_changed"
    | "order_cancelled"
    | "order_refunded"
    | "order_delivered";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

const TYPE_ICON: Record<Notification["type"], React.ReactNode> = {
  order_placed: <PackageIcon className="size-4" />,
  order_status_changed: <TruckIcon className="size-4" />,
  order_cancelled: <PackageXIcon className="size-4" />,
  order_refunded: <RotateCcwIcon className="size-4" />,
  order_delivered: <PackageCheckIcon className="size-4" />,
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=5&page=1");
      if (!res.ok) return;
      const json = await res.json();
      setNotifications(json.data ?? []);
      setUnreadCount(json.unreadCount ?? 0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markOneRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) fetchNotifications();
      }}
    >
      <PopoverTrigger asChild>
        <Button variant={"ghost"} size={"icon-sm"} className="relative">
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-background!">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <PopoverHeader className="flex! flex-row justify-between items-center px-4 py-3">
          <PopoverTitle>Notifications</PopoverTitle>
          {unreadCount > 0 && (
            <Button
              size={"icon-sm"}
              variant={"ghost"}
              onClick={markAllRead}
              title="Mark all as read"
            >
              <CheckCheckIcon />
            </Button>
          )}
        </PopoverHeader>
        <div className="max-h-80 overflow-y-auto divide-y">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No notifications
            </p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.isRead && markOneRead(n.id)}
                className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                  !n.isRead ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex gap-3 items-start">
                  <span className="mt-0.5 shrink-0 text-muted-foreground">
                    {TYPE_ICON[n.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium line-clamp-1 ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
        <div className="border-t p-2">
          <Button variant={"secondary"} size={"sm"} className="w-full" asChild>
            <Link href="/me/notifications" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
