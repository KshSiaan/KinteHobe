"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { howl } from "@/lib/utils";
import { Trash2Icon } from "@animateicons/react/lucide";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { sileo } from "sileo";

export default function DeletePromotionButton({
  promotionId,
}: {
  promotionId: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const navig = useRouter();
  const { mutate, isPending } = useMutation({
    mutationKey: ["delete_promotion"],
    mutationFn: () => {
      return howl(`/api/admin/promotion/${promotionId}`, {
        method: "DELETE",
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
      navig.refresh();
    },
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            promotion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={() => mutate()}
          >
            <Trash2Icon />
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
