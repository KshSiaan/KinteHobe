"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Star, Trash2Icon } from "lucide-react";
import { Suspense } from "react";
import Write from "./write";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/kibo-ui/spinner";
import { howl } from "@/lib/utils";
import { sileo } from "sileo";

export default function RatingReviews() {
  const slug = useParams().slug;
  const session = authClient.useSession();
  const { data, isPending, refetch } = useQuery({
    queryKey: ["reviews"],
    queryFn: async (): Promise<{
      message: string;
      data: Array<{
        review: {
          id: string;
          productId: string;
          authorId: string;
          ratingFloat: number;
          reviewText: string;
          createdAt: string;
        };
        user: {
          id: string;
          name: string;
          email: string;
          emailVerified: boolean;
          image: string;
          createdAt: string;
          updatedAt: string;
          role: string;
          banned: boolean;
          banReason: string;
          banExpires?: Date;
        };
      }>;
    }> => {
      const res = await fetch(`/api/review/${slug}`);
      return res.json();
    },
  });

  const { mutate, isPending: isDeleting } = useMutation({
    mutationKey: ["delete_rating"],
    mutationFn: (id: string): Promise<{ message?: string }> => {
      return howl(`/api/review/${id}`, {
        method: "DELETE",
      });
    },
    onError: (err) => {
      sileo.error({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
      });
    },
    onSuccess: (res) => {
      refetch();
      sileo.success({
        title: "Success",
        description: res.message ?? "Review deleted successfully",
      });
    },
  });
  const reviews = data?.data ?? [];
  const ratingData = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter(
      (r) => Math.floor(r.review.ratingFloat) === stars,
    ).length;

    return {
      stars,
      count,
      total: reviews.length || 1,
      percent: (count / (reviews.length || 1)) * 100,
    };
  });

  const averageRating =
    (data?.data?.reduce((acc, curr) => acc + curr.review.ratingFloat, 0) ?? 0) /
    (data?.data?.length || 1);
  const totalReviews = data?.data?.length || 0;

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-[40dvh] w-full">
        <Spinner variant={"bars"} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background ">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-lg font-bold text-foreground mb-2">
            Customer Reviews
          </h1>
          <p className="text-sm text-muted-foreground">
            Trusted by {totalReviews.toLocaleString()} verified customers
          </p>
        </div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overall Rating Card */}
          <Card className="lg:col-span-1 shadow-sm border-border/40">
            <CardContent className="flex flex-col items-center justify-center text-center h-full w-full">
              <div className="relative">
                <div className="text-6xl font-bold text-primary">
                  {averageRating.toFixed(1)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">out of 5</p>
              </div>

              {/* Star Display */}
              <div className="flex gap-1 mb-6 justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    key={i}
                    size={24}
                    className={`transition-colors ${
                      i < Math.floor(averageRating)
                        ? "fill-primary text-primary"
                        : i < averageRating
                          ? "fill-primary/50 text-primary/50"
                          : "fill-muted text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Based on {totalReviews} reviews
              </p>
            </CardContent>
          </Card>

          {/* Rating Breakdown Card */}
          <Card className="lg:col-span-2 shadow-sm border-border/40">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-lg text-foreground">
                Rating Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {ratingData.map(({ stars, percent }) => (
                  <div key={stars} className="flex items-center gap-4">
                    {/* Stars */}
                    <div className="flex items-center gap-1 min-w-fit">
                      {Array.from({ length: stars }).map((_, i) => (
                        <Star
                          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                          key={i}
                          size={16}
                          className="fill-primary text-primary"
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2 font-medium">
                        {stars}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1">
                      <Progress value={percent} className="h-2" />
                    </div>

                    {/* Count */}
                    <div className="text-sm font-medium text-foreground min-w-fit">
                      {Math.round(percent)}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats Footer */}
              <div className="mt-8 pt-6 border-t border-border/40">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Recommended
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {Math.floor(
                        (reviews.filter((r) => r.review.ratingFloat >= 2)
                          .length /
                          (reviews.length || 1)) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Verified Buyers
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      100%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Recent Reviews
          </h2>

          <div className="grid gap-6">
            {data?.data?.map((review, idx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <Card key={idx} className="shadow-sm border-border/40 relative">
                {session?.data?.user?.role === "admin" && (
                  <Button
                    className="absolute top-4 right-4"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => mutate(review.review.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Spinner size="sm" />
                    ) : (
                      <Trash2Icon className="text-destructive" />
                    )}
                  </Button>
                )}
                <CardContent>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const fill = Math.min(
                              Math.max(review.review.ratingFloat - i, 0),
                              1,
                            );

                            return (
                              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                              <div key={i} className="relative">
                                {/* empty star */}
                                <Star
                                  size={14}
                                  className="text-muted-foreground/30 opacity-30"
                                />

                                {/* filled star */}
                                <div
                                  className="absolute top-0 left-0 overflow-hidden"
                                  style={{ width: `${fill * 100}%` }}
                                >
                                  <Star
                                    size={14}
                                    className="fill-primary text-primary"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.review.createdAt).toDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-3">
                    {review.review.reviewText}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    By{" "}
                    <Link
                      href={`/user/${review.user.id}`}
                      className="text-primary hover:underline"
                    >
                      {review.user.name}
                    </Link>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Separator className="my-6" />
      <div className="">
        <Suspense fallback={<div>Loading review form...</div>}>
          <Write
            published={reviews.some(
              (r) => r.user.id === session?.data?.session.userId,
            )}
          />
        </Suspense>
      </div>
    </main>
  );
}
