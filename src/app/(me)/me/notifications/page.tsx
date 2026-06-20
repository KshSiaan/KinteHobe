"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCheckIcon,
  PackageIcon,
  PackageCheckIcon,
  PackageXIcon,
  RotateCcwIcon,
  TruckIcon,
  BellOffIcon,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
  readAt: string | null;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const TYPE_ICON: Record<Notification["type"], React.ReactNode> = {
  order_placed: <PackageIcon className="size-5" />,
  order_status_changed: <TruckIcon className="size-5" />,
  order_cancelled: <PackageXIcon className="size-5" />,
  order_refunded: <RotateCcwIcon className="size-5" />,
  order_delivered: <PackageCheckIcon className="size-5" />,
};

const TYPE_LABEL: Record<Notification["type"], string> = {
  order_placed: "Order Placed",
  order_status_changed: "Status Changed",
  order_cancelled: "Order Cancelled",
  order_refunded: "Refunded",
  order_delivered: "Delivered",
};

const LIMIT = 10;

export default function NotificationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(Number(searchParams.get("page") || 1), 1);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPage = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/notifications?page=${p}&limit=${LIMIT}`,
        );
        if (!res.ok) return;
        const json = await res.json();
        setNotifications(json.data ?? []);
        setPagination(json.pagination ?? null);
        setUnreadCount(json.unreadCount ?? 0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

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

  const goToPage = (p: number) => {
    router.push(`/me/notifications?page=${p}`);
  };

  return (
    <section className="p-8 max-w-3xl">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-semibold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            className="gap-2"
          >
            <CheckCheckIcon className="size-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {loading ? (
          Array.from({ length: LIMIT }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-muted animate-pulse"
            />
          ))
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BellOffIcon className="size-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No notifications</p>
              <p className="text-sm text-muted-foreground">
                You&apos;re all caught up!
              </p>
            </div>
            <Button asChild>
              <Link href="/">Go Shopping</Link>
            </Button>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => !n.isRead && markOneRead(n.id)}
              className={`w-full text-left rounded-lg border px-4 py-4 flex gap-4 items-start transition-colors hover:bg-muted/50 ${
                !n.isRead
                  ? "bg-primary/5 border-primary/20"
                  : "border-border"
              }`}
            >
              <span
                className={`mt-0.5 shrink-0 ${!n.isRead ? "text-primary" : "text-muted-foreground"}`}
              >
                {TYPE_ICON[n.type]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`text-sm font-semibold ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {n.title}
                  </p>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {TYPE_LABEL[n.type]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && (
                <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
              )}
            </button>
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} &mdash;{" "}
            {pagination.total} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => goToPage(pagination.page - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.page) <= 1,
              )
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                  acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="flex items-center px-2 text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(p as number)}
                  >
                    {p}
                  </Button>
                ),
              )}
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => goToPage(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
