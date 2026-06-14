"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { Suspense } from "react";
import Write from "./write";

export default function RatingReviews() {
  // const

  const ratingData = [
    { stars: 5, count: 90, total: 100 },
    { stars: 4, count: 5, total: 100 },
    { stars: 3, count: 0, total: 100 },
    { stars: 2, count: 5, total: 100 },
    { stars: 1, count: 0, total: 100 },
  ];

  const averageRating = 4.5;
  const totalReviews = 120;

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
                  {averageRating}
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
                {ratingData.map(({ stars, count, total }) => (
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
                      <Progress value={count} className="h-2" />
                    </div>

                    {/* Count */}
                    <div className="text-sm font-medium text-foreground min-w-fit">
                      {count}%
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
                      96%
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
            {[
              {
                author: "Sarah Mitchell",
                rating: 5,
                date: "2 weeks ago",
                title: "Absolutely Perfect!",
                text: "The quality exceeded my expectations. Fast shipping and excellent customer service. Highly recommend!",
              },
              {
                author: "James Chen",
                rating: 5,
                date: "1 month ago",
                title: "Worth Every Penny",
                text: "Premium product at a fair price. The attention to detail is remarkable. This will be my go-to brand going forward.",
              },
              {
                author: "Emma Rodriguez",
                rating: 4,
                date: "1 month ago",
                title: "Great Quality, Highly Satisfied",
                text: "Very pleased with my purchase. Only minor issue was packaging could have been more eco-friendly, but overall fantastic.",
              },
            ].map((review, idx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <Card key={idx} className="shadow-sm border-border/40">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {review.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star
                              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                              key={i}
                              size={14}
                              className="fill-primary text-primary"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-3">{review.text}</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    By {review.author}
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
          <Write />
        </Suspense>
      </div>
    </main>
  );
}
