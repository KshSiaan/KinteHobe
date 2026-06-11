"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserMinusIcon } from "lucide-react";
import Link from "next/link";


type Friend = {
  requestId: string;
  person: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export default function Friends() {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["friends"],
    staleTime: 0,
    queryFn: async () => {
      const res = await fetch("/api/follow/friends");
      return res.json() as Promise<{ ok: boolean; data: Friend[] }>;
    },
  });

  const unfollow = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch(`/api/follow/${requestId}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: (_, requestId) => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      // also bust the status cache for that person
      const friends = queryClient.getQueryData<{ ok: boolean; data: Friend[] }>(["friends"]);
      const target = friends?.data?.find((f) => f.requestId === requestId);
      if (target) queryClient.invalidateQueries({ queryKey: ["follow-status", target.person.id] });
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
    return <p className="text-muted-foreground text-sm mt-4">Not following anyone yet.</p>;
  }

  return (
    <section className="flex flex-col gap-4 mt-4">
      {data.data.map(({ requestId, person }) => (
        <Card key={requestId}>
          <CardContent className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <Link href={"#"}>
                <Avatar className="size-14">
                  <AvatarImage src={person.image ?? undefined} />
                  <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex flex-col">
                <Link href={"#"} className="hover:underline">
                  <h2 className="font-semibold">{person.name}</h2>
                </Link>
                <p className="text-xs text-muted-foreground">{person.email}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => unfollow.mutate(requestId)}
              disabled={unfollow.isPending}
            >
              <UserMinusIcon className="size-4" /> Unfollow
            </Button>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
