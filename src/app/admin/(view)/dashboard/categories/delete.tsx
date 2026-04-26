"use client";
import { CategoryType } from "@/types/schemas";
import React from "react";
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
import { Trash2Icon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { howl } from "@/lib/utils";
import { sileo } from "sileo";
import { useRouter } from "next/navigation";
export default function Delete({ data }: { data: CategoryType[number] }) {
  const navig = useRouter();
  const [open, setOpen] = React.useState(false);
  const { mutate, isPending } = useMutation({
    mutationKey: ["delete_category"],
    mutationFn: () => {
      return howl(`/api/admin/category/${data.id}`, {
        method: "DELETE",
      });
    },
    onError: (err) => {
      sileo.error({
        title: "Failed to delete category",
        description: err.message ?? "Failed to complete this request",
      });
    },
    onSuccess: (res: any) => {
      sileo.success({
        title: "Category deleted",
        description: res.message ?? "Category deleted successfully",
      });
      navig.refresh();
      setOpen(false);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        onClick={() => {
          setOpen(true);
        }}
        asChild
      >
        <Button
          size="sm"
          variant="ghost"
          title="Delete category"
          className="h-8 w-8 p-0 text-red-600"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            category{" "}
            <span className="font-semibold text-destructive">
              "{data.name}"
            </span>{" "}
            and all associated data. Please proceed with caution.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              mutate();
            }}
            variant={"destructive"}
          >
            {isPending ? "Deleting..." : "Yes, delete category"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
