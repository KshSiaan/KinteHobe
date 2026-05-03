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
export default function Write() {
  const [rating, setRating] = useState(4);
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
        <Textarea placeholder="Type here.." />
      </CardContent>
      <CardFooter className="flex justify-end items-center">
        <Button size={"lg"}>
          Submit Review <SendIcon />
        </Button>
      </CardFooter>
    </Card>
  );
}
