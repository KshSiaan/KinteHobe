import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import React, { Suspense } from "react";
import DeleteAccount from "./delete-account";

export default async function Restricted() {
  const header = await headers();
  const user = await auth.api.getSession({
    headers: header,
  });
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Delete account</CardTitle>
          <CardDescription className="text-destructive">
            Once you delete your account, there is no going back. Please be
            certain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">Delete account</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-destructive">
                    Are you absolutely sure?
                  </DialogTitle>
                  <DialogDescription>
                    If you want to delete your account, type "
                    {user?.user?.name.trim().toLowerCase()}" to confirm. This
                    action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <Suspense fallback={<div>Loading...</div>}>
                  <DeleteAccount name={user?.user?.name.trim().toLowerCase()} />
                </Suspense>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
