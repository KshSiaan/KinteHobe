"use client";
import { Button } from "@/components/ui/button";
import { Eye, GalleryVerticalEndIcon, MailIcon, PhoneIcon } from "lucide-react";
import type { FraudDataset } from "./page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { howl } from "@/lib/utils";
import { sileo } from "sileo";

export default function FraudAction({ txn }: { txn: FraudDataset }) {
  const qcl = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["updateFraudReportState"],
    mutationFn: (status: "reviewed" | "resolved" | "rejected") => {
      return howl(`/api/admin/fraud/${txn.id}`, {
        method: "PATCH",
        body: { status },
      });
    },
    onError: (err) => {
      sileo.error({
        title: "Error Updating Fraud Report",
        description: err.message ?? "Failed to complete this request",
      });
    },
    onSuccess: (res: any) => {
      sileo.success({
        title: "Fraud Report Updated",
        description: `Fraud report status updated to ${res.status}`,
      });
      qcl.invalidateQueries({ queryKey: ["fraud"] });
    },
  });

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fraud Report Details</DialogTitle>
          </DialogHeader>
          <div className=" grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center">
              <Avatar size="lg" className="size-18!">
                <AvatarImage src={txn.user?.image ?? "/placeholder-user.jpg"} />
                <AvatarFallback>
                  {txn.user?.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-nowrap col-span-2 text-xs text-muted-foreground">
              <h4 className="text-sm font-medium">{txn.user?.name}</h4>
              <p className="flex items-center gap-1">
                <MailIcon size={12} /> {txn.user?.email}
              </p>
              <p className="flex items-center gap-1">
                <PhoneIcon size={12} /> {txn.order.shippingPhone}
              </p>
              <p className="">
                Joined: {new Date(txn.user?.createdAt).toDateString() ?? "N/A"}
              </p>
            </div>
          </div>
          <div className="border-t pt-4">
            <Tabs defaultValue="order" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="order" className="w-full">
                  Order Details
                </TabsTrigger>
                <TabsTrigger value="transaction" className="w-full">
                  Transaction Details
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="order"
                className="mt-4 max-h-[60dvh] overflow-y-auto"
              >
                <Table>
                  <TableBody>
                    {Object.entries(txn.order).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="capitalize">{key}</TableCell>
                        <TableCell>{value ? String(value) : "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent
                value="transaction"
                className="mt-4 max-h-[60dvh] overflow-y-auto"
              >
                <Table>
                  <TableBody>
                    {Object.entries(txn.transaction).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="capitalize">{key}</TableCell>
                        <TableCell>{value ? String(value) : "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      {["pending", "reviewed"].includes(txn.current_status) && (
        <DropdownMenu>
          <DropdownMenuTrigger disabled={isPending} asChild>
            <Button
              disabled={isPending}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-yellow-600"
            >
              <GalleryVerticalEndIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => mutate("reviewed")}>
              Reviewing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => mutate("resolved")}>
              Resolved
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => mutate("rejected")}
            >
              Rejected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}
