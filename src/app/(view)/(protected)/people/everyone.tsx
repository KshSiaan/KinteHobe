"use client";
import FollowButton from "@/components/core/extra/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, ClockIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

type User = {
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
  id: string;
};

export default function Everyone() {
  const { data, isPending } = useQuery({
    queryKey: ["everyone"],
    queryFn: async () => {
      const response = await fetch("/api/people");
      return response.json() as Promise<{
        ok: boolean;
        data: {
          users: User[];
          total: number;
          limit: number;
        };
      }>;
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

  return (
    <section className="flex flex-col gap-4 mt-4">
      {data?.data?.users?.map((user) => (
        <Card key={user.id}>
          <CardContent className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/user/${user.id}`}
                className="flex items-center gap-4"
              >
                <Avatar className="size-14">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex flex-col">
                <Link href={`/user/${user.id}`} className="hover:underline">
                  <h2 className="font-semibold">{user.name}</h2>
                </Link>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="space-x-2">
              <FollowButton userId={user.id} />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
