"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "lucide-react";
import StarRating_Fractions from "@/components/commerce-ui/star-rating-fractions";
import { useMutation } from "@tanstack/react-query";
import { howl } from "@/lib/utils";
import { sileo } from "sileo";
import { Spinner } from "@/components/kibo-ui/spinner";
import { useParams, useRouter } from "next/navigation";
export default function Write({ published }: { published: boolean }) {
  const { slug } = useParams();
  const navig = useRouter();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const { mutate, isPending } = useMutation({
    mutationKey: ["post-review"],
    mutationFn: () => {
      return howl("/api/review", {
        method: "POST",
        body: {
          ratingFloat: rating,
          reviewText: review,
          productSlug: slug,
        },
      });
    },
    onError: (err) => {
      sileo.error({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
      });
      if (err.message === "Unauthorized") {
        navig.push("/auth/login");
      }
    },
    onSuccess: (res: any) => {
      sileo.success({
        title: "Success",
        description: res.message ?? "Review submitted successfully",
      });
    },
  });
  if (published) {
    return (
      <Card className="border-primary/20 bg-primary/5 border-2">
        <CardHeader>
          <CardTitle className="text-lg">Thanks for your review ✨</CardTitle>
        </CardHeader>

        <CardContent className="text-sm text-muted-foreground">
          You’ve already reviewed this product. Your feedback helps others
          decide.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Drop a Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex flex-col justify-center items-center">
          <StarRating_Fractions
            value={rating}
            onChange={setRating}
            color="#7033ff"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {rating.toFixed(1)} out of 5
          </p>
        </div>
        <Textarea
          placeholder="Type your review here.."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
      </CardContent>
      <CardFooter className="flex justify-end items-center">
        <Button
          size={"lg"}
          onClick={() => {
            mutate();
          }}
          disabled={rating === 0 || review.trim() === "" || isPending}
        >
          {isPending ? (
            <>
              <Spinner /> Submitting
            </>
          ) : (
            <>
              Submit Review <SendIcon />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
