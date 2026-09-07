import React from "react";
import { Trash2Icon } from "@animateicons/react/lucide";
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
import { useMutation } from "@tanstack/react-query";
import { sileo } from "sileo";
import { howl } from "@/lib/utils";
export default function Delete({
  id,
  refetch,
}: {
  id: string;
  refetch: () => void;
}) {
  const { mutate, isPending } = useMutation({
    mutationKey: ["delete_product", id],
    mutationFn: () => {
      return howl(`/api/manage/product/${id}`, {
        method: "DELETE",
      });
    },
    onError: (err) => {
      sileo.error({
        title: "Error Deleting Product",
        description: (err as any)?.message ?? "An error occurred.",
      });
    },
    onSuccess: (res: any) => {
      sileo.success({
        title: "Product Deleted",
        description: res.message ?? "Success!",
      });
      refetch();
    },
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon-lg" className="text-destructive!">
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product and all of its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              mutate();
            }}
            variant="destructive"
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
