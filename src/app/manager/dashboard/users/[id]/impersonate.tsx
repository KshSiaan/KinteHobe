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
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import type { UserWithRole } from "better-auth/plugins";
import { LogInIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

export default function Impersonate({ data }: { data: UserWithRole }) {
  const navig = useRouter();
  async function handleImpersonate() {
    try {
      authClient.admin.impersonateUser(
        {
          userId: data.id,
        },
        {
          onError: (err: any) => {
            sileo.error({
              title: "Failed to impersonate user",
              description:
                err.error.message ?? "Failed to complete this request",
            });
          },
          onSuccess: () => {
            navig.push("/me");
          },
        },
      );
    } catch (err) {
      console.error("Failed to impersonate user", err);
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={"outline"}>
          <LogInIcon />
          Impersonate User
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be logged out of your current session and logged in as this
            user.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleImpersonate}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
