"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { sileo } from "sileo";
import { useRouter } from "next/navigation";

export default function ChangeRole({ data }: { data: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navig = useRouter();
  function changeRole(role: "user" | "admin" | "manager") {
    setIsLoading(true);

    authClient.admin.setRole(
      {
        userId: data.id,
        role,
      },
      {
        onError(context) {
          setIsLoading(false);
          console.error("Failed to change role:", context.error);
        },
        onSuccess(context) {
          setIsLoading(false);

          sileo.success({
            title: "Role Updated",
            description: `User role has been changed to ${context.data.role}.`,
          });
          navig.refresh();
          setOpen(false); // 👈 close dialog
        },
      },
    );
  }

  const nextRole = data.role === "user" ? "manager" : "user";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Change Role</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role of {data.name}</DialogTitle>
          <DialogDescription>
            Changing user role affects permissions and access.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button disabled={isLoading} onClick={() => changeRole(nextRole)}>
            {isLoading
              ? "Updating..."
              : data.role === "user"
                ? "Change to Manager"
                : "Change to User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
