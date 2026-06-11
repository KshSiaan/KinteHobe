"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, ClockIcon, PlusIcon } from "lucide-react";

export type FollowStatus = "none" | "pending" | "accepted" | "rejected";

export default function FollowButton({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const { data: statusData, isPending: statusLoading } = useQuery({
    queryKey: ["follow-status", userId],
    staleTime: 0,
    queryFn: async () => {
      const res = await fetch(`/api/follow/status/${userId}`);
      return res.json() as Promise<{
        ok: boolean;
        data: { status: FollowStatus; requestId: string | null };
      }>;
    },
  });

  const status = statusData?.data?.status ?? "none";
  const requestId = statusData?.data?.requestId ?? null;

  const sendRequest = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
      });
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["follow-status", userId] }),
  });

  const cancelRequest = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/follow/${requestId}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["follow-status", userId] }),
  });

  if (statusLoading) return <Skeleton className="w-24 h-8" />;

  if (status === "accepted") {
    return (
      <Button
        variant="outline"
        onClick={() => cancelRequest.mutate()}
        disabled={cancelRequest.isPending}
      >
        <CheckIcon className="size-4" /> Following
      </Button>
    );
  }

  if (status === "pending") {
    return (
      <Button
        variant="outline"
        onClick={() => cancelRequest.mutate()}
        disabled={cancelRequest.isPending}
      >
        <ClockIcon className="size-4" /> Requested
      </Button>
    );
  }

  return (
    <Button
      onClick={() => sendRequest.mutate()}
      disabled={sendRequest.isPending}
    >
      <PlusIcon className="size-4" /> Follow
    </Button>
  );
}
