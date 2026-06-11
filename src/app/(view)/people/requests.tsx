"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, XIcon } from "lucide-react";
import Link from "next/link";


type PendingRequest = {
  id: string;
  status: string;
  createdAt: string;
  follower: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export default function Requests() {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["follow-pending"],
    staleTime: 0,
    queryFn: async () => {
      const res = await fetch("/api/follow/pending");
      return res.json() as Promise<{ ok: boolean; data: PendingRequest[] }>;
    },
  });

  const respond = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "accept" | "reject" }) => {
      const res = await fetch(`/api/follow/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-pending"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  if (isPending) {
    return (
      <div className="flex flex-col gap-4 mt-4">
        <Skeleton className="w-full h-18" />
        <Skeleton className="w-full h-18" />
        <Skeleton className="w-full h-18" />
      </div>
    );
  }

  if (!data?.data?.length) {
    return <p className="text-muted-foreground text-sm mt-4">No pending requests.</p>;
  }

  return (
    <section className="flex flex-col gap-4 mt-4">
      {data.data.map(({ id, follower }) => (
        <Card key={id}>
          <CardContent className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <Link href={"#"}>
                <Avatar className="size-14">
                  <AvatarImage src={follower.image ?? undefined} />
                  <AvatarFallback>{follower.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex flex-col">
                <Link href={"#"} className="hover:underline">
                  <h2 className="font-semibold">{follower.name}</h2>
                </Link>
                <p className="text-xs text-muted-foreground">{follower.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => respond.mutate({ id, action: "accept" })}
                disabled={respond.isPending}
              >
                <CheckIcon className="size-4" /> Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => respond.mutate({ id, action: "reject" })}
                disabled={respond.isPending}
              >
                <XIcon className="size-4" /> Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
