"use client";
import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { BanIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { useRouter } from "next/navigation";
export default function Ban({ id, banned }: { id: string; banned: boolean }) {
  const navig = useRouter();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [days, setDays] = React.useState("7");
  const [permanent, setPermanent] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  async function handleBanUser() {
    setIsPending(true);

    try {
      const banExpiresIn = permanent
        ? undefined
        : Number.parseInt(days, 10) * 24 * 60 * 60;

      await authClient.admin.banUser({
        userId: id,
        banReason: reason || undefined,
        banExpiresIn:
          typeof banExpiresIn === "number" &&
          Number.isFinite(banExpiresIn) &&
          banExpiresIn > 0
            ? banExpiresIn
            : undefined,
      });

      setOpen(false);
      setReason("");
      setDays("7");
      setPermanent(false);
    } finally {
      setIsPending(false);
      navig.refresh();
    }
  }
  async function handleUnbanUser() {
    setIsPending(true);
    try {
      await authClient.admin.unbanUser({
        userId: id,
      });
    } finally {
      setIsPending(false);
      navig.refresh();
    }
  }
  return !banned ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"destructive"}>
          <BanIcon /> Ban User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Banning this user will prevent them from logging in and accessing
            their account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="permanent-ban"
              checked={permanent}
              onCheckedChange={(checked) => setPermanent(checked === true)}
            />
            <Label htmlFor="permanent-ban">Permanent ban</Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ban-expires-in">Ban duration</Label>
            <Select value={days} onValueChange={setDays} disabled={permanent}>
              <SelectTrigger id="ban-expires-in" className="w-full">
                <SelectValue placeholder="Select ban duration" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="45">45 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ban-reason">Reason for ban (optional)</Label>
            <Textarea
              id="ban-reason"
              placeholder="Enter reason for ban"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleBanUser}
            disabled={isPending}
          >
            {isPending ? "Banning..." : "Ban User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={"outline"}>
          <BanIcon /> Unban User
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unban User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to unban this user?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleUnbanUser();
            }}
          >
            Unban User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
