"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Variants from "./variants";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCheck, Trash2 } from "lucide-react";
import Appearance from "./appearance";
import PromotionBanner from "@/components/core/extra/promotion-banner";
import { useMutation } from "@tanstack/react-query";
import { howl } from "@/lib/utils";
import { sileo } from "sileo";
import { Spinner } from "@/components/kibo-ui/spinner";
import { useRouter } from "next/navigation";
export default function Add() {
  const [selectedVariant, setSelectedVariant] = React.useState("primary");
  const [selectedAppearance, setSelectedAppearance] = React.useState("a");
  const [promotionTitle, setPromotionTitle] = React.useState("");
  const [promotionUrl, setPromotionUrl] = React.useState("");
  const navig = useRouter();

  const { mutate, isPending } = useMutation({
    mutationKey: ["add_promotion"],
    mutationFn: () => {
      return howl(`/api/admin/promotion`, {
        method: "POST",
        body: {
          variant: selectedVariant,
          appearance: selectedAppearance,
          title: promotionTitle,
          url: promotionUrl,
        },
      });
    },
    onError: (err) => {
      sileo.error({
        title: "Failed to complete this request",
        description:
          err.message ?? "An error occurred while completing this request.",
      });
    },
    onSuccess: (res: any) => {
      sileo.success(res.message ?? "Success!");
      setPromotionTitle("");
      setPromotionUrl("");
      setSelectedVariant("primary");
      setSelectedAppearance("a");
      navig.refresh();
    },
  });
  return (
    <section className="w-full  space-y-6">
      <PromotionBanner
        selectedVariant={selectedVariant}
        selectedAppearance={selectedAppearance}
        promotionTitle={promotionTitle}
        promotionUrl={promotionUrl}
      />
      <div className="px-6">
        <Card>
          {/* <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader> */}
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promotion-title">Promotion Title</Label>
              <Input
                id="promotion-title"
                type="text"
                placeholder="eg. Summer Sale"
                value={promotionTitle}
                onChange={(e) => setPromotionTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promotion-url">
                Product URL (e.g. https://www.example.com/product/k23j4)
              </Label>
              <CardDescription>
                This is the URL that will be used to track the promotion. It
                should be a valid URL that points to a landing page for the
                promotion.
              </CardDescription>
              <Input
                id="promotion-url"
                type="url"
                placeholder="https://www.example.com/product/k23j4"
                value={promotionUrl}
                onChange={(e) => setPromotionUrl(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      {selectedAppearance !== "c" && (
        <div className="px-6 space-y-2">
          <h4 className="text-sm font-medium">Select Color Variant</h4>
          <Variants
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
          />
        </div>
      )}
      <div className="px-6 space-y-2">
        <h4 className="text-sm font-medium">Select Appearance</h4>
        <Appearance
          selectedVariant={selectedAppearance}
          setSelectedVariant={setSelectedAppearance}
        />
      </div>
      <div className="flex justify-between items-center px-6">
        <div className=""></div>
        <div className="space-x-2">
          <Button disabled={isPending} onClick={() => mutate()}>
            {isPending ? (
              <>
                <Spinner variant="ring" /> Processing...
              </>
            ) : (
              <>
                <CheckCheck /> Confirm Promotion
              </>
            )}
          </Button>
          <Button variant="destructive" disabled={isPending}>
            <Trash2 /> Discard Promotion
          </Button>
        </div>
      </div>
    </section>
  );
}
