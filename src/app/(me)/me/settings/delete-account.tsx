"use client";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React from "react";
import { sileo } from "sileo";

export default function DeleteAccount({ name }: { name?: string }) {
  const [inputValue, setInputValue] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const navig = useRouter();
  async function handleDelete() {
    setIsLoading(true);
    if (inputValue === name) {
      const res = await authClient.deleteUser(
        {
          password,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            setIsLoading(false);
            navig.push("/");
          },
        },
      );
      if (res.data?.success) {
        sileo.success({
          title: "Account deleted",
          description:
            "We're sorry to see you go. Your account has been successfully deleted.",
        });
        setIsLoading(false);
      } else {
        sileo.error({
          title: "Error deleting account",
          description:
            "There was an error deleting your account. Please try again later.",
        });
        setIsLoading(false);
      }
    } else {
      sileo.error({
        title: "Text mismatch",
        description:
          "The text you entered does not match your username. Please try again.",
      });
      setIsLoading(false);
    }
    setIsLoading(false);
  }

  return (
    <>
      <div className="space-y-2">
        <Label>Username</Label>
        <Input
          placeholder="Type here.."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Label>Current Password</Label>
        <Input
          placeholder="Type here.."
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Go back</Button>
        </DialogClose>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? "Deleting..." : "Delete account"}
        </Button>
      </DialogFooter>
    </>
  );
}
